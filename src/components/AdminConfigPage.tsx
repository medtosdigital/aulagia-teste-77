
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Users, FileText, DollarSign, Zap, Bell, Settings, Activity, Database, TrendingUp, MonitorSpeaker } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { supabaseUnifiedPlanService } from '@/services/supabaseUnifiedPlanService';
import AdminDashboardStats from './admin/AdminDashboardStats';

export default function AdminConfigPage() {
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    paidUsers: 0,
    totalMaterials: 0,
    monthlyRevenue: 0,
    annualRevenue: 0,
    revenuePerUser: 0,
    payingUsers: 0
  });
  const [activities, setActivities] = useState<any[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [webhookTesting, setWebhookTesting] = useState(false);

  const loadMetrics = async () => {
    try {
      console.log('Carregando métricas do admin...');
      
      // Buscar contadores usando o serviço unificado
      const [totalUsers, paidUsers, totalMaterials] = await Promise.all([
        supabaseUnifiedPlanService.getTotalUsersCount(),
        supabaseUnifiedPlanService.getPaidUsersCount(),
        supabaseUnifiedPlanService.getTotalMaterialsCount()
      ]);

      console.log('Métricas carregadas:', { totalUsers, paidUsers, totalMaterials });

      // Calcular receitas baseadas nos planos ativos
      const monthlyRevenue = paidUsers * 29.90; // Assumindo média do plano professor
      const annualRevenue = paidUsers * 299; // Assumindo média do plano professor anual
      const revenuePerUser = paidUsers > 0 ? monthlyRevenue / paidUsers : 0;

      setMetrics({
        totalUsers,
        paidUsers,
        totalMaterials,
        monthlyRevenue,
        annualRevenue,
        revenuePerUser,
        payingUsers: paidUsers
      });

    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
    }
  };

  const loadActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('user_activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Erro ao carregar atividades:', error);
        return;
      }

      setActivities(data || []);
    } catch (error) {
      console.error('Erro ao carregar atividades:', error);
    }
  };

  const loadWebhookLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('webhook_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Erro ao carregar logs de webhook:', error);
        return;
      }

      setWebhookLogs(data || []);
    } catch (error) {
      console.error('Erro ao carregar logs de webhook:', error);
    }
  };

  const simulateWebhook = async () => {
    setWebhookTesting(true);
    try {
      const testPayload = {
        email: 'teste@exemplo.com',
        produto: 'Plano Professor',
        evento: 'simulacao_teste',
        status: 'sucesso',
        plano_aplicado: 'professor',
        payload: {
          test: true,
          timestamp: new Date().toISOString()
        }
      };

      const { error } = await supabase
        .from('webhook_logs')
        .insert(testPayload);

      if (error) {
        console.error('Erro ao simular webhook:', error);
      } else {
        await loadWebhookLogs();
      }
    } catch (error) {
      console.error('Erro na simulação de webhook:', error);
    } finally {
      setWebhookTesting(false);
    }
  };

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      await Promise.all([
        loadMetrics(),
        loadActivities(),
        loadWebhookLogs()
      ]);
      setLoading(false);
    };

    loadAllData();
  }, []);

  const dashboardMetrics = [
    {
      label: 'Usuários Totais',
      value: metrics.totalUsers,
      icon: Users,
      color: 'from-blue-500 to-blue-600'
    },
    {
      label: 'Usuários Pagos',
      value: metrics.paidUsers,
      icon: TrendingUp,
      color: 'from-green-500 to-green-600'
    },
    {
      label: 'Materiais Criados',
      value: metrics.totalMaterials,
      icon: FileText,
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const financeMetrics = [
    {
      label: 'Receita Mensal',
      value: `R$ ${metrics.monthlyRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'from-green-500 to-green-600'
    },
    {
      label: 'Receita Anual',
      value: `R$ ${metrics.annualRevenue.toFixed(2)}`,
      icon: TrendingUp,
      color: 'from-blue-500 to-blue-600'
    },
    {
      label: 'Receita por Usuário',
      value: `R$ ${metrics.revenuePerUser.toFixed(2)}`,
      icon: Users,
      color: 'from-purple-500 to-purple-600'
    },
    {
      label: 'Usuários Pagantes',
      value: metrics.payingUsers,
      icon: Users,
      color: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Administração
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Painel de controle e monitoramento da plataforma
          </p>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4 mx-auto">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notificações
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Webhooks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <AdminDashboardStats metrics={dashboardMetrics} loading={loading} />

            <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-t-xl">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-6 h-6" />
                  <div>
                    <CardTitle className="text-xl">Gestão Financeira</CardTitle>
                    <CardDescription className="text-green-100">
                      Receitas e métricas financeiras da plataforma
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {financeMetrics.map((metric) => (
                    <div key={metric.label} className="text-center p-4 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border border-gray-100">
                      <div className={`w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r ${metric.color} flex items-center justify-center`}>
                        <metric.icon className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-sm font-medium text-gray-600 mb-1">{metric.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-gray-600 to-slate-600 text-white rounded-t-xl">
                <div className="flex items-center gap-3">
                  <Activity className="w-6 h-6" />
                  <div>
                    <CardTitle className="text-xl">Atividades Recentes</CardTitle>
                    <CardDescription className="text-gray-100">
                      Últimas ações dos usuários na plataforma
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {activities.length === 0 ? (
                    <div className="text-center py-8">
                      <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Nenhuma atividade recente encontrada.</p>
                    </div>
                  ) : (
                    activities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-100">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-800">{activity.title}</span>
                            <Badge variant="outline" className="text-xs">
                              {activity.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                          <div className="text-xs text-gray-400">
                            {new Date(activity.created_at).toLocaleString('pt-BR')}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="webhooks" className="space-y-6">
            <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Zap className="w-6 h-6" />
                    <div>
                      <CardTitle className="text-xl">Webhooks</CardTitle>
                      <CardDescription className="text-yellow-100">
                        Logs e teste de webhooks da plataforma
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    onClick={simulateWebhook}
                    disabled={webhookTesting}
                    className="bg-white/20 hover:bg-white/30 text-white border-white/20"
                  >
                    {webhookTesting ? (
                      <>
                        <MonitorSpeaker className="w-4 h-4 mr-2 animate-spin" />
                        Testando...
                      </>
                    ) : (
                      <>
                        <MonitorSpeaker className="w-4 h-4 mr-2" />
                        Simular Webhook
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {webhookLogs.length === 0 ? (
                    <div className="text-center py-8">
                      <Zap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Nenhum log de webhook encontrado.</p>
                    </div>
                  ) : (
                    webhookLogs.map((log) => (
                      <div key={log.id} className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-100">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge 
                                className={`font-semibold ${
                                  log.status === 'sucesso' 
                                    ? 'bg-green-100 text-green-700 border-green-200' 
                                    : 'bg-red-100 text-red-700 border-red-200'
                                }`}
                              >
                                {log.status}
                              </Badge>
                              <span className="text-sm font-medium text-gray-700">{log.evento}</span>
                            </div>
                            <div className="text-sm text-gray-600 mb-2">
                              <strong>Email:</strong> {log.email} | <strong>Produto:</strong> {log.produto || 'N/A'}
                            </div>
                            {log.plano_aplicado && (
                              <div className="text-sm text-gray-600 mb-2">
                                <strong>Plano:</strong> {log.plano_aplicado}
                              </div>
                            )}
                            <div className="text-xs text-gray-400">
                              {new Date(log.created_at).toLocaleString('pt-BR')}
                              {log.ip_address && (
                                <span className="ml-2">• IP: {log.ip_address}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates">
            <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Templates
                </CardTitle>
                <CardDescription>
                  Gerenciamento de templates da plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Funcionalidade em desenvolvimento...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notificações
                </CardTitle>
                <CardDescription>
                  Sistema de notificações da plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Funcionalidade em desenvolvimento...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
