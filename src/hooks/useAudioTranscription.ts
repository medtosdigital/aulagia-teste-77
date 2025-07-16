
import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TranscriptionResult {
  text: string;
  tema: string;
  disciplina: string | null;
  turma: string | null;
}

export const useAudioTranscription = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast.info('Gravação iniciada. Fale agora...');
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      toast.error('Erro ao acessar o microfone. Verifique as permissões.');
    }
  };

  const stopRecording = (): Promise<TranscriptionResult> => {
    return new Promise((resolve, reject) => {
      if (!mediaRecorderRef.current || !isRecording) {
        reject(new Error('Nenhuma gravação ativa'));
        return;
      }

      mediaRecorderRef.current.onstop = async () => {
        try {
          setIsRecording(false);
          setIsTranscribing(true);
          
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          
          // Convert to base64
          const reader = new FileReader();
          reader.onloadend = async () => {
            try {
              const base64Audio = (reader.result as string).split(',')[1];
              
              console.log('Enviando áudio para transcrição...');
              toast.info('Processando áudio...');

              const { data, error } = await supabase.functions.invoke('transcribe-audio', {
                body: { audio: base64Audio }
              });

              if (error) {
                console.error('Erro na transcrição:', error);
                throw new Error(error.message || 'Erro na transcrição');
              }

              console.log('Resultado da transcrição:', data);
              
              setIsTranscribing(false);
              
              if (data.text) {
                toast.success('Transcrição concluída!');
                resolve({
                  text: data.text,
                  tema: data.tema || data.text,
                  disciplina: data.disciplina,
                  turma: data.turma
                });
              } else {
                throw new Error('Nenhum texto foi transcrito');
              }
              
            } catch (transcriptionError) {
              console.error('Erro na transcrição:', transcriptionError);
              setIsTranscribing(false);
              reject(transcriptionError);
            }
          };
          
          reader.readAsDataURL(audioBlob);
        } catch (error) {
          console.error('Erro ao processar áudio:', error);
          setIsTranscribing(false);
          reject(error);
        }
      };

      mediaRecorderRef.current.stop();
      
      // Stop all tracks
      const stream = mediaRecorderRef.current.stream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    });
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      const stream = mediaRecorderRef.current.stream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      setIsRecording(false);
      setIsTranscribing(false);
      toast.info('Gravação cancelada');
    }
  };

  return {
    isRecording,
    isTranscribing,
    startRecording,
    stopRecording,
    cancelRecording
  };
};
