import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Edit, Trash2, FileText, Presentation, ClipboardList, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { materialService, type GeneratedMaterial, type LessonPlan, type Activity, type Slide, type Assessment } from '@/services/materialService';
import { exportService } from '@/services/exportService';
import MaterialEditModal from './MaterialEditModal';
import { Bar, Line, Pie } from 'react-chartjs-2';
import * as Icons from 'react-icons/fa';
import MaterialModal from './MaterialModal';
import { normalizeMaterialForPreview } from '@/services/materialService';
import { templateService } from '@/services/templateService';

// Substituir GeometryBoard por SVG puro
const CircleSVG = ({ radius = 40, size = 100 }) => (
  <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ background: 'white' }}>
    <circle cx={size/2} cy={size/2} r={radius} stroke="#2d7a46" strokeWidth="3" fill="#e6f4ea" />
  </svg>
);

const TriangleSVG = ({ size = 100 }) => {
  const points = [
    `${size/2},10`, // top
    `10,${size-10}`,
    `${size-10},${size-10}`
  ].join(' ');
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ background: 'white' }}>
      <polygon points={points} stroke="#2d7a46" strokeWidth="3" fill="#e6f4ea" />
    </svg>
  );
};

const MaterialViewer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [material, setMaterial] = React.useState<GeneratedMaterial | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [materialModalOpen, setMaterialModalOpen] = React.useState(false);

  const loadMaterial = React.useCallback(async () => {
    if (id) {
      console.log('Loading material with ID:', id);
      const foundMaterial = await materialService.getMaterialById(id);
      console.log('Found material:', foundMaterial);
      // Parse automático do campo content se vier como string
      if (foundMaterial && typeof foundMaterial.content === 'string') {
        try {
          foundMaterial.content = JSON.parse(foundMaterial.content);
        } catch (e) {
          console.error('Erro ao fazer parse do campo content:', e);
        }
      }
      setMaterial(foundMaterial || null);
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    loadMaterial();
  }, [loadMaterial]);

  React.useEffect(() => {
    if (material) setMaterialModalOpen(true);
  }, [material]);

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

  const handleDelete = async () => {
    if (!material) return;
    
    const success = await materialService.deleteMaterial(material.id);
    if (success) {
      toast.success('Material excluído com sucesso!');
      navigate('/');
    } else {
      toast.error('Erro ao excluir material');
    }
  };

  const handleEditSave = () => {
    console.log('Edit saved, reloading material...');
    // Force reload the material from storage to reflect changes
    loadMaterial();
    setEditModalOpen(false);
    toast.success('Material atualizado com sucesso!');
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
            <p><span className="font-medium">Disciplina:</span> {content.disciplina ? content.disciplina.charAt(0).toUpperCase() + content.disciplina.slice(1) : ''}</p>
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
    // Extract the slides array from the content structure
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

              {/* Múltipla escolha e verdadeiro/falso */}
              {questao.opcoes && Array.isArray(questao.opcoes) && questao.opcoes.length > 0 && (
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

              {/* Questão de ligar */}
              {questao.tipo === 'ligar' && questao.colunaA && questao.colunaB && (
                <div className="flex gap-8 mt-2">
                  <div>
                    <p className="font-semibold text-xs mb-1">Coluna A</p>
                    {questao.colunaA.map((item, idx) => (
                      <div key={idx} className="border rounded px-2 py-1 mb-1 bg-gray-50">{idx + 1}) {item}</div>
                    ))}
                  </div>
                  <div>
                    <p className="font-semibold text-xs mb-1">Coluna B</p>
                    {questao.colunaB.map((item, idx) => (
                      <div key={idx} className="border rounded px-2 py-1 mb-1 bg-gray-50">{String.fromCharCode(65 + idx)}) {item}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Questão de completar */}
              {questao.tipo === 'completar' && questao.textoComLacunas && (
                <div className="mt-2 p-2 bg-yellow-50 border rounded">
                  <span className="font-mono">{questao.textoComLacunas}</span>
                </div>
              )}

              {/* Questão dissertativa */}
              {questao.tipo === 'dissertativa' && (
                <div className="mt-2">
                  {[...Array(questao.linhasResposta || 5)].map((_, i) => (
                    <div key={i} className="border-b border-gray-300 my-2" style={{height: 24}} />
                  ))}
                </div>
              )}

              {/* Questão de verdadeiro/falso */}
              {questao.tipo === 'verdadeiro_falso' && (
                <div className="mt-2 flex gap-4">
                  <div className="flex items-center"><span className="font-bold mr-1">( )</span> Verdadeiro</div>
                  <div className="flex items-center"><span className="font-bold mr-1">( )</span> Falso</div>
                </div>
              )}

              {/* Imagem da questão */}
              {questao.imagem && (
                <div className="flex justify-center mb-2">
                  <img src={questao.imagem} alt="Imagem da questão" style={{maxWidth: 180, maxHeight: 120, objectFit: 'contain', borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff', padding: 4}} />
                </div>
              )}

              {/* Ícones da questão (reais) */}
              {questao.icones && Array.isArray(questao.icones) && (
                <div className="flex justify-center gap-2 mb-2">
                  {questao.icones.map((icon, idx) => {
                    const IconComp = Icons[icon as keyof typeof Icons];
                    return IconComp ? <IconComp key={idx} size={32} /> : <span key={idx} style={{fontSize: '2rem'}}>[{icon}]</span>;
                  })}
                </div>
              )}

              {/* Gráfico real */}
              {questao.grafico && (
                <div className="flex justify-center mb-2">
                  {questao.grafico.tipo === 'bar' && <Bar data={questao.grafico.data} options={questao.grafico.options || {}} />}
                  {questao.grafico.tipo === 'line' && <Line data={questao.grafico.data} options={questao.grafico.options || {}} />}
                  {questao.grafico.tipo === 'pie' && <Pie data={questao.grafico.data} options={questao.grafico.options || {}} />}
                  {/* Fallback */}
                  {!['bar','line','pie'].includes(questao.grafico.tipo) && <span className="text-indigo-600 text-sm">[Gráfico: {questao.grafico.tipo || 'tipo'}]</span>}
                </div>
              )}

              {/* Figura geométrica real */}
              {questao.figuraGeometrica && (
                <div className="flex justify-center mb-2">
                  {questao.figuraGeometrica.tipo === 'circulo' && <CircleSVG />}
                  {questao.figuraGeometrica.tipo === 'triangulo' && <TriangleSVG />}
                  {/* Adicione outros tipos conforme necessário */}
                  {!['circulo','triangulo'].includes(questao.figuraGeometrica.tipo) && (
                    <span className="text-green-600 text-sm">[Figura: {questao.figuraGeometrica.tipo || 'tipo'}]</span>
                  )}
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-gray-100">
                <Badge variant="secondary">{questao.tipo.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAssessment = (assessment: Assessment, material) => {
    // Buscar nome da escola de várias fontes
    const escola =
      material.escola ||
      (material.content && material.content.escola) ||
      (material.formData && material.formData.escola) ||
      '';

    const html = templateService.renderTemplate('4', {
      ...material.content,
      ...assessment,
      professor: material.professor || '',
      serie: material.grade || '',
      escola, // Garante que o campo escola é passado
      // outros campos...
    });

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
          dangerouslySetInnerHTML={{ __html: html }}
          style={{ 
            maxHeight: '80vh', 
            overflow: 'auto',
            fontSize: '0.85rem'
          }}
        />
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
        return renderAssessment(material.content as Assessment, material);
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
    <>
      <MaterialModal
        material={material ? normalizeMaterialForPreview(material) : null}
        open={materialModalOpen}
        onClose={() => { setMaterialModalOpen(false); navigate('/'); }}
      />
    </>
  );
};

export default MaterialViewer;
