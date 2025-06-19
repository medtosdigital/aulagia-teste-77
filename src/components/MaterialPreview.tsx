
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
      
      // Para outros tipos, usar a renderização padrão com formato A4
      return (
        <div className="a4-document-container">
          <div 
            className="a4-page"
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
          />
        </div>
      );
    } catch (error) {
      console.error('Erro ao renderizar template:', error);
      return (
        <div className="error-message p-8 text-center">
          <p className="text-red-600">Erro ao carregar o template do material.</p>
        </div>
      );
    }
  };

  return (
    <div className="material-preview-container w-full h-full overflow-auto bg-gray-200 p-8">
      <style>{`
        .a4-document-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
          padding: 2rem 0;
        }
        
        .a4-page {
          width: 210mm;
          min-height: 297mm;
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
          padding: 2.5cm 3cm 2cm 3cm; /* Margens ABNT: Superior 3cm, Direita 2cm, Inferior 2cm, Esquerda 3cm */
          margin: 0 auto;
          font-family: 'Times New Roman', serif;
          font-size: 12pt;
          line-height: 1.5;
          color: #333;
          page-break-after: always;
          position: relative;
        }
        
        .a4-page h1 {
          font-size: 16pt;
          font-weight: bold;
          text-align: center;
          margin-bottom: 2rem;
          text-transform: uppercase;
          color: #1e40af;
        }
        
        .a4-page h2 {
          font-size: 14pt;
          font-weight: bold;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
          color: #1e40af;
          text-transform: uppercase;
        }
        
        .a4-page h3 {
          font-size: 12pt;
          font-weight: bold;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          color: #374151;
        }
        
        .a4-page p {
          margin-bottom: 1rem;
          text-align: justify;
          text-indent: 1.25cm; /* Parágrafo com recuo ABNT */
        }
        
        .a4-page ul, .a4-page ol {
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }
        
        .a4-page li {
          margin-bottom: 0.5rem;
          text-align: justify;
        }
        
        .a4-page table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
          font-size: 11pt;
        }
        
        .a4-page th, .a4-page td {
          border: 1px solid #d1d5db;
          padding: 8px 12px;
          text-align: left;
        }
        
        .a4-page th {
          background-color: #f3f4f6;
          font-weight: bold;
          text-align: center;
        }
        
        /* Quebra de página automática */
        .a4-page .page-break {
          page-break-before: always;
        }
        
        /* Estilo para impressão */
        @media print {
          .material-preview-container {
            background: white !important;
            padding: 0 !important;
          }
          
          .a4-page {
            width: 100% !important;
            min-height: auto !important;
            margin: 0 !important;
            padding: 2.5cm 3cm 2cm 3cm !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            page-break-after: always;
          }
          
          .a4-document-container {
            padding: 0 !important;
            gap: 0 !important;
          }
        }
        
        /* Estilos específicos para diferentes tipos de conteúdo */
        .lesson-info-table {
          border: 2px solid #1e40af;
          margin: 2rem 0;
        }
        
        .lesson-info-table th {
          background-color: #dbeafe;
          color: #1e40af;
          font-weight: bold;
        }
        
        .objectives-list {
          counter-reset: objective-counter;
        }
        
        .objectives-list li {
          counter-increment: objective-counter;
          position: relative;
          padding-left: 2rem;
        }
        
        .objectives-list li::before {
          content: counter(objective-counter) ".";
          position: absolute;
          left: 0;
          font-weight: bold;
          color: #1e40af;
        }
        
        /* Estilo para atividades e avaliações */
        .question-block {
          margin: 1.5rem 0;
          padding: 1rem;
          border-left: 4px solid #1e40af;
          background-color: #f8fafc;
          border-radius: 0 8px 8px 0;
        }
        
        .question-number {
          font-weight: bold;
          color: #1e40af;
          margin-bottom: 0.5rem;
        }
        
        .question-options {
          margin-left: 1rem;
          margin-top: 0.5rem;
        }
        
        .question-options li {
          list-style-type: lower-alpha;
          margin-bottom: 0.25rem;
        }
        
        /* Rodapé com numeração de página */
        .a4-page::after {
          content: counter(page);
          position: absolute;
          bottom: 1.5cm;
          right: 3cm;
          font-size: 10pt;
          color: #666;
        }
      `}</style>
      {renderMaterial()}
    </div>
  );
};

export default MaterialPreview;
