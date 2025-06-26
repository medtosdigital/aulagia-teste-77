
import React, { useState } from 'react';
import { Plus, Users, BookOpen, Calendar, TrendingUp, Search, MoreVertical, Mail, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePlanPermissions } from '@/hooks/usePlanPermissions';
import { useUpgradeModal } from '@/hooks/useUpgradeModal';
import UpgradeModal from '@/components/UpgradeModal';
import ViewMaterialsModal from '@/components/modals/ViewMaterialsModal';
import EditTeacherModal from '@/components/modals/EditTeacherModal';
import ResendInviteModal from '@/components/modals/ResendInviteModal';
import RemoveTeacherModal from '@/components/modals/RemoveTeacherModal';
import { useToast } from '@/hooks/use-toast';

interface Teacher {
  id: string;
  name: string;
  email: string;
  subject: string;
  grade: string;
  status: 'active' | 'pending' | 'inactive';
  materialsCount: number;
  lastAccess: string;
}

const SchoolPage = () => {
  const { currentPlan, usage } = usePlanPermissions();
  const { isOpen, openModal, closeModal, handlePlanSelection, availablePlans } = useUpgradeModal();
  const { toast } = useToast();
  
  const [teachers, setTeachers] = useState<Teacher[]>([
    {
      id: '1',
      name: 'Carlos Mendes',
      email: 'carlos.mendes@escola.com',
      subject: 'Matemática',
      grade: '6º ao 9º ano',
      status: 'active',
      materialsCount: 24,
      lastAccess: '2023-12-15'
    },
    {
      id: '2',
      name: 'Mariana Costa',
      email: 'mariana.costa@escola.com',
      subject: 'Português',
      grade: 'Fundamental II',
      status: 'active',
      materialsCount: 18,
      lastAccess: '2023-12-14'
    },
    {
      id: '3',
      name: 'Roberto Almeida',
      email: 'roberto.almeida@escola.com',
      subject: 'Ciências',
      grade: '7º e 8º ano',
      status: 'pending',
      materialsCount: 0,
      lastAccess: 'Nunca'
    }
  ]);

  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [newTeacher, setNewTeacher] = useState({
    name: '',
    email: '',
    subject: '',
    grade: ''
  });

  // Modal states
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [viewMaterialsOpen, setViewMaterialsOpen] = useState(false);
  const [editTeacherOpen, setEditTeacherOpen] = useState(false);
  const [resendInviteOpen, setResendInviteOpen] = useState(false);
  const [removeTeacherOpen, setRemoveTeacherOpen] = useState(false);

  const handleAddTeacher = () => {
    // Check if current plan allows adding more teachers
    if (teachers.length >= currentPlan.limits.maxUsers) {
      if (currentPlan.id !== 'grupo-escolar') {
        openModal();
        return;
      }
      alert(`Limite de ${currentPlan.limits.maxUsers} professores atingido para o Plano ${currentPlan.name}`);
      return;
    }

    if (newTeacher.name && newTeacher.email && newTeacher.subject && newTeacher.grade) {
      const teacher: Teacher = {
        id: Date.now().toString(),
        name: newTeacher.name,
        email: newTeacher.email,
        subject: newTeacher.subject,
        grade: newTeacher.grade,
        status: 'pending',
        materialsCount: 0,
        lastAccess: 'Nunca'
      };

      setTeachers([...teachers, teacher]);
      setNewTeacher({ name: '', email: '', subject: '', grade: '' });
      setShowAddTeacher(false);
      
      toast({
        title: "Professor adicionado!",
        description: `${teacher.name} foi adicionado à escola. Um convite será enviado para ${teacher.email}.`,
      });
    }
  };

  const handleEditTeacher = (teacherId: string, updatedData: Partial<Teacher>) => {
    setTeachers(prev => prev.map(teacher => 
      teacher.id === teacherId 
        ? { ...teacher, ...updatedData }
        : teacher
    ));
    
    toast({
      title: "Professor atualizado!",
      description: "As informações do professor foram atualizadas com sucesso.",
    });
  };

  const handleResendInvite = (teacherId: string) => {
    const teacher = teachers.find(t => t.id === teacherId);
    if (teacher) {
      toast({
        title: "Convite reenviado!",
        description: `Um novo convite foi enviado para ${teacher.email}.`,
      });
    }
  };

  const handleRemoveTeacher = (teacherId: string) => {
    const teacher = teachers.find(t => t.id === teacherId);
    setTeachers(prev => prev.filter(t => t.id !== teacherId));
    
    if (teacher) {
      toast({
        title: "Professor removido",
        description: `${teacher.name} foi removido da escola.`,
        variant: "destructive",
      });
    }
  };

  const openViewMaterials = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setViewMaterialsOpen(true);
  };

  const openEditTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setEditTeacherOpen(true);
  };

  const openResendInvite = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setResendInviteOpen(true);
  };

  const openRemoveTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setRemoveTeacherOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 text-xs">Ativo</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 text-xs">Pendente</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800 text-xs">Inativo</Badge>;
      default:
        return <Badge className="text-xs">Desconhecido</Badge>;
    }
  };

  // Calculate real data
  const totalMaterials = teachers.reduce((sum, teacher) => sum + teacher.materialsCount, 0);
  const activeTeachers = teachers.filter(t => t.status === 'active').length;
  const materialsThisMonth = Math.floor(totalMaterials * 0.3); // Mock calculation

  // Check if current plan supports school management
  const isSchoolPlan = currentPlan.id === 'grupo-escolar';
  const maxTeachers = currentPlan.limits.maxUsers;

  return (
    <div className="p-2 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className={`bg-gradient-to-r ${
        isSchoolPlan 
          ? 'from-green-600 to-emerald-600' 
          : 'from-blue-600 to-purple-600'
      } rounded-2xl p-4 sm:p-6 text-white`}>
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">
              {isSchoolPlan ? 'Gestão Escolar' : 'Gestão de Professores'}
            </h1>
            <p className={`${isSchoolPlan ? 'text-green-100' : 'text-purple-100'} text-sm sm:text-base`}>
              {isSchoolPlan 
                ? `Gerencie até ${maxTeachers} professores com acesso completo à plataforma`
                : `Plano ${currentPlan.name} - Para usar recursos colaborativos, faça upgrade para o Plano Grupo Escolar`
              }
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 sm:p-4 w-full sm:w-auto">
            <div className={`text-sm ${isSchoolPlan ? 'text-green-100' : 'text-purple-100'} mb-1`}>
              Plano {currentPlan.name}
            </div>
            <div className="text-lg font-semibold mb-2">
              Professores: {teachers.length}/{maxTeachers}
            </div>
            {!isSchoolPlan && (
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs w-full sm:w-auto"
                onClick={openModal}
              >
                Fazer Upgrade
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Total de Professores</CardTitle>
            <Users className="h-3 sm:h-4 w-3 sm:w-4 text-blue-600" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-lg sm:text-2xl font-bold">{teachers.length}</div>
            <p className="text-xs text-muted-foreground">de {maxTeachers} disponíveis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Professores Ativos</CardTitle>
            <TrendingUp className="h-3 sm:h-4 w-3 sm:w-4 text-green-600" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-lg sm:text-2xl font-bold">{activeTeachers}</div>
            <p className="text-xs text-muted-foreground">usuários ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Total de Materiais</CardTitle>
            <BookOpen className="h-3 sm:h-4 w-3 sm:w-4 text-purple-600" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-lg sm:text-2xl font-bold">{totalMaterials}</div>
            <p className="text-xs text-muted-foreground">materiais criados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Este Mês</CardTitle>
            <Calendar className="h-3 sm:h-4 w-3 sm:w-4 text-orange-600" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-lg sm:text-2xl font-bold">{materialsThisMonth}</div>
            <p className="text-xs text-muted-foreground">materiais gerados</p>
          </CardContent>
        </Card>
      </div>

      {!isSchoolPlan && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-blue-800 mb-2">
                  Desbloqueie o Plano Grupo Escolar
                </h3>
                <p className="text-blue-600 text-sm mb-4">
                  Para gerenciar até 5 professores com recursos colaborativos completos, 
                  faça upgrade para o Plano Grupo Escolar e tenha acesso a:
                </p>
                <ul className="text-blue-600 text-xs sm:text-sm space-y-1">
                  <li>• Dashboard de gestão colaborativa</li>
                  <li>• Compartilhamento de materiais entre professores</li>
                  <li>• Relatórios detalhados de uso</li>
                  <li>• Suporte prioritário</li>
                </ul>
              </div>
              <Button onClick={openModal} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto text-sm">
                Fazer Upgrade
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Teachers Management */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Users className="h-4 sm:h-5 w-4 sm:w-5" />
                Professores Cadastrados
              </CardTitle>
            </div>
            <div className="flex flex-col gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input placeholder="Buscar professor..." className="pl-10 text-sm" />
              </div>
              <Button
                onClick={() => setShowAddTeacher(true)}
                disabled={teachers.length >= maxTeachers}
                className="w-full text-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Professor
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          {showAddTeacher && (
            <div className="mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg border">
              <h3 className="text-base sm:text-lg font-semibold mb-4">Adicionar Novo Professor</h3>
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome Completo</label>
                  <Input
                    value={newTeacher.name}
                    onChange={(e) => setNewTeacher({...newTeacher, name: e.target.value})}
                    placeholder="Digite o nome completo"
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">E-mail</label>
                  <Input
                    type="email"
                    value={newTeacher.email}
                    onChange={(e) => setNewTeacher({...newTeacher, email: e.target.value})}
                    placeholder="Digite o e-mail"
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Matéria Lecionada</label>
                  <Input
                    value={newTeacher.subject}
                    onChange={(e) => setNewTeacher({...newTeacher, subject: e.target.value})}
                    placeholder="Ex: Matemática, Português..."
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Série(s)</label>
                  <Input
                    value={newTeacher.grade}
                    onChange={(e) => setNewTeacher({...newTeacher, grade: e.target.value})}
                    placeholder="Ex: 6º ao 9º ano"
                    className="text-sm"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2 mt-4">
                <Button onClick={handleAddTeacher} className="w-full text-sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Professor
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddTeacher(false)}
                  className="w-full text-sm"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-3 sm:space-y-4">
            {teachers.map((teacher) => (
              <div key={teacher.id} className="flex flex-col gap-4 p-3 sm:p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 sm:h-6 w-5 sm:w-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{teacher.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-600">{teacher.subject} • {teacher.grade}</p>
                    <p className="text-xs text-gray-500 truncate">{teacher.email}</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-base sm:text-lg font-semibold text-gray-900">{teacher.materialsCount}</div>
                      <div className="text-xs text-gray-500">materiais</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-xs sm:text-sm text-gray-900">{teacher.lastAccess}</div>
                      <div className="text-xs text-gray-500">último acesso</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-2">
                    {getStatusBadge(teacher.status)}
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="text-sm">
                        <DropdownMenuItem onClick={() => openViewMaterials(teacher)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Materiais
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditTeacher(teacher)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar Professor
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openResendInvite(teacher)}>
                          <Mail className="h-4 w-4 mr-2" />
                          Reenviar Convite
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => openRemoveTeacher(teacher)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remover Professor
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}

            {teachers.length === 0 && (
              <div className="text-center py-8 sm:py-12">
                <Users className="h-10 sm:h-12 w-10 sm:w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Nenhum professor cadastrado</h3>
                <p className="text-gray-500 mb-4 text-sm">
                  {isSchoolPlan 
                    ? 'Adicione professores para começar a usar o Plano Grupo Escolar'
                    : 'Faça upgrade para o Plano Grupo Escolar para gerenciar professores'
                  }
                </p>
                {isSchoolPlan ? (
                  <Button onClick={() => setShowAddTeacher(true)} className="text-sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Primeiro Professor
                  </Button>
                ) : (
                  <Button onClick={openModal} className="text-sm">
                    Fazer Upgrade para Plano Escola
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <ViewMaterialsModal
        isOpen={viewMaterialsOpen}
        onClose={() => setViewMaterialsOpen(false)}
        teacher={selectedTeacher}
      />

      <EditTeacherModal
        isOpen={editTeacherOpen}
        onClose={() => setEditTeacherOpen(false)}
        teacher={selectedTeacher}
        onSave={handleEditTeacher}
      />

      <ResendInviteModal
        isOpen={resendInviteOpen}
        onClose={() => setResendInviteOpen(false)}
        teacher={selectedTeacher}
        onConfirm={handleResendInvite}
      />

      <RemoveTeacherModal
        isOpen={removeTeacherOpen}
        onClose={() => setRemoveTeacherOpen(false)}
        teacher={selectedTeacher}
        onConfirm={handleRemoveTeacher}
      />

      <UpgradeModal
        isOpen={isOpen}
        onClose={closeModal}
        onSelectPlan={handlePlanSelection}
        availablePlans={availablePlans}
        currentPlanName={currentPlan.name}
      />
    </div>
  );
};

export default SchoolPage;
