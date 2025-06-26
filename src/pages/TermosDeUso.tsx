
import React from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const TermosDeUso = () => {
  return (
    <div className="min-h-screen bg-gray-50 w-full flex flex-col">
      <Sidebar activeItem="termos-uso" />
      
      <div className="md:ml-64 min-h-screen flex flex-col">
        <Header title="Termos de Uso" />
        
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Termos de Uso</h1>
            <p className="text-gray-600 mb-8">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
            
            <div className="prose max-w-none">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Acesso à Plataforma</h2>
              <p className="text-gray-700 mb-6">
                O acesso à AulagIA é concedido mediante cadastro e aceitação destes termos. Você é responsável 
                por manter a confidencialidade de suas credenciais de acesso.
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Uso Permitido</h2>
              <p className="text-gray-700 mb-4">A plataforma deve ser usada exclusivamente para:</p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Criação de materiais educacionais</li>
                <li>Desenvolvimento de planos de aula</li>
                <li>Elaboração de atividades pedagógicas</li>
                <li>Outras atividades educacionais legítimas</li>
              </ul>
              
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Uso Proibido</h2>
              <p className="text-gray-700 mb-4">É expressamente proibido:</p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Usar a plataforma para fins comerciais não autorizados</li>
                <li>Violar direitos autorais ou propriedade intelectual</li>
                <li>Criar conteúdo ofensivo, discriminatório ou ilegal</li>
                <li>Tentar hackear ou comprometer a segurança da plataforma</li>
                <li>Compartilhar credenciais de acesso com terceiros</li>
              </ul>
              
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Propriedade Intelectual</h2>
              <p className="text-gray-700 mb-6">
                Os materiais criados na plataforma são de sua propriedade. No entanto, você concede à AulagIA 
                uma licença não exclusiva para usar, modificar e melhorar nossos algoritmos de IA com base 
                nos padrões de uso (sem incluir conteúdo específico).
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Disponibilidade do Serviço</h2>
              <p className="text-gray-700 mb-6">
                Embora nos esforcemos para manter a plataforma disponível 24/7, não garantimos disponibilidade 
                ininterrupta. Manutenções programadas serão comunicadas previamente quando possível.
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Suspensão de Conta</h2>
              <p className="text-gray-700 mb-6">
                Reservamo-nos o direito de suspender ou encerrar contas que violem estes termos de uso, 
                sem aviso prévio e sem reembolso de valores pagos.
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Modificações no Serviço</h2>
              <p className="text-gray-700 mb-6">
                Podemos modificar, atualizar ou descontinuar funcionalidades da plataforma a qualquer momento. 
                Alterações significativas serão comunicadas aos usuários.
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Suporte Técnico</h2>
              <p className="text-gray-700 mb-6">
                Oferecemos suporte técnico através dos canais disponíveis na plataforma. O tempo de resposta 
                pode variar de acordo com o tipo de conta e complexidade da solicitação.
              </p>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

export default TermosDeUso;
