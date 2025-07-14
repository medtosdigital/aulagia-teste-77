import React from 'react';
import { useNavigate } from 'react-router-dom';

const plans = [
  {
    name: 'Gratuito',
    price: 'R$ 0',
    period: '/mês',
    features: [
      'Até 5 materiais/mês',
      'Acesso limitado a recursos',
      'Sem download Word/PPT',
      'Suporte básico',
    ],
    highlight: false,
    badge: 'Comece grátis',
  },
  {
    name: 'Professor',
    price: 'R$ 29,90',
    period: '/mês',
    features: [
      'Até 50 materiais/mês',
      'Download Word/PPT',
      'Acesso a slides e avaliações',
      'Suporte por e-mail',
    ],
    highlight: false,
    badge: 'Mais popular',
  },
  {
    name: 'Grupo Escolar',
    price: 'R$ 89,90',
    period: '/mês',
    features: [
      'Até 300 materiais/mês',
      'Gestão de professores',
      'Distribuição de limites',
      'Suporte prioritário',
    ],
    highlight: true,
    badge: 'Para escolas',
  },
];

const materialTypes = [
  {
    name: 'Plano de Aula',
    icon: (
      <svg width="40" height="40" fill="none" viewBox="0 0 24 24" className="text-primary-500"><rect x="3" y="4" width="18" height="16" rx="2" fill="#a78bfa"/><rect x="6" y="7" width="12" height="2" rx="1" fill="#fff"/><rect x="6" y="11" width="8" height="2" rx="1" fill="#fff"/></svg>
    ),
    desc: 'Estruture aulas completas alinhadas à BNCC, com objetivos, conteúdos e metodologias.',
  },
  {
    name: 'Slides',
    icon: (
      <svg width="40" height="40" fill="none" viewBox="0 0 24 24" className="text-primary-500"><rect x="2" y="6" width="20" height="12" rx="2" fill="#fbbf24"/><rect x="6" y="10" width="12" height="2" rx="1" fill="#fff"/></svg>
    ),
    desc: 'Apresente conteúdos de forma visual e interativa, com imagens e design profissional.',
  },
  {
    name: 'Atividades',
    icon: (
      <svg width="40" height="40" fill="none" viewBox="0 0 24 24" className="text-primary-500"><rect x="4" y="4" width="16" height="16" rx="2" fill="#34d399"/><circle cx="8" cy="10" r="1.5" fill="#fff"/><circle cx="12" cy="10" r="1.5" fill="#fff"/><circle cx="16" cy="10" r="1.5" fill="#fff"/><rect x="7" y="14" width="10" height="2" rx="1" fill="#fff"/></svg>
    ),
    desc: 'Diversas questões para praticar, revisar e fixar o conteúdo com sua turma.',
  },
  {
    name: 'Avaliações',
    icon: (
      <svg width="40" height="40" fill="none" viewBox="0 0 24 24" className="text-primary-500"><rect x="3" y="3" width="18" height="18" rx="2" fill="#f472b6"/><path d="M8 12l2 2 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
    ),
    desc: 'Crie provas, simulados e avaliações diagnósticas de forma rápida e segura.',
  },
];

