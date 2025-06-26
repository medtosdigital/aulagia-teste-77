
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
import { Mail } from 'lucide-react';

interface Teacher {
  id: string;
  name: string;
  email: string;
  subject: string;
  grade: string;
}

interface ResendInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: Teacher | null;
  onConfirm: (teacherId: string) => void;
}

const ResendInviteModal: React.FC<ResendInviteModalProps> = ({
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
          <AlertDialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-600" />
            Reenviar Convite
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            Deseja reenviar o convite de acesso para <strong>{teacher.name}</strong>?
            <br />
            <br />
            O convite será enviado para o e-mail: <strong>{teacher.email}</strong>
            <br />
            <br />
            O professor receberá um novo link de acesso à plataforma com suas credenciais.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>
            Reenviar Convite
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ResendInviteModal;
