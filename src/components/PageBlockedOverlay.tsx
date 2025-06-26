
import React from 'react';
import { Lock, Crown, Calendar, Settings, School } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface PageBlockedOverlayProps {
  title: string;
  description: string;
  icon: 'calendar' | 'settings' | 'school';
  onUpgrade: () => void;
  children: React.ReactNode;
}

const PageBlockedOverlay: React.FC<PageBlockedOverlayProps> = ({
  title,
  description,
  icon,
  onUpgrade,
  children
}) => {
  const getIcon = () => {
    switch (icon) {
      case 'calendar':
        return Calendar;
      case 'settings':
        return Settings;
      case 'school':
        return School;
      default:
        return Lock;
    }
  };

  const IconComponent = getIcon();

  return (
    <div className="relative min-h-screen">
      {/* Conteúdo de fundo desbotado */}
      <div className="filter blur-sm grayscale opacity-30 pointer-events-none">
        {children}
      </div>
      
      {/* Overlay de bloqueio */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <Card className="max-w-md w-full shadow-2xl border-0">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <Lock className="w-8 h-8 text-gray-600" />
              </div>
            </div>
            
            <div className="mb-6">
              <IconComponent className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-3">{title}</h2>
              <p className="text-gray-600 leading-relaxed">{description}</p>
            </div>
            
            <Button 
              onClick={onUpgrade}
              className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all w-full"
            >
              <Crown className="w-5 h-5 mr-2" />
              Fazer Upgrade Agora
            </Button>
            
            <p className="text-xs text-gray-500 mt-4">
              Desbloqueie todos os recursos com um plano premium
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PageBlockedOverlay;
