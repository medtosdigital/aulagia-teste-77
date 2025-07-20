import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Plus, 
  Settings, 
  Activity, 
  UserCheck, 
  UserX, 
  Mail,
  Building,
  Crown
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useUnifiedPlanPermissions } from '@/hooks/useUnifiedPlanPermissions';

interface GrupoEscolar {
  id: string;
  nome: string;
  owner_id: string;
  limite_materiais: number;
  created_at: string;
  updated_at: string;
}

interface MembroGrupo {
  id: string;
  grupo_id: string;
  user_id: string;
  email: string;
  nome: string;
  status: 'pendente' | 'ativo' | 'inativo';
  limite_materiais: number;
  materiais_usados: number;
  invited_at: string;
  joined_at?: string;
}

export default function SchoolPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { canAccessSchool } = useUnifiedPlanPermissions();
  
  const [loading, setLoading] = useState(true);
  const [grupo, setGrupo] = useState<GrupoEscolar | null>(null);
  const [membros, setMembros] = useState<MembroGrupo[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [stats, setStats] = useState({
    totalMembros: 0,
    membrosAtivos: 0,
    materiaisUsados: 0,
    limiteTotal: 300
  });

  // Modal states
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showResendModal, setShowResendModal] = useState(false);
  const [showViewMaterialsModal, setShowViewMaterialsModal] = useState(false);
  
  const [selectedMember, setSelectedMember] = useState<MembroGrupo | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLimit, setInviteLimit] = useState(60);
  const [newGroupName, setNewGroupName] = useState('');
  const [editLimit, setEditLimit] = useState(60);

  useEffect(() => {
    if (user && canAccessSchool) {
      loadGroupData();
    }
  }, [user, canAccessSchool]);

  const loadGroupData = async () => {
    if (!user) return;
    
    try {
      console.log('Carregando dados do grupo escolar...');
      
      // First, check if user owns a group
      const { data: ownerGroup, error: ownerError } = await supabase
        .from('grupos_escolares')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (!ownerError && ownerGroup) {
        setGrupo(ownerGroup);
        setIsOwner(true);
        await loadMembers(ownerGroup.id);
        await loadStats();
        return;
      }

      // If not owner, check if user is a member
      const { data: memberData, error: memberError } = await supabase
        .from('membros_grupo_escolar')
        .select(`
          *,
          grupos_escolares (*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'ativo')
        .single();

      if (!memberError && memberData && memberData.grupos_escolares) {
        setGrupo(memberData.grupos_escolares);
        setIsOwner(false);
        await loadMembers(memberData.grupos_escolares.id);
        await loadStats();
      }
    } catch (error) {
      console.error('Erro ao carregar dados do grupo:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async (grupoId: string) => {
    try {
      const { data, error } = await supabase
        .from('membros_grupo_escolar')
        .select('*')
        .eq('grupo_id', grupoId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMembros(data || []);
    } catch (error) {
      console.error('Erro ao carregar membros:', error);
    }
  };

  const loadStats = async () => {
    try {
      const membrosAtivos = membros.filter(m => m.status === 'ativo').length;
      const materiaisUsados = membros.reduce((total, m) => total + m.materiais_usados, 0);
      
      setStats({
        totalMembros: membros.length,
        membrosAtivos,
        materiaisUsados,
        limiteTotal: grupo?.limite_materiais || 300
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const createGroup = async () => {
    if (!user || !newGroupName.trim()) return;

    try {
      const { data, error } = await supabase
        .from('grupos_escolares')
        .insert({
          nome: newGroupName.trim(),
          owner_id: user.id,
          limite_materiais: 300
        })
        .select()
        .single();

      if (error) throw error;

      setGrupo(data);
      setIsOwner(true);
      setShowCreateGroup(false);
      setNewGroupName('');
      
      toast({
        title: "Grupo criado!",
        description: "Seu grupo escolar foi criado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao criar grupo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o grupo.",
        variant: "destructive"
      });
    }
  };

  const inviteMember = async () => {
    if (!grupo || !inviteEmail.trim()) return;

    try {
      const { error } = await supabase
        .from('membros_grupo_escolar')
        .insert({
          grupo_id: grupo.id,
          email: inviteEmail.trim(),
          nome: inviteEmail.split('@')[0],
          status: 'pendente',
          limite_materiais: inviteLimit
        });

      if (error) throw error;

      await loadMembers(grupo.id);
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteLimit(60);
      
      toast({
        title: "Convite enviado!",
        description: "O convite foi enviado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao enviar convite:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o convite.",
        variant: "destructive"
      });
    }
  };

  const removeMember = async () => {
    if (!selectedMember) return;

    try {
      const { error } = await supabase
        .from('membros_grupo_escolar')
        .delete()
        .eq('id', selectedMember.id);

      if (error) throw error;

      await loadMembers(grupo!.id);
      setShowRemoveModal(false);
      setSelectedMember(null);
      
      toast({
        title: "Membro removido!",
        description: "O membro foi removido do grupo.",
      });
    } catch (error) {
      console.error('Erro ao remover membro:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o membro.",
        variant: "destructive"
      });
    }
  };

  const updateMemberLimit = async () => {
    if (!selectedMember) return;

    try {
      const { error } = await supabase
        .from('membros_grupo_escolar')
        .update({ limite_materiais: editLimit })
        .eq('id', selectedMember.id);

      if (error) throw error;

      await loadMembers(grupo!.id);
      setShowEditModal(false);
      setSelectedMember(null);
      
      toast({
        title: "Limite atualizado!",
        description: "O limite de materiais foi atualizado.",
      });
    } catch (error) {
      console.error('Erro ao atualizar limite:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o limite.",
        variant: "destructive"
      });
    }
  };

  if (!canAccessSchool) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-2xl mx-auto text-center">
          <CardContent className="p-8">
            <Crown className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Recurso Premium
            </h2>
            <p className="text-gray-600 mb-6">
              O recurso de Grupo Escolar está disponível apenas para usuários do plano Grupo Escolar.
            </p>
            <Button onClick={() => window.location.href = '/subscription'}>
              Ver Planos
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!grupo) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-2xl mx-auto text-center">
          <CardContent className="p-8">
            <Building className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Criar Grupo Escolar
            </h2>
            <p className="text-gray-600 mb-6">
              Crie um grupo para colaborar com outros professores e gerenciar materiais em conjunto.
            </p>
            <Button onClick={() => setShowCreateGroup(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Grupo
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{grupo.nome}</h1>
          <p className="text-gray-600 mt-1">
            {isOwner ? 'Você é o administrador deste grupo' : 'Membro do grupo'}
          </p>
        </div>
        {isOwner && (
          <Button onClick={() => setShowInviteModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Convidar Professor
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Membros</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalMembros}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <UserCheck className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Membros Ativos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.membrosAtivos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="w-8 h-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Materiais Usados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.materiaisUsados}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Settings className="w-8 h-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Limite Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.limiteTotal}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>Membros do Grupo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Nome</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Limite</th>
                  <th className="text-left py-3 px-4">Usado</th>
                  {isOwner && <th className="text-left py-3 px-4">Ações</th>}
                </tr>
              </thead>
              <tbody>
                {membros.map((membro) => (
                  <tr key={membro.id} className="border-b">
                    <td className="py-3 px-4">{membro.nome}</td>
                    <td className="py-3 px-4">{membro.email}</td>
                    <td className="py-3 px-4">
                      <Badge
                        className={
                          membro.status === 'ativo'
                            ? 'bg-green-100 text-green-800'
                            : membro.status === 'pendente'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }
                      >
                        {membro.status === 'ativo' ? 'Ativo' : 
                         membro.status === 'pendente' ? 'Pendente' : 'Inativo'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">{membro.limite_materiais}</td>
                    <td className="py-3 px-4">{membro.materiais_usados}</td>
                    {isOwner && (
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedMember(membro);
                              setEditLimit(membro.limite_materiais);
                              setShowEditModal(true);
                            }}
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedMember(membro);
                              setShowRemoveModal(true);
                            }}
                          >
                            <UserX className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
