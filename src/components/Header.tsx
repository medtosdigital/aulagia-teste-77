import React, { useState, useEffect } from 'react';
import { Bell, Settings, User, LogOut, Crown, BookOpen, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { usePlanPermissions } from '@/hooks/usePlanPermissions';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
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
  const loadUserData = async () => {
    if (!user?.id) return;
    try {
      // Buscar dados do perfil do usuário
      const {
        data: profile
      } = await supabase.from('perfis').select('nome_preferido').eq('user_id', user.id).single();

      // Buscar avatar do usuário
      const {
        data: userProfile
      } = await supabase.from('profiles').select('avatar_url').eq('id', user.id).single();

      // Definir nome preferido
      const preferredName = profile?.nome_preferido || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário';
      setUserName(preferredName);
      setUserPhoto(userProfile?.avatar_url || '');
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

    // Listen for profile updates
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [user]);
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
              <div className="bg-primary-500 text-white p-2 rounded-lg">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <span className="logo-text text-xl text-primary-600 font-bold leading-tight">AulagIA</span>
                <p className="text-xs text-gray-400 -mt-1">Sua aula com toque mágico</p>
              </div>
            </div>
          </div>
          <h1 className="hidden md:block text-xl md:text-2xl font-bold text-gray-900">{title}</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Notificações - sempre visível no mobile, oculto em md+ */}
          <Button variant="ghost" size="icon" className="relative md:inline-flex">
            <Bell className="w-5 h-5" />
          </Button>
          {/* Botão de feedback */}
          <Button variant="ghost" size="icon" aria-label="Enviar feedback" onClick={() => window.dispatchEvent(new CustomEvent('openFeedbackModal'))}>
            <HelpCircle className="w-5 h-5 text-primary-500" />
          </Button>
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
