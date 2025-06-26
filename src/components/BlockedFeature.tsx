
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
        <div className="absolute inset-0 bg-black/10 rounded-lg flex items-center justify-center z-10">
          <div className="text-center bg-white p-4 rounded-xl shadow-lg border-2 border-gray-300 max-w-xs">
            <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h4 className="text-sm font-bold text-gray-800 mb-2">{title}</h4>
            <p className="text-xs text-gray-600 mb-3">{description}</p>
            <Button 
              onClick={onUpgrade}
              size="sm"
              className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
            >
              <Crown className="w-4 h-4 mr-1" />
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
