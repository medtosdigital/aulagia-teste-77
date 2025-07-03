import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { schoolGroupService } from '@/services/schoolGroupService';

interface AddTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  onSuccess: () => void;
}

const AddTeacherModal: React.FC<AddTeacherModalProps> = ({
  isOpen,
  onClose,
  groupId,
  onSuccess
}) => {
  const [email, setEmail] = useState('');
  const [limit, setLimit] = useState(60);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({
        title: 'Erro',
        description: 'Por favor, insira um email válido.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    
    try {
      const success = await schoolGroupService.addMemberToGroup(groupId, email, limit);
      
      if (success) {
        toast({
          title: 'Professor adicionado',
          description: 'O professor foi adicionado ao grupo com sucesso!'
        });
        setEmail('');
        setLimit(60);
        onSuccess();
        onClose();
      } else {
        toast({
          title: 'Erro ao adicionar professor',
          description: 'Não foi possível adicionar o professor. Verifique se o email está correto.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Erro inesperado',
        description: 'Ocorreu um erro ao adicionar o professor.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Professor</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email do Professor</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="professor@escola.com"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="limit">Limite de Materiais</Label>
            <Input
              id="limit"
              type="number"
              min="1"
              max="300"
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value) || 60)}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Quantidade de materiais que este professor pode criar por mês
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adicionando...' : 'Adicionar Professor'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTeacherModal;