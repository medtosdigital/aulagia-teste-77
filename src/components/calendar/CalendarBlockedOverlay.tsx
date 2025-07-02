
import React from 'react';
import { Calendar, Lock, Crown, Star, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface CalendarBlockedOverlayProps {
  onUpgrade: () => void;
  children?: React.ReactNode;
}

const CalendarBlockedOverlay: React.FC<CalendarBlockedOverlayProps> = ({
  onUpgrade,
  children
}) => {
  const features = [
    'Calendário completo com todas as visualizações',
    'Agendamento ilimitado de materiais',
    'Organização por disciplinas e turmas',
    'Sincronização automática',
    'Notificações e lembretes'
  ];

  return (
    <div className="relative min-h-[600px] rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Background content (blurred) */}
      <div className="absolute inset-0 filter blur-sm opacity-30 pointer-events-none">
        {children}
      </div>
      
      {/* Overlay content */}
      <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center p-8">
        <Card className="w-full max-w-2xl border-0 shadow-2xl bg-white">
          <CardContent className="p-12 text-center">
            {/* Icon and title */}
            <div className="mb-8">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                <Calendar className="w-12 h-12 text-white" />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Lock className="w-4 h-4 text-white" />
                </div>
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Calendário Premium
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed max-w-lg mx-auto">
                Organize suas aulas de forma profissional com nosso calendário completo. 
                Disponível apenas para usuários Premium.
              </p>
            </div>

            {/* Features list */}
            <div className="mb-10">
              <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center justify-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                O que você ganha com o Premium
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-xl mx-auto">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 text-sm leading-relaxed">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="space-y-4">
              <Button 
                onClick={onUpgrade}
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-12 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-lg"
              >
                <Crown className="w-6 h-6 mr-3" />
                Fazer Upgrade Agora
              </Button>
              
              <p className="text-sm text-gray-500">
                A partir de R$ 29,90/mês • Cancele quando quiser
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CalendarBlockedOverlay;
