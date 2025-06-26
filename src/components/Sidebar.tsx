import React from 'react';
import { LayoutDashboard, Plus, BookOpen, Calendar, Crown, Settings, Key, FileText, LogOut, User, School, Sliders } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePlanPermissions } from '@/hooks/usePlanPermissions';
interface SidebarProps {
  activeItem?: string;
  onItemClick?: (item: string) => void;
}
const Sidebar: React.FC<SidebarProps> = ({
  activeItem = 'dashboard',
  onItemClick
}) => {
  const {
    hasCalendar,
    canAccessCalendarPage,
    canAccessSchool,
    canAccessSettings,
    canAccessCreateMaterial,
    canAccessMaterials,
    currentPlan
  } = usePlanPermissions();
  const mobileMenuItems = [{
    id: 'dashboard',
    label: 'Início',
    icon: LayoutDashboard
  },
  // Para plano grupo escolar, sempre mostrar materiais
  ...(canAccessMaterials() ? [{
    id: 'lessons',
    label: 'Materiais',
    icon: BookOpen
  }] : []),
  // Para plano grupo escolar, sempre mostrar criar
  ...(canAccessCreateMaterial() ? [{
    id: 'create',
    label: 'Criar',
    icon: Plus,
    isCenter: true
  }] : []),
  // Calendário aparece para todos os planos
  ...(canAccessCalendarPage() ? [{
    id: 'calendar',
    label: 'Agenda',
    icon: Calendar
  }] : []), {
    id: 'subscription',
    label: 'Assinatura',
    icon: User
  }];
  const desktopMenuItems = [{
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard
  },
  // Para plano grupo escolar, sempre mostrar criar
  ...(canAccessCreateMaterial() ? [{
    id: 'create',
    label: 'Criar Material',
    icon: Plus
  }] : []),
  // Para plano grupo escolar, sempre mostrar materiais
  ...(canAccessMaterials() ? [{
    id: 'lessons',
    label: 'Meus Materiais',
    icon: BookOpen
  }] : []),
  // Calendário aparece para todos os planos
  ...(canAccessCalendarPage() ? [{
    id: 'calendar',
    label: 'Calendário',
    icon: Calendar
  }] : []),
  // Escola aparece para plano grupo-escolar
  ...(canAccessSchool() ? [{
    id: 'school',
    label: 'Escola',
    icon: School
  }] : []), {
    id: 'subscription',
    label: 'Assinatura',
    icon: Crown
  }];

  // Itens administrativos só aparecem para administrador autenticado
  const adminMenuItems = [...(canAccessSettings() ? [{
    id: 'settings',
    label: 'Configurações',
    icon: Settings
  }] : []), ...(canAccessSettings() ? [{
    id: 'api-keys',
    label: 'Chaves de API',
    icon: Key
  }] : []), ...(canAccessSettings() ? [{
    id: 'templates',
    label: 'Templates',
    icon: FileText
  }] : [])];
  const handleItemClick = (itemId: string) => {
    onItemClick?.(itemId);
  };
  const getPlanDisplayName = () => {
    switch (currentPlan.id) {
      case 'gratuito':
        return 'Plano Gratuito';
      case 'professor':
        return 'Plano Professor';
      case 'grupo-escolar':
        return 'Grupo Escolar';
      default:
        return 'Plano Gratuito';
    }
  };
  return <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-40 flex-col">
        {/* Logo Section */}
        <div className="p-4 flex items-center space-x-3 border-b border-gray-200">
          <div className="bg-primary-500 text-white p-3 rounded-lg">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="logo-text text-2xl text-primary-600">AulagIA</h1>
            <p className="text-gray-500 text-xs font-normal -mt-1">Sua aula com toque mágico</p>
          </div>
        </div>
        
        {/* User Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <User className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="font-semibold">Professor(a)</p>
              <p className="text-xs text-gray-500">{getPlanDisplayName()}</p>
            </div>
          </div>
        </div>
        
        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {desktopMenuItems.map(item => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          const isSchool = item.id === 'school';
          return <button key={item.id} onClick={() => handleItemClick(item.id)} className={cn("sidebar-item flex items-center space-x-3 p-3 rounded-lg w-full text-left transition-colors", isSchool ? "bg-green-500 text-white font-medium hover:bg-green-600" : isActive ? "bg-primary-50 text-primary-600 font-medium" : "text-gray-700 hover:bg-gray-100")}>
                <div className="sidebar-icon w-6 h-6 flex items-center justify-center">
                  <Icon size={18} />
                </div>
                <span>{item.label}</span>
              </button>;
        })}
          
          {/* Administration Section - só aparece se há itens admin disponíveis */}
          {adminMenuItems.length > 0 && <div className="pt-4">
              <p className="text-xs uppercase text-gray-400 font-semibold px-3 mb-2">ADMINISTRAÇÃO</p>
              
              {adminMenuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            return <button key={item.id} onClick={() => handleItemClick(item.id)} className={cn("sidebar-item flex items-center space-x-3 p-3 rounded-lg w-full text-left transition-colors", isActive ? "bg-primary-50 text-primary-600 font-medium" : "text-gray-700 hover:bg-gray-100")}>
                    <div className="sidebar-icon w-6 h-6 flex items-center justify-center">
                      <Icon size={18} />
                    </div>
                    <span>{item.label}</span>
                  </button>;
          })}
            </div>}
        </nav>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button className="w-full flex items-center justify-center space-x-2 p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors">
            <LogOut size={18} />
            <span>Sair</span>
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        {/* Botão Escola suspenso - apenas para plano grupo-escolar */}
        {canAccessSchool() && <div className="absolute -top-12 left-4">
            <button onClick={() => handleItemClick('school')} className="flex items-center justify-center space-x-1 bg-green-500 text-white rounded-lg shadow-lg hover:bg-green-600 transition-colors px-3 py-2">
              <School size={16} />
              <span className="text-sm font-medium">Escola</span>
            </button>
          </div>}
        
        <div className="flex items-center justify-around px-2 py-2">
          {mobileMenuItems.map(item => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          const isCenter = item.isCenter;
          if (isCenter) {
            return <button key={item.id} onClick={() => handleItemClick(item.id)} className="relative flex flex-col items-center justify-center w-14 h-14 -mt-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg transform transition-transform hover:scale-105">
                  <Icon size={24} className="text-white" />
                  <span className="text-xs text-white font-medium mt-1">{item.label}</span>
                </button>;
          }
          return <button key={item.id} onClick={() => handleItemClick(item.id)} className={cn("flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors min-w-0 flex-1", isActive ? "text-primary-600" : "text-gray-500 hover:text-gray-700")}>
                <Icon size={20} />
                <span className="text-xs font-medium mt-1 truncate">{item.label}</span>
              </button>;
        })}
        </div>
      </div>
    </>;
};

export default Sidebar;
