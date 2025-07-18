import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Plus, Edit, Bell, Link2, FileText, Users, BarChart2, X, Trash2, Settings, Code, MessageSquare, Save, Eye, Sparkles, Zap, Link, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { templateService } from '@/services/templateService';
import MaterialPreview from './MaterialPreview';
import { useAuth } from '@/contexts/AuthContext';
import AdminDashboardStats from './admin/AdminDashboardStats';
import AdminActivityFeed from './admin/AdminActivityFeed';
import AdminQuickActions from './admin/AdminQuickActions';
import AdminFinanceStats from './admin/AdminFinanceStats';
import NotificationsSection from './admin/NotificationsSection';

export default function AdminConfigPage() {
  const [tab, setTab] = useState('dashboard');
  const [metrics, setMetrics] = useState([
    { label: 'Usuários Totais', value: 0, icon: Users, color: 'from-blue-500 to-blue-600' },
    { label: 'Usuários Pagos', value: 0, icon: Badge, color: 'from-green-500 to-green-600' },
    { label: 'Materiais Criados', value: 0, icon: FileText, color: 'from-purple-500 to-purple-600' },
  ]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [financeData, setFinanceData] = useState({
    monthlyRevenue: 0,
    annualRevenue: 0,
    averageRevenuePerUser: 0,
    totalPaidUsers: 0
  });
  const [loading, setLoading] = useState(true);

  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [editingTemplateHtml, setEditingTemplateHtml] = useState<string>('');
  const [savingTemplate, setSavingTemplate] = useState(false);

  const [viewingTemplateId, setViewingTemplateId] = useState<string | null>(null);
  const [viewingTemplateHtml, setViewingTemplateHtml] = useState<string>('');
  const [viewingTemplateEdit, setViewingTemplateEdit] = useState<string>('');
  const [viewingModalOpen, setViewingModalOpen] = useState(false);
  const [savingViewingTemplate, setSavingViewingTemplate] = useState(false);

  // Webhook state
  const [webhookEmail, setWebhookEmail] = useState('');
  const [webhookEvento, setWebhookEvento] = useState('assinatura aprovada');
  const [webhookProduto, setWebhookProduto] = useState('Plano Professor (Mensal)');
  const [webhookLoading, setWebhookLoading] = useState(false);
  const [webhookResult, setWebhookResult] = useState<string|null>(null);
  const [webhookLogs, setWebhookLogs] = useState<any[]>([]);
  const [logsPage, setLogsPage] = useState(1);
  const [logsTotal, setLogsTotal] = useState(0);
  const [securityEnabled, setSecurityEnabled] = useState(false);
  const LOGS_PAGE_SIZE = 10;

  const { user } = useAuth();

  const handleEditTemplateHtml = (templateId: string) => {
    setEditingTemplateId(templateId);
    setEditingTemplateHtml(templateService.getTemplate(templateId));
    setTemplateModalOpen(true);
  };

  const handleSaveTemplateHtml = () => {
    if (!editingTemplateId) return;
    setSavingTemplate(true);
    templateService.setTemplate(editingTemplateId, editingTemplateHtml);
    setSavingTemplate(false);
    setTemplateModalOpen(false);
  };

  const handleViewTemplate = (templateId: string) => {
    setViewingTemplateId(templateId);
    const html = templateService.getTemplate(templateId);
    setViewingTemplateHtml(html);
    setViewingTemplateEdit(html);
    setViewingModalOpen(true);
  };

  const handleSaveViewingTemplate = () => {
    if (!viewingTemplateId) return;
    setSavingViewingTemplate(true);
    templateService.setTemplate(viewingTemplateId, viewingTemplateEdit);
    setViewingTemplateHtml(viewingTemplateEdit);
    setSavingViewingTemplate(false);
  };

  const templateList = templateService.getAvailableTemplates();

  function getMockMaterialForTemplate(templateId: string): any {
    switch (templateId) {
      case '1':
        return {
          id: 'mock1',
          title: 'Exemplo de Plano de Aula',
          type: 'plano-de-aula',
          subject: 'Matemática',
          grade: '6º Ano',
          createdAt: new Date().toISOString(),
          content: {
            titulo: 'Exemplo de Título',
            professor: 'Prof. João',
            disciplina: 'Matemática',
            serie: '6º Ano',
            tema: 'Frações',
            data: '01/01/2024',
            duracao: '50 min',
            bncc: 'EF06MA01',
            objetivos: ['Compreender frações', 'Resolver problemas com frações'],
            habilidades: ['EF06MA01', 'EF06MA02'],
            desenvolvimento: [
              { etapa: 'Início', tempo: '10 min', atividade: 'Apresentação do tema', recursos: 'Quadro' },
              { etapa: 'Desenvolvimento', tempo: '30 min', atividade: 'Exercícios em grupo', recursos: 'Folhas' },
              { etapa: 'Encerramento', tempo: '10 min', atividade: 'Discussão', recursos: 'Quadro' }
            ],
            recursos: ['Quadro', 'Folhas'],
            conteudosProgramaticos: ['Frações', 'Números racionais'],
            metodologia: 'Aulas expositivas e práticas.',
            avaliacao: 'Avaliação contínua.',
            referencias: ['Livro didático', 'BNCC']
          }
        };
      case '2':
        return {
          id: 'mock2',
          title: 'Exemplo de Slides',
          type: 'slides',
          subject: 'Matemática',
          grade: '7º Ano',
          createdAt: new Date().toISOString(),
          content: {
            slides: [
              { numero: 1, titulo: 'Introdução à Geometria', conteudo: 'Conceitos básicos' },
              { numero: 2, titulo: 'Formas Geométricas', conteudo: 'Círculo, quadrado, triângulo' },
              { numero: 3, titulo: 'Exercícios', conteudo: 'Identificar formas' }
            ]
          }
        };
      case '3':
        return {
          id: 'mock3',
          title: 'Exemplo de Atividade',
          type: 'atividade',
          subject: 'Matemática',
          grade: '6º Ano',
          createdAt: new Date().toISOString(),
          content: {
            titulo: 'Atividade de Frações',
            instrucoes: 'Leia atentamente as questões.',
            questoes: [
              { numero: 1, tipo: 'multipla_escolha', pergunta: 'Quanto é 1/2 + 1/4?', opcoes: ['3/4', '2/4', '1/4'], resposta: '3/4' },
              { numero: 2, tipo: 'dissertativa', pergunta: 'Explique o conceito de fração.', linhasResposta: 3 }
            ]
          }
        };
      case '4':
        return {
          id: 'mock4',
          title: 'Exemplo de Avaliação',
          type: 'avaliacao',
          subject: 'Matemática',
          grade: '6º Ano',
          createdAt: new Date().toISOString(),
          content: {
            titulo: 'Avaliação de Frações',
            instrucoes: 'Responda às questões a seguir.',
            questoes: [
              { numero: 1, tipo: 'multipla_escolha', pergunta: 'Quanto é 1/2 + 1/4?', opcoes: ['3/4', '2/4', '1/4'], resposta: '3/4' },
              { numero: 2, tipo: 'dissertativa', pergunta: 'Explique o conceito de fração.', linhasResposta: 3 }
            ]
          }
        };
      default:
        return null;
    }
  }

  // Função para simular webhook
  async function handleSimularWebhook(e: React.FormEvent) {
    e.preventDefault();
    setWebhookLoading(true);
    setWebhookResult(null);
    try {
      const res = await fetch('/api/webhooks/aulagia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: webhookEmail,
          evento: webhookEvento,
          produto: webhookProduto,
          token: securityEnabled ? 'q64w1ncxx2k' : undefined
        })
      });
      const data = await res.json();
      if (res.ok) {
        setWebhookResult('Webhook processado com sucesso!');
        fetchWebhookLogs();
      } else {
        setWebhookResult(data.error || 'Erro ao processar webhook.');
      }
    } catch (err) {
      setWebhookResult('Erro ao conectar ao servidor.');
    } finally {
      setWebhookLoading(false);
    }
  }

  // Função para buscar logs do webhook
  async function fetchWebhookLogs(page = 1) {
    // Busca via Supabase client-side (ajuste se necessário para SSR/API)
    const { data, error, count } = await supabase
      .from('webhook_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page-1)*LOGS_PAGE_SIZE, page*LOGS_PAGE_SIZE-1);
    if (!error && data) {
      setWebhookLogs(data);
      setLogsTotal(count || 0);
    }
  }

  // Função para ativar/desativar segurança do token
  async function toggleSecurity() {
    const res = await fetch('/api/webhooks/aulagia/security', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: !securityEnabled })
    });
    const data = await res.json();
    setSecurityEnabled(data.enabled);
  }

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      try {
        // Fetch basic metrics
        const { count: userCount } = await supabase
          .from('perfis')
          .select('id', { count: 'exact', head: true });
        
        const { count: paidCount } = await supabase
          .from('planos_usuarios')
          .select('user_id', { count: 'exact', head: true })
          .in('plano_ativo', ['professor', 'grupo_escolar']);
        
        const { count: planosCount } = await supabase
          .from('materiais')
          .select('id', { count: 'exact', head: true })
          .eq('tipo_material', 'plano-de-aula');
        
        const { count: atividadesCount } = await supabase
          .from('materiais')
          .select('id', { count: 'exact', head: true })
          .eq('tipo_material', 'atividade');
        
        const { count: slidesCount } = await supabase
          .from('materiais')
          .select('id', { count: 'exact', head: true })
          .eq('tipo_material', 'slides');
        
        const { count: avaliacoesCount } = await supabase
          .from('materiais')
          .select('id', { count: 'exact', head: true })
          .eq('tipo_material', 'avaliacao');

        // Calculate finance data
        const { data: planCounts } = await supabase
          .from('planos_usuarios')
          .select('plano_ativo')
          .in('plano_ativo', ['professor', 'grupo_escolar']);

        let monthlyRevenue = 0;
        let annualRevenue = 0;

        if (planCounts) {
          planCounts.forEach(plan => {
            if (plan.plano_ativo === 'professor') {
              monthlyRevenue += 29.90;
              annualRevenue += 299;
            } else if (plan.plano_ativo === 'grupo_escolar') {
              monthlyRevenue += 89.90;
              annualRevenue += 849;
            }
          });
        }

        const averageRevenuePerUser = paidCount && paidCount > 0 ? monthlyRevenue / paidCount : 0;

        setMetrics([
          { label: 'Usuários Totais', value: userCount || 0, icon: Users, color: 'from-blue-500 to-blue-600' },
          { label: 'Usuários Pagos', value: paidCount || 0, icon: Badge, color: 'from-green-500 to-green-600' },
          { label: 'Materiais Criados', value: (planosCount || 0) + (atividadesCount || 0) + (slidesCount || 0) + (avaliacoesCount || 0), icon: FileText, color: 'from-purple-500 to-purple-600' },
        ]);

        setFinanceData({
          monthlyRevenue,
          annualRevenue,
          averageRevenuePerUser,
          totalPaidUsers: paidCount || 0
        });

        // Fetch activities
        const { data: activities } = await supabase
          .from('user_activities')
          .select('id, user_id, title, type, created_at')
          .order('created_at', { ascending: false })
          .limit(10);

        const userMap: Record<string, string> = {};
        if (activities && activities.length > 0) {
          const userIds = Array.from(new Set(activities.map(a => a.user_id)));
          const { data: users } = await supabase
            .from('perfis')
            .select('user_id, nome_preferido, full_name')
            .in('user_id', userIds);
          if (users) {
            users.forEach(u => {
              userMap[u.user_id] = u.nome_preferido || u.full_name || u.user_id;
            });
          }
        }

        setRecentActivities(
          (activities || []).map(a => ({
            ...a,
            userName: userMap[a.user_id] || a.user_id,
          }))
        );
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  useEffect(() => {
    fetchWebhookLogs(logsPage);
  }, [logsPage]);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Administração</h1>
            <p className="text-muted-foreground">Painel de controle e monitoramento da plataforma</p>
          </div>
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary" />
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1 rounded-lg">
            <TabsTrigger 
              value="dashboard" 
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <BarChart2 className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="templates"
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Code className="w-4 h-4 mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger 
              value="notificacoes"
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Bell className="w-4 h-4 mr-2" />
              Notificações
            </TabsTrigger>
            <TabsTrigger 
              value="webhooks"
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Zap className="w-4 h-4 mr-2" />
              Webhooks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-8 mt-8">
            {/* Stats Cards */}
            <AdminDashboardStats metrics={metrics} loading={loading} />

            {/* Finance Stats */}
            <AdminFinanceStats financeData={financeData} loading={loading} />

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Activity Feed - Takes 2/3 of the space */}
              <div className="lg:col-span-2">
                <AdminActivityFeed activities={recentActivities} loading={loading} />
              </div>

              {/* Quick Actions - Takes 1/3 of the space */}
              <div>
                <AdminQuickActions
                  onCreateNotification={() => setTab('notificacoes')}
                  onManageTemplates={() => setTab('templates')}
                  onViewUsers={() => {/* Implement user management */}}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6 mt-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Templates de Materiais</h2>
                <p className="text-muted-foreground">Gerencie e customize os templates utilizados na criação de materiais educacionais.</p>
              </div>
              <Button
                onClick={() => { setEditItem(null); setTemplateModalOpen(true); }}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm hover:shadow-md transition-all duration-200"
              >
                <Plus size={20} className="mr-2" />
                Novo Template
              </Button>
            </div>

            <Card className="border-0 shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 border-b">
                    <TableHead className="font-semibold text-foreground">Nome</TableHead>
                    <TableHead className="font-semibold text-foreground">Descrição</TableHead>
                    <TableHead className="font-semibold text-foreground text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templateList.map((tpl, idx) => (
                    <TableRow key={tpl.id} className={`hover:bg-muted/30 transition-colors ${idx % 2 === 0 ? 'bg-background' : 'bg-muted/10'}`}>
                      <TableCell className="font-medium text-foreground">{tpl.name}</TableCell>
                      <TableCell className="text-muted-foreground">{tpl.description}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex gap-2 justify-center">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/30 font-semibold"
                            onClick={() => handleEditTemplateHtml(tpl.id)}
                          >
                            <Code size={14} className="mr-1" />
                            Editar HTML
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/30 font-semibold"
                            onClick={() => handleViewTemplate(tpl.id)}
                          >
                            <Eye size={14} className="mr-1" />
                            Visualizar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="notificacoes" className="mt-8">
            <NotificationsSection />
          </TabsContent>

          <TabsContent value="webhooks" className="space-y-8 mt-8">
            <Card className="border-0 shadow-sm p-6">
              <CardHeader className="flex flex-row items-center gap-4">
                <Link className="w-6 h-6 text-primary" />
                <CardTitle className="text-xl">Integração Webhooks</CardTitle>
                <Button size="sm" variant={securityEnabled ? 'default' : 'outline'} onClick={toggleSecurity} className="ml-auto flex gap-2 items-center">
                  <Shield className="w-4 h-4" />
                  {securityEnabled ? 'Segurança Ativada' : 'Segurança Desativada'}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <span className="font-semibold">URL do endpoint:</span>
                  <div className="flex items-center gap-2 mt-2">
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm select-all">/api/webhooks/aulagia</code>
                    <Button size="sm" onClick={() => {navigator.clipboard.writeText('/api/webhooks/aulagia')}}>Copiar</Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Cadastre esta URL na sua plataforma de pagamentos para automação de planos.</p>
                </div>
                <div className="mb-8">
                  <h3 className="font-semibold mb-2">Simulador de Webhooks</h3>
                  <form className="flex flex-col md:flex-row gap-4 items-end" onSubmit={handleSimularWebhook}>
                    <div className="flex flex-col">
                      <label className="text-sm font-medium mb-1">E-mail</label>
                      <Input type="email" placeholder="cliente@exemplo.com" value={webhookEmail} onChange={e => setWebhookEmail(e.target.value)} required />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm font-medium mb-1">Evento</label>
                      <select className="h-10 rounded border px-2" value={webhookEvento} onChange={e => setWebhookEvento(e.target.value)}>
                        <option value="assinatura aprovada">Assinatura aprovada</option>
                        <option value="assinatura cancelada">Assinatura cancelada</option>
                        <option value="assinatura renovada">Assinatura renovada</option>
                        <option value="assinatura atrasada">Assinatura atrasada</option>
                      </select>
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm font-medium mb-1">Produto</label>
                      <select className="h-10 rounded border px-2" value={webhookProduto} onChange={e => setWebhookProduto(e.target.value)}>
                        <option value="Plano Professor (Mensal)">Professor mensal</option>
                        <option value="Plano Professor (Anual)">Professor anual</option>
                        <option value="Plano Grupo Escolar (Mensal)">Grupo Escolar mensal</option>
                        <option value="Plano Grupo Escolar (Anual)">Grupo Escolar anual</option>
                      </select>
                    </div>
                    <Button type="submit" className="h-10" disabled={webhookLoading}>{webhookLoading ? 'Enviando...' : 'Simular Webhook'}</Button>
                  </form>
                  {webhookResult && <div className={`mt-2 text-sm ${webhookResult.includes('sucesso') ? 'text-green-600' : 'text-red-600'}`}>{webhookResult}</div>}
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Últimos Webhooks Processados</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data/Hora</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Evento recebido</TableHead>
                        <TableHead>Plano aplicado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {webhookLogs.length === 0 ? (
                        <TableRow><TableCell colSpan={4} className="text-center">Nenhum log encontrado.</TableCell></TableRow>
                      ) : (
                        webhookLogs.map(log => (
                          <TableRow key={log.id}>
                            <TableCell>{new Date(log.created_at).toLocaleString('pt-BR')}</TableCell>
                            <TableCell>{log.email}</TableCell>
                            <TableCell>{log.evento}</TableCell>
                            <TableCell>{log.plano_aplicado}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-muted-foreground">Página {logsPage} de {Math.ceil(logsTotal/LOGS_PAGE_SIZE) || 1}</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" disabled={logsPage === 1} onClick={() => setLogsPage(1)}>«</Button>
                      <Button size="sm" variant="outline" disabled={logsPage === 1} onClick={() => setLogsPage(logsPage-1)}>‹</Button>
                      <Button size="sm" variant="outline" disabled={logsPage === Math.ceil(logsTotal/LOGS_PAGE_SIZE) || logsTotal === 0} onClick={() => setLogsPage(logsPage+1)}>›</Button>
                      <Button size="sm" variant="outline" disabled={logsPage === Math.ceil(logsTotal/LOGS_PAGE_SIZE) || logsTotal === 0} onClick={() => setLogsPage(Math.ceil(logsTotal/LOGS_PAGE_SIZE))}>»</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Template Modal */}
        <Dialog open={templateModalOpen} onOpenChange={setTemplateModalOpen}>
          <DialogContent className="max-w-2xl rounded-2xl border-0 shadow-2xl overflow-hidden">
            <DialogHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 -m-6 mb-6 rounded-t-2xl">
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Code className="w-5 h-5" />
                Editar Template HTML
              </DialogTitle>
            </DialogHeader>
            <div className="p-2 space-y-4">
              <div className="font-semibold text-purple-700 mb-2">
                {editingTemplateId && templateList.find(t => t.id === editingTemplateId)?.name}
              </div>
              <Textarea
                className="w-full h-96 border-2 border-purple-200 rounded-xl p-4 font-mono text-xs focus:border-purple-400 outline-none bg-gray-50"
                value={editingTemplateHtml}
                onChange={e => setEditingTemplateHtml(e.target.value)}
                spellCheck={false}
              />
              <Button
                className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold shadow-lg"
                onClick={handleSaveTemplateHtml}
                disabled={savingTemplate}
              >
                {savingTemplate ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    Salvar Template
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Template Preview Modal */}
        <Dialog open={viewingModalOpen} onOpenChange={setViewingModalOpen}>
          <DialogContent className="max-w-7xl w-full rounded-2xl border-0 shadow-2xl overflow-hidden max-h-[95vh]">
            <DialogHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6 -m-6 mb-6 rounded-t-2xl">
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Visualizar & Editar Template
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col lg:flex-row gap-6 p-2 overflow-auto max-h-[calc(95vh-120px)]">
              <div className="flex-1 min-w-[350px] border-2 border-gray-200 rounded-xl overflow-hidden shadow-lg bg-white">
                {viewingTemplateId ? (
                  <MaterialPreview material={getMockMaterialForTemplate(viewingTemplateId)} templateId={viewingTemplateId} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 p-8">
                    <div className="text-center">
                      <Eye className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p>Selecione um template para visualizar</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-[350px] flex flex-col space-y-4">
                <Textarea
                  className="flex-1 min-h-[400px] font-mono text-xs border-2 border-purple-200 rounded-xl p-4 bg-gray-50 focus:border-purple-400"
                  value={viewingTemplateEdit}
                  onChange={e => setViewingTemplateEdit(e.target.value)}
                  spellCheck={false}
                />
                <Button
                  className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold shadow-lg"
                  onClick={handleSaveViewingTemplate}
                  disabled={savingViewingTemplate}
                >
                  {savingViewingTemplate ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save size={16} className="mr-2" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
