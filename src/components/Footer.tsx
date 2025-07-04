import React from 'react';
import { BookOpen, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Logo e descrição */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <div className="bg-primary-500 text-white p-1.5 rounded-lg">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="logo-text text-lg text-primary-600">AulagIA</h3>
                  <p className="text-gray-500 text-xs -mt-1">Sua aula com toque mágico</p>
                </div>
              </div>
            </div>
            
            {/* Links legais */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-3 text-sm">Legal</h4>
              <ul className="space-y-1">
                <li>
                  <Link to="/termos-de-servico" className="text-gray-600 hover:text-primary-600 text-xs transition-colors">
                    Termos de Serviço
                  </Link>
                </li>
                <li>
                  <Link to="/politica-de-privacidade" className="text-gray-600 hover:text-primary-600 text-xs transition-colors">
                    Política de Privacidade
                  </Link>
                </li>
                <li>
                  <Link to="/aviso-ia" className="text-gray-600 hover:text-primary-600 text-xs transition-colors">
                    Aviso sobre IA
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Suporte */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-3 text-sm">Suporte</h4>
              <ul className="space-y-1">
                <li>
                  <Link to="/central-de-ajuda" className="text-gray-600 hover:text-primary-600 text-xs transition-colors">
                    Central de Ajuda
                  </Link>
                </li>
                <li>
                  <Link to="/contato" className="text-gray-600 hover:text-primary-600 text-xs transition-colors">
                    Contato
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-500 text-xs">© 2025 AulagIA. Todos os direitos reservados.</p>
              <p className="text-gray-500 text-xs flex items-center mt-2 md:mt-0">
                Feito com <Heart className="w-3 h-3 text-red-500 mx-1" /> para educadores
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
