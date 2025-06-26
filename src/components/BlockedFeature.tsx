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
          <div className="flex items-center justify-between w-full max-w-sm">
            {/* Coluna de texto */}
            <div className="flex items-center space-x-2 flex-1 rounded-xl bg-[#4c4e4f]/[0.79] py-[8px] px-[14px] mx-0 my-0">
              <div className="w-6 h-6 bg-white/90 rounded-full flex items-center justify-center px-[6px]">
                <Lock className="w-3 h-3 text-gray-600" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-semibold text-white mb-0.5">{title}</h4>
                <p className="text-[10px] text-white/90 leading-tight">{description}</p>
              </div>
            </div>
            
            {/* Coluna do botão */}
            <div className="ml-3">
              <Button onClick={onUpgrade} size="sm" className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white rounded-md font-medium shadow-sm hover:shadow-md transition-all text-xs h-6 py-[17px] px-[13px]">
                <Crown className="w-3 h-3 mr-1" />
                Upgrade
              </Button>
            </div>
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