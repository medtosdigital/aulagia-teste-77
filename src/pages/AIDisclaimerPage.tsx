
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Bot, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AIDisclaimerPage = () => {
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
              <Bot className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Aviso sobre Inteligência Artificial</h1>
            </div>
            <p className="text-gray-600">Informações importantes sobre o conteúdo gerado por IA</p>
          </div>

          {/* Aviso Principal */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-bold text-amber-800 mb-2">
                  ⚠️ Responsabilidade do Usuário
                </h2>
                <p className="text-amber-700 text-lg leading-relaxed">
                  <strong>IMPORTANTE:</strong> Todo conteúdo gerado pela AulagIA é criado por inteligência artificial 
                  e pode conter erros, imprecisões ou informações desatualizadas. É de <strong>total responsabilidade 
                  do usuário</strong> revisar, verificar e validar todo o conteúdo antes de utilizá-lo em ambiente educacional.
                </p>
              </div>
            </div>
          </div>

          {/* Conteúdo Principal */}
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Como Funciona nossa IA</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                A AulagIA utiliza modelos avançados de inteligência artificial treinados em vastos conjuntos de dados 
                educacionais para gerar conteúdo pedagógico. Nossa tecnologia:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Analisa padrões em materiais educacionais existentes</li>
                <li>Gera conteúdo baseado em prompts e contextos fornecidos</li>
                <li>Adapta linguagem e complexidade ao nível educacional solicitado</li>
                <li>Considera diretrizes como a BNCC em suas sugestões</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Limitações da IA</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-red-200 bg-red-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-800">
                      <XCircle className="w-5 h-5" />
                      Limitações
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-red-700">
                    <p>• Pode gerar informações incorretas ou desatualizadas</p>
                    <p>• Não tem acesso a informações em tempo real</p>
                    <p>• Pode não considerar contextos específicos locais</p>
                    <p>• Não substitui o julgamento pedagógico profissional</p>
                    <p>• Pode reproduzir vieses presentes nos dados de treinamento</p>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="w-5 h-5" />
                      Pontos Fortes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-green-700">
                    <p>• Gera conteúdo estruturado rapidamente</p>
                    <p>• Oferece diversas perspectivas pedagógicas</p>
                    <p>• Adapta linguagem a diferentes níveis</p>
                    <p>• Fornece base sólida para personalização</p>
                    <p>• Economiza tempo na criação inicial</p>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Melhores Práticas de Uso</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-blue-900 mb-4">Recomendações para Uso Seguro:</h3>
                <div className="space-y-3 text-blue-800">
                  <div className="flex items-start gap-3">
                    <span className="bg-blue-200 text-blue-900 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">1</span>
                    <p><strong>Sempre revise:</strong> Leia todo conteúdo gerado antes de usar em sala de aula</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="bg-blue-200 text-blue-900 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">2</span>
                    <p><strong>Verifique fatos:</strong> Confirme informações factuais em fontes confiáveis</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="bg-blue-200 text-blue-900 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">3</span>
                    <p><strong>Adapte ao contexto:</strong> Ajuste o conteúdo à realidade de seus alunos</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="bg-blue-200 text-blue-900 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">4</span>
                    <p><strong>Use como base:</strong> Trate o conteúdo como ponto de partida, não produto final</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="bg-blue-200 text-blue-900 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">5</span>
                    <p><strong>Aplique experiência:</strong> Use seu conhecimento pedagógico para validar e melhorar</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Exemplos de Verificações Necessárias</h2>
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Informações Factuais:</h4>
                  <p className="text-gray-700">Datas históricas, dados científicos, estatísticas, fórmulas matemáticas</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Adequação Curricular:</h4>
                  <p className="text-gray-700">Alinhamento com BNCC, adequação ao ano letivo, progressão de competências</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Contexto Cultural:</h4>
                  <p className="text-gray-700">Relevância regional, sensibilidade cultural, exemplos apropriados</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Linguagem e Complexidade:</h4>
                  <p className="text-gray-700">Adequação à faixa etária, clareza das instruções, vocabulário apropriado</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Responsabilidades Legais e Éticas</h2>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Ao utilizar conteúdo gerado por IA em suas aulas, você assume total responsabilidade por:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>A precisão e adequação do conteúdo apresentado aos alunos</li>
                  <li>Possíveis consequências educacionais ou pedagógicas</li>
                  <li>Conformidade com diretrizes educacionais locais e nacionais</li>
                  <li>Respeito a direitos autorais e propriedade intelectual</li>
                  <li>Adequação ética e cultural do material</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Evolução Contínua</h2>
              <p className="text-gray-700 leading-relaxed">
                Trabalhamos constantemente para melhorar nossa tecnologia de IA, mas sempre haverá limitações. 
                Encorajamos feedback dos usuários para identificar áreas de melhoria e continuamos investindo 
                em pesquisa e desenvolvimento para oferecer ferramentas cada vez mais precisas e úteis para educadores.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contato e Suporte</h2>
              <div className="text-gray-700 leading-relaxed">
                <p className="mb-3">
                  Se você identificar erros no conteúdo gerado ou tiver dúvidas sobre o uso da IA, 
                  entre em contato conosco:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>E-mail: <a href="mailto:ia@aulagia.com.br" className="text-blue-600 hover:underline">ia@aulagia.com.br</a></li>
                  <li>Reporte de erros: disponível na plataforma</li>
                  <li>Central de Ajuda: tutoriais sobre uso responsável da IA</li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIDisclaimerPage;
