
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';

interface Teacher {
  id: string;
  name: string;
  email: string;
  subject: string;
  grade: string;
  materialsCount: number;
}

interface RemoveTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: Teacher | null;
  onConfirm: (teacherId: string) => void;
}

const RemoveTeacherModal: React.FC<RemoveTeacherModalProps> = ({
  isOpen,
  onClose,
  teacher,
  onConfirm
}) => {
  const handleConfirm = () => {
    if (teacher) {
      onConfirm(teacher.id);
      onClose();
    }
  };

  if (!teacher) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Remover Professor
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            Tem certeza que deseja remover <strong>{teacher.name}</strong> da escola?
            <br />
            <br />
            <strong>Esta ação é irreversível e:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>O professor perderá acesso à plataforma</li>
              <li>Todos os {teacher.materialsCount} materiais criados serão mantidos</li>
              <li>O professor precisará ser readicionado para ter acesso novamente</li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            Remover Professor
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RemoveTeacherModal;
