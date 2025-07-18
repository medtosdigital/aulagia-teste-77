import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Monitor, FileText, ClipboardCheck, Eye, Edit3, Trash2, Download, Search, Filter, Plus, Calendar, Printer, FileDown, Lock, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { GeneratedMaterial } from '@/services/materialService';
import { userMaterialsService, UserMaterial } from '@/services/userMaterialsService';
import { exportService } from '@/services/exportService';
import { usePlanPermissions } from '@/hooks/usePlanPermissions';
import { useUpgradeModal } from '@/hooks/useUpgradeModal';
import { useAuth } from '@/contexts/AuthContext';
import MaterialModal from './MaterialModal';
import MaterialEditModal from './MaterialEditModal';
import MaterialInlineEditModal from './MaterialInlineEditModal';
import SupportMaterialModal from './SupportMaterialModal';
import { UpgradeModal } from './UpgradeModal';
import { activityService } from '@/services/activityService';
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
import { normalizeMaterialForPreview } from '@/services/materialService';
import { supabase } from '@/integrations/supabase/client';

// Interface para compatibilidade com GeneratedMaterial
interface GeneratedMaterialWithOptionalFormData extends Omit<GeneratedMaterial, 'formData'> {
  formData?: any;
}

interface SupportMaterial {
  id: string;
  titulo: string;
  conteudo: string;
  created_at: string;
  disciplina: string;
  tema: string;
  turma: string;
  material_principal_id: string;
}

// Cache em memória para materiais do usuário
const materialsCache = new Map<string, { data: GeneratedMaterialWithOptionalFormData[], timestamp: number }>();
const MATERIALS_CACHE_DURATION = 60000; // 60 segundos

