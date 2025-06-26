
import React from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const PoliticaDePrivacidade = () => {
  return (
    <div className="min-h-screen bg-gray-50 w-full flex flex-col">
      <Sidebar activeItem="politica" />
      
      <div className="md:ml-64 min-h-screen flex flex-col">
        <Header title="Política de Privacidade" />
        
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Política de Privacidade</h1>
            <p className="text-gray-600 mb-8">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
            
            <div className="prose max-w-none">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Informações que Coletamos</h2>
              <p className="text-gray-700 mb-4">Coletamos as seguintes informações:</p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Informações de cadastro (nome, e-mail, senha)</li>
                <li>Dados de uso da plataforma</li>
                <li>Conteúdos criados e materiais gerados</li>
                <li>Informações técnicas (endereço IP, navegador, dispositivo)</li>
              </ul>
              
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Como Usamos suas Informações</h2>
              <p className="text-gray-700 mb-4">Utilizamos suas informações para:</p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Fornecer e melhorar nossos serviços</li>
                <li>Personalizar sua experiência na plataforma</li>
                <li>Comunicar sobre atualizações e novidades</li>
                <li>Garantir a segurança da plataforma</li>
                <li>Cumprir obrigações legais</li>
              </ul>
              
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Compartilhamento de Informações</h2>
              <p className="text-gray-700 mb-6">
                Não vendemos, trocamos ou transferimos suas informações pessoais para terceiros, exceto quando 
                necessário para fornecer nossos serviços ou quando exigido por lei.
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Segurança dos Dados</h2>
              <p className="text-gray-700 mb-6">
                Implementamos medidas de segurança apropriadas para proteger suas informações pessoais contra 
                acesso não autorizado, alteração, divulgação ou destruição.
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Seus Direitos</h2>
              <p className="text-gray-700 mb-4">Você tem o direito de:</p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Acessar suas informações pessoais</li>
                <li>Corrigir informações incorretas</li>
                <li>Solicitar a exclusão de seus dados</li>
                <li>Retirar o consentimento para processamento</li>
                <li>Portabilidade dos dados</li>
              </ul>
              
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Cookies</h2>
              <p className="text-gray-700 mb-6">
                Utilizamos cookies para melhorar sua experiência na plataforma. Você pode configurar seu navegador 
                para recusar cookies, mas isso pode afetar algumas funcionalidades.
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Alterações na Política</h2>
              <p className="text-gray-700 mb-6">
                Esta Política de Privacidade pode ser atualizada periodicamente. Notificaremos sobre alterações 
                significativas através da plataforma ou por e-mail.
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Contato</h2>
              <p className="text-gray-700 mb-6">
                Para questões sobre esta Política de Privacidade ou sobre o tratamento de seus dados, 
                entre em contato conosco através dos canais disponíveis na plataforma.
              </p>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

export default PoliticaDePrivacidade;
