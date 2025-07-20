import React, { useState, useEffect } from 'react';
import { Bell, Settings, User, LogOut, Crown, BookOpen, HelpCircle, Check, Clock, Users } from 'lucide-react';
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
  const {
    user,
    signOut
  } = useAuth();
  const {
    currentPlan
  } = usePlanPermissions();
  const [userName, setUserName] = useState('');
  const [userPhoto, setUserPhoto] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const loadUserData = async () => {
    if (!user?.id) return;
    try {
      console.log('Loading user data for:', user.id);
      
      // Buscar dados do perfil do usuário na tabela perfis
      const { data: profile, error } = await supabase
        .from('perfis')
        .select('nome_preferido, avatar_url, plano_ativo')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error loading user profile:', error);
        // Fallback para dados básicos do usuário
        const fallbackName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário';
        setUserName(fallbackName);
        setUserPhoto('');
        return;
      }

      console.log('User profile loaded:', profile);

      // Definir nome preferido
      const preferredName = profile?.nome_preferido || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário';
      setUserName(preferredName);
      setUserPhoto(profile?.avatar_url || '');
    } catch (error) {
      console.error('Error loading user data:', error);
      // Fallback para dados básicos do usuário
      setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário');
      setUserPhoto('');
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

    // Listen for profile updates
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
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
        
        <div className="flex items-center space-x-3">
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
              <div className="px-4 py-3 border-b bg-gradient-to-r from-slate-50 to-white">
                <h3 className="font-bold text-slate-900 text-base">Notificações</h3>
                <p className="text-xs text-slate-500 mt-1">{notifications.length} notificação{notifications.length !== 1 ? 's' : ''}</p>
              </div>
              {notifications.length === 0 && (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">Nenhuma notificação</p>
                  <p className="text-xs text-muted-foreground mt-1">Você está em dia!</p>
                </div>
              )}
              {notifications.map(n => (
                <DropdownMenuItem
                  key={n.id}
                  className={`p-0 ${!(n.lida_por||[]).includes(user?.id) ? 'bg-blue-50' : ''}`}
                  onClick={() => handleNotificationClick(n)}
                >
                  <div className={`w-full group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-200 ${
                    !(n.lida_por||[]).includes(user?.id) 
                      ? 'ring-2 ring-blue-100 border-blue-200 bg-gradient-to-r from-blue-50 to-white' 
                      : 'hover:border-slate-300'
                  }`}>
                    {/* Status indicator */}
                    {!(n.lida_por||[]).includes(user?.id) && (
                      <div className="absolute top-3 right-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      </div>
                    )}

                    <div className="p-4">
                      {/* Header with icon and title */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                          !(n.lida_por||[]).includes(user?.id) 
                            ? 'bg-blue-100 text-blue-600' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {n.icon ? (
                            <span className="text-lg">{n.icon}</span>
                          ) : (
                            <Check className="w-5 h-5" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-slate-900 text-sm leading-tight mb-1">
                            {n.titulo}
                          </h4>
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {n.mensagem}
                          </p>
                        </div>
                      </div>

                      {/* Image banner */}
                      {n.image_url && (
                        <div className="mb-3">
                          <div className="aspect-[16/9] w-full overflow-hidden rounded-lg bg-slate-100 max-h-32">
                            <img 
                              src={n.image_url} 
                              alt="Imagem da notificação"
                              className="w-full h-full object-cover object-center"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Footer with metadata */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>
                              {n.data_envio ? new Date(n.data_envio).toLocaleString('pt-BR') : ''}
                            </span>
                          </div>
                          
                          {n.lida_por && (
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span>{n.lida_por.length} lida{n.lida_por.length !== 1 ? 's' : ''}</span>
                            </div>
                          )}
                        </div>

                        {/* Status badge */}
                        <Badge 
                          variant={!(n.lida_por||[]).includes(user?.id) ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {!(n.lida_por||[]).includes(user?.id) ? 'Nova' : 'Lida'}
                        </Badge>
                      </div>
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
    </header>;
};
export default Header;
