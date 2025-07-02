
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
  return <Card className={`cursor-not-allowed border-2 border-gray-300 bg-gradient-to-br from-gray-100 to-gray-200 ${className}`}>
      <CardContent className="p-4 relative h-full">
        {/* Overlay de bloqueio */}
        <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center z-10 p-4">
          <div className="flex flex-col items-center justify-center w-full max-w-md space-y-4">
            {/* Div de informação do recurso premium - maior */}
            <div className="flex items-center space-x-3 rounded-xl bg-[#4c4e4f]/[0.85] py-4 px-5 w-full">
              <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center">
                <Lock className="w-4 h-4 text-gray-600" />
              </div>
              <div className="text-left flex-1">
                <h4 className="text-sm font-semibold text-white mb-1">{title}</h4>
                <p className="text-xs text-white/90 leading-tight">{description}</p>
              </div>
            </div>
            
            {/* Botão upgrade abaixo - responsivo */}
            <Button 
              onClick={onUpgrade} 
              size="sm" 
              className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all text-sm h-10 px-6 py-2 w-full sm:w-auto"
            >
              <Crown className="w-4 h-4 mr-2" />
              Fazer Upgrade
            </Button>
          </div>
        </div>
        
        {/* Conteúdo original em escala de cinza */}
        <div className="filter grayscale opacity-50 pointer-events-none">
          {children}
        </div>
      </CardContent>
    </Card>;
};
export default BlockedFeature;
