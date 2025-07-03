import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { schoolGroupService, MembroGrupoEscolar } from '@/services/schoolGroupService';
import { Trash2, Users } from 'lucide-react';

interface ManageTeacherLimitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  onSuccess: () => void;
}

const ManageTeacherLimitsModal: React.FC<ManageTeacherLimitsModalProps> = ({
  isOpen,
  onClose,
  groupId,
  onSuccess
}) => {
  const [members, setMembers] = useState<MembroGrupoEscolar[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && groupId) {
      loadMembers();
    }
  }, [isOpen, groupId]);

  const loadMembers = async () => {
    try {
      const data = await schoolGroupService.getGroupMembers(groupId);
      setMembers(data);
    } catch (error) {
      console.error('Erro ao carregar membros:', error);
    }
  };

  const handleLimitChange = (index: number, newLimit: number) => {
    const updatedMembers = [...members];
    updatedMembers[index].limite_materiais = Math.max(0, Math.min(300, newLimit));
    setMembers(updatedMembers);
  };

  const handleDistributeEqually = () => {
    if (members.length === 0) return;
    
    const equalLimit = Math.floor(300 / members.length);
    const updatedMembers = members.map(member => ({
      ...member,
      limite_materiais: equalLimit
    }));
    setMembers(updatedMembers);
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const success = await schoolGroupService.removeMemberFromGroup(memberId);
      if (success) {
        setMembers(members.filter(m => m.id !== memberId));
        toast({
          title: 'Professor removido',
          description: 'O professor foi removido do grupo com sucesso!'
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o professor.',
        variant: 'destructive'
      });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    
    try {
      const promises = members.map(member =>
        schoolGroupService.updateMemberLimit(member.id, member.limite_materiais)
      );
      
      const results = await Promise.all(promises);
      const allSuccess = results.every(result => result);
      
      if (allSuccess) {
        toast({
          title: 'Limites atualizados',
          description: 'Os limites foram atualizados com sucesso!'
        });
        onSuccess();
        onClose();
      } else {
        toast({
          title: 'Erro',
          description: 'Alguns limites não puderam ser atualizados.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Erro inesperado',
        description: 'Ocorreu um erro ao atualizar os limites.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const totalLimit = members.reduce((sum, member) => sum + member.limite_materiais, 0);
  const isOverLimit = totalLimit > 300;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Gerenciar Limites dos Professores
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Total distribuído:</p>
              <p className={`text-lg font-bold ${isOverLimit ? 'text-red-600' : 'text-blue-600'}`}>
                {totalLimit} / 300 materiais
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleDistributeEqually}
              disabled={members.length === 0}
            >
              Distribuir Igualmente
            </Button>
          </div>

          {isOverLimit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">
                ⚠️ O total excede 300 materiais. Ajuste os limites antes de salvar.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {members.map((member, index) => (
              <div key={member.id} className="flex items-center gap-3 p-4 border rounded-lg">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  {member.user_profile?.full_name?.charAt(0) || 
                   member.user_profile?.email?.charAt(0) || 
                   '?'}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {member.user_profile?.full_name || 'Professor'}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {member.user_profile?.email}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Label htmlFor={`limit-${member.id}`} className="text-sm">
                    Limite:
                  </Label>
                  <Input
                    id={`limit-${member.id}`}
                    type="number"
                    min="0"
                    max="300"
                    value={member.limite_materiais}
                    onChange={(e) => handleLimitChange(index, parseInt(e.target.value) || 0)}
                    className="w-20 text-center"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveMember(member.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {members.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum professor adicionado ainda</p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={loading || isOverLimit || members.length === 0}
          >
            {loading ? 'Salvando...' : 'Salvar Limites'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ManageTeacherLimitsModal;