const MaterialsList: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [materials, setMaterials] = useState<GeneratedMaterialWithOptionalFormData[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<GeneratedMaterialWithOptionalFormData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');
  const [selectedMaterial, setSelectedMaterial] = useState<GeneratedMaterialWithOptionalFormData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState<string | null>(null);
  const [inlineEditModalOpen, setInlineEditModalOpen] = useState(false);
  const [materialToEdit, setMaterialToEdit] = useState<GeneratedMaterialWithOptionalFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<GeneratedMaterialWithOptionalFormData | null>(null);
  
  // Support materials states
  const [supportMaterials, setSupportMaterials] = useState<SupportMaterial[]>([]);
  const [selectedSupportMaterial, setSelectedSupportMaterial] = useState<SupportMaterial | null>(null);
  const [supportMaterialModalOpen, setSupportMaterialModalOpen] = useState(false);
  const [supportMaterialEditModalOpen, setSupportMaterialEditModalOpen] = useState(false);
  const [supportMaterialToEdit, setSupportMaterialToEdit] = useState<SupportMaterial | null>(null);

  // Hooks para gerenciamento de planos
  const { canEditMaterials, canDownloadWord, canDownloadPPT } = usePlanPermissions();
  const { 
    isOpen: isUpgradeModalOpen, 
    closeModal: closeUpgradeModal, 
    openModal: openUpgradeModal,
    handlePlanSelection,
    currentPlan,
    availablePlans 
  } = useUpgradeModal();

  const [pendingEditId, setPendingEditId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadMaterials();
      loadSupportMaterials();
    } else {
      console.log('No authenticated user, redirecting to login');
      navigate('/login');
    }
  }, [user, navigate]);

  // Novo: abrir modal de edição automaticamente se houver ?edit=ID na URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const editId = params.get('edit');
    if (editId) {
      setPendingEditId(editId);
      loadMaterials(true);
      // Limpa o parâmetro edit da URL
      const newParams = new URLSearchParams(location.search);
      newParams.delete('edit');
      navigate({ search: newParams.toString() }, { replace: true });
    }
  }, [location.search, user, navigate]);

  useEffect(() => {
    if (pendingEditId && materials.length > 0) {
      const material = materials.find(m => m.id === pendingEditId);
      if (material) {
        setSelectedMaterial(material); // Setar selectedMaterial para edição
        setModalOpen(false); // Nunca abrir modal de visualização
        setEditModalOpen(true); // Abrir apenas o modal de edição
        setPendingEditId(null);
      }
    }
  }, [pendingEditId, materials]);

  useEffect(() => {
    filterMaterials();
  }, [materials, supportMaterials, searchTerm, filterType, filterSubject]);

  useEffect(() => {
    if (editModalOpen) {
      setModalOpen(false);
    }
  }, [editModalOpen]);

  const loadSupportMaterials = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('materiais_apoio')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setSupportMaterials(data);
        console.log('Support materials loaded:', data.length);
      } else {
        console.error('Error loading support materials:', error);
      }
    } catch (error) {
      console.error('Error loading support materials:', error);
    }
  };

  const convertUserMaterialToGenerated = (userMaterial: UserMaterial): GeneratedMaterialWithOptionalFormData => {
    // Parse content if it's a JSON string, otherwise use as is
    let parsedContent;
    try {
      parsedContent = typeof userMaterial.content === 'string' 
        ? JSON.parse(userMaterial.content) 
        : userMaterial.content;
    } catch {
      parsedContent = userMaterial.content;
    }

    return {
      id: userMaterial.id,
      title: userMaterial.title,
      type: userMaterial.type === 'plano-aula' ? 'plano-de-aula' : userMaterial.type,
      subject: userMaterial.subject,
      grade: userMaterial.grade,
      createdAt: userMaterial.createdAt,
      content: parsedContent,
      formData: undefined
    };
  };

  // Modifique loadMaterials para aceitar forceReload
  const loadMaterials = async (forceReload = false) => {
    if (!user) {
      console.log('No user available for loading materials');
      return;
    }
    const cacheKey = `materials_${user.id}`;
    const cached = materialsCache.get(cacheKey);
    const now = Date.now();
    if (!forceReload && cached && (now - cached.timestamp) < MATERIALS_CACHE_DURATION) {
      setMaterials(cached.data);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      console.log('Loading materials for authenticated user:', user.id);
      const supabaseMaterials = (await userMaterialsService.getMaterialsByUser()).slice(0, 20);
      console.log('Supabase materials count:', supabaseMaterials.length);
      const convertedMaterials = supabaseMaterials.map(convertUserMaterialToGenerated);
      console.log('Total materials for authenticated user:', convertedMaterials.length);
      setMaterials(convertedMaterials);
      materialsCache.set(cacheKey, { data: convertedMaterials, timestamp: now });
    } catch (error) {
      console.error('Error loading materials:', error);
      toast.error('Erro ao carregar materiais');
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  const filterMaterials = () => {
    let filtered = [...materials];

    if (searchTerm) {
      filtered = filtered.filter(material => 
        material.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        material.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(material => material.type === filterType);
    }

    if (filterSubject !== 'all') {
      filtered = filtered.filter(material => material.subject.toLowerCase() === filterSubject);
    }

    setFilteredMaterials(filtered);
  };

  const handleViewMaterial = (material: GeneratedMaterialWithOptionalFormData) => {
    console.log('Opening view modal for material:', material.title);
    setSelectedMaterial(material);
    setModalOpen(true);
    // Garantir que outros modais estão fechados
    setEditModalOpen(false);
    setInlineEditModalOpen(false);
    setSupportMaterialModalOpen(false);
    setSupportMaterialEditModalOpen(false);
  };

  const handleEditMaterial = (material: GeneratedMaterialWithOptionalFormData) => {
    if (!canEditMaterials()) {
      toast.error('Edição de materiais disponível apenas em planos pagos');
      openUpgradeModal();
      return;
    }
    
    console.log('Opening edit modal for material:', material.title);
    setSelectedMaterial(material);
    // Fechar todos os outros modais primeiro
    setModalOpen(false);
    setInlineEditModalOpen(false);
    setSupportMaterialModalOpen(false);
    setSupportMaterialEditModalOpen(false);
    // Abrir o modal de edição
    setEditModalOpen(true);
  };

  const handleEdit = (material: GeneratedMaterialWithOptionalFormData) => {
    if (!canEditMaterials()) {
      toast.error('Edição de materiais disponível apenas em planos pagos');
      openUpgradeModal();
      return;
    }
    
    console.log('Opening inline edit modal for material:', material.title);
    setMaterialToEdit(material);
    // Fechar todos os outros modais primeiro
    setModalOpen(false);
    setEditModalOpen(false);
    setSupportMaterialModalOpen(false);
    setSupportMaterialEditModalOpen(false);
    // Abrir o modal de edição inline
    setInlineEditModalOpen(true);
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
    if (user) materialsCache.delete(`materials_${user.id}`);
    loadMaterials();
    setEditModalOpen(false);
    setSelectedMaterial(null);
  };

  const handleInlineEditSave = () => {
    if (user) materialsCache.delete(`materials_${user.id}`);
    loadMaterials();
    setInlineEditModalOpen(false);
    setMaterialToEdit(null);
  };

  const handleDeleteClick = (material: GeneratedMaterialWithOptionalFormData) => {
    setMaterialToDelete(material);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!materialToDelete) return;
    
    try {
      let success = false;
      
      if (materialToDelete.formData?.supportMaterial) {
        // Delete support material
        const { error } = await supabase
          .from('materiais_apoio')
          .delete()
          .eq('id', materialToDelete.id);
        
        success = !error;
        if (success) {
          loadSupportMaterials(); // Reload support materials
        }
      } else {
        // Delete regular material
        success = await userMaterialsService.deleteMaterial(materialToDelete.id);
        if (success && user) {
          materialsCache.delete(`materials_${user.id}`);
          loadMaterials();
        }
      }
      
      if (success) {
        toast.success('Material excluído com sucesso!');
        activityService.addActivity({
          type: 'updated',
          title: materialToDelete.title,
          description: `Material excluído: ${materialToDelete.title}`,
          materialType: materialToDelete.type,
          materialId: materialToDelete.id,
          subject: materialToDelete.subject,
          grade: materialToDelete.grade
        });
      } else {
        toast.error('Erro ao excluir material');
      }
    } catch (error) {
      console.error('Erro ao excluir material:', error);
      toast.error('Erro ao excluir material');
    } finally {
      setDeleteDialogOpen(false);
      setMaterialToDelete(null);
    }
  };

  const handleExport = async (material: GeneratedMaterialWithOptionalFormData, format: 'pdf' | 'word' | 'ppt' | 'print') => {
    // Verificar permissões para download
    if (format === 'word' && !canDownloadWord()) {
      toast.error('Download em Word disponível apenas em planos pagos');
      openUpgradeModal();
      return;
    }

    if (format === 'ppt' && !canDownloadPPT()) {
      toast.error('Download em PowerPoint disponível apenas em planos pagos');
      openUpgradeModal();
      return;
    }

    try {
      if (material.formData?.supportMaterial) {
        // Handle support material export through the modal
        setSelectedSupportMaterial(material.formData.supportMaterial);
        setSupportMaterialModalOpen(true);
        return;
      }

      if (format === 'pdf') {
        await exportService.exportToPDFDownload(material as GeneratedMaterial);
        toast.success('PDF exportado com sucesso!');
      } else if (format === 'word') {
        await exportService.exportToWord(material as GeneratedMaterial);
        toast.success('Documento Word exportado com sucesso!');
      } else if (format === 'ppt') {
        await exportService.exportToPPT(material as GeneratedMaterial);
        toast.success('PowerPoint exportado com sucesso!');
      } else if (format === 'print') {
        await exportService.exportToPDF(material as GeneratedMaterial);
        toast.success('Material enviado para impressão!');
      }
      
      activityService.addActivity({
        type: 'exported',
        title: material.title,
        description: `Material exportado (${format.toUpperCase()}): ${material.title}`,
        materialType: material.type,
        materialId: material.id,
        subject: material.subject,
        grade: material.grade
      });
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
      },
      'apoio': {
        icon: HelpCircle,
        label: 'Conteúdo de Apoio',
        bgColor: 'bg-orange-500',
        textColor: 'text-orange-500',
        bgGradient: 'bg-gradient-to-r from-orange-500 to-orange-600',
        badgeColor: 'bg-orange-100 text-orange-700'
      }
    };
    return configs[type as keyof typeof configs] || configs['atividade'];
  };

  const uniqueSubjects = [...new Set([...materials.map(m => m.subject), ...supportMaterials.map(s => s.disciplina)])];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando materiais...</p>
        </div>
      </div>
    );
  }

  const handleViewSupportMaterial = (material: SupportMaterial) => {
    setSelectedSupportMaterial(material);
    setSupportMaterialModalOpen(true);
  };

  const handleEditSupportMaterial = (material: SupportMaterial) => {
    if (!canEditMaterials()) {
      toast.error('Edição de materiais de apoio disponível apenas em planos pagos');
      openUpgradeModal();
      return;
    }
    console.log('Opening support material edit modal for:', material.titulo);
    setSupportMaterialToEdit(material);
    setSupportMaterialEditModalOpen(true);
  };

  const handleExportSupportMaterial = async (material: SupportMaterial, format: 'pdf' | 'word' | 'ppt' | 'print') => {
    if (format === 'word' && !canDownloadWord()) {
      toast.error('Download em Word disponível apenas em planos pagos');
      openUpgradeModal();
      return;
    }

    if (format === 'ppt' && !canDownloadPPT()) {
      toast.error('Download em PowerPoint disponível apenas em planos pagos');
      openUpgradeModal();
      return;
    }

    try {
      // Use exportService com um objeto customizado, mas com type permitido
      const exportObj = {
        id: material.id,
        title: material.titulo,
        type: 'atividade' as 'atividade', // Use um tipo permitido explicitamente
        subject: material.disciplina,
        grade: 'Apoio',
        createdAt: material.created_at,
        content: material.conteudo,
        formData: { supportMaterial: material }
      };
      if (format === 'pdf') {
        await exportService.exportToPDFDownload(exportObj as GeneratedMaterial);
        toast.success('PDF exportado com sucesso!');
      } else if (format === 'word') {
        await exportService.exportToWord(exportObj as GeneratedMaterial);
        toast.success('Documento Word exportado com sucesso!');
      } else if (format === 'ppt') {
        await exportService.exportToPPT(exportObj as GeneratedMaterial);
        toast.success('PowerPoint exportado com sucesso!');
      } else if (format === 'print') {
        await exportService.exportToPDF(exportObj as GeneratedMaterial);
        toast.success('Material enviado para impressão!');
      }
      activityService.addActivity({
        type: 'exported',
        title: material.titulo,
        description: `Material de apoio exportado (${format.toUpperCase()}): ${material.titulo}`,
        materialType: 'atividade', // Use um tipo permitido
        materialId: material.id,
        subject: material.disciplina,
        grade: 'Apoio'
      });
    } catch (error) {
      toast.error('Erro ao exportar material de apoio');
      console.error('Export error:', error);
    }
    setExportDropdownOpen(null);
  };

  const handleDeleteSupportMaterial = async (material: SupportMaterial) => {
    setMaterialToDelete(null); // Não use o modal de confirmação global para apoio, ou crie um modal próprio se necessário
    try {
      const { error } = await supabase
        .from('materiais_apoio')
        .delete()
        .eq('id', material.id);
      if (!error) {
        toast.success('Material de apoio excluído com sucesso!');
        loadSupportMaterials();
      } else {
        toast.error('Erro ao excluir material de apoio');
      }
    } catch (error) {
      toast.error('Erro ao excluir material de apoio');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Enhanced Header */}
        <div className="flex flex-col space-y-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 space-y-2 sm:space-y-0">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Meus Materiais
                  </h1>
                  <Badge variant="secondary" className="py-1 text-sm bg-blue-100 text-blue-700 border-blue-200 w-fit px-[6px]">
                    {currentPlan?.id === 'admin' ? 'Materiais Ilimitados' : `${filteredMaterials.length} ${filteredMaterials.length === 1 ? 'material' : 'materiais'}`}
                  </Badge>
                </div>
              </div>
              <p className="text-gray-600 text-lg">Gerencie e organize seus conteúdos pedagógicos com elegância</p>
            </div>
            <Button 
              onClick={() => navigate('/')} 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all w-full md:w-auto"
            >
              <Plus className="w-5 h-5 mr-2" />
              Criar Novo Material
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <Card className="mb-6 shadow-lg bg-white/80 backdrop-blur-sm border-0">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input 
                    placeholder="Buscar por título ou disciplina..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                    className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 h-12" 
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 md:w-auto">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full sm:w-48 h-12">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="plano-de-aula">Plano de Aula</SelectItem>
                    <SelectItem value="slides">Slides</SelectItem>
                    <SelectItem value="atividade">Atividade</SelectItem>
                    <SelectItem value="avaliacao">Avaliação</SelectItem>
                    <SelectItem value="apoio">Conteúdo de Apoio</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterSubject} onValueChange={setFilterSubject}>
                  <SelectTrigger className="w-full sm:w-48 h-12">
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

        {/* Lista de Materiais */}
        {filteredMaterials.length === 0 && supportMaterials.length === 0 ? (
          <Card className="shadow-lg bg-white/90 backdrop-blur-sm">
            <CardContent className="p-8 md:p-12 text-center">
              <div className="text-gray-400 mb-4">
                <FileText className="w-12 h-12 md:w-16 md:h-16 mx-auto" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-600 mb-2">
                Nenhum material encontrado
              </h3>
              <p className="text-gray-500 mb-6">
                Tente ajustar os filtros para encontrar o que procura.
              </p>
              <Button 
                onClick={() => navigate('/')} 
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Material
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filteredMaterials.map(material => {
              const typeConfig = getTypeConfig(material.type);
              const IconComponent = typeConfig.icon;
              
              return (
                <Card key={material.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white hover:scale-[1.02] overflow-hidden relative">
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
                      
                      {/* Botão de edição com verificação de permissão */}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEdit(material)} 
                        className={`h-8 w-8 p-0 ${canEditMaterials() 
                          ? 'hover:bg-blue-50 hover:text-blue-600' 
                          : 'opacity-50 cursor-not-allowed hover:bg-gray-50'
                        }`}
                        title={canEditMaterials() ? "Editar" : "Edição disponível apenas em planos pagos"}
                      >
                        {canEditMaterials() ? (
                          <Edit3 className="w-3 h-3" />
                        ) : (
                          <Lock className="w-3 h-3" />
                        )}
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
                            
                            {/* Opções condicionais baseadas no tipo de material e permissões */}
                            {material.type === 'slides' ? (
                              <button 
                                onClick={() => handleExport(material, 'ppt')} 
                                className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center ${
                                  canDownloadPPT() ? '' : 'opacity-50 cursor-not-allowed'
                                }`}
                                disabled={!canDownloadPPT()}
                              >
                                {canDownloadPPT() ? (
                                  <FileDown className="w-3 h-3 mr-2" />
                                ) : (
                                  <Lock className="w-3 h-3 mr-2" />
                                )}
                                PPT {!canDownloadPPT() && '(Premium)'}
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleExport(material, 'word')} 
                                className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center ${
                                  canDownloadWord() ? '' : 'opacity-50 cursor-not-allowed'
                                }`}
                                disabled={!canDownloadWord()}
                              >
                                {canDownloadWord() ? (
                                  <FileDown className="w-3 h-3 mr-2" />
                                ) : (
                                  <Lock className="w-3 h-3 mr-2" />
                                )}
                                Word {!canDownloadWord() && '(Premium)'}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDeleteClick(material)} 
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
            {supportMaterials.map((apoio) => (
              <Card key={apoio.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white hover:scale-[1.02] overflow-hidden relative">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 text-white relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                        <HelpCircle className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-sm">Conteúdo de Apoio</span>
                    </div>
                    <Badge className="bg-orange-100 text-orange-700 border-0 text-xs font-medium">
                      {apoio.disciplina}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-base text-gray-800 line-clamp-2 leading-tight mb-1">
                      {apoio.titulo}
                    </h3>
                    {/* Removido: <SupportMaterialPrincipalInfo materialPrincipalId={apoio.material_principal_id} /> */}
                    {/* Removido: textos de disciplina, turma, material principal */}
                    <p className="text-xs text-gray-500">Conteúdo de Apoio Didático</p>
                    <div className="flex items-center text-xs text-gray-400 border-t pt-3">
                      <Calendar className="w-3 h-3 mr-1" />
                      Criado em {new Date(apoio.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  {/* Botões de ação */}
                  <div className="flex items-center justify-between space-x-2 mt-4 pt-3 border-t">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleViewSupportMaterial(apoio)} 
                      className="flex-1 text-xs h-8 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Visualizar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEditSupportMaterial(apoio)} 
                      className={`h-8 w-8 p-0 ${canEditMaterials() 
                        ? 'hover:bg-blue-50 hover:text-blue-600' 
                        : 'opacity-50 cursor-not-allowed hover:bg-gray-50'
                      }`}
                      title={canEditMaterials() ? "Editar" : "Edição disponível apenas em planos pagos"}
                    >
                      {canEditMaterials() ? (
                        <Edit3 className="w-3 h-3" />
                      ) : (
                        <Lock className="w-3 h-3" />
                      )}
                    </Button>
                    {/* Dropdown de exportação */}
                    <div className="relative">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => toggleExportDropdown(apoio.id)} 
                        className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600" 
                        title="Exportar"
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                      {exportDropdownOpen === apoio.id && (
                        <div className="absolute bottom-full mb-1 right-0 z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[120px]">
                          <button 
                            onClick={() => handleExportSupportMaterial(apoio, 'print')} 
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
                          >
                            <Printer className="w-3 h-3 mr-2" />
                            Imprimir
                          </button>
                          <button 
                            onClick={() => handleExportSupportMaterial(apoio, 'pdf')} 
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
                          >
                            <FileDown className="w-3 h-3 mr-2" />
                            PDF
                          </button>
                          <button 
                            onClick={() => handleExportSupportMaterial(apoio, 'word')} 
                            className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center ${
                              canDownloadWord() ? '' : 'opacity-50 cursor-not-allowed'
                            }`}
                            disabled={!canDownloadWord()}
                          >
                            {canDownloadWord() ? (
                              <FileDown className="w-3 h-3 mr-2" />
                            ) : (
                              <Lock className="w-3 h-3 mr-2" />
                            )}
                            Word {!canDownloadWord() && '(Premium)'}
                          </button>
                        </div>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDeleteSupportMaterial(apoio)} 
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200 h-8 w-8 p-0" 
                      title="Excluir"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Fechar dropdown quando clicar fora */}
      {exportDropdownOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setExportDropdownOpen(null)} />
      )}

      {/* Modal de visualização */}
      <MaterialModal 
        material={normalizeMaterialForPreview(selectedMaterial as GeneratedMaterial)} 
        open={modalOpen && !pendingEditId} // Só abre se não houver pendingEditId
        onClose={handleCloseModal} 
        onEdit={() => {
          setModalOpen(false);
          setTimeout(() => {
            setMaterialToEdit(selectedMaterial);
            setInlineEditModalOpen(true);
            setSelectedMaterial(null); // Limpa o selectedMaterial para garantir que o modal de visualização não reabra
          }, 200);
        }}
      />

      {/* Modal de edição */}
      <MaterialEditModal 
        material={normalizeMaterialForPreview(selectedMaterial as GeneratedMaterial)} 
        open={editModalOpen} 
        onClose={handleCloseEditModal} 
        onSave={handleSaveEdit} 
      />

      {/* Modal de edição inline */}
      <MaterialInlineEditModal 
        material={normalizeMaterialForPreview(materialToEdit as GeneratedMaterial)} 
        open={inlineEditModalOpen} 
        onClose={() => {
          setInlineEditModalOpen(false);
          setMaterialToEdit(null);
        }} 
        onSave={handleInlineEditSave} 
      />

      {/* Support Material View Modal */}
      <SupportMaterialModal 
        material={selectedSupportMaterial}
        open={supportMaterialModalOpen}
        onClose={() => {
          setSupportMaterialModalOpen(false);
          setSelectedSupportMaterial(null);
        }}
        onDelete={() => {
          loadSupportMaterials();
        }}
      />

      {/* Support Material Edit Modal */}
      <SupportMaterialModal
        material={supportMaterialToEdit}
        open={supportMaterialEditModalOpen}
        onClose={() => {
          setSupportMaterialEditModalOpen(false);
          setSupportMaterialToEdit(null);
        }}
        onDelete={() => {
          loadSupportMaterials();
          setSupportMaterialEditModalOpen(false);
          setSupportMaterialToEdit(null);
        }}
        isEditMode={true}
      />

      {/* Modal de upgrade */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={closeUpgradeModal}
        onPlanSelect={handlePlanSelection}
        currentPlan={currentPlan}
      />

      {/* Modal de confirmação de exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{materialToDelete?.title}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MaterialsList;

// Adicione o componente auxiliar para buscar e exibir dados do material principal
function SupportMaterialPrincipalInfo({ materialPrincipalId }: { materialPrincipalId: string }) {
  const [info, setInfo] = React.useState<{ titulo: string; disciplina: string; turma: string } | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (!materialPrincipalId) return;
    // Função auxiliar para buscar em todas as tabelas possíveis
    const fetchMaterial = async () => {
      // Use os nomes de tabelas válidos e tipados explicitamente
      const tables: Array<{ table: 'planos_de_aula' | 'atividades' | 'slides' | 'avaliacoes'; fields: string }> = [
        { table: 'planos_de_aula', fields: 'titulo, disciplina, serie' },
        { table: 'atividades', fields: 'titulo, disciplina, serie' },
        { table: 'slides', fields: 'titulo, disciplina, serie' },
        { table: 'avaliacoes', fields: 'titulo, disciplina, serie' }
      ];
      for (const t of tables) {
        const { data, error } = await supabase
          .from(t.table)
          .select(t.fields)
          .eq('id', materialPrincipalId)
          .single();
        // Se houver erro ou data for null, continue
        if (error || !data) continue;
        // Só acesse as propriedades se data não for erro
        if (
          typeof data === 'object' &&
          'titulo' in data &&
          'disciplina' in data &&
          'serie' in data
        ) {
          setInfo({
            titulo: data.titulo ?? '',
            disciplina: data.disciplina ?? '',
            turma: data.serie ?? ''
          });
          setError(null);
          return;
        }
      }
      setError('Material principal não encontrado.');
    };
    fetchMaterial();
  }, [materialPrincipalId]);
  if (error) return <div className="text-xs text-red-500 mb-1">{error}</div>;
  if (!info) return null;
  return (
    <div className="text-xs text-gray-600 mb-1">
      <span className="font-medium">Material Principal:</span> {info.titulo} <span className="text-gray-400">|</span> <span className="font-medium">Disciplina:</span> {info.disciplina} <span className="text-gray-400">|</span> <span className="font-medium">Turma:</span> {info.turma}
    </div>
  );
}
