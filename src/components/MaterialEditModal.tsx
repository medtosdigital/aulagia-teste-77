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
import MaterialModal from './MaterialModal';
import { normalizeMaterialForPreview } from '@/services/materialService';

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
  const [materialModalOpen, setMaterialModalOpen] = useState(false);

  useEffect(() => {
    if (material && open) {
      console.log('🔄 MaterialEditModal: Setting editedMaterial from props:', {
        id: material.id,
        title: material.title,
        type: material.type,
        contentKeys: Object.keys(material.content || {})
      });
      setEditedMaterial(material);
    }
  }, [material, open]);

  useEffect(() => {
    if (editedMaterial && open) {
      setMaterialModalOpen(true);
    }
  }, [editedMaterial, open]);

  // FUNÇÃO HELPER PARA DEEP COPY DE ARRAYS
  const deepCopyArray = (arr: any[]): any[] => {
    if (!Array.isArray(arr)) return arr;
    return arr.map(item => {
      if (Array.isArray(item)) {
        return deepCopyArray(item);
      } else if (typeof item === 'object' && item !== null) {
        return { ...item };
      }
      return item;
    });
  };

  // FUNÇÃO HELPER PARA DEEP COPY DE CONTENT
  const deepCopyContent = (content: any): any => {
    if (!content || typeof content !== 'object') return content;
    
    const newContent: any = {};
    
    for (const [key, value] of Object.entries(content)) {
      if (Array.isArray(value)) {
        newContent[key] = deepCopyArray(value);
      } else if (typeof value === 'object' && value !== null) {
        newContent[key] = { ...value };
      } else {
        newContent[key] = value;
      }
    }
    
    return newContent;
  };

  // FUNÇÃO HELPER PARA VERIFICAÇÃO DE INTEGRIDADE
  const verifyArrayIntegrity = (content: any, operation: string) => {
    if (content.objetivos && content.habilidades) {
      const objetivosRef = content.objetivos;
      const habilidadesRef = content.habilidades;
      const sameReference = objetivosRef === habilidadesRef;
      
      console.log(`🔍 MaterialEditModal: Array integrity check after ${operation}:`, {
        objetivosLength: objetivosRef?.length || 0,
        habilidadesLength: habilidadesRef?.length || 0,
        sameReference,
        objetivosSample: objetivosRef?.slice(0, 2) || [],
        habilidadesSample: habilidadesRef?.slice(0, 2) || []
      });
      
      if (sameReference) {
        console.error(`❌ CRITICAL: Arrays sharing reference after ${operation}!`);
        throw new Error(`Array contamination detected after ${operation}`);
      }
    }
  };

  const handleSave = async () => {
    if (!editedMaterial) return;
    setLoading(true);
    
    console.log('💾 MaterialEditModal: Starting save process');
    console.log('📊 Current editedMaterial state:', {
      id: editedMaterial.id,
      title: editedMaterial.title,
      type: editedMaterial.type,
      subject: editedMaterial.subject,
      grade: editedMaterial.grade,
      contentKeys: Object.keys(editedMaterial.content || {}),
      contentSample: editedMaterial.content
    });
    
    try {
      // Verificar integridade antes do salvamento
      verifyArrayIntegrity(editedMaterial.content, 'pre-save');
      
      // Preparar dados para salvamento - usar EXATAMENTE o que está no estado
      const materialToSave = {
        id: editedMaterial.id,
        title: editedMaterial.title,
        subject: editedMaterial.subject,
        grade: editedMaterial.grade,
        type: editedMaterial.type,
        content: editedMaterial.content // Usar diretamente sem modificações
      };
      
      console.log('📤 MaterialEditModal: Data being sent to materialService.updateMaterial:', materialToSave);
      
      const success = await materialService.updateMaterial(materialToSave.id, materialToSave);
      
      if (success) {
        console.log('✅ MaterialEditModal: Save successful');
        toast.success('Material atualizado com sucesso!');
        onSave();
        onClose();
        activityService.addActivity({
          type: 'updated',
          title: `${editedMaterial.title}`,
          description: `Material editado: ${editedMaterial.title} (${editedMaterial.type})`,
          materialType: editedMaterial.type,
          materialId: editedMaterial.id,
          subject: editedMaterial.subject,
          grade: editedMaterial.grade
        });
      } else {
        console.error('❌ MaterialEditModal: Save failed');
        toast.error('Erro ao atualizar material');
      }
    } catch (error) {
      console.error('❌ MaterialEditModal: Save error:', error);
      toast.error('Erro ao salvar material');
    } finally {
      setLoading(false);
    }
  };

  const updateBasicInfo = (field: string, value: string) => {
    if (!editedMaterial) return;
    
    console.log(`📝 MaterialEditModal: Updating basic info ${field}:`, value);
    setEditedMaterial(prev => {
      const updated = {
        ...prev!,
        [field]: value
      };
      console.log('🔄 MaterialEditModal: Basic info updated, new state:', updated);
      return updated;
    });
  };

  const updateContent = (path: string, value: any) => {
    if (!editedMaterial) return;
    
    console.log(`📝 MaterialEditModal: Updating content path "${path}" with value:`, value);
    
    setEditedMaterial(prev => {
      const newMaterial = { ...prev! };
      // CORREÇÃO CRÍTICA: Deep copy do content
      const content = deepCopyContent(newMaterial.content);
      
      const keys = path.split('.');
      let current: any = content;
      
      // Navegar até o penúltimo nível
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      // Definir o valor final
      current[keys[keys.length - 1]] = value;
      
      newMaterial.content = content;
      
      // Verificar integridade
      try {
        verifyArrayIntegrity(newMaterial.content, `updateContent(${path})`);
      } catch (error) {
        console.error('❌ Array integrity check failed:', error);
        // Retornar estado anterior em caso de erro
        return prev!;
      }
      
      console.log('🔄 MaterialEditModal: Content updated, new material:', newMaterial);
      return newMaterial;
    });
  };

  const addArrayItem = (path: string, defaultItem: any) => {
    if (!editedMaterial) return;
    
    console.log(`➕ MaterialEditModal: Adding array item to path "${path}":`, defaultItem);
    
    setEditedMaterial(prev => {
      const newMaterial = { ...prev! };
      // CORREÇÃO CRÍTICA: Deep copy do content
      const content = deepCopyContent(newMaterial.content);
      
      const keys = path.split('.');
      let current: any = content;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      const arrayKey = keys[keys.length - 1];
      if (!Array.isArray(current[arrayKey])) {
        current[arrayKey] = [];
      }
      
      // CORREÇÃO CRÍTICA: Deep copy do array existente antes de adicionar
      current[arrayKey] = deepCopyArray(current[arrayKey]);
      current[arrayKey].push(defaultItem);
      
      newMaterial.content = content;
      
      // Verificar integridade
      try {
        verifyArrayIntegrity(newMaterial.content, `addArrayItem(${path})`);
      } catch (error) {
        console.error('❌ Array integrity check failed:', error);
        // Retornar estado anterior em caso de erro
        return prev!;
      }
      
      console.log('🔄 MaterialEditModal: Array item added, new material:', newMaterial);
      return newMaterial;
    });
  };

  const removeArrayItem = (path: string, index: number) => {
    if (!editedMaterial) return;
    
    console.log(`🗑️ MaterialEditModal: Removing array item at index ${index} from path "${path}"`);
    
    setEditedMaterial(prev => {
      const newMaterial = { ...prev! };
      // CORREÇÃO CRÍTICA: Deep copy do content
      const content = deepCopyContent(newMaterial.content);
      
      const keys = path.split('.');
      let current: any = content;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      const arrayKey = keys[keys.length - 1];
      
      // CORREÇÃO CRÍTICA: Deep copy do array antes de remover
      current[arrayKey] = deepCopyArray(current[arrayKey]);
      current[arrayKey].splice(index, 1);
      
      newMaterial.content = content;
      
      // Verificar integridade
      try {
        verifyArrayIntegrity(newMaterial.content, `removeArrayItem(${path}[${index}])`);
      } catch (error) {
        console.error('❌ Array integrity check failed:', error);
        // Retornar estado anterior em caso de erro
        return prev!;
      }
      
      console.log('🔄 MaterialEditModal: Array item removed, new material:', newMaterial);
      return newMaterial;
    });
  };

  // CORREÇÃO CRÍTICA: updateArrayItem completamente reescrito com deep copy
  const updateArrayItem = (path: string, index: number, value: any) => {
    if (!editedMaterial) return;
    
    console.log(`✏️ MaterialEditModal: Updating array item at index ${index} in path "${path}" with value:`, value);
    
    setEditedMaterial(prev => {
      const newMaterial = { ...prev! };
      // CORREÇÃO CRÍTICA: Deep copy completo do content
      const content = deepCopyContent(newMaterial.content);
      
      const keys = path.split('.');
      let current: any = content;
      
      // Navegar até o array alvo
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      const arrayKey = keys[keys.length - 1];
      
      // CORREÇÃO CRÍTICA: Deep copy do array específico
      if (Array.isArray(current[arrayKey])) {
        current[arrayKey] = deepCopyArray(current[arrayKey]);
        current[arrayKey][index] = value;
      }
      
      newMaterial.content = content;
      
      // Verificar integridade
      try {
        verifyArrayIntegrity(newMaterial.content, `updateArrayItem(${path}[${index}])`);
      } catch (error) {
        console.error('❌ Array integrity check failed:', error);
        // Retornar estado anterior em caso de erro
        return prev!;
      }
      
      console.log('🔄 MaterialEditModal: Array item updated, new material:', newMaterial);
      console.log('🔍 MaterialEditModal: Post-update verification:', {
        objetivos: newMaterial.content.objetivos,
        habilidades: newMaterial.content.habilidades,
        areTheSameReference: newMaterial.content.objetivos === newMaterial.content.habilidades
      });
      
      return newMaterial;
    });
  };

  // Função para atualizar uma questão inteira
  const updateQuestion = (questionIndex: number, updatedQuestion: any) => {
    if (!editedMaterial) return;
    
    console.log(`📝 MaterialEditModal: Updating question ${questionIndex} with:`, updatedQuestion);
    setEditedMaterial(prev => {
      const newMaterial = { ...prev! };
      // CORREÇÃO CRÍTICA: Deep copy do content
      const content = deepCopyContent(newMaterial.content);
      
      if (!content.questoes || !Array.isArray(content.questoes)) {
        console.error('❌ MaterialEditModal: Questoes array not found');
        return prev!;
      }
      
      // CORREÇÃO CRÍTICA: Deep copy do array de questões
      const updatedQuestoes = deepCopyArray(content.questoes);
      updatedQuestoes[questionIndex] = { ...updatedQuestion };
      
      newMaterial.content = {
        ...content,
        questoes: updatedQuestoes
      };
      
      console.log('✅ MaterialEditModal: Question updated successfully:', newMaterial);
      return newMaterial;
    });
  };

  // Função simplificada para atualizar opção de questão
  const updateQuestionOption = (questionIndex: number, optionIndex: number, value: string) => {
    if (!editedMaterial) return;
    
    const content = editedMaterial.content as any;
    if (!content.questoes || !content.questoes[questionIndex]) {
      console.error('❌ MaterialEditModal: Question not found');
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
      console.error('❌ MaterialEditModal: Question not found');
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
      <DialogContent className="max-w-3xl w-full rounded-2xl">
        <DialogHeader>
          <DialogTitle>Editar Material</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto max-h-[70vh]">
          {renderContentEditor()}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MaterialEditModal;
