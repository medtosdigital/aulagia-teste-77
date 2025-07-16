
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Plus, Bell, Code, Users, Settings, BarChart3 } from 'lucide-react';

interface AdminQuickActionsProps {
  onCreateNotification: () => void;
  onManageTemplates: () => void;
  onViewUsers: () => void;
}

export default function AdminQuickActions({ 
  onCreateNotification, 
  onManageTemplates, 
  onViewUsers 
}: AdminQuickActionsProps) {
  const actions = [
    {
      title: 'Nova Notificação',
      description: 'Enviar notificação para usuários',
      icon: Bell,
      color: 'from-blue-500 to-blue-600',
      onClick: onCreateNotification
    },
    {
      title: 'Templates',
      description: 'Gerenciar templates do sistema',
      icon: Code,
      color: 'from-purple-500 to-purple-600',
      onClick: onManageTemplates
    },
    {
      title: 'Usuários',
      description: 'Gerenciar usuários da plataforma',
      icon: Users,
      color: 'from-green-500 to-green-600',
      onClick: onViewUsers
    }
  ];

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg">Ações Rápidas</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4">
          {actions.map((action) => (
            <Button
              key={action.title}
              variant="outline"
              className="h-auto p-4 justify-start hover:shadow-md transition-all"
              onClick={action.onClick}
            >
              <div className={`p-2 rounded-lg bg-gradient-to-r ${action.color} mr-4`}>
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="font-semibold">{action.title}</div>
                <div className="text-sm text-muted-foreground">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
