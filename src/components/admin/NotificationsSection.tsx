
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Bell, Plus, Search, Filter, Trash2, Users, TrendingUp, Eye } from 'lucide-react';
import { notificationService } from '@/services/notificationService';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import NotificationCard from './NotificationCard';
import CreateNotificationModal from './CreateNotificationModal';
import NotificationDetailsModal from './NotificationDetailsModal';

export default function NotificationsSection() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [userProfiles, setUserProfiles] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [savingNotification, setSavingNotification] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchNotifications();
    fetchUserProfiles();
  }, []);

  const fetchNotifications = async () => {
    try {
      // Para o admin, buscar todas as notificações (ativas e inativas)
      const { data, error } = await supabase
        .from('notificacoes')
        .select('*')
        .order('data_envio', { ascending: false });
      
      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfiles = async () => {
    try {
      console.log('Carregando perfis de usuários...');
      
      const { data: profiles, error } = await supabase
        .from('perfis')
        .select('user_id, full_name, email');
      
      if (error) {
        console.error('Erro ao buscar perfis:', error);
        return;
      }
      
      if (profiles) {
        const profileMap: Record<string, string> = {};
        profiles.forEach((profile: any) => {
          profileMap[profile.user_id] = profile.full_name || profile.email || profile.user_id;
        });
        setUserProfiles(profileMap);
        console.log('Perfis carregados:', profiles.length);
      }
    } catch (error) {
      console.error('Erro ao buscar perfis:', error);
    }
  };

  const handleCreateNotification = async (title: string, message: string, icon?: string, imageUrl?: string) => {
    if (!user?.id) return;
    
    setSavingNotification(true);
    try {
      await notificationService.createNotification(title, message, user.id, icon, imageUrl);
      await fetchNotifications();
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
    } finally {
      setSavingNotification(false);
    }
  };

  const handleUpdateNotification = async (id: string, updates: any) => {
    setSavingNotification(true);
    try {
      await notificationService.updateNotification(id, updates);
      await fetchNotifications();
    } catch (error) {
      console.error('Erro ao atualizar notificação:', error);
    } finally {
      setSavingNotification(false);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      await fetchNotifications();
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
    }
  };

  const handleViewNotification = (notification: any) => {
    setSelectedNotification(notification);
    setDetailsModalOpen(true);
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.mensagem.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && notification.ativa) ||
                         (filterStatus === 'inactive' && !notification.ativa);
    
    return matchesSearch && matchesFilter;
  });

  const totalNotifications = notifications.length;
  const activeNotifications = notifications.filter(n => n.ativa).length;
  const totalReads = notifications.reduce((sum, n) => sum + (n.lida_por?.length || 0), 0);
  const averageReadRate = totalNotifications > 0 ? (totalReads / totalNotifications / Object.keys(userProfiles).length * 100) : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Bell className="w-6 h-6 text-primary" />
            </div>
            Notificações
          </h2>
          <p className="text-muted-foreground">
            Crie e gerencie notificações para todos os usuários da plataforma.
          </p>
        </div>
        <Button
          onClick={() => setCreateModalOpen(true)}
          className="min-w-[160px] h-11"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Notificação
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{totalNotifications}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ativas</p>
                <p className="text-2xl font-bold text-green-600">{activeNotifications}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Eye className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Leituras</p>
                <p className="text-2xl font-bold text-blue-600">{totalReads}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Leitura</p>
                <p className="text-2xl font-bold text-purple-600">{averageReadRate.toFixed(1)}%</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por título ou mensagem..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                Todas
              </Button>
              <Button
                variant={filterStatus === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('active')}
              >
                Ativas
              </Button>
              <Button
                variant={filterStatus === 'inactive' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('inactive')}
              >
                Inativas
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="p-4 bg-muted/50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Bell className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Nenhuma notificação encontrada</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Comece criando sua primeira notificação.'
                }
              </p>
              {!searchTerm && filterStatus === 'all' && (
                <Button onClick={() => setCreateModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeira Notificação
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              userProfiles={userProfiles}
              onView={handleViewNotification}
              onEdit={handleViewNotification}
              onDelete={(notif) => (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-8 px-3 hover:bg-red-100 hover:text-red-600 text-red-600 border border-red-200"
                      title="Excluir notificação"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Excluir
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir Notificação</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir a notificação "{notif.titulo}"? Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteNotification(notif.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            />
          ))
        )}
      </div>

      {/* Modals */}
      <CreateNotificationModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSave={handleCreateNotification}
        saving={savingNotification}
      />

      <NotificationDetailsModal
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
        notification={selectedNotification}
        userProfiles={userProfiles}
        onSave={handleUpdateNotification}
        saving={savingNotification}
      />
    </div>
  );
}
