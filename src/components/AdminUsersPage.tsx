import React, { useEffect, useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Pencil, Save, X, ChevronLeft, ChevronRight, UserCheck, UserX, Clock, Search, Filter, Users, TrendingUp, MessageSquare, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
  const [editUser, setEditUser] = useState<any | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [filterPlan, setFilterPlan] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [historyUser, setHistoryUser] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);

  async function fetchUsers() {
    setLoading(true);
    
    // Buscar dados da tabela perfis com todos os campos necessários
    const { data: perfis } = await supabase
      .from('perfis')
      .select('user_id, nome_preferido, full_name, email, plano_ativo, created_at');
    
    // Buscar dados dos planos
    const { data: plans } = await supabase
      .from('planos_usuarios')
      .select('user_id, plano_ativo, data_expiracao, updated_at');
    
    // Combinar os dados
    const usersData = perfis?.map((perfil: any) => {
      const plano = plans?.find((pl: any) => pl.user_id === perfil.user_id);
      
      let paymentStatus = 'em dia';
      let paymentBadge = 'bg-green-100 text-green-800';
      let paymentDue = null;
      if (plano?.data_expiracao) {
        const exp = new Date(plano.data_expiracao);
        paymentDue = exp.toLocaleDateString('pt-BR');
        if (exp < new Date()) {
          paymentStatus = 'atrasado';
          paymentBadge = 'bg-red-100 text-red-800';
        }
      }
      
      return {
        id: perfil.user_id,
        name: perfil.nome_preferido || perfil.full_name || 'Usuário',
        email: perfil.email || '',
        plan: perfil.plano_ativo || plano?.plano_ativo || 'gratuito',
        createdAt: perfil.created_at ? perfil.created_at.split('T')[0] : '',
        status: 'ativo',
        isAdmin: perfil.email === 'medtosdigital@gmail.com',
        paymentStatus,
        paymentBadge,
        paymentDue,
      };
    }) || [];
    
    setUsers(usersData);
    setLoading(false);
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
      const { data: feedbacksData, error } = await supabase
        .from('feedbacks')
        .select('id, user_id, type, message, created_at')
        .order('created_at', { ascending: false })
        .limit(10);
      if (feedbacksData) {
        const userIds = feedbacksData.map(f => f.user_id);
        const { data: perfis } = await supabase
          .from('perfis')
          .select('user_id, nome_preferido')
          .in('user_id', userIds);
        const userMap = Object.fromEntries((perfis || []).map(p => [p.user_id, p.nome_preferido || 'Usuário']));
        setFeedbacks(feedbacksData.map(f => ({ ...f, userName: userMap[f.user_id] || f.user_id })));
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
    setEditData({ ...user });
  }
  
  function closeEditModal() {
    setEditUser(null);
    setEditData({});
  }
  
  function handleEditChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  }
  
  async function saveEdit() {
    setSaving(true);
    
    // Atualizar nome na tabela perfis
    await supabase.from('perfis').update({
      nome_preferido: editData.name,
      full_name: editData.name,
      email: editData.email,
    }).eq('user_id', editUser.id);
    
    // Atualizar plano na tabela planos_usuarios
    await supabase.from('planos_usuarios').update({
      plano_ativo: editData.plan,
      updated_at: new Date().toISOString(),
    }).eq('user_id', editUser.id);
    
    setSaving(false);
    closeEditModal();
    fetchUsers();
  }

  function openHistoryModal(user: any) {
    setHistoryUser(user);
    fetchUserHistory(user.id);
  }
  
  function closeHistoryModal() {
    setHistoryUser(null);
    setHistory([]);
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
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {feedbacks.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum feedback enviado ainda.</p>
                </div>
              ) : (
                feedbacks.map(f => (
                  <div key={f.id} className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200">
                    <div className="flex items-start gap-3">
                      <Badge 
                        className={`${
                          f.type === 'elogio' 
                            ? 'bg-green-100 text-green-700 border-green-200' 
                            : f.type === 'reclamacao' 
                            ? 'bg-red-100 text-red-700 border-red-200' 
                            : 'bg-blue-100 text-blue-700 border-blue-200'
                        } font-semibold`}
                      >
                        {f.type}
                      </Badge>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800 mb-1">{f.userName}</div>
                        <div className="text-gray-600 text-sm mb-2">{f.message}</div>
                        <div className="text-xs text-gray-400">
                          {new Date(f.created_at).toLocaleString('pt-BR')}
                        </div>
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
                  <TableRow key={user.id} className={`hover:bg-blue-50/50 transition-colors ${idx % 2 === 0 ? 'bg-white/50' : 'bg-slate-50/30'}`}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {user.isAdmin && (
                          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-0 text-xs font-bold">
                            Admin
                          </Badge>
                        )}
                        <span className="text-gray-900">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">{user.email}</TableCell>
                    <TableCell>
                      <Badge className={`font-semibold ${
                        user.plan === 'professor' 
                          ? 'bg-blue-100 text-blue-800 border-blue-200' 
                          : user.plan === 'grupo_escolar' 
                          ? 'bg-green-100 text-green-800 border-green-200' 
                          : 'bg-gray-100 text-gray-700 border-gray-200'
                      }`}>
                        {planLabels[user.plan]}
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
          <DialogContent className="sm:max-w-md rounded-2xl border-0 shadow-2xl">
            <DialogHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-6 -m-6 mb-6 rounded-t-2xl">
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Pencil className="w-5 h-5" />
                Editar Usuário
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 p-2">
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
