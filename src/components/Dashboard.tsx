
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Calendar, 
  Users, 
  TrendingUp, 
  FileText, 
  PresentationChart,
  AlertTriangle,
  Plus,
  Activity,
  School
} from 'lucide-react';
import { usePlanPermissions } from '@/hooks/usePlanPermissions';
import { useAuth } from '@/contexts/AuthContext';
import { statsService } from '@/services/statsService';

interface DashboardStats {
  totalMaterials: number;
  materialsThisMonth: number;
  totalCalendarEvents: number;
  recentActivities: Array<{
    id: string;
    type: string;
    title: string;
    created_at: string;
  }>;
  materialsByType: Record<string, number>;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { 
    currentPlan, 
    usage,
    getRemainingMaterials,
    canAccessCalendarPage,
    canAccessSchool,
    canAccessCreateMaterial,
    canAccessMaterials
  } = usePlanPermissions();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalMaterials: 0,
    materialsThisMonth: 0,
    totalCalendarEvents: 0,
    recentActivities: [],
    materialsByType: {}
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        // Since getDashboardStats doesn't exist, let's create basic stats
        const basicStats: DashboardStats = {
          totalMaterials: 0,
          materialsThisMonth: usage.materialsThisMonth || 0,
          totalCalendarEvents: 0,
          recentActivities: [],
          materialsByType: {}
        };
        
        setStats(basicStats);
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user, usage.materialsThisMonth]);

  const remainingMaterials = getRemainingMaterials();
  const usagePercentage = currentPlan.limits.materialsPerMonth > 0 
    ? (usage.materialsThisMonth / currentPlan.limits.materialsPerMonth) * 100 
    : 0;

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Bem-vindo de volta! Aqui está um resumo da sua atividade.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge className={`px-3 py-1 ${currentPlan.id === 'professor' ? 'bg-blue-100 text-blue-800' : 
            currentPlan.id === 'grupo_escolar' ? 'bg-green-100 text-green-800' : 
            'bg-gray-100 text-gray-800'}`}>
            {currentPlan.name}
          </Badge>
          
          {canAccessCreateMaterial() && (
            <Button onClick={() => window.location.href = '/create-material'}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Material
            </Button>
          )}
        </div>
      </div>

      {/* Usage Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Uso Mensal de Materiais
          </CardTitle>
          <CardDescription>
            Acompanhe seu uso de materiais este mês
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Materiais criados este mês</span>
              <span className="font-medium">
                {usage.materialsThisMonth} / {currentPlan.limits.materialsPerMonth === Infinity ? '∞' : currentPlan.limits.materialsPerMonth}
              </span>
            </div>
            
            {currentPlan.limits.materialsPerMonth !== Infinity && (
              <Progress value={usagePercentage} className="h-2" />
            )}
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Materiais restantes</span>
              <span className={`font-medium ${remainingMaterials <= 5 ? 'text-red-600' : 'text-green-600'}`}>
                {remainingMaterials === Infinity ? '∞' : remainingMaterials}
              </span>
            </div>
            
            {remainingMaterials <= 5 && remainingMaterials !== Infinity && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span className="text-sm text-amber-800">
                  Você está próximo do limite mensal. Consider fazer upgrade do seu plano.
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Materiais</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMaterials}</div>
            <p className="text-xs text-muted-foreground">
              Todos os materiais criados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.materialsThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              Materiais criados em {new Date().toLocaleDateString('pt-BR', { month: 'long' })}
            </p>
          </CardContent>
        </Card>

        {canAccessCalendarPage() && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eventos</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCalendarEvents}</div>
              <p className="text-xs text-muted-foreground">
                Eventos no calendário
              </p>
            </CardContent>
          </Card>
        )}

        {canAccessSchool() && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Escola</CardTitle>
              <School className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Ativo</div>
              <p className="text-xs text-muted-foreground">
                Gerenciamento escolar
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
          <CardDescription>
            Suas ações mais recentes no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recentActivities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhuma atividade recente</p>
              <p className="text-sm">Comece criando seu primeiro material!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FileText className="w-4 h-4 text-gray-600" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{activity.title}</p>
                    <p className="text-xs text-gray-600 capitalize">{activity.type}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(activity.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Acesse rapidamente as funcionalidades mais utilizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {canAccessCreateMaterial() && (
              <Button 
                variant="outline" 
                className="h-auto flex-col gap-2 py-4"
                onClick={() => window.location.href = '/create-material'}
              >
                <Plus className="w-6 h-6" />
                <span className="text-sm">Novo Material</span>
              </Button>
            )}
            
            {canAccessMaterials() && (
              <Button 
                variant="outline" 
                className="h-auto flex-col gap-2 py-4"
                onClick={() => window.location.href = '/materials'}
              >
                <BookOpen className="w-6 h-6" />
                <span className="text-sm">Meus Materiais</span>
              </Button>
            )}
            
            {canAccessCalendarPage() && (
              <Button 
                variant="outline" 
                className="h-auto flex-col gap-2 py-4"
                onClick={() => window.location.href = '/calendar'}
              >
                <Calendar className="w-6 h-6" />
                <span className="text-sm">Calendário</span>
              </Button>
            )}
            
            {canAccessSchool() && (
              <Button 
                variant="outline" 
                className="h-auto flex-col gap-2 py-4"
                onClick={() => window.location.href = '/school'}
              >
                <School className="w-6 h-6" />
                <span className="text-sm">Escola</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
