
import React, { useState } from 'react';
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
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeItem?: string;
  onItemClick?: (item: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeItem = 'dashboard', onItemClick }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'create', label: 'Criar Aula', icon: Plus },
    { id: 'lessons', label: 'Minhas Aulas', icon: BookOpen },
    { id: 'calendar', label: 'Calendário', icon: Calendar },
    { id: 'subscription', label: 'Assinatura', icon: Crown },
  ];

  const adminItems = [
    { id: 'settings', label: 'Configurações', icon: Settings },
    { id: 'api-keys', label: 'Chaves de API', icon: Key },
    { id: 'templates', label: 'Templates', icon: FileText },
  ];

  const handleItemClick = (itemId: string) => {
    onItemClick?.(itemId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg bg-white shadow-md text-primary-600"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 h-full w-64 bg-white shadow-lg flex flex-col z-40 transition-transform duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Header */}
        <div className="p-4 flex items-center space-x-2 border-b border-gray-200">
          <div className="bg-primary-500 text-white p-3 rounded-lg">
            <BookOpen className="w-5 h-5" />
          </div>
          <h1 className="logo-text text-2xl text-primary-600">AulagIA</h1>
        </div>
        
        {/* Profile */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-600 font-semibold">P</span>
            </div>
            <div>
              <p className="font-semibold">Professor(a)</p>
              <p className="text-xs text-gray-500">Plano Premium</p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={cn(
                  "sidebar-item w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors",
                  isActive 
                    ? "bg-primary-50 text-primary-600 font-medium" 
                    : "hover:bg-gray-100 text-gray-700"
                )}
              >
                <div className="sidebar-icon w-6 h-6 flex items-center justify-center">
                  <Icon size={18} />
                </div>
                <span>{item.label}</span>
              </button>
            );
          })}
          
          <div className="pt-4">
            <p className="text-xs uppercase text-gray-400 font-semibold px-3 mb-2">
              Administração
            </p>
            
            {adminItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={cn(
                    "sidebar-item w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors",
                    isActive 
                      ? "bg-primary-50 text-primary-600 font-medium" 
                      : "hover:bg-gray-100 text-gray-700"
                  )}
                >
                  <div className="sidebar-icon w-6 h-6 flex items-center justify-center">
                    <Icon size={18} />
                  </div>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
        
        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button className="w-full flex items-center justify-center space-x-2 p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors">
            <LogOut size={18} />
            <span>Sair</span>
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
