
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users } from 'lucide-react';

interface Teacher {
  id: string;
  name: string;
  email: string;
  subject: string;
  grade: string;
  materialsCount: number;
}

interface EditTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: Teacher | null;
  onSave: (teacherId: string, updatedData: Partial<Teacher>) => void;
}

const EditTeacherModal: React.FC<EditTeacherModalProps> = ({
  isOpen,
  onClose,
  teacher,
  onSave
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    grade: ''
  });

  useEffect(() => {
    if (teacher) {
      setFormData({
        name: teacher.name,
        email: teacher.email,
        subject: teacher.subject,
        grade: teacher.grade
      });
    }
  }, [teacher]);

  const handleSave = () => {
    if (teacher && formData.name && formData.email && formData.subject && formData.grade) {
      onSave(teacher.id, formData);
      onClose();
    }
  };

  const handleClose = () => {
    onClose();
    // Reset form when closing
    if (teacher) {
      setFormData({
        name: teacher.name,
        email: teacher.email,
        subject: teacher.subject,
        grade: teacher.grade
      });
    }
  };

  if (!teacher) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Editar Professor
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-sm font-medium">
              Nome Completo
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Digite o nome completo"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-sm font-medium">
              E-mail
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="Digite o e-mail"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="subject" className="text-sm font-medium">
              Matéria Lecionada
            </Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
              placeholder="Ex: Matemática, Português..."
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="grade" className="text-sm font-medium">
              Série(s)
            </Label>
            <Input
              id="grade"
              value={formData.grade}
              onChange={(e) => setFormData({...formData, grade: e.target.value})}
              placeholder="Ex: 6º ao 9º ano"
              className="mt-1"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!formData.name || !formData.email || !formData.subject || !formData.grade}
            >
              Salvar Alterações
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditTeacherModal;
