
import { useState, useEffect } from 'react';
import { notificationService, type Notification } from '@/services/notificationService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const loadNotifications = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await notificationService.getActiveNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as notificações.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!user) return;

    try {
      await notificationService.markAsRead(notificationId, user.id);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, lida_por: [...(notif.lida_por || []), user.id] }
            : notif
        )
      );
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      toast({
        title: "Erro",
        description: "Não foi possível marcar a notificação como lida.",
        variant: "destructive"
      });
    }
  };

  const getUnreadNotifications = () => {
    if (!user) return [];
    return notifications.filter(notif => 
      !notif.lida_por?.includes(user.id)
    );
  };

  useEffect(() => {
    loadNotifications();
  }, [user]);

  return {
    notifications,
    loading,
    markAsRead,
    getUnreadNotifications,
    refreshNotifications: loadNotifications
  };
};
