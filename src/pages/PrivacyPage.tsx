
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {/* Header */}
          <div className="mb-8">
            <Link to="/">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Política de Privacidade</h1>
            </div>
            <p className="text-gray-600">Última atualização: Janeiro de 2024</p>
          </div>

          {/* Conteúdo */}
          <div className="prose prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Informações que Coletamos</h2>
              <div className="space-y-3 text-gray-700">
                <p>Coletamos as seguintes informações:</p>
                <h3 className="text-lg font-medium text-gray-900">Informações de Conta:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Nome, e-mail e senha</li>
                  <li>Informações de perfil educacional</li>
                  <li>Preferências de ensino e disciplinas</li>
                </ul>
                <h3 className="text-lg font-medium text-gray-900">Informações de Uso:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Materiais criados e editados</li>
                  <li>Histórico de downloads e exportações</li>
                  <li>Logs de acesso e uso da plataforma</li>
                  <li>Dados de interação com a interface</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Como Usamos suas Informações</h2>
              <div className="space-y-3 text-gray-700">
                <p>Utilizamos suas informações para:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Fornecer e melhorar nossos serviços</li>
                  <li>Personalizar sua experiência na plataforma</li>
                  <li>Processar pagamentos e gerenciar assinaturas</li>
                  <li>Enviar comunicações importantes sobre o serviço</li>
                  <li>Desenvolver novos recursos e funcionalidades</li>
                  <li>Garantir a segurança e prevenir fraudes</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Compartilhamento de Informações</h2>
              <div className="space-y-3 text-gray-700">
                <p>Não vendemos suas informações pessoais. Podemos compartilhar dados apenas:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Com provedores de serviços terceirizados essenciais</li>
                  <li>Quando exigido por lei ou autoridades competentes</li>
                  <li>Para proteger nossos direitos legais</li>
                  <li>Em caso de fusão ou aquisição empresarial</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Segurança dos Dados</h2>
              <div className="space-y-3 text-gray-700">
                <p>Implementamos medidas de segurança técnicas e organizacionais:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Criptografia de dados em trânsito e em repouso</li>
                  <li>Controles de acesso rigorosos</li>
                  <li>Monitoramento contínuo de segurança</li>
                  <li>Backups regulares e seguros</li>
                  <li>Auditorias de segurança periódicas</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Seus Direitos</h2>
              <div className="space-y-3 text-gray-700">
                <p>Você tem o direito de:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Acessar suas informações pessoais</li>
                  <li>Corrigir dados incorretos ou desatualizados</li>
                  <li>Solicitar a exclusão de sua conta e dados</li>
                  <li>Exportar seus dados em formato legível</li>
                  <li>Restringir o processamento de dados</li>
                  <li>Retirar consentimento para comunicações marketing</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Cookies e Tecnologias Similares</h2>
              <div className="space-y-3 text-gray-700">
                <p>Utilizamos cookies para:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Manter você conectado à plataforma</li>
                  <li>Lembrar suas preferências</li>
                  <li>Analisar o desempenho do site</li>
                  <li>Personalizar conteúdo e anúncios</li>
                </ul>
                <p className="mt-3">
                  Você pode gerenciar suas preferências de cookies nas configurações do seu navegador.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Retenção de Dados</h2>
              <p className="text-gray-700 leading-relaxed">
                Mantemos suas informações pelo tempo necessário para fornecer nossos serviços e cumprir 
                obrigações legais. Dados de conta são mantidos enquanto sua conta estiver ativa. 
                Após o cancelamento, alguns dados podem ser mantidos por período limitado para fins legais ou de segurança.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Transferências Internacionais</h2>
              <p className="text-gray-700 leading-relaxed">
                Seus dados podem ser processados em servidores localizados fora do Brasil, sempre com 
                garantias adequadas de proteção conforme a Lei Geral de Proteção de Dados (LGPD).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Menores de Idade</h2>
              <p className="text-gray-700 leading-relaxed">
                Nossos serviços são destinados a usuários maiores de 18 anos. Não coletamos intencionalmente 
                informações de menores de idade sem consentimento parental apropriado.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Alterações na Política</h2>
              <p className="text-gray-700 leading-relaxed">
                Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos sobre mudanças 
                significativas através da plataforma ou por e-mail.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contato</h2>
              <div className="text-gray-700 leading-relaxed">
                <p>Para questões sobre privacidade, entre em contato:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
                  <li>E-mail: <a href="mailto:privacidade@aulagia.com.br" className="text-blue-600 hover:underline">privacidade@aulagia.com.br</a></li>
                  <li>Encarregado de Dados: <a href="mailto:dpo@aulagia.com.br" className="text-blue-600 hover:underline">dpo@aulagia.com.br</a></li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
