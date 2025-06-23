
import React from 'react';
import { 
  LayoutDashboard, 
  Plus, 
  BookOpen, 
  Calendar, 
  Crown, 
  Settings, 
  Key, 
  FileText, 
  LogOut,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeItem?: string;
  onItemClick?: (item: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeItem = 'dashboard', onItemClick }) => {
  const mobileMenuItems = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { id: 'lessons', label: 'Materiais', icon: BookOpen },
    { id: 'create', label: 'Criar', icon: Plus, isCenter: true },
    { id: 'calendar', label: 'Agenda', icon: Calendar },
    { id: 'subscription', label: 'Assinatura', icon: User },
  ];

  const handleItemClick = (itemId: string) => {
    onItemClick?.(itemId);
  };

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="flex items-center justify-around px-2 py-2">
          {mobileMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            const isCenter = item.isCenter;
            
            if (isCenter) {
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className="relative flex flex-col items-center justify-center w-16 h-16 -mt-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg transform transition-transform hover:scale-105"
                >
                  <Icon size={24} className="text-white" />
                  <span className="text-xs text-white font-medium mt-1">{item.label}</span>
                </button>
              );
            }
            
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={cn(
                  "flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors min-w-0 flex-1",
                  isActive 
                    ? "text-primary-600" 
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                <Icon size={20} />
                <span className="text-xs font-medium mt-1 truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
