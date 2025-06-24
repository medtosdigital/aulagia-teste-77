
import React, { useState, useEffect } from 'react';
import { X, Save, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { materialService, type GeneratedMaterial, type LessonPlan, type Activity, type Assessment } from '@/services/materialService';
import { templateService } from '@/services/templateService';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

interface MaterialInlineEditModalProps {
  material: GeneratedMaterial | null;
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}

const MaterialInlineEditModal: React.FC<MaterialInlineEditModalProps> = ({
  material,
  open,
  onClose,
  onSave
}) => {
  const isMobile = useIsMobile();
  const [editedMaterial, setEditedMaterial] = useState<GeneratedMaterial | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (material && open) {
      setEditedMaterial(JSON.parse(JSON.stringify(material)));
    }
  }, [material, open]);

  const handleSave = async () => {
    if (!editedMaterial) return;

    setLoading(true);
    try {
      const success = materialService.updateMaterial(editedMaterial.id, editedMaterial);
      if (success) {
        toast.success('Material atualizado com sucesso!');
        onSave();
        onClose();
      } else {
        toast.error('Erro ao atualizar material');
      }
    } catch (error) {
      toast.error('Erro ao salvar material');
      console.error('Save error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateContent = (path: string, value: any) => {
    if (!editedMaterial) return;
    const content = { ...editedMaterial.content };
    const keys = path.split('.');
    let current = content;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    
    setEditedMaterial({
      ...editedMaterial,
      content
    });
  };

  const updateArrayItem = (path: string, index: number, value: any) => {
    if (!editedMaterial) return;
    const content = { ...editedMaterial.content };
    const keys = path.split('.');
    let current = content;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]][index] = value;
    
    setEditedMaterial({
      ...editedMaterial,
      content
    });
  };

  const EditableField = ({ value, onChange, multiline = false, className = "", placeholder = "" }) => {
    if (multiline) {
      return (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`border-dashed border-2 border-blue-300 hover:border-blue-500 focus:border-blue-600 bg-blue-50 hover:bg-blue-100 focus:bg-white transition-colors resize-none ${className}`}
          placeholder={placeholder}
        />
      );
    }
    
    return (
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`border-dashed border-2 border-blue-300 hover:border-blue-500 focus:border-blue-600 bg-blue-50 hover:bg-blue-100 focus:bg-white transition-colors ${className}`}
        placeholder={placeholder}
      />
    );
  };

  const renderEditableLessonPlan = (content: LessonPlan) => {
    const html = templateService.generateLessonPlanHTML(content);
    
    return (
      <div className="bg-white p-8 shadow-lg mx-auto" style={{ width: '210mm', minHeight: '297mm', fontFamily: 'Arial, sans-serif' }}>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mr-4">
              <span className="text-purple-600 font-bold text-xl">📚</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-purple-600 mb-2">PLANO DE AULA</h1>
              <p className="text-sm text-gray-600">Sua aula com toque mágico</p>
            </div>
          </div>
        </div>

        {/* Informações básicas em grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <span className="font-semibold">Professor(a):</span>
            <EditableField
              value={content.professor}
              onChange={(value) => updateContent('professor', value)}
              className="mt-1"
            />
          </div>
          <div>
            <span className="font-semibold">Data:</span>
            <EditableField
              value={content.data}
              onChange={(value) => updateContent('data', value)}
              className="mt-1"
            />
          </div>
          <div>
            <span className="font-semibold">Disciplina:</span>
            <EditableField
              value={content.disciplina}
              onChange={(value) => updateContent('disciplina', value)}
              className="mt-1"
            />
          </div>
          <div>
            <span className="font-semibold">Série/Ano:</span>
            <EditableField
              value={content.serie}
              onChange={(value) => updateContent('serie', value)}
              className="mt-1"
            />
          </div>
          <div>
            <span className="font-semibold">Tema:</span>
            <EditableField
              value={content.tema}
              onChange={(value) => updateContent('tema', value)}
              className="mt-1"
            />
          </div>
          <div>
            <span className="font-semibold">Duração:</span>
            <EditableField
              value={content.duracao}
              onChange={(value) => updateContent('duracao', value)}
              className="mt-1"
            />
          </div>
          <div className="col-span-2">
            <span className="font-semibold">BNCC:</span>
            <EditableField
              value={content.bncc}
              onChange={(value) => updateContent('bncc', value)}
              className="mt-1"
            />
          </div>
        </div>

        {/* Objetivos */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-blue-600 mb-3">OBJETIVOS DE APRENDIZAGEM</h3>
          <div className="space-y-2">
            {content.objetivos.map((objetivo, index) => (
              <div key={index} className="flex items-start">
                <span className="text-blue-500 font-bold mr-2 mt-2">•</span>
                <EditableField
                  value={objetivo}
                  onChange={(value) => updateArrayItem('objetivos', index, value)}
                  multiline
                  className="flex-1 min-h-[60px]"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Habilidades BNCC */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-green-600 mb-3">HABILIDADES BNCC</h3>
          <div className="space-y-2">
            {content.habilidades.map((habilidade, index) => (
              <div key={index} className="flex items-start">
                <span className="text-green-500 font-bold mr-2 mt-2">•</span>
                <EditableField
                  value={habilidade}
                  onChange={(value) => updateArrayItem('habilidades', index, value)}
                  multiline
                  className="flex-1 min-h-[60px]"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Desenvolvimento */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-blue-600 mb-3">DESENVOLVIMENTO METODOLÓGICO</h3>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2 bg-blue-50 font-semibold">Etapa</th>
                <th className="border border-gray-300 p-2 bg-blue-50 font-semibold">Atividade</th>
                <th className="border border-gray-300 p-2 bg-blue-50 font-semibold">Tempo</th>
                <th className="border border-gray-300 p-2 bg-blue-50 font-semibold">Recursos</th>
              </tr>
            </thead>
            <tbody>
              {content.desenvolvimento.map((etapa, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 p-2">
                    <EditableField
                      value={etapa.etapa}
                      onChange={(value) => updateArrayItem('desenvolvimento', index, { ...etapa, etapa: value })}
                    />
                  </td>
                  <td className="border border-gray-300 p-2">
                    <EditableField
                      value={etapa.atividade}
                      onChange={(value) => updateArrayItem('desenvolvimento', index, { ...etapa, atividade: value })}
                      multiline
                      className="min-h-[60px]"
                    />
                  </td>
                  <td className="border border-gray-300 p-2">
                    <EditableField
                      value={etapa.tempo}
                      onChange={(value) => updateArrayItem('desenvolvimento', index, { ...etapa, tempo: value })}
                    />
                  </td>
                  <td className="border border-gray-300 p-2">
                    <EditableField
                      value={etapa.recursos}
                      onChange={(value) => updateArrayItem('desenvolvimento', index, { ...etapa, recursos: value })}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recursos e Avaliação */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="font-bold text-orange-600 mb-3">RECURSOS NECESSÁRIOS</h4>
            <div className="space-y-2">
              {content.recursos.map((recurso, index) => (
                <div key={index} className="flex items-center">
                  <span className="text-orange-500 font-bold mr-2">•</span>
                  <EditableField
                    value={recurso}
                    onChange={(value) => updateArrayItem('recursos', index, value)}
                    className="flex-1"
                  />
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-bold text-purple-600 mb-3">AVALIAÇÃO</h4>
            <EditableField
              value={content.avaliacao}
              onChange={(value) => updateContent('avaliacao', value)}
              multiline
              className="min-h-[120px]"
            />
          </div>
        </div>
      </div>
    );
  };

  const renderEditableSlides = (slidesContent: any) => {
    const slides = slidesContent.slides || [];
    
    return (
      <div className="bg-white p-8 space-y-8" style={{ width: '210mm', fontFamily: 'Arial, sans-serif' }}>
        {slides.map((slide: any, index: number) => (
          <div 
            key={index} 
            className="border-2 border-blue-200 rounded-lg p-8 bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg"
            style={{ minHeight: '297mm', pageBreakAfter: index < slides.length - 1 ? 'always' : 'auto' }}
          >
            <div className="flex items-center justify-between mb-6">
              <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                Slide {slide.numero}
              </span>
              <div className="text-right text-xs text-gray-500">
                {editedMaterial?.subject} • {editedMaterial?.grade}
              </div>
            </div>
            
            <div className="mb-8">
              <EditableField
                value={slide.titulo}
                onChange={(value) => updateArrayItem('slides', index, { ...slide, titulo: value })}
                className="text-2xl font-bold mb-4 text-center p-4"
                placeholder="Título do slide"
              />
            </div>
            
            <div className="space-y-4 text-lg">
              {slide.conteudo.map((item: string, itemIndex: number) => (
                <div key={itemIndex} className="flex items-start">
                  <span className="text-blue-600 font-bold mr-3 mt-2 text-xl">•</span>
                  <EditableField
                    value={item}
                    onChange={(value) => {
                      const newConteudo = [...slide.conteudo];
                      newConteudo[itemIndex] = value;
                      updateArrayItem('slides', index, { ...slide, conteudo: newConteudo });
                    }}
                    multiline
                    className="flex-1 min-h-[80px] text-lg"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderEditableActivity = (activity: Activity) => {
    const html = templateService.generateActivityHTML(activity);
    
    return (
      <div className="bg-white p-8 shadow-lg mx-auto" style={{ width: '210mm', minHeight: '297mm', fontFamily: 'Arial, sans-serif' }}>
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-green-600 mb-2">ATIVIDADE</h1>
          <div className="text-sm text-gray-600">
            {editedMaterial?.subject} • {editedMaterial?.grade}
          </div>
        </div>

        {/* Instruções */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-green-800 mb-2">Instruções</h4>
          <EditableField
            value={activity.instrucoes}
            onChange={(value) => updateContent('instrucoes', value)}
            multiline
            className="min-h-[80px]"
          />
        </div>

        {/* Questões */}
        <div className="space-y-6">
          {activity.questoes.map((questao, index) => (
            <div key={index} className="border-l-4 border-l-green-500 pl-4">
              <h4 className="font-bold mb-3 text-green-700">Questão {questao.numero}</h4>
              
              <EditableField
                value={questao.pergunta}
                onChange={(value) => updateArrayItem('questoes', index, { ...questao, pergunta: value })}
                multiline
                className="mb-4 min-h-[80px] font-medium"
                placeholder="Pergunta da questão"
              />
              
              {questao.opcoes && (
                <div className="space-y-2 mb-4">
                  <p className="font-medium text-gray-600">Opções:</p>
                  {questao.opcoes.map((opcao, opcaoIndex) => (
                    <div key={opcaoIndex} className="flex items-start gap-2">
                      <span className="text-green-600 font-bold mt-2">
                        {String.fromCharCode(65 + opcaoIndex)})
                      </span>
                      <EditableField
                        value={opcao}
                        onChange={(value) => {
                          const novasOpcoes = [...questao.opcoes!];
                          novasOpcoes[opcaoIndex] = value;
                          updateArrayItem('questoes', index, { ...questao, opcoes: novasOpcoes });
                        }}
                        className="flex-1"
                      />
                    </div>
                  ))}
                </div>
              )}
              
              {questao.tipo === 'aberta' && (
                <div className="mt-4">
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-sm text-gray-500 mb-2">Espaço para resposta:</p>
                    <div className="border border-gray-300 rounded p-4 min-h-[100px] bg-gray-50">
                      <div className="text-gray-400 text-sm">
                        {Array.from({length: 5}, (_, i) => (
                          <div key={i} className="border-b border-gray-200 h-6 mb-2"></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderEditableAssessment = (assessment: Assessment) => {
    if (assessment.htmlContent) {
      // Para avaliações com HTML, criar uma versão editável
      return (
        <div className="bg-white p-8 shadow-lg mx-auto" style={{ width: '210mm', minHeight: '297mm', fontFamily: 'Arial, sans-serif' }}>
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-purple-600 mb-2">AVALIAÇÃO</h1>
            <div className="text-sm text-gray-600">
              {editedMaterial?.subject} • {editedMaterial?.grade}
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-purple-800">Instruções da Avaliação</h4>
              <EditableField
                value={assessment.tempoLimite}
                onChange={(value) => updateContent('tempoLimite', value)}
                className="w-32"
                placeholder="Tempo limite"
              />
            </div>
            <EditableField
              value={assessment.instrucoes}
              onChange={(value) => updateContent('instrucoes', value)}
              multiline
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-6">
            {assessment.questoes.map((questao, index) => (
              <div key={index} className="border-l-4 border-l-purple-500 pl-4">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-bold text-purple-700">Questão {questao.numero}</h4>
                  <EditableField
                    value={questao.pontuacao?.toString() || '0'}
                    onChange={(value) => updateArrayItem('questoes', index, { ...questao, pontuacao: parseInt(value) || 0 })}
                    className="w-20"
                    placeholder="Pts"
                  />
                </div>
                
                <EditableField
                  value={questao.pergunta}
                  onChange={(value) => updateArrayItem('questoes', index, { ...questao, pergunta: value })}
                  multiline
                  className="mb-4 min-h-[80px] font-medium"
                  placeholder="Pergunta da questão"
                />
                
                {questao.opcoes && (
                  <div className="space-y-2">
                    <p className="font-medium text-gray-600">Opções:</p>
                    {questao.opcoes.map((opcao, opcaoIndex) => (
                      <div key={opcaoIndex} className="flex items-start gap-2">
                        <span className="text-purple-600 font-bold mt-2">
                          {String.fromCharCode(65 + opcaoIndex)})
                        </span>
                        <EditableField
                          value={opcao}
                          onChange={(value) => {
                            const novasOpcoes = [...questao.opcoes!];
                            novasOpcoes[opcaoIndex] = value;
                            updateArrayItem('questoes', index, { ...questao, opcoes: novasOpcoes });
                          }}
                          className="flex-1"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Fallback para formato antigo
    return renderEditableActivity(assessment as any);
  };

  const renderEditableContent = () => {
    if (!editedMaterial) return null;

    switch (editedMaterial.type) {
      case 'plano-de-aula':
        return renderEditableLessonPlan(editedMaterial.content as LessonPlan);
      case 'slides':
        return renderEditableSlides(editedMaterial.content);
      case 'atividade':
        return renderEditableActivity(editedMaterial.content as Activity);
      case 'avaliacao':
        return renderEditableAssessment(editedMaterial.content as Assessment);
      default:
        return <div>Tipo de material não suportado para edição</div>;
    }
  };

  if (!editedMaterial) return null;

  // Mobile layout
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl border-0 p-0 bg-white">
          <div className="h-full flex flex-col">
            {/* Header */}
            <SheetHeader className="p-4 pb-3 border-b bg-white rounded-t-3xl flex-shrink-0">
              <SheetTitle className="text-lg font-bold text-center flex items-center justify-center gap-2">
                <Edit3 className="h-5 w-5" />
                Editar Material
              </SheetTitle>
            </SheetHeader>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div 
                className="origin-top-left transform scale-[0.4] w-[250%] h-[250%] overflow-hidden"
                style={{ transformOrigin: '0 0' }}
              >
                {renderEditableContent()}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="p-4 space-y-3 bg-white border-t flex-shrink-0 rounded-b-3xl">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                  className="rounded-xl"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="rounded-xl"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop layout
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 flex rounded-2xl">
        <div className="flex-1 overflow-y-auto rounded-l-2xl">
          {renderEditableContent()}
        </div>
        
        {/* Sidebar com botões */}
        <div className="w-80 bg-gray-50 border-l flex flex-col rounded-r-2xl">
          <DialogHeader className="p-6 pb-4 border-b bg-white rounded-tr-2xl">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <Edit3 className="h-5 w-5" />
                Editar Material
              </DialogTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="rounded-lg"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="p-6 space-y-4">
            <div className="text-sm text-gray-600 space-y-2">
              <h3 className="font-semibold">Material</h3>
              <div>
                <span className="font-medium">Título:</span>
                <EditableField
                  value={editedMaterial.title}
                  onChange={(value) => setEditedMaterial({ ...editedMaterial, title: value })}
                  className="mt-1"
                />
              </div>
              <div>
                <span className="font-medium">Disciplina:</span>
                <EditableField
                  value={editedMaterial.subject}
                  onChange={(value) => setEditedMaterial({ ...editedMaterial, subject: value })}
                  className="mt-1"
                />
              </div>
              <div>
                <span className="font-medium">Turma:</span>
                <EditableField
                  value={editedMaterial.grade}
                  onChange={(value) => setEditedMaterial({ ...editedMaterial, grade: value })}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
          
          <div className="p-6 border-t mt-auto rounded-br-2xl space-y-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="w-full rounded-lg"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MaterialInlineEditModal;
