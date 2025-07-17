
import React, { useState, useEffect } from 'react';
import { Eye, Edit3, Trash2, Download, Share2, Copy, FileText, Presentation, ClipboardList, FileQuestion, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { materialService, type GeneratedMaterial } from '@/services/materialService';
import { activityService } from '@/services/activityService';
import MaterialModal from './MaterialModal';
import MaterialEditModal from './MaterialEditModal';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel
} from '@/components/ui/alert-dialog';
import { usePlanPermissions } from '@/hooks/usePlanPermissions';
import { useUpgradeModal } from '@/hooks/useUpgradeModal';

const MaterialsList: React.FC = () => {
  const [materials, setMaterials] = useState<GeneratedMaterial[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<GeneratedMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMaterial, setSelectedMaterial] = useState<GeneratedMaterial | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<GeneratedMaterial | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<GeneratedMaterial | null>(null);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [gradeFilter, setGradeFilter] = useState<string>('all');

  const { canEditMaterials, canDownloadWord } = usePlanPermissions();
  const { openModal: openUpgradeModal } = useUpgradeModal();

  useEffect(() => {
    loadMaterials();
  }, []);

  useEffect(() => {
    filterMaterials();
  }, [materials, searchTerm, typeFilter, subjectFilter, gradeFilter]);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const allMaterials = await materialService.getAllMaterials();
      setMaterials(allMaterials);
    } catch (error) {
      console.error('Error loading materials:', error);
      toast.error('Erro ao carregar materiais');
    } finally {
      setLoading(false);
    }
  };

  const filterMaterials = () => {
    let filtered = materials;

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(material =>
        material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.grade.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por tipo
    if (typeFilter !== 'all') {
      filtered = filtered.filter(material => material.type === typeFilter);
    }

    // Filtro por disciplina
    if (subjectFilter !== 'all') {
      filtered = filtered.filter(material => material.subject === subjectFilter);
    }

    // Filtro por série
    if (gradeFilter !== 'all') {
      filtered = filtered.filter(material => material.grade === gradeFilter);
    }

    setFilteredMaterials(filtered);
  };

  const handleView = (material: GeneratedMaterial) => {
    setSelectedMaterial(material);
    setModalOpen(true);
  };

  const handleEdit = (material: GeneratedMaterial) => {
    if (!canEditMaterials()) {
      toast.error('Edição de materiais disponível apenas em planos pagos');
      openUpgradeModal();
      return;
    }
    
    setEditingMaterial(material);
    setEditModalOpen(true);
  };

  const handleDelete = async (material: GeneratedMaterial) => {
    setMaterialToDelete(material);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!materialToDelete) return;

    try {
      const success = await materialService.deleteMaterial(materialToDelete.id);
      if (success) {
        toast.success('Material excluído com sucesso!');
        await loadMaterials();
        activityService.addActivity({
          type: 'deleted',
          title: materialToDelete.title,
          description: `Material excluído: ${materialToDelete.title} (${materialToDelete.type})`,
          materialType: materialToDelete.type,
          materialId: materialToDelete.id,
          subject: materialToDelete.subject,
          grade: materialToDelete.grade
        });
      } else {
        toast.error('Erro ao excluir material');
      }
    } catch (error) {
      console.error('Error deleting material:', error);
      toast.error('Erro ao excluir material');
    } finally {
      setDeleteDialogOpen(false);
      setMaterialToDelete(null);
    }
  };

  const handleShare = async (material: GeneratedMaterial) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: material.title,
          text: `Confira este material: ${material.title}`,
          url: window.location.href
        });
      } catch (error) {
        // User cancelled sharing or error occurred
        handleCopyLink(material);
      }
    } else {
      handleCopyLink(material);
    }
  };

  const handleCopyLink = (material: GeneratedMaterial) => {
    navigator.clipboard.writeText(`${window.location.origin}?material=${material.id}`);
    toast.success('Link copiado para a área de transferência!');
  };

  const handleExport = (material: GeneratedMaterial, format: 'pdf' | 'word' | 'print') => {
    if (format === 'word' && !canDownloadWord()) {
      toast.error('Download em Word disponível apenas em planos pagos');
      openUpgradeModal();
      return;
    }

    // Implementar lógica de exportação similar ao MaterialModal
    toast.success(`Exportando ${material.title} em ${format.toUpperCase()}...`);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'plano-de-aula':
        return <FileText className="w-5 h-5" />;
      case 'slides':
        return <Presentation className="w-5 h-5" />;
      case 'atividade':
        return <ClipboardList className="w-5 h-5" />;
      case 'avaliacao':
        return <FileQuestion className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'plano-de-aula':
        return 'Plano de Aula';
      case 'slides':
        return 'Slides';
      case 'atividade':
        return 'Atividade';
      case 'avaliacao':
        return 'Avaliação';
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'plano-de-aula':
        return 'bg-blue-100 text-blue-800';
      case 'slides':
        return 'bg-green-100 text-green-800';
      case 'atividade':
        return 'bg-orange-100 text-orange-800';
      case 'avaliacao':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Obter listas únicas para os filtros
  const uniqueTypes = Array.from(new Set(materials.map(m => m.type)));
  const uniqueSubjects = Array.from(new Set(materials.map(m => m.subject))).filter(Boolean);
  const uniqueGrades = Array.from(new Set(materials.map(m => m.grade))).filter(Boolean);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Carregando materiais...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Input
          placeholder="Buscar materiais..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {uniqueTypes.map(type => (
              <SelectItem key={type} value={type}>
                {getTypeName(type)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por disciplina" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as disciplinas</SelectItem>
            {uniqueSubjects.map(subject => (
              <SelectItem key={subject} value={subject}>
                {subject}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={gradeFilter} onValueChange={setGradeFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por série" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as séries</SelectItem>
            {uniqueGrades.map(grade => (
              <SelectItem key={grade} value={grade}>
                {grade}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lista de materiais */}
      {filteredMaterials.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500">Nenhum material encontrado</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((material) => (
            <Card key={material.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(material.type)}
                    <Badge className={getTypeColor(material.type)}>
                      {getTypeName(material.type)}
                    </Badge>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleView(material)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Visualizar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleEdit(material)}
                        disabled={!canEditMaterials()}
                      >
                        <Edit3 className="mr-2 h-4 w-4" />
                        Editar {!canEditMaterials() && '(Premium)'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleShare(material)}>
                        <Share2 className="mr-2 h-4 w-4" />
                        Compartilhar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleCopyLink(material)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copiar link
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExport(material, 'pdf')}>
                        <Download className="mr-2 h-4 w-4" />
                        Baixar PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleExport(material, 'word')}
                        disabled={!canDownloadWord()}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Baixar Word {!canDownloadWord() && '(Premium)'}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(material)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                  {material.title}
                </h3>
                
                <div className="space-y-1 text-sm text-gray-600 mb-4">
                  <div><strong>Disciplina:</strong> {material.subject}</div>
                  <div><strong>Série:</strong> {material.grade}</div>
                  <div><strong>Criado em:</strong> {new Date(material.createdAt).toLocaleDateString('pt-BR')}</div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleView(material)}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Visualizar
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(material)}
                    disabled={!canEditMaterials()}
                    className={canEditMaterials() ? 'hover:bg-blue-50' : 'opacity-50 cursor-not-allowed'}
                    title={canEditMaterials() ? 'Editar' : 'Edição disponível apenas em planos pagos'}
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de visualização */}
      <MaterialModal
        material={selectedMaterial}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedMaterial(null);
        }}
      />

      {/* Modal de edição */}
      <MaterialEditModal
        material={editingMaterial}
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingMaterial(null);
        }}
        onSave={() => {
          setEditModalOpen(false);
          setEditingMaterial(null);
          loadMaterials(); // Recarregar a lista
        }}
      />

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{materialToDelete?.title}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MaterialsList;
