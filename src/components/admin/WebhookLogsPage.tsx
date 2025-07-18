
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { webhookService, WebhookLog } from '@/services/webhookService';
import { RefreshCw, Search, TestTube, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const WebhookLogsPage: React.FC = () => {
  const { toast } = useToast();
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await webhookService.getWebhookLogs(100);
      setLogs(data);
      setFilteredLogs(data);
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os logs de webhook.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    let filtered = logs;

    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.evento.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(log => log.status === statusFilter);
    }

    setFilteredLogs(filtered);
  }, [logs, searchTerm, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sucesso':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'erro':
      case 'erro_atualizacao':
      case 'erro_processamento':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'usuario_nao_encontrado':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'evento_nao_mapeado':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'sucesso': 'Sucesso',
      'erro': 'Erro',
      'erro_atualizacao': 'Erro na Atualização',
      'erro_processamento': 'Erro no Processamento',
      'usuario_nao_encontrado': 'Usuário Não Encontrado',
      'evento_nao_mapeado': 'Evento Não Mapeado'
    };
    return statusMap[status] || status;
  };

  const testWebhook = async () => {
    const testData = {
      email: 'test@example.com',
      event_type: 'payment.success',
      product: 'plano-professor',
      customer: {
        email: 'test@example.com'
      }
    };

    try {
      const success = await webhookService.testWebhook(testData);
      if (success) {
        toast({
          title: "Teste realizado",
          description: "O webhook de teste foi enviado com sucesso.",
        });
        loadLogs(); // Recarregar logs após o teste
      } else {
        toast({
          title: "Erro no teste",
          description: "Não foi possível enviar o webhook de teste.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao executar teste do webhook.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Logs de Webhook</h1>
          <p className="text-muted-foreground">
            Monitore e gerencie os eventos de webhook recebidos
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={testWebhook} variant="outline" size="sm">
            <TestTube className="h-4 w-4 mr-2" />
            Testar Webhook
          </Button>
          <Button onClick={loadLogs} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por email ou evento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="sucesso">Sucesso</SelectItem>
              <SelectItem value="erro">Erro</SelectItem>
              <SelectItem value="usuario_nao_encontrado">Usuário Não Encontrado</SelectItem>
              <SelectItem value="evento_nao_mapeado">Evento Não Mapeado</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Lista de Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Logs Recentes</CardTitle>
          <CardDescription>
            {filteredLogs.length} registro(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Carregando logs...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum log encontrado
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={getStatusColor(log.status)}>
                        {getStatusText(log.status)}
                      </Badge>
                      <span className="font-medium">{log.evento}</span>
                      {log.plano_aplicado && (
                        <Badge variant="outline">
                          {log.plano_aplicado}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p><strong>Email:</strong> {log.email}</p>
                      <p><strong>Data:</strong> {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}</p>
                      {log.produto && <p><strong>Produto:</strong> {log.produto}</p>}
                    </div>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedLog(log)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Detalhes
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh]">
                      <DialogHeader>
                        <DialogTitle>Detalhes do Webhook</DialogTitle>
                      </DialogHeader>
                      <ScrollArea className="max-h-[60vh]">
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">Status</label>
                              <Badge className={getStatusColor(log.status)}>
                                {getStatusText(log.status)}
                              </Badge>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Evento</label>
                              <p className="text-sm">{log.evento}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Email</label>
                              <p className="text-sm">{log.email}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Data</label>
                              <p className="text-sm">
                                {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                              </p>
                            </div>
                            {log.produto && (
                              <div>
                                <label className="text-sm font-medium">Produto</label>
                                <p className="text-sm">{log.produto}</p>
                              </div>
                            )}
                            {log.plano_aplicado && (
                              <div>
                                <label className="text-sm font-medium">Plano Aplicado</label>
                                <p className="text-sm">{log.plano_aplicado}</p>
                              </div>
                            )}
                            {log.ip_address && (
                              <div>
                                <label className="text-sm font-medium">IP</label>
                                <p className="text-sm font-mono">{log.ip_address}</p>
                              </div>
                            )}
                          </div>
                          {log.user_agent && (
                            <div>
                              <label className="text-sm font-medium">User Agent</label>
                              <p className="text-xs font-mono bg-muted p-2 rounded mt-1">
                                {log.user_agent}
                              </p>
                            </div>
                          )}
                          {log.payload && (
                            <div>
                              <label className="text-sm font-medium">Payload Completo</label>
                              <pre className="text-xs bg-muted p-3 rounded mt-1 overflow-auto">
                                {JSON.stringify(log.payload, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WebhookLogsPage;
