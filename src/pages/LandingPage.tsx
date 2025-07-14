
import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Star, Users, Award, CheckCircle, ArrowRight, Sparkles, Target, Zap, Crown, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Footer from '@/components/Footer';

const LandingPage = () => {
  const plans = [
    {
      name: "Gratuito",
      price: "R$ 0",
      period: "para sempre",
      description: "Perfeito para começar",
      features: [
        "5 materiais por mês",
        "Planos de aula básicos",
        "Suporte por email",
        "Templates básicos"
      ],
      popular: false,
      cta: "Começar Grátis"
    },
    {
      name: "Professor",
      price: "R$ 29,90",
      period: "por mês",
      description: "Para educadores dedicados",
      features: [
        "50 materiais por mês",
        "Slides personalizados",
        "Atividades e avaliações",
        "Download em Word e PPT",
        "Calendário de aulas",
        "Suporte prioritário"
      ],
      popular: true,
      cta: "Experimentar Grátis"
    },
    {
      name: "Grupo Escolar",
      price: "R$ 89,90",
      period: "por mês",
      description: "Para instituições de ensino",
      features: [
        "300 materiais por mês",
        "Gestão de professores",
        "Relatórios detalhados",
        "Recursos administrativos",
        "Todos os recursos do Professor",
        "Suporte dedicado"
      ],
      popular: false,
      cta: "Falar com Vendas"
    }
  ];

  const testimonials = [
    {
      name: "Maria Silva",
      role: "Professora de Matemática",
      content: "O AulagIA revolucionou minha forma de preparar aulas. Economizo horas toda semana!",
      rating: 5
    },
    {
      name: "João Santos",
      role: "Coordenador Pedagógico",
      content: "Impressionante como a IA consegue criar conteúdo alinhado à BNCC de forma tão precisa.",
      rating: 5
    },
    {
      name: "Ana Costa",
      role: "Professora de História",
      content: "Meus alunos ficaram muito mais engajados com os slides interativos que consigo criar.",
      rating: 5
    }
  ];

  const features = [
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Planos de Aula Inteligentes",
      description: "Crie planos de aula alinhados à BNCC em minutos, com objetivos claros e metodologias eficazes."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Slides Dinâmicos",
      description: "Gere apresentações visuais atrativas com imagens e design profissional automaticamente."
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Atividades Personalizadas",
      description: "Desenvolva exercícios e avaliações adaptados ao nível dos seus alunos."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Economia de Tempo",
      description: "Reduza o tempo de preparação em até 80%, focando no que realmente importa: ensinar."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-primary-500 text-white p-2 rounded-lg">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h1 className="logo-text text-xl text-primary-600 font-bold">AulagIA</h1>
                <p className="text-xs text-gray-500 -mt-1">Sua aula com toque mágico</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-600 hover:text-primary-600 transition-colors">
                Entrar
              </Link>
              <Link to="/login">
                <Button className="btn-magic">
                  Começar Grátis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 to-secondary-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center bg-white/80 backdrop-blur-sm border border-primary-200 rounded-full px-4 py-2 mb-8">
              <Sparkles className="w-4 h-4 text-primary-500 mr-2" />
              <span className="text-sm font-medium text-primary-700">
                Powered by Inteligência Artificial
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Transforme suas aulas com
              <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent block">
                Inteligência Artificial
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Crie planos de aula, slides e atividades incríveis em minutos. 
              Alinhado à BNCC, personalizado para seus alunos.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button size="lg" className="btn-magic text-lg px-8 py-4">
                  <Play className="w-5 h-5 mr-2" />
                  Experimentar Grátis
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="text-lg px-8 py-4 border-2">
                Ver Demonstração
              </Button>
            </div>
            
            <div className="mt-12 flex items-center justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Grátis para começar
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Sem cartão de crédito
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Alinhado à BNCC
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tudo que você precisa para criar aulas incríveis
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Nossa IA foi treinada especificamente para educação brasileira, 
              seguindo as diretrizes da BNCC.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Professores já estão transformando suas aulas
            </h2>
            <p className="text-xl text-gray-600">
              Veja o que educadores estão dizendo sobre o AulagIA
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Escolha o plano ideal para você
            </h2>
            <p className="text-xl text-gray-600">
              Comece grátis e evolua conforme suas necessidades
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div 
                key={index} 
                className={`relative p-8 rounded-2xl border-2 ${
                  plan.popular 
                    ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-secondary-50' 
                    : 'border-gray-200 bg-white'
                } hover:shadow-lg transition-shadow`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center">
                      <Crown className="w-4 h-4 mr-1" />
                      Mais Popular
                    </div>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600 ml-2">{plan.period}</span>
                  </div>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link to="/login" className="block">
                  <Button 
                    className={`w-full ${
                      plan.popular 
                        ? 'btn-magic' 
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                    size="lg"
                  >
                    {plan.cta}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Pronto para transformar suas aulas?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Junte-se a milhares de professores que já descobriram o poder da IA na educação.
          </p>
          <Link to="/login">
            <Button size="lg" className="bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-4">
              <Sparkles className="w-5 h-5 mr-2" />
              Começar Agora - É Grátis
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
