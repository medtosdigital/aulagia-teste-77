
import React, { useState } from 'react';
import { X, FileCheck, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GeneratedMaterial } from '@/services/materialService';
import { toast } from 'sonner';

interface AnswerKeyModalProps {
  material: GeneratedMaterial | null;
  open: boolean;
  onClose: () => void;
}

const AnswerKeyModal: React.FC<AnswerKeyModalProps> = ({ material, open, onClose }) => {
  const [answerKey, setAnswerKey] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateAnswerKey = async () => {
    if (!material || (material.type !== 'atividade' && material.type !== 'avaliacao')) {
      toast.error('Este material não possui questões para gerar gabarito');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simula geração do gabarito
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const questoes = material.content.questoes;
      const gabarito = questoes.map((questao: any, index: number) => {
        let resposta = '';
        
        switch (questao.tipo) {
          case 'multipla_escolha':
            // Simula resposta correta aleatória para múltipla escolha
            const opcoes = ['A', 'B', 'C', 'D'];
            resposta = opcoes[Math.floor(Math.random() * opcoes.length)];
            break;
          case 'verdadeiro_falso':
            resposta = Math.random() > 0.5 ? 'Verdadeiro' : 'Falso';
            break;
          case 'dissertativa':
          case 'aberta':
            resposta = 'Resposta dissertativa esperada conforme conteúdo estudado';
            break;
          case 'ligar':
            resposta = 'Correspondência: 1-A, 2-B, 3-C, 4-D';
            break;
          case 'completar':
            resposta = 'Palavras para completar as lacunas';
            break;
          case 'desenho':
            resposta = 'Representação visual adequada ao tema';
            break;
          default:
            resposta = 'Resposta de acordo com o conteúdo';
        }
        
        return {
          numero: questao.numero,
          tipo: questao.tipo,
          resposta: resposta,
          pontuacao: questao.pontuacao || 1
        };
      });

      setAnswerKey({
        titulo: `Gabarito - ${material.title}`,
        disciplina: material.subject,
        serie: material.grade,
        totalQuestoes: questoes.length,
        questoes: gabarito
      });
      
      toast.success('Gabarito gerado com sucesso!');
    } catch (error) {
      toast.error('Erro ao gerar gabarito');
      console.error('Erro:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadAnswerKey = () => {
    if (!answerKey) return;

    const content = `
      ${answerKey.titulo}
      ${answerKey.disciplina} - ${answerKey.serie}
      Total de questões: ${answerKey.totalQuestoes}
      
      ${answerKey.questoes.map((q: any) => 
        `Questão ${q.numero}: ${q.resposta} ${q.pontuacao ? `(${q.pontuacao} ponto${q.pontuacao > 1 ? 's' : ''})` : ''}`
      ).join('\n')}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gabarito-${material?.title?.toLowerCase().replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Gabarito baixado com sucesso!');
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
                Clique no botão abaixo para gerar automaticamente o gabarito das questões
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
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <span className="font-medium text-blue-600">
                          Questão {questao.numero}:
                        </span>
                        <span className="ml-2">{questao.resposta}</span>
                      </div>
                      {questao.pontuacao && (
                        <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded">
                          {questao.pontuacao} pt{questao.pontuacao > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center pt-4">
                <Button 
                  onClick={downloadAnswerKey}
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Baixar Gabarito</span>
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
