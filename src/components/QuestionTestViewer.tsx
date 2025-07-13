
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Question {
  numero: number;
  tipo: string;
  enunciado: string;
  opcoes?: string[];
  coluna_a?: string[];
  coluna_b?: string[];
  resposta_correta: string;
  explicacao?: string;
}

interface QuestionTestViewerProps {
  questions: Question[];
  materialType: 'atividade' | 'avaliacao';
}

const QuestionTestViewer: React.FC<QuestionTestViewerProps> = ({ questions, materialType }) => {
  const renderQuestion = (question: Question) => {
    switch (question.tipo) {
      case 'multipla_escolha':
        return (
          <div className="space-y-2">
            <p className="font-medium text-gray-900">{question.enunciado}</p>
            <div className="pl-4 space-y-1">
              {question.opcoes?.map((opcao, index) => (
                <div key={index} className="text-sm text-gray-700">
                  {opcao}
                </div>
              ))}
            </div>
            <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
              <strong>Resposta:</strong> {question.resposta_correta}
            </div>
          </div>
        );

      case 'ligar':
        return (
          <div className="space-y-2">
            <p className="font-medium text-gray-900">{question.enunciado}</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Coluna A:</h4>
                <div className="space-y-1">
                  {question.coluna_a?.map((item, index) => (
                    <div key={index} className="text-gray-700">{index + 1}. {item}</div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Coluna B:</h4>
                <div className="space-y-1">
                  {question.coluna_b?.map((item, index) => (
                    <div key={index} className="text-gray-700">{String.fromCharCode(97 + index)}. {item}</div>
                  ))}
                </div>
              </div>
            </div>
            <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
              <strong>Resposta:</strong> {question.resposta_correta}
            </div>
          </div>
        );

      case 'verdadeiro_falso':
        return (
          <div className="space-y-2">
            <p className="font-medium text-gray-900">{question.enunciado}</p>
            <div className="flex space-x-4 text-sm">
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded">( ) Verdadeiro</span>
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded">( ) Falso</span>
            </div>
            <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
              <strong>Resposta:</strong> {question.resposta_correta}
            </div>
          </div>
        );

      case 'completar':
        return (
          <div className="space-y-2">
            <p className="font-medium text-gray-900">{question.enunciado}</p>
            <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
              <strong>Resposta:</strong> {question.resposta_correta}
            </div>
          </div>
        );

      case 'dissertativa':
        return (
          <div className="space-y-2">
            <p className="font-medium text-gray-900">{question.enunciado}</p>
            <div className="border-2 border-dashed border-gray-300 p-4 rounded">
              <p className="text-sm text-gray-500">Espaço para resposta dissertativa</p>
            </div>
            {question.resposta_correta && (
              <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                <strong>Resposta esperada:</strong> {question.resposta_correta}
              </div>
            )}
          </div>
        );

      case 'desenho':
        return (
          <div className="space-y-2">
            <p className="font-medium text-gray-900">{question.enunciado}</p>
            <div className="border-2 border-dashed border-gray-300 p-8 rounded text-center">
              <p className="text-sm text-gray-500">Espaço para desenho</p>
            </div>
            {question.resposta_correta && (
              <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                <strong>Orientações:</strong> {question.resposta_correta}
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="space-y-2">
            <p className="font-medium text-gray-900">{question.enunciado}</p>
            <Badge variant="destructive" className="text-xs">
              Tipo de questão não reconhecido: {question.tipo}
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

  const typeDistribution = questions.reduce((acc, q) => {
    acc[q.tipo] = (acc[q.tipo] || 0) + 1;
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
              <div className="text-2xl font-bold text-blue-600">{questions.length}</div>
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
        {questions.map((question, index) => (
          <Card key={index} className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Questão {question.numero}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  {getQuestionTypeIcon(question.tipo)}
                  <Badge className={`text-xs ${getTypeColor(question.tipo)}`}>
                    {question.tipo.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {renderQuestion(question)}
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
