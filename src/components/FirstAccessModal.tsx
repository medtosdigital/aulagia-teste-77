import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, GraduationCap, BookOpen, School, FileText, ArrowLeft, ArrowRight, CheckCircle, Plus, Calendar, Presentation, ClipboardList, Crown, Eye, Star, Filter, Clock, Users } from 'lucide-react';
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
  const subjects = ['Matemática', 'Português', 'Ciências', 'História', 'Geografia', 'Física', 'Química', 'Biologia', 'Educação Física', 'Inglês', 'Espanhol', 'Filosofia', 'Sociologia', 'Informática', 'Física Quântica', 'Teatro', 'Literatura', 'Música', 'Dança', 'Artes'];
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
    content: <div className="text-center py-8">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
            <BookOpen className="w-12 h-12 text-white" />
          </div>
          <div className="inline-flex items-center bg-blue-50 px-4 py-2 rounded-full mb-4">
            <div className="w-8 h-8 bg-blue-500 rounded-lg mr-2 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="text-blue-700 font-medium">AulagIA</span>
            <span className="text-gray-500 ml-2 text-sm">Sua aula com toque mágico</span>
          </div>
          <p className="text-gray-600 mb-6 text-lg leading-relaxed">Prepare-se para revolucionar suas aulas com a ajuda da inteligência artificial! 


