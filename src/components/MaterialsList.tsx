import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Monitor, FileText, ClipboardCheck, Eye, Edit3, Trash2, Download, Search, Filter, Plus, Calendar, Printer, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { materialService, GeneratedMaterial } from '@/services/materialService';
import { exportService } from '@/services/exportService';
import MaterialModal from './MaterialModal';
import MaterialEditModal from './MaterialEditModal';

const MaterialsList: React.FC = () => {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState<GeneratedMaterial[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<GeneratedMaterial[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');
  const [selectedMaterial, setSelectedMaterial] = useState<GeneratedMaterial | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState<string | null>(null);

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

  const handleEditMaterial = (material: GeneratedMaterial) => {
    setSelectedMaterial(material);
    setEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedMaterial(null);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedMaterial(null);
  };

  const handleSaveEdit = () => {
    loadMaterials();
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

  const handleExport = async (material: GeneratedMaterial, format: 'pdf' | 'word' | 'ppt' | 'print') => {
    try {
      if (format === 'pdf') {
        await exportService.exportToPDF(material);
        toast.success('PDF exportado com sucesso!');
      } else if (format === 'word') {
        await exportService.exportToWord(material);
        toast.success('Documento Word exportado com sucesso!');
      } else if (format === 'ppt') {
        await exportService.exportToPPT(material);
        toast.success('PowerPoint exportado com sucesso!');
      } else if (format === 'print') {
        await exportService.exportToPDF(material);
        toast.success('Material enviado para impressão!');
      }
    } catch (error) {
      toast.error('Erro ao exportar material');
      console.error('Export error:', error);
    }
    setExportDropdownOpen(null);
  };

  const toggleExportDropdown = (materialId: string) => {
    setExportDropdownOpen(exportDropdownOpen === materialId ? null : materialId);
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
        bgColor: 'bg-gray-500',
        textColor: 'text-gray-500',
        bgGradient: 'bg-gradient-to-r from-gray-500 to-gray-600',
        badgeColor: 'bg-gray-100 text-gray-700'
      },
      'atividade': {
        icon: FileText,
        label: 'Atividade',
        bgColor: 'bg-green-500',
        textColor: 'text-green-500',
        bgGradient: 'bg-gradient-to-r from-green-500 to-green-600',
        badgeColor: 'bg-green-100 text-green-700'
      },
      'avaliacao': {
        icon: ClipboardCheck,
        label: 'Avaliação',
        bgColor: 'bg-purple-500',
        textColor: 'text-purple-500',
        bgGradient: 'bg-gradient-to-r from-purple-500 to-purple-600',
        badgeColor: 'bg-purple-100 text-purple-700'
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
                  className="group hover:shadow-xl transition-all duration-300 border-0 bg-white hover:scale-[1.02] overflow-hidden relative"
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
                          {material.title.replace(/^(plano-de-aula|slides|atividade|avaliacao)\s*-\s*/i, '')}
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
                        onClick={() => handleEditMaterial(material)}
                        className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                        title="Editar"
                      >
                        <Edit3 className="w-3 h-3" />
                      </Button>
                      
                      {/* Dropdown de exportação */}
                      <div className="relative">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => toggleExportDropdown(material.id)}
                          className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
                          title="Exportar"
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                        
                        {exportDropdownOpen === material.id && (
                          <div className="absolute bottom-full mb-1 right-0 z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[120px]">
                            <button
                              onClick={() => handleExport(material, 'print')}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
                            >
                              <Printer className="w-3 h-3 mr-2" />
                              Imprimir
                            </button>
                            <button
                              onClick={() => handleExport(material, 'pdf')}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
                            >
                              <FileDown className="w-3 h-3 mr-2" />
                              PDF
                            </button>
                            {material.type === 'slides' ? (
                              <button
                                onClick={() => handleExport(material, 'ppt')}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
                              >
                                <FileDown className="w-3 h-3 mr-2" />
                                PPT
                              </button>
                            ) : (
                              <button
                                onClick={() => handleExport(material, 'word')}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
                              >
                                <FileDown className="w-3 h-3 mr-2" />
                                Word
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      
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

      {/* Fechar dropdown quando clicar fora */}
      {exportDropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setExportDropdownOpen(null)}
        />
      )}

      <MaterialModal
        material={selectedMaterial}
        open={modalOpen}
        onClose={handleCloseModal}
      />

      <MaterialEditModal
        material={selectedMaterial}
        open={editModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleSaveEdit}
      />
    </>
  );
};

export default MaterialsList;
