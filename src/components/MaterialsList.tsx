import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Monitor, FileText, ClipboardCheck, Eye, Edit3, Trash2, Download, Search, Filter, Plus, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { materialService, GeneratedMaterial } from '@/services/materialService';
import { exportService } from '@/services/exportService';
import MaterialModal from './MaterialModal';

const MaterialsList: React.FC = () => {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState<GeneratedMaterial[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<GeneratedMaterial[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');
  const [selectedMaterial, setSelectedMaterial] = useState<GeneratedMaterial | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

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

    if (searchTerm) {
      filtered = filtered.filter(material => material.title.toLowerCase().includes(searchTerm.toLowerCase()) || material.subject.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(material => material.type === filterType);
    }

    if (filterSubject !== 'all') {
      filtered = filtered.filter(material => material.subject.toLowerCase() === filterSubject);
    }
    setFilteredMaterials(filtered);
  };

  const handleViewMaterial = (material: GeneratedMaterial) => {
    setSelectedMaterial(material);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedMaterial(null);
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
      'plano-de-aula': 'bg-blue-500',
      'slides': 'bg-slate-500',
      'atividade': 'bg-emerald-500',
      'avaliacao': 'bg-purple-500'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500';
  };

  const uniqueSubjects = [...new Set(materials.map(m => m.subject))];

  return (
    <>
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 md:mb-8 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Meus Materiais</h1>
            <p className="text-gray-600">Gerencie seus conteúdos pedagógicos</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="px-3 py-1">
              {filteredMaterials.length} {filteredMaterials.length === 1 ? 'material' : 'materiais'}
            </Badge>
          </div>
        </div>

        {/* Filtros */}
        <Card className="mb-6 shadow-sm border-0 bg-white/50 backdrop-blur">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input 
                    placeholder="Buscar por título ou disciplina..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                    className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500" 
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 md:w-auto">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full sm:w-48">
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
                <Select value={filterSubject} onValueChange={setFilterSubject}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Disciplina" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as disciplinas</SelectItem>
                    {uniqueSubjects.map(subject => (
                      <SelectItem key={subject} value={subject.toLowerCase()}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Materiais */}
        {filteredMaterials.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="p-8 md:p-12 text-center">
              <div className="text-gray-400 mb-4">
                <FileText className="w-12 h-12 md:w-16 md:h-16 mx-auto" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-600 mb-2">
                {materials.length === 0 ? 'Nenhum material criado ainda' : 'Nenhum material encontrado'}
              </h3>
              <p className="text-gray-500 mb-6">
                {materials.length === 0 ? 'Comece criando seu primeiro material pedagógico!' : 'Tente ajustar os filtros para encontrar o que procura.'}
              </p>
              {materials.length === 0 && (
                <Button 
                  onClick={() => navigate('/')} 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Material
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filteredMaterials.map(material => {
              const IconComponent = getTypeIcon(material.type);
              return (
                <Card 
                  key={material.id} 
                  className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:bg-white hover:scale-[1.02]"
                >
                  <CardHeader className="pb-3 relative">
                    <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${getTypeColor(material.type)}`}></div>
                    
                    <div className="flex items-start space-x-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getTypeColor(material.type)} shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base md:text-lg font-semibold line-clamp-2 text-gray-800 group-hover:text-gray-900">
                          {material.title}
                        </CardTitle>
                        <Badge variant="secondary" className="mt-2 text-xs">
                          {getTypeLabel(material.type)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span className="font-medium">{material.subject}</span>
                        <span className="text-xs">{material.grade}</span>
                      </div>
                      
                      <div className="flex items-center text-xs text-gray-400">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(material.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewMaterial(material)}
                        className="flex-1 text-xs h-8"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Ver
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => navigate(`/material/${material.id}?edit=true`)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit3 className="w-3 h-3" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleExport(material, 'pdf')}
                        className="h-8 w-8 p-0"
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDelete(material.id, material.title)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <MaterialModal
        material={selectedMaterial}
        open={modalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default MaterialsList;
