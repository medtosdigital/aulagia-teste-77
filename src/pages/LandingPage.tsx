
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  BookOpen, 
  Users, 
  Clock, 
  CheckCircle, 
  Star, 
  ArrowRight, 
  MessageCircle,
  Crown,
  Brain,
  FileText,
  Presentation,
  ClipboardList,
  GraduationCap,
  Download,
  Edit3,
  Mail,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const LandingPage = () => {
  const plans = [
    {
      id: 'gratuito',
      name: 'Gratuito',
      price: 'R$ 0',
      period: '/mês',
      description: 'Ideal para começar',
      features: [
        '5 materiais por mês',
        'Download em PDF',
        'Suporte básico',
        'Acesso aos templates básicos'
      ],
      buttonText: 'Começar Grátis',
      popular: false,
      color: 'border-gray-200'
    },
    {
      id: 'professor',
      name: 'Professor',
      price: 'R$ 29,90',
      period: '/mês',
      description: 'Para professores ativos',
      features: [
        '60 materiais por mês',
        'Download em PDF, Word e PPT',
        'Edição completa de materiais',
        'Suporte por e-mail',
        'Planos de Aula completos',
        'Slides interativos',
        'Atividades diversificadas',
        'Avaliações personalizadas'
      ],
      buttonText: 'Começar Agora',
      popular: true,
      color: 'border-green-500'
    },
    {
      id: 'grupo-escolar',
      name: 'Grupo Escolar',
      price: 'R$ 89,90',
      period: '/mês',
      description: 'Para escolas e grupos',
      features: [
        'Até 5 professores',
        '300 materiais por mês (total)',
        'Dashboard colaborativo',
        'Suporte prioritário',
        'Distribuição flexível de materiais',
        'Gestão centralizada de usuários',
        'Todos os recursos do plano Professor'
      ],
      buttonText: 'Contatar Vendas',
      popular: false,
      color: 'border-purple-500'
    }
  ];

  const features = [
    {
      icon: Brain,
      title: 'Inteligência Artificial Avançada',
      description: 'Crie materiais pedagógicos personalizados em segundos com nossa IA especializada em educação.'
    },
    {
      icon: FileText,
      title: 'Planos de Aula Completos',
      description: 'Gere planos de aula detalhados alinhados com a BNCC e adaptados ao seu contexto educacional.'
    },
    {
      icon: Presentation,
      title: 'Slides Interativos',
      description: 'Crie apresentações envolventes e interativas que prendem a atenção dos seus alunos.'
    },
    {
      icon: ClipboardList,
      title: 'Atividades Diversificadas',
      description: 'Desenvolva exercícios, jogos e atividades práticas adaptadas ao nível dos seus estudantes.'
    },
    {
      icon: GraduationCap,
      title: 'Avaliações Personalizadas',
      description: 'Crie provas, testes e rubricas de avaliação alinhadas aos seus objetivos pedagógicos.'
    },
    {
      icon: Download,
      title: 'Múltiplos Formatos',
      description: 'Baixe seus materiais em PDF, Word, PowerPoint e outros formatos para máxima flexibilidade.'
    }
  ];

  const testimonials = [
    {
      name: 'Maria Silva',
      role: 'Professora de Matemática',
      content: 'A AulagIA revolucionou minha preparação de aulas. O que levava horas agora faço em minutos!',
      rating: 5
    },
    {
      name: 'João Santos',
      role: 'Coordenador Pedagógico',
      content: 'Nossa escola adotou o plano Grupo Escolar e a produtividade da equipe aumentou 300%.',
      rating: 5
    },
    {
      name: 'Ana Costa',
      role: 'Professora de História',
      content: 'Os materiais gerados são de excelente qualidade e sempre alinhados com a BNCC.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AulagIA
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" className="font-medium">
                Entrar
              </Button>
            </Link>
            <Link to="/login">
              <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium">
                Começar Grátis
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - ATENÇÃO */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-6 bg-blue-100 text-blue-800 px-4 py-2">
              <Zap className="w-4 h-4 mr-2" />
              Revolucione suas aulas com IA
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Sua aula com{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                toque mágico
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Crie planos de aula, slides, atividades e avaliações em minutos com nossa inteligência artificial especializada em educação. Mais de 10.000 professores já confiam na AulagIA.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/login">
                <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium h-14 px-8 text-lg">
                  Começar Grátis Agora
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <div className="flex items-center gap-2 text-gray-600">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Sem cartão de crédito</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - INTERESSE */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Por que escolher a AulagIA?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Nossa plataforma oferece tudo que você precisa para criar materiais pedagógicos de qualidade
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              O que dizem nossos professores
            </h2>
            <p className="text-xl text-gray-600">
              Mais de 10.000 educadores confiam na AulagIA
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white border-gray-100">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section - DESEJO */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Escolha o plano ideal para você
            </h2>
            <p className="text-xl text-gray-600">
              Comece grátis e evolua conforme suas necessidades
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <Card key={plan.id} className={`relative ${plan.color} ${plan.popular ? 'ring-2 ring-green-500' : 'border-gray-200'}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-green-500 text-white px-3 py-1">
                      MAIS POPULAR
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold text-gray-900">{plan.name}</CardTitle>
                  <CardDescription className="text-gray-600">{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/login">
                    <Button 
                      className={`w-full h-12 font-medium ${
                        plan.popular 
                          ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white' 
                          : 'border-2 border-gray-200 bg-white hover:bg-gray-50 text-gray-900'
                      }`}
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      {plan.buttonText}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Support Button */}
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">Precisa de um plano personalizado para sua instituição?</p>
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50 font-medium"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Falar com Suporte
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section - AÇÃO */}
      <section className="py-20 bg-gradient-to-r from-blue-500 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-6">
              Pronto para revolucionar suas aulas?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Junte-se a milhares de professores que já economizam horas de preparação com a AulagIA
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 font-medium h-14 px-8 text-lg">
                  Começar Grátis Agora
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
            <p className="text-blue-100 mt-4 text-sm">
              ✓ Sem compromisso ✓ Cancele quando quiser ✓ Suporte em português
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">AulagIA</span>
              </div>
              <p className="text-gray-400">
                Sua aula com toque mágico. Criando o futuro da educação com inteligência artificial.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/features" className="hover:text-white">Funcionalidades</Link></li>
                <li><Link to="/pricing" className="hover:text-white">Preços</Link></li>
                <li><Link to="/examples" className="hover:text-white">Exemplos</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/help" className="hover:text-white">Central de Ajuda</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contato</Link></li>
                <li><Link to="/tutorials" className="hover:text-white">Tutoriais</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/terms" className="hover:text-white">Termos de Serviço</Link></li>
                <li><Link to="/privacy" className="hover:text-white">Política de Privacidade</Link></li>
                <li><Link to="/usage-terms" className="hover:text-white">Termos de Uso</Link></li>
                <li><Link to="/ai-disclaimer" className="hover:text-white">Aviso sobre IA</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 AulagIA. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
