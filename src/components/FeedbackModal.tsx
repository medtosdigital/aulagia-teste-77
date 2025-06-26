
import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { MessageCircle, Heart, Star, Send, X, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

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
  const [feedbackType, setFeedbackType] = useState<'sugestao' | 'reclamacao' | 'elogio'>('sugestao');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast.error('Por favor, escreva sua mensagem');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simular envio (aqui você pode integrar com uma API real)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Salvar feedback no localStorage (em produção, enviar para API)
      const feedback = {
        type: feedbackType,
        message: message.trim(),
        timestamp: new Date().toISOString(),
        id: Date.now().toString()
      };
      
      const existingFeedbacks = JSON.parse(localStorage.getItem('userFeedbacks') || '[]');
      existingFeedbacks.push(feedback);
      localStorage.setItem('userFeedbacks', JSON.stringify(existingFeedbacks));
      
      setIsSubmitted(true);
      toast.success('Feedback enviado com sucesso! Obrigado pela sua contribuição.');
      
      // Fechar modal após 2 segundos
      setTimeout(() => {
        handleClose();
      }, 2000);
      
    } catch (error) {
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
      description: 'Compartilhe ideias para melhorar',
      icon: MessageCircle,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200'
    },
    {
      id: 'reclamacao',
      label: 'Reclamação',
      description: 'Relate problemas ou dificuldades',
      icon: X,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200'
    },
    {
      id: 'elogio',
      label: 'Elogio',
      description: 'Conte o que você mais gosta',
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
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Feedback Enviado!</h3>
            <p className="text-gray-600 mb-4">
              Obrigado por nos ajudar a melhorar o AulagIA. Sua opinião é muito importante para nós!
            </p>
            <div className="flex justify-center space-x-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-5 h-5 text-yellow-400 fill-current" />
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="w-[90vw] sm:w-full sm:max-w-lg p-0 border-0 shadow-2xl rounded-2xl bg-white max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Sua Opinião é Importante!
            </h2>
            <p className="text-gray-600 text-sm">
              Ajude-nos a melhorar o AulagIA compartilhando sua experiência
            </p>
          </div>

          {/* Tipo de Feedback */}
          <div className="mb-6">
            <Label className="text-base font-semibold text-gray-800 mb-3 block">
              Tipo de Feedback
            </Label>
            <RadioGroup 
              value={feedbackType} 
              onValueChange={(value) => setFeedbackType(value as typeof feedbackType)}
              className="grid grid-cols-1 gap-3"
            >
              {feedbackTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = feedbackType === type.id;
                
                return (
                  <div key={type.id} className="flex items-center space-x-3">
                    <RadioGroupItem value={type.id} id={type.id} className="sr-only" />
                    <Label 
                      htmlFor={type.id} 
                      className={`flex-1 cursor-pointer p-4 rounded-xl border-2 transition-all ${
                        isSelected 
                          ? `${type.bg} ${type.border} shadow-md` 
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isSelected ? type.bg : 'bg-white'
                        }`}>
                          <Icon className={`w-5 h-5 ${isSelected ? type.color : 'text-gray-400'}`} />
                        </div>
                        <div>
                          <div className={`font-semibold ${isSelected ? type.color : 'text-gray-700'}`}>
                            {type.label}
                          </div>
                          <div className="text-sm text-gray-500">
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

          {/* Mensagem */}
          <div className="mb-6">
            <Label className="text-base font-semibold text-gray-800 mb-3 block">
              Sua Mensagem
            </Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                feedbackType === 'sugestao' 
                  ? 'Conte suas ideias para melhorar o AulagIA...'
                  : feedbackType === 'reclamacao'
                  ? 'Descreva o problema ou dificuldade que encontrou...'
                  : 'Compartilhe o que você mais gosta no AulagIA...'
              }
              className="min-h-[120px] resize-none border-2 border-gray-200 focus:border-blue-400 rounded-xl bg-gray-50 focus:bg-white transition-all"
              maxLength={500}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500">
                Seja específico para nos ajudar melhor
              </span>
              <span className="text-xs text-gray-400">
                {message.length}/500
              </span>
            </div>
          </div>

          {/* Botões */}
          <div className="flex flex-col space-y-3">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !message.trim()}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white h-12 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Enviando...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Send className="w-4 h-4" />
                  <span>Enviar Feedback</span>
                </div>
              )}
            </Button>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1 h-10 border-2 hover:bg-gray-50 rounded-xl"
              >
                Fechar
              </Button>
              
              {showDontShowOption && (
                <Button
                  variant="outline"
                  onClick={handleDontShow}
                  className="flex-1 h-10 border-2 border-gray-300 text-gray-600 hover:bg-gray-50 rounded-xl text-sm"
                >
                  Não mostrar novamente
                </Button>
              )}
            </div>
          </div>

          {showDontShowOption && (
            <p className="text-xs text-gray-500 text-center mt-3">
              Você ainda pode acessar este feedback pelo botão "?" no cabeçalho
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackModal;
