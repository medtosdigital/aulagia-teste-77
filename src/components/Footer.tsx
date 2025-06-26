import React from 'react';
import { BookOpen, Heart } from 'lucide-react';
const Footer = () => {
  return <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo e descrição */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-primary-500 text-white p-2 rounded-lg">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="logo-text text-xl text-primary-600">AulagIA</h3>
                  <p className="text-gray-500 text-xs font-normal -mt-1">Sua aula com toque mágico</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm max-w-md">Prepare suas Aulas em Minutos com um Toque Mágico. </p>
            </div>
            
            {/* Links legais */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <a href="/termos-de-servico" className="text-gray-600 hover:text-primary-600 text-sm transition-colors">
                    Termos de Serviço
                  </a>
                </li>
                <li>
                  <a href="/politica-de-privacidade" className="text-gray-600 hover:text-primary-600 text-sm transition-colors">
                    Política de Privacidade
                  </a>
                </li>
                <li>
                  <a href="/termos-de-uso" className="text-gray-600 hover:text-primary-600 text-sm transition-colors">
                    Termos de Uso
                  </a>
                </li>
                <li>
                  <a href="/aviso-ia" className="text-gray-600 hover:text-primary-600 text-sm transition-colors">
                    Aviso sobre IA
                  </a>
                </li>
              </ul>
            </div>
            
            {/* Suporte */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-4">Suporte</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-600 hover:text-primary-600 text-sm transition-colors">
                    Central de Ajuda
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-primary-600 text-sm transition-colors">
                    Contato
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-primary-600 text-sm transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Aviso sobre IA */}
          
          
          {/* Copyright */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-500 text-sm">© 2025 AulagIA. Todos os direitos reservados.</p>
              <p className="text-gray-500 text-sm flex items-center mt-2 md:mt-0">
                Feito com <Heart className="w-4 h-4 text-red-500 mx-1" /> para educadores
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;