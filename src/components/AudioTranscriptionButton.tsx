
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

  const getButtonColor = () => {
    if (isRecording) return 'hover:bg-red-50 text-red-500';
    if (isTranscribing) return 'hover:bg-blue-50 text-blue-500';
    return 'hover:bg-blue-50 text-blue-500';
  };

  const getIcon = () => {
    if (isTranscribing) return <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />;
    if (isRecording) return <MicOff className="w-4 h-4 sm:w-5 sm:h-5" />;
    return <Mic className="w-4 h-4 sm:w-5 sm:h-5" />;
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleMicClick}
      disabled={isTranscribing}
      className={`absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-colors ${getButtonColor()}`}
      title={
        isRecording 
          ? 'Clique para parar a gravação' 
          : isTranscribing 
            ? 'Processando áudio...' 
            : 'Clique para gravar áudio'
      }
    >
      {getIcon()}
    </Button>
  );
};

export default AudioTranscriptionButton;
