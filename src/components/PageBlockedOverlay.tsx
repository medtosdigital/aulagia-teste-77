import React from 'react';
import { Calendar, School, Settings, Plus, BookOpen, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PageBlockedOverlayProps {
  title: string;
  description: string;
  icon: 'calendar' | 'school' | 'settings' | 'plus' | 'book' | 'lock';
  onUpgrade: () => void;
  children?: React.ReactNode;
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
        return <Calendar className="w-12 h-12 text-gray-400" />;
      case 'school':
        return <School className="w-12 h-12 text-gray-400" />;
      case 'settings':
        return <Settings className="w-12 h-12 text-gray-400" />;
      case 'plus':
        return <Plus className="w-12 h-12 text-gray-400" />;
      case 'book':
        return <BookOpen className="w-12 h-12 text-gray-400" />;
      case 'lock':
        return <Lock className="w-12 h-12 text-gray-400" />;
      default:
        return <Settings className="w-12 h-12 text-gray-400" />;
    }
  };

  return (
    <div className="relative min-h-[60vh] flex items-center justify-center">
      {/* Background blur overlay */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10" />
      
      {/* Blurred content in background */}
      <div className="absolute inset-0 filter blur-sm opacity-50">
        {children}
      </div>
      
      {/* Blocked content message */}
      <div className="relative z-20 text-center max-w-md mx-auto p-8">
        <div className="mb-6">
          {getIcon()}
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
        <p className="text-gray-600 mb-8 leading-relaxed">{description}</p>
        
        <Button 
          onClick={onUpgrade}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          Fazer Upgrade do Plano
        </Button>
      </div>
    </div>
  );
};

export default PageBlockedOverlay;
