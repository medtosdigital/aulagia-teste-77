
import React, { useState } from 'react';
import { Plus, Users, BookOpen, Calendar, TrendingUp, Search, Filter, MoreVertical } from 'lucide-react';
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

  const handleAddTeacher = () => {
    if (teachers.length >= 5) {
      alert('Limite de 5 professores atingido para o Plano Escola');
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
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inativo</Badge>;
      default:
        return <Badge>Desconhecido</Badge>;
    }
  };

  const totalMaterials = teachers.reduce((sum, teacher) => sum + teacher.materialsCount, 0);
  const activeTeachers = teachers.filter(t => t.status === 'active').length;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Gestão Escolar</h1>
            <p className="text-purple-100">
              Gerencie até 5 professores com acesso completo à plataforma
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 min-w-[200px]">
            <div className="text-sm text-purple-100 mb-1">Plano Escola Premium</div>
            <div className="text-lg font-semibold">Professores: {teachers.length}/5</div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Professores</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teachers.length}</div>
            <p className="text-xs text-muted-foreground">de 5 disponíveis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Professores Ativos</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTeachers}</div>
            <p className="text-xs text-muted-foreground">usuários ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Materiais</CardTitle>
            <BookOpen className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMaterials}</div>
            <p className="text-xs text-muted-foreground">materiais criados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">novos materiais</p>
          </CardContent>
        </Card>
      </div>

      {/* Teachers Management */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Professores Cadastrados
              </CardTitle>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input placeholder="Buscar professor..." className="pl-10 w-full sm:w-64" />
              </div>
              <Button
                onClick={() => setShowAddTeacher(true)}
                disabled={teachers.length >= 5}
                className="w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Professor
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {showAddTeacher && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">Adicionar Novo Professor</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome Completo</label>
                  <Input
                    value={newTeacher.name}
                    onChange={(e) => setNewTeacher({...newTeacher, name: e.target.value})}
                    placeholder="Digite o nome completo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">E-mail</label>
                  <Input
                    type="email"
                    value={newTeacher.email}
                    onChange={(e) => setNewTeacher({...newTeacher, email: e.target.value})}
                    placeholder="Digite o e-mail"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Matéria Lecionada</label>
                  <Input
                    value={newTeacher.subject}
                    onChange={(e) => setNewTeacher({...newTeacher, subject: e.target.value})}
                    placeholder="Ex: Matemática, Português..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Série(s)</label>
                  <Input
                    value={newTeacher.grade}
                    onChange={(e) => setNewTeacher({...newTeacher, grade: e.target.value})}
                    placeholder="Ex: 6º ao 9º ano"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-4">
                <Button onClick={handleAddTeacher} className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Professor
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddTeacher(false)}
                  className="w-full sm:w-auto"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {teachers.map((teacher) => (
              <div key={teacher.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4 mb-4 md:mb-0">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{teacher.name}</h3>
                    <p className="text-sm text-gray-600">{teacher.subject} • {teacher.grade}</p>
                    <p className="text-sm text-gray-500">{teacher.email}</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{teacher.materialsCount}</div>
                    <div className="text-xs text-gray-500">materiais</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm text-gray-900">{teacher.lastAccess}</div>
                    <div className="text-xs text-gray-500">último acesso</div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusBadge(teacher.status)}
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>Ver Materiais</DropdownMenuItem>
                        <DropdownMenuItem>Editar Professor</DropdownMenuItem>
                        <DropdownMenuItem>Reenviar Convite</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          Remover Professor
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}

            {teachers.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum professor cadastrado</h3>
                <p className="text-gray-500 mb-4">Adicione professores para começar a usar o Plano Escola</p>
                <Button onClick={() => setShowAddTeacher(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Professor
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SchoolPage;
