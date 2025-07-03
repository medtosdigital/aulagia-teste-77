import React, { useState, useEffect } from 'react';
import { Users, BookOpen, FileText, Award, Plus, Settings, UserPlus, Crown, TrendingUp, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { schoolGroupService, GrupoEscolar, MembroGrupoEscolar } from '@/services/schoolGroupService';
import { usePlanPermissions } from '@/hooks/usePlanPermissions';
import AddTeacherModal from './modals/AddTeacherModal';
import ManageTeacherLimitsModal from './modals/ManageTeacherLimitsModal';

const SchoolPage: React.FC = () => {
  const [grupo, setGrupo] = useState<GrupoEscolar | null>(null);
  const [membros, setMembros] = useState<MembroGrupoEscolar[]>([]);
  const [loading, setLoading] = useState(true);
  const [addTeacherOpen, setAddTeacherOpen] = useState(false);
  const [manageLimitsOpen, setManageLimitsOpen] = useState(false);
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    totalLimitUsed: 0,
    remainingLimit: 300
  });
  
  const { toast } = useToast();
  const { currentPlan, isSchoolOwner } = usePlanPermissions();

  useEffect(() => {
    if (isSchoolOwner()) {
      loadSchoolData();
    } else {
      setLoading(false);
    }
  }, []);

  const loadSchoolData = async () => {
    try {
      setLoading(true);
      
      // Verificar se já existe um grupo
      let schoolGroup = await schoolGroupService.getUserSchoolGroup();
      
      // Se não existe, criar um novo
      if (!schoolGroup) {
        schoolGroup = await schoolGroupService.createSchoolGroup('Minha Escola');
      }
      
      if (schoolGroup) {
        setGrupo(schoolGroup);
        const groupStats = await schoolGroupService.getGroupStats(schoolGroup.id);
        setMembros(groupStats.members);
        setStats({
          totalMembers: groupStats.totalMembers,
          activeMembers: groupStats.activeMembers,
          totalLimitUsed: groupStats.totalLimitUsed,
          remainingLimit: groupStats.remainingLimit
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados da escola:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados da escola.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTeacher = async (memberId: string) => {
    try {
      const success = await schoolGroupService.removeMemberFromGroup(memberId);
      if (success) {
        await loadSchoolData(); // Recarregar dados
        toast({
          title: 'Professor removido',
          description: 'O professor foi removido do grupo com sucesso!'
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o professor.',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-accent/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dados da escola...</p>
        </div>
      </div>
    );
  }

  if (!isSchoolOwner()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-accent/20 flex items-center justify-center">
        <Card className="max-w-md p-8 text-center">
          <Crown className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Acesso Restrito</h2>
          <p className="text-muted-foreground mb-4">
            Esta página é exclusiva para usuários do plano Grupo Escolar.
          </p>
          <Button>Fazer Upgrade</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/20">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header moderno inspirado no dashboard */}
        <div className="w-full bg-gradient-to-r from-primary to-primary/80 rounded-2xl shadow-xl p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
          
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Crown className="w-8 h-8 text-white" />
                <h1 className="text-4xl font-extrabold text-white">Grupo Escolar</h1>
              </div>
              <p className="text-white/90 text-lg">
                Gerencie até 5 professores e distribua 300 materiais mensais
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="secondary" 
                className="bg-white text-primary font-semibold hover:bg-white/90"
                onClick={() => setAddTeacherOpen(true)}
                disabled={stats.totalMembers >= 5}
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Adicionar Professor
              </Button>
              <Button 
                variant="outline" 
                className="border-white text-white hover:bg-white/10"
                onClick={() => setManageLimitsOpen(true)}
              >
                <Settings className="w-5 h-5 mr-2" />
                Gerenciar Limites
              </Button>
            </div>
          </div>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card shadow-lg border-0 hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Professores</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalMembers}/5</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card shadow-lg border-0 hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Limite Usado</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalLimitUsed}/300</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card shadow-lg border-0 hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Disponível</p>
                  <p className="text-2xl font-bold text-foreground">{stats.remainingLimit}</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <BookOpen className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card shadow-lg border-0 hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ativos</p>
                  <p className="text-2xl font-bold text-foreground">{stats.activeMembers}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de professores */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              Professores do Grupo
            </h2>
            <Badge variant="secondary" className="text-sm">
              {stats.totalMembers} de 5 vagas ocupadas
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Professores existentes */}
            {membros.map((membro) => (
              <Card key={membro.id} className="bg-card shadow-lg border-0 hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center text-white font-bold text-lg">
                        {membro.user_profile?.full_name?.charAt(0) || 
                         membro.user_profile?.email?.charAt(0) || 
                         '?'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {membro.user_profile?.full_name || 'Professor'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {membro.user_profile?.email}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveTeacher(membro.id)}
                      className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Limite de materiais</span>
                      <Badge variant="outline">{membro.limite_materiais} materiais</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <Badge variant={membro.status === 'ativo' ? 'default' : 'secondary'}>
                        {membro.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Vagas disponíveis */}
            {[...Array(Math.max(0, 5 - stats.totalMembers))].map((_, idx) => (
              <Card 
                key={`vaga-${idx}`} 
                className="border-2 border-dashed border-muted-foreground/30 bg-muted/20 hover:bg-muted/40 transition-all cursor-pointer"
                onClick={() => setAddTeacherOpen(true)}
              >
                <CardContent className="p-6 flex flex-col items-center justify-center h-full text-center">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <Plus className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium text-muted-foreground mb-1">Vaga Disponível</h3>
                  <p className="text-sm text-muted-foreground/80">Clique para adicionar um professor</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Plano atual e benefícios */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Card do plano */}
          <Card className="bg-gradient-to-br from-primary to-primary/80 text-white shadow-xl border-0">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <Crown className="w-8 h-8" />
                <div>
                  <h3 className="text-xl font-bold">Plano Grupo Escolar</h3>
                  <p className="text-white/80">Gestão completa da sua escola</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Professores</span>
                    <span className="font-bold">{stats.totalMembers}/5</span>
                  </div>
                  <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-2 bg-white rounded-full transition-all" 
                      style={{ width: `${(stats.totalMembers / 5) * 100}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Materiais distribuídos</span>
                    <span className="font-bold">{stats.totalLimitUsed}/300</span>
                  </div>
                  <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-2 bg-white rounded-full transition-all" 
                      style={{ width: `${(stats.totalLimitUsed / 300) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefícios */}
          <div>
            <h3 className="text-xl font-bold text-foreground mb-4">Benefícios do Plano</h3>
            <div className="grid grid-cols-1 gap-4">
              <Card className="bg-card shadow-md border-0">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Gestão de Equipe</h4>
                    <p className="text-sm text-muted-foreground">Adicione até 5 professores</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-card shadow-md border-0">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <BookOpen className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">300 Materiais/mês</h4>
                    <p className="text-sm text-muted-foreground">Distribua entre sua equipe</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-card shadow-md border-0">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <Settings className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Controle Total</h4>
                    <p className="text-sm text-muted-foreground">Gerencie limites individuais</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Modais */}
      {grupo && (
        <>
          <AddTeacherModal
            isOpen={addTeacherOpen}
            onClose={() => setAddTeacherOpen(false)}
            groupId={grupo.id}
            onSuccess={loadSchoolData}
          />
          
          <ManageTeacherLimitsModal
            isOpen={manageLimitsOpen}
            onClose={() => setManageLimitsOpen(false)}
            groupId={grupo.id}
            onSuccess={loadSchoolData}
          />
        </>
      )}
    </div>
  );
};

export default SchoolPage;