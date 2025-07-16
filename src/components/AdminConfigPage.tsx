import React, { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Plus, Edit, Bell, Link2, FileText, Users, BarChart2, X, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { templateService } from '@/services/templateService';
import { Textarea } from './ui/textarea';
import MaterialPreview from './MaterialPreview';
import { notificationService } from '@/services/notificationService';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Smile, Bell as LucideBell, Star, Heart } from 'lucide-react';

export default function AdminConfigPage() {
  const [tab, setTab] = useState('dashboard');
  const [metrics, setMetrics] = useState([
    { label: 'Usuários Totais', value: 0, icon: Users, color: 'from-blue-500 to-blue-600' },
    { label: 'Usuários Pagos', value: 0, icon: Badge, color: 'from-green-500 to-green-600' },
    { label: 'Materiais Criados', value: 0, icon: FileText, color: 'from-purple-500 to-purple-600' },
  ]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [integrationModalOpen, setIntegrationModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  // Novo estado para edição de template HTML
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [editingTemplateHtml, setEditingTemplateHtml] = useState<string>('');
  const [savingTemplate, setSavingTemplate] = useState(false);

  // Novo estado para visualização/edição
  const [viewingTemplateId, setViewingTemplateId] = useState<string | null>(null);
  const [viewingTemplateHtml, setViewingTemplateHtml] = useState<string>('');
  const [viewingTemplateEdit, setViewingTemplateEdit] = useState<string>('');
  const [viewingModalOpen, setViewingModalOpen] = useState(false);
  const [savingViewingTemplate, setSavingViewingTemplate] = useState(false);

  // Exemplo de dados para placeholders
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

  // Função para abrir modal de edição de template
  const handleEditTemplateHtml = (templateId: string) => {
    setEditingTemplateId(templateId);
    setEditingTemplateHtml(templateService.getTemplate(templateId));
    setTemplateModalOpen(true);
  };

  // Função para salvar template editado
  const handleSaveTemplateHtml = () => {
    if (!editingTemplateId) return;
    setSavingTemplate(true);
    templateService.setTemplate(editingTemplateId, editingTemplateHtml);
    setSavingTemplate(false);
    setTemplateModalOpen(false);
  };

  // Função para abrir modal de visualização/edição
  const handleViewTemplate = (templateId: string) => {
    setViewingTemplateId(templateId);
    const html = templateService.getTemplate(templateId);
    setViewingTemplateHtml(html);
    setViewingTemplateEdit(html);
    setViewingModalOpen(true);
  };

  // Função para salvar edição no modal visual
  const handleSaveViewingTemplate = () => {
    if (!viewingTemplateId) return;
    setSavingViewingTemplate(true);
    templateService.setTemplate(viewingTemplateId, viewingTemplateEdit);
    setViewingTemplateHtml(viewingTemplateEdit);
    setSavingViewingTemplate(false);
  };

  // Lista de templates disponíveis
  const templateList = templateService.getAvailableTemplates();

  // Função utilitária para gerar um material de exemplo para cada template
  function getMockMaterialForTemplate(templateId: string): any {
    switch (templateId) {
      case '1': // Plano de Aula
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
      case '2': // Slides
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
      case '3': // Atividade
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
      case '4': // Avaliação
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

  const { user } = useAuth();

  // Estado para campos do modal de notificação
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [savingNotif, setSavingNotif] = useState(false);
  const [notificationsList, setNotificationsList] = useState<any[]>([]);
  const [notifIcon, setNotifIcon] = useState('');
  const [notifImageUrl, setNotifImageUrl] = useState('');

  // Adicionar busca de perfis para mapear ids para nomes/emails
  const [userProfiles, setUserProfiles] = useState<Record<string, string>>({});

  // Novo estado para detalhes da notificação
  const [viewNotifModal, setViewNotifModal] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<any>(null);
  const [selectedNotifLidas, setSelectedNotifLidas] = useState<string[]>([]);
  const [selectedNotifNaoLidas, setSelectedNotifNaoLidas] = useState<string[]>([]);

  // Função para abrir modal de detalhes da notificação
  const handleViewNotif = async (notif: any) => {
    setSelectedNotif(notif);
    setViewNotifModal(true);
    // Marcar como lida se ainda não leu
    if (user && !(notif.lida_por || []).includes(user.id)) {
      await notificationService.markAsRead(notif.id, user.id);
      // Atualizar lista
      const notifs = await notificationService.getActiveNotifications();
      setNotificationsList(notifs);
      notif.lida_por = [...(notif.lida_por || []), user.id];
    }
  };

  // Atualizar listas de lidas/não lidas sempre que selectedNotif ou userProfiles mudar
  useEffect(() => {
    if (!selectedNotif) return;
    const lidas = (selectedNotif.lida_por || []).map((id: string) => userProfiles[id] || id);
    const allUserIds = Object.keys(userProfiles).filter(id => id !== user?.id);
    const naoLidas = allUserIds.filter(id => !(selectedNotif.lida_por || []).includes(id)).map(id => userProfiles[id] || id);
    setSelectedNotifLidas(lidas);
    setSelectedNotifNaoLidas(naoLidas);
  }, [selectedNotif, userProfiles, user]);

  // Função utilitária para formatar data
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

  // Buscar notificações reais do Supabase
  useEffect(() => {
    async function fetchNotifs() {
      const notifs = await notificationService.getActiveNotifications();
      setNotificationsList(notifs);
    }
    fetchNotifs();
  }, []);

  // Função para salvar notificação
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
    // Atualizar lista
    const notifs = await notificationService.getActiveNotifications();
    setNotificationsList(notifs);
  };

  useEffect(() => {
    async function fetchProfiles() {
      // Buscar todos os perfis
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
      // Total de usuários
      const { count: userCount } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true });
      // Usuários pagos (professor ou grupo_escolar)
      const { count: paidCount } = await supabase
        .from('planos_usuarios')
        .select('user_id', { count: 'exact', head: true })
        .in('plano_ativo', ['professor', 'grupo_escolar']);
      // Materiais criados (planos de aula + atividades + slides + avaliacoes)
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
      setMetrics([
        { label: 'Usuários Totais', value: userCount || 0, icon: Users, color: 'from-blue-500 to-blue-600' },
        { label: 'Usuários Pagos', value: paidCount || 0, icon: Badge, color: 'from-green-500 to-green-600' },
        { label: 'Materiais Criados', value: (planosCount || 0) + (atividadesCount || 0) + (slidesCount || 0) + (avaliacoesCount || 0), icon: FileText, color: 'from-purple-500 to-purple-600' },
      ]);
      // Últimas atividades reais
      const { data: activities } = await supabase
        .from('user_activities')
        .select('id, user_id, title, type, created_at')
        .order('created_at', { ascending: false })
        .limit(10);
      // Buscar nomes dos usuários
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
      setLoading(false);
    }
    fetchDashboardData();
  }, []);

  // Mock para as outras abas
  const templates = [
    { id: 1, name: 'Plano de Aula Básico', type: 'plano-aula', updatedAt: '2024-07-01' },
    { id: 2, name: 'Atividade Simples', type: 'atividade', updatedAt: '2024-06-28' },
  ];
  const notifications = [
    { id: 1, title: 'Nova funcionalidade!', message: 'Agora você pode editar templates!', date: '2024-07-02', active: true },
  ];
  const integrations = [
    { id: 1, name: 'Webhook Zapier', type: 'webhook', status: 'ativo' },
  ];

  // Função para lidar com upload de imagem para Supabase Storage
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileName = `${Date.now()}-${file.name}`;
    // Upload para o bucket 'notificacoes'
    const { data, error } = await supabase.storage.from('notificacoes').upload(fileName, file, { upsert: true });
    if (error) {
      alert('Erro ao fazer upload da imagem: ' + error.message);
      return;
    }
    // Gerar URL pública
    const { data: publicUrlData } = supabase.storage.from('notificacoes').getPublicUrl(fileName);
    if (publicUrlData?.publicUrl) {
      setNotifImageUrl(publicUrlData.publicUrl);
    }
  };

  // Galeria de ícones simplificada
  const iconGallery = [
    '🔔', '❗'
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Administração & Configurações</h1>
      <Tabs value={tab} onValueChange={setTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {metrics.map((m, i) => (
              <Card key={m.label} className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white hover:scale-[1.03] overflow-hidden relative">
                <div className={`p-5 text-white bg-gradient-to-r ${m.color} rounded-t-lg flex flex-col items-center justify-center`}>
                  <m.icon size={36} className="mb-2 drop-shadow-lg" />
                  <div className="text-3xl font-extrabold drop-shadow-lg">{m.value}</div>
                </div>
                <CardContent className="text-center py-4">
                  <div className="text-gray-700 text-base font-semibold">{m.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-blue-700">Tabela de Uso Recente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Usuário</th>
                      <th className="px-4 py-2 text-left">Ação</th>
                      <th className="px-4 py-2 text-left">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={3} className="text-center py-8">Carregando...</td></tr>
                    ) : recentActivities.length === 0 ? (
                      <tr><td colSpan={3} className="text-center py-8">Nenhuma atividade encontrada.</td></tr>
                    ) : recentActivities.map((a) => (
                      <tr key={a.id} className="hover:bg-blue-50 transition-colors">
                        <td className="px-4 py-2 font-medium text-blue-700">{a.userName}</td>
                        <td className="px-4 py-2">{a.type} - {a.title}</td>
                        <td className="px-4 py-2">{new Date(a.created_at).toLocaleString('pt-BR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Templates Tab */}
        <TabsContent value="templates">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-purple-700">Templates de Materiais</h2>
            <Button onClick={() => { setEditItem(null); setTemplateModalOpen(true); }} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold shadow-md hover:scale-105 transition-transform"><Plus size={16} className="mr-1" />Novo Template</Button>
          </div>
          <Card className="shadow-lg rounded-2xl">
            <CardContent>
              <table className="min-w-full text-sm">
                <thead className="bg-purple-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Nome</th>
                    <th className="px-4 py-2 text-left">Descrição</th>
                    <th className="px-4 py-2 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {templateList.map((tpl) => (
                    <tr key={tpl.id} className="hover:bg-purple-50 transition-colors">
                      <td className="px-4 py-2 font-medium text-purple-700">{tpl.name}</td>
                      <td className="px-4 py-2 text-gray-600">{tpl.description}</td>
                      <td className="px-4 py-2 text-center flex gap-2 justify-center">
                        <Button size="sm" variant="outline" className="text-purple-700 border-purple-200 hover:bg-purple-100" onClick={() => handleEditTemplateHtml(tpl.id)}>
                          Editar HTML
                        </Button>
                        <Button size="sm" variant="outline" className="text-blue-700 border-blue-200 hover:bg-blue-100" onClick={() => handleViewTemplate(tpl.id)}>
                          Visualizar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
          {/* Modal de visualização/edição de template HTML */}
          <Dialog open={viewingModalOpen} onOpenChange={setViewingModalOpen}>
            <DialogContent className="max-w-5xl w-full rounded-2xl p-0 overflow-hidden">
              <DialogHeader className="bg-gradient-to-r from-blue-500 to-purple-500 p-6">
                <DialogTitle className="text-white text-xl font-bold flex items-center gap-2">
                  Visualizar & Editar Template
                </DialogTitle>
                <Button size="icon" variant="ghost" className="absolute top-4 right-4 text-white hover:bg-purple-600" onClick={() => setViewingModalOpen(false)}><X /></Button>
              </DialogHeader>
              <div className="flex flex-col md:flex-row gap-6 p-6">
                {/* Preview do material renderizado com o template */}
                <div className="flex-1 min-w-[350px] max-w-[50%] border rounded-xl overflow-hidden shadow bg-white">
                  {viewingTemplateId ? (
                    <MaterialPreview material={getMockMaterialForTemplate(viewingTemplateId)} templateId={viewingTemplateId} />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">Selecione um template para visualizar</div>
                  )}
                </div>
                {/* Editor de código HTML */}
                <div className="flex-1 min-w-[350px] max-w-[50%] flex flex-col">
                  <Textarea
                    className="w-full h-full min-h-[400px] font-mono text-xs border-2 border-purple-200 rounded-lg p-2 bg-gray-50 flex-1"
                    value={viewingTemplateEdit}
                    onChange={e => setViewingTemplateEdit(e.target.value)}
                    spellCheck={false}
                  />
                  <Button className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold shadow-md hover:scale-105 transition-transform" onClick={handleSaveViewingTemplate} disabled={savingViewingTemplate}>
                    {savingViewingTemplate ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          {/* Modal de edição de template HTML (simples) */}
          <Dialog open={templateModalOpen} onOpenChange={setTemplateModalOpen}>
            <DialogContent className="max-w-2xl rounded-2xl p-0 overflow-hidden">
              <DialogHeader className="bg-gradient-to-r from-purple-500 to-pink-500 p-6">
                <DialogTitle className="text-white text-xl font-bold flex items-center gap-2">
                  Editar Template HTML
                </DialogTitle>
                <Button size="icon" variant="ghost" className="absolute top-4 right-4 text-white hover:bg-pink-600" onClick={() => setTemplateModalOpen(false)}><X /></Button>
              </DialogHeader>
              <div className="p-6 space-y-4">
                <div className="font-semibold text-purple-700 mb-2">
                  {editingTemplateId && templateList.find(t => t.id === editingTemplateId)?.name}
                </div>
                <Textarea
                  className="w-full h-96 border-2 border-purple-200 rounded-lg p-2 font-mono text-xs focus:border-purple-400 outline-none bg-gray-50"
                  value={editingTemplateHtml}
                  onChange={e => setEditingTemplateHtml(e.target.value)}
                  spellCheck={false}
                />
                <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold shadow-md hover:scale-105 transition-transform" onClick={handleSaveTemplateHtml} disabled={savingTemplate}>
                  {savingTemplate ? 'Salvando...' : 'Salvar Template'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>
        {/* Notificações Tab */}
        <TabsContent value="notificacoes">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-blue-700">Notificações</h2>
            <Button onClick={() => { setEditItem(null); setNotificationModalOpen(true); }} className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold shadow-md hover:scale-105 transition-transform"><Plus size={16} className="mr-1" />Nova Notificação</Button>
          </div>
          <Card className="shadow-lg rounded-2xl">
            <CardContent>
              <table className="min-w-full text-sm">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Título</th>
                    <th className="px-4 py-2 text-left">Mensagem</th>
                    <th className="px-4 py-2 text-left">Data</th>
                    <th className="px-4 py-2 text-left">Lidas</th>
                    <th className="px-4 py-2 text-left">Não lidas</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {notificationsList.map((n) => {
                    const lidas = (n.lida_por || []).map((id: string) => userProfiles[id] || id);
                    // Todos os usuários exceto admin
                    const allUserIds = Object.keys(userProfiles).filter(id => id !== user?.id);
                    const naoLidas = allUserIds.filter(id => !(n.lida_por || []).includes(id)).map(id => userProfiles[id] || id);
                    return (
                      <tr key={n.id} className="hover:bg-blue-50 transition-colors">
                        <td className="px-4 py-2 font-medium text-blue-700 cursor-pointer underline" onClick={() => handleViewNotif(n)}>
                          {n.icon && <span className="text-2xl mr-2 align-middle">{n.icon}</span>}
                          {n.image_url && <Avatar className="inline-block w-8 h-8 rounded-full"><AvatarImage src={n.image_url} /><AvatarFallback>IMG</AvatarFallback></Avatar>}
                          {n.titulo || n.title}
                        </td>
                        <td className="px-4 py-2">{n.mensagem || n.message}</td>
                        <td className="px-4 py-2">{formatDate(n.data_envio || n.created_at)}</td>
                        <td className="px-4 py-2">
                          <span className="inline-block bg-green-100 text-green-800 rounded px-2 text-xs font-bold mr-1">{lidas.length}</span>
                          {lidas.length > 0 && (
                            <span className="text-xs text-gray-600">{lidas.join(', ')}</span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          <span className="inline-block bg-red-100 text-red-800 rounded px-2 text-xs font-bold mr-1">{naoLidas.length}</span>
                          {naoLidas.length > 0 && (
                            <span className="text-xs text-gray-600">{naoLidas.join(', ')}</span>
                          )}
                        </td>
                        <td className="px-4 py-2">{n.ativa || n.active ? <Badge className="bg-green-100 text-green-800">Ativa</Badge> : <Badge className="bg-gray-100 text-gray-700">Inativa</Badge>}</td>
                        <td className="px-4 py-2 text-center flex gap-2 justify-center items-center">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-blue-600 border-blue-300 hover:bg-blue-50"
                            onClick={() => handleViewNotif(n)}
                          >
                            Abrir
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-red-500 hover:bg-red-100"
                            title="Excluir"
                            onClick={async () => {
                              if (window.confirm('Tem certeza que deseja excluir esta notificação?')) {
                                await notificationService.deleteNotification(n.id);
                                const notifs = await notificationService.getActiveNotifications();
                                setNotificationsList(notifs);
                              }
                            }}
                          >
                            <Trash2 size={18} />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
          {/* Modal de Notificação */}
          <Dialog open={notificationModalOpen} onOpenChange={setNotificationModalOpen}>
            <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden">
              <DialogHeader className="bg-gradient-to-r from-blue-500 to-purple-500 p-6">
                <DialogTitle className="text-white text-xl font-bold flex items-center gap-2">
                  <Bell className="w-5 h-5" /> {editItem ? 'Editar Notificação' : 'Nova Notificação'}
                </DialogTitle>
                <Button size="icon" variant="ghost" className="absolute top-4 right-4 text-white hover:bg-purple-600" onClick={() => setNotificationModalOpen(false)}><X /></Button>
              </DialogHeader>
              <div className="p-6 space-y-4">
                {/* Campos da notificação */}
                <input className="w-full border-2 border-blue-200 rounded-lg p-2 focus:border-blue-400 outline-none" placeholder="Título" value={notifTitle} onChange={e => setNotifTitle(e.target.value)} />
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold">Ícone:</span>
                  <span className="text-2xl">{notifIcon}</span>
                  <div className="flex gap-1">
                    {iconGallery.map((icon, i) => (
                      <button key={i} type="button" className={`p-1 hover:bg-blue-100 rounded ${notifIcon === icon ? 'ring-2 ring-blue-400' : ''}`} onClick={() => setNotifIcon(icon)}>
                        <span className="text-2xl">{icon}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <input className="w-full border-2 border-blue-200 rounded-lg p-2 focus:border-blue-400 outline-none" placeholder="Ícone (emoji ou nome de ícone)" value={notifIcon} onChange={e => setNotifIcon(e.target.value)} />
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold">Imagem:</span>
                  {notifImageUrl && <Avatar className="w-10 h-10"><AvatarImage src={notifImageUrl} /><AvatarFallback>IMG</AvatarFallback></Avatar>}
                  <input type="file" accept="image/*" onChange={handleImageUpload} />
                </div>
                <textarea className="w-full border-2 border-blue-200 rounded-lg p-2 focus:border-blue-400 outline-none" placeholder="Mensagem" value={notifMessage} onChange={e => setNotifMessage(e.target.value)} />
                <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold shadow-md hover:scale-105 transition-transform" onClick={async () => { await handleSaveNotification(notifIcon, notifImageUrl); }} disabled={savingNotif}>
                  {savingNotif ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          {/* Modal de detalhes da notificação */}
          <Dialog open={viewNotifModal} onOpenChange={setViewNotifModal}>
            <DialogContent className="max-w-2xl w-full rounded-2xl p-0 overflow-hidden">
              <DialogHeader className="bg-gradient-to-r from-blue-500 to-purple-500 p-6">
                <DialogTitle className="text-white text-xl font-bold flex items-center gap-2">
                  Detalhes da Notificação
                </DialogTitle>
                <Button size="icon" variant="ghost" className="absolute top-4 right-4 text-white hover:bg-purple-600" onClick={() => setViewNotifModal(false)}><X /></Button>
              </DialogHeader>
              <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col gap-2">
                  <label className="font-semibold">Título</label>
                  <input
                    className="border rounded px-3 py-2"
                    value={selectedNotif?.titulo || ''}
                    onChange={e => setSelectedNotif({ ...selectedNotif, titulo: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-semibold">Mensagem</label>
                  <textarea
                    className="border rounded px-3 py-2 min-h-[80px]"
                    value={selectedNotif?.mensagem || ''}
                    onChange={e => setSelectedNotif({ ...selectedNotif, mensagem: e.target.value })}
                  />
                </div>
                {selectedNotif?.icon && <span className="text-3xl mb-2">{selectedNotif.icon}</span>}
                {selectedNotif?.image_url && <Avatar className="w-24 h-24 mb-2"><AvatarImage src={selectedNotif.image_url} /><AvatarFallback>IMG</AvatarFallback></Avatar>}
                <div className="flex flex-col gap-2">
                  <label className="font-semibold">Ícone (emoji ou nome de ícone)</label>
                  <input
                    className="border rounded px-3 py-2"
                    value={selectedNotif?.icon || ''}
                    onChange={e => setSelectedNotif({ ...selectedNotif, icon: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-semibold">URL da imagem (opcional)</label>
                  <input
                    className="border rounded px-3 py-2"
                    value={selectedNotif?.image_url || ''}
                    onChange={e => setSelectedNotif({ ...selectedNotif, image_url: e.target.value })}
                  />
                </div>
                <div className="flex gap-8">
                  <div className="flex-1">
                    <div className="font-semibold mb-1">Lidas ({selectedNotifLidas.length})</div>
                    <ul className="text-green-700 text-sm">
                      {selectedNotifLidas.map(uid => (
                        <li key={uid}>{userProfiles[uid] || uid}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold mb-1">Não lidas ({selectedNotifNaoLidas.length})</div>
                    <ul className="text-red-700 text-sm">
                      {selectedNotifNaoLidas.map(uid => (
                        <li key={uid}>{userProfiles[uid] || uid}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="default"
                    onClick={async () => {
                      if (selectedNotif && selectedNotif.id) {
                        await notificationService.updateNotification(selectedNotif.id, {
                          titulo: selectedNotif.titulo,
                          mensagem: selectedNotif.mensagem,
                          icon: selectedNotif.icon,
                          image_url: selectedNotif.image_url,
                        });
                        setViewNotifModal(false);
                        // Atualizar lista após edição
                        const notifs = await notificationService.getActiveNotifications();
                        setNotificationsList(notifs);
                      }
                    }}
                  >
                    Salvar Alterações
                  </Button>
                  <Button variant="outline" onClick={() => setViewNotifModal(false)}>Fechar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
} 