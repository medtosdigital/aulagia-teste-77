import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Edit, Trash2, FileText, Presentation, ClipboardList, GraduationCap, Slides } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { materialService, type GeneratedMaterial, type LessonPlan, type Activity, type Slide, type Assessment } from '@/services/materialService';
import { exportService } from '@/services/exportService';
import MaterialEditModal from './MaterialEditModal';
import SlideEditModal from './SlideEditModal';

const MaterialViewer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [material, setMaterial] = React.useState<GeneratedMaterial | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [slideEditModalOpen, setSlideEditModalOpen] = React.useState(false);

  const loadMaterial = React.useCallback(() => {
    if (id) {
      console.log('Loading material with ID:', id);
      const foundMaterial = materialService.getMaterialById(id);
      console.log('Found material:', foundMaterial);
      setMaterial(foundMaterial || null);
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    loadMaterial();
  }, [loadMaterial]);

  const handleExport = async (format: 'pdf' | 'word' | 'ppt') => {
    if (!material) return;

    try {
      setLoading(true);
      switch (format) {
        case 'pdf':
          await exportService.exportToPDF(material);
          toast.success('Material exportado para PDF com sucesso!');
          break;
        case 'word':
          await exportService.exportToWord(material);
          toast.success('Material exportado para Word com sucesso!');
          break;
        case 'ppt':
          await exportService.exportToPPT(material);
          toast.success('Material exportado para PowerPoint com sucesso!');
          break;
      }
    } catch (error) {
      toast.error('Erro ao exportar material');
      console.error('Export error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!material) return;
    
    const success = materialService.deleteMaterial(material.id);
    if (success) {
      toast.success('Material excluído com sucesso!');
      navigate('/');
    } else {
      toast.error('Erro ao excluir material');
    }
  };

  const handleEditSave = () => {
    console.log('Edit saved, reloading material...');
    loadMaterial();
    setEditModalOpen(false);
    toast.success('Material atualizado com sucesso!');
  };

  const handleSlideEditSave = (updatedMaterial: GeneratedMaterial) => {
    console.log('Slide edit saved, updating material...');
    materialService.updateMaterial(updatedMaterial);
    loadMaterial();
    setSlideEditModalOpen(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'plano-de-aula':
        return <GraduationCap className="h-5 w-5" />;
      case 'slides':
        return <Presentation className="h-5 w-5" />;
      case 'atividade':
        return <ClipboardList className="h-5 w-5" />;
      case 'avaliacao':
        return <FileText className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      'plano-de-aula': 'Plano de Aula',
      'slides': 'Slides',
      'atividade': 'Atividade',
      'avaliacao': 'Avaliação'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const renderLessonPlan = (content: LessonPlan) => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold text-sm text-gray-600 mb-2">Informações Básicas</h4>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Professor:</span> {content.professor}</p>
            <p><span className="font-medium">Disciplina:</span> {content.disciplina}</p>
            <p><span className="font-medium">Tema:</span> {content.tema}</p>
            <p><span className="font-medium">Duração:</span> {content.duracao}</p>
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-sm text-gray-600 mb-2">Detalhes</h4>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Data:</span> {content.data}</p>
            <p><span className="font-medium">Série:</span> {content.serie}</p>
            <p><span className="font-medium">BNCC:</span> {content.bncc}</p>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="font-semibold text-sm text-gray-600 mb-3">Objetivos de Aprendizagem</h4>
        <ul className="space-y-2">
          {content.objetivos.map((objetivo, index) => (
            <li key={index} className="flex items-start">
              <span className="text-blue-500 font-bold mr-2">•</span>
              <span className="text-sm">{objetivo}</span>
            </li>
          ))}
        </ul>
      </div>

      <Separator />

      <div>
        <h4 className="font-semibold text-sm text-gray-600 mb-3">Habilidades BNCC</h4>
        <ul className="space-y-2">
          {content.habilidades.map((habilidade, index) => (
            <li key={index} className="flex items-start">
              <span className="text-green-500 font-bold mr-2">•</span>
              <span className="text-sm">{habilidade}</span>
            </li>
          ))}
        </ul>
      </div>

      <Separator />

      <div>
        <h4 className="font-semibold text-sm text-gray-600 mb-3">Desenvolvimento da Aula</h4>
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
                <TableCell className="font-medium">{etapa.etapa}</TableCell>
                <TableCell>{etapa.atividade}</TableCell>
                <TableCell>{etapa.tempo}</TableCell>
                <TableCell>{etapa.recursos}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold text-sm text-gray-600 mb-3">Recursos Necessários</h4>
          <ul className="space-y-1">
            {content.recursos.map((recurso, index) => (
              <li key={index} className="flex items-center">
                <span className="text-orange-500 font-bold mr-2">•</span>
                <span className="text-sm">{recurso}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-sm text-gray-600 mb-3">Avaliação</h4>
          <p className="text-sm whitespace-pre-line">{content.avaliacao}</p>
        </div>
      </div>
    </div>
  );

  const renderSlides = (slidesContent: any) => {
    const slides = slidesContent.slides || [];
    
    if (!Array.isArray(slides)) {
      console.error('Slides content is not an array:', slides);
      return <div>Erro: Conteúdo de slides inválido</div>;
    }

    return (
      <div className="space-y-6">
        {slides.map((slide, index) => (
          <Card key={index} className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Slide {slide.numero}: {slide.titulo}</CardTitle>
                <Badge variant="secondary">Slide {slide.numero}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {slide.conteudo.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start">
                    <span className="text-blue-500 font-bold mr-2">•</span>
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderActivity = (activity: Activity) => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">Instruções</h4>
        <p className="text-sm text-blue-700 whitespace-pre-line">{activity.instrucoes}</p>
      </div>

      <div className="space-y-6">
        {activity.questoes.map((questao, index) => (
          <Card key={index} className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Questão {questao.numero}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">{questao.pergunta}</p>
              
              {questao.opcoes && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Opções:</p>
                  <ul className="space-y-1">
                    {questao.opcoes.map((opcao, opcaoIndex) => (
                      <li key={opcaoIndex} className="flex items-center">
                        <span className="text-green-500 font-bold mr-2">
                          {String.fromCharCode(65 + opcaoIndex)})
                        </span>
                        <span className="text-sm">{opcao}</span>
                        {questao.resposta === opcao && (
                          <Badge variant="default" className="ml-2 text-xs">Resposta</Badge>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-gray-100">
                <Badge variant={questao.tipo === 'multipla_escolha' ? 'default' : 'secondary'}>
                  {questao.tipo === 'multipla_escolha' ? 'Múltipla Escolha' : 
                   questao.tipo === 'verdadeiro_falso' ? 'Verdadeiro/Falso' : 'Questão Aberta'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAssessment = (assessment: Assessment) => {
    if (assessment.htmlContent) {
      return (
        <div className="w-full">
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">Preview da Avaliação</h4>
            <p className="text-sm text-yellow-700">
              Esta é uma prévia da avaliação. Use o botão "PDF" para exportar a versão completa formatada para impressão.
            </p>
          </div>
          <div 
            className="assessment-preview border rounded-lg p-4 bg-white"
            dangerouslySetInnerHTML={{ __html: assessment.htmlContent }}
            style={{ 
              maxHeight: '80vh', 
              overflow: 'auto',
              fontSize: '0.85rem'
            }}
          />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold text-purple-800">Instruções da Avaliação</h4>
            <Badge variant="outline" className="text-purple-600 border-purple-300">
              {assessment.tempoLimite}
            </Badge>
          </div>
          <p className="text-sm text-purple-700">{assessment.instrucoes}</p>
        </div>

        <div className="space-y-6">
          {assessment.questoes.map((questao, index) => (
            <Card key={index} className="border-l-4 border-l-purple-500">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">Questão {questao.numero}</CardTitle>
                  <Badge variant="secondary">{questao.pontuacao} pontos</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">{questao.pergunta}</p>
                
                {questao.opcoes && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Opções:</p>
                    <ul className="space-y-1">
                      {questao.opcoes.map((opcao, opcaoIndex) => (
                        <li key={opcaoIndex} className="flex items-center">
                          <span className="text-purple-500 font-bold mr-2">
                            {String.fromCharCode(65 + opcaoIndex)})
                          </span>
                          <span className="text-sm">{opcao}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-gray-100">
                  <Badge variant={questao.tipo === 'multipla_escolha' ? 'default' : 'secondary'}>
                    {questao.tipo === 'multipla_escolha' ? 'Múltipla Escolha' : 'Dissertativa'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (!material) return null;

    switch (material.type) {
      case 'plano-de-aula':
        return renderLessonPlan(material.content as LessonPlan);
      case 'slides':
        return renderSlides(material.content);
      case 'atividade':
        return renderActivity(material.content as Activity);
      case 'avaliacao':
        return renderAssessment(material.content as Assessment);
      default:
        return <div>Tipo de material não suportado</div>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando material...</p>
        </div>
      </div>
    );
  }

  if (!material) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Material não encontrado</h2>
          <p className="text-gray-600 mb-4">O material que você está procurando não existe.</p>
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button onClick={() => navigate('/')} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          
          <div className="flex items-center space-x-2">
            {material.type === 'slides' ? (
              <Button
                onClick={() => setSlideEditModalOpen(true)}
                variant="outline"
                size="sm"
              >
                <Slides className="h-4 w-4 mr-2" />
                Editar Slides
              </Button>
            ) : (
              <Button
                onClick={() => setEditModalOpen(true)}
                variant="outline"
                size="sm"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
            <Button
              onClick={() => handleExport('pdf')}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button
              onClick={() => handleExport('word')}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <FileText className="h-4 w-4 mr-2" />
              Word
            </Button>
            {material.type === 'slides' && (
              <Button
                onClick={() => handleExport('ppt')}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                <Presentation className="h-4 w-4 mr-2" />
                PPT
              </Button>
            )}
            <Button
              onClick={handleDelete}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </Button>
          </div>
        </div>

        {/* Material Info */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  {getTypeIcon(material.type)}
                </div>
                <div>
                  <CardTitle className="text-xl">{material.title}</CardTitle>
                  <div className="flex items-center space-x-4 mt-2">
                    <Badge variant="secondary">{getTypeLabel(material.type)}</Badge>
                    <span className="text-sm text-gray-600">{material.subject}</span>
                    <span className="text-sm text-gray-600">{material.grade}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Criado em</p>
                <p className="text-sm font-medium">
                  {new Date(material.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Material Content */}
        <Card>
          <CardContent className="p-6">
            {renderContent()}
          </CardContent>
        </Card>
      </div>

      {/* Edit Modals */}
      <MaterialEditModal
        material={material}
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleEditSave}
      />

      <SlideEditModal
        material={material}
        open={slideEditModalOpen}
        onClose={() => setSlideEditModalOpen(false)}
        onSave={handleSlideEditSave}
      />
    </div>
  );
};

export default MaterialViewer;
