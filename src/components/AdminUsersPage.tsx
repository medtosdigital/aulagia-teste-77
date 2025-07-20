import React, { useEffect, useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Pencil, Save, X, ChevronLeft, ChevronRight, UserCheck, UserX, Clock, Search, Filter, Users, TrendingUp, MessageSquare, Eye, Trash2, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const planLabels = {
  gratuito: 'Gratuito',
  professor: 'Professor',
  grupo_escolar: 'Grupo Escolar',
};

const planOptions = [
  { value: 'gratuito', label: 'Gratuito' },
  { value: 'professor', label: 'Professor' },
  { value: 'grupo_escolar', label: 'Grupo Escolar' },
];

const statusOptions = [
  { value: 'ativo', label: 'Ativo' },
  { value: 'inativo', label: 'Inativo' },
];

const PAGE_SIZE = 10;

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState<any>(null);
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    plan: '' as 'gratuito' | 'professor' | 'grupo_escolar' | 'admin',
    celular: '',
    escola: ''
  });
  const [saving, setSaving] = useState(false);
  
  // Estados para modal de alteração de senha
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [filterPlan, setFilterPlan] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [historyUser, setHistoryUser] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [feedbackSearch, setFeedbackSearch] = useState('');
  const [feedbackTypeFilter, setFeedbackTypeFilter] = useState('');
  const { toast } = useToast();

  async function fetchUsers() {
    setLoading(true);
    try {
      console.log('🔍 Carregando dados dos usuários...');
      
      // Adicionar timeout para evitar travamentos
      const loadPromise = (async () => {
        // Verificar usuário atual
        const { data: { user } } = await supabase.auth.getUser();
        console.log('👤 Usuário atual:', user?.email);
        console.log('🆔 User ID:', user?.id);
        
        // Verificar o plano do usuário atual
        if (user?.email) {
          const { data: currentUserProfile, error: profileError } = await supabase
            .from('perfis')
            .select('plano_ativo, user_id')
            .eq('email', user.email)
            .single();
          
          console.log('📋 Plano do usuário atual:', currentUserProfile?.plano_ativo);
          console.log('🆔 User ID do perfil:', currentUserProfile?.user_id);
          console.log('❌ Erro ao buscar perfil atual:', profileError);
          
          // Verificar se o usuário tem plano admin
          if (currentUserProfile?.plano_ativo === 'admin') {
            console.log('✅ Usuário tem plano admin - deve ter acesso total');
          } else {
            console.log('⚠️ Usuário NÃO tem plano admin - acesso limitado');
          }
        }
        
        // Consulta principal - deve retornar todos os usuários para admin
        const { data: profiles, error: profilesError } = await supabase
          .from('perfis')
          .select('user_id, full_name, email, plano_ativo, created_at, updated_at, data_expiracao_plano, celular, escola, avatar_url')
          .limit(100); // Limitar a 100 usuários para performance
        
        console.log('📊 Resultado da consulta:', { 
          profiles: profiles?.length || 0, 
          error: profilesError,
          profilesData: profiles 
        });
        
        if (profilesError) {
          console.error('❌ Erro ao buscar perfis:', profilesError);
          return [];
        }
        
        const usersData = profiles?.map((p: any) => {
          let paymentStatus = 'em dia';
          let paymentBadge = 'bg-green-100 text-green-800';
          let paymentDue = null;
          
          // Lógica de pagamento baseada no tipo de plano
          if (p.plano_ativo === 'admin') {
            // Admin: data em cinza
            paymentStatus = 'admin';
            paymentBadge = 'bg-gray-100 text-gray-600';
            paymentDue = p.updated_at ? new Date(p.updated_at).toLocaleDateString('pt-BR') : '--/--/----';
          } else if (p.plano_ativo === 'gratuito') {
            // Plano gratuito: data em cinza
            paymentStatus = 'gratuito';
            paymentBadge = 'bg-gray-100 text-gray-600';
            paymentDue = p.created_at ? new Date(p.created_at).toLocaleDateString('pt-BR') : '--/--/----';
          } else {
            // Planos pagos (professor, grupo_escolar): usar data_expiracao_plano
            if (p.data_expiracao_plano) {
              const exp = new Date(p.data_expiracao_plano);
              paymentDue = exp.toLocaleDateString('pt-BR');
              
              if (exp < new Date()) {
                // Plano vencido
                paymentStatus = 'atrasado';
                paymentBadge = 'bg-red-100 text-red-800';
              } else {
                // Plano em dia
                paymentStatus = 'em dia';
                paymentBadge = 'bg-green-100 text-green-800';
              }
            } else {
              // Sem data de expiração, usar data de criação
              paymentDue = p.created_at ? new Date(p.created_at).toLocaleDateString('pt-BR') : '--/--/----';
              paymentStatus = 'em dia';
              paymentBadge = 'bg-green-100 text-green-800';
            }
          }
          
          return {
            id: p.user_id,
            name: p.full_name || '',
            email: p.email || '',
            plan: p.plano_ativo || 'gratuito',
            createdAt: p.created_at ? p.created_at.split('T')[0] : '',
            status: 'ativo',
            isAdmin: p.email === 'medtosdigital@gmail.com',
            paymentStatus,
            paymentBadge,
            paymentDue,
            celular: p.celular || '',
            escola: p.escola || '',
            avatar_url: p.avatar_url || ''
          };
        }) || [];
        
        console.log('✅ Usuários processados:', usersData.length);
        console.log('📋 Lista de usuários:', usersData);
        return usersData;
      })();

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout loading users')), 15000)
      );

      const usersData = await Promise.race([loadPromise, timeoutPromise]) as any[];
      setUsers(usersData);
    } catch (error) {
      console.error('💥 Erro ao carregar usuários:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchUserHistory(userId: string) {
    setLoadingHistory(true);
    const { data } = await supabase
      .from('user_activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    setHistory(data || []);
    setLoadingHistory(false);
  }

  useEffect(() => {
    async function fetchFeedbacks() {
      try {
        console.log('Carregando feedbacks...');
        
        const { data: feedbacksData, error } = await supabase
          .from('feedbacks')
          .select('id, user_id, type, message, created_at')
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (error) {
          console.error('Erro ao buscar feedbacks:', error);
          return;
        }
        
        if (feedbacksData && feedbacksData.length > 0) {
          const userIds = feedbacksData.map(f => f.user_id);
          const { data: profiles, error: profilesError } = await supabase
            .from('perfis')
            .select('user_id, full_name, email')
            .in('user_id', userIds);
          
          if (profilesError) {
            console.error('Erro ao buscar perfis dos feedbacks:', profilesError);
          }
          
          const userMap = Object.fromEntries((profiles || []).map(p => [p.user_id, p.full_name || p.email || p.user_id]));
          setFeedbacks(feedbacksData.map(f => ({ ...f, userName: userMap[f.user_id] || f.user_id })));
          
          console.log('Feedbacks carregados:', feedbacksData.length);
        } else {
          console.log('Nenhum feedback encontrado');
          setFeedbacks([]);
        }
      } catch (error) {
        console.error('Erro ao carregar feedbacks:', error);
      }
    }
    fetchFeedbacks();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesPlan = filterPlan ? u.plan === filterPlan : true;
    const matchesStatus = filterStatus ? u.status === filterStatus : true;
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE) || 1;
  const paginatedUsers = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function openEditModal(user: any) {
    setEditUser(user);
    setEditData({ 
      name: user.name || '',
      email: user.email || '',
      plan: user.plan || '',
      celular: user.celular || '',
      escola: user.escola || '',
    });
  }
  
  function closeEditModal() {
    setEditUser(null);
    setEditData({
      name: '',
      email: '',
      plan: '' as 'gratuito' | 'professor' | 'grupo_escolar' | 'admin',
      celular: '',
      escola: ''
    });
  }

  // Funções para modal de alteração de senha
  function openPasswordModal() {
    setShowPasswordModal(true);
    setPasswordData({
      newPassword: '',
      confirmPassword: ''
    });
  }

  function closePasswordModal() {
    setShowPasswordModal(false);
    setPasswordData({
      newPassword: '',
      confirmPassword: ''
    });
  }

  function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  async function changePassword() {
    if (!editUser) return;

    // Validações
    if (!passwordData.newPassword.trim()) {
      toast({
        title: "Senha obrigatória",
        description: "Por favor, digite uma nova senha.",
        variant: "destructive"
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive"
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "A confirmação de senha deve ser igual à nova senha.",
        variant: "destructive"
      });
      return;
    }

    setChangingPassword(true);
    try {
      console.log('🔐 Alterando senha do usuário:', editUser.id);
      
      const { error } = await supabase.auth.admin.updateUserById(
        editUser.id,
        { password: passwordData.newPassword }
      );

      if (error) {
        console.error('❌ Erro ao alterar senha:', error);
        toast({
          title: "Erro ao alterar senha",
          description: error.message || "Não foi possível alterar a senha. Tente novamente.",
          variant: "destructive"
        });
      } else {
        console.log('✅ Senha alterada com sucesso');
        toast({
          title: "Senha alterada",
          description: "A senha do usuário foi alterada com sucesso!",
        });
        closePasswordModal();
      }
    } catch (error) {
      console.error('💥 Erro inesperado ao alterar senha:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setChangingPassword(false);
    }
  }
  
  function handleEditChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  }
  
  async function saveEdit() {
    setSaving(true);
    try {
      console.log('💾 Salvando dados do usuário:', editData);
      
      // Preparar dados para atualização do perfil
      const profileUpdateData = {
        full_name: editData.name,
        email: editData.email,
        plano_ativo: editData.plan,
        celular: editData.celular,
        escola: editData.escola,
        updated_at: new Date().toISOString(),
      };
      
      // Atualizar perfil
      const { error: updateError } = await supabase
        .from('perfis')
        .update(profileUpdateData)
        .eq('user_id', editUser.id);
      
      if (updateError) {
        console.error('❌ Erro ao atualizar usuário:', updateError);
        toast({
          title: "Erro ao atualizar usuário",
          description: "Não foi possível atualizar os dados. Tente novamente.",
          variant: "destructive"
        });
        return;
      }
      
      console.log('✅ Usuário atualizado com sucesso');
      toast({
        title: "Usuário atualizado",
        description: "Os dados do usuário foram atualizados com sucesso!",
      });
    } catch (error) {
      console.error('💥 Erro ao salvar dados:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
      closeEditModal();
      fetchUsers();
    }
  }

  function openHistoryModal(user: any) {
    setHistoryUser(user);
    fetchUserHistory(user.id);
  }
  
  function closeHistoryModal() {
    setHistoryUser(null);
    setHistory([]);
  }

  const filteredFeedbacks = feedbacks.filter(f => {
    const matchesSearch =
      f.userName.toLowerCase().includes(feedbackSearch.toLowerCase()) ||
      f.message.toLowerCase().includes(feedbackSearch.toLowerCase());
    const matchesType = feedbackTypeFilter ? f.type === feedbackTypeFilter : true;
    return matchesSearch && matchesType;
  });

  async function handleDeleteFeedback(id: string) {
    if (!confirm('Tem certeza que deseja excluir este feedback?')) {
      return;
    }

    try {
      console.log('🗑️ Excluindo feedback:', id);
      
      const { error } = await supabase
        .from('feedbacks')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Erro ao excluir feedback:', error);
        toast({
          title: "Erro ao excluir feedback",
          description: "Não foi possível excluir o feedback. Tente novamente.",
          variant: "destructive"
        });
      } else {
        console.log('✅ Feedback excluído com sucesso');
        setFeedbacks(feedbacks.filter(f => f.id !== id));
        toast({
          title: "Feedback excluído",
          description: "O feedback foi excluído com sucesso!",
        });
      }
    } catch (error) {
      console.error('💥 Erro inesperado ao excluir feedback:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive"
      });
    }
  }

  async function handleDeleteUser(userId: string) {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) {
      return;
    }

    try {
      console.log('🗑️ Excluindo usuário:', userId);
      
      const { error } = await supabase
        .from('perfis')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Erro ao excluir usuário:', error);
        toast({
          title: "Erro ao excluir usuário",
          description: "Não foi possível excluir o usuário. Tente novamente.",
          variant: "destructive"
        });
      } else {
        console.log('✅ Usuário excluído com sucesso');
        setUsers(users.filter(u => u.id !== userId));
        toast({
          title: "Usuário excluído",
          description: "O usuário foi excluído com sucesso!",
        });
      }
    } catch (error) {
      console.error('💥 Erro inesperado ao excluir usuário:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive"
      });
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Gerenciamento de Usuários
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Visualize, filtre, pesquise e edite os dados dos usuários e suas assinaturas de forma intuitiva e eficiente.
          </p>
        </div>

        {/* Feedbacks Section */}
        <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-xl">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-6 h-6" />
              <div>
                <CardTitle className="text-xl">Feedbacks dos Usuários</CardTitle>
                <CardDescription className="text-blue-100">
                  Últimos comentários e sugestões recebidos
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {/* Filtros de Feedback */}
            <div className="mb-6 space-y-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar por nome ou e-mail do usuário..."
                    value={feedbackSearch}
                    onChange={e => setFeedbackSearch(e.target.value)}
                    className="pl-10 h-10 border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                  />
                </div>
                <div className="flex gap-3">
                  <select 
                    value={feedbackTypeFilter} 
                    onChange={e => setFeedbackTypeFilter(e.target.value)}
                    className="px-4 h-10 border-2 border-gray-200 rounded-lg focus:border-blue-500 bg-white min-w-[150px]"
                  >
                    <option value="">Todos os Tipos</option>
                    <option value="sugestao">Sugestão</option>
                    <option value="reclamacao">Reclamação</option>
                    <option value="elogio">Elogio</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4 max-h-64 overflow-y-auto">
              {filteredFeedbacks.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {feedbacks.length === 0 ? 'Nenhum feedback enviado ainda.' : 'Nenhum feedback encontrado com os filtros aplicados.'}
                  </p>
                </div>
              ) : (
                filteredFeedbacks.map(f => (
                  <div key={f.id} className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-20 flex items-center justify-center">
                        <Badge 
                          className={`w-full justify-center ${
                            f.type === 'elogio' 
                              ? 'bg-green-100 text-green-700 border-green-200' 
                              : f.type === 'reclamacao' 
                              ? 'bg-red-100 text-red-700 border-red-200' 
                              : 'bg-blue-100 text-blue-700 border-blue-200'
                          } font-semibold text-xs`}
                        >
                          {f.type === 'sugestao' ? 'Sugestão' : 
                           f.type === 'reclamacao' ? 'Reclamação' : 
                           f.type === 'elogio' ? 'Elogio' : f.type}
                        </Badge>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-800 mb-1 truncate">{f.userName}</div>
                        <div className="text-gray-600 text-sm mb-2 break-words">{f.message}</div>
                        <div className="text-xs text-gray-400">
                          {new Date(f.created_at).toLocaleString('pt-BR')}
                        </div>
                      </div>
                      <div className="flex-shrink-0 flex items-center">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                          title="Excluir feedback"
                          onClick={() => handleDeleteFeedback(f.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nome ou e-mail..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-10 h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                />
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select 
                    value={filterPlan} 
                    onChange={e => { setFilterPlan(e.target.value); setPage(1); }}
                    className="pl-10 pr-8 h-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 bg-white min-w-[180px]"
                  >
                    <option value="">Todos os Planos</option>
                    {planOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
                <select 
                  value={filterStatus} 
                  onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
                  className="px-4 h-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 bg-white min-w-[150px]"
                >
                  <option value="">Todos os Status</option>
                  {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-slate-50 to-gray-50 border-b-2">
                <TableHead className="font-bold text-gray-700">Nome</TableHead>
                <TableHead className="font-bold text-gray-700">E-mail</TableHead>
                <TableHead className="font-bold text-gray-700">Plano</TableHead>
                <TableHead className="font-bold text-gray-700">Status</TableHead>
                <TableHead className="font-bold text-gray-700">Cadastro</TableHead>
                <TableHead className="font-bold text-gray-700">Pagamento</TableHead>
                <TableHead className="font-bold text-gray-700 text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="text-gray-500">Carregando usuários...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhum usuário encontrado.</p>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user, idx) => (
                  <TableRow key={user.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                          {user.avatar_url ? (
                            <img 
                              src={user.avatar_url} 
                              alt={user.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`w-full h-full flex items-center justify-center text-blue-600 font-semibold text-sm ${user.avatar_url ? 'hidden' : ''}`}>
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{user.name}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">{user.email}</TableCell>
                    <TableCell>
                      <Badge className={`font-semibold ${
                        user.isAdmin 
                          ? 'bg-orange-100 text-orange-800 border-orange-200' 
                          : user.plan === 'professor' 
                          ? 'bg-blue-100 text-blue-800 border-blue-200' 
                          : user.plan === 'grupo_escolar' 
                          ? 'bg-green-100 text-green-800 border-green-200' 
                          : 'bg-gray-100 text-gray-700 border-gray-200'
                      }`}>
                        {user.isAdmin ? 'Admin' : planLabels[user.plan]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`flex items-center gap-1 font-semibold ${
                        user.status === 'ativo' 
                          ? 'bg-green-100 text-green-800 border-green-200' 
                          : 'bg-gray-100 text-gray-500 border-gray-200'
                      }`}>
                        {user.status === 'ativo' ? <UserCheck size={14} /> : <UserX size={14} />}
                        {user.status === 'ativo' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">{user.createdAt}</TableCell>
                    <TableCell>
                      {user.paymentDue ? (
                        <Badge className={`${user.paymentBadge} flex items-center gap-1 font-semibold`}>
                          <Clock size={14} />
                          <span>{user.paymentDue}</span>
                          <span className="ml-1">({user.paymentStatus})</span>
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-700 border-gray-200 font-semibold">
                          Gratuito
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex gap-2 justify-center">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 border-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                          title="Editar"
                          onClick={() => openEditModal(user)}
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 border-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                          title="Histórico"
                          onClick={() => openHistoryModal(user)}
                        >
                          <Clock size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                          title="Excluir usuário"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex justify-between items-center p-6 bg-gradient-to-r from-slate-50 to-gray-50 border-t-2">
            <span className="text-sm text-gray-600 font-medium">
              Página {page} de {totalPages} • {filteredUsers.length} usuários
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(1)}
                className="border-2"
              >
                <ChevronLeft size={16} />
                <ChevronLeft size={16} className="-ml-2" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="border-2"
              >
                <ChevronLeft size={16} />
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="border-2"
              >
                <ChevronRight size={16} />
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page === totalPages}
                onClick={() => setPage(totalPages)}
                className="border-2"
              >
                <ChevronRight size={16} />
                <ChevronRight size={16} className="-mr-2" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Edit Modal */}
        <Dialog open={!!editUser} onOpenChange={closeEditModal}>
          <DialogContent className="sm:max-w-2xl rounded-2xl border-0 shadow-2xl">
            <DialogHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-6 -m-6 mb-6 rounded-t-2xl">
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Pencil className="w-5 h-5" />
                Editar Usuário
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 p-2">
              {/* Grid responsivo - 2 colunas no desktop, 1 no mobile */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Coluna 1 */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Nome</label>
                    <Input
                      name="name"
                      value={editData.name || ''}
                      onChange={handleEditChange}
                      className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">E-mail</label>
                    <Input
                      name="email"
                      value={editData.email || ''}
                      onChange={handleEditChange}
                      className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Celular</label>
                    <Input
                      name="celular"
                      value={editData.celular || ''}
                      onChange={handleEditChange}
                      className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>
                
                {/* Coluna 2 */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Escola</label>
                    <Input
                      name="escola"
                      value={editData.escola || ''}
                      onChange={handleEditChange}
                      className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                      placeholder="Nome da escola"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Plano</label>
                    <select
                      name="plan"
                      value={editData.plan || ''}
                      onChange={handleEditChange}
                      className="w-full h-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 bg-white px-3"
                    >
                      {planOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Alterar Senha</label>
                    <Button
                      variant="outline"
                      className="w-full h-12 border-2 border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300"
                      onClick={openPasswordModal}
                    >
                      <Lock size={16} className="mr-2" />
                      Alterar Senha
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={closeEditModal} className="h-12 px-6 border-2">
                Cancelar
              </Button>
              <Button
                onClick={saveEdit}
                disabled={saving}
                className="h-12 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    Salvar
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Password Modal */}
        <Dialog open={showPasswordModal} onOpenChange={closePasswordModal}>
          <DialogContent className="sm:max-w-md rounded-2xl border-0 shadow-2xl">
            <DialogHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-6 -m-6 mb-6 rounded-t-2xl">
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Alterar Senha de {editUser?.name || editUser?.email}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 p-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Nova Senha</label>
                <Input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Confirmar Nova Senha</label>
                <Input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={closePasswordModal} className="h-12 px-6 border-2">
                Cancelar
              </Button>
              <Button
                onClick={changePassword}
                disabled={changingPassword}
                className="h-12 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {changingPassword ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Alterando...
                  </>
                ) : (
                  <>
                    <Lock size={16} className="mr-2" />
                    Alterar Senha
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* History Modal */}
        <Dialog open={!!historyUser} onOpenChange={closeHistoryModal}>
          <DialogContent className="max-w-4xl rounded-2xl border-0 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="bg-gradient-to-r from-gray-600 to-slate-600 text-white p-6 -m-6 mb-6 rounded-t-2xl">
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Histórico de {historyUser?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-auto">
              {loadingHistory ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-500">Carregando histórico...</span>
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhuma atividade encontrada.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-slate-50 to-gray-50">
                      <TableHead className="font-bold">Data</TableHead>
                      <TableHead className="font-bold">Tipo</TableHead>
                      <TableHead className="font-bold">Título</TableHead>
                      <TableHead className="font-bold">Descrição</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((h, idx) => (
                      <TableRow key={h.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <TableCell className="text-sm">
                          {new Date(h.created_at).toLocaleString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                            {h.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{h.title}</TableCell>
                        <TableCell className="text-gray-600">{h.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
