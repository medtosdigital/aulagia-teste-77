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
import { materialService, GeneratedMaterial } from '@/services/materialService';
import MaterialModal from './MaterialModal';
import BNCCValidationModal from './BNCCValidationModal';
import { toast } from 'sonner';
type MaterialType = 'plano-de-aula' | 'slides' | 'atividade' | 'avaliacao';
interface MaterialTypeOption {
  id: MaterialType;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  bgGradient: string;
  iconBg: string;
  hoverEffect: string;
}
const CreateLesson: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'selection' | 'form' | 'generating'>('selection');
  const [selectedType, setSelectedType] = useState<MaterialType | null>(null);
  const [formData, setFormData] = useState({
    topic: '',
    subject: '',
    grade: '',
    questionType: 'mistas',
    questionCount: [5],
    // Campo para múltiplos assuntos/conteúdos (usado para avaliações)
    subjects: [''] as string[]
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedMaterial, setGeneratedMaterial] = useState<GeneratedMaterial | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showBNCCValidation, setShowBNCCValidation] = useState(false);
  const materialTypes: MaterialTypeOption[] = [{
    id: 'plano-de-aula',
    title: 'Plano de Aula',
    description: 'Documento completo alinhado à BNCC com objetivos, conteúdos e estratégias.',
    icon: BookOpen,
    color: 'text-blue-700',
    bgGradient: 'bg-gradient-to-br from-blue-50 to-blue-100',
    iconBg: 'bg-blue-500',
    hoverEffect: 'hover:shadow-blue-200 hover:scale-[1.02] hover:bg-gradient-to-br hover:from-blue-100 hover:to-blue-150'
  }, {
    id: 'slides',
    title: 'Slides',
    description: 'Apresentação visual com os principais pontos da aula.',
    icon: Monitor,
    color: 'text-slate-700',
    bgGradient: 'bg-gradient-to-br from-slate-50 to-slate-100',
    iconBg: 'bg-slate-500',
    hoverEffect: 'hover:shadow-slate-200 hover:scale-[1.02] hover:bg-gradient-to-br hover:from-slate-100 hover:to-slate-150'
  }, {
    id: 'atividade',
    title: 'Atividade',
    description: 'Exercícios e tarefas para fixação do conteúdo.',
    icon: FileText,
    color: 'text-emerald-700',
    bgGradient: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
    iconBg: 'bg-emerald-500',
    hoverEffect: 'hover:shadow-emerald-200 hover:scale-[1.02] hover:bg-gradient-to-br hover:from-emerald-100 hover:to-emerald-150'
  }, {
    id: 'avaliacao',
    title: 'Avaliação',
    description: 'Teste formal para verificar o aprendizado dos alunos.',
    icon: ClipboardCheck,
    color: 'text-purple-700',
    bgGradient: 'bg-gradient-to-br from-purple-50 to-purple-100',
    iconBg: 'bg-purple-500',
    hoverEffect: 'hover:shadow-purple-200 hover:scale-[1.02] hover:bg-gradient-to-br hover:from-purple-100 hover:to-purple-150'
  }];
  const subjects = ['Matemática', 'Português', 'Ciências', 'História', 'Geografia', 'Física', 'Química', 'Biologia', 'Educação Física', 'Espanhol', 'Inglês', 'Filosofia', 'Sociologia', 'Informática', 'Física Quântica', 'Teatro', 'Literatura', 'Música', 'Dança', 'Artes'];
  const grades = [{
    category: 'Educação Infantil',
    options: ['Maternal', 'Jardim I', 'Jardim II', 'Pré-Escola']
  }, {
    category: 'Ensino Fundamental I',
    options: ['1° Ano', '2° Ano', '3° Ano', '4° Ano', '5° Ano']
  }, {
    category: 'Ensino Fundamental II',
    options: ['6° Ano', '7° Ano', '8° Ano', '9° Ano']
  }, {
    category: 'Ensino Médio',
    options: ['1° Ano', '2° Ano', '3° Ano']
  }, {
    category: 'Ensino Superior',
    options: ['Graduação']
  }];

  // Funções para gerenciar múltiplos assuntos/conteúdos
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
    }
  };
  const updateSubject = (index: number, value: string) => {
    const newSubjects = [...formData.subjects];
    newSubjects[index] = value;
    setFormData({
      ...formData,
      subjects: newSubjects
    });
  };
  const handleTypeSelection = (type: MaterialType) => {
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
  const handleFormSubmit = () => {
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
    setShowBNCCValidation(true);
  };
  const handleBNCCValidationAccept = () => {
    handleGenerate();
  };
  const handleGenerate = async () => {
    setStep('generating');
    setIsGenerating(true);
    setGenerationProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 90) {
          return prev;
        }
        return prev + Math.random() * 15;
      });
    }, 300);
    try {
      // Para avaliações, usar os múltiplos assuntos como tema
      const materialFormData = {
        tema: selectedType === 'avaliacao' ? formData.subjects.filter(s => s.trim() !== '').join(', ') : formData.topic,
        topic: selectedType === 'avaliacao' ? formData.subjects.filter(s => s.trim() !== '').join(', ') : formData.topic,
        disciplina: formData.subject,
        subject: formData.subject,
        serie: formData.grade,
        grade: formData.grade,
        // Adicionar assuntos específicos para avaliações
        ...(selectedType === 'avaliacao' ? {
          assuntos: formData.subjects.filter(s => s.trim() !== ''),
          subjects: formData.subjects.filter(s => s.trim() !== '')
        } : {}),
        // Correct mapping for question configuration
        ...(selectedType === 'atividade' || selectedType === 'avaliacao' ? {
          tipoQuestoes: formData.questionType,
          tiposQuestoes: [formData.questionType],
          numeroQuestoes: formData.questionCount[0],
          quantidadeQuestoes: formData.questionCount[0]
        } : {})
      };
      console.log('Material form data being sent:', materialFormData);
      const material = await materialService.generateMaterial(selectedType!, materialFormData);
      clearInterval(progressInterval);
      setGenerationProgress(100);
      setTimeout(() => {
        setIsGenerating(false);
        setGeneratedMaterial(material);
        setShowModal(true);
        setStep('selection');
        toast.success(`${getCurrentTypeInfo()?.title} criado com sucesso!`);
      }, 1000);
    } catch (error) {
      clearInterval(progressInterval);
      setIsGenerating(false);
      setStep('form');
      toast.error('Erro ao gerar material. Tente novamente.');
      console.error('Generation error:', error);
    }
  };
  const getCurrentTypeInfo = () => {
    return materialTypes.find(type => type.id === selectedType);
  };
  const handleCloseModal = () => {
    setShowModal(false);
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

  // Helper function to get display name for selected grade
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
  if (step === 'selection') {
    return <>
        <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-2 sm:p-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-4 sm:mb-6">
              <div className="relative mb-3">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg">
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
            </div>

            <div className="mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-3 text-center px-4">
                Selecione o tipo de conteúdo que você deseja criar:
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 px-2">
              {materialTypes.map(type => {
              const Icon = type.icon;
              return <Card key={type.id} className={`cursor-pointer border-2 border-transparent transition-all duration-300 ${type.bgGradient} ${type.hoverEffect} shadow-lg hover:shadow-xl h-24 sm:h-28`} onClick={() => handleTypeSelection(type.id)}>
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
                  </Card>;
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
        
        <MaterialModal material={generatedMaterial} open={showModal} onClose={handleCloseModal} />
      </>;
  }
  if (step === 'form') {
    const typeInfo = getCurrentTypeInfo();
    const Icon = typeInfo?.icon || BookOpen;
    return <>
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
                {selectedType !== 'avaliacao' && <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg text-white text-sm flex items-center justify-center font-bold shadow-md">
                        T
                      </div>
                      <Label className="text-base sm:text-lg font-semibold text-gray-800">Tema da Aula</Label>
                    </div>
                    <div className="relative">
                      <Input placeholder="Ex: Introdução à Álgebra Linear" value={formData.topic} onChange={e => setFormData({
                    ...formData,
                    topic: e.target.value
                  })} className="pr-12 h-12 sm:h-14 text-base sm:text-lg border-2 border-gray-200 focus:border-blue-400 rounded-xl bg-gray-50 focus:bg-white transition-all" />
                      <button className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 p-2 hover:bg-blue-50 rounded-lg transition-colors">
                        <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                      </button>
                    </div>
                  </div>}

                {/* Campo para múltiplos assuntos/conteúdos (apenas para avaliações) */}
                {selectedType === 'avaliacao' && <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg text-white text-sm flex items-center justify-center font-bold shadow-md">
                          C
                        </div>
                        <Label className="text-base sm:text-lg font-semibold text-gray-800">Conteúdos da Avaliação</Label>
                      </div>
                      <Button type="button" onClick={addSubject} variant="outline" size="sm" className="flex items-center space-x-1 hover:bg-blue-50 border-blue-200">
                        <Plus className="w-4 h-4" />
                        <span>Adicionar</span>
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Adicione os assuntos ou conteúdos específicos que serão abordados na avaliação.
As questões serão baseadas nesses temas.</p>
                    
                    <div className="space-y-3">
                      {formData.subjects.map((subject, index) => <div key={index} className="flex items-center space-x-3">
                          <div className="flex-1">
                            <Input placeholder={`Ex: ${index === 0 ? 'Equações do 1º grau' : index === 1 ? 'Sistemas lineares' : 'Funções quadráticas'}`} value={subject} onChange={e => updateSubject(index, e.target.value)} className="h-12 text-base border-2 border-gray-200 focus:border-blue-400 rounded-xl bg-gray-50 focus:bg-white transition-all" />
                          </div>
                          {formData.subjects.length > 1 && <Button type="button" onClick={() => removeSubject(index)} variant="outline" size="sm" className="flex items-center justify-center w-12 h-12 hover:bg-red-50 border-red-200 text-red-500">
                              <X className="w-4 h-4" />
                            </Button>}
                        </div>)}
                    </div>
                  </div>}

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
                          {subjects.map(subject => <SelectItem key={subject} value={subject.toLowerCase()}>
                              {subject}
                            </SelectItem>)}
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
                        {grades.map(category => <div key={category.category}>
                            <div className="px-3 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-lg mx-2 mt-2">
                              {category.category}
                            </div>
                            {category.options.map(option => <SelectItem key={`${category.category}-${option}`} value={`${category.category}-${option}`}>
                                {option}
                              </SelectItem>)}
                          </div>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Campos específicos para atividades e avaliações */}
                {(selectedType === 'atividade' || selectedType === 'avaliacao') && <div className="space-y-6 border-t border-gray-200 pt-6">
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
                          <Slider value={formData.questionCount} onValueChange={value => setFormData({
                        ...formData,
                        questionCount: value
                      })} max={20} min={1} step={1} className="w-full" />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>1</span>
                            <span>10</span>
                            <span>20</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>}

                <div className="flex flex-col sm:flex-row justify-between items-center pt-6 gap-4">
                  <Button variant="outline" onClick={handleBackToSelection} className="w-full sm:w-auto flex items-center justify-center space-x-2 h-10 sm:h-12 px-4 sm:px-6 border-2 hover:bg-gray-50 rounded-xl">
                    <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="font-semibold">Voltar</span>
                  </Button>

                  <Button onClick={handleFormSubmit} disabled={!formData.subject || !formData.grade || selectedType !== 'avaliacao' && !formData.topic || selectedType === 'avaliacao' && formData.subjects.filter(s => s.trim() !== '').length === 0} className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white flex items-center justify-center space-x-2 h-10 sm:h-12 px-4 sm:px-8 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
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

        {/* Modal de validação BNCC */}
        <BNCCValidationModal open={showBNCCValidation} onClose={() => setShowBNCCValidation(false)} tema={selectedType === 'avaliacao' ? formData.subjects.filter(s => s.trim() !== '').join(', ') : formData.topic} disciplina={formData.subject} serie={formData.grade} onAccept={handleBNCCValidationAccept} />

        <MaterialModal material={generatedMaterial} open={showModal} onClose={handleCloseModal} />
      </>;
  }
  if (step === 'generating') {
    return <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-2 sm:p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm sm:max-w-lg w-full shadow-xl">
            <div className="text-center">
              {/* Centered icon section */}
              <div className="relative mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Sparkles className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                </div>
              </div>
              
              {/* Content section */}
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                    Preparando seu material...
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600">
                    Você ensina, a gente facilita!
                  </p>
                </div>
                
                {/* Progress section */}
                <div className="space-y-3">
                  <Progress value={generationProgress} className="h-2 bg-gray-200" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Gerando material...</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {Math.round(generationProgress)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>;
  }
  return null;
};
export default CreateLesson;