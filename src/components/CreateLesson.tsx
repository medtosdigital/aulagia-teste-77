import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Loader2, ChevronRight, BookOpen, FileText, ClipboardCheck, PresentationChart, HelpCircle, Sparkles } from 'lucide-react';
import { materialService } from '@/services/materialService';
import { BNCCValidationService } from '@/services/bnccValidationService';
import { EnhancedBNCCValidationService } from '@/services/enhancedBNCCValidationService';
import { BNCCValidationModal } from './BNCCValidationModal';
import { EnhancedBNCCValidationModal } from './EnhancedBNCCValidationModal';
import { useActivityTracker } from '@/hooks/useActivityTracker';
import { usePlanPermissions } from '@/hooks/usePlanPermissions';
import { UpgradeModal } from './UpgradeModal';
import { BlockedFeature } from './BlockedFeature';

interface FormData {
  topic: string;
  subject: string;
  grade: string;
  questionType: string;
  questionCount: number[];
  subjects: string[];
  professor: string;
  duracao: string;
  data: string;
  bncc: string;
  turma: string;
  tipoQuestoes: string[];
}

interface ValidationResult {
  isValid: boolean;
  confidence: number;
  suggestions: string[];
  feedback: string;
}

interface EnhancedValidationResult {
  overallValid: boolean;
  individualValidations: {
    tema: string;
    isValid: boolean;
    confidence: number;
    feedback: string;
    suggestions: string[];
  }[];
  overallFeedback: string;
  hasPartiallyValid: boolean;
  validThemes: string[];
  invalidThemes: string[];
}

const materialTypes = [
  { value: 'plano-de-aula', label: 'Plano de Aula', icon: <BookOpen className="mr-2 h-4 w-4" /> },
  { value: 'atividade', label: 'Atividade', icon: <FileText className="mr-2 h-4 w-4" /> },
  { value: 'avaliacao', label: 'Avaliação', icon: <ClipboardCheck className="mr-2 h-4 w-4" /> },
  { value: 'slides', label: 'Slides', icon: <PresentationChart className="mr-2 h-4 w-4" /> },
  { value: 'apoio', label: 'Material de Apoio', icon: <HelpCircle className="mr-2 h-4 w-4" /> },
];

const questionTypes = [
  { value: 'multipla_escolha', label: 'Múltipla Escolha' },
  { value: 'dissertativa', label: 'Dissertativa' },
  { value: 'verdadeiro_falso', label: 'Verdadeiro ou Falso' },
  { value: 'relacione_colunas', label: 'Relacione Colunas' },
  { value: 'lacunas', label: 'Completar Lacunas' },
];

const getMaterialLabel = (type: string) => {
  const materialType = materialTypes.find(m => m.value === type);
  return materialType ? materialType.label : 'Material';
};

