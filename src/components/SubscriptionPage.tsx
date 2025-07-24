import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Check, X, Crown, Users, Calendar, Download, Edit, Slides, FileText, History, Zap } from 'lucide-react';
import { usePlanPermissions } from '@/hooks/usePlanPermissions';
import { useActivityTracker } from '@/hooks/useActivityTracker';
import { useToast } from '@/hooks/use-toast';
import { ChangePlanModal } from '@/components/ChangePlanModal';

const SubscriptionPage = () => {
  const [showChangePlan, setShowChangePlan] = useState(false);
  const { currentPlan, usage, loading, changePlan } = usePlanPermissions();
  const { trackActivity } = useActivityTracker();
  const { toast } = useToast();

  const planFeatures = {
    'gratuito': {
      name: 'Plano Gratuito',
      description: 'Ideal para quem está começando',
      features: [
        { name: '5 Materiais por mês', icon: <Check className="w-4 h-4 mr-2 text-green-500" /> },
        { name: 'Acesso básico a ferramentas', icon: <Check className="w-4 h-4 mr-2 text-green-500" /> },
        { name: 'Suporte da comunidade', icon: <Check className="w-4 h-4 mr-2 text-green-500" /> },
        { name: 'Download em PDF', icon: <X className="w-4 h-4 mr-2 text-red-500" /> },
        { name: 'Download em Word', icon: <X className="w-4 h-4 mr-2 text-red-500" /> },
        { name: 'Download em PPT', icon: <X className="w-4 h-4 mr-2 text-red-500" /> },
        { name: 'Editar materiais', icon: <X className="w-4 h-4 mr-2 text-red-500" /> },
        { name: 'Criar slides', icon: <X className="w-4 h-4 mr-2 text-red-500" /> },
        { name: 'Criar avaliações', icon: <X className="w-4 h-4 mr-2 text-red-500" /> },
        { name: 'Calendário', icon: <X className="w-4 h-4 mr-2 text-red-500" /> },
        { name: 'Histórico de materiais', icon: <X className="w-4 h-4 mr-2 text-red-500" /> },
      ],
    },
    'professor': {
      name: 'Plano Professor',
      description: 'Para professores que querem mais recursos',
      features: [
        { name: '50 Materiais por mês', icon: <Check className="w-4 h-4 mr-2 text-green-500" /> },
        { name: 'Acesso completo a ferramentas', icon: <Check className="w-4 h-4 mr-2 text-green-500" /> },
        { name: 'Suporte prioritário', icon: <Check className="w-4 h-4 mr-2 text-green-500" /> },
        { name: 'Download em PDF', icon: <Check className="w-4 h-4 mr-2 text-green-500" /> },
        { name: 'Download em Word', icon: <Check className="w-4 h-4 mr-2 text-green-500" /> },
        { name: 'Download em PPT', icon: <Check className="w-4 h-4 mr-2 text-green-500" /> },
        { name: 'Editar materiais', icon: <Check className="w-4 h-4 mr-2 text-green-500" /> },
        { name: 'Criar slides', icon: <Check className="w-4 h-4 mr-2 text-green-500" /> },
        { name: 'Criar avaliações', icon: <Check className="w-4 h-4 mr-2 text-green-500" /> },
        { name: 'Calendário', icon: <Check className="w-4 h-4 mr-2 text-green-500" /> },
        { name: 'Histórico de materiais', icon: <Check className="w-4 h-4 mr-2 text-green-500" /> },
      ],
    },
    'grupo_escolar': {
      name: 'Plano Grupo Escolar',
      description: 'Solução completa para sua instituição',
      features: [
        { name: '300 Materiais por mês', icon: <Check className="w-4 h-4 mr-2 text-green-500" /> },
        { name: 'Acesso total a ferramentas', icon: <Check className="w-4 h-4 mr-2 text-green-500" /> },
        { name: 'Suporte premium', icon: <Check className="w-4 h-4 mr-2 text-green-500" /> },
        { name: 'Download em PDF', icon: <Check className="w-4 h-4 mr-2 text-green-500" /> },
        { name: 'Download em Word', icon: <Check className="w-4 h-4 mr-2 text-green-500" /> },
        { name: 'Download em PPT', icon: <Check className="w-4 h-4 mr-2 text-green-500" /> },
        { name: 'Editar materiais', icon: <Check className="w-4 h-4 mr-2 text-green-500" /> },
        { name: 'Criar slides', icon: <Check className="w-4 h-4 mr-2 text-green-500" /> },
        { name: 'Criar avaliações', icon: <Check className="w-4 h-4 mr-2 text-green-500" /> },
        { name: 'Calendário', icon: <Check className="w-4 h-4 mr-2 text-green-500" /> },
        { name: 'Histórico de materiais', icon: <Check className="w-4 h-4 mr-2 text-green-500" /> },
        { name: 'Gestão de usuários', icon: <Users className="w-4 h-4 mr-2 text-green-500" /> },
        { name: 'Relatórios de uso', icon: <History className="w-4 h-4 mr-2 text-green-500" /> },
      ],
    },
    'admin': {
      name: 'Plano Administrador',
      description: 'Acesso total para administração',
      features: [
        { name: 'Materiais ilimitados', icon: <Zap className="w-4 h-4 mr-2 text-green-500" /> },
        { name: 'Acesso total a ferramentas', icon: <Check className="w-4 h-4 mr-2 text-green-500" /> },
        { name: 'Suporte prioritário', icon: <Crown className="w-4 h-4 mr-2 text-green-500" /> },
        { name: 'Download em PDF', icon: <Check className="w-4 h-4 mr-2 text-green-500" /> },
        { name: 'Download em Word', icon: <Check className="w-4 h-4 mr-2 text-green-500" /> },
        { name: 'Download em PPT', icon: <Check className="w-4 h-4 mr-2 text-green-500" /> },
        { name: 'Editar materiais', icon: <Check className="w-4 h-4 mr-2 text-green-500" /> },
        { name: 'Criar slides', icon: <Check className="w-4 h-4 mr-2 text-green-500" /> },
        { name: 'Criar avaliações', icon: <Check className="w-4 h-4 mr-2 text-green-500" /> },
        { name: 'Calendário', icon: <Check className="w-4 h-4 mr-2 text-green-500" /> },
        { name: 'Histórico de materiais', icon: <Check className="w-4 h-4 mr-2 text-green-500" /> },
        { name: 'Gestão de usuários', icon: <Users className="w-4 h-4 mr-2 text-green-500" /> },
        { name: 'Relatórios de uso', icon: <History className="w-4 h-4 mr-2 text-green-500" /> },
      ],
    },
  };

  const handleUpgradeClick = (planId: string) => {
    // Track the upgrade attempt with correct type
    trackActivity({
      type: 'created', // Fixed: changed from 'feedback' to 'created'
      title: `Tentativa de upgrade para ${planId}`,
      description: `Usuário tentou fazer upgrade para o plano ${planId}`,
      material_type: 'plano',
      material_id: planId
    });
    
    setShowChangePlan(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Escolha o Plano Ideal para Você
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Potencialize sua prática docente com nossos planos personalizados
          </p>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">
              {currentPlan.name}
            </CardTitle>
            <Badge variant="secondary">
              {usage.materialsThisMonth} / {currentPlan.limits.materialsPerMonth} Materiais Usados
            </Badge>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-gray-500">
              {planFeatures[currentPlan.id]?.description || 'Recursos do seu plano atual'}
            </CardDescription>
            <Separator className="my-4" />
            <div className="grid gap-4">
              <h3 className="text-lg font-semibold">Recursos do Plano</h3>
              <ul className="list-none pl-0">
                {planFeatures[currentPlan.id]?.features.map((feature, index) => (
                  <li key={index} className="flex items-center py-2">
                    {feature.icon}
                    <span>{feature.name}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Separator className="my-4" />
            <div className="flex justify-center">
              {currentPlan.id === 'gratuito' ? (
                <Button onClick={() => handleUpgradeClick('professor')}>
                  Fazer Upgrade para Professor
                </Button>
              ) : currentPlan.id === 'professor' ? (
                <Button onClick={() => handleUpgradeClick('grupo-escolar')}>
                  Fazer Upgrade para Grupo Escolar
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <ChangePlanModal
          isOpen={showChangePlan}
          onClose={() => setShowChangePlan(false)}
          onSelectPlan={changePlan}
        />
      </div>
    </div>
  );
};

export default SubscriptionPage;
