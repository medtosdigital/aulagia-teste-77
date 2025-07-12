
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, BookOpen, Lightbulb, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface IndividualBNCCValidation {
  tema: string;
  isValid: boolean;
  confidence: number;
  feedback: string;
  suggestions: string[];
}

interface EnhancedBNCCValidation {
  overallValid: boolean;
  individualValidations: IndividualBNCCValidation[];
  overallFeedback: string;
  hasPartiallyValid: boolean;
  validThemes: string[];
  invalidThemes: string[];
}

interface EnhancedBNCCValidationModalProps {
  open: boolean;
  onClose: () => void;
  validationData: EnhancedBNCCValidation | null;
  disciplina: string;
  serie: string;
  onAccept: () => void;
  onFixThemes?: (invalidThemes: string[]) => void;
}

const EnhancedBNCCValidationModal: React.FC<EnhancedBNCCValidationModalProps> = ({
  open,
  onClose,
  validationData,
  disciplina,
  serie,
  onAccept,
  onFixThemes
}) => {
  const isMobile = useIsMobile();

  const getGradeDisplayName = (serie: string) => {
    const parts = serie.split('-');
    return parts.length > 1 ? `${parts[1]} (${parts[0]})` : serie;
  };

  const handleAcceptAnyway = () => {
    console.log('👤 Usuário escolheu gerar mesmo assim');
    onAccept();
  };

  const handleFixThemes = () => {
    console.log('👤 Usuário escolheu corrigir os temas');
    if (onFixThemes && validationData) {
      onFixThemes(validationData.invalidThemes);
    }
    onClose();
  };

  // Se não estiver aberto ou não tiver dados de validação, não renderizar
  if (!open || !validationData) {
    return null;
  }

  // Se todos os temas estiverem válidos, não mostrar o modal
  if (validationData.overallValid) {
    return null;
  }

  const getValidationIcon = (validation: IndividualBNCCValidation) => {
    if (validation.isValid) {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
    return <XCircle className="w-4 h-4 text-red-600" />;
  };

  const getValidationBgColor = (validation: IndividualBNCCValidation) => {
    return validation.isValid 
      ? 'bg-green-50 border-green-200' 
      : 'bg-red-50 border-red-200';
  };

  const getValidationTextColor = (validation: IndividualBNCCValidation) => {
    return validation.isValid 
      ? 'text-green-800' 
      : 'text-red-800';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={`${
        isMobile 
          ? 'w-[95vw] h-[90vh] max-w-none max-h-none m-2 rounded-2xl' 
          : 'max-w-4xl max-h-[90vh] rounded-xl'
      } p-0 overflow-hidden flex flex-col`}>
        
        {/* Header fixo */}
        <DialogHeader className={`flex-shrink-0 p-4 pb-3 border-b bg-white ${
          isMobile ? 'rounded-t-2xl' : 'rounded-t-xl'
        }`}>
          <DialogTitle className={`flex items-center space-x-2 text-gray-800 ${
            isMobile ? 'text-base' : 'text-xl'
          }`}>
            {validationData.hasPartiallyValid ? (
              <AlertCircle className={`text-orange-600 ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
            ) : (
              <AlertTriangle className={`text-red-600 ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
            )}
            <span>Validação dos Conteúdos</span>
          </DialogTitle>
        </DialogHeader>

        {/* Conteúdo scrollável */}
        <div className={`flex-1 overflow-y-auto p-4 ${isMobile ? 'pb-2' : 'p-6'}`}>
          <div className={`space-y-4 ${isMobile ? 'space-y-3' : 'space-y-6'}`}>
            
            {/* Informações da Disciplina e Turma */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-3">
                <BookOpen className="w-4 h-4 text-gray-600" />
                <h3 className={`font-semibold text-gray-800 ${isMobile ? 'text-sm' : 'text-base'}`}>
                  Contexto da Avaliação
                </h3>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className={`font-medium text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>Disciplina:</span>
                  <div className={`font-semibold text-gray-900 ${isMobile ? 'text-sm' : 'text-base'}`}>
                    {disciplina ? disciplina.charAt(0).toUpperCase() + disciplina.slice(1) : ''}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className={`font-medium text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>Turma:</span>
                  <div className={`font-semibold text-gray-900 ${isMobile ? 'text-sm' : 'text-base'}`}>
                    {getGradeDisplayName(serie)}
                  </div>
                </div>
              </div>
            </div>

            {/* Resultado Geral */}
            <div className={`rounded-xl p-4 border ${
              validationData.hasPartiallyValid 
                ? 'bg-orange-50 border-orange-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start space-x-3">
                {validationData.hasPartiallyValid ? (
                  <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className={`font-semibold mb-2 ${
                    validationData.hasPartiallyValid 
                      ? 'text-orange-800' 
                      : 'text-red-800'
                  } ${isMobile ? 'text-sm' : 'text-base'}`}>
                    {validationData.hasPartiallyValid ? 'Validação Parcial' : 'Conteúdos Não Recomendados'}
                  </h4>
                  <p className={`leading-relaxed break-words ${
                    validationData.hasPartiallyValid 
                      ? 'text-orange-700' 
                      : 'text-red-700'
                  } ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    {validationData.overallFeedback}
                  </p>
                </div>
              </div>
            </div>

            {/* Validação Individual de Cada Tema */}
            <div className="space-y-3">
              <h4 className={`font-semibold text-gray-800 ${isMobile ? 'text-sm' : 'text-base'}`}>
                Análise Individual dos Conteúdos:
              </h4>
              
              <div className="space-y-3">
                {validationData.individualValidations.map((validation, index) => (
                  <div 
                    key={index}
                    className={`rounded-xl p-4 border ${getValidationBgColor(validation)}`}
                  >
                    <div className="flex items-start space-x-3">
                      {getValidationIcon(validation)}
                      <div className="flex-1 min-w-0">
                        <div className={`font-semibold mb-2 ${getValidationTextColor(validation)} ${
                          isMobile ? 'text-sm' : 'text-base'
                        }`}>
                          {validation.tema}
                        </div>
                        <p className={`leading-relaxed break-words ${getValidationTextColor(validation)} ${
                          isMobile ? 'text-xs' : 'text-sm'
                        }`}>
                          {validation.feedback}
                        </p>
                        
                        {/* Sugestões para temas inválidos */}
                        {!validation.isValid && validation.suggestions.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-red-200">
                            <div className="flex items-start space-x-2">
                              <Lightbulb className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <h5 className={`font-medium text-red-800 mb-2 ${
                                  isMobile ? 'text-xs' : 'text-sm'
                                }`}>
                                  Sugestões alternativas:
                                </h5>
                                <div className={`space-y-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                                  {validation.suggestions.map((suggestion, suggIndex) => (
                                    <div key={suggIndex} className="flex items-start text-red-700">
                                      <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                                      <span className="break-words leading-relaxed">{suggestion}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Botões fixos no rodapé */}
        <div className={`flex-shrink-0 p-4 pt-2 border-t bg-white ${
          isMobile ? 'rounded-b-2xl' : 'rounded-b-xl'
        }`}>
          <div className={`flex gap-3 ${isMobile ? 'flex-col' : 'justify-end'}`}>
            <Button 
              variant="outline" 
              onClick={handleFixThemes}
              className={`border-gray-300 rounded-lg hover:bg-gray-50 ${
                isMobile ? 'w-full h-10 text-sm' : 'px-6'
              }`}
            >
              Corrigir Conteúdos
            </Button>
            <Button 
              onClick={handleAcceptAnyway}
              className={`bg-blue-600 hover:bg-blue-700 text-white rounded-lg ${
                isMobile ? 'w-full h-10 text-sm' : 'px-6'
              }`}
            >
              Gerar Mesmo Assim
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedBNCCValidationModal;
