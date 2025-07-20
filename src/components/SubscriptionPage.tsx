import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Download, Edit, FileText, Calendar, History, Plus, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { planService, UserPlanData } from '@/services/planService';
import { useToast } from '@/hooks/use-toast';

const SubscriptionPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userPlanData, setUserPlanData] = useState<UserPlanData | null>(null);
  const [allPlans, setAllPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    const loadPlanData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        
        // Carregar dados do plano do usuário
        const userData = await planService.getUserPlanData(user.id);
        setUserPlanData(userData);

        // Carregar todos os planos disponíveis
        const plans = await planService.getAllPlans();
        setAllPlans(plans);

      } catch (error) {
        console.error('Erro ao carregar dados dos planos:', error);
        toast({
          title: "Erro ao carregar planos",
          description: "Não foi possível carregar os dados dos planos.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadPlanData();
  }, [user?.id, toast]);

  const handleUpgrade = async (planName: string) => {
    if (!user?.id) return;

    try {
      setUpgrading(true);
      
      // Aqui você implementaria a lógica de upgrade
      // Por enquanto, apenas simular
      toast({
        title: "Upgrade iniciado",
        description: `Atualizando para o plano ${planName}...`,
      });

      // Recarregar dados após upgrade
      const userData = await planService.getUserPlanData(user.id);
      setUserPlanData(userData);

    } catch (error) {
      console.error('Erro ao fazer upgrade:', error);
      toast({
        title: "Erro no upgrade",
        description: "Não foi possível fazer o upgrade do plano.",
        variant: "destructive"
      });
    } finally {
      setUpgrading(false);
    }
  };

  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case 'gratuito':
        return <FileText className="w-6 h-6" />;
      case 'professor':
        return <Crown className="w-6 h-6" />;
      case 'grupo_escolar':
        return <Crown className="w-6 h-6" />;
      default:
        return <FileText className="w-6 h-6" />;
    }
  };

  const getPlanColor = (planName: string) => {
    switch (planName) {
      case 'gratuito':
        return 'bg-gray-100 text-gray-600';
      case 'professor':
        return 'bg-blue-100 text-blue-600';
      case 'grupo_escolar':
        return 'bg-green-100 text-green-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando planos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Planos e Assinatura
          </h1>
          <p className="text-gray-600 text-lg">
            Escolha o plano ideal para suas necessidades pedagógicas
          </p>
        </div>

        {/* Plano Atual */}
        {userPlanData && (
          <Card className="mb-8 border-2 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-blue-600" />
                Seu Plano Atual: {userPlanData.planName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {userPlanData.materialsRemaining}
                  </div>
                  <div className="text-sm text-gray-600">Materiais Restantes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {userPlanData.materialsCreated}
                  </div>
                  <div className="text-sm text-gray-600">Materiais Criados</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {userPlanData.planLimit}
                  </div>
                  <div className="text-sm text-gray-600">Limite Mensal</div>
                </div>
              </div>
              
              {/* Barra de Progresso */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progresso do mês</span>
                  <span>{Math.round((userPlanData.materialsCreated / userPlanData.planLimit) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((userPlanData.materialsCreated / userPlanData.planLimit) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Planos Disponíveis */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {allPlans.map((plan) => (
            <Card 
              key={plan.nome} 
              className={`relative transition-all duration-300 hover:shadow-lg ${
                userPlanData?.planName === plan.nome 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : 'hover:scale-105'
              }`}
            >
              {userPlanData?.planName === plan.nome && (
                <Badge className="absolute -top-2 -right-2 bg-blue-600">
                  Atual
                </Badge>
              )}
              
              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                  <div className={`p-3 rounded-full ${getPlanColor(plan.nome)}`}>
                    {getPlanIcon(plan.nome)}
                  </div>
                </div>
                <CardTitle className="text-xl">{plan.descricao}</CardTitle>
                <div className="text-3xl font-bold text-gray-900">
                  R$ {plan.preco_mensal.toFixed(2).replace('.', ',')}
                  <span className="text-sm font-normal text-gray-600">/mês</span>
                </div>
                <div className="text-sm text-gray-600">
                  R$ {plan.preco_anual.toFixed(2).replace('.', ',')}/ano
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4 text-green-600" />
                    <span>{plan.limite_materiais_mensal} materiais por mês</span>
                  </div>
                  
                  {plan.pode_download_word && (
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4 text-blue-600" />
                      <span>Download em Word</span>
                    </div>
                  )}
                  
                  {plan.pode_download_ppt && (
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4 text-blue-600" />
                      <span>Download em PowerPoint</span>
                    </div>
                  )}
                  
                  {plan.pode_editar_materiais && (
                    <div className="flex items-center gap-2">
                      <Edit className="w-4 h-4 text-purple-600" />
                      <span>Editar materiais</span>
                    </div>
                  )}
                  
                  {plan.pode_criar_slides && (
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-orange-600" />
                      <span>Criar slides</span>
                    </div>
                  )}
                  
                  {plan.pode_criar_avaliacoes && (
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-red-600" />
                      <span>Criar avaliações</span>
                    </div>
                  )}
                  
                  {plan.tem_calendario && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-green-600" />
                      <span>Calendário de aulas</span>
                    </div>
                  )}
                  
                  {plan.tem_historico && (
                    <div className="flex items-center gap-2">
                      <History className="w-4 h-4 text-gray-600" />
                      <span>Histórico completo</span>
                    </div>
                  )}
                </div>

                <Button 
                  className={`w-full ${
                    userPlanData?.planName === plan.nome
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                  }`}
                  disabled={userPlanData?.planName === plan.nome || upgrading}
                  onClick={() => handleUpgrade(plan.nome)}
                >
                  {upgrading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : userPlanData?.planName === plan.nome ? (
                    'Plano Atual'
                  ) : (
                    'Escolher Plano'
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;

