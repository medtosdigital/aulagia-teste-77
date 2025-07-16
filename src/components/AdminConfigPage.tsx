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
import { Plus, Edit, Bell, Link2, FileText, Users, BarChart2, X, Trash2, Settings, Code, MessageSquare, Save, Eye, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { templateService } from '@/services/templateService';
import MaterialPreview from './MaterialPreview';
import { notificationService } from '@/services/notificationService';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import AdminDashboardStats from './admin/AdminDashboardStats';
import AdminActivityFeed from './admin/AdminActivityFeed';
import AdminQuickActions from './admin/AdminQuickActions';
import AdminFinanceStats from './admin/AdminFinanceStats';

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
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [integrationModalOpen, setIntegrationModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [editingTemplateHtml, setEditingTemplateHtml] = useState<string>('');
  const [savingTemplate, setSavingTemplate] = useState(false);

  const [viewingTemplateId, setViewingTemplateId] = useState<string | null>(null);
  const [viewingTemplateHtml, setViewingTemplateHtml] = useState<string>('');
  const [viewingTemplateEdit, setViewingTemplateEdit] = useState<string>('');
  const [viewingModalOpen, setViewingModalOpen] = useState(false);
  const [savingViewingTemplate, setSavingViewingTemplate] = useState(false);

  const { user } = useAuth();

  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [savingNotif, setSavingNotif] = useState(false);
  const [notificationsList, setNotificationsList] = useState<any[]>([]);
  const [notifIcon, setNotifIcon] = useState('');
  const [notifImageUrl, setNotifImageUrl] = useState('');

  const [userProfiles, setUserProfiles] = useState<Record<string, string>>({});

  const [viewNotifModal, setViewNotifModal] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<any>(null);
  const [selectedNotifLidas, setSelectedNotifLidas] = useState<string[]>([]);
  const [selectedNotifNaoLidas, setSelectedNotifNaoLidas] = useState<string[]>([]);

  const exampleData = {
    titulo: 'Exemplo de Título',
    professor: 'Prof. João',
    data: '01/01/2024',
    disciplina: 'Matemática',
    serie: '6º Ano',
    bncc: 'EF06MA01',
    duracao: '50 min',
    tema: 'Frações',
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
    referencias: ['Livro didático', 'BNCC'],
    instrucoes: 'Leia atentamente as questões.',
    questoes: [
      { numero: 1, tipo: 'multipla_escolha', pergunta: 'Quanto é 1/2 + 1/4?', opcoes: ['3/4', '2/4', '1/4'], pontuacao: 1 },
      { numero: 2, tipo: 'dissertativa', pergunta: 'Explique o conceito de fração.', linhasResposta: 3 }
    ],
    criterios_avaliacao: ['Clareza', 'Correção']
  };

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

  const handleViewNotif = async (notif: any) => {
    setSelectedNotif(notif);
    setViewNotifModal(true);
    if (user && !(notif.lida_por || []).includes(user.id)) {
      await notificationService.markAsRead(notif.id, user.id);
      const notifs = await notificationService.getActiveNotifications();
      setNotificationsList(notifs);
      notif.lida_por = [...(notif.lida_por || []), user.id];
    }
  };

  useEffect(() => {
    if (!selectedNotif) return;
    const lidas = (selectedNotif.lida_por || []).map((id: string) => userProfiles[id] || id);
    const allUserIds = Object.keys(userProfiles).filter(id => id !== user?.id);
    const naoLidas = allUserIds.filter(id => !(selectedNotif.lida_por || []).includes(id)).map(id => userProfiles[id] || id);
    setSelectedNotifLidas(lidas);
    setSelectedNotifNaoLidas(naoLidas);
  }, [selectedNotif, userProfiles, user]);

  function formatDate(dateStr: string) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const ano = d.getFullYear();
    const hora = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${dia}/${mes}/${ano} - ${hora}:${min}`;
  }

  useEffect(() => {
    async function fetchNotifs() {
      const notifs = await notificationService.getActiveNotifications();
      setNotificationsList(notifs);
    }
    fetchNotifs();
  }, []);

  const handleSaveNotification = async (icon?: string, image_url?: string) => {
    if (!notifTitle.trim() || !notifMessage.trim() || !user?.id) return;
    setSavingNotif(true);
    await notificationService.createNotification(notifTitle, notifMessage, user.id, icon, image_url);
    setSavingNotif(false);
    setNotificationModalOpen(false);
    setNotifTitle('');
    setNotifMessage('');
    setNotifIcon('');
    setNotifImageUrl('');
    const notifs = await notificationService.getActiveNotifications();
    setNotificationsList(notifs);
  };

  useEffect(() => {
    async function fetchProfiles() {
      const { data: profiles } = await supabase.from('profiles').select('id, full_name, email');
      if (profiles) {
        const map: Record<string, string> = {};
        profiles.forEach((p: any) => {
          map[p.id] = p.full_name || p.email || p.id;
        });
        setUserProfiles(map);
      }
    }
    fetchProfiles();
  }, []);

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      try {
        // Fetch basic metrics
        const { count: userCount } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true });
        
        const { count: paidCount } = await supabase
          .from('planos_usuarios')
          .select('user_id', { count: 'exact', head: true })
          .in('plano_ativo', ['professor', 'grupo_escolar']);
        
        const { count: planosCount } = await supabase
          .from('planos_de_aula')
          .select('id', { count: 'exact', head: true });
        
        const { count: atividadesCount } = await supabase
          .from('atividades')
          .select('id', { count: 'exact', head: true });
        
        const { count: slidesCount } = await supabase
          .from('slides')
          .select('id', { count: 'exact', head: true });
        
        const { count: avaliacoesCount } = await supabase
          .from('avaliacoes')
          .select('id', { count: 'exact', head: true });

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

        let userMap: Record<string, string> = {};
        if (activities && activities.length > 0) {
          const userIds = Array.from(new Set(activities.map(a => a.user_id)));
          const { data: users } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .in('id', userIds);
          if (users) {
            users.forEach(u => {
              userMap[u.id] = u.full_name || u.email || u.id;
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage.from('notificacoes').upload(fileName, file, { upsert: true });
    if (error) {
      alert('Erro ao fazer upload da imagem: ' + error.message);
      return;
    }
    const { data: publicUrlData } = supabase.storage.from('notificacoes').getPublicUrl(fileName);
    if (publicUrlData?.publicUrl) {
      setNotifImageUrl(publicUrlData.publicUrl);
    }
  };

  const iconGallery = ['🔔', '❗'];

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
          <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 rounded-lg">
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
                  onCreateNotification={() => setNotificationModalOpen(true)}
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

          <TabsContent value="notificacoes" className="space-y-6 mt-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Notificações</h2>
                <p className="text-muted-foreground">Crie e gerencie notificações para todos os usuários da plataforma.</p>
              </div>
              <Button
                onClick={() => { setEditItem(null); setNotificationModalOpen(true); }}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm hover:shadow-md transition-all duration-200"
              >
                <Plus size={20} className="mr-2" />
                Nova Notificação
              </Button>
            </div>

            <Card className="border-0 shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 border-b">
                    <TableHead className="font-semibold text-foreground">Título</TableHead>
                    <TableHead className="font-semibold text-foreground">Mensagem</TableHead>
                    <TableHead className="font-semibold text-foreground">Data</TableHead>
                    <TableHead className="font-semibold text-foreground">Lidas</TableHead>
                    <TableHead className="font-semibold text-foreground">Não lidas</TableHead>
                    <TableHead className="font-semibold text-foreground">Status</TableHead>
                    <TableHead className="font-semibold text-foreground text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notificationsList.map((n, idx) => {
                    const lidas = (n.lida_por || []).map((id: string) => userProfiles[id] || id);
                    const allUserIds = Object.keys(userProfiles).filter(id => id !== user?.id);
                    const naoLidas = allUserIds.filter(id => !(n.lida_por || []).includes(id)).map(id => userProfiles[id] || id);
                    return (
                      <TableRow key={n.id} className={`hover:bg-muted/30 transition-colors ${idx % 2 === 0 ? 'bg-background' : 'bg-muted/10'}`}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2 cursor-pointer hover:text-primary" onClick={() => handleViewNotif(n)}>
                            {n.icon && <span className="text-lg">{n.icon}</span>}
                            {n.image_url && <Avatar className="w-6 h-6"><AvatarImage src={n.image_url} /><AvatarFallback>IMG</AvatarFallback></Avatar>}
                            <span className="text-primary underline">{n.titulo || n.title}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground max-w-xs truncate">{n.mensagem || n.message}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{formatDate(n.data_envio || n.created_at)}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800 border-green-200 font-semibold">
                            {lidas.length}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-red-100 text-red-800 border-red-200 font-semibold">
                            {naoLidas.length}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {n.ativa || n.active ? (
                            <Badge className="bg-green-100 text-green-800 border-green-200 font-semibold">Ativa</Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-700 border-gray-200 font-semibold">Inativa</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex gap-2 justify-center">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/30 font-semibold"
                              onClick={() => handleViewNotif(n)}
                            >
                              <Eye size={14} className="mr-1" />
                              Abrir
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="rounded-2xl border-0 shadow-2xl">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-lg font-bold">Excluir Notificação</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir esta notificação? Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="border-2">Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={async () => {
                                      await notificationService.deleteNotification(n.id);
                                      const notifs = await notificationService.getActiveNotifications();
                                      setNotificationsList(notifs);
                                    }}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
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

        {/* Notification Modal */}
        <Dialog open={notificationModalOpen} onOpenChange={setNotificationModalOpen}>
          <DialogContent className="sm:max-w-lg rounded-2xl border-0 shadow-2xl overflow-hidden">
            <DialogHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6 -m-6 mb-6 rounded-t-2xl">
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Bell className="w-5 h-5" />
                {editItem ? 'Editar Notificação' : 'Nova Notificação'}
              </DialogTitle>
            </DialogHeader>
            <div className="p-2 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Título</label>
                <Input
                  placeholder="Título da notificação"
                  value={notifTitle}
                  onChange={e => setNotifTitle(e.target.value)}
                  className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Ícone</label>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm text-gray-600">Atual:</span>
                  <span className="text-2xl">{notifIcon}</span>
                  <div className="flex gap-1">
                    {iconGallery.map((icon, i) => (
                      <button
                        key={i}
                        type="button"
                        className={`p-2 hover:bg-blue-100 rounded-lg transition-colors ${notifIcon === icon ? 'ring-2 ring-blue-400 bg-blue-50' : 'bg-gray-50'}`}
                        onClick={() => setNotifIcon(icon)}
                      >
                        <span className="text-2xl">{icon}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <Input
                  placeholder="Ícone personalizado (emoji ou nome)"
                  value={notifIcon}
                  onChange={e => setNotifIcon(e.target.value)}
                  className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Imagem (opcional)</label>
                <div className="flex items-center gap-3 mb-2">
                  {notifImageUrl && (
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={notifImageUrl} />
                      <AvatarFallback>IMG</AvatarFallback>
                    </Avatar>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Mensagem</label>
                <Textarea
                  placeholder="Conteúdo da notificação"
                  value={notifMessage}
                  onChange={e => setNotifMessage(e.target.value)}
                  className="min-h-[100px] border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                />
              </div>
              <Button
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold shadow-lg"
                onClick={async () => { await handleSaveNotification(notifIcon, notifImageUrl); }}
                disabled={savingNotif}
              >
                {savingNotif ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    Salvar Notificação
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Notification Details Modal */}
        <Dialog open={viewNotifModal} onOpenChange={setViewNotifModal}>
          <DialogContent className="max-w-3xl w-full rounded-2xl border-0 shadow-2xl overflow-hidden max-h-[90vh]">
            <DialogHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6 -m-6 mb-6 rounded-t-2xl">
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Detalhes da Notificação
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-6 p-2 overflow-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Título</label>
                  <Input
                    className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                    value={selectedNotif?.titulo || ''}
                    onChange={e => setSelectedNotif({ ...selectedNotif, titulo: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Ícone</label>
                  <Input
                    className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                    value={selectedNotif?.icon || ''}
                    onChange={e => setSelectedNotif({ ...selectedNotif, icon: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Mensagem</label>
                <Textarea
                  className="min-h-[100px] border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                  value={selectedNotif?.mensagem || ''}
                  onChange={e => setSelectedNotif({ ...selectedNotif, mensagem: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">URL da imagem (opcional)</label>
                <Input
                  className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                  value={selectedNotif?.image_url || ''}
                  onChange={e => setSelectedNotif({ ...selectedNotif, image_url: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-2 border-green-200 bg-green-50/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-green-700 text-lg">Lidas ({selectedNotifLidas.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {selectedNotifLidas.map(uid => (
                        <div key={uid} className="text-sm text-green-600 bg-white px-2 py-1 rounded">{uid}</div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-2 border-red-200 bg-red-50/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-red-700 text-lg">Não lidas ({selectedNotifNaoLidas.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {selectedNotifNaoLidas.map(uid => (
                        <div key={uid} className="text-sm text-red-600 bg-white px-2 py-1 rounded">{uid}</div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setViewNotifModal(false)}
                  className="h-12 px-6 border-2"
                >
                  Fechar
                </Button>
                <Button
                  onClick={async () => {
                    if (selectedNotif && selectedNotif.id) {
                      await notificationService.updateNotification(selectedNotif.id, {
                        titulo: selectedNotif.titulo,
                        mensagem: selectedNotif.mensagem,
                        icon: selectedNotif.icon,
                        image_url: selectedNotif.image_url,
                      });
                      setViewNotifModal(false);
                      const notifs = await notificationService.getActiveNotifications();
                      setNotificationsList(notifs);
                    }
                  }}
                  className="h-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Save size={16} className="mr-2" />
                  Salvar Alterações
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
