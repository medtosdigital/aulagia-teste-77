
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
    <div className="material-preview-container w-full h-full overflow-auto bg-gray-50 flex justify-center py-4">
      <style>{`
        .material-preview-container .a4-page {
          width: 100%;
          max-width: 800px;
          min-height: auto;
          background: white;
          margin: 0 auto;
          font-family: 'Times New Roman', serif;
          font-size: 12pt;
          line-height: 1.5;
          color: #333;
          position: relative;
          padding: 2rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
        }
        
        .material-preview-container .a4-page h1 {
          font-size: 18pt;
          font-weight: bold;
          text-align: center;
          margin-bottom: 1.5rem;
          text-transform: uppercase;
          color: #1e40af;
        }
        
        .material-preview-container .a4-page h2 {
          font-size: 14pt;
          font-weight: bold;
          margin-top: 1.25rem;
          margin-bottom: 0.75rem;
          color: #1e40af;
          text-transform: uppercase;
        }
        
        .material-preview-container .a4-page h3 {
          font-size: 12pt;
          font-weight: bold;
          margin-top: 0.75rem;
          margin-bottom: 0.5rem;
          color: #374151;
        }
        
        .material-preview-container .a4-page p {
          margin-bottom: 0.75rem;
          text-align: justify;
        }
        
        .material-preview-container .a4-page ul, 
        .material-preview-container .a4-page ol {
          margin-bottom: 0.75rem;
          padding-left: 1.25rem;
        }
        
        .material-preview-container .a4-page li {
          margin-bottom: 0.375rem;
          text-align: justify;
        }
        
        .material-preview-container .a4-page table {
          width: 100%;
          border-collapse: collapse;
          margin: 0.75rem 0;
          font-size: 11pt;
        }
        
        .material-preview-container .a4-page th, 
        .material-preview-container .a4-page td {
          border: 1px solid #d1d5db;
          padding: 8px 12px;
          text-align: left;
        }
        
        .material-preview-container .a4-page th {
          background-color: #f3f4f6;
          font-weight: bold;
          text-align: center;
        }
        
        /* Responsividade para mobile */
        @media (max-width: 768px) {
          .material-preview-container {
            padding: 0.5rem;
          }
          
          .material-preview-container .a4-page {
            max-width: 100%;
            font-size: 11pt;
            padding: 1.5rem;
            margin: 0;
          }
          
          .material-preview-container .a4-page h1 {
            font-size: 16pt;
            margin-bottom: 1rem;
          }
          
          .material-preview-container .a4-page h2 {
            font-size: 13pt;
            margin-top: 1rem;
            margin-bottom: 0.5rem;
          }
          
          .material-preview-container .a4-page h3 {
            font-size: 11pt;
          }
          
          .material-preview-container .a4-page table {
            font-size: 10pt;
          }
          
          .material-preview-container .a4-page th, 
          .material-preview-container .a4-page td {
            padding: 6px 8px;
          }
        }
        
        @media (max-width: 480px) {
          .material-preview-container .a4-page {
            font-size: 10pt;
            padding: 1rem;
          }
          
          .material-preview-container .a4-page h1 {
            font-size: 14pt;
          }
          
          .material-preview-container .a4-page h2 {
            font-size: 12pt;
          }
          
          .material-preview-container .a4-page table {
            font-size: 9pt;
          }
        }
        
        /* Estilos específicos para diferentes tipos de conteúdo */
        .material-preview-container .lesson-info-table {
          border: 2px solid #1e40af;
          margin: 1.5rem 0;
        }
        
        .material-preview-container .lesson-info-table th {
          background-color: #dbeafe;
          color: #1e40af;
          font-weight: bold;
        }
        
        .material-preview-container .objectives-list {
          counter-reset: objective-counter;
        }
        
        .material-preview-container .objectives-list li {
          counter-increment: objective-counter;
          position: relative;
          padding-left: 1.5rem;
        }
        
        .material-preview-container .objectives-list li::before {
          content: counter(objective-counter) ".";
          position: absolute;
          left: 0;
          font-weight: bold;
          color: #1e40af;
        }
        
        /* Estilo para atividades e avaliações */
        .material-preview-container .question-block {
          margin: 1rem 0;
          padding: 0.75rem;
          border-left: 4px solid #1e40af;
          background-color: #f8fafc;
          border-radius: 0 6px 6px 0;
        }
        
        .material-preview-container .question-number {
          font-weight: bold;
          color: #1e40af;
          margin-bottom: 0.375rem;
        }
        
        .material-preview-container .question-options {
          margin-left: 0.75rem;
          margin-top: 0.375rem;
        }
        
        .material-preview-container .question-options li {
          list-style-type: lower-alpha;
          margin-bottom: 0.25rem;
        }
      `}</style>
      {renderMaterial()}
    </div>
  );
};

export default MaterialPreview;
