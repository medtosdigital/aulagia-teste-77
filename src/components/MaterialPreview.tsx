
import React from 'react';
import { templateService } from '@/services/templateService';
import { GeneratedMaterial } from '@/services/materialService';
import SlideViewer from './SlideViewer';

interface MaterialPreviewProps {
  material: GeneratedMaterial;
  templateId?: string;
}

const MaterialPreview: React.FC<MaterialPreviewProps> = ({ material, templateId }) => {
  const getDefaultTemplateId = (type: string): string => {
    const typeMap = {
      'plano-de-aula': '1',
      'slides': '2',
      'atividade': '3',
      'avaliacao': '4'
    };
    return typeMap[type as keyof typeof typeMap] || '1';
  };

  const renderMaterial = () => {
    const selectedTemplateId = templateId || getDefaultTemplateId(material.type);
    
    try {
      const renderedHtml = templateService.renderTemplate(selectedTemplateId, material.content);
      
      // Se for slides, usar o SlideViewer
      if (material.type === 'slides') {
        return <SlideViewer htmlContent={renderedHtml} />;
      }
      
      // Para outros tipos, renderizar diretamente no contêiner
      return (
        <div 
          className="a4-page"
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
        />
      );
    } catch (error) {
      console.error('Erro ao renderizar template:', error);
      return (
        <div className="error-message p-4 text-center">
          <p className="text-red-600 text-sm">Erro ao carregar o template do material.</p>
        </div>
      );
    }
  };

  return (
    <div className="material-preview-container w-full h-full overflow-auto bg-gray-50 flex justify-center items-start py-4">
      <style>{`
        .material-preview-container {
          display: flex;
          justify-content: center;
          align-items: flex-start;
          min-height: 100vh;
          padding: 20px 10px;
        }
        
        .material-preview-container .a4-page {
          width: 210mm;
          min-height: 297mm;
          max-width: 210mm;
          background: white;
          margin: 0 auto;
          font-family: 'Times New Roman', serif;
          font-size: 12pt;
          line-height: 1.5;
          color: #333;
          position: relative;
          padding: 0;
          box-sizing: border-box;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
          border-radius: 12px;
          border: 1px solid rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }
        
        /* Responsividade para mobile */
        @media (max-width: 768px) {
          .material-preview-container {
            padding: 0.5rem;
          }
          
          .material-preview-container .a4-page {
            width: 100%;
            max-width: 100%;
            min-height: auto;
            margin: 0;
            border-radius: 8px;
            box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
          }
        }
        
        @media (max-width: 480px) {
          .material-preview-container .a4-page {
            border-radius: 6px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          }
        }
        
        @media print {
          .material-preview-container {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          
          .material-preview-container .a4-page {
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: none !important;
            min-height: 100vh !important;
          }
        }
      `}</style>
      {renderMaterial()}
    </div>
  );
};

export default MaterialPreview;