Vamos configurar tudo rapidamente para você.</p>
          <div className="flex justify-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
          </div>
        </div>
  }, {
    title: '👨‍🏫 Conte-nos sobre você',
    subtitle: 'Essas informações nos ajudam a personalizar sua experiência',
    content: <div className="space-y-6 py-4">
          {/* Nome */}
          <div>
            <Label htmlFor="name" className="flex items-center mb-2 text-sm font-medium">
              <User className="w-4 h-4 mr-2 text-blue-500" />
              Como gostaria de ser chamado(a)?
            </Label>
            <Input id="name" placeholder="Professor(a)" value={userInfo.name} onChange={e => setUserInfo(prev => ({
          ...prev,
          name: e.target.value
        }))} className="border-2 focus:border-blue-500" />
          </div>

          {/* Escola */}
          <div>
            <Label htmlFor="school" className="flex items-center mb-2 text-sm font-medium">
              <School className="w-4 h-4 mr-2 text-green-500" />
              Escola (opcional)
            </Label>
            <Input id="school" placeholder="Nome da sua escola" value={userInfo.school} onChange={e => setUserInfo(prev => ({
          ...prev,
          school: e.target.value
        }))} className="border-2 focus:border-green-500" />
          </div>

          {/* Etapa de Ensino */}
          <div>
            <Label className="flex items-center mb-3 text-sm font-medium">
              <GraduationCap className="w-4 h-4 mr-2 text-purple-500" />
              Etapa de Ensino (opcional)
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {teachingLevels.map(level => <Card key={level} className={`cursor-pointer border-2 transition-all hover:shadow-md ${userInfo.teachingLevel === level ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`} onClick={() => setUserInfo(prev => ({
            ...prev,
            teachingLevel: level,
            grades: []
          }))}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${userInfo.teachingLevel === level ? 'text-purple-700' : 'text-gray-700'}`}>
                        {level}
                      </span>
                      {userInfo.teachingLevel === level && <CheckCircle className="w-4 h-4 text-purple-600" />}
                    </div>
                  </CardContent>
                </Card>)}
            </div>
          </div>

          {/* Anos/Séries */}
          {userInfo.teachingLevel && gradesByLevel[userInfo.teachingLevel] && <div>
              <Label className="flex items-center mb-3 text-sm font-medium">
                <Star className="w-4 h-4 mr-2 text-yellow-500" />
                Anos/Séries que atende
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {gradesByLevel[userInfo.teachingLevel].map(grade => <Button key={grade} variant={userInfo.grades.includes(grade) ? "default" : "outline"} size="sm" onClick={() => {
            setUserInfo(prev => ({
              ...prev,
              grades: prev.grades.includes(grade) ? prev.grades.filter(g => g !== grade) : [...prev.grades, grade]
            }));
          }} className="h-auto py-2 text-xs">
                    {grade}
                  </Button>)}
              </div>
            </div>}

          {/* Disciplinas */}
          <div>
            <Label className="flex items-center mb-3 text-sm font-medium">
              <BookOpen className="w-4 h-4 mr-2 text-blue-500" />
              Disciplinas que leciona (opcional)
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-40 overflow-y-auto">
              {subjects.map(subject => <Button key={subject} variant={userInfo.subjects.includes(subject) ? "default" : "outline"} size="sm" onClick={() => {
            setUserInfo(prev => ({
              ...prev,
              subjects: prev.subjects.includes(subject) ? prev.subjects.filter(s => s !== subject) : [...prev.subjects, subject]
            }));
          }} className="h-auto py-2 text-xs justify-start">
                  {subject}
                </Button>)}
            </div>
          </div>

          {/* Tipos de Material */}
          <div>
            <Label className="flex items-center mb-3 text-sm font-medium">
              <FileText className="w-4 h-4 mr-2 text-orange-500" />
              Que tipos de materiais você pretende criar?
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {materialOptions.map(option => {
            const Icon = option.icon;
            const isSelected = userInfo.materialTypes.includes(option.id);
            return <Card key={option.id} className={`cursor-pointer border-2 transition-all hover:shadow-md ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`} onClick={() => {
              setUserInfo(prev => ({
                ...prev,
                materialTypes: isSelected ? prev.materialTypes.filter(type => type !== option.id) : [...prev.materialTypes, option.id]
              }));
            }}>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}`}>
                          <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium text-sm ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                            {option.label}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {option.description}
                          </p>
                        </div>
                        {isSelected && <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />}
                      </div>
                    </CardContent>
                  </Card>;
          })}
            </div>
          </div>
        </div>
  }, {
    title: '🏠 Dashboard - Seu centro de controle',
    subtitle: 'Aqui você acompanha suas atividades e acessa rapidamente suas ferramentas',
    content: <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-6 text-white text-center">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl mx-auto mb-4 flex items-center justify-center">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Painel Principal</h3>
            <p className="text-blue-100 text-sm">Sua central de comando educacional</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center hover:bg-green-100 transition-colors">
              <div className="w-12 h-12 bg-green-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm font-medium text-green-700">Criar Material</p>
              <p className="text-xs text-green-600 mt-1">Acesso rápido</p>
            </div>
            
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-center hover:bg-blue-100 transition-colors">
              <div className="w-12 h-12 bg-blue-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm font-medium text-blue-700">Meus Materiais</p>
              <p className="text-xs text-blue-600 mt-1">Biblioteca</p>
            </div>
            
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 text-center hover:bg-red-100 transition-colors">
              <div className="w-12 h-12 bg-red-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm font-medium text-red-700">Calendário</p>
              <p className="text-xs text-red-600 mt-1">Agendamentos</p>
            </div>
            
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 text-center hover:bg-yellow-100 transition-colors">
              <div className="w-12 h-12 bg-yellow-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm font-medium text-yellow-700">Assinatura</p>
              <p className="text-xs text-yellow-600 mt-1">Planos</p>
            </div>
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
  }, {
    title: '✨ Criar Material - Sua varinha mágica',
    subtitle: 'Crie conteúdos pedagógicos incríveis com inteligência artificial',
    content: <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white text-center">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl mx-auto mb-4 flex items-center justify-center">
              <Star className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Preparar Material</h3>
            <p className="text-purple-100 text-sm">Crie conteúdos pedagógicos incríveis com IA</p>
          </div>
          
          <div className="space-y-3">
            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-500 rounded-lg mr-3 flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-blue-700">Planos de Aula</p>
                  <p className="text-xs text-blue-600">Documento completo alinhado à BNCC</p>
                </div>
                <Badge className="bg-green-100 text-green-700 text-xs">Alinhado à BNCC</Badge>
              </div>
            </div>
            
            <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-500 rounded-lg mr-3 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-green-700">Atividades</p>
                  <p className="text-xs text-green-600">Exercícios e tarefas para fixação</p>
                </div>
              </div>
            </div>
            
            <div className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-orange-500 rounded-lg mr-3 flex items-center justify-center">
                  <Presentation className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-orange-700">Slides</p>
                  <p className="text-xs text-orange-600">Apresentações visuais interativas</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center mb-2">
              <Clock className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-800">Como funciona:</span>
            </div>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Preencha o tema da aula</li>
              <li>2. Selecione disciplina e turma</li>
              <li>3. Deixe a IA trabalhar!</li>
              <li>4. Baixe em PDF ou Word</li>
            </ol>
          </div>
        </div>
  }, {
    title: '📚 Meus Materiais - Sua biblioteca',
    subtitle: 'Gerencie, visualize e exporte todos os seus conteúdos criados',
    content: <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl p-6 text-white text-center">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl mx-auto mb-4 flex items-center justify-center">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Meus Materiais</h3>
            <p className="text-blue-100 text-sm">Gerencie e organize seus conteúdos com elegância</p>
          </div>
          
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Buscar por título ou disciplina...</span>
            </div>
            <Badge variant="secondary">2 materiais</Badge>
          </div>
          
          <div className="space-y-3">
            <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <ClipboardList className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-blue-700">Geometria - Plano de Aula</p>
                      <p className="text-xs text-gray-500">Ensino Fundamental I-3º Ano • Matemática</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700 text-xs">Hoje</Badge>
                </div>
                <div className="flex items-center space-x-2 mt-3">
                  <Button size="sm" variant="outline" className="text-xs">
                    <Eye className="w-3 h-3 mr-1" />
                    Visualizar
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs">
                    PDF
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs">
                    Word
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-green-700">Números - Atividade</p>
                      <p className="text-xs text-gray-500">Ensino Fundamental I-3º Ano • Matemática</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">Ontem</Badge>
                </div>
                <div className="flex items-center space-x-2 mt-3">
                  <Button size="sm" variant="outline" className="text-xs">
                    <Eye className="w-3 h-3 mr-1" />
                    Visualizar
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs">
                    PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center mb-2">
              <Users className="w-4 h-4 text-green-600 mr-2" />
              <span className="text-sm font-medium text-green-800">Recursos disponíveis:</span>
            </div>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Pesquisa e filtros avançados</li>
              <li>• Exportação em múltiplos formatos</li>
              <li>• Visualização e edição inline</li>
              <li>• Organização por categorias</li>
            </ul>
          </div>
        </div>
  }, {
    title: '📅 Calendário - Organize seu tempo',
    subtitle: 'Agende e acompanhe suas aulas com materiais organizados',
    content: <div className="space-y-6">
          <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-xl p-6 text-white text-center">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl mx-auto mb-4 flex items-center justify-center">
              <Calendar className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Calendário de Materiais</h3>
            <p className="text-red-100 text-sm">Organize e acompanhe seus agendamentos pedagógicos</p>
          </div>
          
          <div className="bg-white rounded-lg border-2 border-gray-200 p-4">
            <div className="text-center mb-4">
              <p className="font-semibold text-gray-800 text-lg">26 de junho</p>
              <p className="text-sm text-gray-600">quinta-feira</p>
              <div className="flex justify-end">
                <Badge className="bg-blue-100 text-blue-700">1 material agendado</Badge>
              </div>
            </div>
            
            <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-green-800">Números</p>
                    <p className="text-sm text-green-600">Ensino Fundamental I-3º Ano</p>
                    <div className="flex items-center mt-1 text-xs text-green-600">
                      <Clock className="w-3 h-3 mr-1" />
                      08:00 - 09:00
                    </div>
                    <p className="text-xs text-green-600 mt-1">📍 Sala 101</p>
                  </div>
                </div>
                <Badge className="bg-green-500 text-white">Atividade</Badge>
              </div>
              <p className="text-sm text-green-700 mt-3 italic">
                "Primeira atividade de volta às aulas!"
              </p>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200">
            <div className="flex items-center mb-2">
              <Calendar className="w-4 h-4 text-orange-600 mr-2" />
              <span className="text-sm font-medium text-orange-800">Funcionalidades:</span>
            </div>
            <ul className="text-sm text-orange-700 space-y-1">
              <li>• Vincule materiais às suas aulas</li>
              <li>• Visualização por dia, semana, mês</li>
              <li>• Lembretes automáticos</li>
              <li>• Nunca mais esqueça um material!</li>
            </ul>
          </div>
        </div>
  }, {
    title: '🎉 Tudo pronto!',
    subtitle: 'Você está preparado para revolucionar suas aulas',
    content: <div className="text-center py-8">
          <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Bem-vindo ao futuro da educação!</h3>
          <p className="text-gray-600 mb-6 text-lg leading-relaxed">
            Agora você pode criar materiais pedagógicos incríveis em poucos minutos 
            com a ajuda da inteligência artificial.
          </p>
          
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-center mb-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-3">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-800">Dica Especial</h4>
            </div>
            <p className="text-gray-700 mb-3">
              Comece criando seu primeiro plano de aula. É rápido, fácil e alinhado à BNCC!
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                Rápido
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                Fácil
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                BNCC
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm font-medium text-yellow-800 mb-1">🚀 Próximos passos:</p>
            <p className="text-sm text-yellow-700">
              Explore o Dashboard e comece a criar seus primeiros materiais!
            </p>
          </div>
        </div>
  }];
  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Completar primeiro acesso e salvar informações integradas
      const completeUserInfo = {
        ...userInfo,
        // Integrar com formato do perfil
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
  const toggleArrayItem = (field: keyof Pick<UserInfo, 'grades' | 'subjects' | 'materialTypes'>, item: string) => {
    setUserInfo(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).includes(item) ? (prev[field] as string[]).filter(i => i !== item) : [...(prev[field] as string[]), item]
    }));
  };
  const currentTourStep = tourSteps[currentStep];
  return <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto p-0 border-0 shadow-2xl">
        <div className="p-6 md:p-8">
          

          <div className="mb-8">
            {currentTourStep.content}
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div className="flex space-x-2">
              {tourSteps.map((_, index) => <div key={index} className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentStep ? 'bg-blue-500 w-8' : index < currentStep ? 'bg-green-500' : 'bg-gray-300'}`} />)}
            </div>

            <div className="flex space-x-3">
              {currentStep > 0 && <Button variant="outline" onClick={handlePrevious} className="flex items-center border-2 hover:bg-gray-50">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Anterior
                </Button>}
              
              <Button onClick={handleNext} className="flex items-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg" size="lg">
                {currentStep === tourSteps.length - 1 ? <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Começar a usar
                  </> : <>
                    Próximo
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>;
};
export default FirstAccessModal;