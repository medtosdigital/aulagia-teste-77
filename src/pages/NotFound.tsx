
import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center px-4">
        <div className="flex justify-center mb-8">
          <div className="bg-primary-500 text-white p-4 rounded-2xl">
            <BookOpen className="w-16 h-16" />
          </div>
        </div>
        
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Página não encontrada</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          A página que você está procurando não existe ou foi movida para outro local.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button className="btn-magic">
              <Home className="w-4 h-4 mr-2" />
              Voltar ao Início
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="outline">
              Ir ao Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
