
import React from 'react';
import { templateService } from '@/services/templateService';
import { GeneratedMaterial } from '@/services/materialService';

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
      
      return (
        <div 
          className="material-preview"
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
        />
      );
    } catch (error) {
      console.error('Erro ao renderizar template:', error);
      return (
        <div className="error-message">
          <p>Erro ao carregar o template do material.</p>
        </div>
      );
    }
  };

  return (
    <div className="material-preview-container">
      <style jsx>{`
        .material-preview-container {
          width: 100%;
          height: 100%;
          overflow: auto;
          background: #f5f5f5;
          padding: 20px;
        }

        .material-preview :global(.a4-page) {
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto 20px;
          background: white;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
          padding: 20mm;
          font-family: 'Arial', sans-serif;
          font-size: 12pt;
          line-height: 1.5;
        }

        .material-preview :global(.slides-container) {
          display: flex;
          flex-direction: column;
          gap: 20px;
          align-items: center;
        }

        .material-preview :global(.slide-4-3) {
          width: 800px;
          height: 600px;
          background: white;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
          margin: 0 auto;
          padding: 40px;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .material-preview :global(.header) {
          margin-bottom: 30px;
        }

        .material-preview :global(.header h1) {
          font-size: 24pt;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 20px;
          text-align: center;
        }

        .material-preview :global(.info-grid) {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 20px;
        }

        .material-preview :global(.info-item) {
          padding: 8px;
          border-left: 3px solid #2563eb;
          background: #f8fafc;
        }

        .material-preview :global(.section) {
          margin-bottom: 25px;
        }

        .material-preview :global(.section h2) {
          font-size: 16pt;
          font-weight: bold;
          color: #1e40af;
          margin-bottom: 15px;
          padding-bottom: 5px;
          border-bottom: 2px solid #e5e7eb;
        }

        .material-preview :global(.section h3) {
          font-size: 14pt;
          font-weight: bold;
          color: #374151;
          margin-bottom: 8px;
        }

        .material-preview :global(.etapa) {
          background: #f9fafb;
          padding: 15px;
          margin-bottom: 15px;
          border-radius: 8px;
          border-left: 4px solid #10b981;
        }

        .material-preview :global(.slide-header) {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 3px solid #2563eb;
        }

        .material-preview :global(.slide-header h1) {
          font-size: 32pt;
          font-weight: bold;
          color: #1e40af;
          margin: 0;
        }

        .material-preview :global(.slide-number) {
          background: #2563eb;
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14pt;
          font-weight: bold;
        }

        .material-preview :global(.slide-content) {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .material-preview :global(.slide-item) {
          font-size: 18pt;
          margin-bottom: 20px;
          padding-left: 20px;
          position: relative;
        }

        .material-preview :global(.slide-item::before) {
          content: '•';
          color: #2563eb;
          font-weight: bold;
          position: absolute;
          left: 0;
        }

        .material-preview :global(.instructions) {
          background: #dbeafe;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .material-preview :global(.questions) {
          margin-top: 20px;
        }

        .material-preview :global(.question) {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .material-preview :global(.question-header) {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .material-preview :global(.question-header h3) {
          color: #1e40af;
          margin: 0;
        }

        .material-preview :global(.question-type) {
          background: #f3f4f6;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 10pt;
          color: #6b7280;
        }

        .material-preview :global(.points) {
          background: #dcfce7;
          color: #166534;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 10pt;
          font-weight: bold;
        }

        .material-preview :global(.question-text) {
          font-size: 12pt;
          margin-bottom: 15px;
          line-height: 1.6;
        }

        .material-preview :global(.options) {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .material-preview :global(.option) {
          display: flex;
          align-items: center;
          padding: 8px;
          background: #f9fafb;
          border-radius: 4px;
        }

        .material-preview :global(.option-letter) {
          font-weight: bold;
          margin-right: 12px;
          color: #2563eb;
          min-width: 20px;
        }

        .material-preview :global(.evaluation-info) {
          background: #fef3c7;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .material-preview :global(.error-message) {
          padding: 40px;
          text-align: center;
          color: #dc2626;
          font-size: 14pt;
        }

        @media print {
          .material-preview-container {
            background: white;
            padding: 0;
          }
          
          .material-preview :global(.a4-page) {
            box-shadow: none;
            margin: 0;
            page-break-after: always;
          }
          
          .material-preview :global(.slide-4-3) {
            box-shadow: none;
            page-break-after: always;
          }
        }
      `}</style>
      {renderMaterial()}
    </div>
  );
};

export default MaterialPreview;
