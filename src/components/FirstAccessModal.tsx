
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  User, 
  GraduationCap, 
  BookOpen, 
  School, 
  FileText, 
  ArrowLeft, 
  ArrowRight,
  CheckCircle,
  Plus,
  Calendar,
  Presentation,
  ClipboardList,
  Crown,
  Eye
} from 'lucide-react';

interface UserInfo {
  grade: string;
  subject: string;
  school: string;
  materialTypes: string[];
}

interface FirstAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (userInfo: UserInfo) => void;
}

const FirstAccessModal: React.FC<FirstAccessModalProps> = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    grade: '',
    subject: '',
    school: '',
    materialTypes: []
  });

  const materialOptions = [
    { id: 'plano-aula', label: 'Planos de Aula', icon: ClipboardList },
    { id: 'slides', label: 'Slides', icon: Presentation },
    { id: 'atividades', label: 'Atividades', icon: FileText },
    { id: 'avaliacoes', label: 'Avaliações', icon: GraduationCap }
  ];

  const tourSteps = [
    {
      title: '🎉 Bem-vindo ao AulagIA!',
      subtitle: 'Vamos conhecer sua plataforma de ensino com IA',
      content: (
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full mx-auto mb-6 flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <p className="text-gray-600 mb-4">
            Sua jornada educacional está prestes a começar! Vamos configurar tudo rapidamente.
          </p>
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      )
    },
    {
      title: '👨‍🏫 Conte-nos sobre você',
      subtitle: 'Essas informações nos ajudam a personalizar sua experiência',
      content: (
        <div className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="grade" className="flex items-center mb-2">
                <GraduationCap className="w-4 h-4 mr-2 text-purple-500" />
                Etapa de Ensino
              </Label>
              <Input
                id="grade"
                placeholder="Ex: 3º Ano do Ensino Fundamental"
                value={userInfo.grade}
                onChange={(e) => setUserInfo(prev => ({ ...prev, grade: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="subject" className="flex items-center mb-2">
                <BookOpen className="w-4 h-4 mr-2 text-blue-500" />
                Disciplina Principal
              </Label>
              <Input
                id="subject"
                placeholder="Ex: Matemática"
                value={userInfo.subject}
                onChange={(e) => setUserInfo(prev => ({ ...prev, subject: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="school" className="flex items-center mb-2">
              <School className="w-4 h-4 mr-2 text-green-500" />
              Escola (opcional)
            </Label>
            <Input
              id="school"
              placeholder="Nome da sua instituição"
              value={userInfo.school}
              onChange={(e) => setUserInfo(prev => ({ ...prev, school: e.target.value }))}
            />
          </div>
          <div>
            <Label className="flex items-center mb-3">
              <FileText className="w-4 h-4 mr-2 text-orange-500" />
              Que tipos de materiais você pretende criar?
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {materialOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = userInfo.materialTypes.includes(option.id);
                return (
                  <Card
                    key={option.id}
                    className={`cursor-pointer border-2 transition-all ${
                      isSelected 
                        ? 'border-primary-500 bg-primary-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => {
                      setUserInfo(prev => ({
                        ...prev,
                        materialTypes: isSelected 
                          ? prev.materialTypes.filter(type => type !== option.id)
                          : [...prev.materialTypes, option.id]
                      }));
                    }}
                  >
                    <CardContent className="p-4 text-center">
                      <Icon className={`w-6 h-6 mx-auto mb-2 ${isSelected ? 'text-primary-600' : 'text-gray-500'}`} />
                      <p className={`text-sm font-medium ${isSelected ? 'text-primary-700' : 'text-gray-700'}`}>
                        {option.label}
                      </p>
                      {isSelected && (
                        <CheckCircle className="w-4 h-4 text-primary-600 mx-auto mt-1" />
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      )
    },
    {
      title: '🏠 Dashboard - Seu centro de controle',
      subtitle: 'Aqui você acompanha suas atividades e acessa rapidamente suas ferramentas',
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg p-4 text-white text-center">
            <BookOpen className="w-8 h-8 mx-auto mb-2" />
            <p className="font-medium">Painel Principal</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
              <Plus className="w-6 h-6 text-green-600 mx-auto mb-1" />
              <p className="text-sm font-medium text-green-700">Criar Material</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
              <FileText className="w-6 h-6 text-blue-600 mx-auto mb-1" />
              <p className="text-sm font-medium text-blue-700">Meus Materiais</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
              <Calendar className="w-6 h-6 text-red-600 mx-auto mb-1" />
              <p className="text-sm font-medium text-red-700">Calendário</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
              <Crown className="w-6 h-6 text-yellow-600 mx-auto mb-1" />
              <p className="text-sm font-medium text-yellow-700">Assinatura</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 text-center">
            ✨ Visualize suas atividades recentes, próximas aulas e estatísticas
          </p>
        </div>
      )
    },
    {
      title: '✨ Criar Material - Sua varinha mágica',
      subtitle: 'Crie conteúdos pedagógicos incríveis com inteligência artificial',
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-4 text-white text-center">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full mx-auto mb-2 flex items-center justify-center">
              <Plus className="w-6 h-6" />
            </div>
            <p className="font-medium">Criador de Materiais IA</p>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center">
                <ClipboardList className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium text-blue-700">Planos de Aula</p>
                  <p className="text-xs text-blue-600">Alinhados à BNCC</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center">
                <Presentation className="w-5 h-5 text-green-600 mr-3" />
                <div>
                  <p className="font-medium text-green-700">Slides</p>
                  <p className="text-xs text-green-600">Com design profissional</p>
                </div>
              </div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-orange-600 mr-3" />
                <div>
                  <p className="font-medium text-orange-700">Atividades & Avaliações</p>
                  <p className="text-xs text-orange-600">Questões personalizadas</p>
                </div>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600 text-center">
            🎯 Preencha o tema, selecione a disciplina e deixe a IA trabalhar!
          </p>
        </div>
      )
    },
    {
      title: '📚 Meus Materiais - Sua biblioteca',
      subtitle: 'Gerencie, visualize e exporte todos os seus conteúdos criados',
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg p-4 text-white text-center">
            <BookOpen className="w-8 h-8 mx-auto mb-2" />
            <p className="font-medium">Biblioteca de Materiais</p>
          </div>
          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ClipboardList className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-blue-700">Geometria - Plano de Aula</p>
                    <p className="text-xs text-gray-600">3º Ano • Matemática</p>
                  </div>
                </div>
                <Badge variant="secondary">Hoje</Badge>
              </div>
              <div className="flex mt-2 space-x-2">
                <Button size="sm" variant="outline" className="text-xs">
                  <Eye className="w-3 h-3 mr-1" />
                  Ver
                </Button>
                <Button size="sm" variant="outline" className="text-xs">
                  PDF
                </Button>
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-green-700">Números - Atividade</p>
                    <p className="text-xs text-gray-600">3º Ano • Matemática</p>
                  </div>
                </div>
                <Badge variant="secondary">Ontem</Badge>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600 text-center">
            🔍 Pesquise, filtre e organize seus materiais facilmente
          </p>
        </div>
      )
    },
    {
      title: '📅 Calendário - Organize seu tempo',
      subtitle: 'Agende e acompanhe suas aulas com materiais organizados',
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-lg p-4 text-white text-center">
            <Calendar className="w-8 h-8 mx-auto mb-2" />
            <p className="font-medium">Calendário de Materiais</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-center mb-3">
              <p className="font-semibold text-gray-800">26 de junho</p>
              <p className="text-sm text-gray-600">quinta-feira</p>
            </div>
            <div className="bg-green-100 border-l-4 border-green-500 rounded p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-green-800">Números</p>
                  <p className="text-sm text-green-600">08:00 - 09:00 • Sala 101</p>
                </div>
                <Badge className="bg-green-500">Atividade</Badge>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600 text-center">
            ⏰ Vincule seus materiais às aulas e nunca mais esqueça nada!
          </p>
        </div>
      )
    },
    {
      title: '🎉 Tudo pronto!',
      subtitle: 'Você está preparado para revolucionar suas aulas',
      content: (
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mx-auto mb-6 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-4">Bem-vindo ao futuro da educação!</h3>
          <p className="text-gray-600 mb-6">
            Agora você pode criar materiais pedagógicos incríveis em poucos minutos com a ajuda da inteligência artificial.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-700 font-medium">💡 Dica Especial</p>
            <p className="text-sm text-blue-600 mt-1">
              Comece criando seu primeiro plano de aula. É rápido, fácil e alinhado à BNCC!
            </p>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(userInfo);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentTourStep = tourSteps[currentStep];

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <div className="p-6">
          <DialogHeader className="text-center mb-6">
            <DialogTitle className="text-2xl font-bold text-gray-800">
              {currentTourStep.title}
            </DialogTitle>
            <p className="text-gray-600 mt-2">{currentTourStep.subtitle}</p>
          </DialogHeader>

          <div className="mb-6">
            {currentTourStep.content}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex space-x-1">
              {tourSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep ? 'bg-primary-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <div className="flex space-x-3">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  className="flex items-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Anterior
                </Button>
              )}
              
              <Button
                onClick={handleNext}
                className="flex items-center"
              >
                {currentStep === tourSteps.length - 1 ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Começar a usar
                  </>
                ) : (
                  <>
                    Próximo
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FirstAccessModal;
