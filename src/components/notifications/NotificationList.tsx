
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNotifications } from '@/hooks/useNotifications';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Clock, Users } from 'lucide-react';

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
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-3 text-sm text-muted-foreground">Carregando notificações...</p>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground font-medium">Nenhuma notificação</p>
        <p className="text-xs text-muted-foreground mt-1">Você está em dia!</p>
      </div>
    );
  }

  return (
    <div className="max-h-96">
      <div className="px-4 py-3 border-b bg-gradient-to-r from-slate-50 to-white">
        <h3 className="font-bold text-slate-900 text-base">Notificações</h3>
        <p className="text-xs text-slate-500 mt-1">{notifications.length} notificação{notifications.length !== 1 ? 's' : ''}</p>
      </div>
      <ScrollArea className="max-h-80">
        <div className="p-3 space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${
                !notification.lida_por?.includes(notification.criada_por || '') 
                  ? 'ring-2 ring-blue-100 border-blue-200 bg-gradient-to-r from-blue-50 to-white' 
                  : 'hover:border-slate-300'
              }`}
              onClick={onNotificationClick}
            >
              {/* Status indicator */}
              {!notification.lida_por?.includes(notification.criada_por || '') && (
                <div className="absolute top-3 right-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                </div>
              )}

              <div className="p-4">
                {/* Header with icon and title */}
                <div className="flex items-start gap-3 mb-3">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                    !notification.lida_por?.includes(notification.criada_por || '') 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {notification.icon ? (
                      <span className="text-lg">{notification.icon}</span>
                    ) : (
                      <Check className="w-5 h-5" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-900 text-sm leading-tight mb-1">
                      {notification.titulo}
                    </h4>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {notification.mensagem}
                    </p>
                  </div>
                </div>

                {/* Image banner */}
                {notification.image_url && (
                  <div className="mb-3">
                    <div className="aspect-[16/9] w-full overflow-hidden rounded-lg bg-slate-100 max-h-32">
                      <img 
                        src={notification.image_url} 
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
                        {formatDistanceToNow(new Date(notification.data_envio || ''), {
                          addSuffix: true,
                          locale: ptBR
                        })}
                      </span>
                    </div>
                    
                    {notification.lida_por && (
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{notification.lida_por.length} lida{notification.lida_por.length !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    {!notification.lida_por?.includes(notification.criada_por || '') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleMarkAsRead(notification.id, e)}
                        className="h-7 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Marcar
                      </Button>
                    )}
                    
                    <Badge 
                      variant={!notification.lida_por?.includes(notification.criada_por || '') ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {!notification.lida_por?.includes(notification.criada_por || '') ? 'Nova' : 'Lida'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
