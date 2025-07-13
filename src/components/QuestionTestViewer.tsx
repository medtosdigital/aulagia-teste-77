import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Question {
  numero: number;
  tipo: string;
  enunciado: string;
  pergunta?: string;
  opcoes?: string[];
  coluna_a?: string[];
  coluna_b?: string[];
  resposta_correta: string;
  explicacao?: string;
  textoComLacunas?: string;
  linhasResposta?: number;
}

interface QuestionTestViewerProps {
  questions: Question[];
  materialType: 'atividade' | 'avaliacao';
}

const QuestionTestViewer: React.FC<QuestionTestViewerProps> = ({ questions, materialType }) => {
  // Função para normalizar questão garantindo campos obrigatórios
  const normalizeQuestion = (question: Question, index: number): Question => {
    return {
      numero: question.numero || (index + 1),
      tipo: question.tipo || 'multipla_escolha',
      enunciado: question.enunciado || question.pergunta || `Questão ${index + 1}`,
      pergunta: question.pergunta || question.enunciado || `Questão ${index + 1}`,
      opcoes: question.opcoes || [],
      coluna_a: question.coluna_a || [],
      coluna_b: question.coluna_b || [],
      resposta_correta: question.resposta_correta || '',
      explicacao: question.explicacao || '',
      textoComLacunas: question.textoComLacunas || '',
      linhasResposta: question.linhasResposta || 5
    };
  };

  const renderQuestion = (question: Question, index: number) => {
    const normalizedQuestion = normalizeQuestion(question, index);
    const { enunciado, tipo, opcoes, coluna_a, coluna_b, resposta_correta, textoComLacunas, linhasResposta } = normalizedQuestion;

    // Garantir que temos um enunciado válido
    if (!enunciado || enunciado.trim() === '') {
      return (
        <div className="space-y-2">
          <div className="text-red-600 bg-red-50 p-3 rounded border border-red-200">
            <strong>Erro:</strong> Questão sem enunciado válido
          </div>
        </div>
      );
    }

    switch (tipo) {
      case 'multipla_escolha':
        return (
          <div className="space-y-2">
            <p className="font-medium text-gray-900">{enunciado}</p>
            <div className="pl-4 space-y-1">
              {opcoes && opcoes.length > 0 ? (
                opcoes.map((opcao, idx) => (
                  <div key={idx} className="text-sm text-gray-700">
                    {String.fromCharCode(97 + idx).toUpperCase()}) {opcao}
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500 italic">Alternativas não disponíveis</div>
              )}
            </div>
            {resposta_correta && (
              <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                <strong>Resposta:</strong> {resposta_correta}
              </div>
            )}
          </div>
        );

      case 'ligar':
        return (
          <div className="space-y-2">
            <p className="font-medium text-gray-900">{enunciado}</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Coluna A:</h4>
                <div className="space-y-1">
                  {coluna_a && coluna_a.length > 0 ? (
                    coluna_a.map((item, idx) => (
                      <div key={idx} className="text-gray-700">{idx + 1}. {item}</div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 italic">Itens da coluna A não disponíveis</div>
                  )}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Coluna B:</h4>
                <div className="space-y-1">
                  {coluna_b && coluna_b.length > 0 ? (
                    coluna_b.map((item, idx) => (
                      <div key={idx} className="text-gray-700">{String.fromCharCode(97 + idx)}. {item}</div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 italic">Itens da coluna B não disponíveis</div>
                  )}
                </div>
              </div>
            </div>
            {resposta_correta && (
              <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                <strong>Resposta:</strong> {resposta_correta}
              </div>
            )}
          </div>
        );

      case 'verdadeiro_falso':
        return (
          <div className="space-y-2">
            <p className="font-medium text-gray-900">{enunciado}</p>
            <div className="flex space-x-4 text-sm">
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded">( ) Verdadeiro</span>
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded">( ) Falso</span>
            </div>
            {resposta_correta && (
              <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                <strong>Resposta:</strong> {resposta_correta}
              </div>
            )}
          </div>
        );

      case 'completar':
        return (
          <div className="space-y-2">
            <p className="font-medium text-gray-900">
              {textoComLacunas || enunciado}
            </p>
            {resposta_correta && (
              <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                <strong>Resposta:</strong> {resposta_correta}
              </div>
            )}
          </div>
        );

      case 'dissertativa':
        return (
          <div className="space-y-2">
            <p className="font-medium text-gray-900">{enunciado}</p>
            <div className="border-2 border-dashed border-gray-300 p-4 rounded">
              <div className="space-y-2">
                {Array.from({ length: linhasResposta }, (_, idx) => (
                  <div key={idx} className="border-b border-gray-300 h-6"></div>
                ))}
              </div>
            </div>
            {resposta_correta && (
              <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                <strong>Resposta esperada:</strong> {resposta_correta}
              </div>
            )}
          </div>
        );

      case 'desenho':
        return (
          <div className="space-y-2">
            <p className="font-medium text-gray-900">{enunciado}</p>
            <div className="border-2 border-dashed border-gray-300 p-8 rounded text-center">
              <p className="text-sm text-gray-500">Espaço para desenho</p>
            </div>
            {resposta_correta && (
              <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                <strong>Orientações:</strong> {resposta_correta}
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="space-y-2">
            <p className="font-medium text-gray-900">{enunciado}</p>
            <Badge variant="destructive" className="text-xs">
              Tipo de questão não reconhecido: {tipo}
            </Badge>
          </div>
        );
    }
  };

  const getQuestionTypeIcon = (tipo: string) => {
    const validTypes = ['multipla_escolha', 'verdadeiro_falso', 'completar', 'ligar', 'dissertativa', 'desenho'];
    return validTypes.includes(tipo) ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    );
  };

  const getTypeColor = (tipo: string) => {
    const colors: Record<string, string> = {
      'multipla_escolha': 'bg-blue-100 text-blue-800',
      'verdadeiro_falso': 'bg-green-100 text-green-800',
      'completar': 'bg-yellow-100 text-yellow-800',
      'ligar': 'bg-purple-100 text-purple-800',
      'dissertativa': 'bg-orange-100 text-orange-800',
      'desenho': 'bg-pink-100 text-pink-800'
    };
    return colors[tipo] || 'bg-gray-100 text-gray-800';
  };

  // Validar e normalizar questões antes de processar
  const validQuestions = Array.isArray(questions) ? questions.filter(q => q && (q.enunciado || q.pergunta)) : [];
  
  if (validQuestions.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">
              <AlertCircle className="w-8 h-8 mx-auto mb-2" />
              <p>Nenhuma questão válida encontrada para exibir.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const typeDistribution = validQuestions.reduce((acc, q) => {
    const tipo = q.tipo || 'indefinido';
    acc[tipo] = (acc[tipo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" />
            <span>Resumo das Questões - {materialType === 'atividade' ? 'Atividade' : 'Avaliação'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{validQuestions.length}</div>
              <div className="text-sm text-gray-600">Total de Questões</div>
            </div>
            {Object.entries(typeDistribution).map(([tipo, count]) => (
              <div key={tipo} className="text-center">
                <div className="text-xl font-semibold">{count}</div>
                <Badge className={`text-xs ${getTypeColor(tipo)}`}>
                  {tipo.replace('_', ' ')}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <div className="space-y-4">
        {validQuestions.map((question, index) => (
          <Card key={index} className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Questão {question.numero || (index + 1)}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  {getQuestionTypeIcon(question.tipo)}
                  <Badge className={`text-xs ${getTypeColor(question.tipo)}`}>
                    {(question.tipo || 'indefinido').replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {renderQuestion(question, index)}
              {question.explicacao && (
                <div className="mt-3 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  <strong>Explicação:</strong> {question.explicacao}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default QuestionTestViewer;
