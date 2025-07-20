
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Users, Clock, Eye, Bell, TrendingUp } from 'lucide-react';
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
  const taxaLeitura = totalUsers > 0 ? Math.round((lidas / totalUsers) * 100) : 0;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return format(new Date(dateStr), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  return (
    <Card className="group relative overflow-hidden border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 rounded-xl">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          {/* Icon container - centered */}
          <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
            notification.ativa 
              ? 'bg-blue-50 text-blue-600 border border-blue-200' 
              : 'bg-slate-50 text-slate-500 border border-slate-200'
          }`}>
            {notification.icon ? (
              <span className="text-xl">{notification.icon}</span>
            ) : (
              <Bell className="w-5 h-5" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 text-base leading-tight mb-1 cursor-pointer hover:text-blue-600 transition-colors" 
                    onClick={() => onView(notification)}>
                  {notification.titulo}
                </h3>
                <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                  {notification.mensagem}
                </p>
              </div>
              
              <Badge 
                variant={notification.ativa ? "default" : "secondary"} 
                className={`shrink-0 font-medium ${
                  notification.ativa 
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {notification.ativa ? "Ativa" : "Inativa"}
              </Badge>
            </div>

            {/* Stats and metadata */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6 text-xs text-slate-500">
                {/* Timestamp */}
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(notification.data_envio || notification.created_at)}</span>
                </div>

                {/* Read stats */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span className="text-green-600 font-semibold">{lidas}</span>
                    <span className="text-slate-500">lidas</span>
                  </div>
                  
                  <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                  
                  <div className="flex items-center gap-1">
                    <span className="text-orange-600 font-semibold">{naoLidas}</span>
                    <span className="text-slate-500">não lidas</span>
                  </div>
                </div>

                {/* Reading rate */}
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span className="text-blue-600 font-semibold">{taxaLeitura}%</span>
                  <span className="text-slate-500">leitura</span>
                </div>
              </div>

              {/* Action buttons - always visible */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onView(notification)}
                  className="h-8 px-3 text-xs font-medium hover:bg-blue-50 hover:text-blue-600"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Visualizar
                </Button>
                
                <div className="w-px h-4 bg-slate-200"></div>
                
                {onDelete(notification)}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
