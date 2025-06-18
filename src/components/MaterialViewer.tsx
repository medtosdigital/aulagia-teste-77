
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit3, 
  Download, 
  FileText, 
  Save, 
  X,
  Printer,
  File,
  FileWord
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { materialService, GeneratedMaterial, LessonPlan, Activity, Slide, Assessment } from '@/services/materialService';
import { exportService } from '@/services/exportService';

const MaterialViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [material, setMaterial] = useState<GeneratedMaterial | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (id) {
      const foundMaterial = materialService.getMaterialById(id);
      if (foundMaterial) {
        setMaterial(foundMaterial);
        setEditContent(foundMaterial.content);
      } else {
        toast.error('Material não encontrado');
        navigate('/');
      }
    }
  }, [id, navigate]);

  const handleSave = () => {
    if (material && editContent) {
      const updated = materialService.updateMaterial(material.id, { content: editContent });
      if (updated) {
        setMaterial(updated);
        setIsEditing(false);
        toast.success('Material salvo com sucesso!');
      }
    }
  };

  const handleExport = async (format: 'pdf' | 'word' | 'ppt') => {
    if (!material) return;

    setIsExporting(true);
    try {
      switch (format) {
        case 'pdf':
          await exportService.exportToPDF(material);
          toast.success('PDF exportado com sucesso!');
          break;
        case 'word':
          await exportService.exportToWord(material);
          toast.success('Documento Word exportado com sucesso!');
          break;
        case 'ppt':
          if (material.type === 'slides') {
            await exportService.exportToPPT(material);
            toast.success('Slides exportados com sucesso!');
          } else {
            toast.error('Exportação PPT disponível apenas para slides');
          }
          break;
      }
    } catch (error) {
      toast.error('Erro ao exportar material');
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const renderContent = () => {
    if (!material) return null;

    switch (material.type) {
      case 'plano-de-aula':
        return renderLessonPlan(material.content as LessonPlan);
      case 'slides':
        return renderSlides(material.content as Slide[]);
      case 'atividade':
        return renderActivity(material.content as Activity);
      case 'avaliacao':
        return renderAssessment(material.content as Assessment);
      default:
        return <div>Tipo de conteúdo não suportado</div>;
    }
  };

  const renderLessonPlan = (content: LessonPlan) => (
    <div className="space-y-8">
      {/* Header com informações básicas */}
      <Card>
        <CardHeader className="text-center bg-gradient-to-r from-blue-50 to-purple-50">
          <CardTitle className="text-2xl font-bold text-blue-600">PLANO DE AULA</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isEditing ? (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Professor(a):</label>
                  <Input
                    value={editContent.professor}
                    onChange={(e) => setEditContent({...editContent, professor: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Data:</label>
                  <Input
                    value={editContent.data}
                    onChange={(e) => setEditContent({...editContent, data: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Disciplina:</label>
                  <Input
                    value={editContent.disciplina}
                    onChange={(e) => setEditContent({...editContent, disciplina: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Série/Ano:</label>
                  <Input
                    value={editContent.serie}
                    onChange={(e) => setEditContent({...editContent, serie: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tema:</label>
                  <Input
                    value={editContent.tema}
                    onChange={(e) => setEditContent({...editContent, tema: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Duração:</label>
                  <Input
                    value={editContent.duracao}
                    onChange={(e) => setEditContent({...editContent, duracao: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">BNCC:</label>
                  <Input
                    value={editContent.bncc}
                    onChange={(e) => setEditContent({...editContent, bncc: e.target.value})}
                  />
                </div>
              </>
            ) : (
              <>
                <div><strong>Professor(a):</strong> {content.professor}</div>
                <div><strong>Data:</strong> {content.data}</div>
                <div><strong>Disciplina:</strong> {content.disciplina}</div>
                <div><strong>Série/Ano:</strong> {content.serie}</div>
                <div><strong>Tema:</strong> {content.tema}</div>
                <div><strong>Duração:</strong> {content.duracao}</div>
                <div className="md:col-span-2"><strong>BNCC:</strong> {content.bncc}</div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Objetivos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-blue-600">OBJETIVOS DE APRENDIZAGEM</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-2">
              {editContent.objetivos.map((obj: string, index: number) => (
                <Textarea
                  key={index}
                  value={obj}
                  onChange={(e) => {
                    const newObjetivos = [...editContent.objetivos];
                    newObjetivos[index] = e.target.value;
                    setEditContent({...editContent, objetivos: newObjetivos});
                  }}
                  className="min-h-[60px]"
                />
              ))}
            </div>
          ) : (
            <ul className="list-disc list-inside space-y-2">
              {content.objetivos.map((objetivo, index) => (
                <li key={index}>{objetivo}</li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Habilidades BNCC */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-blue-600">HABILIDADES BNCC ({content.bncc})</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-2">
              {editContent.habilidades.map((hab: string, index: number) => (
                <Textarea
                  key={index}
                  value={hab}
                  onChange={(e) => {
                    const newHabilidades = [...editContent.habilidades];
                    newHabilidades[index] = e.target.value;
                    setEditContent({...editContent, habilidades: newHabilidades});
                  }}
                  className="min-h-[80px]"
                />
              ))}
            </div>
          ) : (
            <ul className="list-disc list-inside space-y-2">
              {content.habilidades.map((habilidade, index) => (
                <li key={index}>{habilidade}</li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Desenvolvimento Metodológico */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-blue-600">DESENVOLVIMENTO METODOLÓGICO</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border border-gray-300 p-3 text-left font-semibold">Etapa</th>
                  <th className="border border-gray-300 p-3 text-left font-semibold">Atividade</th>
                  <th className="border border-gray-300 p-3 text-left font-semibold">Tempo</th>
                  <th className="border border-gray-300 p-3 text-left font-semibold">Recursos</th>
                </tr>
              </thead>
              <tbody>
                {content.desenvolvimento.map((etapa, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-3 font-medium">{etapa.etapa}</td>
                    <td className="border border-gray-300 p-3">{etapa.atividade}</td>
                    <td className="border border-gray-300 p-3">{etapa.tempo}</td>
                    <td className="border border-gray-300 p-3">{etapa.recursos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recursos Didáticos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-blue-600">RECURSOS DIDÁTICOS</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-1">
            {content.recursos.map((recurso, index) => (
              <li key={index}>{recurso}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Avaliação */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-blue-600">AVALIAÇÃO</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <Textarea
              value={editContent.avaliacao}
              onChange={(e) => setEditContent({...editContent, avaliacao: e.target.value})}
              className="min-h-[120px]"
            />
          ) : (
            <div className="whitespace-pre-line">{content.avaliacao}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderSlides = (slides: Slide[]) => (
    <div className="space-y-6">
      {slides.map((slide) => (
        <Card key={slide.numero} className="border-2 border-gray-200">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100">
            <CardTitle className="text-xl">
              Slide {slide.numero}: {slide.titulo}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-4">
              {isEditing ? (
                <>
                  <Input
                    value={editContent[slide.numero - 1]?.titulo || slide.titulo}
                    onChange={(e) => {
                      const newSlides = [...editContent];
                      newSlides[slide.numero - 1] = {...newSlides[slide.numero - 1], titulo: e.target.value};
                      setEditContent(newSlides);
                    }}
                    className="text-lg font-semibold"
                  />
                  {slide.conteudo.map((item, index) => (
                    <Textarea
                      key={index}
                      value={editContent[slide.numero - 1]?.conteudo[index] || item}
                      onChange={(e) => {
                        const newSlides = [...editContent];
                        const newConteudo = [...newSlides[slide.numero - 1].conteudo];
                        newConteudo[index] = e.target.value;
                        newSlides[slide.numero - 1] = {...newSlides[slide.numero - 1], conteudo: newConteudo};
                        setEditContent(newSlides);
                      }}
                    />
                  ))}
                </>
              ) : (
                <>
                  {slide.conteudo.map((item, index) => (
                    <div key={index} className="text-lg">{item}</div>
                  ))}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderActivity = (activity: Activity) => (
    <div className="space-y-6">
      <Card>
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100">
          <CardTitle className="text-2xl font-bold text-emerald-600">ATIVIDADE</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {isEditing ? (
            <Textarea
              value={editContent.instrucoes}
              onChange={(e) => setEditContent({...editContent, instrucoes: e.target.value})}
              className="min-h-[100px]"
            />
          ) : (
            <div className="whitespace-pre-line text-gray-700">{activity.instrucoes}</div>
          )}
        </CardContent>
      </Card>

      {activity.questoes.map((questao) => (
        <Card key={questao.numero}>
          <CardHeader>
            <CardTitle className="text-lg text-emerald-600">
              Questão {questao.numero}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <Textarea
                value={editContent.questoes.find((q: any) => q.numero === questao.numero)?.pergunta || questao.pergunta}
                onChange={(e) => {
                  const newQuestoes = editContent.questoes.map((q: any) => 
                    q.numero === questao.numero ? {...q, pergunta: e.target.value} : q
                  );
                  setEditContent({...editContent, questoes: newQuestoes});
                }}
                className="min-h-[80px]"
              />
            ) : (
              <div className="mb-4">{questao.pergunta}</div>
            )}
            
            {questao.opcoes && (
              <div className="mt-4 space-y-2">
                {questao.opcoes.map((opcao, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center text-sm font-medium">
                      {String.fromCharCode(97 + index)}
                    </span>
                    <span>{opcao}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderAssessment = (assessment: Assessment) => (
    <div className="space-y-6">
      <Card>
        <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100">
          <CardTitle className="text-2xl font-bold text-purple-600">AVALIAÇÃO</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-4">
            <strong>Tempo limite:</strong> {assessment.tempoLimite}
          </div>
          {isEditing ? (
            <Textarea
              value={editContent.instrucoes}
              onChange={(e) => setEditContent({...editContent, instrucoes: e.target.value})}
              className="min-h-[100px]"
            />
          ) : (
            <div className="whitespace-pre-line text-gray-700">{assessment.instrucoes}</div>
          )}
        </CardContent>
      </Card>

      {assessment.questoes.map((questao) => (
        <Card key={questao.numero}>
          <CardHeader>
            <CardTitle className="text-lg text-purple-600 flex justify-between items-center">
              <span>Questão {questao.numero}</span>
              <span className="text-sm font-normal bg-purple-100 px-3 py-1 rounded-full">
                {questao.pontuacao} {questao.pontuacao === 1 ? 'ponto' : 'pontos'}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">{questao.pergunta}</div>
            
            {questao.opcoes && (
              <div className="mt-4 space-y-2">
                {questao.opcoes.map((opcao, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-sm font-medium">
                      {String.fromCharCode(97 + index)}
                    </span>
                    <span>{opcao}</span>
                  </div>
                ))}
              </div>
            )}

            {questao.tipo === 'dissertativa' && (
              <div className="mt-4 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                <p className="text-gray-500 text-sm">Espaço para resposta dissertativa</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const getTypeLabel = (type: string) => {
    const labels = {
      'plano-de-aula': 'Plano de Aula',
      'slides': 'Slides',
      'atividade': 'Atividade',
      'avaliacao': 'Avaliação'
    };
    return labels[type as keyof typeof labels] || type;
  };

  if (!material) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-20">
            <div className="text-gray-500">Carregando material...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header fixo */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{material.title}</h1>
                <p className="text-gray-600">
                  {getTypeLabel(material.type)} • {material.subject} • {material.grade}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {isEditing ? (
                <>
                  <Button
                    onClick={handleSave}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Salvar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setEditContent(material.content);
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="outline"
                      onClick={() => handleExport('pdf')}
                      disabled={isExporting}
                      className="flex items-center space-x-2"
                    >
                      <FileText className="w-4 h-4" />
                      <span>PDF</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => handleExport('word')}
                      disabled={isExporting}
                      className="flex items-center space-x-2"
                    >
                      <FileWord className="w-4 h-4" />
                      <span>Word</span>
                    </Button>
                    
                    {material.type === 'slides' && (
                      <Button
                        variant="outline"
                        onClick={() => handleExport('ppt')}
                        disabled={isExporting}
                        className="flex items-center space-x-2"
                      >
                        <File className="w-4 h-4" />
                        <span>PPT</span>
                      </Button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {renderContent()}
      </div>

      {/* Detalhes na lateral - similar às imagens de referência */}
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-2xl shadow-xl p-6 w-80 border border-gray-200">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-4">Exportar Material</h3>
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleExport('pdf')}
                disabled={isExporting}
              >
                <Printer className="w-4 h-4 mr-3" />
                Imprimir
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleExport('pdf')}
                disabled={isExporting}
              >
                <Download className="w-4 h-4 mr-3" />
                PDF
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleExport('word')}
                disabled={isExporting}
              >
                <Download className="w-4 h-4 mr-3" />
                Microsoft Word
              </Button>
              {material.type === 'slides' && (
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => handleExport('ppt')}
                  disabled={isExporting}
                >
                  <Download className="w-4 h-4 mr-3" />
                  PowerPoint
                </Button>
              )}
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold text-lg mb-4">Detalhes</h3>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Disciplina:</span> {material.subject}</div>
              <div><span className="font-medium">Turma:</span> {material.grade}</div>
              <div><span className="font-medium">Tipo:</span> {getTypeLabel(material.type)}</div>
              <div><span className="font-medium">Criado:</span> {new Date(material.createdAt).toLocaleDateString('pt-BR')}</div>
            </div>
          </div>

          <Button 
            className="w-full bg-gray-800 hover:bg-gray-900 text-white"
            onClick={() => navigate('/')}
          >
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MaterialViewer;
