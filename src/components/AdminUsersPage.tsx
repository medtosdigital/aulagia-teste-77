import React, { useEffect, useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Pencil, Save, X, ChevronLeft, ChevronRight, UserCheck, UserX, Clock } from 'lucide-react';
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
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email, created_at');
    const { data: plans } = await supabase
      .from('planos_usuarios')
      .select('user_id, plano_ativo, data_expiracao, updated_at');
    // Simular status (pode ser expandido depois)
    const usersData = profiles.map((p: any) => {
      const plano = plans.find((pl: any) => pl.user_id === p.id);
      // Status de pagamento
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
        id: p.id,
        name: p.full_name || '',
        email: p.email || '',
        plan: plano?.plano_ativo || 'gratuito',
        createdAt: p.created_at ? p.created_at.split('T')[0] : '',
        status: 'ativo',
        isAdmin: p.email === 'medtosdigital@gmail.com',
        paymentStatus,
        paymentBadge,
        paymentDue,
      };
    });
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

  // Buscar feedbacks reais do Supabase
  useEffect(() => {
    async function fetchFeedbacks() {
      const { data: feedbacksData, error } = await supabase
        .from('feedbacks')
        .select('id, user_id, type, message, created_at')
        .order('created_at', { ascending: false })
        .limit(10);
      if (feedbacksData) {
        // Buscar perfis dos usuários
        const userIds = feedbacksData.map(f => f.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds);
        const userMap = Object.fromEntries((profiles || []).map(p => [p.id, p.full_name || p.email || p.id]));
        setFeedbacks(feedbacksData.map(f => ({ ...f, userName: userMap[f.user_id] || f.user_id })));
      }
    }
    fetchFeedbacks();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtros e busca
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesPlan = filterPlan ? u.plan === filterPlan : true;
    const matchesStatus = filterStatus ? u.status === filterStatus : true;
    return matchesSearch && matchesPlan && matchesStatus;
  });

  // Paginação
  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE) || 1;
  const paginatedUsers = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Modal de edição
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
    await supabase.from('profiles').update({
      full_name: editData.name,
      email: editData.email,
    }).eq('id', editUser.id);
    await supabase.from('planos_usuarios').update({
      plano_ativo: editData.plan,
      updated_at: new Date().toISOString(),
    }).eq('user_id', editUser.id);
    setSaving(false);
    closeEditModal();
    fetchUsers();
  }

  // Modal de histórico
  function openHistoryModal(user: any) {
    setHistoryUser(user);
    fetchUserHistory(user.id);
  }
  function closeHistoryModal() {
    setHistoryUser(null);
    setHistory([]);
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Gerenciamento de Usuários</h1>
      <p className="text-gray-600 mb-6">Visualize, filtre, pesquise e edite os dados dos usuários e suas assinaturas.</p>
      {/* No topo da página, exibir painel de feedbacks */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-blue-700 mb-2">Feedbacks dos Usuários</h2>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-2 max-h-64 overflow-y-auto">
          {feedbacks.length === 0 ? (
            <div className="text-gray-400 text-sm">Nenhum feedback enviado ainda.</div>
          ) : feedbacks.map(f => (
            <div key={f.id} className="border-b last:border-b-0 pb-2 mb-2 last:mb-0 flex items-start gap-3">
              <div className={`rounded px-2 py-1 text-xs font-bold ${f.type === 'elogio' ? 'bg-green-100 text-green-700' : f.type === 'reclamacao' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{f.type}</div>
              <div className="flex-1">
                <div className="font-semibold text-gray-800">{f.userName}</div>
                <div className="text-gray-600 text-sm">{f.message}</div>
                <div className="text-xs text-gray-400">{new Date(f.created_at).toLocaleString('pt-BR')}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-end gap-2 mb-4">
        <Input
          placeholder="Buscar por nome ou e-mail..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full sm:w-64"
        />
        <select value={filterPlan} onChange={e => { setFilterPlan(e.target.value); setPage(1); }} className="border rounded px-2 py-2 text-sm">
          <option value="">Todos os Planos</option>
          {planOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} className="border rounded px-2 py-2 text-sm">
          <option value="">Todos os Status</option>
          {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>
      <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Nome</th>
              <th className="px-4 py-3 text-left font-semibold">E-mail</th>
              <th className="px-4 py-3 text-left font-semibold">Plano</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-left font-semibold">Cadastro</th>
              <th className="px-4 py-3 text-left font-semibold">Pagamento</th>
              <th className="px-4 py-3 text-center font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-8">Carregando...</td></tr>
            ) : paginatedUsers.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8">Nenhum usuário encontrado.</td></tr>
            ) : paginatedUsers.map((user, idx) => (
              <tr key={user.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-blue-50'}>
                <td className="px-4 py-2 font-medium flex items-center gap-2">
                  {user.isAdmin && <Badge className="bg-yellow-100 text-yellow-800 mr-1">Admin</Badge>}
                  {user.name}
                </td>
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2">
                  <Badge className={user.plan === 'professor' ? 'bg-blue-100 text-blue-800' : user.plan === 'grupo_escolar' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}>
                    {planLabels[user.plan]}
                  </Badge>
                </td>
                <td className="px-4 py-2">
                  <Badge className={user.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}>
                    {user.status === 'ativo' ? <UserCheck size={14} className="inline mr-1" /> : <UserX size={14} className="inline mr-1" />}
                    {user.status === 'ativo' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </td>
                <td className="px-4 py-2">{user.createdAt}</td>
                <td className="px-4 py-2">
                  {user.paymentDue ? (
                    <Badge className={user.paymentBadge + ' flex items-center gap-1'}>
                      <Clock size={14} /> {user.paymentDue} <span className="ml-1">({user.paymentStatus})</span>
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-700">Gratuito</Badge>
                  )}
                </td>
                <td className="px-4 py-2 text-center flex gap-2 justify-center">
                  <Button size="icon" variant="ghost" title="Editar" onClick={() => openEditModal(user)}>
                    <Pencil size={18} />
                  </Button>
                  <Button size="icon" variant="ghost" title="Histórico" onClick={() => openHistoryModal(user)}>
                    <Clock size={18} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Paginação */}
      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-gray-500">Página {page} de {totalPages}</span>
        <div className="flex gap-2">
          <Button size="icon" variant="ghost" disabled={page === 1} onClick={() => setPage(1)}><ChevronLeft size={18} /></Button>
          <Button size="icon" variant="ghost" disabled={page === 1} onClick={() => setPage(page - 1)}><ChevronLeft size={18} className="-ml-2" /></Button>
          <Button size="icon" variant="ghost" disabled={page === totalPages} onClick={() => setPage(page + 1)}><ChevronRight size={18} className="-mr-2" /></Button>
          <Button size="icon" variant="ghost" disabled={page === totalPages} onClick={() => setPage(totalPages)}><ChevronRight size={18} /></Button>
        </div>
      </div>
      {/* Modal de edição */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md relative animate-fade-in">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={closeEditModal}><X size={20} /></button>
            <h2 className="text-xl font-bold mb-4">Editar Usuário</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Nome</label>
                <Input name="name" value={editData.name} onChange={handleEditChange} autoFocus />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">E-mail</label>
                <Input name="email" value={editData.email} onChange={handleEditChange} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Plano</label>
                <select name="plan" value={editData.plan} onChange={handleEditChange} className="border rounded px-2 py-2 w-full">
                  {planOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              {/* Permissões especiais futuras aqui */}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="ghost" onClick={closeEditModal}>Cancelar</Button>
              <Button onClick={saveEdit} disabled={saving} className="bg-blue-600 text-white hover:bg-blue-700">{saving ? 'Salvando...' : 'Salvar'}</Button>
            </div>
          </div>
        </div>
      )}
      {/* Modal de histórico */}
      {historyUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl relative animate-fade-in max-h-[90vh] overflow-y-auto">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={closeHistoryModal}><X size={20} /></button>
            <h2 className="text-xl font-bold mb-4">Histórico de {historyUser.name}</h2>
            {loadingHistory ? (
              <div className="text-center py-8">Carregando histórico...</div>
            ) : history.length === 0 ? (
              <div className="text-center py-8">Nenhuma atividade encontrada.</div>
            ) : (
              <table className="min-w-full text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-2 text-left">Data</th>
                    <th className="px-2 py-2 text-left">Tipo</th>
                    <th className="px-2 py-2 text-left">Título</th>
                    <th className="px-2 py-2 text-left">Descrição</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h, idx) => (
                    <tr key={h.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-2 py-1">{new Date(h.created_at).toLocaleString('pt-BR')}</td>
                      <td className="px-2 py-1">{h.type}</td>
                      <td className="px-2 py-1">{h.title}</td>
                      <td className="px-2 py-1">{h.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 