const benefits = [
  'Economize horas de preparação por semana',
  'Tenha acesso a uma biblioteca de conteúdos prontos',
  'Personalize materiais com IA e design moderno',
  'Acompanhe o uso e resultados da sua escola',
  'Suporte dedicado para professores e gestores',
];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex flex-col">
      {/* Head */}
      <header className="w-full flex items-center justify-between px-8 py-6 bg-white/80 shadow-md sticky top-0 z-20 animate-fade-in-down">
        <div className="flex items-center gap-3">
          <div className="bg-primary-500 text-white p-3 rounded-2xl shadow-lg">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor"/><path d="M13 7h-2v6h6v-2h-4z" fill="#fff"/></svg>
          </div>
          <span className="text-2xl font-bold text-primary-600 tracking-tight drop-shadow">AulagIA</span>
        </div>
        <nav className="flex gap-8 items-center">
          <a href="#materiais" className="text-gray-700 font-medium hover:text-primary-600 transition">Materiais</a>
          <a href="#beneficios" className="text-gray-700 font-medium hover:text-primary-600 transition">Benefícios</a>
          <a href="#planos" className="text-gray-700 font-medium hover:text-primary-600 transition">Planos</a>
          <button onClick={() => navigate('/login')} className="bg-primary-500 hover:bg-primary-600 text-white font-bold px-6 py-2 rounded-lg shadow transition-all animate-bounce-in">Entrar</button>
        </nav>
      </header>

      {/* AIDA: Atenção + Vídeo maior */}
      <section className="flex flex-col items-center justify-center px-8 pt-16 md:pt-24 gap-8 animate-fade-in-up">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight text-center animate-slide-in-left max-w-3xl">Transforme sua rotina pedagógica com IA</h1>
        <p className="text-lg md:text-2xl text-gray-700 mb-4 animate-fade-in text-center max-w-2xl">Crie, gerencie e compartilhe materiais didáticos em minutos. Tenha acesso a recursos exclusivos, slides prontos, avaliações e muito mais!</p>
        <div className="w-full flex justify-center">
          <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-primary-100 animate-fade-in max-w-5xl w-full flex justify-center">
            <video src="https://www.w3schools.com/html/mov_bbb.mp4" autoPlay loop muted playsInline className="w-full max-w-4xl h-[400px] md:h-[520px] object-cover" poster="/public/placeholder.svg" />
          </div>
        </div>
        <span className="mt-2 text-gray-500 text-sm animate-fade-in">Veja como é fácil criar uma aula mágica!</span>
        <button onClick={() => document.getElementById('planos')?.scrollIntoView({behavior: 'smooth'})} className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-8 py-4 rounded-xl text-xl font-bold shadow-lg hover:scale-105 transition-all animate-bounce-in mt-4">Veja os Planos</button>
      </section>

      {/* Tipos de Materiais */}
      <section id="materiais" className="py-20 px-8 bg-white/80 animate-fade-in-up">
        <h2 className="text-3xl font-bold text-center text-primary-600 mb-10 animate-slide-in-up">Tipos de Materiais</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 max-w-6xl mx-auto">
          {materialTypes.map((mat) => (
            <div key={mat.name} className="bg-white rounded-2xl p-8 shadow-lg flex flex-col items-center hover:scale-105 transition-transform animate-fade-in">
              <div className="mb-4">{mat.icon}</div>
              <h3 className="text-xl font-bold mb-2 text-primary-700">{mat.name}</h3>
              <p className="text-gray-600 text-center text-base">{mat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefícios */}
      <section id="beneficios" className="py-16 px-8 bg-gradient-to-r from-primary-100 to-secondary-100 animate-fade-in-up">
        <h2 className="text-3xl font-bold text-center text-primary-700 mb-10 animate-slide-in-up">Benefícios para Professores e Escolas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
          {benefits.map((b, i) => (
            <div key={b} className="bg-white rounded-2xl p-8 shadow-lg flex items-center gap-4 animate-fade-in">
              <span className="w-8 h-8 flex items-center justify-center rounded-full bg-primary-500 text-white font-bold text-lg">{i+1}</span>
              <span className="text-gray-700 text-lg">{b}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Planos */}
      <section id="planos" className="py-20 px-8 bg-white animate-fade-in-up">
        <h2 className="text-3xl font-bold text-center text-primary-600 mb-12 animate-slide-in-up">Escolha o plano ideal para você</h2>
        <div className="flex flex-col md:flex-row gap-10 justify-center items-stretch max-w-5xl mx-auto">
          {plans.map((plan, idx) => (
            <div key={plan.name} className={`rounded-3xl shadow-2xl p-10 flex-1 max-w-xs border-4 ${plan.highlight ? 'border-primary-500 scale-105 bg-white' : 'border-gray-200 bg-white/90'} flex flex-col items-center hover:scale-110 transition-transform animate-fade-in relative`}>
              {plan.badge && <span className={`absolute -top-5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold ${plan.highlight ? 'bg-primary-500 text-white' : 'bg-primary-100 text-primary-700'} shadow`}>{plan.badge}</span>}
              <h3 className="text-2xl font-bold mb-2 text-primary-700 mt-4">{plan.name}</h3>
              <div className="text-4xl font-extrabold text-gray-900 mb-2">{plan.price}<span className="text-lg font-medium text-gray-500">{plan.period}</span></div>
              <ul className="mb-6 mt-2 space-y-2">
                {plan.features.map(f => <li key={f} className="text-gray-700 flex items-center gap-2"><span className="w-2 h-2 bg-primary-500 rounded-full inline-block"></span>{f}</li>)}
              </ul>
              <button onClick={() => navigate('/login')} className={`mt-auto px-6 py-3 rounded-lg font-bold text-lg shadow ${plan.highlight ? 'bg-primary-500 text-white hover:bg-primary-600' : 'bg-gray-200 text-primary-700 hover:bg-primary-100'} transition-all animate-bounce-in`}>{plan.name === 'Gratuito' ? 'Começar grátis' : 'Assinar'}</button>
            </div>
          ))}
        </div>
      </section>

      {/* Ação */}
      <section id="preco" className="py-16 px-8 bg-primary-50 animate-fade-in-up">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-primary-600 mb-6 animate-slide-in-up">Comece grátis e evolua quando quiser</h2>
          <p className="text-lg text-gray-700 mb-8 animate-fade-in">Crie sua conta gratuitamente, explore os recursos e faça upgrade para um plano completo quando desejar. Sem compromisso, sem cartão de crédito.</p>
          <button onClick={() => navigate('/login')} className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-10 py-4 rounded-xl text-xl font-bold shadow-lg hover:scale-105 transition-all animate-bounce-in">Criar Conta Grátis</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-8 bg-primary-600 text-white text-center animate-fade-in-up">
        <div className="mb-2 font-bold text-lg">AulagIA &copy; {new Date().getFullYear()}</div>
        <div className="text-sm opacity-80">Transformando a educação com tecnologia e criatividade.</div>
      </footer>

      {/* Animations (TailwindCSS + custom) */}
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(40px);} to { opacity: 1; transform: none; } }
        @keyframes fade-in-down { from { opacity: 0; transform: translateY(-40px);} to { opacity: 1; transform: none; } }
        @keyframes slide-in-left { from { opacity: 0; transform: translateX(-40px);} to { opacity: 1; transform: none; } }
        @keyframes slide-in-up { from { opacity: 0; transform: translateY(60px);} to { opacity: 1; transform: none; } }
        @keyframes bounce-in { 0% { transform: scale(0.9);} 60% { transform: scale(1.05);} 100% { transform: scale(1);}}
        .animate-fade-in { animation: fade-in 1s both; }
        .animate-fade-in-up { animation: fade-in-up 1.1s both; }
        .animate-fade-in-down { animation: fade-in-down 1.1s both; }
        .animate-slide-in-left { animation: slide-in-left 1.2s both; }
        .animate-slide-in-up { animation: slide-in-up 1.2s both; }
        .animate-bounce-in { animation: bounce-in 0.7s both; }
      `}</style>
    </div>
  );
};

export default LandingPage; 