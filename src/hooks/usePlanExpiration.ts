
import { useEffect, useRef } from 'react';
import { planExpirationService } from '@/services/planExpirationService';

export const usePlanExpiration = () => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Executar verificação inicial
    const runInitialCheck = async () => {
      console.log('🔄 Executando verificação inicial de planos...');
      await planExpirationService.runDailyPlanCheck();
    };

    runInitialCheck();

    // Configurar verificação diária (a cada 24 horas)
    const setupDailyCheck = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Executar a cada 24 horas (em milissegundos)
      const DAILY_INTERVAL = 24 * 60 * 60 * 1000;
      
      intervalRef.current = setInterval(async () => {
        console.log('🔄 Executando verificação diária programada...');
        await planExpirationService.runDailyPlanCheck();
      }, DAILY_INTERVAL);
    };

    setupDailyCheck();

    // Cleanup ao desmontar
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Função para executar verificação manual
  const runManualCheck = async () => {
    console.log('🔄 Executando verificação manual de planos...');
    await planExpirationService.runDailyPlanCheck();
  };

  // Função para renovar plano gratuito
  const renewFreePlan = async (userId: string) => {
    return await planExpirationService.renewFreePlan(userId);
  };

  // Função para atualizar plano pago
  const updatePaidPlan = async (userId: string, planType: 'professor' | 'grupo_escolar', billingType: 'monthly' | 'yearly') => {
    return await planExpirationService.updatePaidPlan(userId, planType, billingType);
  };

  // Função para renovar plano pago (via webhook)
  const renewPaidPlan = async (userId: string) => {
    return await planExpirationService.renewPaidPlan(userId);
  };

  return {
    runManualCheck,
    renewFreePlan,
    updatePaidPlan,
    renewPaidPlan
  };
};
