
import React from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const TermosDeServico = () => {
  return (
    <div className="min-h-screen bg-gray-50 w-full flex flex-col">
      <Sidebar />
      
      <div className="md:ml-64 min-h-screen flex flex-col">
        <Header title="Termos de Serviço" />
        
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Termos de Serviço</h1>
            <p className="text-gray-600 mb-8">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
            
            <div className="prose max-w-none">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Aceitação dos Termos</h2>
              <p className="text-gray-700 mb-6">
                Ao acessar e usar a plataforma AulagIA, você concorda em cumprir e estar vinculado a estes Termos de Serviço. 
                Se você não concordar com qualquer parte destes termos, não deve usar nossos serviços.
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Descrição do Serviço</h2>
              <p className="text-gray-700 mb-6">
                A AulagIA é uma plataforma de criação de materiais educacionais que utiliza Inteligência Artificial para 
                auxiliar educadores na criação de planos de aula, atividades e outros conteúdos pedagógicos.
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Uso da Plataforma</h2>
              <p className="text-gray-700 mb-4">Você se compromete a:</p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Usar a plataforma apenas para fins educacionais legítimos</li>
                <li>Não violar direitos autorais ou propriedade intelectual de terceiros</li>
                <li>Não usar a plataforma para atividades ilegais ou prejudiciais</li>
                <li>Manter a confidencialidade de suas credenciais de acesso</li>
              </ul>
              
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Conteúdo Gerado por IA</h2>
              <p className="text-gray-700 mb-6">
                Todo conteúdo gerado pela nossa IA é fornecido "como está". Embora nos esforcemos para fornecer 
                informações precisas e úteis, não garantimos a precisão, completude ou adequação do conteúdo gerado. 
                É sua responsabilidade revisar e validar todo o material antes do uso.
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Limitação de Responsabilidade</h2>
              <p className="text-gray-700 mb-6">
                A AulagIA não será responsável por quaisquer danos diretos, indiretos, incidentais, especiais ou 
                consequenciais decorrentes do uso ou incapacidade de usar nossos serviços.
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Modificações dos Termos</h2>
              <p className="text-gray-700 mb-6">
                Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações entrarão em vigor 
                imediatamente após a publicação na plataforma.
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Contato</h2>
              <p className="text-gray-700 mb-6">
                Se você tiver dúvidas sobre estes Termos de Serviço, entre em contato conosco através dos canais 
                disponíveis na plataforma.
              </p>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

export default TermosDeServico;
