import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, GraduationCap, BookOpen, School, FileText, ArrowLeft, ArrowRight, CheckCircle, Star, ClipboardList, Presentation } from 'lucide-react';
interface UserInfo {
  teachingLevel: string;
  grades: string[];
  subjects: string[];
  school: string;
  materialTypes: string[];
  name: string;
}
interface FirstAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (userInfo: UserInfo) => void;
}
const FirstAccessModal: React.FC<FirstAccessModalProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    teachingLevel: '',
    grades: [],
    subjects: [],
    school: '',
    materialTypes: [],
    name: 'Professor(a)'
  });
  const teachingLevels = ['Educação Infantil', 'Ensino Fundamental I', 'Ensino Fundamental II', 'Ensino Médio', 'Ensino Superior'];
  const gradesByLevel: {
    [key: string]: string[];
  } = {
    'Educação Infantil': ['Maternal', 'Jardim I', 'Jardim II', 'Pré-Escola'],
    'Ensino Fundamental I': ['1º Ano', '2º Ano', '3º Ano', '4º Ano', '5º Ano'],
    'Ensino Fundamental II': ['6º Ano', '7º Ano', '8º Ano', '9º Ano'],
    'Ensino Médio': ['1ª Série', '2ª Série', '3ª Série'],
    'Ensino Superior': ['Graduação', 'Pós-Graduação']
  };
  const subjects = ['Matemática', 'Português', 'Ciências', 'História', 'Geografia', 'Física', 'Química', 'Biologia', 'Educação Física', 'Inglês', 'Espanhol', 'Filosofia', 'Sociologia', 'Informática', 'Teatro', 'Literatura', 'Música', 'Dança', 'Artes'];
  const materialOptions = [{
    id: 'Planos de Aula',
    label: 'Planos de Aula',
    icon: ClipboardList,
    description: 'Documento completo alinhado à BNCC'
  }, {
    id: 'Slides',
    label: 'Slides',
    icon: Presentation,
    description: 'Apresentações visuais interativas'
  }, {
    id: 'Atividades',
    label: 'Atividades',
    icon: FileText,
    description: 'Exercícios e tarefas para fixação'
  }, {
    id: 'Avaliações',
    label: 'Avaliações',
    icon: GraduationCap,
    description: 'Provas e testes personalizados'
  }];
  const tourSteps = [{
    title: '🎉 Bem-vindo ao AulagIA!',
    subtitle: 'Sua plataforma de ensino com inteligência artificial',
    content: <div className="text-center py-3">
        <div className="mb-4">
          <img src="/lovable-uploads/7aab49d7-a4ac-49b2-bb76-5c85a6696a42.png" alt="AulagIA Logo" className="h-10 sm:h-12 mx-auto mb-3" />
        </div>
        <p className="text-gray-600 mb-4 text-sm sm:text-base leading-relaxed px-2">
          Prepare-se para revolucionar suas aulas com a ajuda da inteligência artificial! 
        </p>
        <div className="flex justify-center space-x-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
        </div>
      </div>
  }, {
    title: '👨‍🏫 Informações Pessoais',
    subtitle: 'Como gostaria de ser chamado e onde trabalha?',
    content: <div className="py-2">
        <div className="mb-4 text-center">
          <img src="/lovable-uploads/7aab49d7-a4ac-49b2-bb76-5c85a6696a42.png" alt="AulagIA Logo" className="h-8 sm:h-10 mx-auto mb-2" />
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="flex items-center mb-2 text-sm font-medium">
              <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-blue-500" />
              Como gostaria de ser chamado(a)?
            </Label>
            <Input id="name" placeholder="Professor(a)" value={userInfo.name} onChange={e => setUserInfo(prev => ({
            ...prev,
            name: e.target.value
          }))} className="border-2 focus:border-blue-500 text-sm h-8 rounded-lg" />
          </div>

          <div>
            <Label htmlFor="school" className="flex items-center mb-2 text-sm font-medium">
              <School className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-green-500" />
              Escola (opcional)
            </Label>
            <Input id="school" placeholder="Nome da sua escola" value={userInfo.school} onChange={e => setUserInfo(prev => ({
            ...prev,
            school: e.target.value
          }))} className="border-2 focus:border-green-500 text-sm h-8 rounded-lg" />
          </div>
        </div>
      </div>
  }, {
    title: '🎓 Etapa de Ensino',
    subtitle: 'Qual etapa de ensino você trabalha?',
    content: <div className="py-2">
        <div className="mb-4 text-center">
          <img src="/lovable-uploads/7aab49d7-a4ac-49b2-bb76-5c85a6696a42.png" alt="AulagIA Logo" className="h-8 sm:h-10 mx-auto mb-2" />
        </div>

        <div className="space-y-4">
          <div>
            <Label className="flex items-center mb-2 text-sm font-medium">
              <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-purple-500" />
              Etapa de Ensino (opcional)
            </Label>
            <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
              {teachingLevels.map(level => <Card key={level} className={`cursor-pointer border-2 transition-all hover:shadow-sm rounded-lg ${userInfo.teachingLevel === level ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`} onClick={() => setUserInfo(prev => ({
              ...prev,
              teachingLevel: level,
              grades: []
            }))}>
                  <CardContent className="p-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs sm:text-sm font-medium ${userInfo.teachingLevel === level ? 'text-purple-700' : 'text-gray-700'}`}>
                        {level}
                      </span>
                      {userInfo.teachingLevel === level && <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />}
                    </div>
                  </CardContent>
                </Card>)}
            </div>
          </div>

          {userInfo.teachingLevel && gradesByLevel[userInfo.teachingLevel] && <div>
              <Label className="flex items-center mb-2 text-sm font-medium">
                <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-yellow-500" />
                Anos/Séries que atende
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                {gradesByLevel[userInfo.teachingLevel].map(grade => <Button key={grade} variant={userInfo.grades.includes(grade) ? "default" : "outline"} size="sm" onClick={() => {
              setUserInfo(prev => ({
                ...prev,
                grades: prev.grades.includes(grade) ? prev.grades.filter(g => g !== grade) : [...prev.grades, grade]
              }));
            }} className="h-7 py-1 text-xs px-2 rounded-md">
                    {grade}
                  </Button>)}
              </div>
            </div>}
        </div>
      </div>
  }, {
    title: '📚 Disciplinas',
    subtitle: 'Quais disciplinas você leciona?',
    content: <div className="py-2">
        <div className="mb-4 text-center">
          <img src="/lovable-uploads/7aab49d7-a4ac-49b2-bb76-5c85a6696a42.png" alt="AulagIA Logo" className="h-8 sm:h-10 mx-auto mb-2" />
        </div>

        <div>
          <Label className="flex items-center mb-2 text-sm font-medium">
            <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-blue-500" />
            Disciplinas que leciona (opcional)
          </Label>
          <div className="grid grid-cols-2 gap-1 max-h-48 overflow-y-auto">
            {subjects.map(subject => <Button key={subject} variant={userInfo.subjects.includes(subject) ? "default" : "outline"} size="sm" onClick={() => {
            setUserInfo(prev => ({
              ...prev,
              subjects: prev.subjects.includes(subject) ? prev.subjects.filter(s => s !== subject) : [...prev.subjects, subject]
            }));
          }} className="h-7 py-1 text-xs px-2 justify-start rounded-md">
                {subject}
              </Button>)}
          </div>
        </div>
      </div>
  }, {
    title: '📝 Tipos de Material',
    subtitle: 'Que tipos de materiais você pretende criar?',
    content: <div className="py-2">
        <div className="mb-4 text-center">
          <img src="/lovable-uploads/7aab49d7-a4ac-49b2-bb76-5c85a6696a42.png" alt="AulagIA Logo" className="h-8 sm:h-10 mx-auto mb-2" />
        </div>

        <div>
          <Label className="flex items-center mb-2 text-sm font-medium">
            <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-orange-500" />
            Selecione os tipos de materiais
          </Label>
          <div className="grid grid-cols-1 gap-2">
            {materialOptions.map(option => {
            const Icon = option.icon;
            const isSelected = userInfo.materialTypes.includes(option.id);
            return <Card key={option.id} className={`cursor-pointer border-2 transition-all hover:shadow-sm rounded-lg ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`} onClick={() => {
              setUserInfo(prev => ({
                ...prev,
                materialTypes: isSelected ? prev.materialTypes.filter(type => type !== option.id) : [...prev.materialTypes, option.id]
              }));
            }}>
                  <CardContent className="p-2">
                    <div className="flex items-center space-x-2">
                      <div className={`p-1 rounded-md ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        <Icon className={`w-3 h-3 sm:w-4 sm:h-4 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium text-xs sm:text-sm ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                          {option.label}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {option.description}
                        </p>
                      </div>
                      {isSelected && <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />}
                    </div>
                  </CardContent>
                </Card>;
          })}
          </div>
        </div>
      </div>
  }, {
    title: '🎉 Bem-vindo ao futuro da educação!',
    subtitle: 'Você está preparado para revolucionar suas aulas',
    content: <div className="text-center py-3">
        <div className="mb-4">
          <img src="/lovable-uploads/7aab49d7-a4ac-49b2-bb76-5c85a6696a42.png" alt="AulagIA Logo" className="h-12 sm:h-16 mx-auto mb-3" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3">Tudo pronto!</h3>
        <p className="text-gray-600 mb-4 text-sm sm:text-base leading-relaxed px-2">
          Agora você pode criar materiais pedagógicos incríveis em poucos minutos 
          com a ajuda da inteligência artificial.
        </p>
        
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-center mb-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-2">
              <Star className="w-4 h-4 text-white" />
            </div>
            <h4 className="text-sm sm:text-base font-semibold text-gray-800">Dica Especial</h4>
          </div>
          <p className="text-gray-700 mb-2 text-xs sm:text-sm">
            Comece criando seu primeiro plano de aula. É rápido, fácil e alinhado à BNCC!
          </p>
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-600">
            <div className="flex items-center">
              <CheckCircle className="w-3 h-3 text-green-500 mr-1" />
              Rápido
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-3 h-3 text-green-500 mr-1" />
              Fácil
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-3 h-3 text-green-500 mr-1" />
              BNCC
            </div>
          </div>
        </div>
      </div>
  }];
  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      const completeUserInfo = {
        ...userInfo,
        educationalInfo: {
          teachingLevel: userInfo.teachingLevel,
          grades: userInfo.grades,
          subjects: userInfo.subjects,
          school: userInfo.school,
          materialTypes: userInfo.materialTypes
        }
      };
      onComplete(completeUserInfo);
    }
  };
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  const currentTourStep = tourSteps[currentStep];
  return <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="w-[90vw] sm:w-full sm:max-w-lg max-h-[85vh] overflow-y-auto p-0 border-0 shadow-2xl rounded-2xl bg-white">
        <div className="p-4 sm:p-6">
          <div className="mb-4">
            {currentTourStep.content}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between pt-3 border-t border-gray-200 space-y-3 sm:space-y-0">
            <div className="flex space-x-1 order-2 sm:order-1">
              {tourSteps.map((_, index) => <div key={index} className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentStep ? 'bg-blue-500 w-6' : index < currentStep ? 'bg-green-500' : 'bg-gray-300'}`} />)}
            </div>

            <div className="flex space-x-2 order-1 sm:order-2 w-full sm:w-auto">
              {currentStep > 0 && <Button variant="outline" onClick={handlePrevious} className="flex items-center border-2 hover:bg-gray-50 flex-1 sm:flex-none text-sm h-8 rounded-lg">
                  <ArrowLeft className="w-3 h-3 mr-1" />
                  Anterior
                </Button>}
              
              <Button onClick={handleNext} size="sm" className="flex items-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg flex-1 sm:flex-none text-sm h-8 rounded-lg my-[14px]">
                {currentStep === tourSteps.length - 1 ? <>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Começar a usar
                  </> : <>
                    Próximo
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </>}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>;
};
export default FirstAccessModal;