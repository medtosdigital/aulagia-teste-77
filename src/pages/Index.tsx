
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Dashboard from '@/components/Dashboard';
import CreateLesson from '@/components/CreateLesson';
import MaterialsList from '@/components/MaterialsList';
import MaterialViewer from '@/components/MaterialViewer';

const Index = () => {
  const [activeItem, setActiveItem] = useState('dashboard');

  const getPageTitle = () => {
    switch (activeItem) {
      case 'dashboard':
        return 'Dashboard';
      case 'create':
        return 'Criar Material';
      case 'lessons':
        return 'Meus Materiais';
      case 'calendar':
        return 'Calendário';
      case 'subscription':
        return 'Assinatura';
      case 'settings':
        return 'Configurações';
      case 'api-keys':
        return 'Chaves de API';
      default:
        return 'Dashboard';
    }
  };

  const renderContent = () => {
    switch (activeItem) {
      case 'dashboard':
        return <Dashboard />;
      case 'create':
        return <CreateLesson />;
      case 'lessons':
        return <MaterialsList />;
      case 'calendar':
        return <div className="p-4"><h2>Calendário - Em desenvolvimento</h2></div>;
      case 'subscription':
        return <div className="p-4"><h2>Assinatura - Em desenvolvimento</h2></div>;
      case 'settings':
        return <div className="p-4"><h2>Configurações - Em desenvolvimento</h2></div>;
      case 'api-keys':
        return <div className="p-4"><h2>Chaves de API - Em desenvolvimento</h2></div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Routes>
      {/* Rota para visualização de material específico */}
      <Route path="/material/:id" element={<MaterialViewer />} />
      
      {/* Rota principal com sidebar */}
      <Route path="*" element={
        <div className="min-h-screen bg-gray-50 w-full">
          <Sidebar activeItem={activeItem} onItemClick={setActiveItem} />
          
          <div className="md:ml-64 min-h-screen pb-20 md:pb-0">
            <Header title={getPageTitle()} />
            {renderContent()}
          </div>
        </div>
      } />
    </Routes>
  );
};

export default Index;
