import React from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { HelpCircle } from 'lucide-react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

const CentralDeAjuda = () => {
  return (
    <div className="min-h-screen bg-gray-50 w-full flex flex-col">
      <Sidebar />
      <div className="md:ml-64 min-h-screen flex flex-col">
        <Header title="Central de Ajuda" />
        <main className="flex-1 p-6">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
              <HelpCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">Central de Ajuda</h1>
            <p className="text-gray-600 mb-6 text-center">Encontre respostas para as dúvidas mais comuns ou entre em contato com nosso suporte.</p>
            <div className="w-full mb-8">
              <Accordion type="multiple" className="w-full">
                <AccordionItem value="conta">
                  <AccordionTrigger>Conta e Acesso</AccordionTrigger>
                  <AccordionContent>
                    <b>Como faço meu cadastro?</b><br />
                    Basta clicar em "Entrar" na página inicial e seguir o fluxo de cadastro com seu e-mail.<br /><br />
                    <b>Como redefinir minha senha?</b><br />
                    Clique em "Esqueci minha senha" na tela de login e siga as instruções enviadas para seu e-mail.<br /><br />
                    <b>Não recebi o e-mail de confirmação ou redefinição, o que fazer?</b><br />
                    Verifique a caixa de spam/lixo eletrônico. Se não encontrar, aguarde alguns minutos e tente novamente. Persistindo, entre em contato pelo suporte.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="planos">
                  <AccordionTrigger>Planos e Assinaturas</AccordionTrigger>
                  <AccordionContent>
                    <b>Quais são os planos disponíveis?</b><br />
                    Temos o Plano Gratuito, Professor e Grupo Escolar. Cada um possui benefícios e limites diferentes.<br /><br />
                    <b>Como faço upgrade de plano?</b><br />
                    Acesse a página "Assinatura" no menu lateral e escolha o plano desejado.<br /><br />
                    <b>Posso cancelar a assinatura a qualquer momento?</b><br />
                    Sim! O cancelamento pode ser feito na área de assinatura e você mantém o acesso até o fim do período já pago.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="limites">
                  <AccordionTrigger>Limites e Uso da Plataforma</AccordionTrigger>
                  <AccordionContent>
                    <b>Qual o limite de materiais por mês?</b><br />
                    - Gratuito: 5 materiais/mês<br />
                    - Professor: 60 materiais/mês<br />
                    - Grupo Escolar: 300 materiais/mês (dividido entre professores)<br /><br />
                    <b>O que acontece ao atingir o limite?</b><br />
                    Você não conseguirá criar novos materiais até o próximo ciclo. Para aumentar o limite, faça upgrade de plano.<br /><br />
                    <b>Como funciona a divisão do limite no Grupo Escolar?</b><br />
                    O administrador pode distribuir o total de 300 materiais entre os professores do grupo, conforme necessidade.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="funcionalidades">
                  <AccordionTrigger>Funcionalidades e Recursos</AccordionTrigger>
                  <AccordionContent>
                    <b>Posso baixar os materiais em Word ou PowerPoint?</b><br />
                    Sim, nos planos pagos. O plano gratuito não permite download.<br /><br />
                    <b>Como compartilhar materiais com outros professores?</b><br />
                    No plano Grupo Escolar, é possível compartilhar e visualizar materiais entre membros do grupo.<br /><br />
                    <b>Existe limite para slides ou avaliações?</b><br />
                    O limite é por material criado, independente do tipo (aula, slide, avaliação, etc).
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="suporte">
                  <AccordionTrigger>Suporte e Ajuda</AccordionTrigger>
                  <AccordionContent>
                    <b>Como entro em contato com o suporte?</b><br />
                    Você pode enviar uma mensagem pela página de Contato ou pelo e-mail <a href="mailto:suporte@aulagia.com" className="text-primary-600 underline font-semibold">suporte@aulagia.com</a>.<br /><br />
                    <b>Qual o tempo de resposta?</b><br />
                    Nosso atendimento é de segunda a sexta, das 8h às 18h, com tempo médio de resposta de até 1 dia útil.<br /><br />
                    <b>Onde encontro as políticas da plataforma?</b><br />
                    Acesse as páginas de Política de Privacidade e Termos de Uso no rodapé do site.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
            <div className="w-full">
              <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 text-purple-800 text-center">
                <h2 className="text-lg font-semibold mb-1">Precisa de mais ajuda?</h2>
                <p className="mb-2">Entre em contato pelo e-mail <a href="mailto:suporte@aulagia.com" className="text-primary-600 underline font-semibold">suporte@aulagia.com</a> ou acesse a página de <a href="/contato" className="text-primary-600 underline font-semibold">Contato</a>.</p>
                <span className="text-xs text-gray-500">Atendimento: Segunda a sexta, das 8h às 18h</span>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default CentralDeAjuda;
