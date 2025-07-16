
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Clock, User } from 'lucide-react';

interface Activity {
  id: string;
  userName: string;
  type: string;
  title: string;
  created_at: string;
}

interface AdminActivityFeedProps {
  activities: Activity[];
  loading: boolean;
}

export default function AdminActivityFeed({ activities, loading }: AdminActivityFeedProps) {
  const getActivityColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'plano-de-aula':
        return 'bg-blue-100 text-blue-700';
      case 'atividade':
        return 'bg-green-100 text-green-700';
      case 'avaliacao':
        return 'bg-purple-100 text-purple-700';
      case 'slides':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg">Atividades Recentes</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse flex items-center gap-4">
                <div className="h-4 bg-gray-200 rounded flex-1"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma atividade recente encontrada</p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-b">
                  <TableHead className="font-semibold">Usuário</TableHead>
                  <TableHead className="font-semibold">Ação</TableHead>
                  <TableHead className="font-semibold">Tipo</TableHead>
                  <TableHead className="font-semibold text-right">Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.slice(0, 10).map((activity) => (
                  <TableRow key={activity.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{activity.userName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{activity.title}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getActivityColor(activity.type)}>
                        {activity.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {new Date(activity.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
