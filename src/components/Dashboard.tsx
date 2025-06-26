import React, { useState, useEffect } from 'react';
import { BookOpen, Monitor, FileText, ClipboardCheck, Plus, TrendingUp, Calendar, Users, ChevronRight, Activity, Zap, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { materialService, GeneratedMaterial } from '@/services/materialService';
import { statsService } from '@/services/statsService';
import { usePlanPermissions } from '@/hooks/usePlanPermissions';
import { useUpgradeModal } from '@/hooks/useUpgradeModal';
import UpgradeModal from './UpgradeModal';
import { planPermissionsService } from '@/services/planPermissionsService';
import { useToast } from '@/hooks/use-toast';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [materials, setMaterials] = useState<GeneratedMaterial[]>([]);
  const { permissions, usagePercentage, remainingMaterials, isAtLimit } = usePlanPermissions();
  const { isOpen: upgradeModalOpen, reason: upgradeReason, checkAndShowUpgradeModal, closeModal } = useUpgradeModal();
  const { toast } = useToast();

  useEffect(() => {
    const allMaterials = materialService.getMaterials();
    setMaterials(allMaterials);
  }, []);

  const handleCreateMaterial = () => {
    if (checkAndShowUpgradeModal('create')) {
      onNavigate('create');
    }
  };

  const handlePlanUpgrade = (planId: string) => {
    planPermissionsService.setCurrentPlan(planId);
    closeModal();
    toast({
      title: "Plano atualizado!",
      description: `Seu plano foi alterado para ${planId === 'professor' ? 'Professor' : 'Grupo Escolar'}`,
    });
    window.location.reload();
  };

  const stats = statsService.getStats();

  const getTypeConfig = (type: string) => {
    const configs = {
      'plano-de-aula': {
        icon: BookOpen,
        label: 'Planos de Aula',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      },
      'slides': {
        icon: Monitor,
        label: 'Slides',
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200'
      },
      'atividade': {
        icon: FileText,
        label: 'Atividades',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      },
      'avaliacao': {
        icon: ClipboardCheck,
        label: 'Avaliações',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200'
      }
    };
    return configs[type as keyof typeof configs] || configs['atividade'];
  };

  const recentMaterials = materials.slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header com informações do plano */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Olá! Bem-vindo de volta 👋
            </h1>
            <p className="text-gray-600 text-lg">
              Vamos criar conteúdos pedagógicos incríveis hoje?
            </p>
          </div>
          
          {/* Plan Info Badge */}
          <div className="flex items-center space-x-4">
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-2">
                <Crown className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">
                  Plano {permissions.planName}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {remainingMaterials} restantes
                </Badge>
              </div>
            </div>
            <Button 
              onClick={handleCreateMaterial}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-5 h-5 mr-2" />
              Criar Material
            </Button>
          </div>
        </div>

        {/* Usage Progress Card */}
        {isAtLimit && (
          <Card className="mb-6 bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Limite mensal atingido!</h3>
                    <p className="text-sm text-gray-600">
                      Você utilizou todos os {permissions.limits.materialsPerMonth} materiais do seu plano este mês
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => checkAndShowUpgradeModal('create')}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                >
                  Fazer Upgrade
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Usage Card */}
          <Card className="lg:col-span-1 bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-blue-600" />
                Uso Mensal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-gray-800">
                    {permissions.usage.materialsThisMonth}
                  </span>
                  <span className="text-sm text-gray-500">
                    de {permissions.limits.materialsPerMonth}
                  </span>
                </div>
                <Progress value={usagePercentage} className="h-3" />
                <div className="text-sm text-gray-600">
                  {remainingMaterials > 0 ? (
                    <span className="text-green-600 font-medium">
                      {remainingMaterials} materiais restantes
                    </span>
                  ) : (
                    <span className="text-red-600 font-medium">
                      Limite mensal atingido
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats.materialsByType).map(([type, count]) => {
              const config = getTypeConfig(type);
              const IconComponent = config.icon;
              
              return (
                <Card key={type} className={`${config.bgColor} ${config.borderColor} border-2 hover:shadow-lg transition-all duration-300 cursor-pointer group`}>
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div className={`w-12 h-12 rounded-xl ${config.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <IconComponent className={`w-6 h-6 ${config.color}`} />
                      </div>
                      <div>
                        <div className={`text-2xl font-bold ${config.color}`}>{count}</div>
                        <div className="text-xs font-medium text-gray-600">{config.label}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Recent Materials and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Materials */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg font-semibold text-gray-800">Materiais Recentes</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onNavigate('lessons')}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                Ver todos
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              {recentMaterials.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">Nenhum material criado ainda</p>
                  <Button 
                    onClick={handleCreateMaterial}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeiro Material
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentMaterials.map((material) => {
                    const config = getTypeConfig(material.type);
                    const IconComponent = config.icon;
                    return (
                      <div
                        key={material.id}
                        className="flex items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => onNavigate('lessons')}
                      >
                        <div className={`w-10 h-10 rounded-lg ${config.bgColor} flex items-center justify-center mr-3`}>
                          <IconComponent className={`w-5 h-5 ${config.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-800 truncate">
                            {material.title.replace(/^(plano-de-aula|slides|atividade|avaliacao)\s*-\s*/i, '')}
                          </h4>
                          <p className="text-sm text-gray-500">{material.subject} • {material.grade}</p>
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(material.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-gray-800">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                <Button
                  onClick={handleCreateMaterial}
                  disabled={isAtLimit}
                  className="flex items-center justify-start p-4 h-auto bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Criar Novo Material</div>
                    <div className="text-xs opacity-90">
                      {isAtLimit ? 'Limite mensal atingido' : `${remainingMaterials} restantes este mês`}
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => onNavigate('lessons')}
                  className="flex items-center justify-start p-4 h-auto border-gray-200 hover:bg-gray-50"
                >
                  <FileText className="w-5 h-5 mr-3 text-gray-600" />
                  <div className="text-left">
                    <div className="font-medium text-gray-800">Meus Materiais</div>
                    <div className="text-xs text-gray-500">{materials.length} materiais criados</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => onNavigate('calendar')}
                  className="flex items-center justify-start p-4 h-auto border-gray-200 hover:bg-gray-50"
                >
                  <Calendar className="w-5 h-5 mr-3 text-gray-600" />
                  <div className="text-left">
                    <div className="font-medium text-gray-800">Calendário</div>
                    <div className="text-xs text-gray-500">Organize suas aulas</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => onNavigate('subscription')}
                  className="flex items-center justify-start p-4 h-auto border-gray-200 hover:bg-purple-50 hover:border-purple-200"
                >
                  <Crown className="w-5 h-5 mr-3 text-purple-600" />
                  <div className="text-left">
                    <div className="font-medium text-gray-800">Gerenciar Plano</div>
                    <div className="text-xs text-purple-600">Plano {permissions.planName}</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <UpgradeModal
        open={upgradeModalOpen}
        onClose={closeModal}
        reason={upgradeReason}
        onUpgrade={handlePlanUpgrade}
      />
    </div>
  );
};

export default Dashboard;
