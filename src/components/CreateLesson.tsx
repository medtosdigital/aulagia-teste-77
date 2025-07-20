import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Monitor, FileText, ClipboardCheck, ArrowLeft, Wand2, Mic, Sparkles, GraduationCap, Brain, Hash, Sliders, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { materialService, GeneratedMaterial, normalizeMaterialForPreview } from '@/services/materialService';
import { QuestionParserService } from '@/services/questionParserService';
import MaterialModal from './MaterialModal';
import NextStepsModal from './NextStepsModal';
import BNCCValidationModal from './BNCCValidationModal';
import EnhancedBNCCValidationModal from './EnhancedBNCCValidationModal';
import { UpgradeModal } from './UpgradeModal';
import BlockedFeature from './BlockedFeature';
import { usePlanPermissions } from '@/hooks/usePlanPermissions';
import { useUpgradeModal } from '@/hooks/useUpgradeModal';
import { toast } from 'sonner';
import { activityService } from '@/services/activityService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { BNCCValidationService } from '@/services/bnccValidationService';
import { EnhancedBNCCValidationService } from '@/services/enhancedBNCCValidationService';
import AudioTranscriptionButton from './AudioTranscriptionButton';
import MaterialEditModal from './MaterialEditModal';
import { planService } from '@/services/planService';

type MaterialType = 'plano-de-aula' | 'slides' | 'atividade' | 'avaliacao' | 'apoio';

interface MaterialTypeOption {
  id: MaterialType;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  bgGradient: string;
  iconBg: string;
  hoverEffect: string;
  blocked?: boolean;
}

interface ValidationResult {
  isValid: boolean;
  confidence: number;
  suggestions: string[];
  feedback: string;
}

interface EnhancedBNCCValidation {
  overallValid: boolean;
  individualValidations: IndividualBNCCValidation[];
  overallFeedback: string;
  hasPartiallyValid: boolean;
  validThemes: string[];
  invalidThemes: string[];
}

interface IndividualBNCCValidation {
  tema: string;
  isValid: boolean;
  confidence: number;
  feedback: string;
  suggestions: string[];
}

// Cache em memória para listas auxiliares
const subjectsCache = { data: null as string[] | null, timestamp: 0 };
const gradesCache = { data: null as { category: string; options: string[] }[] | null, timestamp: 0 };
const AUX_CACHE_DURATION = 60000; // 60 segundos

const getSubjects = () => {
  const now = Date.now();
  if (subjectsCache.data && (now - subjectsCache.timestamp) < AUX_CACHE_DURATION) {
    return subjectsCache.data;
  }
  // Aqui poderia buscar da API/Supabase se fosse dinâmico
  subjectsCache.data = [
    'Matemática', 'Português', 'Ciências', 'História', 'Geografia', 'Física', 'Química', 'Biologia',
    'Educação Física', 'Espanhol', 'Inglês', 'Filosofia', 'Sociologia', 'Informática', 'Física Quântica',
    'Teatro', 'Literatura', 'Música', 'Dança', 'Artes'
  ];
  subjectsCache.timestamp = now;
  return subjectsCache.data;
};

const getGrades = () => {
  const now = Date.now();
  if (gradesCache.data && (now - gradesCache.timestamp) < AUX_CACHE_DURATION) {
    return gradesCache.data;
  }
  // Aqui poderia buscar da API/Supabase se fosse dinâmico
  gradesCache.data = [
    { category: 'Educação Infantil', options: ['Maternal', 'Jardim I', 'Jardim II', 'Pré-Escola'] },
    { category: 'Ensino Fundamental I', options: ['1° Ano', '2° Ano', '3° Ano', '4° Ano', '5° Ano'] },
    { category: 'Ensino Fundamental II', options: ['6° Ano', '7° Ano', '8° Ano', '9° Ano'] },
    { category: 'Ensino Médio', options: ['1° Ano', '2° Ano', '3° Ano'] },
    { category: 'Ensino Superior', options: ['Graduação'] }
  ];
  gradesCache.timestamp = now;
  return gradesCache.data;
};

// Error Boundary interno para o formulário
class FormErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error('Erro no formulário de criação de material:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen flex items-center justify-center">
          <div className="bg-white p-8 rounded-xl shadow-xl text-center">
            <h2 className="text-xl font-bold text-red-600 mb-2">Erro ao carregar formulário</h2>
            <p className="text-gray-700 mb-4">Ocorreu um erro inesperado ao exibir o formulário. Por favor, recarregue a página ou tente novamente mais tarde.</p>
            <Button onClick={() => window.location.reload()}>Recarregar Página</Button>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}

interface ProgressStage {
  id: string;
  title: string;
  description: string;
  estimatedDuration: number; // em segundos
  icon?: React.ComponentType<any>;
}

interface GenerationProgress {
  stage: string;
  progress: number;
  message: string;
  isComplete: boolean;
}

