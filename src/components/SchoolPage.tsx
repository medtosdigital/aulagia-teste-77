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

interface Teacher {
  id: string;
  name: string;
  email: string;
  subject: string;
  grade: string;
  materialsCount: number;
  materialLimit?: number;
}

const SchoolPage: React.FC = () => {
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
              materialsCount,
              materialLimit: 300 // Assuming a default limit of 300 materials
            };
          } catch (error) {
            console.error(`Error loading materials for user ${profile.id}:`, error);
            return {
              id: profile.id,
              name: profile.full_name || profile.email || 'Professor',
              email: profile.email || '',
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
        <div className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-6 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-white drop-shadow">Escola Digital</h1>
            <p className="text-white/80 text-lg mt-2">Gerencie os professores e materiais da sua escola</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" className="bg-white text-blue-700 font-bold shadow hover:bg-blue-50" onClick={() => setEditLimitsOpen(true)}>
              <Settings className="w-5 h-5 mr-2" /> Editar Limites
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
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

        {/* Teachers List */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2"><Users className="w-6 h-6 text-blue-600" /> Professores Adicionados</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeachers.map(teacher => (
              <Card key={teacher.id} className="flex flex-row items-center gap-4 p-4 bg-white shadow-lg border-0 hover:shadow-2xl transition-all">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                  {teacher.name.charAt(0).toUpperCase()}
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
                  <Button variant="ghost" size="icon"><Edit className="w-4 h-4 text-gray-400 hover:text-blue-600" /></Button>
                </div>
              </Card>
            ))}
            {/* Vagas disponíveis */}
            {[...Array(Math.max(0, 5 - filteredTeachers.length))].map((_, idx) => (
              <Card key={`vaga-${idx}`} className="flex flex-col items-center justify-center p-8 border-dashed border-2 border-blue-200 bg-blue-50/40 shadow-none">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2"><Plus className="w-6 h-6 text-blue-600" /></div>
                <span className="text-gray-500 font-medium mb-2">Vaga disponível</span>
                <Button variant="outline" className="text-blue-700 border-blue-300 font-semibold">Preencher Vaga</Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Card do plano atual e benefícios */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <div className="col-span-1">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-500 rounded-2xl p-6 shadow-xl text-white flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-3 rounded-full"><Users className="w-7 h-7 text-white" /></div>
                <div>
                  <h3 className="text-lg font-bold">Seu Plano Atual <span className="ml-2 px-2 py-1 rounded bg-green-200/80 text-green-900 text-xs font-semibold">Ativo</span></h3>
                  <p className="text-white/80 text-sm">Plano Escola Premium</p>
                </div>
              </div>
              <div className="mt-2">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Professores adicionados</span>
                  <span className="font-bold">{filteredTeachers.length}/5</span>
                </div>
                <div className="w-full h-2 bg-white/30 rounded-full overflow-hidden">
                  <div className="h-2 bg-green-400 rounded-full" style={{ width: `${(filteredTeachers.length/5)*100}%` }}></div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2 text-sm">
                <span>Próximo vencimento:</span>
                <span className="font-bold">20/12/2023</span>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="secondary" className="bg-white text-blue-700 font-bold shadow hover:bg-blue-50">Gerenciar Professores</Button>
                <Button variant="outline" className="border-white text-white hover:bg-white/10">Explorar Recursos</Button>
              </div>
            </div>
          </div>
          <div className="col-span-2">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Benefícios do Plano Escola</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Card className="bg-white shadow-lg border-0 p-6 flex flex-col gap-2">
                <div className="bg-blue-100 p-3 rounded-full w-fit"><Users className="w-6 h-6 text-blue-600" /></div>
                <span className="font-bold text-gray-900">Gestão de Professores</span>
                <span className="text-gray-500 text-sm">Gerencie até 5 professores com acesso completo à plataforma, permissões personalizadas e acompanhamento de atividade.</span>
              </Card>
              <Card className="bg-white shadow-lg border-0 p-6 flex flex-col gap-2">
                <div className="bg-green-100 p-3 rounded-full w-fit"><BookOpen className="w-6 h-6 text-green-600" /></div>
                <span className="font-bold text-gray-900">Biblioteca de Materiais</span>
                <span className="text-gray-500 text-sm">Acesso ilimitado a milhares de materiais pedagógicos prontos e ferramentas para criar seu próprio conteúdo.</span>
              </Card>
              <Card className="bg-white shadow-lg border-0 p-6 flex flex-col gap-2">
                <div className="bg-purple-100 p-3 rounded-full w-fit"><Award className="w-6 h-6 text-purple-600" /></div>
                <span className="font-bold text-gray-900">Relatórios de Desempenho</span>
                <span className="text-gray-500 text-sm">Relatórios detalhados sobre o uso da plataforma, produção de materiais e engajamento dos professores.</span>
              </Card>
              <Card className="bg-white shadow-lg border-0 p-6 flex flex-col gap-2">
                <div className="bg-yellow-100 p-3 rounded-full w-fit"><FileText className="w-6 h-6 text-yellow-600" /></div>
                <span className="font-bold text-gray-900">Segurança de Dados</span>
                <span className="text-gray-500 text-sm">Seus dados e conteúdos protegidos com criptografia de última geração e backups automáticos.</span>
              </Card>
              <Card className="bg-white shadow-lg border-0 p-6 flex flex-col gap-2">
                <div className="bg-pink-100 p-3 rounded-full w-fit"><Award className="w-6 h-6 text-pink-600" /></div>
                <span className="font-bold text-gray-900">Suporte Prioritário</span>
                <span className="text-gray-500 text-sm">Atendimento rápido e dedicado para sua instituição, com tempo de resposta garantido de até 2 horas.</span>
              </Card>
            </div>
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
    </div>
  );
};

export default SchoolPage;
