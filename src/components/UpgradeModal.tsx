
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Users, Check, Zap, ArrowRight } from 'lucide-react';

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  reason: string;
  onUpgrade: (planId: string) => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ open, onClose, reason, onUpgrade }) => {
  const plans = [
    {
      id: 'professor',
      name: 'Professor',
      price: 'R$ 29,90/mês',
      icon: Crown,
      color: 'from-blue-500 to-purple-600',
      features: [
        '60 materiais por mês',
        'Download em PDF, Word e PPT',
        'Edição completa de materiais',
        'Slides interativos',
        'Avaliações personalizadas',
        'Suporte por e-mail'
      ],
      popular: true
    },
    {
      id: 'grupo-escolar',
      name: 'Grupo Escolar',
      price: 'R$ 89,90/mês',
      icon: Users,
      color: 'from-green-500 to-emerald-600',
      features: [
        'Até 5 professores',
        '60 materiais por professor/mês',
        'Todos os recursos do plano Professor',
        'Dashboard colaborativo',
        'Compartilhamento de materiais',
        'Suporte prioritário'
      ]
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-800">
            Desbloqueie todo o potencial da plataforma!
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-lg">
            {reason}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card 
                key={plan.id} 
                className={`relative transition-all duration-300 hover:shadow-xl border-2 ${
                  plan.popular ? 'border-blue-200 scale-105' : 'border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white px-4 py-1">
                      MAIS POPULAR
                    </Badge>
                  </div>
                )}

                <div className={`bg-gradient-to-r ${plan.color} p-6 text-white rounded-t-lg`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{plan.name}</h3>
                        <p className="text-white/80">{plan.price}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <CardContent className="p-6">
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => onUpgrade(plan.id)}
                    className={`w-full py-3 font-semibold ${
                      plan.popular
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                        : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                    } text-white`}
                  >
                    Escolher {plan.name}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-6 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="px-8"
          >
            Continuar com Plano Gratuito
          </Button>
          <p className="text-sm text-gray-500 mt-2">
            Você pode fazer upgrade a qualquer momento
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeModal;
