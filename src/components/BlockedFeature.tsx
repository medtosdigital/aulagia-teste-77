
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
        <div className="absolute inset-0 bg-black/5 rounded-lg flex items-center justify-center z-10">
          <div className="text-center bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-md border border-gray-200 max-w-[200px]">
            <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-2">
              <Lock className="w-4 h-4 text-white" />
            </div>
            <h4 className="text-xs font-semibold text-gray-800 mb-1">{title}</h4>
            <p className="text-[10px] text-gray-600 mb-2 leading-tight">{description}</p>
            <Button 
              onClick={onUpgrade}
              size="sm"
              className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white px-3 py-1 rounded-md font-medium shadow-sm hover:shadow-md transition-all text-xs h-7"
            >
              <Crown className="w-3 h-3 mr-1" />
              Upgrade
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
