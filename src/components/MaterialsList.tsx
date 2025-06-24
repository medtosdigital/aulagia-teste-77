
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

  const getTypeConfig = (type: string) => {
    const configs = {
      'plano-de-aula': {
        icon: BookOpen,
        label: 'Plano de Aula',
        bgColor: 'bg-blue-500',
        textColor: 'text-blue-500',
        bgGradient: 'bg-gradient-to-r from-blue-500 to-blue-600',
        badgeColor: 'bg-blue-100 text-blue-700'
      },
      'slides': {
        icon: Monitor,
        label: 'Slides',
        bgColor: 'bg-purple-500',
        textColor: 'text-purple-500',
        bgGradient: 'bg-gradient-to-r from-purple-500 to-purple-600',
        badgeColor: 'bg-purple-100 text-purple-700'
      },
      'atividade': {
        icon: FileText,
        label: 'Atividade',
        bgColor: 'bg-orange-500',
        textColor: 'text-orange-500',
        bgGradient: 'bg-gradient-to-r from-orange-500 to-orange-600',
        badgeColor: 'bg-orange-100 text-orange-700'
      },
      'avaliacao': {
        icon: ClipboardCheck,
        label: 'Avaliação',
        bgColor: 'bg-emerald-500',
        textColor: 'text-emerald-500',
        bgGradient: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
        badgeColor: 'bg-emerald-100 text-emerald-700'
      }
    };
    return configs[type as keyof typeof configs] || configs['atividade'];
  };

  const uniqueSubjects = [...new Set(materials.map(m => m.subject))];

  return (
    <>
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 md:mb-8 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Meus Materiais</h1>
            <p className="text-gray-600">Gerencie e organize seus conteúdos pedagógicos</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="px-3 py-1 text-sm">
              {filteredMaterials.length === 0 ? 'Nenhum' : filteredMaterials.length} {filteredMaterials.length === 1 ? 'material' : 'materiais'}
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
              const typeConfig = getTypeConfig(material.type);
              const IconComponent = typeConfig.icon;
              
              return (
                <Card 
                  key={material.id} 
                  className="group hover:shadow-xl transition-all duration-300 border-0 bg-white hover:scale-[1.02] overflow-hidden"
                >
                  {/* Cabeçalho colorido por tipo */}
                  <div className={`${typeConfig.bgGradient} p-4 text-white relative`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-sm">{typeConfig.label}</span>
                      </div>
                      <Badge className={`${typeConfig.badgeColor} border-0 text-xs font-medium`}>
                        {material.subject}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Título */}
                      <div>
                        <h3 className="font-semibold text-base text-gray-800 line-clamp-2 leading-tight mb-1">
                          {material.title}
                        </h3>
                        <p className="text-sm text-gray-500">{material.grade}</p>
                      </div>
                      
                      {/* Data de criação */}
                      <div className="flex items-center text-xs text-gray-400 border-t pt-3">
                        <Calendar className="w-3 h-3 mr-1" />
                        Criado em {new Date(material.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                    </div>

                    {/* Botões de ação */}
                    <div className="flex items-center justify-between space-x-2 mt-4 pt-3 border-t">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewMaterial(material)}
                        className="flex-1 text-xs h-8 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Visualizar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => navigate(`/material/${material.id}?edit=true`)}
                        className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                        title="Editar"
                      >
                        <Edit3 className="w-3 h-3" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleExport(material, 'pdf')}
                        className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
                        title="Exportar PDF"
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDelete(material.id, material.title)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200 h-8 w-8 p-0"
                        title="Excluir"
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
