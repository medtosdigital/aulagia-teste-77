
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, BookOpen, Lightbulb, CheckCircle } from 'lucide-react';
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
    console.log('🚀 Iniciando validação do tema:', { tema, disciplina, serie });
    setIsLoading(true);
    setShouldShow(false);
    
    try {
      const result = await BNCCValidationService.validateTopic(tema, disciplina, serie);
      console.log('📊 Resultado da validação:', result);
      
      setValidation(result);
      
      // Só mostra o modal se o tema NÃO estiver alinhado com a BNCC
      if (!result.isValid) {
        console.log('⚠️ Tema não alinhado - mostrando modal');
        setShouldShow(true);
      } else {
        console.log('✅ Tema alinhado - prosseguindo sem modal');
        // Se está alinhado, continua direto sem mostrar o modal
        onAccept();
        onClose();
      }
    } catch (error) {
      console.error('❌ Erro na validação BNCC:', error);
      // Em caso de erro, permite continuar sem mostrar modal
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

  const handleAcceptAnyway = () => {
    console.log('👤 Usuário escolheu gerar mesmo assim');
    onAccept();
    onClose();
  };

  const handleCorrectTopic = () => {
    console.log('👤 Usuário escolheu corrigir o tema');
    onClose();
  };

  // Se está carregando ou não deve mostrar, não renderiza o modal
  if (isLoading || !shouldShow || !validation || validation.isValid) {
    return null;
  }

  return (
    <Dialog open={open && shouldShow} onOpenChange={onClose}>
      <DialogContent className={`${
        isMobile 
          ? 'w-[95vw] h-[90vh] max-w-none max-h-none m-2 rounded-2xl' 
          : 'max-w-2xl rounded-xl'
      } p-0 overflow-hidden flex flex-col`}>
        
        {/* Header fixo */}
        <DialogHeader className={`flex-shrink-0 p-4 pb-3 border-b bg-white ${
          isMobile ? 'rounded-t-2xl' : 'rounded-t-xl'
        }`}>
          <DialogTitle className={`flex items-center space-x-2 text-gray-800 ${
            isMobile ? 'text-base' : 'text-xl'
          }`}>
            <AlertTriangle className={`text-orange-600 ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
            <span>Validação do Tema</span>
          </DialogTitle>
        </DialogHeader>

        {/* Conteúdo scrollável */}
        <div className={`flex-1 overflow-y-auto p-4 ${isMobile ? 'pb-2' : 'p-6'}`}>
          <div className={`space-y-4 ${isMobile ? 'space-y-3' : 'space-y-6'}`}>
            
            {/* Informações Atuais */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-3">
                <BookOpen className="w-4 h-4 text-gray-600" />
                <h3 className={`font-semibold text-gray-800 ${isMobile ? 'text-sm' : 'text-base'}`}>
                  Informações Atuais
                </h3>
              </div>
              
              <div className={`space-y-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                <div className="space-y-1">
                  <span className="font-medium text-gray-600">Tema:</span>
                  <div className="font-semibold text-gray-900 break-words">
                    {tema}
                  </div>
                </div>
                
                {/* Disciplina e Turma lado a lado */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1">
                    <span className="font-medium text-gray-600">Disciplina:</span>
                    <div className="font-semibold text-gray-900">
                      {disciplina ? disciplina.charAt(0).toUpperCase() + disciplina.slice(1) : ''}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="font-medium text-gray-600">Turma:</span>
                    <div className="font-semibold text-gray-900">
                      {getGradeDisplayName(serie)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Aviso - Tema Não Recomendado */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className={`font-semibold text-red-800 mb-2 ${
                    isMobile ? 'text-sm' : 'text-base'
                  }`}>
                    Tema Não Recomendado
                  </h4>
                  <p className={`text-red-700 leading-relaxed break-words ${
                    isMobile ? 'text-xs' : 'text-sm'
                  }`}>
                    {validation.feedback}
                  </p>
                </div>
              </div>
            </div>

            {/* Sugestões */}
            {validation.suggestions.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <Lightbulb className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-semibold text-green-800 mb-3 ${
                      isMobile ? 'text-sm' : 'text-base'
                    }`}>
                      Sugestões de Temas Alternativos:
                    </h4>
                    <div className={`space-y-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      {validation.suggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-start text-green-700">
                          <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
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

        {/* Botões fixos no rodapé */}
        <div className={`flex-shrink-0 p-4 pt-2 border-t bg-white ${
          isMobile ? 'rounded-b-2xl' : 'rounded-b-xl'
        }`}>
          <div className={`flex gap-3 ${isMobile ? 'flex-col' : 'justify-end'}`}>
            <Button 
              variant="outline" 
              onClick={handleCorrectTopic}
              className={`border-gray-300 rounded-lg hover:bg-gray-50 ${
                isMobile ? 'w-full h-10 text-sm' : 'px-6'
              }`}
            >
              Corrigir Tema
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

export default BNCCValidationModal;
