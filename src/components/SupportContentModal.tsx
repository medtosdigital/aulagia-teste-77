
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Plus, Save, X, AlertCircle, CheckCircle, Lightbulb, BookOpen, ClipboardList, Presentation } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SupportMaterial {
  id: string;
  titulo: string;
  conteudo: string;
  tipo: 'texto' | 'atividade' | 'exercicio' | 'referencia';
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  mainMaterialId: string;
  mainMaterialTitle: string;
  onMaterialsAdded: () => void;
}

const SupportContentModal: React.FC<Props> = ({
  isOpen,
  onClose,
  mainMaterialId,
  mainMaterialTitle,
  onMaterialsAdded
}) => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<SupportMaterial[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedType, setSelectedType] = useState<'texto' | 'atividade' | 'exercicio' | 'referencia'>('texto');

  const handleGenerateMaterials = async () => {
    if (!user) {
      toast.error('Você precisa estar logado');
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('gerarMaterialIA', {
        body: {
          tema: mainMaterialTitle,
          tipo_material: 'material_apoio',
          material_principal_id: mainMaterialId,
          subtipo: selectedType
        }
      });

      if (error) {
        console.error('Erro ao gerar materiais:', error);
        toast.error('Erro ao gerar materiais de apoio');
        return;
      }

      // Generate multiple support materials
      const supportMaterials = [
        {
          titulo: `${selectedType === 'texto' ? 'Resumo' : selectedType === 'atividade' ? 'Atividade prática' : selectedType === 'exercicio' ? 'Lista de exercícios' : 'Referências'} - ${mainMaterialTitle}`,
          conteudo: data?.conteudo || 'Conteúdo gerado automaticamente',
          material_principal_id: mainMaterialId,
          user_id: user.id,
          disciplina: 'Geral',
          tema: mainMaterialTitle
        }
      ];

      const { error: insertError } = await supabase
        .from('materiais_apoio')
        .insert(supportMaterials);

      if (insertError) {
        console.error('Erro ao salvar materiais:', insertError);
        toast.error('Erro ao salvar materiais de apoio');
        return;
      }

      toast.success('Materiais de apoio gerados com sucesso!');
      onMaterialsAdded();
      onClose();

    } catch (error) {
      console.error('Erro ao gerar materiais:', error);
      toast.error('Erro ao gerar materiais de apoio');
    } finally {
      setIsGenerating(false);
    }
  };

  const addMaterial = () => {
    const newMaterial: SupportMaterial = {
      id: Date.now().toString(),
      titulo: '',
      conteudo: '',
      tipo: selectedType
    };
    setMaterials([...materials, newMaterial]);
  };

  const updateMaterial = (id: string, field: keyof SupportMaterial, value: string) => {
    setMaterials(materials.map(material => 
      material.id === id ? { ...material, [field]: value } : material
    ));
  };

  const removeMaterial = (id: string) => {
    setMaterials(materials.filter(material => material.id !== id));
  };

  const saveMaterials = async () => {
    if (!user) {
      toast.error('Você precisa estar logado');
      return;
    }

    const validMaterials = materials.filter(m => m.titulo.trim() && m.conteudo.trim());
    
    if (validMaterials.length === 0) {
      toast.error('Adicione pelo menos um material válido');
      return;
    }

    try {
      const materialsToSave = validMaterials.map(material => ({
        titulo: material.titulo,
        conteudo: material.conteudo,
        material_principal_id: mainMaterialId,
        user_id: user.id,
        disciplina: 'Geral',
        tema: mainMaterialTitle
      }));

      const { error } = await supabase
        .from('materiais_apoio')
        .insert(materialsToSave);

      if (error) {
        console.error('Erro ao salvar materiais:', error);
        toast.error('Erro ao salvar materiais');
        return;
      }

      toast.success('Materiais salvos com sucesso!');
      onMaterialsAdded();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar materiais:', error);
      toast.error('Erro ao salvar materiais');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'texto': return <FileText className="w-4 h-4" />;
      case 'atividade': return <ClipboardList className="w-4 h-4" />;
      case 'exercicio': return <BookOpen className="w-4 h-4" />;
      case 'referencia': return <Lightbulb className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'texto': return 'Texto de apoio';
      case 'atividade': return 'Atividade prática';
      case 'exercicio': return 'Lista de exercícios';
      case 'referencia': return 'Material de referência';
      default: return 'Material de apoio';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Materiais de Apoio
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Material principal: {mainMaterialTitle}
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Label>Tipo de material:</Label>
              <Select value={selectedType} onValueChange={(value: any) => setSelectedType(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="texto">Texto de apoio</SelectItem>
                  <SelectItem value="atividade">Atividade prática</SelectItem>
                  <SelectItem value="exercicio">Lista de exercícios</SelectItem>
                  <SelectItem value="referencia">Material de referência</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleGenerateMaterials}
                disabled={isGenerating}
                variant="outline"
              >
                {isGenerating ? 'Gerando...' : 'Gerar com IA'}
              </Button>
              <Button onClick={addMaterial} size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Adicionar Manual
              </Button>
            </div>
          </div>

          <Separator />

          <ScrollArea className="h-96">
            <div className="space-y-4">
              {materials.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum material adicionado ainda.</p>
                  <p className="text-sm">Use os botões acima para adicionar materiais.</p>
                </div>
              ) : (
                materials.map((material) => (
                  <Card key={material.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(material.tipo)}
                          <Badge variant="secondary">
                            {getTypeLabel(material.tipo)}
                          </Badge>
                        </div>
                        <Button
                          onClick={() => removeMaterial(material.id)}
                          size="sm"
                          variant="ghost"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Título</Label>
                        <Input
                          value={material.titulo}
                          onChange={(e) => updateMaterial(material.id, 'titulo', e.target.value)}
                          placeholder="Digite o título do material"
                        />
                      </div>
                      <div>
                        <Label>Conteúdo</Label>
                        <Textarea
                          value={material.conteudo}
                          onChange={(e) => updateMaterial(material.id, 'conteudo', e.target.value)}
                          placeholder="Digite o conteúdo do material"
                          rows={4}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>

          <Separator />

          <div className="flex justify-end gap-2">
            <Button onClick={onClose} variant="outline">
              Cancelar
            </Button>
            {materials.length > 0 && (
              <Button onClick={saveMaterials}>
                <Save className="w-4 h-4 mr-2" />
                Salvar Materiais
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SupportContentModal;
