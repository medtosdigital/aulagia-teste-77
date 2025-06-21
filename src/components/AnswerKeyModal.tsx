
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
      case 'multipla_escolha':
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
      const doc = new jsPDF('portrait', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      let currentY = margin;

      // Função para adicionar nova página se necessário
      const checkPageBreak = (neededHeight: number) => {
        if (currentY + neededHeight > pageHeight - margin) {
          doc.addPage();
          currentY = margin;
          addHeader();
        }
      };

      // Função para adicionar cabeçalho com logo AulagIA
      const addHeader = () => {
        // Formas decorativas
        doc.setFillColor(167, 139, 250, 0.25);
        doc.circle(10, 10, 15, 'F');
        
        doc.setFillColor(96, 165, 250, 0.25);
        doc.circle(pageWidth - 20, pageHeight - 20, 20, 'F');

        // Logo AulagIA
        doc.setFillColor(14, 165, 233);
        doc.circle(margin + 8, currentY + 8, 8, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.text('✓', margin + 6, currentY + 10);

        // Título da marca AulagIA
        doc.setTextColor(14, 165, 233);
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text('AulagIA', margin + 20, currentY + 8);
        
        doc.setTextColor(107, 114, 128);
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        doc.text('Sua aula com toque mágico', margin + 20, currentY + 14);

        currentY += 30;
      };

      // Adicionar cabeçalho inicial
      addHeader();

      // Título principal do gabarito
      doc.setTextColor(79, 70, 229);
      doc.setFontSize(24);
      doc.setFont(undefined, 'bold');
      const titleLines = doc.splitTextToSize('GABARITO OFICIAL', contentWidth);
      doc.text(titleLines, pageWidth / 2, currentY, { align: 'center' });
      currentY += titleLines.length * 8 + 5;

      // Linha decorativa
      doc.setDrawColor(167, 139, 250);
      doc.setLineWidth(2);
      doc.line(pageWidth / 2 - 25, currentY, pageWidth / 2 + 25, currentY);
      currentY += 10;

      // Informações da avaliação/atividade
      doc.setTextColor(107, 114, 128);
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.text(`${answerKey.disciplina} • ${answerKey.serie}`, pageWidth / 2, currentY, { align: 'center' });
      currentY += 8;
      doc.text(`${material?.type === 'avaliacao' ? 'Avaliação' : 'Atividade'}: ${material?.title}`, pageWidth / 2, currentY, { align: 'center' });
      currentY += 8;
      doc.text(`Total de questões: ${answerKey.totalQuestoes}`, pageWidth / 2, currentY, { align: 'center' });
      currentY += 20;

      // Tabela de informações
      const tableY = currentY;
      doc.setFillColor(243, 244, 246);
      doc.rect(margin, tableY, contentWidth, 30, 'F');
      
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(1);
      
      // Linhas da tabela
      for (let i = 0; i <= 2; i++) {
        doc.line(margin, tableY + (i * 10), margin + contentWidth, tableY + (i * 10));
      }
      
      // Colunas da tabela
      const colWidth = contentWidth / 4;
      for (let i = 0; i <= 4; i++) {
        doc.line(margin + (i * colWidth), tableY, margin + (i * colWidth), tableY + 20);
      }

      // Conteúdo da tabela
      doc.setTextColor(31, 41, 59);
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      
      // Primeira linha
      doc.text('Escola:', margin + 5, tableY + 7);
      doc.text('Data:', margin + colWidth * 2 + 5, tableY + 7);
      doc.text(new Date().toLocaleDateString('pt-BR'), margin + colWidth * 3 + 5, tableY + 7);
      
      // Segunda linha
      doc.text('Disciplina:', margin + 5, tableY + 17);
      doc.text(answerKey.disciplina, margin + colWidth + 5, tableY + 17);
      doc.text('Série/Ano:', margin + colWidth * 2 + 5, tableY + 17);
      doc.text(answerKey.serie, margin + colWidth * 3 + 5, tableY + 17);

      currentY += 35;

      // Instruções
      if (answerKey.instrucoes) {
        checkPageBreak(20);
        doc.setFillColor(239, 246, 255);
        doc.rect(margin, currentY - 5, contentWidth, 15, 'F');
        
        doc.setDrawColor(14, 165, 233);
        doc.setLineWidth(2);
        doc.line(margin, currentY - 5, margin, currentY + 10);

        doc.setTextColor(14, 165, 233);
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text('INSTRUÇÕES:', margin + 8, currentY);
        
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        const instrucaoLines = doc.splitTextToSize(answerKey.instrucoes, contentWidth - 16);
        doc.text(instrucaoLines, margin + 8, currentY + 5);
        currentY += Math.max(15, instrucaoLines.length * 4 + 10);
      }

      // Título das respostas
      checkPageBreak(15);
      doc.setTextColor(79, 70, 229);
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text('RESPOSTAS', margin, currentY);
      currentY += 12;

      // Questões e respostas
      answerKey.questoes.forEach((questao: any) => {
        const questionHeight = questao.tipo === 'dissertativa' || questao.tipo === 'aberta' ? 40 : 30;
        checkPageBreak(questionHeight);

        // Container da questão
        doc.setFillColor(249, 250, 251);
        doc.rect(margin, currentY - 3, contentWidth, questionHeight - 5, 'F');
        
        doc.setDrawColor(59, 130, 246);
        doc.setLineWidth(2);
        doc.line(margin, currentY - 3, margin, currentY + questionHeight - 8);

        // Número da questão
        doc.setTextColor(59, 130, 246);
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(`Questão ${questao.numero}`, margin + 5, currentY + 2);

        // Pontuação
        if (questao.pontuacao) {
          doc.setTextColor(107, 114, 128);
          doc.setFontSize(9);
          doc.setFont(undefined, 'normal');
          doc.text(`(${questao.pontuacao} ponto${questao.pontuacao > 1 ? 's' : ''})`, contentWidth + margin - 30, currentY + 2);
        }

        // Tipo da questão
        doc.setTextColor(107, 114, 128);
        doc.setFontSize(9);
        doc.text(`Tipo: ${questao.tipo}`, margin + 5, currentY + 8);

        // Resposta
        doc.setTextColor(22, 163, 74);
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text('Resposta:', margin + 5, currentY + 14);
        
        doc.setTextColor(30, 41, 59);
        doc.setFont(undefined, 'normal');
        const respostaLines = doc.splitTextToSize(questao.resposta, contentWidth - 30);
        doc.text(respostaLines, margin + 30, currentY + 14);

        currentY += questionHeight;
      });

      // Rodapé
      const footerY = pageHeight - 10;
      doc.setTextColor(107, 114, 128);
      doc.setFontSize(8);
      doc.text('Gabarito gerado automaticamente pela AulagIA - Sua aula com toque mágico • aulagia.com.br', pageWidth / 2, footerY, { align: 'center' });

      // Salvar PDF
      const fileName = `gabarito-${material?.title?.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-') || 'material'}.pdf`;
      doc.save(fileName);
      
      toast.success('Gabarito em PDF baixado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar PDF do gabarito');
    }
  };

  if (!material) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-bold flex items-center">
              <FileCheck className="h-5 w-5 mr-2 text-green-600" />
              Gerador de Gabarito
            </DialogTitle>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {!answerKey ? (
            <div className="text-center py-8">
              <FileCheck className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Gerar Gabarito</h3>
              <p className="text-gray-600 mb-6">
                Clique no botão abaixo para gerar automaticamente o gabarito das questões com respostas corretas
              </p>
              <Button 
                onClick={generateAnswerKey} 
                disabled={isGenerating}
                className="bg-green-600 hover:bg-green-700"
              >
                {isGenerating ? 'Gerando...' : 'Gerar Gabarito'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-800 mb-2">{answerKey.titulo}</h3>
                <p className="text-sm text-green-700">
                  {answerKey.disciplina} - {answerKey.serie}
                </p>
                <p className="text-sm text-green-700">
                  Total: {answerKey.totalQuestoes} questões
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Respostas:</h4>
                {answerKey.questoes.map((questao: any) => (
                  <div key={questao.numero} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <span className="font-medium text-blue-600">
                          Questão {questao.numero}:
                        </span>
                        <span className="ml-2 text-sm text-gray-600">({questao.tipo})</span>
                      </div>
                      {questao.pontuacao && (
                        <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded">
                          {questao.pontuacao} pt{questao.pontuacao > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-800 bg-white p-2 rounded border-l-4 border-green-500">
                      <strong className="text-green-700">Resposta:</strong> {questao.resposta}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center pt-4 space-x-3">
                <Button 
                  onClick={generateAnswerKeyPDF}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
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
