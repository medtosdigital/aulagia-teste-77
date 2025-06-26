
import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, BookOpen, Calendar, FileText, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TutorialStep {
  title: string;
  content: React.ReactNode;
}

interface PageTutorialProps {
  page: 'dashboard' | 'create' | 'materials' | 'calendar';
  onClose: () => void;
}

const PageTutorial: React.FC<PageTutorialProps> = ({ page, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const getTutorialSteps = (page: string): TutorialStep[] => {
    switch (page) {
      case 'dashboard':
        return [{
          title: 'Dashboard - Seu centro de controle',
          content: (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-4 text-white text-center">
                <BookOpen className="w-12 h-12 mx-auto mb-2" />
                <h3 className="text-lg font-semibold">Painel Principal</h3>
                <p className="text-blue-100 text-sm">Sua central de comando educacional</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">✨ No Dashboard você encontra:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Suas atividades recentes</li>
                  <li>• Próximas aulas agendadas</li>
                  <li>• Estatísticas dos seus materiais</li>
                  <li>• Acesso rápido às ferramentas</li>
                </ul>
              </div>
            </div>
          )
        }];
        
      case 'create':
        return [{
          title: 'Criar Material - Sua varinha mágica',
          content: (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 text-white text-center">
                <Star className="w-12 h-12 mx-auto mb-2" />
                <h3 className="text-lg font-semibold">Preparar Material</h3>
                <p className="text-purple-100 text-sm">Crie conteúdos pedagógicos incríveis com IA</p>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Como funciona:</h4>
                <ol className="text-sm text-blue-700 space-y-1">
                  <li>1. Escolha o tipo de material</li>
                  <li>2. Preencha o tema da aula</li>
                  <li>3. Selecione disciplina e turma</li>
                  <li>4. Deixe a IA trabalhar!</li>
                  <li>5. Baixe em PDF ou Word</li>
                </ol>
              </div>
            </div>
          )
        }];
        
      case 'materials':
        return [{
          title: 'Meus Materiais - Sua biblioteca',
          content: (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl p-4 text-white text-center">
                <FileText className="w-12 h-12 mx-auto mb-2" />
                <h3 className="text-lg font-semibold">Meus Materiais</h3>
                <p className="text-blue-100 text-sm">Gerencie e organize seus conteúdos</p>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
                <h4 className="text-sm font-medium text-green-800 mb-2">Recursos disponíveis:</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Pesquisa e filtros avançados</li>
                  <li>• Exportação em múltiplos formatos</li>
                  <li>• Visualização e edição inline</li>
                  <li>• Organização por categorias</li>
                </ul>
              </div>
            </div>
          )
        }];
        
      case 'calendar':
        return [{
          title: 'Calendário - Organize seu tempo',
          content: (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-xl p-4 text-white text-center">
                <Calendar className="w-12 h-12 mx-auto mb-2" />
                <h3 className="text-lg font-semibold">Calendário de Materiais</h3>
                <p className="text-red-100 text-sm">Organize seus agendamentos pedagógicos</p>
              </div>
              
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200">
                <h4 className="text-sm font-medium text-orange-800 mb-2">Funcionalidades:</h4>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• Vincule materiais às suas aulas</li>
                  <li>• Visualização por dia, semana, mês</li>
                  <li>• Lembretes automáticos</li>
                  <li>• Nunca mais esqueça um material!</li>
                </ul>
              </div>
            </div>
          )
        }];
        
      default:
        return [];
    }
  };

  const steps = getTutorialSteps(page);
  
  if (steps.length === 0) return null;

  const currentTutorialStep = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white rounded-2xl shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="secondary" className="text-xs">
              Tutorial - {currentStep + 1} de {steps.length}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="rounded-full w-8 h-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              {currentTutorialStep.title}
            </h3>
            {currentTutorialStep.content}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex space-x-1">
              {steps.map((_, index) => (
                <div 
                  key={index} 
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentStep 
                      ? 'bg-blue-500 w-6' 
                      : index < currentStep 
                        ? 'bg-green-500' 
                        : 'bg-gray-300'
                  }`} 
                />
              ))}
            </div>

            <div className="flex space-x-2">
              {currentStep > 0 && (
                <Button 
                  variant="outline" 
                  onClick={handlePrevious}
                  size="sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              )}
              
              <Button 
                onClick={handleNext}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {currentStep === steps.length - 1 ? 'Concluir' : 'Próximo'}
                {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4 ml-1" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PageTutorial;
