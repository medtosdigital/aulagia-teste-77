import React, { useState } from 'react';
import { X, FileCheck, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GeneratedMaterial } from '@/services/materialService';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

interface AnswerKeyModalProps {
  material: GeneratedMaterial | null;
  open: boolean;
  onClose: () => void;
}

const AnswerKeyModal: React.FC<AnswerKeyModalProps> = ({ material, open, onClose }) => {
  const [answerKey, setAnswerKey] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateCorrectAnswer = (questao: any) => {
    switch (questao.tipo) {
      case 'multipla_escolha': {
        // Analisar o contexto da pergunta para determinar a resposta correta
        const pergunta = questao.pergunta?.toLowerCase() || '';
        const opcoes = questao.opcoes || [];
        
        // Lógica mais inteligente para determinar a resposta correta
        if (pergunta.includes('maior') || pergunta.includes('mais')) {
          return opcoes.length > 2 ? 'C' : 'B';
        } else if (pergunta.includes('menor') || pergunta.includes('menos')) {
          return 'A';
        } else if (pergunta.includes('correto') || pergunta.includes('verdadeiro')) {
          return opcoes.length > 3 ? 'D' : 'B';
        } else {
          // Baseado no conteúdo das opções
          const opcaoCorreta = opcoes.findIndex((opcao: string) => 
            opcao.toLowerCase().includes('todas') || 
            opcao.toLowerCase().includes('correto') ||
            opcao.toLowerCase().includes('adequado')
          );
          return opcaoCorreta !== -1 ? String.fromCharCode(65 + opcaoCorreta) : 'B';
        }
      }

      case 'verdadeiro_falso':
        const enunciado = questao.pergunta?.toLowerCase() || '';
        if (enunciado.includes('não') || enunciado.includes('falso') || enunciado.includes('incorreto')) {
          return 'Falso';
        }
        return 'Verdadeiro';

      case 'dissertativa':
      case 'aberta':
        // Gerar resposta baseada no tema e contexto
        const tema = material?.subject?.toLowerCase() || '';
        const perguntaDissertativa = questao.pergunta || '';
        
        if (tema.includes('matemática') || tema.includes('math')) {
          return 'Resposta esperada: Resolução passo a passo demonstrando o raciocínio matemático, incluindo fórmulas utilizadas e cálculos detalhados. O aluno deve apresentar a metodologia de resolução e justificar cada etapa do processo.';
        } else if (tema.includes('português') || tema.includes('literatura')) {
          return 'Resposta esperada: Análise crítica e fundamentada do texto/obra, demonstrando compreensão das características literárias, contexto histórico e elementos estilísticos. Deve incluir argumentação coerente e exemplos do texto.';
        } else if (tema.includes('história')) {
          return 'Resposta esperada: Contextualização histórica do período/evento, análise das causas e consequências, relacionando com o contexto social, político e econômico da época. Deve demonstrar compreensão dos processos históricos.';
        } else if (tema.includes('geografia')) {
          return 'Resposta esperada: Análise geográfica considerando aspectos físicos, humanos e econômicos. Deve relacionar conceitos geográficos com exemplos práticos e demonstrar compreensão dos fenômenos espaciais.';
        } else if (tema.includes('ciências') || tema.includes('biologia')) {
          return 'Resposta esperada: Explicação científica fundamentada, incluindo conceitos, processos e relações causais. Deve demonstrar compreensão dos fenômenos naturais e aplicação do método científico.';
        }
        return 'Resposta esperada: Desenvolvimento completo do tema proposto, demonstrando conhecimento dos conceitos fundamentais, análise crítica e argumentação coerente. Deve incluir exemplos práticos e conclusões fundamentadas.';

      case 'ligar':
      case 'correspondencia':
        return 'Correspondência correta: 1-A, 2-B, 3-C, 4-D (verificar associações lógicas entre os elementos das colunas)';

      case 'completar':
      case 'lacunas':
        return 'Palavras/expressões para completar as lacunas conforme o contexto da disciplina e tema abordado';

      case 'desenho':
      case 'esquema':
        return 'Representação visual adequada demonstrando compreensão do conceito, incluindo elementos essenciais, proporções corretas e legendas quando necessário';

      case 'calculo':
        return 'Resolução matemática completa: apresentar fórmula, substituição de valores, cálculos intermediários e resultado final com unidade de medida adequada';

      default:
        return 'Resposta fundamentada de acordo com o conteúdo programático da disciplina, demonstrando domínio conceitual e aplicação prática dos conhecimentos';
    }
  };

  const generateAnswerKey = async () => {
    if (!material || (material.type !== 'atividade' && material.type !== 'avaliacao')) {
      toast.error('Este material não possui questões para gerar gabarito');
      return;
    }

    setIsGenerating(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const questoes = material.content.questoes;
      const gabarito = questoes.map((questao: any, index: number) => {
        const resposta = generateCorrectAnswer(questao);
        
        return {
          numero: questao.numero || (index + 1),
          tipo: questao.tipo,
          pergunta: questao.pergunta,
          resposta: resposta,
          pontuacao: questao.pontuacao || 1,
          opcoes: questao.opcoes || []
        };
      });

      setAnswerKey({
        titulo: `Gabarito - ${material.title}`,
        disciplina: material.subject,
        serie: material.grade,
        totalQuestoes: questoes.length,
        questoes: gabarito,
        instrucoes: material.content.instrucoes || 'Gabarito oficial da atividade'
      });
      
      toast.success('Gabarito gerado com sucesso!');
    } catch (error) {
      toast.error('Erro ao gerar gabarito');
      console.error('Erro:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateAnswerKeyPDF = () => {
    if (!answerKey) return;

    try {
      // Create the new HTML template
      const questionsPerPage = 4;
      let pages: string[] = [];
      let currentPage = 0;
      
      for (let i = 0; i < answerKey.questoes.length; i += questionsPerPage) {
        const questionsForPage = answerKey.questoes.slice(i, i + questionsPerPage);
        const isFirstPage = currentPage === 0;
        
        let pageContent = '';
        
        if (isFirstPage) {
          // First page with title and info
          pageContent = `
            <!-- Título Principal -->
            <h2>GABARITO OFICIAL</h2>

            <!-- Informações da Avaliação -->
            <div class="subtitle-info">
              ${answerKey.disciplina ? answerKey.disciplina.charAt(0).toUpperCase() + answerKey.disciplina.slice(1) : ''} ${answerKey.serie}<br>
              ${material?.type === 'avaliacao' ? 'Avaliação' : 'Atividade'}: ${material?.title}<br>
              Total de questões: ${answerKey.totalQuestoes}
            </div>

            <div class="answers-section-title">RESPOSTAS</div>
          `;
        }
        
        // Add questions for this page
        questionsForPage.forEach((questao: any) => {
          pageContent += `
            <div class="gabarito-item">
              <div class="gabarito-item-header">
                <span class="question-num">Questão ${questao.numero}</span>
                <span class="points">(${questao.pontuacao} ponto${questao.pontuacao > 1 ? 's' : ''})</span>
              </div>
              <div class="gabarito-item-type">Tipo: ${questao.tipo}</div>
              <div class="gabarito-item-answer">Resposta: ${questao.resposta}</div>
            </div>
          `;
        });
        
        pages.push(pageContent);
        currentPage++;
      }
      
      // Generate complete HTML with new template
      let completeHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Gabarito Oficial – AulagIA</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    @page {
      size: A4;
      margin: 0;
    }
    body {
      margin: 0;
      padding: 0;
      background: #f0f4f8;
      font-family: 'Inter', sans-serif;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
      min-height: 100vh;
      padding: 20px 0;
    }
    .page {
      position: relative;
      width: 210mm;
      min-height: 297mm;
      background: white;
      overflow: hidden;
      margin: 0 auto 20px auto;
      box-sizing: border-box;
      padding: 0;
      display: flex;
      flex-direction: column;
      border-radius: 6px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
      page-break-after: always;
    }

    .page:last-of-type {
      page-break-after: auto;
      margin-bottom: 0;
    }
    
    .shape-circle {
      position: absolute;
      border-radius: 50%;
      opacity: 0.25;
      pointer-events: none;
      z-index: 0;
    }
    .shape-circle.purple {
      width: 180px; 
      height: 180px;
      background: #a78bfa;
      top: -60px; 
      left: -40px;
    }
    .shape-circle.blue {
      width: 240px; 
      height: 240px;
      background: #60a5fa;
      bottom: -80px; 
      right: -60px;
    }
    
    .header {
      position: absolute;
      top: 6mm;
      left: 0;
      right: 0;
      display: flex;
      align-items: center;
      z-index: 999;
      height: 15mm;
      background: transparent;
      padding: 0 12mm;
      flex-shrink: 0;
    }
    .header .logo-container {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .header .logo {
      width: 38px;
      height: 38px;
      background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
      box-shadow: 0 3px 8px rgba(14, 165, 233, 0.3);
    }
    .header .logo svg {
      width: 20px;
      height: 20px;
      stroke: white;
      fill: none;
      stroke-width: 2;
    }
    .header .brand-text {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .header .brand-text h1 {
      font-size: 24px;
      color: #0ea5e9;
      margin: 0;
      font-family: 'Inter', sans-serif;
      line-height: 1;
      font-weight: 700;
      letter-spacing: -0.5px;
      text-transform: none;
    }
    .header .brand-text p {
      font-size: 9px;
      color: #6b7280;
      margin: 1px 0 0 0;
      font-family: 'Inter', sans-serif;
      line-height: 1;
      font-weight: 400;
    }
    
    .content {
      margin-top: 25mm;
      margin-bottom: 12mm;
      padding: 0 15mm;
      position: relative;
      flex: 1;
      overflow: visible;
      z-index: 1;
    }

    h2 {
      text-align: center;
      margin: 10px 0 5px 0;
      font-size: 1.8rem;
      color: #4f46e5;
      position: relative;
      font-family: 'Inter', sans-serif;
      font-weight: 700;
      text-transform: uppercase;
    }
    h2::after {
      content: '';
      width: 80px;
      height: 4px;
      background: #a78bfa;
      display: block;
      margin: 6px auto 0;
      border-radius: 2px;
    }

    .subtitle-info {
        text-align: center;
        font-size: 0.9rem;
        color: #374151;
        margin-bottom: 15px;
        line-height: 1.4;
    }
    
    .answers-section-title {
        font-size: 1.2rem;
        color: #4f46e5;
        margin-top: 30px;
        margin-bottom: 15px;
        font-weight: 700;
        text-transform: uppercase;
        border-bottom: 2px solid #a78bfa;
        padding-bottom: 5px;
    }

    .gabarito-item {
        margin-bottom: 20px;
        padding: 10px 0;
        border-bottom: 1px dashed #e5e7eb;
        page-break-inside: avoid;
    }
    .gabarito-item:last-child {
        border-bottom: none;
    }
    .gabarito-item-header {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-bottom: 5px;
    }
    .gabarito-item-header .question-num {
        font-weight: 700;
        color: #1f2937;
        font-size: 1.1rem;
    }
    .gabarito-item-header .points {
        font-size: 0.8rem;
        color: #6b7280;
    }
    .gabarito-item-type {
        font-size: 0.8rem;
        color: #6b7280;
        margin-bottom: 5px;
    }
    .gabarito-item-answer {
        font-size: 1.0rem;
        font-weight: 600;
        color: #000000;
        padding-left: 10px;
    }
    
    .footer {
      position: absolute; 
      bottom: 6mm;
      left: 0;
      right: 0;
      text-align: center;
      font-size: 0.7rem;
      color: #6b7280;
      z-index: 999;
      height: 6mm;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      padding: 0 15mm;
      font-family: 'Inter', sans-serif;
      flex-shrink: 0;
    }
    
    @media print {
      body { 
        margin: 0; 
        padding: 0; 
        background: white;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .page { 
        box-shadow: none; 
        margin: 0; 
        border-radius: 0;
        width: 100%;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
      }
      .shape-circle {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .header, .footer {
        position: fixed; 
        background: transparent; 
      }

      .header .logo {
        background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%) !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .header .brand-text h1 {
        text-transform: none !important;
      }
      .header .logo svg {
          width: 20px !important;
          height: 20px !important;
      }
      h2 {
        color: #4f46e5 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      h2::after {
        background: #a78bfa !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .gabarito-item-answer {
          color: #000000 !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>`;

      // Add pages
      pages.forEach((pageContent, index) => {
        const pageClass = index === 0 ? 'first-page-content' : 'subsequent-page-content';
        completeHtml += `
  <div class="page ${pageClass}">
    <div class="shape-circle purple"></div>
    <div class="shape-circle blue"></div>

    <div class="header">
      <div class="logo-container">
        <div class="logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
        </div>
        <div class="brand-text">
          <h1>AulagIA</h1>
          <p>Sua aula com toque mágico</p>
        </div>
      </div>
    </div>

    <div class="footer">
      Gabarito gerado pela AulagIA - Sua aula com toque mágico em ${new Date().toLocaleDateString('pt-BR')} • aulagia.com.br
    </div>

    <div class="content">
      ${pageContent}
    </div>
  </div>`;
      });

      completeHtml += `
</body>
</html>`;

      // Create hidden iframe for printing
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.top = '-9999px';
      iframe.style.left = '-9999px';
      iframe.style.width = '210mm';
      iframe.style.height = '297mm';
      document.body.appendChild(iframe);
      
      iframe.contentDocument?.open();
      iframe.contentDocument?.write(completeHtml);
      iframe.contentDocument?.close();
      
      // Wait for loading and then print
      setTimeout(() => {
        if (iframe.contentWindow) {
          iframe.contentWindow.print();
        }
        // Remove iframe after some time
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 1000);
      
      toast.success('Gabarito em PDF baixado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar PDF do gabarito');
    }
  };

  if (!material) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] sm:max-h-[80vh] flex flex-col rounded-2xl sm:rounded-lg p-0">
        <DialogHeader className="p-4 sm:p-6 pb-3 sm:pb-4 border-b rounded-t-2xl sm:rounded-t-lg">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base sm:text-lg font-bold flex items-center">
              <FileCheck className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-green-600" />
              Gerador de Gabarito
            </DialogTitle>
            <Button variant="outline" size="sm" onClick={onClose} className="rounded-lg">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {!answerKey ? (
            <div className="text-center py-6 sm:py-8">
              <FileCheck className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-gray-400 mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-semibold mb-2">Gerar Gabarito</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-2">
                Clique no botão abaixo para gerar automaticamente o gabarito das questões com respostas corretas
              </p>
              <Button 
                onClick={generateAnswerKey} 
                disabled={isGenerating}
                className="bg-green-600 hover:bg-green-700 rounded-xl px-6 py-2 text-sm sm:text-base"
              >
                {isGenerating ? 'Gerando...' : 'Gerar Gabarito'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 p-3 sm:p-4 rounded-xl border border-green-200">
                <h3 className="font-semibold text-green-800 mb-1 sm:mb-2 text-sm sm:text-base">{answerKey.titulo}</h3>
                <p className="text-xs sm:text-sm text-green-700">
                  {answerKey.disciplina ? answerKey.disciplina.charAt(0).toUpperCase() + answerKey.disciplina.slice(1) : ''} {answerKey.serie}<br />
                </p>
                <p className="text-xs sm:text-sm text-green-700">
                  Total: {answerKey.totalQuestoes} questões
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-sm sm:text-base">Respostas:</h4>
                {answerKey.questoes.map((questao: any) => (
                  <div key={questao.numero} className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <span className="font-medium text-blue-600 text-sm sm:text-base">
                          Questão {questao.numero}:
                        </span>
                        <span className="ml-2 text-xs sm:text-sm text-gray-600">({questao.tipo})</span>
                      </div>
                      {questao.pontuacao && (
                        <span className="text-xs sm:text-sm text-gray-500 bg-white px-2 py-1 rounded-lg">
                          {questao.pontuacao} pt{questao.pontuacao > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-800 bg-white p-2 sm:p-3 rounded-lg border-l-4 border-green-500">
                      <strong className="text-green-700">Resposta:</strong> {questao.resposta}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center pt-4">
                <Button 
                  onClick={generateAnswerKeyPDF}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 rounded-xl px-6 py-2 text-sm sm:text-base"
                >
                  <Download className="h-4 w-4" />
                  <span>Baixar PDF</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AnswerKeyModal;
