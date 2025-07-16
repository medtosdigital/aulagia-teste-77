
import React from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAudioTranscription } from '@/hooks/useAudioTranscription';
import { toast } from 'sonner';

interface AudioTranscriptionButtonProps {
  onTranscriptionComplete: (result: {
    text: string;
    tema: string;
    disciplina: string | null;
    turma: string | null;
  }) => void;
}

const AudioTranscriptionButton: React.FC<AudioTranscriptionButtonProps> = ({
  onTranscriptionComplete
}) => {
  const { isRecording, isTranscribing, startRecording, stopRecording, cancelRecording } = useAudioTranscription();

  const handleMicClick = async () => {
    if (isRecording) {
      try {
        const result = await stopRecording();
        onTranscriptionComplete(result);
      } catch (error) {
        console.error('Erro ao parar gravação:', error);
        toast.error('Erro ao processar áudio. Tente novamente.');
      }
    } else {
      await startRecording();
    }
  };

  const getButtonStyle = () => {
    if (isRecording) {
      return 'border-2 border-red-400 bg-red-50 text-red-600 shadow-md ring-2 ring-red-200 animate-pulse';
    }
    if (isTranscribing) {
      return 'border-2 border-blue-400 bg-blue-50 text-blue-600 shadow-md ring-2 ring-blue-200';
    }
    return 'border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md transition-all duration-200';
  };

  const getIcon = () => {
    if (isTranscribing) return <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />;
    if (isRecording) return <MicOff className="w-4 h-4 sm:w-5 sm:h-5" />;
    return <Mic className="w-4 h-4 sm:w-5 sm:h-5" />;
  };

  const getTooltipMessage = () => {
    if (isRecording) return 'Escutando... Clique para parar';
    if (isTranscribing) return 'Processando áudio...';
    return 'Clique para gravar áudio';
  };

  return (
    <div className="relative h-12 min-h-[48px] flex items-center">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleMicClick}
        disabled={isTranscribing}
        className={`absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all duration-200 ${getButtonStyle()}`}
        title={getTooltipMessage()}
        style={{transform: 'translateY(-50%)'}} // Garante centralização vertical
      >
        {getIcon()}
      </Button>
      {isRecording && (
        <div className="absolute right-16 sm:right-20 top-1/2 -translate-y-1/2 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium border border-red-200 shadow-sm animate-fade-in min-h-[48px] flex items-center">
          Escutando...
        </div>
      )}
    </div>
  );
};

export default AudioTranscriptionButton;
