
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNotifications } from '@/hooks/useNotifications';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface NotificationListProps {
  onNotificationClick?: () => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({ 
  onNotificationClick 
}) => {
  const { notifications, loading, markAsRead } = useNotifications();

  const handleMarkAsRead = async (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    await markAsRead(notificationId);
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mx-auto"></div>
        <p className="mt-2 text-sm text-muted-foreground">Carregando notificações...</p>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-muted-foreground">Nenhuma notificação</p>
      </div>
    );
  }

  return (
    <div className="max-h-96">
      <div className="p-3 border-b">
        <h3 className="font-semibold">Notificações</h3>
      </div>
      <ScrollArea className="max-h-80">
        <div className="space-y-3 p-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${
                !notification.lida_por?.includes(notification.criada_por || '') 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'bg-background'
              }`}
              onClick={onNotificationClick}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {notification.icon && (
                      <span className="text-lg">{notification.icon}</span>
                    )}
                    <h4 className="font-medium text-sm truncate">
                      {notification.titulo}
                    </h4>
                    {!notification.lida_por?.includes(notification.criada_por || '') && (
                      <Badge variant="secondary" className="text-xs">Nova</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {notification.mensagem}
                  </p>
                  {notification.image_url && (
                    <div className="relative w-full mb-2">
                      <div className="aspect-[16/9] w-full overflow-hidden rounded-lg bg-muted">
                        <img 
                          src={notification.image_url} 
                          alt="Imagem da notificação"
                          className="w-full h-full object-cover object-center"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement?.classList.add('bg-gradient-to-br', 'from-blue-100', 'to-indigo-100');
                            e.currentTarget.parentElement?.innerHTML = `
                              <div class="flex items-center justify-center h-full">
                                <div class="text-center text-muted-foreground">
                                  <div class="text-2xl mb-1">📷</div>
                                  <div class="text-xs">Imagem não disponível</div>
                                </div>
                              </div>
                            `;
                          }}
                        />
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.data_envio || ''), {
                      addSuffix: true,
                      locale: ptBR
                    })}
                  </p>
                </div>
                {!notification.lida_por?.includes(notification.criada_por || '') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleMarkAsRead(notification.id, e)}
                    className="shrink-0"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
