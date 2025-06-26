
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, X, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { GeneratedMaterial, materialService } from '@/services/materialService';

interface MaterialInlineEditModalProps {
  material: GeneratedMaterial;
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}

interface EditableSlide {
  numero: number;
  titulo: string;
  conteudo: string[];
}

const MaterialInlineEditModal: React.FC<MaterialInlineEditModalProps> = ({
  material,
  open,
  onClose,
  onSave
}) => {
  const [editedTitle, setEditedTitle] = useState('');
  const [editedSubject, setEditedSubject] = useState('');
  const [editedGrade, setEditedGrade] = useState('');
  const [editedSlides, setEditedSlides] = useState<EditableSlide[]>([]);

  useEffect(() => {
    if (material && open) {
      setEditedTitle(material.title);
      setEditedSubject(material.subject);
      setEditedGrade(material.grade);

      // Configurar slides para edição se for um material de slides
      if (material.type === 'slides' && material.content?.slides) {
        const slides = material.content.slides.map((slide: any) => ({
          numero: slide.numero,
          titulo: slide.titulo,
          conteudo: Array.isArray(slide.conteudo) ? slide.conteudo : [slide.conteudo]
        }));
        setEditedSlides(slides);
      }
    }
  }, [material, open]);

  const updateSlideTitle = (slideIndex: number, newTitle: string) => {
    const updated = [...editedSlides];
    updated[slideIndex].titulo = newTitle;
    setEditedSlides(updated);
  };

  const updateSlideContent = (slideIndex: number, contentIndex: number, newContent: string) => {
    const updated = [...editedSlides];
    updated[slideIndex].conteudo[contentIndex] = newContent;
    setEditedSlides(updated);
  };

  const addContentItem = (slideIndex: number) => {
    const updated = [...editedSlides];
    updated[slideIndex].conteudo.push('');
    setEditedSlides(updated);
  };

  const removeContentItem = (slideIndex: number, contentIndex: number) => {
    const updated = [...editedSlides];
    if (updated[slideIndex].conteudo.length > 1) {
      updated[slideIndex].conteudo.splice(contentIndex, 1);
      setEditedSlides(updated);
    }
  };

  const handleSave = () => {
    try {
      let updatedContent = material.content;

      // Se for um material de slides, atualizar o conteúdo dos slides
      if (material.type === 'slides') {
        updatedContent = {
          ...material.content,
          slides: editedSlides
        };
      }

      const updatedMaterial: GeneratedMaterial = {
        ...material,
        title: editedTitle,
        subject: editedSubject,
        grade: editedGrade,
        content: updatedContent
      };

      console.log('Salvando material atualizado:', updatedMaterial);
      const success = materialService.updateMaterial(material.id, updatedMaterial);
      
      if (success) {
        toast.success('Material atualizado com sucesso!');
        onSave();
        onClose();
      } else {
        toast.error('Erro ao atualizar material');
      }
    } catch (error) {
      console.error('Erro ao salvar material:', error);
      toast.error('Erro ao salvar alterações');
    }
  };

  if (!material) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Editar Material
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Metadados do Material */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações do Material</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    placeholder="Título do material"
                  />
                </div>
                <div>
                  <Label htmlFor="subject">Disciplina</Label>
                  <Input
                    id="subject"
                    value={editedSubject}
                    onChange={(e) => setEditedSubject(e.target.value)}
                    placeholder="Disciplina"
                  />
                </div>
                <div>
                  <Label htmlFor="grade">Turma</Label>
                  <Input
                    id="grade"
                    value={editedGrade}
                    onChange={(e) => setEditedGrade(e.target.value)}
                    placeholder="Turma/Série"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Edição específica para Slides */}
          {material.type === 'slides' && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Conteúdo dos Slides</h3>
              
              {editedSlides.map((slide, slideIndex) => (
                <Card key={slide.numero} className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>Slide {slide.numero}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Título do Slide */}
                    <div>
                      <Label htmlFor={`slide-title-${slideIndex}`}>Título do Slide</Label>
                      <Input
                        id={`slide-title-${slideIndex}`}
                        value={slide.titulo}
                        onChange={(e) => updateSlideTitle(slideIndex, e.target.value)}
                        placeholder="Título do slide"
                      />
                    </div>

                    {/* Conteúdo do Slide */}
                    <div>
                      <Label>Conteúdo do Slide</Label>
                      <div className="space-y-2">
                        {slide.conteudo.map((content, contentIndex) => (
                          <div key={contentIndex} className="flex gap-2">
                            <Textarea
                              value={content}
                              onChange={(e) => updateSlideContent(slideIndex, contentIndex, e.target.value)}
                              placeholder={`Item ${contentIndex + 1} do conteúdo`}
                              className="flex-1"
                              rows={2}
                            />
                            {slide.conteudo.length > 1 && (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => removeContentItem(slideIndex, contentIndex)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          onClick={() => addContentItem(slideIndex)}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Item de Conteúdo
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Para outros tipos de material, mostrar mensagem informativa */}
          {material.type !== 'slides' && (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-gray-600">
                  Edição detalhada disponível apenas para alteração de metadados nesta versão.
                  <br />
                  Para editar o conteúdo específico de {material.type}, use as ferramentas especializadas.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Botões de Ação */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Salvar Alterações
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MaterialInlineEditModal;
