
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Users, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NotificationCardProps {
  notification: any;
  userProfiles: Record<string, string>;
  onView: (notification: any) => void;
  onEdit: (notification: any) => void;
  onDelete: (notification: any) => React.ReactNode;
}

export default function NotificationCard({ 
  notification, 
  userProfiles, 
  onView, 
  onEdit, 
  onDelete 
}: NotificationCardProps) {
  const lidas = (notification.lida_por || []).length;
  const totalUsers = Object.keys(userProfiles).length;
  const naoLidas = totalUsers - lidas;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return format(new Date(dateStr), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  return (
    <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-l-primary/20 hover:border-l-primary">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            {notification.icon && (
              <div className="flex-shrink-0 text-2xl">
                {notification.icon}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-foreground truncate cursor-pointer hover:text-primary transition-colors" 
                    onClick={() => onView(notification)}>
                  {notification.titulo}
                </h3>
                <Badge variant={notification.ativa ? "default" : "secondary"} className="shrink-0">
                  {notification.ativa ? "Ativa" : "Inativa"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {notification.mensagem}
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(notification.data_envio || notification.created_at)}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span className="text-green-600 font-medium">{lidas} lidas</span>
                  </div>
                  <div className="w-1 h-1 bg-muted-foreground/50 rounded-full"></div>
                  <span className="text-orange-600 font-medium">{naoLidas} não lidas</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onView(notification)}
              className="h-8 px-3 hover:bg-primary/10 hover:text-primary text-sm"
              title="Visualizar detalhes"
            >
              Visualizar
            </Button>
            {onDelete(notification)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