const CreateLesson: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [bnccValidation, setBnccValidation] = useState<ValidationResult | null>(null);
  const [enhancedBNCCValidation, setEnhancedBNCCValidation] = useState<EnhancedValidationResult | null>(null);
  const [isBNCCModalOpen, setIsBNCCModalOpen] = useState(false);
  const [isEnhancedBNCCModalOpen, setIsEnhancedBNCCModalOpen] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState('');
  const { trackActivity } = useActivityTracker();
  const { hasPermission, checkPermission } = usePlanPermissions();

  const [formData, setFormData] = useState({
    topic: '',
    subject: '',
    grade: '',
    questionType: '',
    questionCount: [5] as number[],
    subjects: [] as string[],
    professor: '', // Adicionar campos que estão sendo usados
    duracao: '',
    data: '',
    bncc: '',
    turma: '',
    tipoQuestoes: [] as string[]
  });

  const validateTopic = async () => {
    if (!formData.topic || !formData.subject || !formData.grade) {
      toast.error('Por favor, preencha todos os campos para validar o tema.');
      return;
    }

    try {
      const result = await BNCCValidationService.validateTopic(formData.topic, formData.subject, formData.grade);
      setBnccValidation(result);
      setIsBNCCModalOpen(true);

      trackActivity('validated', {
        type: 'bncc_validation',
        title: `Validação BNCC: ${formData.topic}`,
        subject: formData.subject,
        grade: formData.grade,
        isValid: result.isValid,
        confidence: result.confidence
      });

    } catch (error) {
      console.error('Erro ao validar tema na BNCC:', error);
      toast.error('Erro ao validar tema na BNCC', {
        description: error instanceof Error ? error.message : 'Ocorreu um erro inesperado.'
      });
    }
  };

  const validateMultipleTopics = async () => {
    if (!formData.topic || !formData.subject || !formData.grade) {
      toast.error('Por favor, preencha todos os campos para validar o tema.');
      return;
    }

    const topics = formData.topic.split(',').map(topic => topic.trim());

    if (topics.length <= 1) {
      toast.error('Por favor, insira múltiplos temas separados por vírgula para usar esta validação.');
      return;
    }

    try {
      const result = await EnhancedBNCCValidationService.validateMultipleTopics(topics, formData.subject, formData.grade);
      setEnhancedBNCCValidation(result);
      setIsEnhancedBNCCModalOpen(true);

      trackActivity('validated', {
        type: 'enhanced_bncc_validation',
        title: `Validação Múltipla BNCC: ${topics.join(', ')}`,
        subject: formData.subject,
        grade: formData.grade,
        isValid: result.overallValid,
        validCount: result.validThemes.length,
        invalidCount: result.invalidThemes.length
      });

    } catch (error) {
      console.error('Erro ao validar temas na BNCC:', error);
      toast.error('Erro ao validar temas na BNCC', {
        description: error instanceof Error ? error.message : 'Ocorreu um erro inesperado.'
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    const value = e.target.value;

    setFormData(prev => {
      let updatedValues = [...prev[name as keyof FormData] as string[]];
      if (checked) {
        updatedValues.push(value);
      } else {
        updatedValues = updatedValues.filter(v => v !== value);
      }
      return { ...prev, [name]: updatedValues };
    });
  };

  const handleSubmit = async (type: string) => {
    if (!formData.topic || !formData.subject || !formData.grade) {
      toast.error('Por favor, preencha todos os campos.');
      return;
    }

    if (type === 'plano-de-aula' && !checkPermission('create_lesson_plan')) {
      setUpgradeReason('Para criar planos de aula completos.');
      setShowUpgradeModal(true);
      return;
    }

    if ((type === 'atividade' || type === 'avaliacao') && !checkPermission('create_activities')) {
      setUpgradeReason('Para criar atividades e avaliações personalizadas.');
      setShowUpgradeModal(true);
      return;
    }

    if (type === 'slides' && !checkPermission('create_slides')) {
      setUpgradeReason('Para criar apresentações de slides interativas.');
      setShowUpgradeModal(true);
      return;
    }

    if (type === 'apoio' && !checkPermission('create_support_materials')) {
      setUpgradeReason('Para criar materiais de apoio complementares.');
      setShowUpgradeModal(true);
      return;
    }

    try {
      setIsGenerating(true);
      console.log('📤 Enviando dados do formulário:', formData);

      let dataToSend: any;

      if (type === 'plano-de-aula') {
        dataToSend = {
          tema: formData.topic, // SEMPRE usar formData.topic como tema principal
          disciplina: formData.subject,
          serie: formData.grade,
          professor: formData.professor || 'Professor(a)',
          duracao: formData.duracao || '50 minutos',
          data: formData.data || new Date().toLocaleDateString('pt-BR'),
          bncc: formData.bncc || '',
          turma: formData.turma || ''
        };
      } else if (type === 'slides') {
        dataToSend = {
          tema: formData.topic, // SEMPRE usar formData.topic como tema principal
          disciplina: formData.subject,
          serie: formData.grade,
          professor: formData.professor || 'Professor(a)'
        };
      } else if (type === 'atividade' || type === 'avaliacao') {
        dataToSend = {
          tema: formData.topic, // SEMPRE usar formData.topic como tema principal
          disciplina: formData.subject,
          serie: formData.grade,
          tipoQuestoes: formData.tipoQuestoes || ['multipla_escolha'],
          numeroQuestoes: formData.questionCount[0] || 5
        };
      } else if (type === 'apoio') {
        dataToSend = {
          tema: formData.topic, // SEMPRE usar formData.topic como tema principal
          disciplina: formData.subject,
          serie: formData.grade
        };
      }

      console.log('📋 Dados finais sendo enviados:', dataToSend);
      console.log('🎯 Tema que será enviado:', dataToSend.tema);

      const result = await materialService.generateMaterial(type, dataToSend);
      
      console.log('✅ Material gerado com sucesso:', result);
      console.log('📝 Tema do material gerado:', result.content?.tema);

      trackActivity('created', {
        type,
        title: result.title,
        subject: result.subject,
        grade: result.grade,
        materialType: type,
        materialId: result.id
      });

      toast.success(`${getMaterialLabel(type)} gerado com sucesso!`, {
        description: `${result.title} foi criado e está disponível em seus materiais.`
      });

      // Reset form
      setFormData({
        topic: '',
        subject: '',
        grade: '',
        questionType: '',
        questionCount: [5],
        subjects: [],
        professor: '',
        duracao: '',
        data: '',
        bncc: '',
        turma: '',
        tipoQuestoes: []
      });

    } catch (error) {
      console.error('❌ Erro ao gerar material:', error);
      toast.error('Erro ao gerar material', {
        description: error instanceof Error ? error.message : 'Ocorreu um erro inesperado. Tente novamente.'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Crie um novo material <Sparkles className="inline-block h-5 w-5 ml-1" /></CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="topic">Tema</Label>
              <Input type="text" id="topic" name="topic" value={formData.topic} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="subject">Disciplina</Label>
              <Input type="text" id="subject" name="subject" value={formData.subject} onChange={handleChange} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="grade">Série/Ano</Label>
              <Input type="text" id="grade" name="grade" value={formData.grade} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="professor">Professor(a)</Label>
              <Input type="text" id="professor" name="professor" value={formData.professor} onChange={handleChange} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duracao">Duração (Plano de Aula)</Label>
              <Input type="text" id="duracao" name="duracao" value={formData.duracao} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="data">Data (Plano de Aula)</Label>
              <Input type="text" id="data" name="data" value={formData.data} onChange={handleChange} />
            </div>
          </div>

          <div>
            <Label htmlFor="bncc">BNCC (Plano de Aula)</Label>
            <Textarea id="bncc" name="bncc" value={formData.bncc} onChange={handleChange} className="resize-none" />
          </div>

          <div>
            <Label htmlFor="turma">Turma (Opcional)</Label>
            <Input type="text" id="turma" name="turma" value={formData.turma} onChange={handleChange} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Tipos de Questões (Atividade/Avaliação)</Label>
              <div className="flex flex-wrap gap-2">
                {questionTypes.map(type => (
                  <div key={type.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={type.value}
                      name="tipoQuestoes"
                      value={type.value}
                      onCheckedChange={(checked) => {
                        const e = {
                          target: {
                            name: 'tipoQuestoes',
                            checked: checked,
                            value: type.value,
                          }
                        } as any;
                        handleCheckboxChange(e);
                      }}
                      checked={formData.tipoQuestoes.includes(type.value)}
                    />
                    <Label htmlFor={type.value} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {type.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="questionCount">Número de Questões (Atividade/Avaliação)</Label>
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, questionCount: [Number(value)] }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione" defaultValue="5" />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 15, 20].map(count => (
                    <SelectItem key={count} value={count.toString()}>{count}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Button variant="secondary" onClick={validateTopic}>
              Validar Tema BNCC
            </Button>
            <Button variant="secondary" onClick={validateMultipleTopics}>
              Validar Múltiplos Temas BNCC
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {materialTypes.map(material => (
              <Button key={material.value} onClick={() => handleSubmit(material.value)} disabled={isGenerating}>
                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : material.icon}
                {isGenerating ? `Gerando ${material.label}...` : `Gerar ${material.label}`}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ))}
          </div>

        </CardContent>
      </Card>

      <BNCCValidationModal
        isOpen={isBNCCModalOpen}
        onClose={() => setIsBNCCModalOpen(false)}
        validationResult={bnccValidation}
      />

      <EnhancedBNCCValidationModal
        isOpen={isEnhancedBNCCModalOpen}
        onClose={() => setIsEnhancedBNCCModalOpen(false)}
        validationResult={enhancedBNCCValidation}
      />

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        reason={upgradeReason}
      />
    </div>
  );
};

export default CreateLesson;
