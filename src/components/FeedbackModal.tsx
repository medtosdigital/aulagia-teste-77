import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { MessageCircle, Heart, Star, Send, X, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDontShowAgain?: () => void;
  showDontShowOption?: boolean;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  onDontShowAgain,
  showDontShowOption = false
}) => {
  const { user } = useAuth();
  const [feedbackType, setFeedbackType] = useState<'sugestao' | 'reclamacao' | 'elogio'>('sugestao');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast.error('Por favor, escreva sua mensagem');
      return;
    }
    if (!user) {
      toast.error('Você precisa estar logado para enviar feedback.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('📝 Enviando feedback...', {
        user_id: user.id,
        user_email: user.email,
        type: feedbackType,
        message: message.trim(),
        message_length: message.trim().length
      });
      
      const feedbackData = {
        user_id: user.id,
        type: feedbackType,
        message: message.trim()
      };
      
      console.log('📊 Dados do feedback:', feedbackData);
      
      const { data, error } = await supabase
        .from('feedbacks')
        .insert([feedbackData])
        .select();
      
      if (error) {
        console.error('❌ Erro ao enviar feedback:', error);
        console.error('❌ Detalhes do erro:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }
      
      console.log('✅ Feedback enviado com sucesso:', data);
      
      setIsSubmitted(true);
      toast.success('Feedback enviado com sucesso! Obrigado pela sua contribuição.');
      
      // Fechar modal após 2 segundos
      setTimeout(() => {
        handleClose();
      }, 2000);
      
    } catch (error) {
      console.error('💥 Erro ao enviar feedback:', error);
      toast.error('Erro ao enviar feedback. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setMessage('');
    setFeedbackType('sugestao');
    setIsSubmitted(false);
    onClose();
  };

  const handleDontShow = () => {
    if (onDontShowAgain) {
      onDontShowAgain();
    }
    handleClose();
  };

  const feedbackTypes = [
    {
      id: 'sugestao',
      label: 'Sugestão',
      description: 'Ideias para melhorar',
      icon: MessageCircle,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200'
    },
    {
      id: 'reclamacao',
      label: 'Reclamação',
      description: 'Problemas encontrados',
      icon: X,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200'
    },
    {
      id: 'elogio',
      label: 'Elogio',
      description: 'O que você gosta',
      icon: Heart,
      color: 'text-pink-600',
      bg: 'bg-pink-50',
      border: 'border-pink-200'
    }
  ];

  if (isSubmitted) {
    return (
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="w-[90vw] sm:w-full sm:max-w-md p-0 border-0 shadow-2xl rounded-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="sr-only">Feedback Enviado</DialogTitle>
          </DialogHeader>
          <div className="p-4 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Feedback Enviado!</h3>
            <p className="text-gray-600 text-sm mb-3">
              Obrigado por nos ajudar a melhorar o AulagIA!
            </p>
            <div className="flex justify-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="w-[95vw] sm:w-full sm:max-w-2xl p-0 border-0 shadow-2xl rounded-2xl bg-white max-h-[95vh] overflow-hidden mt-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-center mt-2">
            Sua Opinião é Importante!
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-xs sm:text-sm text-center mt-1 mb-2">
            Ajude-nos a melhorar o AulagIA
          </DialogDescription>
        </DialogHeader>
        <div className="p-4 sm:p-5">
          {/* Header Compacto */}
          <div className="text-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Tipo de Feedback em Colunas */}
          <div className="mb-4">
            <Label className="text-sm font-semibold text-gray-800 mb-2 block">
              Tipo de Feedback
            </Label>
            <RadioGroup 
              value={feedbackType} 
              onValueChange={(value) => setFeedbackType(value as typeof feedbackType)}
              className="grid grid-cols-3 gap-2"
            >
              {feedbackTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = feedbackType === type.id;
                
                return (
                  <div key={type.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={type.id} id={type.id} className="sr-only" />
                    <Label 
                      htmlFor={type.id} 
                      className={`flex-1 cursor-pointer p-2 sm:p-3 rounded-lg border-2 transition-all text-center ${
                        isSelected 
                          ? `${type.bg} ${type.border} shadow-md` 
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-1">
                        <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center ${
                          isSelected ? type.bg : 'bg-white'
                        }`}>
                          <Icon className={`w-3 h-3 sm:w-4 sm:h-4 ${isSelected ? type.color : 'text-gray-400'}`} />
                        </div>
                        <div>
                          <div className={`font-semibold text-xs sm:text-sm ${isSelected ? type.color : 'text-gray-700'}`}>
                            {type.label}
                          </div>
                          <div className="text-xs text-gray-500 hidden sm:block">
                            {type.description}
                          </div>
                        </div>
                      </div>
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>

          {/* Mensagem Compacta */}
          <div className="mb-4">
            <Label className="text-sm font-semibold text-gray-800 mb-2 block">
              Sua Mensagem
            </Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                feedbackType === 'sugestao' 
                  ? 'Suas ideias para melhorar...'
                  : feedbackType === 'reclamacao'
                  ? 'Descreva o problema encontrado...'
                  : 'O que você mais gosta...'
              }
              className="h-16 sm:h-20 resize-none border-2 border-gray-200 focus:border-blue-400 rounded-lg bg-gray-50 focus:bg-white transition-all text-xs sm:text-sm"
              maxLength={300}
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-gray-500">
                Seja específico
              </span>
              <span className="text-xs text-gray-400">
                {message.length}/300
              </span>
            </div>
          </div>

          {/* Botões Compactos */}
          <div className="flex flex-col space-y-2">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !message.trim()}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white h-9 sm:h-10 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 text-sm"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Enviando...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Send className="w-3 h-3" />
                  <span>Enviar Feedback</span>
                </div>
              )}
            </Button>

            <div className="flex flex-row gap-2 mt-4">
              <Button variant="outline" className="flex-1" onClick={handleClose}>Fechar</Button>
              {showDontShowOption && (
                <Button variant="outline" className="flex-1" onClick={handleDontShow}>Não mostrar novamente</Button>
              )}
            </div>
          </div>

          {showDontShowOption && (
            <p className="text-xs text-gray-500 text-center mt-2">
              Acesse pelo botão "?" no cabeçalho
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackModal;
