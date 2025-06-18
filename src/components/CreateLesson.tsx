
import React, { useState } from 'react';
import { BookOpen, Monitor, FileText, ClipboardCheck, ArrowLeft, Wand2, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

type MaterialType = 'plano-de-aula' | 'slides' | 'atividade' | 'avaliacao';

interface MaterialTypeOption {
  id: MaterialType;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
}

const CreateLesson: React.FC = () => {
  const [step, setStep] = useState<'selection' | 'form' | 'generating'>('selection');
  const [selectedType, setSelectedType] = useState<MaterialType | null>(null);
  const [formData, setFormData] = useState({
    topic: '',
    subject: '',
    grade: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  const materialTypes: MaterialTypeOption[] = [
    {
      id: 'plano-de-aula',
      title: 'Plano de Aula',
      description: 'Documento completo alinhado à BNCC com objetivos, conteúdos e estratégias.',
      icon: BookOpen,
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100'
    },
    {
      id: 'slides',
      title: 'Slides',
      description: 'Apresentação visual com os principais pontos da aula.',
      icon: Monitor,
      color: 'bg-gray-50 border-gray-200 hover:bg-gray-100'
    },
    {
      id: 'atividade',
      title: 'Atividade',
      description: 'Exercícios e tarefas para fixação do conteúdo.',
      icon: FileText,
      color: 'bg-green-50 border-green-200 hover:bg-green-100'
    },
    {
      id: 'avaliacao',
      title: 'Avaliação',
      description: 'Teste formal para verificar o aprendizado dos alunos.',
      icon: ClipboardCheck,
      color: 'bg-purple-50 border-purple-200 hover:bg-purple-100'
    }
  ];

  const subjects = [
    'Matemática', 'Português', 'Ciências', 'História', 'Geografia', 'Física', 'Química', 'Biologia',
    'Educação Física', 'Espanhol', 'Inglês', 'Filosofia', 'Sociologia', 'Informática', 'Física Quântica',
    'Teatro', 'Literatura', 'Música', 'Dança', 'Artes'
  ];

  const grades = [
    { category: 'Educação Infantil', options: ['Maternal', 'Jardim I', 'Jardim II', 'Pré-Escola'] },
    { category: 'Ensino Fundamental I', options: ['1° Ano', '2° Ano', '3° Ano', '4° Ano', '5° Ano'] },
    { category: 'Ensino Fundamental II', options: ['6° Ano', '7° Ano', '8° Ano', '9° Ano'] },
    { category: 'Ensino Médio', options: ['1° Ano', '2° Ano', '3° Ano'] },
    { category: 'Ensino Superior', options: ['Graduação'] }
  ];

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
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsGenerating(false);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 300);

    // Simulate API call (replace with actual OpenAI integration)
    setTimeout(() => {
      clearInterval(progressInterval);
      setGenerationProgress(100);
      setIsGenerating(false);
    }, 5000);
  };

  const getCurrentTypeInfo = () => {
    return materialTypes.find(type => type.id === selectedType);
  };

  if (step === 'selection') {
    return (
      <main className="p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Preparar Material</h1>
            <p className="text-gray-600">Preencha os detalhes básicos para começar sua aula</p>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Selecione o tipo de conteúdo que você deseja criar:
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {materialTypes.map((type) => {
              const Icon = type.icon;
              return (
                <Card
                  key={type.id}
                  className={`cursor-pointer border-2 transition-all duration-200 ${type.color}`}
                  onClick={() => handleTypeSelection(type.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <Icon className="w-6 h-6 text-gray-700" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 mb-2">{type.title}</h3>
                        <p className="text-sm text-gray-600">{type.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
    );
  }

  if (step === 'form') {
    const typeInfo = getCurrentTypeInfo();
    const Icon = typeInfo?.icon || BookOpen;

    return (
      <main className="p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-4">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Criar {typeInfo?.title}</h1>
              <p className="text-gray-600">Preencha os detalhes para criar seu {typeInfo?.title.toLowerCase()}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-6 h-6 bg-red-500 rounded text-white text-xs flex items-center justify-center font-semibold">
                  C
                </div>
                <Label className="text-sm font-medium">Tema da Aula</Label>
              </div>
              <div className="relative">
                <Input
                  placeholder="Ex: Introdução à Álgebra Linear"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className="pr-10"
                />
                <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Mic className="w-4 h-4 text-blue-500" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full text-white text-xs flex items-center justify-center">
                    •
                  </div>
                  <Label className="text-sm font-medium">Disciplina</Label>
                </div>
                <Select value={formData.subject} onValueChange={(value) => setFormData({ ...formData, subject: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma disciplina" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="grid grid-cols-2 gap-1 p-2">
                      {subjects.map((subject) => (
                        <SelectItem key={subject} value={subject.toLowerCase()}>
                          {subject}
                        </SelectItem>
                      ))}
                    </div>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-purple-500 rounded-full text-white text-xs flex items-center justify-center">
                    •
                  </div>
                  <Label className="text-sm font-medium">Turma (Série/Ano)</Label>
                </div>
                <Select value={formData.grade} onValueChange={(value) => setFormData({ ...formData, grade: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a turma" />
                  </SelectTrigger>
                  <SelectContent>
                    {grades.map((category) => (
                      <div key={category.category}>
                        <div className="px-2 py-1.5 text-sm font-medium text-blue-500 bg-blue-50">
                          {category.category}
                        </div>
                        {category.options.map((option) => (
                          <SelectItem key={`${category.category}-${option}`} value={option.toLowerCase()}>
                            {option}
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handleBackToSelection}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </Button>

              <Button
                onClick={handleGenerate}
                disabled={!formData.topic || !formData.subject || !formData.grade}
                className="bg-blue-500 hover:bg-blue-600 text-white flex items-center space-x-2"
              >
                <Wand2 className="w-4 h-4" />
                <span>Criar {typeInfo?.title}</span>
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (step === 'generating') {
    return (
      <main className="p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Preparando seu material...</h2>
              <p className="text-gray-600 mb-6">Você ensina, a gente facilita!</p>
              
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gray-800 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${generationProgress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-600">Gerando material...</span>
                  <span className="text-sm font-semibold text-gray-800">{Math.round(generationProgress)}%</span>
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
