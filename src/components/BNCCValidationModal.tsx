
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, BookOpen, Lightbulb, CheckCircle, Loader2, Info } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface BNCCValidationModalProps {
  open: boolean;
  onClose: () => void;
  validationData: {
    isValid: boolean;
    confidence: number;
    suggestions: string[];
    feedback: string;
    justificativa?: string;
  } | null;
  tema: string;
  disciplina: string;
  serie: string;
  onAccept: () => void;
}

const BNCCValidationModal: React.FC<BNCCValidationModalProps> = ({
  open,
  onClose,
  validationData,
  tema,
  disciplina,
  serie,
  onAccept
}) => {
  const isMobile = useIsMobile();

  const getGradeDisplayName = (serie: string) => {
    const parts = serie.split('-');
    return parts.length > 1 ? `${parts[1]} (${parts[0]})` : serie;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'Alta confiança';
    if (confidence >= 0.6) return 'Confiança moderada';
    return 'Baixa confiança';
  };

  const handleAcceptAnyway = () => {
    console.log('👤 Usuário escolheu gerar mesmo assim');
    onAccept();
  };

  const handleCorrectTopic = () => {
    console.log('👤 Usuário escolheu corrigir o tema');
    onClose();
  };

  // Se não estiver aberto ou não tiver dados de validação, não renderizar
  if (!open || !validationData) {
    return null;
  }

  // Se o tema estiver válido, não mostrar o modal
  if (validationData.isValid) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
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
            <span>Validação BNCC</span>
          </DialogTitle>
        </DialogHeader>

        {/* Conteúdo scrollável */}
        <div className={`flex-1 overflow-y-auto p-4 ${isMobile ? 'pb-2' : 'p-6'}`}>
          <div className={`space-y-4 ${isMobile ? 'space-y-3' : 'space-y-6'}`}>
            
            {/* Informações do Tema */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-3">
                <BookOpen className="w-4 h-4 text-gray-600" />
                <h3 className={`font-semibold text-gray-800 ${isMobile ? 'text-sm' : 'text-base'}`}>
                  Tema Analisado
                </h3>
              </div>
              
              <div className={`space-y-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                <div className="space-y-1">
                  <span className="font-medium text-gray-600">Tema:</span>
                  <div className="font-semibold text-gray-900 break-words">
                    {tema}
                  </div>
                </div>
                
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

            {/* Análise da Validação */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`font-semibold text-red-800 ${
                      isMobile ? 'text-sm' : 'text-base'
                    }`}>
                      Tema Não Recomendado
                    </h4>
                    <div className={`text-xs px-2 py-1 rounded-full bg-red-100 ${
                      getConfidenceColor(validationData.confidence)
                    }`}>
                      {getConfidenceText(validationData.confidence)}
                    </div>
                  </div>
                  <p className={`text-red-700 leading-relaxed break-words mb-3 ${
                    isMobile ? 'text-xs' : 'text-sm'
                  }`}>
                    {validationData.feedback}
                  </p>
                  
                  {/* Justificativa técnica */}
                  {validationData.justificativa && (
                    <div className="mt-3 pt-3 border-t border-red-200">
                      <div className="flex items-start space-x-2">
                        <Info className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h5 className={`font-medium text-red-800 mb-1 ${
                            isMobile ? 'text-xs' : 'text-sm'
                          }`}>
                            Justificativa:
                          </h5>
                          <p className={`text-red-700 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                            {validationData.justificativa}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sugestões Melhoradas */}
            {validationData.suggestions && validationData.suggestions.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <Lightbulb className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-semibold text-green-800 mb-3 ${
                      isMobile ? 'text-sm' : 'text-base'
                    }`}>
                      Temas Recomendados para {disciplina} - {getGradeDisplayName(serie)}:
                    </h4>
                    <div className={`space-y-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      {validationData.suggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-start text-green-700 bg-green-100 rounded-lg p-3">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                          <span className="break-words leading-relaxed font-medium">{suggestion}</span>
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
              Revisar Tema
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
