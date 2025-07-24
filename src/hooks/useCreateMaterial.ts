
import { useState } from 'react';
import { materialService } from '@/services/materialService';
import { useToast } from '@/hooks/use-toast';
import { usePlanPermissions } from '@/hooks/usePlanPermissions';

export interface CreateMaterialState {
  isLoading: boolean;
  isModalOpen: boolean;
  error: string | null;
  currentStep: number;
  materialType: string;
  formData: any;
}

export const useCreateMaterial = () => {
  const [state, setState] = useState<CreateMaterialState>({
    isLoading: false,
    isModalOpen: false,
    error: null,
    currentStep: 1,
    materialType: '',
    formData: {}
  });

  const { toast } = useToast();
  const { canPerformAction, getRemainingMaterials } = usePlanPermissions();

  const openModal = (materialType: string) => {
    console.log('📝 [CREATE-MODAL] Abrindo modal para:', materialType);
    
    if (!canPerformAction()) {
      toast({
        title: 'Limite atingido',
        description: 'Você atingiu o limite de criação de materiais. Faça upgrade do seu plano.',
        variant: 'destructive'
      });
      return;
    }

    setState({
      isLoading: false,
      isModalOpen: true,
      error: null,
      currentStep: 1,
      materialType,
      formData: {}
    });
  };

  const closeModal = () => {
    console.log('❌ [CREATE-MODAL] Fechando modal');
    setState({
      isLoading: false,
      isModalOpen: false,
      error: null,
      currentStep: 1,
      materialType: '',
      formData: {}
    });
  };

  const updateFormData = (data: any) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, ...data }
    }));
  };

  const nextStep = () => {
    setState(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));
  };

  const prevStep = () => {
    setState(prev => ({ ...prev, currentStep: Math.max(1, prev.currentStep - 1) }));
  };

  const createMaterial = async () => {
    console.log('🚀 [CREATE-MATERIAL] Iniciando criação:', state.materialType);
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const material = await materialService.generateMaterial(state.materialType, state.formData);
      
      toast({
        title: 'Material criado com sucesso!',
        description: `Seu ${state.materialType} foi gerado e está pronto para uso.`,
      });
      
      console.log('✅ [CREATE-MATERIAL] Material criado com sucesso:', material.id);
      
      // Fechar modal após sucesso
      closeModal();
      
      // Retornar material criado
      return material;
      
    } catch (error) {
      console.error('❌ [CREATE-MATERIAL] Erro na criação:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      setState(prev => ({ ...prev, error: errorMessage }));
      
      toast({
        title: 'Erro na criação',
        description: errorMessage,
        variant: 'destructive'
      });
      
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const getRemainingCreations = () => {
    return getRemainingMaterials();
  };

  return {
    state,
    openModal,
    closeModal,
    updateFormData,
    nextStep,
    prevStep,
    createMaterial,
    getRemainingCreations
  };
};
