
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, FileText, Plus, Calendar, Settings, HelpCircle, LogOut, Crown, School, User, BookOpen, Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePlanPermissions } from '@/hooks/usePlanPermissions';
import { Button } from '@/components/ui/button';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { canAccessSchool, canAccessSettings, canAccessCalendarPage } = usePlanPermissions();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', icon: Home, path: '/dashboard', show: true },
    { name: 'Meus Materiais', icon: FileText, path: '/dashboard/materiais', show: true },
    { name: 'Criar Material', icon: Plus, path: '/dashboard/criar', show: true },
    { name: 'Calendário', icon: Calendar, path: '/dashboard/agenda', show: canAccessCalendarPage() },
    { name: 'Grupo Escolar', icon: School, path: '/dashboard/escola', show: canAccessSchool() },
    { name: 'Perfil', icon: User, path: '/dashboard/perfil', show: true },
    { name: 'Assinatura', icon: Crown, path: '/dashboard/assinatura', show: true },
    { name: 'Configurações', icon: Settings, path: '/dashboard/configuracoes', show: canAccessSettings() },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const closeMobileMenu = () => {
    setIsMobileOpen(false);
  };

  // Fechar menu mobile quando a rota mudar
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="bg-white shadow-md"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <Link to="/dashboard" className="flex items-center space-x-3" onClick={closeMobileMenu}>
              <div className="bg-primary-500 text-white p-2 rounded-lg">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <span className="logo-text text-xl text-primary-600 font-bold">AulagIA</span>
                <p className="text-xs text-gray-400 -mt-1">Sua aula com toque mágico</p>
              </div>
            </Link>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 px-4 py-6">
            <ul className="space-y-2">
              {menuItems.filter(item => item.show).map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.name}>
                    <Link
                      to={item.path}
                      onClick={closeMobileMenu}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                        isActive
                          ? 'bg-primary-100 text-primary-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-gray-200">
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-600 hover:text-gray-900"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('openFeedbackModal'));
                  closeMobileMenu();
                }}
              >
                <HelpCircle className="w-5 h-5 mr-3" />
                Ajuda & Feedback
              </Button>
              
              {user && (
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => {
                    handleSignOut();
                    closeMobileMenu();
                  }}
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Sair
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
