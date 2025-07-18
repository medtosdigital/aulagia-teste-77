import React, { useState } from 'react';
import { Crown, Check, Users, Download, FileText, Calendar, CreditCard, Ban, ArrowUpDown, Brain, Presentation, ClipboardList, GraduationCap, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePlanPermissions } from '@/hooks/usePlanPermissions';
import { ChangeCardModal } from '@/components/ChangeCardModal';
import { ChangePlanModal } from '@/components/ChangePlanModal';

const SubscriptionPage = () => {
  const [billingType, setBillingType] = useState<'monthly' | 'yearly'>('monthly');
  const [isChangeCardModalOpen, setIsChangeCardModalOpen] = useState(false);
  const [isChangePlanModalOpen, setIsChangePlanModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    currentPlan,
    usage,
    getRemainingMaterials,
    getNextResetDate,
    currentProfile,
    loading,
    refreshData,
    changePlan
  } = usePlanPermissions();

  // Se houver erro ou perfil não encontrado
  if (error || !currentProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <p className="text-red-600 font-semibold text-lg mb-2">{error || 'Perfil não encontrado. Tente novamente.'}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded">Tentar novamente</button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-6">
        <div className="max-w-6xl mx-auto">
          <Card className="p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando informações do plano...</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Dados reais do perfil
  const planoNome = currentPlan.name;
  const planoId = currentPlan.id;
  const materiaisRestantes = getRemainingMaterials();
  const materiaisCriados = currentProfile.materiais_criados_mes_atual;
  const limiteMateriais = currentPlan.limits.materialsPerMonth;
  const dataInicio = currentProfile.data_inicio_plano ? new Date(currentProfile.data_inicio_plano) : null;
  const dataExpiracao = currentProfile.data_expiracao_plano ? new Date(currentProfile.data_expiracao_plano) : null;
  const nomeUsuario = currentProfile.nome_preferido || currentProfile.full_name || currentProfile.email || '';

  // Recursos do plano
  const recursos = [];
  if (planoId === 'admin') {
    recursos.push('Materiais ilimitados', 'Planos de Aula (ilimitado)', 'Slides (ilimitado)', 'Atividades (ilimitado)', 'Avaliações (ilimitado)', 'Download em PDF', 'Download em Word', 'Download em PowerPoint', 'Edição completa de materiais', 'Calendário de aulas', 'Histórico completo', 'Dashboard colaborativo', 'Compartilhamento entre professores', 'Gestão de usuários', 'Distribuição de materiais entre professores', 'Acesso total a todos os recursos', 'Controle de usuários, planos e histórico', 'Permissão exclusiva para administração', 'Visualização e gestão de todos os usuários e materiais');
  } else if (planoId === 'professor') {
    recursos.push('50 materiais por mês', 'Download em PDF, Word e PPT', 'Edição completa de materiais', 'Todos os templates disponíveis', 'Suporte por e-mail', 'Calendário de aulas', 'Histórico completo', 'Planos de Aula completos', 'Slides interativos', 'Atividades diversificadas', 'Avaliações personalizadas');
  } else if (planoId === 'grupo-escolar') {
    recursos.push('300 materiais por mês (total)', 'Até 5 professores', 'Todos os recursos do plano Professor', 'Dashboard de gestão colaborativa', 'Compartilhamento de materiais entre professores', 'Relatórios detalhados de uso', 'Suporte prioritário', 'Gestão centralizada de usuários', 'Controle de permissões', 'Distribuição flexível de materiais entre professores');
  } else {
    recursos.push('5 materiais por mês', 'Download em PDF', 'Suporte básico', 'Acesso aos templates básicos', 'Planos de Aula básicos', 'Atividades simples');
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-6">
      <div className="max-w-6xl mx-auto mb-6 sm:mb-8">
        <Card className="overflow-hidden">
          <div className={`p-4 sm:p-6 text-white ${planoId !== 'gratuito' ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gradient-to-r from-gray-500 to-gray-600'}`}>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold mb-1">Seu Plano Atual</h1>
                <p className="opacity-90 text-sm sm:text-base">{planoNome}</p>
                <p className="text-xs mt-1">Usuário: {nomeUsuario}</p>
                {dataInicio && <p className="text-xs">Início: {dataInicio.toLocaleDateString('pt-BR')}</p>}
                {dataExpiracao && <p className="text-xs">Expira: {dataExpiracao.toLocaleDateString('pt-BR')}</p>}
              </div>
              <div className={`rounded-full px-3 sm:px-4 py-1 flex items-center self-start bg-white/20`}>
                <Crown className="w-4 h-4 mr-2" />
                <span className="font-medium text-sm">{planoId !== 'gratuito' ? 'Ativo' : 'Gratuito'}</span>
              </div>
            </div>
          </div>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
              <div className="bg-gray-50 rounded-lg p-4 sm:p-5 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800 flex items-center text-sm sm:text-base">
                    <FileText className="w-4 sm:w-5 h-4 sm:h-5 text-blue-600 mr-2" />
                    Materiais gerados
                  </h3>
                  <span className="text-blue-600 font-bold text-sm sm:text-base">
                    {materiaisCriados} / {limiteMateriais === Infinity ? 'Ilimitado' : limiteMateriais}
                  </span>
                </div>
                <div className="flex items-center text-xs sm:text-sm text-gray-600 mb-3">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Renova em: {getNextResetDate().toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="flex items-center text-xs sm:text-sm text-gray-600">
                  <CreditCard className="w-4 h-4 mr-2" />
                  <span>{planoId !== 'gratuito' ? 'Pagamento ativo' : 'Plano gratuito'}</span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 sm:p-5 border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">Recursos do seu plano:</h3>
                <ul className="list-disc pl-5 text-xs sm:text-sm text-gray-700">
                  {recursos.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-5">
              <h3 className="font-semibold text-gray-800 mb-4 text-sm sm:text-base">Gerenciar assinatura</h3>
              <div className="flex flex-col gap-4">
                <Button
                  variant="outline"
                  className="flex items-center justify-center text-sm rounded-xl border-2 py-3 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                  onClick={() => setIsChangePlanModalOpen(true)}
                >
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  Alterar plano
                </Button>
                {planoId !== 'gratuito' && (
                  <Button
                    variant="outline"
                    className="flex items-center justify-center text-sm rounded-xl border-2 py-3 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                    onClick={() => setIsCancelModalOpen(true)}
                  >
                    <Ban className="w-4 h-4 mr-2" />
                    Cancelar assinatura
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <ChangeCardModal isOpen={isChangeCardModalOpen} onClose={() => setIsChangeCardModalOpen(false)} />
      <ChangePlanModal isOpen={isChangePlanModalOpen} onClose={() => setIsChangePlanModalOpen(false)} />
    </div>
  );
};

export default SubscriptionPage;

