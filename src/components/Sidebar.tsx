
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
  User,
  School
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

  const desktopMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'create', label: 'Preparar Aula', icon: Plus },
    { id: 'lessons', label: 'Meus Materiais', icon: BookOpen },
    { id: 'calendar', label: 'Calendário', icon: Calendar },
    { id: 'subscription', label: 'Assinatura', icon: Crown },
    { id: 'school', label: 'Escola', icon: School },
  ];

  const handleItemClick = (itemId: string) => {
    onItemClick?.(itemId);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-white shadow-sm z-40">
        <div className="flex flex-col w-full">
          {/* Logo/Brand */}
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="text-xl font-bold text-blue-500">AulagIA</span>
            </div>
            
            <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-3">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <School className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">Medtos Digital</div>
                <div className="text-xs text-gray-500">Plano Premium</div>
              </div>
            </div>
          </div>
          
          {/* Navigation Menu */}
          <nav className="flex-1 px-4">
            <div className="space-y-1">
              {desktopMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeItem === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={cn(
                      "flex items-center w-full px-4 py-3 text-left rounded-lg transition-colors",
                      isActive 
                        ? "bg-blue-50 text-blue-600" 
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <Icon size={20} className="mr-3" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
            
            {/* Administration Section */}
            <div className="mt-8">
              <div className="px-4 py-2">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">ADMINISTRAÇÃO</span>
              </div>
            </div>
          </nav>
          
          {/* Footer */}
          <div className="p-4">
            <button className="flex items-center w-full px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
              <LogOut size={20} className="mr-3" />
              <span className="font-medium">Sair</span>
            </button>
          </div>
        </div>
      </div>

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
                  className="relative flex flex-col items-center justify-center w-14 h-14 -mt-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg transform transition-transform hover:scale-105"
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
