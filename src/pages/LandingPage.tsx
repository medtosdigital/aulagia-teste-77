
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, CheckCircle, Users, Clock, Download, Sparkles, Play, ArrowRight, Star, FileText, Presentation, Menu, X, XCircle, Crown, GraduationCap, ClipboardList, NotebookPen, FileCheck2, FileText as FileTextIcon, FileSpreadsheet, FileSignature } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Drawer, DrawerTrigger, DrawerContent } from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';

// Definir o tipo Plan igual à SubscriptionPage
interface Plan {
  name: string;
  id: string;
  price: { monthly: number; yearly: number };
  description: string;
  features: string[];
  materialTypes: string[];
  limitations: string[];
  highlight: boolean;
  buttonText: string;
  buttonStyle: string;
  popular?: boolean;
}

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const isMobile = useIsMobile();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const animatedTexts = [
    'Planos de Aula',
    'Slides',
    'Atividades',
    'Avaliações'
  ];
  const [currentText, setCurrentText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let typingTimeout: NodeJS.Timeout;
    if (!isDeleting && charIndex < animatedTexts[textIndex].length) {
      typingTimeout = setTimeout(() => {
        setCurrentText(animatedTexts[textIndex].slice(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      }, 60);
    } else if (isDeleting && charIndex > 0) {
      typingTimeout = setTimeout(() => {
        setCurrentText(animatedTexts[textIndex].slice(0, charIndex - 1));
        setCharIndex(charIndex - 1);
      }, 30);
    } else if (!isDeleting && charIndex === animatedTexts[textIndex].length) {
      typingTimeout = setTimeout(() => setIsDeleting(true), 1200);
    } else if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setTextIndex((textIndex + 1) % animatedTexts.length);
    }
    return () => clearTimeout(typingTimeout);
  }, [charIndex, isDeleting, textIndex]);

  // Substituir o bloco de definição dos planos para usar a mesma estrutura da SubscriptionPage
  const plans: Plan[] = [
    {
      name: 'Gratuito',
      id: 'gratuito',
      price: { monthly: 0, yearly: 0 },
      description: 'Ideal para quem quer testar a plataforma',
      features: [
        '5 materiais por mês',
        'Download em PDF',
        'Suporte básico',
        'Acesso aos templates básicos'
      ],
      materialTypes: [
        'Planos de Aula básicos',
        'Atividades simples'
      ],
      limitations: [
        'Sem download em Word/PPT',
        '5 materiais por mês',
        'Sem edição avançada',
        'Sem Slides Interativos',
        'Sem Avaliações Personalizadas',
        'Sem acesso ao Calendário de aulas'
      ],
      highlight: false,
      buttonText: 'Começar Grátis',
      buttonStyle: 'bg-gray-500 hover:bg-gray-600 text-white'
    },
    {
      name: 'Professor',
      id: 'professor',
      price: { monthly: 29.90, yearly: 299 },
      description: 'Para professores que querem mais recursos',
      features: [
        '50 materiais por mês',
        'Download em PDF, Word e PPT',
        'Edição completa de materiais',
        'Todos os templates disponíveis',
        'Suporte por e-mail',
        'Calendário de aulas',
        'Histórico completo'
      ],
      materialTypes: [
        'Planos de Aula completos',
        'Slides interativos',
        'Atividades diversificadas',
        'Avaliações personalizadas'
      ],
      limitations: [],
      highlight: true,
      buttonText: 'Assinar Agora',
      buttonStyle: 'bg-blue-500 hover:bg-blue-600 text-white',
      popular: true
    },
    {
      name: 'Grupo Escolar',
      id: 'grupo-escolar',
      price: { monthly: 89.90, yearly: 849 },
      description: 'Para grupos de professores e instituições de ensino',
      features: [
        'Até 5 professores',
        '300 materiais por mês (total)',
        'Todos os recursos do plano Professor',
        'Dashboard de gestão colaborativa',
        'Compartilhamento de materiais entre professores',
        'Relatórios detalhados de uso',
        'Suporte prioritário',
        'Gestão centralizada de usuários',
        'Controle de permissões',
        'Distribuição flexível de materiais entre professores'
      ],
      materialTypes: [],
      limitations: [],
      highlight: false,
      buttonText: 'Assinar Agora',
      buttonStyle: 'bg-green-500 hover:bg-green-600 text-white'
    }
  ];

  const materialTypes = [
    {
      name: 'Planos de Aula',
      icon: <NotebookPen className="w-8 h-8 md:w-12 md:h-12" />, // Livro com caneta
      description: 'Estruture aulas completas alinhadas à BNCC, com objetivos, conteúdos e metodologias detalhadas.',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      name: 'Slides Interativos',
      icon: <Presentation className="w-8 h-8 md:w-12 md:h-12" />, // Ícone de apresentação
      description: 'Apresentações visuais e interativas com design profissional e recursos pedagógicos avançados.',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      name: 'Atividades Práticas',
      icon: <FileSignature className="w-8 h-8 md:w-12 md:h-12" />, // Livro com caneta/atividade
      description: 'Exercícios diversificados para praticar, revisar e fixar conteúdos com sua turma de forma eficaz.',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50'
    },
    {
      name: 'Avaliações',
      icon: <FileCheck2 className="w-8 h-8 md:w-12 md:h-12" />, // Checklist/prova
      description: 'Crie provas, simulados e avaliações diagnósticas personalizadas de forma rápida e segura.',
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50'
    },
  ];

  const benefits = [
    {
      icon: <Clock className="w-6 h-6 md:w-8 md:h-8 text-primary-500" />,
      title: 'Economize Tempo',
      description: 'Reduza horas de preparação por semana com materiais prontos e personalizáveis.'
    },
    {
      icon: <Download className="w-6 h-6 md:w-8 md:h-8 text-primary-500" />,
      title: 'Múltiplos Formatos',
      description: 'Baixe seus materiais em PDF, Word e PowerPoint para usar onde quiser.'
    },
    {
      icon: <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-primary-500" />,
      title: 'IA Personalizada',
      description: 'Inteligência artificial que adapta conteúdos às suas necessidades específicas.'
    },
    {
      icon: <Users className="w-6 h-6 md:w-8 md:h-8 text-primary-500" />,
      title: 'Colaboração',
      description: 'Compartilhe materiais e trabalhe em equipe com outros educadores.'
    },
    {
      icon: <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-primary-500" />,
      title: 'BNCC Alinhada',
      description: 'Todos os materiais seguem rigorosamente a Base Nacional Comum Curricular.'
    },
    {
      icon: <Star className="w-6 h-6 md:w-8 md:h-8 text-primary-500" />,
      title: 'Suporte Dedicado',
      description: 'Atendimento especializado para educadores e gestores escolares.'
    }
  ];

  const testimonials = [
    {
      name: 'Prof. Maria Silva',
      role: 'Professora de Matemática',
      content: 'A AulagIA revolucionou minha forma de preparar aulas. Economizo 10 horas por semana!',
      rating: 5
    },
    {
      name: 'João Santos',
      role: 'Coordenador Pedagógico',
      content: 'Nossa escola adotou a plataforma e a qualidade dos materiais impressionou todos os professores.',
      rating: 5
    },
    {
      name: 'Ana Costa',
      role: 'Professora de Português',
      content: 'Os planos de aula são detalhados e alinhados à BNCC. Perfeito para minha rotina!',
      rating: 5
    }
  ];

  // Corrigir tipos das funções:
  const getCurrentPrice = (plan: Plan) => {
    if (plan.id === 'gratuito') return 'R$ 0';
    return billingCycle === 'monthly'
      ? `R$ ${plan.price.monthly.toFixed(2).replace('.', ',')}`
      : `R$ ${plan.price.yearly.toFixed(2).replace('.', ',')}`;
  };
  const getCurrentPeriod = (plan: Plan) => {
    return '/mês';
  };
  const getSavings = (plan: Plan) => {
    if (plan.id === 'gratuito' || !plan.price.yearly) return null;
    const monthlyTotal = plan.price.monthly * 12;
    const yearlyPrice = plan.price.yearly;
    const savings = monthlyTotal - yearlyPrice;
    return savings > 0 ? `Economize R$ ${savings.toFixed(2).replace('.', ',')} por ano` : null;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <div className="flex items-center h-16 w-full max-w-7xl">
            {isMobile ? (
              <div className="flex items-center w-full justify-between relative">
                {/* Logo padrão Sidebar no mobile */}
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <div className="bg-primary-500 text-white p-3 rounded-lg">
                <BookOpen className="w-6 h-6" />
              </div>
                  <div className="flex flex-col justify-center">
                    <span className="logo-text text-2xl text-primary-600" style={{fontWeight: 400}}>AulagIA</span>
                    <span className="text-xs text-gray-500 -mt-1">Sua aula com toque mágico</span>
              </div>
            </div>
                {/* Botão Entrar à direita */}
                <Button onClick={() => navigate('/login')} className="ml-auto mr-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold px-5 py-2 text-sm shadow-md">Entrar</Button>
                {/* Botão de menu suspenso */}
                <div className="relative">
                  <Button variant="ghost" size="icon" className="ml-1" onClick={() => setShowMobileMenu(v => !v)}>
                    {showMobileMenu ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
                  </Button>
                  {showMobileMenu && (
                    <div className="fixed left-0 right-0 top-[64px] w-full bg-white shadow-xl rounded-b-2xl border-b border-gray-100 z-50 animate-fade-in flex flex-col items-center px-6 py-6 gap-6" style={{minWidth:220}}>
                      <nav className="flex flex-col gap-6 w-full max-w-xs mx-auto text-center">
                        <a href="#recursos" className="text-gray-700 hover:text-primary-600 font-medium text-lg transition-colors flex items-center justify-center gap-2" onClick={()=>setShowMobileMenu(false)}>
                          Recursos <ArrowRight className="w-5 h-5 inline-block text-primary-400" />
                        </a>
                        <a href="#exemplos" className="text-gray-700 hover:text-primary-600 font-medium text-lg transition-colors flex items-center justify-center gap-2" onClick={()=>setShowMobileMenu(false)}>
                          Exemplos <ArrowRight className="w-5 h-5 inline-block text-primary-400" />
                        </a>
                        <a href="#beneficios" className="text-gray-700 hover:text-primary-600 font-medium text-lg transition-colors flex items-center justify-center gap-2" onClick={()=>setShowMobileMenu(false)}>
                          Benefícios <ArrowRight className="w-5 h-5 inline-block text-primary-400" />
                        </a>
                        <a href="#planos" className="text-gray-700 hover:text-primary-600 font-medium text-lg transition-colors flex items-center justify-center gap-2" onClick={()=>setShowMobileMenu(false)}>
                          Preços <ArrowRight className="w-5 h-5 inline-block text-primary-400" />
                        </a>
            </nav>
                      <div className="flex flex-col gap-3 w-full max-w-xs mx-auto mt-6">
                        <Button size="lg" className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-lg font-semibold shadow-md w-full" onClick={()=>{setShowMobileMenu(false); document.getElementById('planos')?.scrollIntoView({behavior: 'smooth'});}}>Começar Gratuitamente</Button>
                        <Button size="lg" variant="outline" className="border-primary-500 text-primary-600 text-lg font-semibold w-full" onClick={()=>{setShowMobileMenu(false); navigate('/login');}}>Entrar Agora</Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Logo à esquerda */}
                <div className="flex items-center space-x-3 flex-shrink-0">
                  <div className="bg-primary-500 text-white p-3 rounded-lg">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className="logo-text text-2xl text-primary-600" style={{fontWeight: 400}}>AulagIA</span>
                    <span className="text-xs text-gray-500 -mt-1">Sua aula com toque mágico</span>
                  </div>
                </div>
                {/* Menu centralizado */}
                <nav className="flex-1 flex items-center justify-center space-x-8">
                  <a href="#recursos" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">Recursos</a>
                  <a href="#exemplos" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">Exemplos</a>
                  <a href="#beneficios" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">Benefícios</a>
                  <a href="#planos" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">Preços</a>
                </nav>
                {/* Botão Entrar à direita */}
                <Button onClick={() => navigate('/login')} className="ml-8 bg-gradient-to-r from-primary-500 to-secondary-500 hover:scale-105 transition-transform px-8 py-3 text-base font-semibold shadow-md">Entrar</Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 text-center lg:text-left">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="animate-fade-in">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-2 leading-tight">
                Transforme sua 
              </h1>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-primary-500 mb-4 leading-tight">
              Rotina Pedagógica
            </h2>
            <div className="text-2xl md:text-4xl font-extrabold mb-8 h-14 flex items-center justify-center lg:justify-start animate-fade-in drop-shadow-sm">
              <span className="text-gray-900">Criando&nbsp;</span><span className="bg-gradient-to-r from-primary-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">{currentText}</span>
              <span className="blinking-cursor ml-1 text-primary-500">|</span>
            </div>
            <p className="text-lg md:text-xl text-gray-700 mb-4 font-semibold animate-fade-in">
              Preparar suas aulas será muito mais fácil. Foque no que importa: <span className="text-primary-600 font-bold">Ensinar</span>.
            </p>
            <p className="text-base md:text-lg text-gray-600 mb-8 leading-relaxed max-w-xl">
              Crie planos de aula, slides, atividades e avaliações em minutos. Tenha acesso a recursos exclusivos com inteligência artificial personalizada para educadores.
            </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center lg:justify-start">
                <Button 
                  size="lg"
                  onClick={() => document.getElementById('planos')?.scrollIntoView({behavior: 'smooth'})}
                  className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:scale-105 transition-all text-lg px-8 py-3"
                >
                  Começar Gratuitamente
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => document.getElementById('exemplos')?.scrollIntoView({behavior: 'smooth'})}
                  className="text-lg px-8 py-3 group"
                >
                  <Play className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                  Ver Exemplos
                </Button>
              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-500 justify-center lg:justify-start">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Sem cartão de crédito
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Cancele quando quiser
                </div>
              </div>
            </div>
            <div className="animate-fade-in animation-delay-300">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-3xl transform rotate-6 opacity-20"></div>
                <Card className="relative bg-white shadow-2xl rounded-3xl overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
                    <div className="text-center">
                      <div className="bg-white rounded-full p-6 shadow-lg mb-4 inline-block">
                        <Play className="w-8 md:w-12 h-8 md:h-12 text-primary-500" />
                      </div>
                      <p className="text-gray-600 font-medium text-sm md:text-base">Veja a AulagIA em ação</p>
                      <p className="text-xs md:text-sm text-gray-500">Demonstração de 2 minutos</p>
                    </div>
                  </div>
                </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Material Types Section */}
      <section id="recursos" className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Todos os materiais que você precisa
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Crie conteúdos pedagógicos completos e alinhados à BNCC com nossa inteligência artificial
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {materialTypes.map((type, index) => (
              <Card key={type.name} className={`group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 ${type.bgColor} border-0 animate-fade-in`} style={{animationDelay: `${index * 100}ms`, height: 'auto', maxHeight: 'none', overflow: 'visible'}}>
                <CardContent className="p-6 md:p-8 text-center">
                  <div className={`inline-flex p-3 md:p-4 rounded-2xl bg-gradient-to-r ${type.color} text-white mb-4 md:mb-6 group-hover:scale-110 transition-transform`}>
                    {type.icon}
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4">{type.name}</h3>
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed">{type.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Examples Section */}
      <section id="exemplos" className="py-12 md:py-20 bg-gradient-to-br from-gray-50 to-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Veja exemplos dos materiais criados
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Conheça a qualidade e o nível de detalhamento dos materiais gerados pela AulagIA
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 md:gap-12">
            {/* Slide Example */}
            <div className="animate-fade-in">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 md:p-6">
                  <div className="flex items-center space-x-3">
                    <Presentation className="w-6 h-6 md:w-8 md:h-8" />
                    <div>
                      <h3 className="text-lg md:text-xl font-bold">Slide Interativo</h3>
                      <p className="text-sm md:text-base text-blue-100">Matemática - Formas Geométricas</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 md:p-6">
                  <img 
                    src="/lovable-uploads/8d8c57d9-c003-47e7-a99b-66b9dcd5c539.png" 
                    alt="Exemplo de slide sobre formas geométricas"
                    className="w-full rounded-lg shadow-md"
                  />
                  <div className="mt-4">
                    <Badge className="bg-blue-100 text-blue-800 mb-2">Ensino Fundamental I-3º Ano</Badge>
                    <p className="text-sm md:text-base text-gray-600">
                      Slides coloridos e interativos que facilitam o aprendizado das formas geométricas, 
                      com elementos visuais que prendem a atenção dos alunos.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Lesson Plan Example */}
            <div className="animate-fade-in animation-delay-300">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 md:p-6">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-6 h-6 md:w-8 md:h-8" />
                    <div>
                      <h3 className="text-lg md:text-xl font-bold">Plano de Aula</h3>
                      <p className="text-sm md:text-base text-purple-100">Matemática - Multiplicação</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 md:p-6">
                  <img 
                    src="/lovable-uploads/19d67dd7-a768-49dd-a633-506c212567d6.png" 
                    alt="Exemplo de plano de aula sobre multiplicação"
                    className="w-full rounded-lg shadow-md"
                  />
                  <div className="mt-4">
                    <Badge className="bg-purple-100 text-purple-800 mb-2">50 minutos - BNCC EF03MA13, EF03MA14</Badge>
                    <p className="text-sm md:text-base text-gray-600">
                      Planos de aula estruturados com objetivos claros, desenvolvimento detalhado 
                      e recursos necessários, totalmente alinhados à BNCC.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-8 md:mt-12">
            <Button 
              size="lg"
              onClick={() => navigate('/login')}
              className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:scale-105 transition-all text-lg px-8 py-3"
            >
              Criar Meus Materiais Agora
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="beneficios" className="py-12 md:py-20 bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Por que mais de 10.000 educadores escolheram a AulagIA?
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Descubra os benefícios que transformaram a rotina de milhares de professores
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {benefits.map((benefit, index) => (
              <Card key={benefit.title} className="bg-white hover:shadow-lg transition-all duration-300 animate-fade-in" style={{animationDelay: `${index * 100}ms`}}>
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary-50 p-2 md:p-3 rounded-lg flex-shrink-0">
                      {benefit.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2 text-sm md:text-base">{benefit.title}</h3>
                      <p className="text-gray-600 text-sm md:text-base">{benefit.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              O que dizem nossos educadores
            </h2>
            <p className="text-lg md:text-xl text-gray-600">
              Histórias reais de transformação na educação
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={testimonial.name} className="bg-gray-50 hover:shadow-lg transition-all duration-300 animate-fade-in" style={{animationDelay: `${index * 100}ms`}}>
                <CardContent className="p-4 md:p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 md:w-5 md:h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic text-sm md:text-base">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm md:text-base">{testimonial.name}</p>
                    <p className="text-xs md:text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="planos" className="py-12 md:py-20 bg-gradient-to-br from-gray-50 to-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Escolha o plano ideal para você
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Comece grátis e evolua conforme suas necessidades. Sem compromisso, cancele quando quiser.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center bg-white rounded-full p-1 shadow-md">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 md:px-6 py-2 rounded-full text-sm md:text-base font-medium transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Mensal
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 md:px-6 py-2 rounded-full text-sm md:text-base font-medium transition-all ${
                  billingCycle === 'yearly'
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Anual
                <Badge className="ml-2 bg-green-100 text-green-800 text-xs">2 meses grátis</Badge>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card
                key={plan.name}
                className={`relative flex flex-col transition-all duration-300 hover:shadow-xl rounded-xl p-4 md:p-6 ${
                  plan.highlight ? 'ring-2 ring-blue-500 lg:scale-105 border-2 border-blue-200' :
                  plan.name === 'Professor' ? 'ring-2 ring-green-500 border-2 border-green-500 bg-green-50' :
                  'border-2 border-gray-200'
                }`}
                style={{animationDelay: `${index * 100}ms`, height: '100%', maxHeight: 'none', overflow: 'visible'}}
              >
                {plan.popular && plan.name !== 'Professor' && typeof plan.name === 'string' && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white px-3 md:px-4 py-1 text-xs">POPULAR</Badge>
                  </div>
                )}
                {plan.name === 'Professor' && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-green-500 text-white px-3 md:px-4 py-1 text-xs">PLANO RECOMENDADO</Badge>
                  </div>
                )}
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">{plan.name}</h3>
                  <p className="text-gray-600 text-xs md:text-sm">
                    {plan.name === 'Gratuito' && 'Ideal para quem quer testar a plataforma'}
                    {plan.name === 'Professor' && 'Para professores que querem mais recursos'}
                    {plan.name === 'Grupo Escolar' && 'Para grupos de professores e instituições de ensino'}
                  </p>
                </div>
                <div className="mb-6">
                  <span className="text-2xl md:text-3xl font-bold text-gray-800">{getCurrentPrice(plan)}</span>
                  <span className="text-gray-500 text-sm">{getCurrentPeriod(plan)}</span>
                  {/* Exibir valor mensal equivalente e meses grátis no anual */}
                  {billingCycle === 'yearly' && (plan.id === 'professor' || plan.id === 'grupo-escolar') && (
                    <div className="mt-1 flex items-center gap-2">
                      <span className="block text-xs md:text-sm text-gray-500">
                        ou R$ {(plan.price.yearly / 12).toFixed(2).replace('.', ',')}/mês
                      </span>
                      <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full font-medium">2 meses grátis</span>
                    </div>
                  )}
                </div>
                {/* Tipos de Materiais */}
                {plan.materialTypes.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center text-sm">
                    <Presentation className="w-4 h-4 text-blue-600 mr-2" /> Tipos de Materiais
                  </h4>
                  <div className="space-y-2">
                      {plan.materialTypes.map((type, idx) => (
                        <div key={idx} className="flex items-start">
                          {/* Ícone por tipo, igual assinatura */}
                          {type.includes('Plano') && <GraduationCap className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />}
                          {type.includes('Slides') && <Presentation className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />}
                          {type.includes('Atividades') && <ClipboardList className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />}
                          {type.includes('Avalia') && <FileText className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />}
                          <span className="text-gray-700 text-xs md:text-sm">{type}</span>
                      </div>
                      ))}
                    </div>
                    </div>
                )}
                {/* Box azul especial para Grupo Escolar */}
                {plan.id === 'grupo-escolar' && (
                  <div className="mb-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4">
                      <h4 className="font-semibold text-blue-800 mb-2 flex items-center text-sm">
                        <Crown className="w-4 h-4 text-blue-600 mr-2" /> Todos os recursos do plano Professor
                      </h4>
                      <p className="text-blue-700 text-xs">
                        Inclui todos os tipos de materiais e funcionalidades do plano Professor, além dos recursos colaborativos exclusivos para grupos.
                      </p>
                      <p className="text-blue-700 text-xs mt-2">
                        <strong>300 materiais por mês</strong> que podem ser distribuídos flexivelmente entre até 5 professores.
                      </p>
                    </div>
                  </div>
                )}
                {/* Lista de benefícios */}
                <ul className="space-y-2 md:space-y-3 mb-6 flex-1">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <CheckCircle className="w-4 md:w-5 h-4 md:h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-xs md:text-sm">{feature}</span>
                  </li>
                  ))}
                  {plan.limitations && plan.limitations.map((limitation, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="w-4 md:w-5 h-4 md:h-5 text-red-400 mr-2 mt-0.5 flex-shrink-0">×</span>
                      <span className="text-gray-400 text-xs md:text-sm">{limitation}</span>
                  </li>
                  ))}
                </ul>
                <Button
                  onClick={() => navigate('/login')}
                  className={`w-full py-2 md:py-3 text-sm ${
                    plan.name === 'Professor'
                      ? 'bg-green-600 hover:bg-green-700'
                      : plan.popular
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : plan.name === 'Grupo Escolar'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-gray-900 hover:bg-gray-800'
                  }`}
                >
                  Assinar Agora
                </Button>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8 md:mt-12">
            <p className="text-gray-600 mb-6 text-sm md:text-base">
              Tem dúvidas? Fale conosco e tire todas as suas questões.
            </p>
            <Button variant="outline" size="lg" className="text-sm md:text-base">
              Falar com Especialista
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-12 md:py-20 bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6">
            Pronto para transformar suas aulas?
          </h2>
          <p className="text-lg md:text-xl mb-8 opacity-90">
            Junte-se a milhares de educadores que já descobriram o poder da AulagIA. 
            Comece gratuitamente hoje mesmo!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              variant="secondary"
              onClick={() => navigate('/login')}
              className="bg-white text-primary-600 hover:bg-gray-50 text-lg px-8 py-3"
            >
              Criar Conta Grátis
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-[#19a7f6] text-white p-3 rounded-xl">
                  <BookOpen className="w-8 h-8" />
                </div>
                <div className="flex flex-col">
                  <span className="logo-text text-2xl text-[#19a7f6] leading-tight" style={{fontFamily: 'Fredoka One, cursive', fontWeight: 400}}>AulagIA</span>
                  <span className="text-sm text-gray-400 -mt-1">Sua aula com toque mágico</span>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                Transformando a educação com tecnologia e criatividade.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm md:text-base">Recursos</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Planos de Aula</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Slides</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Atividades</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Avaliações</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm md:text-base">Suporte</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tutoriais</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm md:text-base">Empresa</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Sobre</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacidade</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 md:mt-8 pt-6 md:pt-8 text-center text-gray-400">
            <p className="text-xs md:text-sm">&copy; 2025 AulagIA. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Floating CTA Button - Agora visível também no mobile */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button 
          size="lg"
          onClick={() => navigate('/login')}
          className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:scale-110 transition-all shadow-lg rounded-full px-6 py-3 text-base md:text-lg"
        >
          Começar Grátis
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
          opacity: 0;
        }
        .animation-delay-300 {
          animation-delay: 300ms;
        }
        html {
          scroll-behavior: smooth;
        }
        .blinking-cursor {
          animation: blink 1s steps(2, start) infinite;
        }
        @keyframes blink {
          to {
            visibility: hidden;
          }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
