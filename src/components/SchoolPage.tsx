import React, { useState, useEffect } from 'react';
import { Users, BookOpen, FileText, Award, Plus, Search, Filter, Eye, Edit, Trash2, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { userMaterialsService } from '@/services/userMaterialsService';
import ViewMaterialsModal from './modals/ViewMaterialsModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { planPermissionsService } from '@/services/planPermissionsService';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Dialog as UIDialog, DialogContent as UIDialogContent, DialogHeader as UIDialogHeader, DialogTitle as UIDialogTitle, DialogFooter as UIDialogFooter } from '@/components/ui/dialog';
import { useSupabasePlanPermissions } from '@/hooks/useSupabasePlanPermissions';

interface Teacher {
  id: string;
  name: string;
  email: string;
  subject: string;
  grade: string;
  materialsCount: number;
  materialLimit?: number;
  avatar_url?: string;
}

const SchoolPage: React.FC = () => {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editLimitsOpen, setEditLimitsOpen] = useState(false);
  const [editingLimits, setEditingLimits] = useState<Teacher[] | null>(null);
  const { toast } = useToast();
  const [addTeacherOpen, setAddTeacherOpen] = useState(false);
  const [addTeacherLoading, setAddTeacherLoading] = useState(false);
  const [addTeacherForm, setAddTeacherForm] = useState({ email: '' });
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [pendingInvites, setPendingInvites] = useState<{ email: string }[]>([]);
  const navigate = useNavigate();
  const [editUserLimit, setEditUserLimit] = useState<{ teacher: Teacher, value: number } | null>(null);
  const [planoInfo, setPlanoInfo] = useState<{ nome: string, status: string, dataExpiracao: string } | null>(null);
  const { canAccessSchool, loading: planLoading, currentPlan } = useSupabasePlanPermissions();

  useEffect(() => {
    console.log('currentPlan:', currentPlan);
  }, [currentPlan]);

  useEffect(() => {
    if (!planLoading && currentPlan && currentPlan.plano_ativo !== 'grupo_escolar' && currentPlan.plano_ativo !== 'admin') {
      navigate('/dashboard', { replace: true });
    }
  }, [planLoading, currentPlan, navigate]);

  useEffect(() => {
    loadTeachers();
  }, []);

  useEffect(() => {
    filterTeachers();
  }, [teachers, searchTerm, filterSubject]);

  useEffect(() => {
    loadPendingInvites();
  }, []);

  useEffect(() => {
    const fetchPlano = async () => {
      if (!user?.id) return;
      const { data } = await supabase
        .from('perfis')
        .select('plano_ativo, data_expiracao_plano')
        .eq('user_id', user.id)
        .single();
      if (data) {
        setPlanoInfo({
          nome: data.plano_ativo === 'grupo_escolar' ? 'Plano Escola Premium' : data.plano_ativo,
          status: 'Ativo',
          dataExpiracao: data.data_expiracao_plano ? new Date(data.data_expiracao_plano).toLocaleDateString('pt-BR') : '--/--/----',
        });
      }
    };
    fetchPlano();
  }, [user]);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      
      // Get all users from perfis
      const { data: perfis, error } = await supabase
        .from('perfis')
        .select('*');

      if (error) {
        console.error('Error loading perfis:', error);
        return;
      }

      if (!perfis) {
        setTeachers([]);
        return;
      }

      // Load material counts for each teacher
      const teachersWithCounts = await Promise.all(
        perfis.map(async (perfil) => {
          try {
            const materials = await userMaterialsService.getMaterialsByUser(perfil.user_id);
            const materialsCount = materials ? materials.length : 0;

            return {
              id: perfil.user_id,
              name: perfil.full_name || perfil.email || 'Professor',
              email: perfil.email || '',
              avatar_url: perfil.avatar_url || '',
              subject: 'Multidisciplinar',
              grade: 'Todas as séries',
              materialsCount,
              materialLimit: 300 // Assuming a default limit of 300 materials
            };
          } catch (error) {
            console.error(`Error loading materials for user ${perfil.user_id}:`, error);
            return {
              id: perfil.user_id,
              name: perfil.full_name || perfil.email || 'Professor',
              email: perfil.email || '',
              avatar_url: perfil.avatar_url || '',
              subject: 'Multidisciplinar',
              grade: 'Todas as séries',
              materialsCount: 0,
              materialLimit: 300 // Assuming a default limit of 300 materials
            };
          }
        })
      );

      setTeachers(teachersWithCounts);
    } catch (error) {
      console.error('Error loading teachers:', error);
      setTeachers([]);
      toast({ title: 'Erro ao carregar professores', description: 'Não foi possível carregar os dados dos professores. Tente novamente mais tarde.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const filterTeachers = () => {
    let filtered = teachers;

    if (searchTerm) {
      filtered = filtered.filter(teacher => 
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterSubject !== 'all') {
      filtered = filtered.filter(teacher => 
        teacher.subject.toLowerCase() === filterSubject.toLowerCase()
      );
    }

    setFilteredTeachers(filtered);
  };

  const handleViewMaterials = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setModalOpen(true);
  };

  const uniqueSubjects = [...new Set(teachers.map(t => t.subject))];

  // Função utilitária para validar e-mail
  function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Carregar convites pendentes ao carregar professores
  const loadPendingInvites = async () => {
    const { data, error } = await supabase.from('invites').select('email').eq('plan', 'grupo_escolar').eq('status', 'pending');
    if (!error && data) setPendingInvites(data);
  };

  // Atualizar convites ao convidar
  const handleInviteTeacher = async () => {
    setAddTeacherLoading(true);
    setInviteSuccess(false);
    try {
      if (!isValidEmail(addTeacherForm.email)) {
        toast({ title: 'E-mail inválido', description: 'Digite um e-mail válido.', variant: 'destructive' });
        setAddTeacherLoading(false);
        return;
      }
      // Checar se já existe usuário com esse e-mail (opcional)
      const { data: existing, error: checkError } = await supabase.from('perfis').select('user_id').eq('email', addTeacherForm.email).single();
      if (existing) {
        toast({ title: 'Usuário já cadastrado', description: 'Este e-mail já está em uso.', variant: 'destructive' });
        setAddTeacherLoading(false);
        return;
      }
      // Registrar convite na tabela 'invites'
      await supabase.from('invites').insert([
        { email: addTeacherForm.email, plan: 'grupo_escolar', status: 'pending', invited_at: new Date().toISOString() }
      ]);
      // Enviar magic link
      const { error: magicError } = await supabase.auth.signInWithOtp({
        email: addTeacherForm.email,
        options: {
          emailRedirectTo: `${window.location.origin}/onboarding?plan=grupo_escolar`
        }
      });
      if (magicError) {
        toast({ title: 'Erro ao enviar convite', description: magicError.message, variant: 'destructive' });
        setAddTeacherLoading(false);
        return;
      }
      setInviteSuccess(true);
      setAddTeacherForm({ email: '' });
      loadTeachers();
      loadPendingInvites();
    } catch (err) {
      toast({ title: 'Erro inesperado', description: String(err), variant: 'destructive' });
    } finally {
      setAddTeacherLoading(false);
    }
  };

  // Função para excluir convite e usuário fantasma (sem acesso)
  const handleRemoveInvite = async (email: string) => {
    // Excluir convite
    await supabase.from('invites').delete().eq('email', email).eq('plan', 'grupo_escolar').eq('status', 'pending');

    // Buscar usuário na tabela perfis
    const { data: userProfile } = await supabase.from('perfis').select('user_id').eq('email', email).single();

    if (userProfile && userProfile.user_id) {
      // Verificar se existe perfil completo
      const { data: perfil } = await supabase.from('perfis').select('id').eq('user_id', userProfile.user_id).single();
      // Se NÃO houver perfil, pode excluir o usuário "fantasma"
      if (!perfil) {
        // Não podemos excluir diretamente do auth, mas podemos marcar como inativo
        await supabase.from('perfis').update({ plano_ativo: 'gratuito' }).eq('user_id', userProfile.user_id);
      }
    }

    loadPendingInvites();
    loadTeachers();
  };

  // Função para remover professor ativo do grupo escolar
  const handleRemoveTeacher = async (teacherId: string) => {
    // Remover vínculo do grupo escolar
    await supabase.from('membros_grupo_escolar').delete().eq('user_id', teacherId);
    // Atualizar plano do usuário para gratuito
    await supabase.from('perfis').update({ plano_ativo: 'gratuito' }).eq('user_id', teacherId);
    loadTeachers();
  };

  // Função para atualizar limite individual no Supabase
  type UpdateLimitParams = { userId: string, grupoId: string, value: number };
  const updateUserMaterialLimit = async ({ userId, grupoId, value }: UpdateLimitParams) => {
    const { error } = await supabase
      .from('membros_grupo_escolar')
      .update({ limite_materiais: value })
      .eq('user_id', userId)
      .eq('grupo_id', grupoId);
    return !error;
  };

  // Função para obter grupo_id do owner
  const getGrupoId = async () => {
    const { data } = await supabase
      .from('grupos_escolares')
      .select('id')
      .eq('owner_id', user?.id)
      .single();
    return data?.id;
  };

  // Função para divisão automática dos limites
  const autoDistributeLimits = async () => {
    const grupoId = await getGrupoId();
    if (!grupoId) return;
    const activeTeachers = teachers;
    const autoLimit = Math.floor(300 / activeTeachers.length);
    await Promise.all(activeTeachers.map(async (t) => {
      await updateUserMaterialLimit({ userId: t.id, grupoId, value: autoLimit });
    }));
    loadTeachers();
    toast({ title: 'Limites redistribuídos', description: 'Os limites foram divididos igualmente.', variant: 'default' });
  };

  if (planLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando professores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-6 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-white drop-shadow">Grupo Escolar</h1>
            <p className="text-white/80 text-lg mt-2">Para grupos de professores e instituições de ensino</p>
            {/* Informações do plano */}
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-3 rounded-full"><Users className="w-7 h-7 text-white" /></div>
                <div>
                  <span className="text-lg font-bold text-white">Seu Plano Atual</span>
                  <span className="ml-2 px-2 py-1 rounded bg-green-200/80 text-green-900 text-xs font-semibold">{planoInfo?.status || '---'}</span>
                  <div className="text-white/80 text-sm">{planoInfo?.nome || '---'}</div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:ml-8">
                <span className="text-white/80 text-sm">Professores adicionados</span>
                <span className="font-bold text-white text-lg ml-2">{filteredTeachers.length}/5</span>
                <div className="w-32 h-2 bg-white/30 rounded-full overflow-hidden ml-2">
                  <div className="h-2 bg-green-400 rounded-full" style={{ width: `${(filteredTeachers.length/5)*100}%` }}></div>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:ml-8">
                <span className="text-white/80 text-sm">Próximo vencimento:</span>
                <span className="font-bold text-white text-lg">{planoInfo?.dataExpiracao || '--/--/----'}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-xl border-0">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-full"><Users className="h-7 w-7 text-blue-600" /></div>
              <div>
                <p className="text-sm text-gray-500">Total de Professores</p>
                <p className="text-2xl font-bold text-gray-900">{teachers.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-xl border-0">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-full"><BookOpen className="h-7 w-7 text-green-600" /></div>
              <div>
                <p className="text-sm text-gray-500">Total de Materiais</p>
                <p className="text-2xl font-bold text-gray-900">{teachers.reduce((total, teacher) => total + (teacher.materialsCount || 0), 0)}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-xl border-0">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-full"><Award className="h-7 w-7 text-purple-600" /></div>
              <div>
                <p className="text-sm text-gray-500">Professores Ativos</p>
                <p className="text-2xl font-bold text-gray-900">{teachers.filter(t => (t.materialsCount || 0) > 0).length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-xl border-0">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-orange-100 p-3 rounded-full"><FileText className="h-7 w-7 text-orange-600" /></div>
              <div>
                <p className="text-sm text-gray-500">Média por Professor</p>
                <p className="text-2xl font-bold text-gray-900">{teachers.length > 0 ? Math.round(teachers.reduce((total, teacher) => total + (teacher.materialsCount || 0), 0) / teachers.length) : 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2"><Users className="w-6 h-6 text-blue-600" /> Professores Adicionados</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeachers.length === 0 && pendingInvites.length === 0 && (
              <div className="col-span-full text-center text-gray-500 py-12">
                Nenhum professor adicionado ainda. Use o botão "Preencher Vaga" para convidar um professor ao grupo escolar.
              </div>
            )}
            {filteredTeachers.map(teacher => (
              <Card key={teacher.id} className="flex flex-row items-center gap-4 p-4 bg-white shadow-lg border-0 hover:shadow-2xl transition-all">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg overflow-hidden">
                  {teacher.avatar_url ? (
                    <img
                      src={teacher.avatar_url}
                      alt={teacher.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    teacher.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-lg truncate">{teacher.name}</h3>
                  <p className="text-sm text-gray-500 truncate">{teacher.email}</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <Badge className="bg-blue-100 text-blue-700 text-xs">{teacher.subject}</Badge>
                    <span className="text-xs text-gray-400">{teacher.grade}</span>
                    <Badge className="bg-green-100 text-green-700 text-xs">Materiais: {teacher.materialsCount || 0}</Badge>
                    <Badge className="bg-indigo-100 text-indigo-700 text-xs">Limite: {teacher.materialLimit ?? '--'}</Badge>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-xs font-bold ${teacher.materialsCount >= (teacher.materialLimit || 0) ? 'text-red-600' : 'text-green-600'}`}>{teacher.materialsCount}/{teacher.materialLimit ?? '--'}</span>
                  <Button variant="ghost" size="icon" onClick={() => setEditUserLimit({ teacher, value: teacher.materialLimit || 0 })}><Edit className="w-4 h-4 text-gray-400 hover:text-blue-600" /></Button>
                </div>
              </Card>
            ))}
            {/* Vagas disponíveis e pendentes */}
            {[
              ...pendingInvites,
              ...Array(Math.max(0, 5 - filteredTeachers.length - pendingInvites.length)).fill(null)
            ].map((invite, idx) => (
              invite ? (
                <Card key={`invite-${invite.email}`} className="flex flex-col items-center justify-center p-8 border-dashed border-2 border-blue-200 bg-blue-50/40 shadow-none">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2"><Plus className="w-6 h-6 text-blue-600" /></div>
                  <span className="text-gray-500 font-medium mb-2">Convite enviado</span>
                  <span className="text-xs text-gray-600 mb-2">{invite.email}</span>
                  <Button variant="outline" className="text-red-700 border-red-300 font-semibold" onClick={() => handleRemoveInvite(invite.email)}>Excluir Convite</Button>
                </Card>
              ) : (
                <Card key={`vaga-${idx}`} className="flex flex-col items-center justify-center p-8 border-dashed border-2 border-blue-200 bg-blue-50/40 shadow-none">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2"><Plus className="w-6 h-6 text-blue-600" /></div>
                  <span className="text-gray-500 font-medium mb-2">Vaga disponível</span>
                  <Button variant="outline" className="text-blue-700 border-blue-300 font-semibold" onClick={() => setAddTeacherOpen(true)}>Preencher Vaga</Button>
                </Card>
              )
            ))}
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4">
          <h3 className="text-2xl font-bold text-gray-800 mb-8 text-center">Benefícios do Plano Escola</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {teachers.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                Nenhum dado de professores encontrado. Verifique se há membros no grupo escolar ou tente recarregar a página.
              </div>
            )}
            <Card className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-md hover:shadow-xl transition">
              <div className="bg-blue-100 p-4 rounded-full mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <span className="font-bold text-lg text-gray-900 mb-2 text-center">Gestão de Professores</span>
              <span className="text-gray-500 text-center">Gerencie até 5 professores com acesso completo à plataforma, permissões personalizadas e acompanhamento de atividade.</span>
            </Card>
            <Card className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-md hover:shadow-xl transition">
              <div className="bg-green-100 p-4 rounded-full mb-4">
                <BookOpen className="w-8 h-8 text-green-600" />
              </div>
              <span className="font-bold text-lg text-gray-900 mb-2 text-center">Biblioteca de Materiais</span>
              <span className="text-gray-500 text-center">Acesso ilimitado a milhares de materiais pedagógicos prontos e ferramentas para criar seu próprio conteúdo.</span>
            </Card>
            <Card className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-md hover:shadow-xl transition">
              <div className="bg-purple-100 p-4 rounded-full mb-4">
                <Award className="w-8 h-8 text-purple-600" />
              </div>
              <span className="font-bold text-lg text-gray-900 mb-2 text-center">Relatórios de Desempenho</span>
              <span className="text-gray-500 text-center">Relatórios detalhados sobre o uso da plataforma, produção de materiais e engajamento dos professores.</span>
            </Card>
            <Card className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-md hover:shadow-xl transition">
              <div className="bg-yellow-100 p-4 rounded-full mb-4">
                <FileText className="w-8 h-8 text-yellow-600" />
              </div>
              <span className="font-bold text-lg text-gray-900 mb-2 text-center">Segurança de Dados</span>
              <span className="text-gray-500 text-center">Seus dados e conteúdos protegidos com criptografia de última geração e backups automáticos.</span>
            </Card>
            <Card className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-md hover:shadow-xl transition">
              <div className="bg-pink-100 p-4 rounded-full mb-4">
                <Award className="w-8 h-8 text-pink-600" />
              </div>
              <span className="font-bold text-lg text-gray-900 mb-2 text-center">Suporte Prioritário</span>
              <span className="text-gray-500 text-center">Atendimento rápido e dedicado para sua instituição, com tempo de resposta garantido de até 2 horas.</span>
            </Card>
          </div>
        </div>
      </div>

      <ViewMaterialsModal 
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedTeacher(null);
        }}
        teacher={selectedTeacher}
      />

      <Dialog open={editLimitsOpen} onOpenChange={setEditLimitsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Limite de Materiais</DialogTitle>
          </DialogHeader>
          <div className="py-2 text-gray-600 text-sm">
            Distribua o limite de <span className="font-bold text-blue-600">300 materiais</span> entre os professores. O total não pode ultrapassar 300.
          </div>
          <form
            onSubmit={e => {
              e.preventDefault();
              const total = filteredTeachers.reduce((sum, t) => sum + (t.materialLimit || 0), 0);
              if (total > 300) {
                toast({ title: 'Limite excedido', description: 'A soma dos limites não pode ultrapassar 300.', variant: 'destructive' });
                return;
              }
              // Montar objeto de distribuição
              const distribution = Object.fromEntries(filteredTeachers.map(t => [t.id, t.materialLimit || 0]));
              const ok = planPermissionsService.redistributeMaterialLimits(distribution);
              if (ok) {
                setEditLimitsOpen(false);
                toast({ title: 'Limites atualizados', description: 'A distribuição dos limites foi salva com sucesso.' });
                // Atualizar lista de professores (recarregar do serviço)
                loadTeachers();
              } else {
                toast({ title: 'Erro ao salvar', description: 'Não foi possível salvar a distribuição dos limites.', variant: 'destructive' });
              }
            }}
          >
            <div className="space-y-4 max-h-72 overflow-y-auto py-2">
              {filteredTeachers.map((teacher, idx) => (
                <div key={teacher.id} className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-gray-800 truncate">{teacher.name}</span>
                    <span className="ml-2 text-xs text-gray-400">({teacher.email})</span>
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={300}
                    value={teacher.materialLimit || 0}
                    onChange={e => {
                      const value = Math.max(0, Math.min(300, Number(e.target.value)));
                      const updated = [...filteredTeachers];
                      updated[idx] = { ...teacher, materialLimit: value };
                      setFilteredTeachers(updated);
                    }}
                    className="w-20 border rounded px-2 py-1 text-right text-blue-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                  <span className="text-xs text-gray-400">materiais</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm">Total distribuído: <span className={filteredTeachers.reduce((sum, t) => sum + (t.materialLimit || 0), 0) > 300 ? 'text-red-600 font-bold' : 'text-blue-600 font-bold'}>{filteredTeachers.reduce((sum, t) => sum + (t.materialLimit || 0), 0)}</span> / 300</span>
              <DialogFooter className="gap-2">
                <Button variant="outline" type="button" onClick={() => setEditLimitsOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={filteredTeachers.reduce((sum, t) => sum + (t.materialLimit || 0), 0) > 300}>Salvar</Button>
              </DialogFooter>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de convite de professor */}
      <Dialog open={addTeacherOpen} onOpenChange={setAddTeacherOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Convidar Professor para o Grupo Escolar</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {inviteSuccess ? (
              <div className="text-green-600 text-center font-semibold py-4">
                Convite enviado com sucesso!<br />O professor receberá um e-mail para se cadastrar.
              </div>
            ) : (
              <>
                <p className="text-gray-600 text-sm mb-2">Informe o e-mail do professor que você deseja adicionar ao grupo escolar. Ele receberá um convite para se cadastrar e completar o perfil.</p>
                <div>
                  <Label htmlFor="email" className="text-sm font-medium">E-mail do Professor</Label>
                  <Input id="email" type="email" value={addTeacherForm.email} onChange={e => setAddTeacherForm({ ...addTeacherForm, email: e.target.value })} placeholder="exemplo@escola.com" className="mt-1" autoFocus />
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setAddTeacherOpen(false)}>Cancelar</Button>
                  <Button onClick={handleInviteTeacher} disabled={addTeacherLoading || !addTeacherForm.email} className="bg-blue-700 text-white hover:bg-blue-800">
                    {addTeacherLoading ? 'Enviando...' : 'Enviar Convite'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de edição individual do limite */}
      <UIDialog open={!!editUserLimit} onOpenChange={v => { if (!v) setEditUserLimit(null); }}>
        <UIDialogContent className="max-w-xs">
          <UIDialogHeader>
            <UIDialogTitle>Editar Limite</UIDialogTitle>
          </UIDialogHeader>
          {editUserLimit && (
            <form onSubmit={async e => {
              e.preventDefault();
              const grupoId = await getGrupoId();
              if (!grupoId) return;
              // Validar soma dos limites
              const totalOutros = teachers.filter(t => t.id !== editUserLimit.teacher.id).reduce((sum, t) => sum + (t.materialLimit || 0), 0);
              if (totalOutros + editUserLimit.value > 300) {
                toast({ title: 'Limite excedido', description: 'A soma dos limites não pode ultrapassar 300.', variant: 'destructive' });
                return;
              }
              const ok = await updateUserMaterialLimit({ userId: editUserLimit.teacher.id, grupoId, value: editUserLimit.value });
              if (ok) {
                setEditUserLimit(null);
                loadTeachers();
                toast({ title: 'Limite atualizado', description: 'O limite foi salvo com sucesso.' });
              } else {
                toast({ title: 'Erro ao salvar', description: 'Não foi possível salvar o limite.', variant: 'destructive' });
              }
            }}>
              <div className="flex flex-col gap-2">
                <span className="font-medium text-gray-800">{editUserLimit.teacher.name}</span>
                <input
                  type="number"
                  min={0}
                  max={300}
                  value={editUserLimit.value}
                  onChange={e => setEditUserLimit({ ...editUserLimit, value: Math.max(0, Math.min(300, Number(e.target.value))) })}
                  className="w-full border rounded px-2 py-1 text-right text-blue-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                <span className="text-xs text-gray-400">materiais (total do grupo: 300)</span>
              </div>
              <UIDialogFooter className="gap-2 mt-4">
                <Button variant="outline" type="button" onClick={() => setEditUserLimit(null)}>Cancelar</Button>
                <Button type="submit">Salvar</Button>
              </UIDialogFooter>
            </form>
          )}
        </UIDialogContent>
      </UIDialog>
    </div>
  );
};

export default SchoolPage;
