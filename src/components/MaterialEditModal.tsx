import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Save, X, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { materialService, type GeneratedMaterial, type LessonPlan, type Activity, type Assessment } from '@/services/materialService';
import { activityService } from '@/services/activityService';

interface MaterialEditModalProps {
  material: GeneratedMaterial | null;
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}

const MaterialEditModal: React.FC<MaterialEditModalProps> = ({
  material,
  open,
  onClose,
  onSave
}) => {
  const [editedMaterial, setEditedMaterial] = useState<GeneratedMaterial | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (material && open) {
      const deepCopy = JSON.parse(JSON.stringify(material));
      console.log('Setting edited material:', deepCopy);
      setEditedMaterial(deepCopy);
    }
  }, [material, open]);

  const handleSave = async () => {
    if (!editedMaterial) return;

    setLoading(true);
    try {
      console.log('Saving material:', editedMaterial);
      
      const materials = JSON.parse(localStorage.getItem('generated_materials') || '[]');
      const materialIndex = materials.findIndex((m: any) => m.id === editedMaterial.id);
      
      if (materialIndex !== -1) {
        const updatedMaterial = {
          ...editedMaterial,
          updatedAt: new Date().toISOString()
        };
        
        materials[materialIndex] = updatedMaterial;
        localStorage.setItem('generated_materials', JSON.stringify(materials));
        
        console.log('Material saved successfully');
        toast.success('Material atualizado com sucesso!');
        onSave();
        onClose();

        if (editedMaterial) {
          activityService.addActivity({
            type: 'updated',
            title: `${editedMaterial.title}`,
            description: `Material editado: ${editedMaterial.title} (${editedMaterial.type})`,
            materialType: editedMaterial.type,
            materialId: editedMaterial.id,
            subject: editedMaterial.subject,
            grade: editedMaterial.grade
          });
        }
      } else {
        console.error('Material not found');
        toast.error('Erro: Material não encontrado');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Erro ao salvar material');
    } finally {
      setLoading(false);
    }
  };

  const updateBasicInfo = (field: string, value: string) => {
    if (!editedMaterial) return;
    
    console.log(`Updating basic info ${field}:`, value);
    setEditedMaterial(prev => ({
      ...prev!,
      [field]: value
    }));
  };

  const updateContent = (path: string, value: any) => {
    if (!editedMaterial) return;
    
    console.log(`Updating content at path ${path}:`, value);
    setEditedMaterial(prev => {
      const newMaterial = { ...prev! };
      const content = { ...newMaterial.content };
      
      const keys = path.split('.');
      let current: any = content;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      
      newMaterial.content = content;
      return newMaterial;
    });
  };

  const addArrayItem = (path: string, defaultItem: any) => {
    if (!editedMaterial) return;
    
    console.log(`Adding array item to path ${path}:`, defaultItem);
    setEditedMaterial(prev => {
      const newMaterial = { ...prev! };
      const content = { ...newMaterial.content };
      
      const keys = path.split('.');
      let current: any = content;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      if (!Array.isArray(current[keys[keys.length - 1]])) {
        current[keys[keys.length - 1]] = [];
      }
      
      current[keys[keys.length - 1]].push(defaultItem);
      
      newMaterial.content = content;
      return newMaterial;
    });
  };

  const removeArrayItem = (path: string, index: number) => {
    if (!editedMaterial) return;
    
    console.log(`Removing array item from path ${path} at index ${index}`);
    setEditedMaterial(prev => {
      const newMaterial = { ...prev! };
      const content = { ...newMaterial.content };
      
      const keys = path.split('.');
      let current: any = content;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]].splice(index, 1);
      
      newMaterial.content = content;
      return newMaterial;
    });
  };

  const updateArrayItem = (path: string, index: number, value: any) => {
    if (!editedMaterial) return;
    
    console.log(`Updating array item at path ${path}, index ${index}:`, value);
    setEditedMaterial(prev => {
      const newMaterial = { ...prev! };
      const content = { ...newMaterial.content };
      
      const keys = path.split('.');
      let current: any = content;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]][index] = value;
      
      newMaterial.content = content;
      return newMaterial;
    });
  };

  // Função para atualizar uma questão inteira
  const updateQuestion = (questionIndex: number, updatedQuestion: any) => {
    if (!editedMaterial) return;
    
    console.log(`Updating question ${questionIndex} with:`, updatedQuestion);
    setEditedMaterial(prev => {
      const newMaterial = { ...prev! };
      const content = { ...newMaterial.content } as any;
      
      if (!content.questoes || !Array.isArray(content.questoes)) {
        console.error('Questoes array not found');
        return prev!;
      }
      
      const updatedQuestoes = [...content.questoes];
      updatedQuestoes[questionIndex] = { ...updatedQuestion };
      
      newMaterial.content = {
        ...content,
        questoes: updatedQuestoes
      };
      
      console.log('Question updated successfully:', newMaterial);
      return newMaterial;
    });
  };

  // Função simplificada para atualizar opção de questão
  const updateQuestionOption = (questionIndex: number, optionIndex: number, value: string) => {
    if (!editedMaterial) return;
    
    const content = editedMaterial.content as any;
    if (!content.questoes || !content.questoes[questionIndex]) {
      console.error('Question not found');
      return;
    }
    
    const question = content.questoes[questionIndex];
    const updatedOpcoes = [...(question.opcoes || [])];
    updatedOpcoes[optionIndex] = value;
    
    const updatedQuestion = {
      ...question,
      opcoes: updatedOpcoes
    };
    
    updateQuestion(questionIndex, updatedQuestion);
  };

  // Função simplificada para atualizar texto da questão
  const updateQuestionText = (questionIndex: number, value: string) => {
    if (!editedMaterial) return;
    
    const content = editedMaterial.content as any;
    if (!content.questoes || !content.questoes[questionIndex]) {
      console.error('Question not found');
      return;
    }
    
    const question = content.questoes[questionIndex];
    const updatedQuestion = {
      ...question,
      pergunta: value
    };
    
    updateQuestion(questionIndex, updatedQuestion);
  };

  const renderLessonPlanEditor = (content: LessonPlan) => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="professor">Professor</Label>
          <Input
            id="professor"
            value={content.professor}
            onChange={(e) => updateContent('professor', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="disciplina">Disciplina</Label>
          <Input
            id="disciplina"
            value={content.disciplina}
            onChange={(e) => updateContent('disciplina', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="tema">Tema</Label>
          <Input
            id="tema"
            value={content.tema}
            onChange={(e) => updateContent('tema', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="duracao">Duração</Label>
          <Input
            id="duracao"
            value={content.duracao}
            onChange={(e) => updateContent('duracao', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="data">Data</Label>
          <Input
            id="data"
            value={content.data}
            onChange={(e) => updateContent('data', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="serie">Série</Label>
          <Input
            id="serie"
            value={content.serie}
            onChange={(e) => updateContent('serie', e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="bncc">BNCC</Label>
        <Input
          id="bncc"
          value={content.bncc}
          onChange={(e) => updateContent('bncc', e.target.value)}
        />
      </div>

      <Separator />

      <div>
        <div className="flex items-center justify-between mb-3">
          <Label>Objetivos de Aprendizagem</Label>
          <Button
            type="button"
            size="sm"
            onClick={() => addArrayItem('objetivos', '')}
            className="h-8"
          >
            <Plus className="w-4 h-4 mr-1" />
            Adicionar
          </Button>
        </div>
        <div className="space-y-2">
          {content.objetivos.map((objetivo, index) => (
            <div key={index} className="flex gap-2">
              <Textarea
                value={objetivo}
                onChange={(e) => updateArrayItem('objetivos', index, e.target.value)}
                className="min-h-[60px]"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeArrayItem('objetivos', index)}
                className="h-8 w-8 p-0 text-red-600"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <div className="flex items-center justify-between mb-3">
          <Label>Habilidades BNCC</Label>
          <Button
            type="button"
            size="sm"
            onClick={() => addArrayItem('habilidades', '')}
            className="h-8"
          >
            <Plus className="w-4 h-4 mr-1" />
            Adicionar
          </Button>
        </div>
        <div className="space-y-2">
          {content.habilidades.map((habilidade, index) => (
            <div key={index} className="flex gap-2">
              <Textarea
                value={habilidade}
                onChange={(e) => updateArrayItem('habilidades', index, e.target.value)}
                className="min-h-[60px]"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeArrayItem('habilidades', index)}
                className="h-8 w-8 p-0 text-red-600"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <div className="flex items-center justify-between mb-3">
          <Label>Desenvolvimento da Aula</Label>
          <Button
            type="button"
            size="sm"
            onClick={() => addArrayItem('desenvolvimento', { etapa: '', atividade: '', tempo: '', recursos: '' })}
            className="h-8"
          >
            <Plus className="w-4 h-4 mr-1" />
            Adicionar Etapa
          </Button>
        </div>
        <div className="space-y-4">
          {content.desenvolvimento.map((etapa, index) => (
            <Card key={index} className="p-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium">Etapa {index + 1}</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeArrayItem('desenvolvimento', index)}
                  className="h-8 w-8 p-0 text-red-600"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label>Etapa</Label>
                  <Input
                    value={etapa.etapa}
                    onChange={(e) => updateArrayItem('desenvolvimento', index, { ...etapa, etapa: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Tempo</Label>
                  <Input
                    value={etapa.tempo}
                    onChange={(e) => updateArrayItem('desenvolvimento', index, { ...etapa, tempo: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Atividade</Label>
                  <Textarea
                    value={etapa.atividade}
                    onChange={(e) => updateArrayItem('desenvolvimento', index, { ...etapa, atividade: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Recursos</Label>
                  <Input
                    value={etapa.recursos}
                    onChange={(e) => updateArrayItem('desenvolvimento', index, { ...etapa, recursos: e.target.value })}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label>Recursos Necessários</Label>
            <Button
              type="button"
              size="sm"
              onClick={() => addArrayItem('recursos', '')}
              className="h-8"
            >
              <Plus className="w-4 h-4 mr-1" />
              Adicionar
            </Button>
          </div>
          <div className="space-y-2">
            {content.recursos.map((recurso, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={recurso}
                  onChange={(e) => updateArrayItem('recursos', index, e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeArrayItem('recursos', index)}
                  className="h-8 w-8 p-0 text-red-600"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
        <div>
          <Label htmlFor="avaliacao">Avaliação</Label>
          <Textarea
            id="avaliacao"
            value={content.avaliacao}
            onChange={(e) => updateContent('avaliacao', e.target.value)}
            className="min-h-[120px]"
          />
        </div>
      </div>
    </div>
  );

  const renderSlidesEditor = (slidesContent: any) => {
    const slides = slidesContent.slides || [];
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Label>Slides</Label>
          <Button
            type="button"
            size="sm"
            onClick={() => addArrayItem('slides', { numero: slides.length + 1, titulo: '', conteudo: [''] })}
            className="h-8"
          >
            <Plus className="w-4 h-4 mr-1" />
            Adicionar Slide
          </Button>
        </div>
        
        {slides.map((slide: any, slideIndex: number) => (
          <Card key={slideIndex} className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">Slide {slide.numero}</Badge>
                  <Input
                    value={slide.titulo}
                    onChange={(e) => updateArrayItem('slides', slideIndex, { ...slide, titulo: e.target.value })}
                    placeholder="Título do slide"
                    className="font-medium"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeArrayItem('slides', slideIndex)}
                  className="h-8 w-8 p-0 text-red-600"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Conteúdo</Label>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      const newSlide = { ...slide, conteudo: [...slide.conteudo, ''] };
                      updateArrayItem('slides', slideIndex, newSlide);
                    }}
                    className="h-8"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Adicionar Item
                  </Button>
                </div>
                {slide.conteudo.map((item: string, itemIndex: number) => (
                  <div key={itemIndex} className="flex gap-2">
                    <Textarea
                      value={item}
                      onChange={(e) => {
                        const newConteudo = [...slide.conteudo];
                        newConteudo[itemIndex] = e.target.value;
                        updateArrayItem('slides', slideIndex, { ...slide, conteudo: newConteudo });
                      }}
                      className="min-h-[60px]"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newConteudo = slide.conteudo.filter((_: any, i: number) => i !== itemIndex);
                        updateArrayItem('slides', slideIndex, { ...slide, conteudo: newConteudo });
                      }}
                      className="h-8 w-8 p-0 text-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderActivityEditor = (activity: Activity) => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="instrucoes">Instruções</Label>
        <Textarea
          id="instrucoes"
          value={activity.instrucoes || ''}
          onChange={(e) => updateContent('instrucoes', e.target.value)}
          className="min-h-[80px]"
        />
      </div>

      <Separator />

      <div>
        <div className="flex items-center justify-between mb-3">
          <Label>Questões</Label>
          <Button
            type="button"
            size="sm"
            onClick={() => addArrayItem('questoes', { 
              numero: activity.questoes.length + 1, 
              pergunta: '', 
              tipo: 'multipla_escolha', 
              opcoes: ['', '', '', ''], 
              resposta: '' 
            })}
            className="h-8"
          >
            <Plus className="w-4 h-4 mr-1" />
            Adicionar Questão
          </Button>
        </div>
        
        {activity.questoes && activity.questoes.map((questao, questionIndex) => (
          <Card key={questionIndex} className="border-l-4 border-l-green-500 mb-4">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Questão {questao.numero}</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeArrayItem('questoes', questionIndex)}
                  className="h-8 w-8 p-0 text-red-600"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Pergunta</Label>
                <Textarea
                  value={questao.pergunta || ''}
                  onChange={(e) => updateQuestionText(questionIndex, e.target.value)}
                  className="min-h-[80px]"
                  placeholder="Digite a pergunta aqui..."
                />
              </div>
              
              {questao.opcoes && Array.isArray(questao.opcoes) && (
                <div>
                  <Label>Opções</Label>
                  <div className="space-y-2">
                    {questao.opcoes.map((opcao, optionIndex) => (
                      <div key={optionIndex} className="flex items-center gap-2">
                        <span className="text-green-500 font-bold min-w-[25px]">
                          {String.fromCharCode(65 + optionIndex)})
                        </span>
                        <Input
                          value={opcao || ''}
                          onChange={(e) => updateQuestionOption(questionIndex, optionIndex, e.target.value)}
                          placeholder={`Opção ${String.fromCharCode(65 + optionIndex)}`}
                          className="flex-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {questao.resposta !== undefined && (
                <div>
                  <Label>Resposta</Label>
                  <Input
                    value={questao.resposta || ''}
                    onChange={(e) => {
                      const updatedQuestion = {
                        ...questao,
                        resposta: e.target.value
                      };
                      updateQuestion(questionIndex, updatedQuestion);
                    }}
                    placeholder="Resposta correta"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAssessmentEditor = (assessment: Assessment) => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="instrucoes">Instruções da Avaliação</Label>
        <Textarea
          id="instrucoes"
          value={assessment.instrucoes || ''}
          onChange={(e) => updateContent('instrucoes', e.target.value)}
          className="min-h-[80px]"
        />
      </div>

      <div>
        <Label htmlFor="tempoLimite">Tempo Limite</Label>
        <Input
          id="tempoLimite"
          value={assessment.tempoLimite || ''}
          onChange={(e) => updateContent('tempoLimite', e.target.value)}
        />
      </div>

      <Separator />

      <div>
        <div className="flex items-center justify-between mb-3">
          <Label>Questões</Label>
          <Button
            type="button"
            size="sm"
            onClick={() => addArrayItem('questoes', { 
              numero: assessment.questoes.length + 1, 
              pergunta: '', 
              tipo: 'multipla_escolha', 
              opcoes: ['', '', '', ''], 
              pontuacao: 1 
            })}
            className="h-8"
          >
            <Plus className="w-4 h-4 mr-1" />
            Adicionar Questão
          </Button>
        </div>
        
        {assessment.questoes && assessment.questoes.map((questao, questionIndex) => (
          <Card key={questionIndex} className="border-l-4 border-l-purple-500 mb-4">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Questão {questao.numero}</CardTitle>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={questao.pontuacao || 0}
                    onChange={(e) => {
                      const updatedQuestion = {
                        ...questao,
                        pontuacao: parseInt(e.target.value) || 0
                      };
                      updateQuestion(questionIndex, updatedQuestion);
                    }}
                    className="w-20 h-8"
                    min="0"
                  />
                  <span className="text-sm text-gray-500">pontos</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeArrayItem('questoes', questionIndex)}
                    className="h-8 w-8 p-0 text-red-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Pergunta</Label>
                <Textarea
                  value={questao.pergunta || ''}
                  onChange={(e) => updateQuestionText(questionIndex, e.target.value)}
                  className="min-h-[80px]"
                  placeholder="Digite a pergunta aqui..."
                />
              </div>
              
              {questao.opcoes && Array.isArray(questao.opcoes) && (
                <div>
                  <Label>Opções</Label>
                  <div className="space-y-2">
                    {questao.opcoes.map((opcao, optionIndex) => (
                      <div key={optionIndex} className="flex items-center gap-2">
                        <span className="text-purple-500 font-bold min-w-[25px]">
                          {String.fromCharCode(65 + optionIndex)})
                        </span>
                        <Input
                          value={opcao || ''}
                          onChange={(e) => updateQuestionOption(questionIndex, optionIndex, e.target.value)}
                          placeholder={`Opção ${String.fromCharCode(65 + optionIndex)}`}
                          className="flex-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderContentEditor = () => {
    if (!editedMaterial) return null;

    switch (editedMaterial.type) {
      case 'plano-de-aula':
        return renderLessonPlanEditor(editedMaterial.content as LessonPlan);
      case 'slides':
        return renderSlidesEditor(editedMaterial.content);
      case 'atividade':
        return renderActivityEditor(editedMaterial.content as Activity);
      case 'avaliacao':
        return renderAssessmentEditor(editedMaterial.content as Assessment);
      default:
        return <div>Tipo de material não suportado para edição</div>;
    }
  };

  if (!editedMaterial) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Editar Material
            <Badge variant="secondary">{editedMaterial.type}</Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto pr-2">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={editedMaterial.title}
                    onChange={(e) => updateBasicInfo('title', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="subject">Disciplina</Label>
                    <Input
                      id="subject"
                      value={editedMaterial.subject}
                      onChange={(e) => updateBasicInfo('subject', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="grade">Série</Label>
                    <Input
                      id="grade"
                      value={editedMaterial.grade}
                      onChange={(e) => updateBasicInfo('grade', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Conteúdo do Material</CardTitle>
              </CardHeader>
              <CardContent>
                {renderContentEditor()}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MaterialEditModal;
