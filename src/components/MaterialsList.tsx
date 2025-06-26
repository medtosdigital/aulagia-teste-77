import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Calendar, Download, Edit, Eye, Trash2, FileText, BookOpen, Monitor, ClipboardCheck, Lock, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { materialService, GeneratedMaterial } from '@/services/materialService';
import { scheduleService } from '@/services/scheduleService';
import { exportService } from '@/services/exportService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import MaterialModal from './MaterialModal';
import ScheduleModal from './ScheduleModal';
import UpgradeModal from './UpgradeModal';
import { usePlanPermissions } from '@/hooks/usePlanPermissions';
import { useUpgradeModal } from '@/hooks/useUpgradeModal';

const MaterialsList: React.FC = () => {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState<GeneratedMaterial[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<GeneratedMaterial[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<GeneratedMaterial | null>(null);
  const [deleteMaterialId, setDeleteMaterialId] = useState<string | null>(null);

  // Hooks para gerenciamento de planos
  const { currentPlan } = usePlanPermissions();
  const { 
    isOpen: isUpgradeModalOpen, 
    closeModal: closeUpgradeModal, 
    handlePlanSelection,
    availablePlans 
  } = useUpgradeModal();

  useEffect(() => {
    loadMaterials();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [materials, searchTerm, selectedSubject, selectedGrade]);

  const loadMaterials = () => {
    const loadedMaterials = materialService.getMaterials();
    setMaterials(loadedMaterials);
  };

  const applyFilters = () => {
    let results = [...materials];

    if (searchTerm) {
      results = results.filter(material =>
        material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedSubject) {
      results = results.filter(material => material.subject === selectedSubject);
    }

    if (selectedGrade) {
      results = results.filter(material => material.grade === selectedGrade);
    }

    setFilteredMaterials(results);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleSubjectChange = (subject: string) => {
    setSelectedSubject(subject);
  };

  const handleGradeChange = (grade: string) => {
    setSelectedGrade(grade);
  };

  const handleView = (material: GeneratedMaterial) => {
    navigate(`/material/${material.id}`);
  };

  const handleDownload = async (material: GeneratedMaterial) => {
    // Verificar se o usuário tem permissão para download
    if (currentPlan.id === 'gratuito' && !currentPlan.limits.canDownloadWord) {
      toast.error('Download em Word disponível apenas nos planos pagos');
      return;
    }

    try {
      await exportService.exportToWord(material);
      toast.success('Material exportado com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar material');
    }
  };

  const handleEdit = (material: GeneratedMaterial) => {
    // Verificar se o usuário tem permissão para edição
    if (currentPlan.id === 'gratuito' && !currentPlan.limits.canEditMaterials) {
      toast.error('Edição de materiais disponível apenas nos planos pagos');
      return;
    }

    setSelectedMaterial(material);
    setShowEditModal(true);
  };

  const handleSchedule = (material: GeneratedMaterial) => {
    // Verificar se o usuário tem permissão para agendamento
    if (currentPlan.id === 'gratuito' && !currentPlan.limits.hasCalendar) {
      toast.error('Agendamento disponível apenas nos planos pagos');
      return;
    }

    setSelectedMaterial(material);
    setShowScheduleModal(true);
  };

  const handleDelete = (materialId: string) => {
    setDeleteMaterialId(materialId);
  };

  const confirmDelete = () => {
    if (deleteMaterialId) {
      const success = materialService.deleteMaterial(deleteMaterialId);
      if (success) {
        toast.success('Material excluído com sucesso!');
        loadMaterials();
      } else {
        toast.error('Erro ao excluir material');
      }
      setDeleteMaterialId(null);
    }
  };

  const cancelDelete = () => {
    setDeleteMaterialId(null);
  };

  const closeModal = () => {
    setShowEditModal(false);
    setShowScheduleModal(false);
    setSelectedMaterial(null);
    loadMaterials();
  };

  const subjects = Array.from(new Set(materials.map(material => material.subject)));
  const grades = Array.from(new Set(materials.map(material => material.grade)));

  const canUseFeature = (feature: string): boolean => {
    if (currentPlan.id === 'gratuito') {
      switch (feature) {
        case 'download':
          return currentPlan.limits.canDownloadWord;
        case 'edit':
          return currentPlan.limits.canEditMaterials;
        case 'schedule':
          return currentPlan.limits.hasCalendar;
        default:
          return true;
      }
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-800">Meus Materiais</h1>
          <p className="text-gray-600">Gerencie e organize seus materiais didáticos</p>
        </div>

        <Input
          type="search"
          placeholder="Buscar material..."
          className="w-full md:w-auto max-w-md"
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Select onValueChange={handleSubjectChange}>
          <SelectTrigger className="w-full md:w-52">
            <SelectValue placeholder="Filtrar por disciplina" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas as disciplinas</SelectItem>
            {subjects.map(subject => (
              <SelectItem key={subject} value={subject}>{subject}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={handleGradeChange}>
          <SelectTrigger className="w-full md:w-52">
            <SelectValue placeholder="Filtrar por turma" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas as turmas</SelectItem>
            {grades.map(grade => (
              <SelectItem key={grade} value={grade}>{grade}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.map((material) => (
          <Card key={material.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {material.title}
                <Badge variant="secondary">{material.subject}</Badge>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6">
              <p className="text-gray-600 mb-4">
                <FileText className="inline-block w-4 h-4 mr-1 align-middle" />
                {material.topic}
              </p>
              <p className="text-sm text-gray-500">
                <BookOpen className="inline-block w-3 h-3 mr-1 align-middle" />
                {material.grade}
              </p>

              <div className="flex flex-wrap gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleView(material)}
                  className="flex-1 min-w-0 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Visualizar
                </Button>

                <div className="flex gap-2 flex-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(material)}
                    disabled={!canUseFeature('download')}
                    className={`flex-1 ${
                      canUseFeature('download')
                        ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                        : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {canUseFeature('download') ? (
                      <>
                        <Download className="w-4 h-4 mr-1" />
                        Word
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-1" />
                        <Crown className="w-3 h-3" />
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(material)}
                    disabled={!canUseFeature('edit')}
                    className={`flex-1 ${
                      canUseFeature('edit')
                        ? 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100'
                        : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {canUseFeature('edit') ? (
                      <>
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-1" />
                        <Crown className="w-3 h-3" />
                      </>
                    )}
                  </Button>
                </div>

                <div className="flex gap-2 w-full mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSchedule(material)}
                    disabled={!canUseFeature('schedule')}
                    className={`flex-1 ${
                      canUseFeature('schedule')
                        ? 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100'
                        : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {canUseFeature('schedule') ? (
                      <>
                        <Calendar className="w-4 h-4 mr-1" />
                        Agendar
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-1" />
                        <Crown className="w-3 h-3" />
                      </>
                    )}
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Excluir
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação é irreversível. Tem certeza de que deseja excluir este material?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={cancelDelete}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete}>Excluir</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <MaterialModal
        material={selectedMaterial}
        open={showEditModal}
        onClose={closeModal}
      />

      <ScheduleModal
        open={showScheduleModal}
        onClose={closeModal}
        onSave={closeModal}
        event={null}
        selectedDate={undefined}
      />

      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={closeUpgradeModal}
        onSelectPlan={handlePlanSelection}
        availablePlans={availablePlans}
        currentPlanName={currentPlan.name}
      />
    </div>
  );
};

export default MaterialsList;
