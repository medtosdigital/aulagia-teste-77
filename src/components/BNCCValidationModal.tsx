
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, BookOpen, Target, Lightbulb } from 'lucide-react';
import { BNCCValidationService } from '@/services/bnccValidationService';

interface BNCCValidationModalProps {
  open: boolean;
  onClose: () => void;
  tema: string;
  disciplina: string;
  serie: string;
  onAccept: () => void;
}

interface ValidationResult {
  isValid: boolean;
  confidence: number;
  suggestions: string[];
  feedback: string;
}

const BNCCValidationModal: React.FC<BNCCValidationModalProps> = ({
  open,
  onClose,
  tema,
  disciplina,
  serie,
  onAccept
}) => {
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && tema && disciplina && serie) {
      validateTopic();
    }
  }, [open, tema, disciplina, serie]);

  const validateTopic = async () => {
    setIsLoading(true);
    try {
      const result = await BNCCValidationService.validateTopic(tema, disciplina, serie);
      setValidation(result);
    } catch (error) {
      console.error('Erro na validação BNCC:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getGradeDisplayName = (serie: string) => {
    const parts = serie.split('-');
    return parts.length > 1 ? `${parts[1]} (${parts[0]})` : serie;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span>Validação BNCC</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do tema */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Tema</label>
                <p className="font-semibold text-gray-900">{tema}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Disciplina</label>
                <p className="font-semibold text-gray-900">{disciplina}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Série/Ano</label>
                <p className="font-semibold text-gray-900">{getGradeDisplayName(serie)}</p>
              </div>
            </div>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="text-center py-8">
              <div className="inline-flex items-center space-x-3">
                <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                <span className="text-gray-600">Validando com a BNCC...</span>
              </div>
            </div>
          )}

          {/* Resultado da validação */}
          {validation && !isLoading && (
            <div className="space-y-4">
              {/* Status */}
              <div className={`flex items-center space-x-3 p-4 rounded-lg ${
                validation.isValid ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
              }`}>
                {validation.isValid ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                )}
                <div className="flex-1">
                  <p className={`font-medium ${validation.isValid ? 'text-green-800' : 'text-yellow-800'}`}>
                    {validation.feedback}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-sm text-gray-600">Confiança:</span>
                    <Badge variant={validation.confidence >= 0.7 ? 'default' : validation.confidence >= 0.5 ? 'secondary' : 'destructive'}>
                      {Math.round(validation.confidence * 100)}%
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Sugestões */}
              {validation.suggestions.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800 mb-2">Sugestões de Melhoria</h4>
                      <ul className="space-y-1 text-sm text-blue-700">
                        {validation.suggestions.map((suggestion, index) => (
                          <li key={index} className="flex items-start">
                            <Target className="w-3 h-3 mt-1 mr-2 flex-shrink-0" />
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Botões */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Revisar Tema
            </Button>
            <Button 
              onClick={() => {
                onAccept();
                onClose();
              }}
              disabled={validation && !validation.isValid}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              Continuar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BNCCValidationModal;
