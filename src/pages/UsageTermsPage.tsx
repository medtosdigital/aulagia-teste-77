
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

const UsageTermsPage = () => {
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
              <BookOpen className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Termos de Uso</h1>
            </div>
            <p className="text-gray-600">Última atualização: Janeiro de 2024</p>
          </div>

          {/* Conteúdo */}
          <div className="prose prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Finalidade Educacional</h2>
              <p className="text-gray-700 leading-relaxed">
                A plataforma AulagIA é destinada exclusivamente para fins educacionais e pedagógicos. 
                Os materiais gerados devem ser utilizados em contextos de ensino e aprendizagem por 
                professores, educadores e instituições educacionais.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Uso Apropriado dos Recursos</h2>
              <div className="space-y-3 text-gray-700">
                <h3 className="text-lg font-medium text-gray-900">Uso Permitido:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Criação de planos de aula para suas turmas</li>
                  <li>Desenvolvimento de atividades pedagógicas</li>
                  <li>Elaboração de slides e apresentações educativas</li>
                  <li>Geração de avaliações e exercícios</li>
                  <li>Compartilhamento com colegas educadores (plano Grupo Escolar)</li>
                </ul>
                
                <h3 className="text-lg font-medium text-gray-900 mt-4">Uso Proibido:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Revenda ou comercialização dos materiais gerados</li>
                  <li>Uso para fins não educacionais</li>
                  <li>Criação de conteúdo ofensivo ou inadequado</li>
                  <li>Violação de direitos autorais de terceiros</li>
                  <li>Compartilhamento de credenciais de acesso</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Limites dos Planos</h2>
              <div className="space-y-3 text-gray-700">
                <h3 className="text-lg font-medium text-gray-900">Plano Gratuito:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Máximo de 5 materiais por mês</li>
                  <li>Download apenas em formato PDF</li>
                  <li>Suporte básico por e-mail</li>
                </ul>
                
                <h3 className="text-lg font-medium text-gray-900">Plano Professor:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Máximo de 60 materiais por mês</li>
                  <li>Downloads em PDF, Word e PowerPoint</li>
                  <li>Edição completa dos materiais</li>
                  <li>Suporte prioritário por e-mail</li>
                </ul>
                
                <h3 className="text-lg font-medium text-gray-900">Plano Grupo Escolar:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Máximo de 300 materiais por mês (total da escola)</li>
                  <li>Distribuição flexível entre até 5 professores</li>
                  <li>Dashboard colaborativo</li>
                  <li>Suporte prioritário e dedicado</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Direitos Autorais e Propriedade</h2>
              <div className="space-y-3 text-gray-700">
                <p>
                  Os materiais criados através da plataforma são de sua propriedade para uso educacional. 
                  No entanto, você deve:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Respeitar direitos autorais de terceiros ao criar conteúdo</li>
                  <li>Não reivindicar propriedade exclusiva sobre formatos ou estruturas comuns</li>
                  <li>Creditar a AulagIA quando apropriado em apresentações públicas</li>
                  <li>Não reproduzir ou distribuir nossa tecnologia ou algoritmos</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Qualidade e Supervisão do Conteúdo</h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 my-4">
                <h3 className="text-lg font-medium text-yellow-800 mb-2">⚠️ Importante sobre Conteúdo Gerado por IA</h3>
                <p className="text-yellow-700">
                  Todo conteúdo gerado pela AulagIA é criado por inteligência artificial e pode conter imprecisões, 
                  erros factuais ou informações desatualizadas. É responsabilidade exclusiva do usuário revisar, 
                  verificar e validar todo o conteúdo antes de utilizá-lo em sala de aula.
                </p>
              </div>
              
              <div className="space-y-3 text-gray-700">
                <p>Recomendamos fortemente que você:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Revise todo conteúdo gerado antes do uso</li>
                  <li>Verifique informações factuais em fontes confiáveis</li>
                  <li>Adapte o conteúdo ao contexto de seus alunos</li>
                  <li>Mantenha-se atualizado com mudanças curriculares</li>
                  <li>Use seu julgamento pedagógico profissional</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Condutas Esperadas</h2>
              <div className="space-y-3 text-gray-700">
                <p>Como usuário da AulagIA, você se compromete a:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Usar a plataforma de forma ética e responsável</li>
                  <li>Não tentar burlar limitações dos planos</li>
                  <li>Reportar bugs ou problemas encontrados</li>
                  <li>Respeitar outros usuários em interações</li>
                  <li>Manter suas informações de conta atualizadas</li>
                  <li>Seguir as melhores práticas pedagógicas</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Suspensão e Cancelamento</h2>
              <div className="space-y-3 text-gray-700">
                <p>Podemos suspender ou cancelar sua conta em casos de:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Violação destes Termos de Uso</li>
                  <li>Uso fraudulento ou abusivo da plataforma</li>
                  <li>Não pagamento de taxas de assinatura</li>
                  <li>Comportamento inadequado ou prejudicial</li>
                </ul>
                <p className="mt-3">
                  Você pode cancelar sua assinatura a qualquer momento através das configurações da conta.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Atualizações e Melhorias</h2>
              <p className="text-gray-700 leading-relaxed">
                A AulagIA está em constante evolução. Podemos adicionar novos recursos, modificar funcionalidades 
                existentes ou ajustar limites de uso para melhorar a experiência educacional. Mudanças significativas 
                serão comunicadas com antecedência.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Suporte e Assistência</h2>
              <div className="space-y-3 text-gray-700">
                <p>Oferecemos diferentes níveis de suporte:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Plano Gratuito:</strong> Suporte básico por e-mail em até 48h</li>
                  <li><strong>Plano Professor:</strong> Suporte prioritário em até 24h</li>
                  <li><strong>Plano Grupo Escolar:</strong> Suporte dedicado em até 12h</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Contato</h2>
              <div className="text-gray-700 leading-relaxed">
                <p>Para dúvidas sobre estes Termos de Uso:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
                  <li>E-mail: <a href="mailto:suporte@aulagia.com.br" className="text-blue-600 hover:underline">suporte@aulagia.com.br</a></li>
                  <li>Central de Ajuda: disponível na plataforma</li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsageTermsPage;