const CreateLesson: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<'selection' | 'form' | 'generating'>('selection');
  const [selectedType, setSelectedType] = useState<MaterialType | null>(null);
  const [formData, setFormData] = useState({
    topic: '',
    subject: '',
    grade: '',
    questionType: 'mistas',
    questionCount: [5],
    subjects: [''] as string[]
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<GenerationProgress>({
    stage: 'validation',
    progress: 0,
    message: 'Preparando validação...',
    isComplete: false
  });
  const [generatedMaterial, setGeneratedMaterial] = useState<GeneratedMaterial | null>(null);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showNextStepsModal, setShowNextStepsModal] = useState(false);
  const [showBNCCValidation, setShowBNCCValidation] = useState(false);
  const [showEnhancedBNCCValidation, setShowEnhancedBNCCValidation] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [enhancedValidationResult, setEnhancedValidationResult] = useState<EnhancedBNCCValidation | null>(null);
  const [invalidSubjects, setInvalidSubjects] = useState<string[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editMaterial, setEditMaterial] = useState<GeneratedMaterial | null>(null);
  const [shouldShowUpgrade, setShouldShowUpgrade] = useState(false);

  // Hooks para gerenciamento de planos e limites
  const { createMaterial, isLimitReached, getRemainingMaterials, currentPlan, canPerformAction, canEditMaterials, canCreateAssessments } = usePlanPermissions();
  const { 
    isOpen: isUpgradeModalOpen, 
    closeModal: closeUpgradeModal, 
    openModal: openUpgradeModal,
    handlePlanSelection,
    availablePlans 
  } = useUpgradeModal();

  // Verificar permissões antes de criar material
  const checkPermissions = async () => {
    if (!user?.id) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para criar materiais.",
        variant: "destructive"
      });
      return false;
    }

    try {
      const canCreate = await planService.canCreateMaterial(user.id);
      const remainingMaterials = await planService.getRemainingMaterials(user.id);
      
      if (!canCreate) {
        toast({
          title: "Limite de materiais atingido",
          description: `Você já criou todos os ${remainingMaterials + 1} materiais do seu plano este mês. Faça upgrade para criar mais!`,
          variant: "destructive"
        });
        setShouldShowUpgrade(true);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao verificar permissões:', error);
      toast({
        title: "Erro ao verificar permissões",
        description: "Não foi possível verificar suas permissões. Tente novamente.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Incrementar contador de materiais após criação bem-sucedida
  const incrementMaterialCount = async () => {
    if (!user?.id) return;

    try {
      const success = await planService.incrementMaterialCount(user.id);
      if (success) {
        console.log('✅ Contador de materiais incrementado com sucesso');
      } else {
        console.warn('⚠️ Não foi possível incrementar o contador de materiais');
      }
    } catch (error) {
      console.error('❌ Erro ao incrementar contador de materiais:', error);
    }
  };

  // Definir estágios de progresso baseados no tipo de material
  const getProgressStages = (materialType: string): ProgressStage[] => {
    const baseStages: ProgressStage[] = [
      {
        id: 'validation',
        title: 'Validação BNCC',
        description: 'Verificando alinhamento com a Base Nacional Comum Curricular',
        estimatedDuration: 10,
        icon: Brain
      },
      {
        id: 'content-generation',
        title: 'Geração de Conteúdo',
        description: 'Criando conteúdo pedagógico personalizado',
        estimatedDuration: 25,
        icon: Wand2
      }
    ];

    if (materialType === 'slides') {
      baseStages.push({
        id: 'image-generation',
        title: 'Geração de Imagens',
        description: 'Criando imagens educativas para os slides',
        estimatedDuration: 45,
        icon: Sparkles
      });
    }

    baseStages.push({
      id: 'finalization',
      title: 'Finalizando',
      description: 'Salvando e organizando seu material',
      estimatedDuration: 5,
      icon: BookOpen
    });

    return baseStages;
  };

  const updateProgress = (stage: string, progress: number, message: string, isComplete: boolean = false) => {
    setGenerationProgress({
      stage,
      progress: Math.min(100, Math.max(0, progress)),
      message,
      isComplete
    });
  };

  const materialTypes: MaterialTypeOption[] = [
    {
      id: 'plano-de-aula',
      title: 'Plano de Aula',
      description: 'Documento completo alinhado à BNCC com objetivos, conteúdos e estratégias.',
      icon: BookOpen,
      color: 'text-blue-700',
      bgGradient: 'bg-gradient-to-br from-blue-50 to-blue-100',
      iconBg: 'bg-blue-500',
      hoverEffect: 'hover:shadow-blue-200 hover:scale-[1.02] hover:bg-gradient-to-br hover:from-blue-100 hover:to-blue-150'
    },
    {
      id: 'slides',
      title: 'Slides',
      description: 'Apresentação visual com os principais pontos da aula.',
      icon: Monitor,
      color: 'text-slate-700',
      bgGradient: 'bg-gradient-to-br from-slate-50 to-slate-100',
      iconBg: 'bg-slate-500',
      hoverEffect: 'hover:shadow-slate-200 hover:scale-[1.02] hover:bg-gradient-to-br hover:from-slate-100 hover:to-slate-150',
      blocked: currentPlan.id === 'gratuito' && !canEditMaterials()
    },
    {
      id: 'atividade',
      title: 'Atividade',
      description: 'Exercícios e tarefas para fixação do conteúdo.',
      icon: FileText,
      color: 'text-emerald-700',
      bgGradient: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
      iconBg: 'bg-emerald-500',
      hoverEffect: 'hover:shadow-emerald-200 hover:scale-[1.02] hover:bg-gradient-to-br hover:from-emerald-100 hover:to-emerald-150'
    },
    {
      id: 'avaliacao',
      title: 'Avaliação',
      description: 'Teste formal para verificar o aprendizado dos alunos.',
      icon: ClipboardCheck,
      color: 'text-purple-700',
      bgGradient: 'bg-gradient-to-br from-purple-50 to-purple-100',
      iconBg: 'bg-purple-500',
      hoverEffect: 'hover:shadow-purple-200 hover:scale-[1.02] hover:bg-gradient-to-br hover:from-purple-100 hover:to-purple-150',
      blocked: currentPlan.id === 'gratuito' && !canCreateAssessments()
    },
    {
      id: 'apoio',
      title: 'Apoio',
      description: 'Material de apoio para outros materiais, como slides ou atividades.',
      icon: FileText,
      color: 'text-gray-700',
      bgGradient: 'bg-gradient-to-br from-gray-50 to-gray-100',
      iconBg: 'bg-gray-500',
      hoverEffect: 'hover:shadow-gray-200 hover:scale-[1.02] hover:bg-gradient-to-br hover:from-gray-100 hover:to-gray-150'
    }
  ];

  const subjects = getSubjects();
  const grades = getGrades();
  
  const addSubject = () => {
    setFormData({
      ...formData,
      subjects: [...formData.subjects, '']
    });
  };

  const removeSubject = (index: number) => {
    if (formData.subjects.length > 1) {
      const newSubjects = formData.subjects.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        subjects: newSubjects
      });
      
      // Remove from invalid subjects if it was there
      const removedSubject = formData.subjects[index];
      if (invalidSubjects.includes(removedSubject)) {
        setInvalidSubjects(invalidSubjects.filter(s => s !== removedSubject));
      }
    }
  };

  const updateSubject = (index: number, value: string) => {
    const newSubjects = [...formData.subjects];
    const oldValue = newSubjects[index];
    newSubjects[index] = value;
    setFormData({
      ...formData,
      subjects: newSubjects
    });
    
    // Update invalid subjects list
    if (invalidSubjects.includes(oldValue)) {
      const updatedInvalidSubjects = invalidSubjects.filter(s => s !== oldValue);
      if (value && !updatedInvalidSubjects.includes(value)) {
        // Don't automatically add to invalid - let validation determine
      }
      setInvalidSubjects(updatedInvalidSubjects);
    }
  };

  const handleTypeSelection = (type: MaterialType) => {
    // Verificar se o tipo está bloqueado
    const typeConfig = materialTypes.find(t => t.id === type);
    if (typeConfig?.blocked) {
      openUpgradeModal();
      return;
    }

    setSelectedType(type);
    setStep('form');
    // Reset subjects para avaliações
    if (type === 'avaliacao') {
      setFormData(prev => ({
        ...prev,
        subjects: ['']
      }));
    }
  };

  const handleBackToSelection = () => {
    setStep('selection');
    setSelectedType(null);
  };

  const handleFormSubmit = async () => {
    console.log('🚀 Iniciando processo de criação de material');
    
    // Verificar permissões antes de começar
    const hasPermission = await checkPermissions();
    if (!hasPermission) {
      return;
    }

    // Verificar campos básicos
    if (!formData.subject || !formData.grade) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    // Para avaliações, verificar se há assuntos preenchidos
    if (selectedType === 'avaliacao') {
      const validSubjects = formData.subjects.filter(s => s.trim() !== '');
      if (validSubjects.length === 0) {
        toast.error('Adicione pelo menos um assunto/conteúdo para a avaliação');
        return;
      }
    } else {
      // Para outros tipos, verificar se o tema foi preenchido
      if (!formData.topic) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }
    }

    // ETAPA 1: Iniciar processo de geração
    console.log('📊 Iniciando processo de geração - abrindo modal de carregamento');
    setStep('generating');
    setIsGenerating(true);
    updateProgress('validation', 15, 'Iniciando validação BNCC...');

    try {
      // ETAPA 2: Validar tema(s) na BNCC
      console.log('🔍 Chamando validação BNCC');
      updateProgress('validation', 35, 'Validando alinhamento com a BNCC...');
      
      // Extrair série sem a categoria
      const serieParaValidacao = formData.grade.includes('-') 
        ? formData.grade.split('-')[1] 
        : formData.grade;
      
      if (selectedType === 'avaliacao') {
        // Para avaliações, usar validação múltipla
        const temasParaValidacao = formData.subjects.filter(s => s.trim() !== '');
        console.log('📋 Dados para validação múltipla:', { temas: temasParaValidacao, disciplina: formData.subject, serie: serieParaValidacao });
        
        updateProgress('validation', 60, 'Validando múltiplos conteúdos...');
        
        const enhancedValidationData = await EnhancedBNCCValidationService.validateMultipleTopics(
          temasParaValidacao, 
          formData.subject, 
          serieParaValidacao
        );
        
        console.log('📊 Resultado da validação múltipla:', enhancedValidationData);
        setEnhancedValidationResult(enhancedValidationData);
        
        // ETAPA 3: Verificar resultado da validação
        if (!enhancedValidationData.overallValid) {
          console.log('⚠️ Nem todos os temas estão alinhados com BNCC - parando processo e abrindo modal de validação');
          
          // Marcar temas inválidos
          setInvalidSubjects(enhancedValidationData.invalidThemes);
          
          // FECHAR modal de carregamento
          setIsGenerating(false);
          setStep('form');
          updateProgress('validation', 0, 'Preparando validação...');
          
          // Aguardar transição e abrir modal de validação
          setTimeout(() => {
            setShowEnhancedBNCCValidation(true);
          }, 300);
          
          return; // PARAR AQUI - não gerar material
        }
      } else {
        // Para outros tipos, usar validação simples
        const tema = formData.topic;
        console.log('📋 Dados para validação simples:', { tema, disciplina: formData.subject, serie: serieParaValidacao });
        
        updateProgress('validation', 60, 'Verificando conformidade BNCC...');
        
        const validationResponse = await supabase.functions.invoke('validarTemaBNCC', {
          body: { 
            tema, 
            disciplina: formData.subject, 
            serie: serieParaValidacao 
          }
        });

        if (validationResponse.error) {
          console.error('❌ Erro na validação BNCC:', validationResponse.error);
          throw new Error(validationResponse.error.message);
        }

        const validationData = validationResponse.data;
        console.log('📊 Resultado da validação simples:', validationData);

        const validationResult: ValidationResult = {
          isValid: Boolean(validationData.alinhado),
          confidence: validationData.alinhado ? 1 : 0,
          suggestions: Array.isArray(validationData.sugestoes) ? validationData.sugestoes : [],
          feedback: validationData.mensagem || 'Validação BNCC concluída.'
        };

        setValidationResult(validationResult);

        // ETAPA 3: Verificar resultado da validação
        if (!validationResult.isValid) {
          console.log('⚠️ Tema NÃO alinhado com BNCC - parando processo e abrindo modal de validação');
          
          // FECHAR modal de carregamento
          setIsGenerating(false);
          setStep('form');
          updateProgress('validation', 0, 'Preparando validação...');
          
          // Aguardar transição e abrir modal de validação
          setTimeout(() => {
            setShowBNCCValidation(true);
          }, 300);
          
          return; // PARAR AQUI - não gerar material
        }
      }

      // ETAPA 4: Se chegou aqui, tema(s) está(ão) alinhado(s) - continuar com geração
      console.log('✅ Tema(s) alinhado(s) com BNCC - continuando com geração');
      updateProgress('validation', 85, 'Validação BNCC concluída com sucesso!');
      
      // Aguardar um momento para mostrar conclusão da validação
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await realizarGeracao();
      
    } catch (error) {
      console.error('❌ Erro na validação BNCC:', error);
      
      // Em caso de erro na validação, PARAR o processo
      setIsGenerating(false);
      setStep('form');
      updateProgress('validation', 0, 'Preparando validação...');
      
      toast.error(`Erro na validação BNCC: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const handleBNCCValidationAccept = async () => {
    console.log('👤 Usuário escolheu gerar material mesmo com tema não alinhado');
    setShowBNCCValidation(false);
    setShowEnhancedBNCCValidation(false);
    
    // Voltar para modal de carregamento
    setStep('generating');
    setIsGenerating(true);
    updateProgress('validation', 85, 'Validação BNCC concluída com sucesso!');
    
    // Aguardar um pouco e continuar geração
    setTimeout(async () => {
      await realizarGeracao();
    }, 500);
  };

  const handleBNCCValidationClose = () => {
    console.log('👤 Usuário fechou modal de validação BNCC');
    setShowBNCCValidation(false);
    setShowEnhancedBNCCValidation(false);
    setValidationResult(null);
    setEnhancedValidationResult(null);
    // Usuário volta para o formulário para corrigir
  };

  const handleFixThemes = (invalidThemes: string[]) => {
    console.log('👤 Usuário escolheu corrigir temas específicos:', invalidThemes);
    setInvalidSubjects(invalidThemes);
    // Modal já será fechado pelo componente
  };

  const realizarGeracao = async () => {
    if (!selectedType || !user) return;

    setIsGenerating(true);
    setGenerationProgress({
      stage: 'validation',
      progress: 0,
      message: 'Preparando validação...',
      isComplete: false
    });

    try {
      // Adicionar timeout para evitar travamentos na geração
      const generationPromise = (async () => {
        const progressStages = getProgressStages(selectedType);
        let currentStageIndex = 0;

        // Simular progresso inicial
        updateProgress('validation', 10, 'Iniciando validação BNCC...');

        // Validação BNCC com timeout
        const validationPromise = BNCCValidationService.validateTopic(formData.topic, formData.subject, formData.grade);
        const validationTimeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout na validação BNCC')), 30000)
        );

        const validationResult = await Promise.race([validationPromise, validationTimeout]) as ValidationResult;
        
        updateProgress('validation', 100, 'Validação BNCC concluída', true);
        currentStageIndex++;

        if (!validationResult.isValid) {
          setValidationResult(validationResult);
          setShowBNCCValidation(true);
          setIsGenerating(false);
          return;
        }

        // Validação BNCC Aprimorada
        updateProgress('enhanced_validation', 10, 'Validação BNCC aprimorada...');
        
        const enhancedValidationPromise = EnhancedBNCCValidationService.validateMultipleTopics([formData.topic], formData.subject, formData.grade);
        const enhancedValidationTimeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout na validação BNCC aprimorada')), 30000)
        );

        const enhancedValidationResult = await Promise.race([enhancedValidationPromise, enhancedValidationTimeout]) as EnhancedBNCCValidation;
        
        updateProgress('enhanced_validation', 100, 'Validação BNCC aprimorada concluída', true);
        currentStageIndex++;

        if (!enhancedValidationResult.overallValid) {
          setEnhancedValidationResult(enhancedValidationResult);
          setShowEnhancedBNCCValidation(true);
          setIsGenerating(false);
          return;
        }

        // Geração do material
        updateProgress('generation', 10, 'Gerando material...');
        
        const generationTimeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout na geração do material')), 120000) // 2 minutos
        );

        const materialPromise = materialService.generateMaterial(selectedType, formData);
        const generatedMaterial = await Promise.race([materialPromise, generationTimeout]) as GeneratedMaterial;
        
        updateProgress('generation', 100, 'Material gerado com sucesso!', true);
        currentStageIndex++;

        // Finalização
        updateProgress('completion', 100, 'Processo concluído!', true);

        setGeneratedMaterial(generatedMaterial);
        setShowMaterialModal(true);
        setIsGenerating(false);

        // Incrementar contador de materiais após sucesso
        await incrementMaterialCount();

        // Registrar atividade
        activityService.addActivity({
          type: 'created',
          title: generatedMaterial.title,
          description: `Material ${selectedType} criado: ${generatedMaterial.title}`,
          materialType: selectedType,
          materialId: generatedMaterial.id,
          subject: formData.subject,
          grade: formData.grade
        });

      })();

      const overallTimeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout geral na geração')), 180000) // 3 minutos total
      );

      await Promise.race([generationPromise, overallTimeout]);

    } catch (error) {
      console.error('Erro durante a geração:', error);
      setIsGenerating(false);
      
      if (error instanceof Error && error.message.includes('Timeout')) {
        toast.error('Tempo limite excedido. Tente novamente ou simplifique o conteúdo.');
      } else {
        toast.error('Erro ao gerar material. Tente novamente.');
      }
    }
  };

  const getCurrentTypeInfo = () => {
    return materialTypes.find(type => type.id === selectedType);
  };

  const handleNextStepsClose = () => {
    setShowNextStepsModal(false);
    // Reset form
    setFormData({
      topic: '',
      subject: '',
      grade: '',
      questionType: 'mistas',
      questionCount: [5],
      subjects: ['']
    });
    setSelectedType(null);
  };

  const handleNextStepsContinue = () => {
    setShowNextStepsModal(false);
    setShowMaterialModal(true);
  };

  const handleMaterialModalClose = () => {
    setShowMaterialModal(false);
    setGeneratedMaterial(null);
    // Reset form
    setFormData({
      topic: '',
      subject: '',
      grade: '',
      questionType: 'mistas',
      questionCount: [5],
      subjects: ['']
    });
    setSelectedType(null);
  };

  // Função para abrir o modal de edição
  const handleEditMaterial = () => {
    setShowMaterialModal(false);
    setEditMaterial(generatedMaterial);
    setShowEditModal(true);
  };

  // Função para fechar o modal de edição e reabrir o de visualização
  const handleEditModalClose = async (updated?: boolean) => {
    setShowEditModal(false);
    if (updated && generatedMaterial) {
      // Recarregar o material atualizado do Supabase
      const updatedMaterial = await materialService.getMaterialById(generatedMaterial.id);
      setGeneratedMaterial(updatedMaterial);
    }
    setTimeout(() => setShowMaterialModal(true), 200); // Pequeno delay para evitar sobreposição
  };

  const getGradeDisplayName = (value: string) => {
    for (const category of grades) {
      for (const option of category.options) {
        if (`${category.category}-${option}` === value) {
          return `${option} (${category.category})`;
        }
      }
    }
    return value;
  };

  const getSubjectInputStyle = (subject: string, index: number) => {
    const isInvalid = invalidSubjects.includes(subject) && subject.trim() !== '';
    return `h-12 text-base border-2 rounded-xl bg-gray-50 focus:bg-white transition-all ${
      isInvalid 
        ? 'border-red-300 focus:border-red-400 bg-red-50' 
        : 'border-gray-200 focus:border-blue-400'
    }`;
  };

  const handleTranscriptionComplete = (result: {
    text: string;
    tema: string;
    disciplina: string | null;
    turma: string | null;
  }) => {
    console.log('Transcrição recebida:', result);
    
    // Atualizar o tema da aula
    setFormData(prev => ({
      ...prev,
      topic: result.tema
    }));

    // Se disciplina foi identificada, selecionar automaticamente
    if (result.disciplina && subjects.includes(result.disciplina)) {
      setFormData(prev => ({
        ...prev,
        subject: result.disciplina!
      }));
    }

    // Se turma foi identificada, selecionar automaticamente
    if (result.turma) {
      // Procurar a turma nas categorias
      for (const category of grades) {
        if (category.options.includes(result.turma)) {
          const gradeValue = `${category.category}-${result.turma}`;
          setFormData(prev => ({
            ...prev,
            grade: gradeValue
          }));
          break;
        }
      }
    }

    toast.success(
      `Transcrição: "${result.text}"` + 
      (result.disciplina ? ` | Disciplina: ${result.disciplina}` : '') +
      (result.turma ? ` | Turma: ${result.turma}` : '')
    );
  };

  if (step === 'selection') {
    return (
      <>
        <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-2 sm:p-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-4 sm:mb-6">
              <div className="relative mb-3">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-50 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg">
                  <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-yellow-400 rounded-full animate-bounce"></div>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Preparar Material
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-xl mx-auto px-4">
                Crie conteúdos pedagógicos incríveis com inteligência artificial. 
                Escolha o tipo de material e deixe a magia acontecer! ✨
              </p>
              
              {/* Indicador de materiais restantes */}
              <div className="mt-4 inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-md border">
                <span className="text-sm text-gray-600">
                  Materiais restantes: <span className="font-bold text-blue-600">{currentPlan.id === 'admin' ? 'Ilimitado' : getRemainingMaterials()}</span>
                </span>
              </div>
            </div>

            <div className="mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-3 text-center px-4">
                Selecione o tipo de conteúdo que você deseja criar:
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 px-2">
              {materialTypes.map(type => {
                const Icon = type.icon;
                
                if (type.blocked) {
                  return (
                    <BlockedFeature
                      key={type.id}
                      title="Recurso Premium"
                      description={`${type.title} está disponível apenas em planos pagos`}
                      onUpgrade={openUpgradeModal}
                      className="h-24 sm:h-28"
                    >
                      <div className="flex items-center justify-between h-full">
                        <div className="flex items-center space-x-3 sm:space-x-4 flex-1">
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 ${type.iconBg} rounded-xl flex items-center justify-center shadow-md`}>
                            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className={`text-base sm:text-lg font-bold ${type.color} mb-1`}>{type.title}</h3>
                            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{type.description}</p>
                          </div>
                        </div>
                      </div>
                    </BlockedFeature>
                  );
                }

                return (
                  <Card key={type.id} className={`cursor-pointer border-2 border-transparent transition-all duration-300 ${type.bgGradient} ${type.hoverEffect} shadow-lg hover:shadow-xl h-24 sm:h-28`} onClick={() => handleTypeSelection(type.id)}>
                    <CardContent className="p-3 sm:p-4 relative h-full">
                      <div className="flex items-center justify-between h-full">
                        <div className="flex items-center space-x-3 sm:space-x-4 flex-1">
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 ${type.iconBg} rounded-xl flex items-center justify-center shadow-md transform transition-transform hover:scale-110`}>
                            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className={`text-base sm:text-lg font-bold ${type.color} mb-1`}>{type.title}</h3>
                            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{type.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center ml-3">
                          <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <ArrowLeft className="w-3 h-3 text-gray-400 rotate-180" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="mt-4 sm:mt-6 text-center">
              <div className="inline-flex items-center space-x-2 bg-white px-4 py-2 sm:px-6 sm:py-3 rounded-full shadow-md">
                <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                <span className="text-sm sm:text-base text-gray-600 font-medium">AulagIA - Prepare suas Aulas em Minutos</span>
              </div>
            </div>
          </div>
        </main>
        
        {/* Modal de validação BNCC */}
        <BNCCValidationModal 
          open={showBNCCValidation} 
          onClose={handleBNCCValidationClose} 
          validationData={validationResult}
          tema={selectedType === 'avaliacao' ? formData.subjects.filter(s => s.trim() !== '').join(', ') : formData.topic} 
          disciplina={formData.subject || ''} 
          serie={formData.grade} 
          onAccept={handleBNCCValidationAccept} 
        />
        
        {/* Modal de validação BNCC avançada (para avaliações) */}
        <EnhancedBNCCValidationModal 
          open={showEnhancedBNCCValidation} 
          onClose={handleBNCCValidationClose} 
          validationData={enhancedValidationResult}
          disciplina={formData.subject || ''} 
          serie={formData.grade} 
          onAccept={handleBNCCValidationAccept}
          onFixThemes={handleFixThemes}
        />
        
        {/* Modal de visualização do material - aparece primeiro */}
        <MaterialModal 
          material={normalizeMaterialForPreview(generatedMaterial)} 
          open={showMaterialModal || showNextStepsModal} 
          onClose={handleMaterialModalClose} 
          onEdit={() => {
            setShowMaterialModal(false);
            // Navegar para a página de Meus Materiais e abrir o modal de edição
            navigate(`/materiais?edit=${generatedMaterial?.id}`);
          }}
        />
        {showEditModal && editMaterial && (
          <MaterialEditModal
            material={editMaterial}
            open={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setTimeout(() => setShowMaterialModal(true), 200);
            }}
            onSave={async () => {
              setShowEditModal(false);
              // Recarrega o material atualizado do Supabase
              const updatedMaterial = await materialService.getMaterialById(editMaterial.id);
              setGeneratedMaterial(updatedMaterial);
              setTimeout(() => setShowMaterialModal(true), 200);
            }}
          />
        )}
        
        {/* Modal de próximos passos - aparece por cima */}
        <NextStepsModal
          open={showNextStepsModal}
          onClose={handleNextStepsClose}
          onContinue={handleNextStepsContinue}
          materialType={selectedType || ''}
        />
        
        {/* Modal de upgrade que aparece quando o limite é atingido */}
        <UpgradeModal
          isOpen={isUpgradeModalOpen}
          onClose={closeUpgradeModal}
          currentPlan={currentPlan}
          onPlanSelect={handlePlanSelection}
        />
      </>
    );
  }

  if (step === 'form') {
    const typeInfo = getCurrentTypeInfo();
    const Icon = typeInfo?.icon || BookOpen;

    if (!typeInfo) {
      return (
        <main className="min-h-screen flex items-center justify-center">
          <div className="bg-white p-8 rounded-xl shadow-xl text-center">
            <h2 className="text-xl font-bold text-red-600 mb-2">Erro ao carregar formulário</h2>
            <p className="text-gray-700 mb-4">Não foi possível carregar o tipo de material selecionado. Por favor, volte e tente novamente.</p>
            <Button onClick={handleBackToSelection}>Voltar</Button>
          </div>
        </main>
      );
    }
    
    return (
      <FormErrorBoundary>
        <>
          <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-2 sm:p-4">
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8 mb-4">
                <div className="flex items-center mb-6">
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 ${typeInfo?.iconBg} rounded-xl sm:rounded-2xl flex items-center justify-center mr-4 sm:mr-6 shadow-lg`}>
                    <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Criar {typeInfo?.title}
                    </h1>
                    <p className="text-sm sm:text-base lg:text-lg text-gray-600 mt-1">
                      Preencha os detalhes para criar seu {typeInfo?.title.toLowerCase()}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Campo de Tema da Aula (apenas para tipos que não são avaliação) */}
                  {selectedType !== 'avaliacao' && (
                    <div>
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg text-white text-sm flex items-center justify-center font-bold shadow-md">
                          T
                        </div>
                        <Label className="text-base sm:text-lg font-semibold text-gray-800">Tema da Aula</Label>
                      </div>
                      <div className="relative">
                        <Input 
                          placeholder="Ex: Introdução à Álgebra Linear" 
                          value={formData.topic} 
                          onChange={e => setFormData({
                            ...formData,
                            topic: e.target.value
                          })} 
                          className="pr-12 h-12 sm:h-14 text-base sm:text-lg border-2 border-gray-200 focus:border-blue-400 rounded-xl bg-gray-50 focus:bg-white transition-all" 
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <AudioTranscriptionButton onTranscriptionComplete={handleTranscriptionComplete} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Campo para múltiplos assuntos/conteúdos (apenas para avaliações) */}
                  {selectedType === 'avaliacao' && (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg text-white text-sm flex items-center justify-center font-bold shadow-md">
                          C
                        </div>
                        <Label className="text-base sm:text-lg font-semibold text-gray-800">Conteúdos da Avaliação</Label>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Adicione os assuntos ou conteúdos específicos que serão abordados na avaliação.
                        As questões serão baseadas nesses temas.
                      </p>
                      
                      <div className="space-y-3">
                        {formData.subjects.map((subject, index) => {
                          const isInvalid = invalidSubjects.includes(subject) && subject.trim() !== '';
                          
                          return (
                            <div key={index} className="flex items-center space-x-3">
                              <div className="flex-1">
                                <Input 
                                  placeholder={`Ex: ${index === 0 ? 'Equações do 1º grau' : index === 1 ? 'Sistemas lineares' : 'Funções quadráticas'}`}
                                  value={subject} 
                                  onChange={e => updateSubject(index, e.target.value)} 
                                  className={getSubjectInputStyle(subject, index)}
                                />
                                {isInvalid && (
                                  <p className="text-xs text-red-600 mt-1 ml-2">
                                    Este conteúdo não está alinhado com a BNCC para a série selecionada
                                  </p>
                                )}
                              </div>
                              {formData.subjects.length > 1 && (
                                <Button 
                                  type="button" 
                                  onClick={() => removeSubject(index)} 
                                  variant="outline" 
                                  size="sm" 
                                  className="flex items-center justify-center w-12 h-12 hover:bg-red-50 border-red-200 text-red-500"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Botão Adicionar movido para baixo dos campos */}
                      <div className="flex justify-center pt-2">
                        <Button 
                          type="button" 
                          onClick={addSubject} 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center space-x-2 hover:bg-blue-50 border-blue-200"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Adicionar Conteúdo</span>
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg text-white text-sm flex items-center justify-center font-bold shadow-md">
                          D
                        </div>
                        <Label className="text-base sm:text-lg font-semibold text-gray-800">Disciplina</Label>
                      </div>
                      <Select value={formData.subject} onValueChange={value => setFormData({
                        ...formData,
                        subject: value
                      })}>
                        <SelectTrigger className="h-12 sm:h-14 text-base sm:text-lg border-2 border-gray-200 focus:border-blue-400 rounded-xl bg-gray-50 focus:bg-white">
                          <SelectValue placeholder="Selecione uma disciplina" />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="grid grid-cols-2 gap-1 p-2">
                            {subjects.map(subject => (
                              <SelectItem key={subject} value={subject}>
                                {subject}
                              </SelectItem>
                            ))}
                          </div>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white text-sm flex items-center justify-center font-bold shadow-md">
                          A
                        </div>
                        <Label className="text-base sm:text-lg font-semibold text-gray-800">Turma (Série/Ano)</Label>
                      </div>
                      <Select value={formData.grade} onValueChange={value => setFormData({
                        ...formData,
                        grade: value
                      })}>
                        <SelectTrigger className="h-12 sm:h-14 text-base sm:text-lg border-2 border-gray-200 focus:border-blue-400 rounded-xl bg-gray-50 focus:bg-white">
                          <SelectValue placeholder="Selecione a turma" />
                        </SelectTrigger>
                        <SelectContent>
                          {grades.map(category => (
                            <div key={category.category}>
                              <div className="px-3 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-lg mx-2 mt-2">
                                {category.category}
                              </div>
                              {category.options.map(option => (
                                <SelectItem key={`${category.category}-${option}`} value={`${category.category}-${option}`}>
                                  {option}
                                </SelectItem>
                              ))}
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Campos específicos para atividades e avaliações */}
                  {(selectedType === 'atividade' || selectedType === 'avaliacao') && (
                    <div className="space-y-6 border-t border-gray-200 pt-6">
                      <div className="text-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Configurações de Questões</h3>
                        <p className="text-sm text-gray-600">Personalize o tipo e quantidade de questões</p>
                      </div>

                      <div>
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg text-white text-sm flex items-center justify-center font-bold shadow-md">
                            ?
                          </div>
                          <Label className="text-base sm:text-lg font-semibold text-gray-800">Tipo de Questões</Label>
                        </div>
                        <RadioGroup value={formData.questionType} onValueChange={value => setFormData({
                          ...formData,
                          questionType: value
                        })} className="grid grid-cols-3 gap-2 sm:gap-4">
                          <div className="flex items-center space-x-1 sm:space-x-2 p-2 sm:p-3 border-2 border-gray-200 rounded-lg sm:rounded-xl hover:border-orange-300 transition-colors">
                            <RadioGroupItem value="abertas" id="abertas" />
                            <Label htmlFor="abertas" className="cursor-pointer font-medium text-xs sm:text-base">Abertas</Label>
                          </div>
                          <div className="flex items-center space-x-1 sm:space-x-2 p-2 sm:p-3 border-2 border-gray-200 rounded-lg sm:rounded-xl hover:border-orange-300 transition-colors">
                            <RadioGroupItem value="fechadas" id="fechadas" />
                            <Label htmlFor="fechadas" className="cursor-pointer font-medium text-xs sm:text-base">Fechadas</Label>
                          </div>
                          <div className="flex items-center space-x-1 sm:space-x-2 p-2 sm:p-3 border-2 border-gray-200 rounded-lg sm:rounded-xl hover:border-orange-300 transition-colors">
                            <RadioGroupItem value="mistas" id="mistas" />
                            <Label htmlFor="mistas" className="cursor-pointer font-medium text-xs sm:text-base">Mistas</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div>
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg text-white text-sm flex items-center justify-center font-bold shadow-md">
                            <Hash className="w-4 h-4" />
                          </div>
                          <Label className="text-base sm:text-lg font-semibold text-gray-800">Quantidade de Questões</Label>
                        </div>
                        <div className="space-y-4">
                          <div className="px-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">Questões: {formData.questionCount[0]}</span>
                              <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <Sliders className="w-3 h-3" />
                                <span>Deslize para ajustar</span>
                              </div>
                            </div>
                            <Slider 
                              value={formData.questionCount} 
                              onValueChange={value => setFormData({
                                ...formData,
                                questionCount: value
                              })} 
                              max={20} 
                              min={1} 
                              step={1} 
                              className="w-full" 
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>1</span>
                              <span>10</span>
                              <span>20</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row justify-between items-center pt-6 gap-4">
                    <Button 
                      variant="outline" 
                      onClick={handleBackToSelection} 
                      className="w-full sm:w-auto flex items-center justify-center space-x-2 h-10 sm:h-12 px-4 sm:px-6 border-2 hover:bg-gray-50 rounded-xl"
                    >
                      <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="font-semibold">Voltar</span>
                    </Button>

                    <Button 
                      onClick={handleFormSubmit} 
                      disabled={!formData.subject || !formData.grade || (selectedType !== 'avaliacao' && !formData.topic) || (selectedType === 'avaliacao' && formData.subjects.filter(s => s.trim() !== '').length === 0)} 
                      className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white flex items-center justify-center space-x-2 h-10 sm:h-12 px-4 sm:px-8 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Wand2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="font-semibold">Criar {typeInfo?.title}</span>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center space-x-2 bg-white px-4 py-2 sm:px-6 sm:py-3 rounded-full shadow-md">
                  <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  <span className="text-sm sm:text-base text-gray-600 font-medium">Conteúdo alinhado à BNCC</span>
                </div>
              </div>
            </div>
          </main>

          {/* Modal de validação BNCC simples (para outros tipos) */}
          <BNCCValidationModal 
            open={showBNCCValidation} 
            onClose={handleBNCCValidationClose} 
            validationData={validationResult}
            tema={selectedType === 'avaliacao' ? formData.subjects.filter(s => s.trim() !== '').join(', ') : formData.topic} 
            disciplina={formData.subject || ''} 
            serie={formData.grade} 
            onAccept={handleBNCCValidationAccept} 
          />

          {/* Modal de validação BNCC avançada (para avaliações) */}
          <EnhancedBNCCValidationModal 
            open={showEnhancedBNCCValidation} 
            onClose={handleBNCCValidationClose} 
            validationData={enhancedValidationResult}
            disciplina={formData.subject || ''} 
            serie={formData.grade} 
            onAccept={handleBNCCValidationAccept}
            onFixThemes={handleFixThemes}
          />

          {/* Modal de visualização do material - aparece primeiro */}
          <MaterialModal 
            material={normalizeMaterialForPreview(generatedMaterial)} 
            open={showMaterialModal || showNextStepsModal} 
            onClose={handleMaterialModalClose} 
            onEdit={() => {
              setShowMaterialModal(false);
              setEditMaterial(generatedMaterial);
              setShowEditModal(true);
            }}
          />
          {showEditModal && editMaterial && (
            <MaterialEditModal
              material={editMaterial}
              open={showEditModal}
              onClose={() => {
                setShowEditModal(false);
                setTimeout(() => setShowMaterialModal(true), 200);
              }}
              onSave={async () => {
                setShowEditModal(false);
                // Recarrega o material atualizado do Supabase
                const updatedMaterial = await materialService.getMaterialById(editMaterial.id);
                setGeneratedMaterial(updatedMaterial);
                setTimeout(() => setShowMaterialModal(true), 200);
              }}
            />
          )}
          
          {/* Modal de próximos passos - aparece por cima */}
          <NextStepsModal
            open={showNextStepsModal}
            onClose={handleNextStepsClose}
            onContinue={handleNextStepsContinue}
            materialType={selectedType || ''}
          />
          
          {/* Modal de upgrade que aparece quando o limite é atingido */}
          <UpgradeModal
            isOpen={isUpgradeModalOpen}
            onClose={closeUpgradeModal}
            currentPlan={currentPlan}
            onPlanSelect={handlePlanSelection}
          />
        </>
      </FormErrorBoundary>
    );
  }

  if (step === 'generating') {
    const stages = getProgressStages(selectedType || '');
    const currentStageIndex = stages.findIndex(stage => stage.id === generationProgress.stage);
    const currentStage = stages[currentStageIndex];
    const StageIcon = currentStage?.icon || BookOpen;

    return (
      <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-2 sm:p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm sm:max-w-lg w-full shadow-xl">
            <div className="text-center">
              {/* Centered icon section */}
              <div className="relative mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <StageIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white animate-pulse" />
                </div>
                <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                  <Sparkles className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                </div>
              </div>
              
              {/* Content section */}
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                    {currentStage?.title || 'Processando...'}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 mb-2">
                    {currentStage?.description || 'Aguarde enquanto processamos seu material...'}
                  </p>
                  <p className="text-xs sm:text-sm text-blue-600 font-medium">
                    {generationProgress.message}
                  </p>
                </div>
                
                {/* Progress section */}
                <div className="space-y-3">
                  <Progress value={generationProgress.progress} className="h-3 bg-gray-200" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Etapa {currentStageIndex + 1} de {stages.length}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {Math.round(generationProgress.progress)}%
                    </span>
                  </div>
                </div>

                {/* Stages indicator */}
                <div className="flex justify-center space-x-2">
                  {stages.map((stage, index) => {
                    const isCompleted = index < currentStageIndex;
                    const isCurrent = index === currentStageIndex;
                    
                    return (
                      <div
                        key={stage.id}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          isCompleted 
                            ? 'bg-green-500' 
                            : isCurrent 
                              ? 'bg-blue-500 animate-pulse' 
                              : 'bg-gray-300'
                        }`}
                      />
                    );
                  })}
                </div>

                {/* Friendly reassurance message */}
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <p className="text-xs sm:text-sm text-blue-700">
                    {selectedType === 'slides' 
                       ? '✨ Estamos criando um material incrível com imagens personalizadas! Isso pode levar alguns minutos.'
                       : '🎯 Estamos trabalhando para criar o melhor material possível para você!'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return null;
};

export default CreateLesson;
