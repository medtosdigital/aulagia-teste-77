import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePlanPermissions } from '@/hooks/usePlanPermissions';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Home,
  BookOpen,
  FileText,
  Calendar,
  Users,
  Settings,
  Bell,
  Webhook
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { user, signOut } = useAuth();
  const { currentPlan, loading: planLoading } = usePlanPermissions();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const permissions = usePlanPermissions();

  const menuItems = [
    {
      title: 'Geral',
      items: [
        {
          title: 'Dashboard',
          href: '/',
          icon: Home,
          description: 'Visão geral da sua conta'
        },
        {
          title: 'Meus Materiais',
          href: '/materials',
          icon: BookOpen,
          description: 'Gerenciar seus materiais'
        },
        {
          title: 'Criar Material',
          href: '/create-material',
          icon: FileText,
          description: 'Criar novos materiais'
        },
        {
          title: 'Calendário',
          href: '/calendar',
          icon: Calendar,
          description: 'Gerenciar seu calendário'
        },
        {
          title: 'Grupo Escolar',
          href: '/school',
          icon: Users,
          description: 'Gerenciar seu grupo escolar',
          condition: currentPlan?.id === 'grupo_escolar'
        }
      ]
    },
    {
      title: 'Configurações',
      items: [
        {
          title: 'Configurações',
          href: '/settings',
          icon: Settings,
          description: 'Configurações da sua conta'
        }
      ]
    },

    // Admin section
    ...(permissions.canAccessSettings() ? [
      {
        title: 'Administração',
        items: [
          {
            title: 'Logs de Webhook',
            href: '/admin/webhooks',
            icon: Webhook,
            description: 'Monitorar eventos de webhook'
          },
          {
            title: 'Usuários',
            href: '/admin/users',
            icon: Users,
            description: 'Gerenciar usuários'
          },
          {
            title: 'Notificações',
            href: '/admin/notifications',
            icon: Bell,
            description: 'Gerenciar notificações'
          }
        ]
      }
    ] : [])
  ];

  return (
    <>
      {/* Sidebar para telas grandes */}
      <aside className="fixed left-0 top-0 z-50 hidden h-full w-64 flex-col border-r bg-secondary lg:flex">
        <div className="flex h-20 items-center justify-center border-b">
          <Link to="/" className="font-bold text-2xl">
            Medtos
          </Link>
        </div>
        <div className="flex-grow overflow-y-auto scrollbar-hide px-3 py-4">
          {menuItems.map((section, index) => (
            <div key={index} className="mb-6">
              <h3 className="mb-2 px-2 text-sm font-semibold">{section.title}</h3>
              <ul className="space-y-1">
                {section.items.map((item, i) => (
                  (!item.condition || item.condition) && (
                    <li key={i}>
                      <Link
                        to={item.href}
                        className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground ${isActive(item.href) ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                          }`}
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.title}
                      </Link>
                    </li>
                  )
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex h-20 items-center justify-center border-t p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-full rounded-md">
                <Avatar className="mr-2 h-8 w-8">
                  <AvatarImage src={user?.user_metadata?.avatar_url || ""} alt={user?.user_metadata?.full_name || user?.email || "Profile"} />
                  <AvatarFallback>{user?.user_metadata?.full_name?.substring(0, 2).toUpperCase() || user?.email?.substring(0, 2).toUpperCase() || "PR"}</AvatarFallback>
                </Avatar>
                <span>{user?.user_metadata?.full_name || user?.email}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                Configurações
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Sidebar para telas pequenas */}
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="lg:hidden"
            onClick={toggleMenu}
          >
            <Menu className="h-4 w-4 mr-2" />
            Menu
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64">
          <SheetHeader className="text-left">
            <SheetTitle>Menu</SheetTitle>
            <SheetDescription>
              Navegue pelas opções do sistema.
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-4 mt-4">
            {menuItems.map((section, index) => (
              <div key={index} className="mb-6">
                <h3 className="mb-2 px-2 text-sm font-semibold">{section.title}</h3>
                <ul className="space-y-1">
                  {section.items.map((item, i) => (
                    (!item.condition || item.condition) && (
                      <li key={i}>
                        <Link
                          to={item.href}
                          onClick={closeMenu}
                          className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground ${isActive(item.href) ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                            }`}
                        >
                          <item.icon className="mr-2 h-4 w-4" />
                          {item.title}
                        </Link>
                      </li>
                    )
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex h-20 items-center justify-center border-t p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-full rounded-md">
                  <Avatar className="mr-2 h-8 w-8">
                    <AvatarImage src={user?.user_metadata?.avatar_url || ""} alt={user?.user_metadata?.full_name || user?.email || "Profile"} />
                    <AvatarFallback>{user?.user_metadata?.full_name?.substring(0, 2).toUpperCase() || user?.email?.substring(0, 2).toUpperCase() || "PR"}</AvatarFallback>
                  </Avatar>
                  <span>{user?.user_metadata?.full_name || user?.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => {
                  navigate('/settings');
                  closeMenu();
                }}>
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {
                  handleSignOut();
                  closeMenu();
                }}>
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default Sidebar;
