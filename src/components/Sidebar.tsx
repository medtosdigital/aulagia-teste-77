import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Plus, BookOpen, Calendar, Crown, Settings, Key, FileText, LogOut, User, School, Sliders, MessageCircle, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabasePlanPermissions } from '@/hooks/useSupabasePlanPermissions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { useFeedback } from '@/hooks/useFeedback';

interface SidebarProps {
  activeItem?: string;
  onItemClick?: (item: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeItem = 'dashboard',
  onItemClick
}) => {
  const { user } = useAuth();
  const { canAccessSchool, canAccessSettings, currentPlan } = useSupabasePlanPermissions();
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [userProfile, setUserProfile] = useState({
    name: 'Professor(a)',
    photo: ''
  });
  const [refreshCount, setRefreshCount] = useState(0);

  const loadUserProfile = async () => {
    if (!user?.id) return;

    try {
      // Buscar dados do perfil do usuário
      const { data: profile } = await supabase
        .from('perfis')
        .select('nome_preferido')
        .eq('user_id', user.id)
        .single();

      // Buscar avatar do usuário
      const { data: userProfileData } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single();

      // Definir nome preferido
      const preferredName = profile?.nome_preferido || 
                           user.user_metadata?.full_name || 
                           user.email?.split('@')[0] || 
                           'Professor(a)';
      
      setUserProfile({
        name: preferredName,
        photo: userProfileData?.avatar_url || ''
      });

    } catch (error) {
      console.error('Error loading user profile:', error);
      // Fallback para dados básicos do usuário
      setUserProfile({
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Professor(a)',
        photo: ''
      });
    }
  };

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  useEffect(() => {
    // Listener personalizado para mudanças no perfil
    const handleProfileUpdate = () => {
      if (user) {
        loadUserProfile();
      }
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [user]);

  useEffect(() => {
    const checkOwner = async () => {
      if (!user?.id) {
        setIsOwner(false);
        return;
      }
      const { data: grupo } = await supabase
        .from('grupos_escolares')
        .select('id')
        .eq('owner_id', user.id)
        .single();
      setIsOwner(!!grupo);
    };
    checkOwner();
  }, [user]);

  // Forçar re-render ao receber evento global de mudança de plano
  useEffect(() => {
    const handlePlanChanged = () => {
      setRefreshCount((prev) => prev + 1);
    };
    window.addEventListener('planChanged', handlePlanChanged);
    return () => {
      window.removeEventListener('planChanged', handlePlanChanged);
    };
  }, []);

  const isMobile = useIsMobile();
  const { submitFeedback, getUserFeedbacks, loading } = useFeedback(currentPlan?.plano_ativo || 'gratuito', false);

  // Simplificados - apenas verificar se usuário está logado
  const mobileMenuItems = [{
    id: 'dashboard',
    label: 'Início',
    icon: LayoutDashboard
  },
  // Materiais - para todos os usuários logados
  ...(user ? [{
    id: 'lessons',
    label: 'Materiais',
    icon: BookOpen
  }] : []),
  // Criar - para todos os usuários logados
  ...(user ? [{
    id: 'create',
    label: 'Criar',
    icon: Plus,
    isCenter: true
  }] : []),
  // Calendário - para todos os usuários logados
  ...(user ? [{
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
  // Criar - para todos os usuários logados
  ...(user ? [{
    id: 'create',
    label: 'Criar Material',
    icon: Plus
  }] : []),
  // Materiais - para todos os usuários logados
  ...(user ? [{
    id: 'lessons',
    label: 'Meus Materiais',
    icon: BookOpen
  }] : []),
  // Calendário - para todos os usuários logados
  ...(user ? [{
    id: 'calendar',
    label: 'Calendário',
    icon: Calendar
  }] : []),
  // Escola - apenas para usuários autenticados com plano grupo escolar
  ...(canAccessSchool() ? [{
    id: 'school',
    label: 'Escola',
    icon: School
  }] : []), {
    id: 'profile',
    label: 'Perfil',
    icon: User
  }, {
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
    id: 'users',
    label: 'Usuários',
    icon: Users
  }] : [])];
  
  const handleItemClick = (itemId: string) => {
    // Navegação direta pelas rotas principais
    const path = idToPath[itemId];
    if (path) {
      navigate(path);
    }
    if (onItemClick) onItemClick(itemId);
  };
  
  const getPlanDisplayName = () => {
    if (!currentPlan) return 'Plano Gratuito';
    if (currentPlan.plano_ativo === 'admin' || currentPlan.id === 'admin') return 'Plano Administrador';
    switch (currentPlan.plano_ativo) {
      case 'gratuito':
        return 'Plano Gratuito';
      case 'professor':
        return 'Plano Professor';
      case 'grupo_escolar':
        return 'Grupo Escolar';
      default:
        return 'Plano Gratuito';
    }
  };
  
  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };
  
  // Mapear id para path
  const idToPath: Record<string, string> = {
    dashboard: '/',
    lessons: '/materiais',
    create: '/criar',
    calendar: '/agenda',
    school: '/escola',
    profile: '/perfil',
    subscription: '/assinatura',
    settings: '/configuracoes',
    users: '/admin/usuarios',
    'admin/configuracoes': '/admin/configuracoes',
    'admin/usuarios': '/admin/usuarios',
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
        
        {/* User Info - Atualizado */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10 border-2 border-primary-200">
              {userProfile.photo && (
                <AvatarImage 
                  src={userProfile.photo} 
                  alt={userProfile.name}
                  className="object-cover"
                />
              )}
              <AvatarFallback className="bg-primary-100 text-primary-600 font-semibold">
                {userProfile.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{userProfile.name}</p>
              <p className="text-xs text-gray-500">{getPlanDisplayName()}</p>
            </div>
          </div>
        </div>
        
        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {desktopMenuItems.map(item => {
            const Icon = item.icon;
            let isActive = false;
            const path = idToPath[item.id];
            if (path) {
              if (path === '/') {
                isActive = location.pathname === '/';
              } else {
                isActive = location.pathname.startsWith(path);
              }
            }
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
                let isActive = false;
                const path = idToPath[item.id];
                if (path) {
                  isActive = location.pathname.startsWith(path);
                }
                return <button key={item.id} onClick={() => handleItemClick(item.id)} className={cn("sidebar-item flex items-center space-x-3 p-3 rounded-lg w-full text-left transition-colors", isActive ? "bg-primary-50 text-primary-600 font-medium" : "text-gray-700 hover:bg-gray-100")}>
                  <div className="sidebar-icon w-6 h-6 flex items-center justify-center">
                    <Icon size={18} />
                  </div>
                  <span>{item.label}</span>
                </button>;
              })}
            </div>}
        </nav>
        
        {/* Botão de Feedback chamativo (desktop) */}
        <div className="px-4 pb-2">
          <button
            onClick={() => window.dispatchEvent(new Event('openFeedbackModal'))}
            className="w-full flex items-center justify-center space-x-2 p-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow-md hover:scale-105 transition-all mb-2"
            style={{ fontSize: 16 }}
          >
            <MessageCircle size={20} className="mr-2" />
            <span>Deixe sua opinião</span>
          </button>
        </div>
        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button onClick={handleLogout} className="w-full flex items-center justify-center space-x-2 p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors">
            <LogOut size={18} />
            <span>Sair</span>
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        {/* Botão Escola suspenso - apenas para plano grupo-escolar */}
        {canAccessSchool() && <div className="absolute -top-10 right-4">
            <button onClick={() => handleItemClick('school')} className="flex items-center justify-center bg-green-500 text-white rounded-lg shadow-lg hover:bg-green-600 transition-colors px-[11px] py-[6px]">
              <School size={14} />
              <span className="text-xs font-medium ml-1">Escola</span>
            </button>
          </div>}
        
        <div className="flex items-center justify-around px-2 py-2">
          {mobileMenuItems.map(item => {
            const Icon = item.icon;
            let isActive = false;
            const path = idToPath[item.id];
            if (path) {
              if (path === '/') {
                isActive = location.pathname === '/';
              } else {
                isActive = location.pathname.startsWith(path);
              }
            }
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
      {/* Botão flutuante de feedback no mobile */}
      {isMobile && (
        <button
          onClick={() => window.dispatchEvent(new Event('openFeedbackModal'))}
          className={`fixed z-50 right-4 bottom-6 md:hidden flex items-center px-4 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow-lg hover:scale-105 transition-all`}
          style={{ fontSize: 16 }}
        >
          <MessageCircle size={22} className="mr-2" />
          <span>Opinião</span>
        </button>
      )}
    </>;
};

export default Sidebar;
