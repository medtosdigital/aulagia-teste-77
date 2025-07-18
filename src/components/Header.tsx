import React, { useState, useEffect } from 'react';
import { Bell, Settings, User, LogOut, Crown, BookOpen, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { usePlanPermissions } from '@/hooks/usePlanPermissions';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { notificationService, Notification } from '@/services/notificationService';
interface HeaderProps {
  title: string;
}
const Header: React.FC<HeaderProps> = ({
  title
}) => {
  const { user, signOut } = useAuth();
  const { currentPlan } = usePlanPermissions();
  const [userData, setUserData] = useState<{ name: string; photo: string | null } | null>(null);
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState('');
  const [userPhoto, setUserPhoto] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const loadUserData = async () => {
    if (!user?.id) return;
    try {
      // Buscar dados do perfil do usuário
      const {
        data: profile
      } = await supabase.from('perfis').select('nome_preferido, full_name, avatar_url, plano_ativo').eq('user_id', user.id).single();

      // Definir nome preferido
      const preferredName = profile?.nome_preferido || profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário';
      setUserName(preferredName);
      setUserPhoto(profile?.avatar_url || '');
    } catch (error) {
      console.error('Error loading user data:', error);
      // Fallback para dados básicos do usuário
      setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário');
    }
  };
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);
  
  useEffect(() => {
    // Listen for profile updates
    const handleProfileUpdate = () => {
      if (user) {
        loadUserData();
      }
    };

    // Listen for plan updates
    const handlePlanUpdate = () => {
      if (user) {
        loadUserData();
      }
    };

    // Listen for profile updates
    window.addEventListener('profileUpdated', handleProfileUpdate);
    window.addEventListener('planChanged', handlePlanUpdate);
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
      window.removeEventListener('planChanged', handlePlanUpdate);
    };
  }, [user]);

  // Force refresh when plan changes
  useEffect(() => {
    const handlePlanChange = () => {
      console.log('Header: Evento planChanged recebido, recarregando dados...');
      if (user) {
        loadUserData();
      }
    };

    window.addEventListener('planChanged', handlePlanChange);
    return () => {
      window.removeEventListener('planChanged', handlePlanChange);
    };
  }, [user]);

  // Buscar notificações ativas e calcular não lidas
  useEffect(() => {
    async function fetchNotifications() {
      if (!user?.id) return;
      const notifs = await notificationService.getActiveNotifications();
      setNotifications(notifs);
      const unread = notifs.filter(n => !(n.lida_por || []).includes(user.id)).length;
      setUnreadCount(unread);
    }
    fetchNotifications();
  }, [user]);

  // Remover marcação em massa ao abrir o sino
  const handleDropdownOpenChange = (open: boolean) => {
    setDropdownOpen(open);
  };

  // Handler para marcar notificação como lida ao clicar
  const handleNotificationClick = async (notif: Notification) => {
    if (!user?.id) return;
    if (!(notif.lida_por || []).includes(user.id)) {
      await notificationService.markAsRead(notif.id, user.id);
      // Atualizar lista
      const notifs = await notificationService.getActiveNotifications();
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !(n.lida_por || []).includes(user.id)).length);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };
  const getPlanColor = () => {
    switch (currentPlan.id) {
      case 'professor':
        return 'bg-blue-500 text-white';
      case 'grupo_escolar':
      case 'grupo-escolar':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };
  const getPlanDisplayName = () => {
    switch (currentPlan.id) {
      case 'admin':
        return 'Administrador';
      case 'gratuito':
        return 'Gratuito';
      case 'professor':
        return 'Professor';
      case 'grupo_escolar':
      case 'grupo-escolar':
        return 'Grupo Escolar';
      default:
        return 'Gratuito';
    }
  };
  return <header className="bg-white border-b border-gray-200 px-4 py-3 md:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Mobile: logo, Desktop: título */}
          <div className="block md:hidden">
            <div className="flex items-center space-x-2">
              <div className="bg-primary-500 text-white p-3 rounded-lg">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <span className="logo-text text-2xl text-primary-600 leading-tight" style={{fontWeight: 400}}>AulagIA</span>
                <p className="text-xs text-gray-500 -mt-1">Sua aula com toque mágico</p>
              </div>
            </div>
          </div>
          <h1 className="hidden md:block text-xl md:text-2xl font-bold text-gray-900">{title}</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {/* Notificações push */}
            <DropdownMenu open={dropdownOpen} onOpenChange={handleDropdownOpenChange}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className={`relative md:inline-flex ${(unreadCount > 0 && !dropdownOpen) ? 'bg-pink-100 animate-pulse ring-2 ring-pink-400/60' : ''}`}>
                  <Bell className={`w-5 h-5 ${(unreadCount > 0 && !dropdownOpen) ? 'text-pink-500' : ''}`} />
                  {unreadCount > 0 && !dropdownOpen && (
                    <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold shadow animate-bounce">{unreadCount}</span>
                  )}
                  {unreadCount > 0 && dropdownOpen && (
                    <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold shadow">{unreadCount}</span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
                <div className="px-3 py-2 border-b font-semibold text-blue-700">Notificações</div>
                {notifications.length === 0 && (
                  <div className="px-4 py-6 text-center text-gray-400">Nenhuma notificação</div>
                )}
                {notifications.map(n => (
                  <DropdownMenuItem
                    key={n.id}
                    className={`flex flex-col items-start gap-1 ${!(n.lida_por||[]).includes(user?.id) ? 'bg-blue-50' : ''}`}
                    onClick={() => handleNotificationClick(n)}
                  >
                    {n.image_url && (
                      <Avatar className="w-20 h-20 mb-2 mx-auto"><AvatarImage src={n.image_url} /><AvatarFallback>IMG</AvatarFallback></Avatar>
                    )}
                    <div className="flex items-center w-full">
                      {n.icon && <span className="text-2xl mr-2">{n.icon}</span>}
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{n.titulo}</div>
                        <div className="text-xs text-gray-600">{n.mensagem}</div>
                        <div className="text-[10px] text-gray-400 mt-1">{n.data_envio ? new Date(n.data_envio).toLocaleString('pt-BR') : ''}</div>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {/* Botão de feedback */}
            {/* User Menu - só mobile, apenas avatar */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 px-2 md:hidden">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={userPhoto} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-white text-sm">
                      {userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 md:hidden">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{userName}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => window.dispatchEvent(new CustomEvent('navigateToProfile'))}>
                  <User className="w-4 h-4 mr-2" />
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>;
};
export default Header;
