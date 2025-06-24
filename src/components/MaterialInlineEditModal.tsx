
import React, { useState, useEffect } from 'react';
import { X, Save, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { materialService, type GeneratedMaterial, type LessonPlan, type Activity, type Assessment } from '@/services/materialService';
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

  const renderEditableLessonPlan = (content: LessonPlan) => (
    <div className="bg-white p-6 space-y-6" style={{ fontFamily: 'Arial, sans-serif' }}>
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
          <Input
            value={content.professor}
            onChange={(e) => updateContent('professor', e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <span className="font-semibold">Data:</span>
          <Input
            value={content.data}
            onChange={(e) => updateContent('data', e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <span className="font-semibold">Disciplina:</span>
          <Input
            value={content.disciplina}
            onChange={(e) => updateContent('disciplina', e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <span className="font-semibold">Série/Ano:</span>
          <Input
            value={content.serie}
            onChange={(e) => updateContent('serie', e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <span className="font-semibold">Tema:</span>
          <Input
            value={content.tema}
            onChange={(e) => updateContent('tema', e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <span className="font-semibold">Duração:</span>
          <Input
            value={content.duracao}
            onChange={(e) => updateContent('duracao', e.target.value)}
            className="mt-1"
          />
        </div>
        <div className="col-span-2">
          <span className="font-semibold">BNCC:</span>
          <Input
            value={content.bncc}
            onChange={(e) => updateContent('bncc', e.target.value)}
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
              <Textarea
                value={objetivo}
                onChange={(e) => updateArrayItem('objetivos', index, e.target.value)}
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
              <Textarea
                value={habilidade}
                onChange={(e) => updateArrayItem('habilidades', index, e.target.value)}
                className="flex-1 min-h-[60px]"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Desenvolvimento */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-blue-600 mb-3">DESENVOLVIMENTO METODOLÓGICO</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Etapa</TableHead>
              <TableHead>Atividade</TableHead>
              <TableHead>Tempo</TableHead>
              <TableHead>Recursos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {content.desenvolvimento.map((etapa, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Input
                    value={etapa.etapa}
                    onChange={(e) => updateArrayItem('desenvolvimento', index, { ...etapa, etapa: e.target.value })}
                  />
                </TableCell>
                <TableCell>
                  <Textarea
                    value={etapa.atividade}
                    onChange={(e) => updateArrayItem('desenvolvimento', index, { ...etapa, atividade: e.target.value })}
                    className="min-h-[60px]"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={etapa.tempo}
                    onChange={(e) => updateArrayItem('desenvolvimento', index, { ...etapa, tempo: e.target.value })}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={etapa.recursos}
                    onChange={(e) => updateArrayItem('desenvolvimento', index, { ...etapa, recursos: e.target.value })}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Recursos e Avaliação */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h4 className="font-bold text-orange-600 mb-3">RECURSOS NECESSÁRIOS</h4>
          <div className="space-y-2">
            {content.recursos.map((recurso, index) => (
              <div key={index} className="flex items-center">
                <span className="text-orange-500 font-bold mr-2">•</span>
                <Input
                  value={recurso}
                  onChange={(e) => updateArrayItem('recursos', index, e.target.value)}
                  className="flex-1"
                />
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-bold text-purple-600 mb-3">AVALIAÇÃO</h4>
          <Textarea
            value={content.avaliacao}
            onChange={(e) => updateContent('avaliacao', e.target.value)}
            className="min-h-[120px]"
          />
        </div>
      </div>
    </div>
  );

  const renderEditableSlides = (slidesContent: any) => {
    const slides = slidesContent.slides || [];
    
    return (
      <div className="bg-white p-6 space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-blue-600">SLIDES - APRESENTAÇÃO</h1>
        </div>
        
        {slides.map((slide: any, index: number) => (
          <div key={index} className="border-2 border-blue-200 rounded-lg p-6 bg-blue-50">
            <div className="flex items-center justify-between mb-4">
              <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                Slide {slide.numero}
              </span>
            </div>
            
            <div className="mb-4">
              <Input
                value={slide.titulo}
                onChange={(e) => updateArrayItem('slides', index, { ...slide, titulo: e.target.value })}
                className="text-xl font-bold mb-4 bg-white"
                placeholder="Título do slide"
              />
            </div>
            
            <div className="space-y-2">
              {slide.conteudo.map((item: string, itemIndex: number) => (
                <div key={itemIndex} className="flex items-start">
                  <span className="text-blue-500 font-bold mr-2 mt-2">•</span>
                  <Textarea
                    value={item}
                    onChange={(e) => {
                      const newConteudo = [...slide.conteudo];
                      newConteudo[itemIndex] = e.target.value;
                      updateArrayItem('slides', index, { ...slide, conteudo: newConteudo });
                    }}
                    className="flex-1 min-h-[60px] bg-white"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderEditableActivity = (activity: Activity) => (
    <div className="bg-white p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-green-600">ATIVIDADE</h1>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-green-800 mb-2">Instruções</h4>
        <Textarea
          value={activity.instrucoes}
          onChange={(e) => updateContent('instrucoes', e.target.value)}
          className="bg-white min-h-[80px]"
        />
      </div>

      <div className="space-y-6">
        {activity.questoes.map((questao, index) => (
          <div key={index} className="border-l-4 border-l-green-500 bg-gray-50 p-4 rounded">
            <h4 className="font-bold mb-3">Questão {questao.numero}</h4>
            
            <Textarea
              value={questao.pergunta}
              onChange={(e) => updateArrayItem('questoes', index, { ...questao, pergunta: e.target.value })}
              className="mb-4 bg-white min-h-[80px]"
              placeholder="Pergunta da questão"
            />
            
            {questao.opcoes && (
              <div className="space-y-2 mb-4">
                <p className="font-medium text-gray-600">Opções:</p>
                {questao.opcoes.map((opcao, opcaoIndex) => (
                  <div key={opcaoIndex} className="flex items-center gap-2">
                    <span className="text-green-500 font-bold">
                      {String.fromCharCode(65 + opcaoIndex)})
                    </span>
                    <Input
                      value={opcao}
                      onChange={(e) => {
                        const novasOpcoes = [...questao.opcoes!];
                        novasOpcoes[opcaoIndex] = e.target.value;
                        updateArrayItem('questoes', index, { ...questao, opcoes: novasOpcoes });
                      }}
                      className="bg-white"
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

  const renderEditableAssessment = (assessment: Assessment) => (
    <div className="bg-white p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-purple-600">AVALIAÇÃO</h1>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-semibold text-purple-800">Instruções da Avaliação</h4>
          <Input
            value={assessment.tempoLimite}
            onChange={(e) => updateContent('tempoLimite', e.target.value)}
            className="w-32 bg-white"
            placeholder="Tempo limite"
          />
        </div>
        <Textarea
          value={assessment.instrucoes}
          onChange={(e) => updateContent('instrucoes', e.target.value)}
          className="bg-white min-h-[80px]"
        />
      </div>

      <div className="space-y-6">
        {assessment.questoes.map((questao, index) => (
          <div key={index} className="border-l-4 border-l-purple-500 bg-gray-50 p-4 rounded">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-bold">Questão {questao.numero}</h4>
              <Input
                type="number"
                value={questao.pontuacao}
                onChange={(e) => updateArrayItem('questoes', index, { ...questao, pontuacao: parseInt(e.target.value) || 0 })}
                className="w-20 bg-white"
                min="0"
              />
            </div>
            
            <Textarea
              value={questao.pergunta}
              onChange={(e) => updateArrayItem('questoes', index, { ...questao, pergunta: e.target.value })}
              className="mb-4 bg-white min-h-[80px]"
              placeholder="Pergunta da questão"
            />
            
            {questao.opcoes && (
              <div className="space-y-2">
                <p className="font-medium text-gray-600">Opções:</p>
                {questao.opcoes.map((opcao, opcaoIndex) => (
                  <div key={opcaoIndex} className="flex items-center gap-2">
                    <span className="text-purple-500 font-bold">
                      {String.fromCharCode(65 + opcaoIndex)})
                    </span>
                    <Input
                      value={opcao}
                      onChange={(e) => {
                        const novasOpcoes = [...questao.opcoes!];
                        novasOpcoes[opcaoIndex] = e.target.value;
                        updateArrayItem('questoes', index, { ...questao, opcoes: novasOpcoes });
                      }}
                      className="bg-white"
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
              {renderEditableContent()}
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
                <Input
                  value={editedMaterial.title}
                  onChange={(e) => setEditedMaterial({ ...editedMaterial, title: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <span className="font-medium">Disciplina:</span>
                <Input
                  value={editedMaterial.subject}
                  onChange={(e) => setEditedMaterial({ ...editedMaterial, subject: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <span className="font-medium">Turma:</span>
                <Input
                  value={editedMaterial.grade}
                  onChange={(e) => setEditedMaterial({ ...editedMaterial, grade: e.target.value })}
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
