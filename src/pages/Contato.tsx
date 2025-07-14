import React from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Mail, Send } from 'lucide-react';

const Contato = () => {
  const [enviado, setEnviado] = React.useState(false);
  const [erro, setErro] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro('');
    setTimeout(() => {
      setLoading(false);
      setEnviado(true);
    }, 1200);
  }

  return (
    <div className="min-h-screen bg-gray-50 w-full flex flex-col">
      <Sidebar />
      <div className="md:ml-64 min-h-screen flex flex-col">
        <Header title="Contato" />
        <main className="flex-1 p-6">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">Fale com o Suporte</h1>
            <p className="text-gray-600 mb-4 text-center">Tem dúvidas, sugestões ou encontrou algum problema? Preencha o formulário abaixo ou envie um e-mail para <a href="mailto:suporte@aulagia.com" className="text-primary-600 underline font-semibold">suporte@aulagia.com</a>.</p>
            <div className="w-full mb-6">
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-700 text-center">
                <span className="font-medium">Tempo médio de resposta:</span> até 1 dia útil.<br/>
                <span className="text-xs text-gray-500">Segunda a sexta, das 8h às 18h</span>
              </div>
            </div>
            {enviado ? (
              <div className="w-full flex flex-col items-center py-8">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-3">
                  <Send className="w-7 h-7 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-green-700 mb-2">Mensagem enviada!</h2>
                <p className="text-gray-600 text-center mb-2">Recebemos seu contato e responderemos em breve.</p>
                <button className="mt-2 text-primary-600 underline" onClick={() => setEnviado(false)}>Enviar outra mensagem</button>
              </div>
            ) : (
              <form className="space-y-6 w-full max-w-lg mx-auto" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Nome</label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200" required disabled={loading} />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">E-mail</label>
                  <input type="email" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200" required disabled={loading} />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Mensagem</label>
                  <textarea className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200" rows={4} required disabled={loading}></textarea>
                </div>
                {erro && <div className="text-red-600 text-sm text-center">{erro}</div>}
                <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-2 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-60">
                  {loading ? (
                    <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Enviando...</span>
                  ) : (
                    <><Send className="w-4 h-4" /> Enviar</>
                  )}
                </button>
              </form>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Contato;
