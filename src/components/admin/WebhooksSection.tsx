
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Copy, 
  Play, 
  Info, 
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Activity,
  Shield,
  Settings
} from 'lucide-react';
import { webhookService, WebhookLog, WebhookSimulation } from '@/services/webhookService';
import { useToast } from '@/hooks/use-toast';

export default function WebhooksSection() {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [securityToken, setSecurityToken] = useState('');
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [stats, setStats] = useState({
    totalEvents: 0,
    successEvents: 0,
    errorEvents: 0,
    recentEvents: [] as WebhookLog[]
  });

  // Simulação com email padrão exemplo
  const [simulation, setSimulation] = useState<WebhookSimulation>({
    email: 'exemplo@email.com',
    evento: 'compra aprovada',
    produto: 'Plano Professor (Mensal)',
    token: 'q64w1ncxx2k'
  });

  const { toast } = useToast();
  const logsPerPage = 10;

  useEffect(() => {
    loadWebhookConfig();
    loadLogs();
    loadStats();
  }, [currentPage]);

  const loadWebhookConfig = () => {
    setWebhookUrl(webhookService.getWebhookUrl());
    setSecurityToken(webhookService.getSecurityToken());
  };

  const loadLogs = async () => {
    setLoading(true);
    try {
      const result = await webhookService.getWebhookLogs(currentPage, logsPerPage);
      setLogs(result.logs);
      setTotalLogs(result.total);
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
      toast({
        title: "❌ Erro ao carregar logs",
        description: "Não foi possível carregar os logs de webhook.",
        variant: "destructive"
      });
      setLogs([]);
      setTotalLogs(0);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await webhookService.getWebhookStats();
      setStats(statsData);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      toast({
        title: "⚠️ Aviso",
        description: "Não foi possível carregar as estatísticas de webhook.",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copiado!",
        description: `${label} foi copiado para a área de transferência.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar para a área de transferência.",
        variant: "destructive"
      });
    }
  };

  const handleSimulateWebhook = async () => {
    if (!simulation.email || !simulation.evento) {
      toast({
        title: "⚠️ Campos obrigatórios",
        description: "Email e evento são obrigatórios para simular o webhook.",
        variant: "destructive"
      });
      return;
    }

    setSimulating(true);
    try {
      toast({
        title: "🔄 Simulando webhook...",
        description: "Processando solicitação...",
      });
      
      const result = await webhookService.simulateWebhook(simulation);
      
      if (result.success) {
        toast({
          title: "✅ Webhook simulado com sucesso!",
          description: result.message,
        });
        
        // Recarregar logs e estatísticas
        await loadLogs();
        await loadStats();
      } else {
        toast({
          title: "❌ Erro na simulação",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao simular webhook:', error);
      toast({
        title: "💥 Erro inesperado",
        description: "Erro ao simular webhook. Verifique o console para mais detalhes.",
        variant: "destructive"
      });
    } finally {
      setSimulating(false);
    }
  };

  const totalPages = Math.ceil(totalLogs / logsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Integração Webhook Kiwify</h2>
          <p className="text-gray-600 mt-1">
            Configure e monitore a integração automática com a Kiwify para atualização de planos
          </p>
        </div>
      </div>

      <Tabs defaultValue="config" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="config">Configuração</TabsTrigger>
          <TabsTrigger value="simulator">Simulador</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-6">
          {/* Configuração do Webhook */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Endpoint do Webhook
              </CardTitle>
              <CardDescription>
                Configure esta URL no painel da Kiwify para receber eventos automaticamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">URL do Webhook</label>
                <div className="flex gap-2">
                  <Input
                    value={webhookUrl}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(webhookUrl, 'URL do webhook')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Token de Segurança</label>
                <div className="flex gap-2">
                  <Input
                    value={securityToken}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(securityToken, 'Token de segurança')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Instruções de Configuração:</strong>
                  <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                    <li>Acesse o painel da Kiwify</li>
                    <li>Vá em Configurações → Webhooks</li>
                    <li>Adicione a URL do webhook acima</li>
                    <li>Configure o token de segurança: <code className="bg-gray-100 px-1 rounded">{securityToken}</code></li>
                    <li>Ative os eventos: "Compra Aprovada", "Assinatura Aprovada", "Assinatura Renovada", "Assinatura Cancelada", "Assinatura Atrasada"</li>
                  </ol>
                </AlertDescription>
              </Alert>

              <Alert className="border-blue-200 bg-blue-50">
                <Shield className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Importante:</strong> Este endpoint é público e seguro. Ele valida automaticamente o token de segurança e processa apenas eventos autenticados da Kiwify.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Estatísticas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Estatísticas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalEvents}</div>
                  <div className="text-sm text-blue-600">Total de Eventos</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats.successEvents}</div>
                  <div className="text-sm text-green-600">Sucessos</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{stats.errorEvents}</div>
                  <div className="text-sm text-red-600">Erros</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="simulator" className="space-y-6">
          {/* Simulador de Webhook */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Simulador de Webhooks
              </CardTitle>
              <CardDescription>
                Teste a funcionalidade de webhook da Kiwify simulando eventos reais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Email do Usuário</label>
                  <Input
                    value={simulation.email}
                    onChange={(e) => setSimulation({ ...simulation, email: e.target.value })}
                    placeholder="exemplo@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Evento</label>
                  <Select
                    value={simulation.evento}
                    onValueChange={(value) => setSimulation({ ...simulation, evento: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um evento" />
                    </SelectTrigger>
                    <SelectContent>
                      {webhookService.getEventOptions().map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Produto (Opcional)</label>
                  <Select
                    value={simulation.produto}
                    onValueChange={(value) => setSimulation({ ...simulation, produto: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {webhookService.getProductOptions().map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Token (Opcional)</label>
                  <Input
                    value={simulation.token}
                    onChange={(e) => setSimulation({ ...simulation, token: e.target.value })}
                    placeholder="Deixe vazio para usar o token padrão"
                  />
                </div>
              </div>

              <Button
                onClick={handleSimulateWebhook}
                disabled={simulating || !simulation.email || !simulation.evento}
                className={`w-full ${simulating ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {simulating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Simulando...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Simular Webhook
                  </>
                )}
              </Button>
              
              <div className="text-sm text-gray-600 mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="font-medium mb-2">💡 Como funciona:</div>
                <ul className="text-xs space-y-1">
                  <li>• <strong>Compra/Assinatura Aprovada:</strong> Ativa o plano do usuário</li>
                  <li>• <strong>Assinatura Renovada:</strong> Renova o plano atual do usuário</li>
                  <li>• <strong>Assinatura Cancelada:</strong> Volta o usuário ao plano gratuito</li>
                  <li>• <strong>Assinatura Atrasada:</strong> Marca o plano como atrasado</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          {/* Logs de Webhook */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Logs de Webhook
              </CardTitle>
              <CardDescription>
                Últimos eventos processados pelo webhook
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-500">Carregando logs...</span>
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nenhum log encontrado
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data/Hora</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Evento</TableHead>
                          <TableHead>Produto</TableHead>
                          <TableHead>Plano Aplicado</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {logs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="text-sm">
                              {webhookService.formatDate(log.created_at)}
                            </TableCell>
                            <TableCell className="text-sm font-medium">
                              {log.email}
                            </TableCell>
                            <TableCell className="text-sm">
                              {log.evento}
                            </TableCell>
                            <TableCell className="text-sm">
                              {log.produto || '-'}
                            </TableCell>
                            <TableCell className="text-sm">
                              {log.plano_aplicado || '-'}
                            </TableCell>
                            <TableCell>
                              <Badge className={webhookService.getStatusBadgeColor(log.status)}>
                                {log.status === 'sucesso' ? 'Sucesso' : 'Erro'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Paginação */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-gray-500">
                        Mostrando {((currentPage - 1) * logsPerPage) + 1} a {Math.min(currentPage * logsPerPage, totalLogs)} de {totalLogs} logs
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-gray-500">
                          Página {currentPage} de {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
