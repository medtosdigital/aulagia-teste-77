
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TermsPage = () => {
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
              <FileText className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Termos de Serviço</h1>
            </div>
            <p className="text-gray-600">Última atualização: Janeiro de 2024</p>
          </div>

          {/* Conteúdo */}
          <div className="prose prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Aceitação dos Termos</h2>
              <p className="text-gray-700 leading-relaxed">
                Ao acessar e usar a plataforma AulagIA, você concorda em cumprir e estar vinculado a estes Termos de Serviço. 
                Se você não concordar com qualquer parte destes termos, não deve usar nossos serviços.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Descrição do Serviço</h2>
              <p className="text-gray-700 leading-relaxed">
                A AulagIA é uma plataforma educacional que utiliza inteligência artificial para auxiliar professores e educadores 
                na criação de materiais pedagógicos, incluindo planos de aula, slides, atividades e avaliações.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Contas de Usuário</h2>
              <div className="space-y-3 text-gray-700">
                <p>Para usar nossos serviços, você deve:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Fornecer informações precisas e atualizadas durante o registro</li>
                  <li>Manter a segurança de sua conta e senha</li>
                  <li>Notificar-nos imediatamente sobre qualquer uso não autorizado</li>
                  <li>Ser responsável por todas as atividades em sua conta</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Planos e Pagamentos</h2>
              <div className="space-y-3 text-gray-700">
                <p>Oferecemos diferentes planos de assinatura:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Gratuito:</strong> Acesso limitado aos recursos básicos</li>
                  <li><strong>Professor:</strong> Acesso completo para uso individual</li>
                  <li><strong>Grupo Escolar:</strong> Acesso para até 5 professores com gestão centralizada</li>
                </ul>
                <p className="mt-4">
                  Os pagamentos são processados mensalmente ou anualmente, conforme o plano escolhido. 
                  Você pode cancelar sua assinatura a qualquer momento.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Uso Aceitável</h2>
              <div className="space-y-3 text-gray-700">
                <p>Você concorda em não usar a plataforma para:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Criar conteúdo ilegal, ofensivo ou discriminatório</li>
                  <li>Violar direitos autorais ou propriedade intelectual</li>
                  <li>Compartilhar credenciais de acesso com terceiros</li>
                  <li>Tentar acessar sistemas ou dados não autorizados</li>
                  <li>Usar o serviço para fins comerciais não educacionais</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Propriedade Intelectual</h2>
              <p className="text-gray-700 leading-relaxed">
                Os materiais criados usando nossa plataforma pertencem a você. No entanto, você nos concede uma licença 
                limitada para processar e melhorar nossos serviços. Nossa tecnologia, algoritmos e interface permanecem 
                nossa propriedade exclusiva.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Limitação de Responsabilidade</h2>
              <p className="text-gray-700 leading-relaxed">
                A AulagIA não se responsabiliza por danos diretos, indiretos, incidentais ou consequenciais decorrentes 
                do uso de nossos serviços. Nossos serviços são fornecidos "como estão" sem garantias expressas ou implícitas.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Modificações</h2>
              <p className="text-gray-700 leading-relaxed">
                Reservamos o direito de modificar estes Termos de Serviço a qualquer momento. As alterações serão 
                comunicadas através da plataforma e/ou por e-mail. O uso continuado após as modificações constitui 
                aceitação dos novos termos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Rescisão</h2>
              <p className="text-gray-700 leading-relaxed">
                Podemos suspender ou encerrar sua conta a qualquer momento por violação destes termos. 
                Você pode cancelar sua conta a qualquer momento através das configurações da plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Contato</h2>
              <p className="text-gray-700 leading-relaxed">
                Para dúvidas sobre estes Termos de Serviço, entre em contato conosco através do e-mail: 
                <a href="mailto:contato@aulagia.com.br" className="text-blue-600 hover:underline ml-1">
                  contato@aulagia.com.br
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
