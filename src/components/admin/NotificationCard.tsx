
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Eye, Edit, Trash2, Users, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NotificationCardProps {
  notification: any;
  userProfiles: Record<string, string>;
  onView: (notification: any) => void;
  onEdit: (notification: any) => void;
  onDelete: (notification: any) => void;
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
    <Card className="group hover:shadow-md transition-all duration-200 border-l-4 border-l-primary/20 hover:border-l-primary">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            {notification.icon && (
              <div className="flex-shrink-0 text-2xl">
                {notification.icon}
              </div>
            )}
            {notification.image_url && (
              <Avatar className="w-10 h-10 flex-shrink-0">
                <AvatarImage src={notification.image_url} />
                <AvatarFallback>IMG</AvatarFallback>
              </Avatar>
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
          
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onView(notification)}
              className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(notification)}
              className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(notification)}
              className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
