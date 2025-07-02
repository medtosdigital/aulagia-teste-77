
import React, { useState } from 'react';
import { CreditCard, Lock, Calendar, User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ChangeCardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangeCardModal: React.FC<ChangeCardModalProps> = ({ isOpen, onClose }) => {
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Mock API call
    setTimeout(() => {
      console.log('Cartão alterado:', cardData);
      setIsLoading(false);
      onClose();
      // Reset form
      setCardData({ number: '', name: '', expiry: '', cvv: '' });
    }, 2000);
  };

  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\s/g, '').replace(/\D/g, '');
    const match = numbers.match(/(\d{0,4})(\d{0,4})(\d{0,4})(\d{0,4})/);
    if (match) {
      return [match[1], match[2], match[3], match[4]].filter(Boolean).join(' ');
    }
    return numbers;
  };

  const formatExpiry = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length >= 2) {
      return numbers.slice(0, 2) + '/' + numbers.slice(2, 4);
    }
    return numbers;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto rounded-xl border-0 p-4 sm:p-6">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <CreditCard className="w-5 h-5 text-blue-600" />
            Alterar Cartão de Crédito
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Adicione um novo cartão de crédito para sua assinatura
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="cardNumber" className="text-sm font-medium">Número do Cartão</Label>
            <div className="relative">
              <Input
                id="cardNumber"
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardData.number}
                onChange={(e) => setCardData({ ...cardData, number: formatCardNumber(e.target.value) })}
                maxLength={19}
                className="pl-10 h-12 rounded-xl border-2 text-base"
                required
              />
              <CreditCard className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardName" className="text-sm font-medium">Nome no Cartão</Label>
            <div className="relative">
              <Input
                id="cardName"
                type="text"
                placeholder="Nome como aparece no cartão"
                value={cardData.name}
                onChange={(e) => setCardData({ ...cardData, name: e.target.value.toUpperCase() })}
                className="pl-10 h-12 rounded-xl border-2 text-base"
                required
              />
              <User className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry" className="text-sm font-medium">Validade</Label>
              <div className="relative">
                <Input
                  id="expiry"
                  type="text"
                  placeholder="MM/AA"
                  value={cardData.expiry}
                  onChange={(e) => setCardData({ ...cardData, expiry: formatExpiry(e.target.value) })}
                  maxLength={5}
                  className="pl-10 h-12 rounded-xl border-2 text-base"
                  required
                />
                <Calendar className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cvv" className="text-sm font-medium">CVV</Label>
              <div className="relative">
                <Input
                  id="cvv"
                  type="text"
                  placeholder="123"
                  value={cardData.cvv}
                  onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '') })}
                  maxLength={4}
                  className="pl-10 h-12 rounded-xl border-2 text-base"
                  required
                />
                <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4">
            <div className="flex items-start gap-2">
              <Lock className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-xs sm:text-sm text-blue-700">
                <p className="font-medium">Suas informações estão seguras</p>
                <p>Utilizamos criptografia SSL e não armazenamos dados do cartão</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="w-full sm:w-auto h-12 rounded-xl border-2 text-base"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full sm:w-auto h-12 rounded-xl text-base"
            >
              {isLoading ? 'Salvando...' : 'Salvar Cartão'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
