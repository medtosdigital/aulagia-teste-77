
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { GeneratedMaterial } from '@/services/materialService';

interface SlideEditModalProps {
  material: GeneratedMaterial;
  open: boolean;
  onClose: () => void;
  onSave: (updatedMaterial: GeneratedMaterial) => void;
}

interface Slide {
  numero: number;
  titulo: string;
  conteudo: string[];
}

const SlideEditModal: React.FC<SlideEditModalProps> = ({
  material,
  open,
  onClose,
  onSave
}) => {
  const [editedSlides, setEditedSlides] = useState<Slide[]>([]);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedSubject, setEditedSubject] = useState('');
  const [editedGrade, setEditedGrade] = useState('');

  useEffect(() => {
    if (material && open) {
      // Extrair slides do conteúdo
      const slides = material.content?.slides || [];
      setEditedSlides(slides.map((slide: any) => ({
        numero: slide.numero,
        titulo: slide.titulo,
        conteudo: Array.isArray(slide.conteudo) ? slide.conteudo : [slide.conteudo]
      })));
      setEditedTitle(material.title);
      setEditedSubject(material.subject);
      setEditedGrade(material.grade);
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
    updated[slideIndex].conteudo.splice(contentIndex, 1);
    setEditedSlides(updated);
  };

  const handleSave = () => {
    try {
      const updatedMaterial: GeneratedMaterial = {
        ...material,
        title: editedTitle,
        subject: editedSubject,
        grade: editedGrade,
        content: {
          ...material.content,
          slides: editedSlides
        }
      };

      onSave(updatedMaterial);
      toast.success('Slides editados com sucesso!');
      onClose();
    } catch (error) {
      toast.error('Erro ao salvar alterações');
      console.error('Error saving slides:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Editar Slides
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

          {/* Edição dos Slides */}
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
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => removeContentItem(slideIndex, contentIndex)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        onClick={() => addContentItem(slideIndex)}
                        className="w-full"
                      >
                        Adicionar Item de Conteúdo
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

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

export default SlideEditModal;
