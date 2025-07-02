import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Wand2, Check, X } from 'lucide-react';
import { GrammarService } from '@/services/grammarService';
import { toast } from 'sonner';

interface GrammarCorrectionProps {
  text: string;
  onTextChange: (newText: string) => void;
  className?: string;
}

const GrammarCorrection: React.FC<GrammarCorrectionProps> = ({
  text,
  onTextChange,
  className = ''
}) => {
  const [isChecking, setIsChecking] = useState(false);
  const [suggestedText, setSuggestedText] = useState<string | null>(null);
  const [showSuggestion, setShowSuggestion] = useState(false);

  const checkGrammar = async () => {
    if (!text.trim()) {
      toast.error('Digite um texto para verificar');
      return;
    }

    setIsChecking(true);
    try {
      const hasIssues = await GrammarService.hasGrammarIssues(text);
      
      if (hasIssues) {
        const correctedText = await GrammarService.correctText(text);
        setSuggestedText(correctedText);
        setShowSuggestion(true);
        toast.info('Correções sugeridas encontradas');
      } else {
        toast.success('Texto sem problemas gramaticais detectados');
      }
    } catch (error) {
      toast.error('Erro ao verificar gramática');
      console.error('Grammar check error:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const acceptSuggestion = () => {
    if (suggestedText) {
      onTextChange(suggestedText);
      setShowSuggestion(false);
      setSuggestedText(null);
      toast.success('Correções aplicadas');
    }
  };

  const rejectSuggestion = () => {
    setShowSuggestion(false);
    setSuggestedText(null);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={checkGrammar}
          disabled={isChecking}
          className="flex items-center space-x-2"
        >
          <Wand2 className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
          <span>{isChecking ? 'Verificando...' : 'Verificar Gramática'}</span>
        </Button>
      </div>

      {showSuggestion && suggestedText && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-blue-800">Texto Original:</label>
              <p className="text-sm text-gray-700 bg-white p-2 rounded border">{text}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-blue-800">Correção Sugerida:</label>
              <p className="text-sm text-blue-900 bg-blue-100 p-2 rounded border font-medium">{suggestedText}</p>
            </div>

            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={acceptSuggestion}
                className="flex items-center space-x-1 bg-green-600 hover:bg-green-700"
              >
                <Check className="w-4 h-4" />
                <span>Aceitar</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={rejectSuggestion}
                className="flex items-center space-x-1"
              >
                <X className="w-4 h-4" />
                <span>Rejeitar</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GrammarCorrection;
