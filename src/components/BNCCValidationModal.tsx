
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, BookOpen, Lightbulb } from 'lucide-react';
import { BNCCValidationService } from '@/services/bnccValidationService';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const [shouldShow, setShouldShow] = useState(false);
  const isMobile = useIsMobile();

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
      
      // Só mostra o modal se o tema NÃO estiver alinhado com a BNCC
      if (!result.isValid) {
        setShouldShow(true);
      } else {
        // Se está alinhado, continua direto sem mostrar o modal
        onAccept();
        onClose();
      }
    } catch (error) {
      console.error('Erro na validação BNCC:', error);
      // Em caso de erro, permite continuar
      onAccept();
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const getGradeDisplayName = (serie: string) => {
    const parts = serie.split('-');
    return parts.length > 1 ? `${parts[1]} (${parts[0]})` : serie;
  };

  // Se está carregando ou não deve mostrar, não renderiza o modal
  if (isLoading || !shouldShow || !validation || validation.isValid) {
    return null;
  }

  return (
    <Dialog open={open && shouldShow} onOpenChange={onClose}>
      <DialogContent className={`${
        isMobile 
          ? 'max-w-[95vw] max-h-[85vh] mx-2 rounded-2xl' 
          : 'max-w-2xl rounded-xl'
      } p-0 overflow-hidden`}>
        <div className={`${isMobile ? 'p-4' : 'p-6'} h-full overflow-y-auto`}>
          <DialogHeader className={`mb-4 ${isMobile ? 'mb-3' : 'mb-6'}`}>
            <DialogTitle className={`flex items-center space-x-3 text-orange-600 ${
              isMobile ? 'text-lg' : 'text-xl'
            }`}>
              <AlertTriangle className={`w-6 h-6 ${isMobile ? 'w-5 h-5' : ''}`} />
              <span>Validação do Tema</span>
            </DialogTitle>
          </DialogHeader>

          <div className={`space-y-4 ${isMobile ? 'space-y-3' : 'space-y-6'}`}>
            {/* Informações Atuais */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-3">
                <BookOpen className={`w-5 h-5 text-gray-600 ${isMobile ? 'w-4 h-4' : ''}`} />
                <h3 className={`font-semibold text-gray-800 ${isMobile ? 'text-sm' : ''}`}>
                  Informações Atuais
                </h3>
              </div>
              
              <div className={`space-y-2 ${isMobile ? 'text-sm' : ''}`}>
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="font-medium text-gray-600 min-w-fit">Tema:</span>
                  <span className={`font-semibold text-gray-900 ${isMobile ? 'mt-1' : 'ml-2'}`}>
                    {tema}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="font-medium text-gray-600 min-w-fit">Disciplina:</span>
                  <span className={`font-semibold text-gray-900 ${isMobile ? 'mt-1' : 'ml-2'}`}>
                    {disciplina}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="font-medium text-gray-600 min-w-fit">Turma:</span>
                  <span className={`font-semibold text-gray-900 ${isMobile ? 'mt-1' : 'ml-2'}`}>
                    {getGradeDisplayName(serie)}
                  </span>
                </div>
              </div>
            </div>

            {/* Aviso - Tema Não Recomendado */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className={`w-5 h-5 text-red-600 mt-0.5 flex-shrink-0 ${
                  isMobile ? 'w-4 h-4' : ''
                }`} />
                <div className="flex-1">
                  <h4 className={`font-semibold text-red-800 mb-2 ${
                    isMobile ? 'text-sm' : ''
                  }`}>
                    Tema Não Recomendado
                  </h4>
                  <p className={`text-red-700 leading-relaxed ${
                    isMobile ? 'text-sm' : ''
                  }`}>
                    {validation.feedback}
                  </p>
                </div>
              </div>
            </div>

            {/* Sugestões */}
            {validation.suggestions.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <Lightbulb className={`w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0 ${
                    isMobile ? 'w-4 h-4' : ''
                  }`} />
                  <div className="flex-1">
                    <h4 className={`font-semibold text-orange-800 mb-3 ${
                      isMobile ? 'text-sm mb-2' : ''
                    }`}>
                      Sugestões de Temas Alternativos:
                    </h4>
                    <ul className={`space-y-2 ${isMobile ? 'text-sm space-y-1' : ''}`}>
                      {validation.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start text-orange-700">
                          <span className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Botões */}
            <div className={`flex gap-3 pt-4 border-t ${
              isMobile ? 'flex-col pt-3' : 'justify-end'
            }`}>
              <Button 
                variant="outline" 
                onClick={onClose}
                className={`border-gray-300 rounded-lg ${isMobile ? 'w-full order-2' : ''}`}
              >
                Corrigir Tema
              </Button>
              <Button 
                onClick={() => {
                  onAccept();
                  onClose();
                }}
                className={`bg-orange-500 hover:bg-orange-600 text-white rounded-lg ${
                  isMobile ? 'w-full order-1' : ''
                }`}
              >
                Gerar Mesmo Assim
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BNCCValidationModal;
