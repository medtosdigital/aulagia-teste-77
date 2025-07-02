
import React from 'react';
import { Lock, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface BlockedFeatureProps {
  title: string;
  description: string;
  onUpgrade: () => void;
  className?: string;
  children?: React.ReactNode;
}

const BlockedFeature: React.FC<BlockedFeatureProps> = ({
  title,
  description,
  onUpgrade,
  className = "",
  children
}) => {
  return (
    <Card className={`cursor-not-allowed border-2 border-gray-300 bg-gradient-to-br from-gray-100 to-gray-200 ${className}`}>
      <CardContent className="p-4 relative h-full">
        {/* Overlay de bloqueio */}
        <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center z-10 p-4">
          <div className="flex flex-col items-center justify-center space-y-4 w-full max-w-md">
            {/* Informação do recurso premium - Maior e centralizada */}
            <div className="flex flex-col items-center space-y-3 rounded-xl bg-[#4c4e4f]/[0.85] py-6 px-6 mx-0 my-0 w-full">
              <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                <Lock className="w-6 h-6 text-gray-600" />
              </div>
              <div className="text-center">
                <h4 className="text-lg font-bold text-white mb-2">{title}</h4>
                <p className="text-sm text-white/90 leading-relaxed max-w-xs">{description}</p>
              </div>
            </div>
            
            {/* Botão de upgrade abaixo */}
            <Button 
              onClick={onUpgrade} 
              size="lg"
              className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all text-base px-8 py-4 w-full sm:w-auto"
            >
              <Crown className="w-5 h-5 mr-2" />
              Fazer Upgrade
            </Button>
          </div>
        </div>
        
        {/* Conteúdo original em escala de cinza */}
        <div className="filter grayscale opacity-50 pointer-events-none">
          {children}
        </div>
      </CardContent>
    </Card>
  );
};

export default BlockedFeature;
