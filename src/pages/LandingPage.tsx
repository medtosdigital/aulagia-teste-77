
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, CheckCircle, Users, Clock, Download, Sparkles, Play, ArrowRight, Star, FileText, Presentation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      name: 'Gratuito',
      price: 'R$ 0',
      yearlyPrice: 'R$ 0',
      period: '/mês',
      description: 'Ideal para quem quer testar a plataforma',
      features: [
        '5 materiais por mês',
        'Planos de Aula básicos',
        'Atividades simples',
        'Suporte básico',
        'Acesso aos templates básicos'
      ],
      limitations: [
        'Sem download em Word/PPT',
        'Sem Slides Interativos',
        'Sem Avaliações Personalizadas'
      ],
      highlight: false,
      buttonText: 'Começar Grátis',
      buttonStyle: 'bg-gray-500 hover:bg-gray-600 text-white'
    },
    {
      name: 'Professor',
      price: 'R$ 29,90',
      yearlyPrice: 'R$ 299,00',
      period: '/mês',
      yearlyPeriod: '/ano',
      description: 'Para professores que querem mais recursos',
      popular: true,
      features: [
        '50 materiais por mês',
        'Planos de Aula completos',
        'Slides interativos',
        'Atividades diversificadas',
        'Avaliações personalizadas',
        'Download em PDF, Word e PPT',
        'Edição completa de materiais',
        'Todos os templates disponíveis',
        'Suporte por e-mail',
        'Calendário de aulas',
        'Histórico completo'
      ],
      highlight: true,
      buttonText: 'Assinar Agora',
      buttonStyle: 'bg-blue-500 hover:bg-blue-600 text-white'
    },
    {
      name: 'Grupo Escolar',
      price: 'R$ 89,90',
      yearlyPrice: 'R$ 899,00',
      period: '/mês',
      yearlyPeriod: '/ano',
      description: 'Para grupos de professores e instituições de ensino',
      features: [
        'Todos os recursos do plano Professor',
        'Até 5 professores',
        '300 materiais por mês (total)',
        'Dashboard de gestão colaborativa',
        'Compartilhamento de materiais entre professores',
        'Relatórios detalhados de uso',
        'Suporte prioritário',
        'Gestão centralizada de usuários',
        'Controle de permissões',
        'Distribuição flexível de materiais entre professores'
      ],
      highlight: false,
      buttonText: 'Assinar Agora',
      buttonStyle: 'bg-green-500 hover:bg-green-600 text-white'
    },
  ];

  const materialTypes = [
    {
      name: 'Planos de Aula',
      icon: <BookOpen className="w-8 h-8 md:w-12 md:h-12" />,
      description: 'Estruture aulas completas alinhadas à BNCC, com objetivos, conteúdos e metodologias detalhadas.',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      name: 'Slides Interativos',
      icon: <Sparkles className="w-8 h-8 md:w-12 md:h-12" />,
      description: 'Apresentações visuais e interativas com design profissional e recursos pedagógicos avançados.',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      name: 'Atividades Práticas',
      icon: <Users className="w-8 h-8 md:w-12 md:h-12" />,
      description: 'Exercícios diversificados para praticar, revisar e fixar conteúdos com sua turma de forma eficaz.',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50'
    },
    {
      name: 'Avaliações',
      icon: <CheckCircle className="w-8 h-8 md:w-12 md:h-12" />,
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

  const getCurrentPrice = (plan: any) => {
    if (plan.name === 'Gratuito') return plan.price;
    return billingCycle === 'monthly' ? plan.price : plan.yearlyPrice;
  };

  const getCurrentPeriod = (plan: any) => {
    if (plan.name === 'Gratuito') return plan.period;
    return billingCycle === 'monthly' ? plan.period : plan.yearlyPeriod;
  };

  const getSavings = (plan: any) => {
    if (plan.name === 'Gratuito' || !plan.yearlyPrice) return null;
    const monthlyTotal = parseFloat(plan.price.replace('R$ ', '').replace(',', '.')) * 12;
    const yearlyPrice = parseFloat(plan.yearlyPrice.replace('R$ ', '').replace(',', '.'));
    const savings = monthlyTotal - yearlyPrice;
    return savings > 0 ? `Economize R$ ${savings.toFixed(2).replace('.', ',')} por ano` : null;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white p-2 rounded-xl">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <span className="logo-text text-xl text-primary-600 font-bold">AulagIA</span>
                <p className="text-xs text-gray-500 -mt-1 hidden sm:block">Sua aula com toque mágico</p>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#recursos" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                Recursos
              </a>
              <a href="#exemplos" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                Exemplos
              </a>
              <a href="#beneficios" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                Benefícios
              </a>
              <a href="#planos" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                Preços
              </a>
              <Button 
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:scale-105 transition-transform"
              >
                Entrar
              </Button>
            </nav>

            <Button 
              variant="ghost" 
              className="md:hidden"
              onClick={() => navigate('/login')}
            >
              Entrar
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12 md:py-20">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f0f9ff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="animate-fade-in text-center lg:text-left">
              <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Transforme sua 
                <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                  {' '}rotina pedagógica
                </span>
                {' '}com IA
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
                Crie planos de aula, slides, atividades e avaliações em minutos. 
                Tenha acesso a recursos exclusivos com inteligência artificial 
                personalizada para educadores.
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
              <Card key={type.name} className={`group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 ${type.bgColor} border-0 animate-fade-in`} style={{animationDelay: `${index * 100}ms`}}>
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
                className={`relative ${plan.highlight ? 'ring-2 ring-primary-500 transform scale-105' : ''} hover:shadow-xl transition-all duration-300 animate-fade-in`}
                style={{animationDelay: `${index * 100}ms`}}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      POPULAR
                    </span>
                  </div>
                )}
                
                <CardContent className="p-6 md:p-8">
                  <div className="text-center mb-6 md:mb-8">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 mb-4 text-sm md:text-base">{plan.description}</p>
                    <div className="mb-4 md:mb-6">
                      <span className="text-3xl md:text-4xl font-bold text-gray-900">{getCurrentPrice(plan)}</span>
                      <span className="text-gray-500 text-sm md:text-base">{getCurrentPeriod(plan)}</span>
                      {billingCycle === 'yearly' && getSavings(plan) && (
                        <p className="text-green-600 text-xs md:text-sm font-medium mt-1">{getSavings(plan)}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 md:space-y-4 mb-6 md:mb-8 max-h-64 overflow-y-auto">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start">
                        <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm md:text-base">{feature}</span>
                      </div>
                    ))}
                    
                    {plan.limitations?.map((limitation) => (
                      <div key={limitation} className="flex items-start opacity-60">
                        <div className="w-4 h-4 md:w-5 md:h-5 mr-3 mt-0.5 flex-shrink-0">
                          <div className="w-3 h-3 md:w-4 md:h-4 rounded-full border-2 border-gray-300 mt-0.5"></div>
                        </div>
                        <span className="text-gray-500 line-through text-sm md:text-base">{limitation}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    className={`w-full py-3 ${plan.buttonStyle} hover:scale-105 transition-transform text-sm md:text-base`}
                    onClick={() => navigate('/login')}
                  >
                    {plan.buttonText}
                  </Button>
                </CardContent>
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
            
            <Button 
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-primary-600 text-lg px-8 py-3"
            >
              Agendar Demonstração
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
                <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white p-2 rounded-xl">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <span className="logo-text text-xl font-bold">AulagIA</span>
                  <p className="text-xs text-gray-400 -mt-1">Sua aula com toque mágico</p>
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

      {/* Floating CTA Button - Hidden on mobile */}
      <div className="fixed bottom-6 right-6 z-50 hidden md:block">
        <Button 
          size="lg"
          onClick={() => navigate('/login')}
          className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:scale-110 transition-all shadow-lg rounded-full px-6 py-3"
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
      `}</style>
    </div>
  );
};

export default LandingPage;
