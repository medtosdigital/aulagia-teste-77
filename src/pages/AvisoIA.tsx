
import React from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { AlertTriangle, Brain, CheckCircle, XCircle } from 'lucide-react';

const AvisoIA = () => {
  return (
    <div className="min-h-screen bg-gray-50 w-full flex flex-col">
      <Sidebar />
      
      <div className="md:ml-64 min-h-screen flex flex-col">
        <Header title="Aviso sobre Inteligência Artificial" />
        
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-amber-100 p-3 rounded-full">
                <Brain className="w-6 h-6 text-amber-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800">Aviso sobre Inteligência Artificial</h1>
            </div>
            
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-8">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-amber-600 mr-2" />
                <p className="text-amber-800 font-semibold">
                  IMPORTANTE: Leia atentamente antes de usar os materiais gerados
                </p>
              </div>
            </div>
            
            <div className="prose max-w-none">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">O que é a IA da AulagIA?</h2>
              <p className="text-gray-700 mb-6">
                A AulagIA utiliza modelos avançados de Inteligência Artificial para auxiliar educadores na criação 
                de materiais educacionais. Nossa IA foi treinada com uma vasta quantidade de conteúdo educacional 
                para fornecer sugestões relevantes e úteis.
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Limitações e Responsabilidades</h2>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                <div className="flex items-start space-x-3">
                  <XCircle className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-red-800 mb-2">A IA pode cometer erros</h3>
                    <ul className="text-red-700 space-y-1 text-sm">
                      <li>• Informações factuais incorretas</li>
                      <li>• Dados desatualizados</li>
                      <li>• Conceitos mal explicados</li>
                      <li>• Exercícios com respostas erradas</li>
                      <li>• Referências bibliográficas inexistentes</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-green-800 mb-2">Sua responsabilidade como educador</h3>
                    <ul className="text-green-700 space-y-1 text-sm">
                      <li>• Revisar todo o conteúdo gerado</li>
                      <li>• Verificar a precisão das informações</li>
                      <li>• Validar exercícios e respostas</li>
                      <li>• Adequar o conteúdo ao seu contexto educacional</li>
                      <li>• Consultar fontes adicionais quando necessário</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Recomendações de Uso</h2>
              <div className="space-y-4 mb-6">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">
                    <strong>Use como ponto de partida:</strong> Trate o conteúdo gerado como um rascunho inicial 
                    que precisa ser refinado e personalizado.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">
                    <strong>Verifique fontes:</strong> Sempre confirme informações importantes em fontes 
                    confiáveis e atualizadas.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">
                    <strong>Adapte ao contexto:</strong> Ajuste o conteúdo à realidade dos seus alunos, 
                    faixa etária e currículo específico.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">
                    <strong>Teste antes de usar:</strong> Aplique exercícios e atividades em pequena escala 
                    antes de usar com toda a turma.
                  </p>
                </div>
              </div>
              
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Tipos de Conteúdo e Cuidados Específicos</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Planos de Aula</h3>
                  <p className="text-gray-600 text-sm">
                    Verifique a adequação dos objetivos, metodologias e recursos sugeridos ao seu contexto educacional.
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Exercícios e Atividades</h3>
                  <p className="text-gray-600 text-sm">
                    Confira todas as respostas e gabaritos. Teste a clareza das instruções antes de aplicar.
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Conteúdo Científico</h3>
                  <p className="text-gray-600 text-sm">
                    Valide informações científicas em fontes acadêmicas confiáveis e atualizadas.
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Dados Históricos</h3>
                  <p className="text-gray-600 text-sm">
                    Confirme datas, nomes e eventos históricos em fontes historiográficas reconhecidas.
                  </p>
                </div>
              </div>
              
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Isenção de Responsabilidade</h2>
              <p className="text-gray-700 mb-6 bg-gray-50 p-4 rounded-lg">
                A AulagIA não se responsabiliza por erros, imprecisões ou inadequações no conteúdo gerado 
                pela IA. O uso dos materiais gerados é de inteira responsabilidade do usuário. Recomendamos 
                sempre a revisão criteriosa e a consulta a fontes especializadas.
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Melhorias Contínuas</h2>
              <p className="text-gray-700 mb-6">
                Estamos constantemente trabalhando para melhorar nossos modelos de IA. Seus feedbacks e 
                relatos de problemas nos ajudam a aprimorar a qualidade dos conteúdos gerados. Entre em 
                contato conosco caso identifique erros recorrentes ou tenha sugestões de melhoria.
              </p>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

export default AvisoIA;
