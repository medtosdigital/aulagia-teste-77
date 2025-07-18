import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { usePlanPermissions } from '@/hooks/usePlanPermissions';
import { useToast } from '@/hooks/use-toast';
import { statsService } from '@/services/statsService';
import { webhookService, WebhookLog } from '@/services/webhookService';
import { 
  BookOpen, 
  FileText, 
  Calendar, 
  Users, 
  TrendingUp, 
  Clock,
  AlertCircle,
  CheckCircle,
  Activity,
  Webhook
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface StatCardProps {
  title: string;
  value: number | string;
  description: string;
  icon: React.ReactNode;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon,
  color,
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { currentPlan, remainingMaterials } = usePlanPermissions();
  const { toast } = useToast();
  
  const [stats, setStats] = useState<any>(null);
  const [recentWebhooks, setRecentWebhooks] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await statsService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as estatísticas do painel.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadRecentWebhooks = async () => {
    if (currentPlan?.id === 'admin') {
      try {
        const webhooks = await webhookService.getWebhookLogs(5); // Últimos 5 webhooks
        setRecentWebhooks(webhooks);
      } catch (error) {
        console.error('Erro ao carregar webhooks recentes:', error);
      }
    }
  };

  useEffect(() => {
    if (user) {
      loadStats();
      loadRecentWebhooks();
    }
  }, [user, currentPlan]);

  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Data inválida';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Welcome Section */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">
            Olá, {user?.user_metadata?.full_name || user?.email}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Bem-vindo ao seu painel de controle
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm">
            {currentPlan?.name}
          </Badge>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Materiais restantes</p>
            <p className="text-2xl font-bold text-primary">{remainingMaterials}</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          {currentPlan?.id === 'admin' && (
            <TabsTrigger value="admin">Administração</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Materiais
                </CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalMaterials || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Criados até agora
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Este Mês
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.materialsThisMonth || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Materiais criados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Eventos de Calendário
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.calendarEvents || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Agendados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Atividade Recente
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.recentActivities || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Últimos 7 dias
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>
                Acesse rapidamente as principais funcionalidades
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Link to="/create-material">
                <Button>
                  <FileText className="h-4 w-4 mr-2" />
                  Criar Material
                </Button>
              </Link>
              <Link to="/materials">
                <Button variant="outline">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Meus Materiais
                </Button>
              </Link>
              <Link to="/calendar">
                <Button variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Calendário
                </Button>
              </Link>
              {currentPlan?.id === 'grupo_escolar' && (
                <Link to="/school">
                  <Button variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Grupo Escolar
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {currentPlan?.id === 'admin' && (
          <TabsContent value="admin" className="space-y-6">
            {/* Admin Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Webhooks Recentes
                  </CardTitle>
                  <Webhook className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{recentWebhooks.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Últimas 24h
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Webhooks com Sucesso
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {recentWebhooks.filter(w => w.status === 'sucesso').length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Processados
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Webhooks com Erro
                  </CardTitle>
                  <AlertCircle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {recentWebhooks.filter(w => w.status !== 'sucesso').length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Falharam
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Usuários Ativos
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.activeUsers || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Este mês
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Webhooks */}
            <Card>
              <CardHeader className="flex justify-between items-center">
                <div>
                  <CardTitle>Webhooks Recentes</CardTitle>
                  <CardDescription>
                    Últimos eventos de webhook processados
                  </CardDescription>
                </div>
                <Link to="/admin/webhooks">
                  <Button variant="outline" size="sm">
                    Ver Todos
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {recentWebhooks.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum webhook recente
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recentWebhooks.map((webhook) => (
                      <div key={webhook.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge 
                            variant={webhook.status === 'sucesso' ? 'default' : 'destructive'}
                          >
                            {webhook.status === 'sucesso' ? 'Sucesso' : 'Erro'}
                          </Badge>
                          <div>
                            <p className="font-medium">{webhook.evento}</p>
                            <p className="text-sm text-muted-foreground">{webhook.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(webhook.created_at), 'dd/MM HH:mm', { locale: ptBR })}
                          </p>
                          {webhook.plano_aplicado && (
                            <Badge variant="outline" className="text-xs">
                              {webhook.plano_aplicado}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Admin Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Administrativas</CardTitle>
                <CardDescription>
                  Ferramentas de administração do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Link to="/admin/webhooks">
                  <Button>
                    <Webhook className="h-4 w-4 mr-2" />
                    Logs de Webhook
                  </Button>
                </Link>
                <Link to="/admin/users">
                  <Button variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Usuários
                  </Button>
                </Link>
                <Link to="/admin/notifications">
                  <Button variant="outline">
                    <Activity className="h-4 w-4 mr-2" />
                    Notificações
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default Dashboard;
