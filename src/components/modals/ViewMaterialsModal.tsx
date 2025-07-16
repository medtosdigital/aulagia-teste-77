import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, FileText, Users } from 'lucide-react';
import { userMaterialsService, UserMaterial } from '@/services/userMaterialsService';
import MaterialModal from '../MaterialModal';
import { normalizeMaterialForPreview } from '@/services/materialService';

interface Teacher {
  id: string;
  name: string;
  email: string;
  subject: string;
  grade: string;
  materialsCount: number;
}

interface ViewMaterialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: Teacher | null;
}

const ViewMaterialsModal: React.FC<ViewMaterialsModalProps> = ({
  isOpen,
  onClose,
  teacher
}) => {
  const [materials, setMaterials] = useState<UserMaterial[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<UserMaterial | null>(null);
  const [materialModalOpen, setMaterialModalOpen] = useState(false);

  useEffect(() => {
    if (teacher && isOpen) {
      loadMaterials();
    }
  }, [teacher, isOpen]);

  const loadMaterials = async () => {
    if (!teacher) return;
    
    try {
      setLoading(true);
      // Carregar materiais reais do usuário com await
      const userMaterials = await userMaterialsService.getMaterialsByUser();
      setMaterials(userMaterials);
    } catch (error) {
      console.error('Error loading materials:', error);
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'plano-aula':
        return <FileText className="h-4 w-4" />;
      case 'slides':
        return <Users className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'plano-aula':
        return <Badge className="bg-blue-100 text-blue-800 text-xs">Plano de Aula</Badge>;
      case 'slides':
        return <Badge className="bg-purple-100 text-purple-800 text-xs">Slides</Badge>;
      case 'atividade':
        return <Badge className="bg-green-100 text-green-800 text-xs">Atividade</Badge>;
      case 'avaliacao':
        return <Badge className="bg-orange-100 text-orange-800 text-xs">Avaliação</Badge>;
      default:
        return <Badge className="text-xs">Material</Badge>;
    }
  };

  if (!teacher) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl p-0 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            Materiais de {teacher.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">{teacher.name}</h3>
                <p className="text-sm text-gray-600">{teacher.subject} • {teacher.grade}</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Total de materiais criados: <span className="font-semibold">{materials.length}</span>
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Materiais Criados</h4>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Carregando materiais...</p>
              </div>
            ) : materials.length > 0 ? (
              materials.map((material) => (
                <div key={material.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => { setSelectedMaterial(material); setMaterialModalOpen(true); }}>
                  <div className="mt-1">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      {getTypeIcon(material.type)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium text-gray-900 truncate">{material.title}</h5>
                    <p className="text-sm text-gray-600">{material.subject} • {material.grade}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {getTypeBadge(material.type)}
                      <span className="text-xs text-gray-400">Criado em {material.createdAt}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum material encontrado</p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
      <MaterialModal
        material={selectedMaterial ? normalizeMaterialForPreview(selectedMaterial) : null}
        open={materialModalOpen}
        onClose={() => setMaterialModalOpen(false)}
      />
    </Dialog>
  );
};

export default ViewMaterialsModal;
