import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Monitor, FileText, ClipboardCheck, Eye, Edit3, Trash2, Download, Search, Filter, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { materialService, GeneratedMaterial } from '@/services/materialService';
import { exportService } from '@/services/exportService';
const MaterialsList: React.FC = () => {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState<GeneratedMaterial[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<GeneratedMaterial[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');
  useEffect(() => {
    loadMaterials();
  }, []);
  useEffect(() => {
    filterMaterials();
  }, [materials, searchTerm, filterType, filterSubject]);
  const loadMaterials = () => {
    const allMaterials = materialService.getMaterials();
    setMaterials(allMaterials);
  };
  const filterMaterials = () => {
    let filtered = materials;

    // Filtro de busca
    if (searchTerm) {
      filtered = filtered.filter(material => material.title.toLowerCase().includes(searchTerm.toLowerCase()) || material.subject.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    // Filtro por tipo
    if (filterType !== 'all') {
      filtered = filtered.filter(material => material.type === filterType);
    }

    // Filtro por disciplina
    if (filterSubject !== 'all') {
      filtered = filtered.filter(material => material.subject.toLowerCase() === filterSubject);
    }
    setFilteredMaterials(filtered);
  };
  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Tem certeza que deseja excluir "${title}"?`)) {
      const success = materialService.deleteMaterial(id);
      if (success) {
        toast.success('Material excluído com sucesso!');
        loadMaterials();
      } else {
        toast.error('Erro ao excluir material');
      }
    }
  };
  const handleExport = async (material: GeneratedMaterial, format: 'pdf' | 'word') => {
    try {
      if (format === 'pdf') {
        await exportService.exportToPDF(material);
        toast.success('PDF exportado com sucesso!');
      } else {
        await exportService.exportToWord(material);
        toast.success('Documento Word exportado com sucesso!');
      }
    } catch (error) {
      toast.error('Erro ao exportar material');
      console.error('Export error:', error);
    }
  };
  const getTypeIcon = (type: string) => {
    const icons = {
      'plano-de-aula': BookOpen,
      'slides': Monitor,
      'atividade': FileText,
      'avaliacao': ClipboardCheck
    };
    return icons[type as keyof typeof icons] || FileText;
  };
  const getTypeLabel = (type: string) => {
    const labels = {
      'plano-de-aula': 'Plano de Aula',
      'slides': 'Slides',
      'atividade': 'Atividade',
      'avaliacao': 'Avaliação'
    };
    return labels[type as keyof typeof labels] || type;
  };
  const getTypeColor = (type: string) => {
    const colors = {
      'plano-de-aula': 'text-blue-600 bg-blue-50',
      'slides': 'text-slate-600 bg-slate-50',
      'atividade': 'text-emerald-600 bg-emerald-50',
      'avaliacao': 'text-purple-600 bg-purple-50'
    };
    return colors[type as keyof typeof colors] || 'text-gray-600 bg-gray-50';
  };
  const uniqueSubjects = [...new Set(materials.map(m => m.subject))];
  return <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Meus Materiais</h1>
          <p className="text-gray-600">Gerencie seus conteúdos pedagógicos</p>
        </div>
        
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input placeholder="Buscar por título ou disciplina..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
            </div>
            <div className="md:w-48">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="plano-de-aula">Plano de Aula</SelectItem>
                  <SelectItem value="slides">Slides</SelectItem>
                  <SelectItem value="atividade">Atividade</SelectItem>
                  <SelectItem value="avaliacao">Avaliação</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:w-48">
              <Select value={filterSubject} onValueChange={setFilterSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Disciplina" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as disciplinas</SelectItem>
                  {uniqueSubjects.map(subject => <SelectItem key={subject} value={subject.toLowerCase()}>{subject}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Materiais */}
      {filteredMaterials.length === 0 ? <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <FileText className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {materials.length === 0 ? 'Nenhum material criado ainda' : 'Nenhum material encontrado'}
            </h3>
            <p className="text-gray-500 mb-6">
              {materials.length === 0 ? 'Comece criando seu primeiro material pedagógico!' : 'Tente ajustar os filtros para encontrar o que procura.'}
            </p>
            {materials.length === 0 && <Button onClick={() => navigate('/')} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Material
              </Button>}
          </CardContent>
        </Card> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map(material => {
        const IconComponent = getTypeIcon(material.type);
        return <Card key={material.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getTypeColor(material.type)}`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold line-clamp-2">
                          {material.title}
                        </CardTitle>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-gray-600">
                      <div>{material.subject} • {material.grade}</div>
                      <div>{getTypeLabel(material.type)}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(material.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/material/${material.id}`)} className="flex-1">
                      <Eye className="w-4 h-4 mr-1" />
                      Ver
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/material/${material.id}?edit=true`)}>
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleExport(material, 'pdf')}>
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(material.id, material.title)} className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>;
      })}
        </div>}
    </div>;
};
export default MaterialsList;