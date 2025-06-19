
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Monitor, FileText, ClipboardCheck, ArrowLeft, Wand2, Mic, Sparkles, GraduationCap, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { materialService, GeneratedMaterial } from '@/services/materialService';
import MaterialModal from './MaterialModal';
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
    grade: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedMaterial, setGeneratedMaterial] = useState<GeneratedMaterial | null>(null);
  const [showModal, setShowModal] = useState(false);

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

  const handleTypeSelection = (type: MaterialType) => {
    setSelectedType(type);
    setStep('form');
  };

  const handleBackToSelection = () => {
    setStep('selection');
    setSelectedType(null);
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
      // Generate material using the service
      const material = await materialService.generateMaterial(selectedType!, formData.topic, formData.subject, formData.grade);
      clearInterval(progressInterval);
      setGenerationProgress(100);
      setTimeout(() => {
        setIsGenerating(false);
        setGeneratedMaterial(material);
        setShowModal(true);
        setStep('selection'); // Reset to selection for next material
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
      grade: ''
    });
    setSelectedType(null);
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
    return <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-2 sm:p-4">
        <div className="max-w-2xl mx-auto">
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
              <div>
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
              </div>

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
                          {category.options.map(option => <SelectItem key={`${category.category}-${option}`} value={option.toLowerCase()}>
                              {option}
                            </SelectItem>)}
                        </div>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center pt-6 gap-4">
                <Button variant="outline" onClick={handleBackToSelection} className="w-full sm:w-auto flex items-center justify-center space-x-2 h-10 sm:h-12 px-4 sm:px-6 border-2 hover:bg-gray-50 rounded-xl">
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-semibold">Voltar</span>
                </Button>

                <Button onClick={handleGenerate} disabled={!formData.topic || !formData.subject || !formData.grade} className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white flex items-center justify-center space-x-2 h-10 sm:h-12 px-4 sm:px-8 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
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
      </main>;
  }

  if (step === 'generating') {
    return <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-10 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg animate-pulse">
                  <Sparkles className="w-10 h-10 text-white animate-bounce" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-ping"></div>
              </div>
              
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                Preparando seu material...
              </h2>
              <p className="text-gray-600 mb-8 text-lg">Você ensina, a gente facilita! ✨</p>
              
              <div className="mb-6">
                <Progress value={generationProgress} className="h-3 bg-gray-100" />
                <div className="flex justify-between items-center mt-3">
                  <span className="text-sm text-gray-600 font-medium">Gerando conteúdo...</span>
                  <span className="text-sm font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
                    {Math.round(generationProgress)}%
                  </span>
                </div>
              </div>

              <div className="flex justify-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{
                animationDelay: '0.1s'
              }}></div>
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{
                animationDelay: '0.2s'
              }}></div>
              </div>
            </div>
          </div>
        </div>
      </main>;
  }

  return null;
};

export default CreateLesson;
