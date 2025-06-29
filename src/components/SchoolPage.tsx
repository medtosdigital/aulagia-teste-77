
import React, { useState, useEffect } from 'react';
import { Users, BookOpen, FileText, Award, Plus, Search, Filter, Eye, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { userMaterialsService } from '@/services/userMaterialsService';
import ViewMaterialsModal from './modals/ViewMaterialsModal';

interface Teacher {
  id: string;
  name: string;
  email: string;
  subject: string;
  grade: string;
  materialsCount: number;
}

const SchoolPage: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeachers();
  }, []);

  useEffect(() => {
    filterTeachers();
  }, [teachers, searchTerm, filterSubject]);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      
      // Get all users from profiles
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) {
        console.error('Error loading profiles:', error);
        return;
      }

      if (!profiles) {
        setTeachers([]);
        return;
      }

      // Load material counts for each teacher
      const teachersWithCounts = await Promise.all(
        profiles.map(async (profile) => {
          try {
            const materials = await userMaterialsService.getMaterialsByUser(profile.id);
            const materialsCount = materials ? materials.length : 0;

            return {
              id: profile.id,
              name: profile.full_name || profile.email || 'Professor',
              email: profile.email || '',
              subject: 'Multidisciplinar',
              grade: 'Todas as séries',
              materialsCount
            };
          } catch (error) {
            console.error(`Error loading materials for user ${profile.id}:`, error);
            return {
              id: profile.id,
              name: profile.full_name || profile.email || 'Professor',
              email: profile.email || '',
              subject: 'Multidisciplinar',
              grade: 'Todas as séries',
              materialsCount: 0
            };
          }
        })
      );

      setTeachers(teachersWithCounts);
    } catch (error) {
      console.error('Error loading teachers:', error);
      setTeachers([]);
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

  if (loading) {
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
        {/* Header */}
        <div className="flex flex-col space-y-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Escola Digital
              </h1>
              <p className="text-gray-600 text-lg mt-2">Gerencie os professores e materiais da sua escola</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Professores</p>
                  <p className="text-2xl font-bold text-gray-900">{teachers.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Materiais</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {teachers.reduce((total, teacher) => total + (teacher.materialsCount || 0), 0)}
                  </p>
                </div>
                <BookOpen className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Professores Ativos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {teachers.filter(t => (t.materialsCount || 0) > 0).length}
                  </p>
                </div>
                <Award className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Média por Professor</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {teachers.length > 0 
                      ? Math.round(teachers.reduce((total, teacher) => total + (teacher.materialsCount || 0), 0) / teachers.length)
                      : 0
                    }
                  </p>
                </div>
                <FileText className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 shadow-lg bg-white/80 backdrop-blur-sm border-0">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input 
                    placeholder="Buscar por nome ou email..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                    className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 h-12" 
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 md:w-auto">
                <Select value={filterSubject} onValueChange={setFilterSubject}>
                  <SelectTrigger className="w-full sm:w-48 h-12">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Disciplina" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as disciplinas</SelectItem>
                    {uniqueSubjects.map(subject => (
                      <SelectItem key={subject} value={subject.toLowerCase()}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Teachers List */}
        {filteredTeachers.length === 0 ? (
          <Card className="shadow-lg bg-white/90 backdrop-blur-sm">
            <CardContent className="p-8 md:p-12 text-center">
              <div className="text-gray-400 mb-4">
                <Users className="w-12 h-12 md:w-16 md:h-16 mx-auto" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-600 mb-2">
                {teachers.length === 0 ? 'Nenhum professor cadastrado' : 'Nenhum professor encontrado'}
              </h3>
              <p className="text-gray-500 mb-6">
                {teachers.length === 0 ? 'Convide professores para começar a usar a plataforma!' : 'Tente ajustar os filtros para encontrar o que procura.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeachers.map(teacher => (
              <Card key={teacher.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white hover:scale-[1.02] overflow-hidden">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg shadow-lg">
                        {teacher.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{teacher.name}</h3>
                        <p className="text-sm text-gray-500 truncate">{teacher.email}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Disciplina:</span>
                        <Badge className="bg-blue-100 text-blue-700 text-xs">{teacher.subject}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Série:</span>
                        <span className="text-sm font-medium text-gray-900">{teacher.grade}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Materiais:</span>
                        <Badge className="bg-green-100 text-green-700 text-xs">
                          {teacher.materialsCount || 0}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewMaterials(teacher)} 
                        className="flex-1 text-xs h-8 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Ver Materiais
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ViewMaterialsModal 
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedTeacher(null);
        }}
        teacher={selectedTeacher}
      />
    </div>
  );
};

export default SchoolPage;
