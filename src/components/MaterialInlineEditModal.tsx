
import React, { useState, useEffect } from 'react';
import { X, Save, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { materialService, type GeneratedMaterial, type LessonPlan, type Activity, type Assessment } from '@/services/materialService';
import { templateService } from '@/services/templateService';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

interface MaterialInlineEditModalProps {
  material: GeneratedMaterial | null;
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}

const MaterialInlineEditModal: React.FC<MaterialInlineEditModalProps> = ({
  material,
  open,
  onClose,
  onSave
}) => {
  const isMobile = useIsMobile();
  const [editedMaterial, setEditedMaterial] = useState<GeneratedMaterial | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (material && open) {
      setEditedMaterial(JSON.parse(JSON.stringify(material)));
    }
  }, [material, open]);

  const handleSave = async () => {
    if (!editedMaterial) return;

    setLoading(true);
    try {
      const success = materialService.updateMaterial(editedMaterial.id, editedMaterial);
      if (success) {
        toast.success('Material atualizado com sucesso!');
        onSave();
        onClose();
      } else {
        toast.error('Erro ao atualizar material');
      }
    } catch (error) {
      toast.error('Erro ao salvar material');
      console.error('Save error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultTemplateId = (type: string): string => {
    const typeMap = {
      'plano-de-aula': '1',
      'slides': '2',
      'atividade': '3',
      'avaliacao': '4'
    };
    return typeMap[type as keyof typeof typeMap] || '1';
  };

  // Usar EXATAMENTE o mesmo template do MaterialPreview
  const enhanceHtmlWithNewTemplate = (htmlContent: string): string => {
    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${editedMaterial?.title}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          /* Define página A4 para impressão e visualização */
          @page {
            size: A4;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            background: #f0f4f8;
            font-family: 'Inter', sans-serif;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: center;
            min-height: 100vh;
            padding: 20px 0;
          }
          
          /* Container no tamanho A4 - Cada .page será uma folha */
          .page {
            position: relative;
            width: 210mm;
            min-height: 297mm;
            background: white;
            overflow: hidden;
            margin: 0 auto 20px auto;
            box-sizing: border-box;
            padding: 0;
            display: flex;
            flex-direction: column;
            border-radius: 6px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            page-break-after: always;
          }

          .page:last-of-type {
            page-break-after: auto;
            margin-bottom: 0;
          }
          
          /* Formas decorativas */
          .shape-circle {
            position: absolute;
            border-radius: 50%;
            opacity: 0.25;
            pointer-events: none;
            z-index: 0;
          }
          .shape-circle.purple {
            width: 180px; 
            height: 180px;
            background: #a78bfa;
            top: -60px; 
            left: -40px;
          }
          .shape-circle.blue {
            width: 240px; 
            height: 240px;
            background: #60a5fa;
            bottom: -80px; 
            right: -60px;
          }
          
          /* Cabeçalho que aparece no topo */
          .header {
            position: absolute;
            top: 6mm;
            left: 0;
            right: 0;
            display: flex;
            align-items: center;
            z-index: 999;
            height: 12mm;
            background: transparent;
            padding: 0 12mm;
            flex-shrink: 0;
          }
          .header .logo-container {
            display: flex;
            align-items: center;
            gap: 3px;
          }
          .header .logo {
            width: 32px;
            height: 32px;
            background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            flex-shrink: 0;
            box-shadow: 0 2px 6px rgba(14, 165, 233, 0.2);
          }
          .header .logo svg {
            width: 16px;
            height: 16px;
            stroke: white;
            fill: none;
            stroke-width: 2;
          }
          .header .brand-text {
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          .header .brand-text h1 {
            font-size: 20px;
            color: #0ea5e9;
            margin: 0;
            font-family: 'Inter', sans-serif;
            line-height: 1;
            font-weight: 700;
            letter-spacing: -0.2px;
            text-transform: none;
          }
          .header .brand-text p {
            font-size: 8px;
            color: #6b7280;
            margin: -1px 0 0 0;
            font-family: 'Inter', sans-serif;
            line-height: 1;
            font-weight: 400;
          }
          
          /* Conteúdo principal com margem para não sobrepor o cabeçalho */
          .content {
            margin-top: 20mm;
            margin-bottom: 12mm;
            padding: 0 15mm;
            position: relative;
            flex: 1;
            overflow: visible;
            z-index: 1;
          }

          .content.subsequent-page {
            margin-top: 40mm;
          }

          /* Título principal */
          h2 {
            text-align: center;
            margin: 10px 0 18px 0;
            font-size: 1.5rem;
            color: #4f46e5;
            position: relative;
            font-family: 'Inter', sans-serif;
            font-weight: 700;
          }
          h2::after {
            content: '';
            width: 50px;
            height: 3px;
            background: #a78bfa;
            display: block;
            margin: 6px auto 0;
            border-radius: 2px;
          }
          
          /* Tabelas */
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 18px;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
          th, td {
            padding: 8px 12px;
            font-size: 0.85rem;
            border: none;
            font-family: 'Inter', sans-serif;
            vertical-align: top;
          }
          th {
            background: #f3f4f6;
            color: #1f2937;
            font-weight: 600;
            text-align: left;
            width: 18%;
          }
          td {
            background: #ffffff;
            border-bottom: 1px solid #e5e7eb;
          }
          td:last-child {
            border-bottom: none;
          }
          table .student-info-cell {
            width: 32%;
          }
          
          .nota-highlight-cell {
            background-color: #fef3c7;
            color: #000000;
            font-weight: 600;
            border: 2px solid #f59e0b;
          }
          
          .instructions {
            background: #eff6ff;
            padding: 15px;
            border-left: 4px solid #0ea5e9;
            margin-bottom: 30px;
            font-family: 'Inter', sans-serif;
            border-radius: 6px;
          }

          .questao-container, .question {
            margin-bottom: 30px;
            page-break-inside: avoid;
          }
          .questao-numero, .question-header {
            font-weight: 600;
            color: #4338ca;
            margin-bottom: 10px;
            font-size: 1.0rem;
            font-family: 'Inter', sans-serif;
          }
          .questao-enunciado, .question-text {
            margin-bottom: 15px;
            text-align: justify;
            font-family: 'Inter', sans-serif;
            font-size: 0.9rem;
            line-height: 1.4;
          }
          .questao-opcoes, .options {
            margin-left: 20px;
          }
          .opcao, .option {
            margin-bottom: 8px;
            display: flex;
            align-items: flex-start;
            font-family: 'Inter', sans-serif;
            font-size: 0.9rem;
          }
          .opcao-letra, .option-letter {
            font-weight: bold;
            margin-right: 10px;
            color: #4338ca;
            min-width: 25px;
          }
          
          .answer-lines {
            border-bottom: 1px solid #d1d5db;
            margin-bottom: 8px;
            height: 20px;
            padding: 0;
            background: none;
            border-radius: 0;
            min-height: 20px;
          }
          .answer-lines:last-child {
            margin-bottom: 0;
          }

          .math-space {
            border: 1px solid #e5e7eb;
            min-height: 80px;
            margin: 10px 0;
            padding: 15px;
            border-radius: 4px;
            background: #fafafa;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #9ca3af;
            font-size: 0.8rem;
          }

          .matching-section {
            display: flex;
            gap: 30px;
            margin: 15px 0;
          }
          .matching-column {
            flex: 1;
          }
          .matching-item {
            padding: 8px 12px;
            border: 1px solid #d1d5db;
            margin-bottom: 8px;
            border-radius: 4px;
            background: #f9fafb;
          }

          .fill-blank {
            display: inline-block;
            border-bottom: 2px solid #4338ca;
            min-width: 100px;
            height: 20px;
            margin: 0 5px;
          }

          .image-space {
            border: 2px dashed #d1d5db;
            min-height: 120px;
            margin: 15px 0;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #9ca3af;
            font-size: 0.8rem;
            background: #fafafa;
          }

          .formula-display {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin: 15px 0;
            text-align: center;
            font-family: 'Times New Roman', serif;
            font-size: 1.1rem;
            border: 1px solid #e2e8f0;
          }
          
          /* Rodapé */
          .footer {
            position: absolute;
            bottom: 6mm;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 0.7rem;
            color: #6b7280;
            z-index: 999;
            height: 6mm;
            display: flex;
            align-items: center;
            justify-content: center;
            background: transparent;
            padding: 0 15mm;
            font-family: 'Inter', sans-serif;
            flex-shrink: 0;
          }

          /* Estilos para campos editáveis */
          .editable-field {
            transition: all 0.2s ease;
            cursor: text;
            min-height: 20px;
            outline: none;
            background: rgba(59, 130, 246, 0.05) !important;
            border: 1px dashed rgba(59, 130, 246, 0.3) !important;
            border-radius: 4px !important;
            padding: 4px 8px !important;
          }
          .editable-field:hover {
            background: rgba(59, 130, 246, 0.1) !important;
            border-color: #3b82f6 !important;
          }
          .editable-field:focus {
            background: white !important;
            border-color: #2563eb !important;
            box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2) !important;
          }

          /* Logo NÃO editável */
          .header .logo, .header .brand-text h1, .header .brand-text p, .footer {
            pointer-events: none !important;
          }
          
          /* Ajustes para impressão */
          @media print {
            body { 
              margin: 0; 
              padding: 0; 
              background: white;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .page { 
              box-shadow: none; 
              margin: 0;
              border-radius: 0;
              width: 100%;
              min-height: 100vh;
              display: flex;
              flex-direction: column;
            }
            .shape-circle {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .header, .footer {
              position: fixed;
              background: transparent;
            }
            .header .logo {
              background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%) !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            h2 {
              color: #4f46e5 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            h2::after {
              background: #a78bfa !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .questao-numero, .question-header {
              color: #4338ca !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            th {
              background: #f3f4f6 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .nota-highlight-cell {
              background-color: #fef3c7 !important;
              border: 2px solid #f59e0b !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
    `;
  };

  // Template para slides usando o mesmo formato do MaterialPreview
  const enhanceSlideTemplate = (htmlContent: string): string => {
    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${editedMaterial?.title || 'Slides'}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          body {
            margin: 0;
            padding: 20px;
            background: #f0f4f8;
            font-family: 'Inter', sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            min-height: 100vh;
          }
          
          .slide-page {
            width: 800px;
            height: 600px;
            aspect-ratio: 4/3;
            background: white;
            margin-bottom: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            position: relative;
            overflow: hidden;
            padding: 40px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
          }

          .shape-circle {
            position: absolute;
            border-radius: 50%;
            opacity: 0.25;
            pointer-events: none;
            z-index: 0;
          }
          .shape-circle.purple {
            width: 150px; 
            height: 150px;
            background: #a78bfa;
            top: -50px; 
            left: -30px;
          }
          .shape-circle.blue {
            width: 200px; 
            height: 200px;
            background: #60a5fa;
            bottom: -70px; 
            right: -50px;
          }

          .slide-header {
            position: absolute;
            top: 20px;
            left: 20px;
            display: flex;
            align-items: center;
            gap: 8px;
            z-index: 10;
          }
          .slide-header .logo {
            width: 24px;
            height: 24px;
            background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 12px;
          }
          .slide-header .brand-text h1 {
            font-size: 16px;
            color: #0ea5e9;
            margin: 0;
            font-weight: 700;
            line-height: 1;
            pointer-events: none !important;
          }
          .slide-header .brand-text p {
            font-size: 6px;
            color: #6b7280;
            margin: 0;
            line-height: 1;
            pointer-events: none !important;
          }

          .slide-number {
            position: absolute;
            top: 20px;
            right: 20px;
            background: #3b82f6;
            color: white;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            z-index: 10;
          }

          .slide-title {
            margin-top: 60px;
            margin-bottom: 30px;
            text-align: center;
            z-index: 1;
            position: relative;
          }
          .slide-title h2 {
            font-size: 2rem;
            color: #1e40af;
            margin: 0;
            font-weight: 700;
          }

          .slide-content {
            flex: 1;
            z-index: 1;
            position: relative;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          .slide-content ul {
            list-style: none;
            padding: 0;
            margin: 0;
          }
          .slide-content li {
            margin-bottom: 15px;
            display: flex;
            align-items: flex-start;
            gap: 12px;
            font-size: 1.1rem;
            line-height: 1.4;
          }
          .slide-content li::before {
            content: '●';
            color: #3b82f6;
            font-weight: bold;
            font-size: 1.2rem;
            flex-shrink: 0;
            margin-top: 2px;
          }

          /* Estilos para campos editáveis */
          .editable-field {
            transition: all 0.2s ease;
            cursor: text;
            min-height: 20px;
            outline: none;
            background: rgba(59, 130, 246, 0.05) !important;
            border: 1px dashed rgba(59, 130, 246, 0.3) !important;
            border-radius: 4px !important;
            padding: 4px 8px !important;
          }
          .editable-field:hover {
            background: rgba(59, 130, 246, 0.1) !important;
            border-color: #3b82f6 !important;
          }
          .editable-field:focus {
            background: white !important;
            border-color: #2563eb !important;
            box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2) !important;
          }

          /* Logo e elementos não editáveis */
          .slide-header .logo, .slide-header .brand-text h1, .slide-header .brand-text p, .slide-number {
            pointer-events: none !important;
          }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
    `;
  };

  const makeContentEditable = (htmlContent: string): string => {
    let editableHtml = htmlContent;

    // Tornar títulos editáveis (exceto o da logo)
    editableHtml = editableHtml.replace(
      /<h([1-6])([^>]*)>([^<]*)<\/h([1-6])>/g,
      (match, tag1, attrs, content, tag2) => {
        if (content.includes('AulagIA') || content.includes('APRESENTAÇÃO')) return match;
        return `<h${tag1}${attrs} class="editable-field" contenteditable="true">${content}</h${tag2}>`;
      }
    );

    // Tornar parágrafos editáveis (exceto os da logo e rodapé)
    editableHtml = editableHtml.replace(
      /<p([^>]*)>([^<]*)<\/p>/g,
      (match, attrs, content) => {
        if (content.includes('Sua aula com toque mágico') || content.includes('aulagia.com.br')) return match;
        return `<p${attrs} class="editable-field" contenteditable="true">${content}</p>`;
      }
    );

    // Tornar campos de tabela editáveis (exceto logo)
    editableHtml = editableHtml.replace(
      /<td([^>]*)>([^<]*)<\/td>/g,
      '<td$1 class="editable-field" contenteditable="true">$2</td>'
    );

    // Tornar listas editáveis
    editableHtml = editableHtml.replace(
      /<li([^>]*)>([^<]*)<\/li>/g,
      '<li$1 class="editable-field" contenteditable="true">$2</li>'
    );

    // Tornar questões editáveis
    editableHtml = editableHtml.replace(
      /<div([^>]*class="[^"]*questao-enunciado[^"]*"[^>]*)>([^<]*)<\/div>/g,
      '<div$1 class="questao-enunciado editable-field" contenteditable="true">$2</div>'
    );

    editableHtml = editableHtml.replace(
      /<div([^>]*class="[^"]*question-text[^"]*"[^>]*)>([^<]*)<\/div>/g,
      '<div$1 class="question-text editable-field" contenteditable="true">$2</div>'
    );

    // Tornar opções de múltipla escolha editáveis
    editableHtml = editableHtml.replace(
      /<div([^>]*class="[^"]*option[^"]*"[^>]*)>(<span[^>]*class="[^"]*option-letter[^"]*"[^>]*>[A-E]\)<\/span>)\s*([^<]*)<\/div>/g,
      '<div$1>$2 <span class="editable-field" contenteditable="true">$3</span></div>'
    );

    // Tornar textos de instruções editáveis
    editableHtml = editableHtml.replace(
      /<div([^>]*class="[^"]*instructions[^"]*"[^>]*)>(.*?)<\/div>/gs,
      (match, attrs, content) => {
        if (content.includes('<strong>')) {
          return content.replace(/<strong>([^<]*)<\/strong>/g, '<strong class="editable-field" contenteditable="true">$1</strong>');
        }
        return `<div${attrs} class="instructions editable-field" contenteditable="true">${content}</div>`;
      }
    );

    // Tornar textos de atividades/avaliações editáveis
    editableHtml = editableHtml.replace(
      /(<strong[^>]*>)([^<]*?)(<\/strong>)/g,
      (match, openTag, content, closeTag) => {
        if (content.includes('ATIVIDADE') || content.includes('AVALIAÇÃO') || content.includes('PLANO DE AULA')) {
          return `${openTag}<span class="editable-field" contenteditable="true">${content}</span>${closeTag}`;
        }
        return `${openTag}<span class="editable-field" contenteditable="true">${content}</span>${closeTag}`;
      }
    );

    return editableHtml;
  };

  // Usar a mesma função de paginação do MaterialPreview
  const wrapPageContentWithTemplate = (content: string, isFirstPage: boolean): string => {
    const pageClass = isFirstPage ? 'first-page-content' : 'subsequent-page-content';
    const contentClass = isFirstPage ? 'content' : 'content subsequent-page';
    
    const getFooterText = () => {
      if (editedMaterial?.type === 'plano-de-aula') {
        return `Plano de aula gerado pela AulagIA - Sua aula com toque mágico em ${new Date().toLocaleDateString('pt-BR')} • aulagia.com.br`;
      } else if (editedMaterial?.type === 'atividade') {
        return `Atividade gerada pela AulagIA - Sua aula com toque mágico em ${new Date().toLocaleDateString('pt-BR')} • aulagia.com.br`;
      } else {
        return `Avaliação gerada pela AulagIA - Sua aula com toque mágico em ${new Date().toLocaleDateString('pt-BR')} • aulagia.com.br`;
      }
    };
    
    return `
      <div class="page ${pageClass}">
        <!-- Formas decorativas -->
        <div class="shape-circle purple"></div>
        <div class="shape-circle blue"></div>

        <!-- Cabeçalho AulagIA - Visível em todas as páginas -->
        <div class="header">
          <div class="logo-container">
            <div class="logo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
            </div>
            <div class="brand-text">
              <h1>AulagIA</h1>
              <p>Sua aula com toque mágico</p>
            </div>
          </div>
        </div>

        <!-- Rodapé - Visível em todas as páginas -->
        <div class="footer">
          ${getFooterText()}
        </div>

        <div class="${contentClass}">
          ${content}
        </div>
      </div>
    `;
  };

  const renderEditableContent = () => {
    if (!editedMaterial) return null;

    try {
      const selectedTemplateId = getDefaultTemplateId(editedMaterial.type);
      const renderedHtml = templateService.renderTemplate(selectedTemplateId, editedMaterial.content);
      
      // Para slides, usar template 4:3 EXATAMENTE como no MaterialPreview
      if (editedMaterial.type === 'slides') {
        const editableHtml = makeContentEditable(renderedHtml);
        
        return (
          <div className="slide-editor w-full h-full overflow-auto bg-gray-50">
            <iframe
              srcDoc={enhanceSlideTemplate(editableHtml)}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                backgroundColor: 'white'
              }}
              title="Slide Editor"
            />
          </div>
        );
      }

      // Para outros tipos, usar template A4 EXATAMENTE como no MaterialPreview
      const editableHtml = makeContentEditable(renderedHtml);
      const wrappedContent = wrapPageContentWithTemplate(editableHtml, true);
      
      return (
        <div className="template-editor w-full h-full overflow-auto bg-gray-50">
          <iframe
            srcDoc={enhanceHtmlWithNewTemplate(wrappedContent)}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              backgroundColor: 'white'
            }}
            title="Material Editor"
          />
        </div>
      );
    } catch (error) {
      console.error('Erro ao renderizar template editável:', error);
      return (
        <div className="error-message p-4 text-center">
          <p className="text-red-600 text-sm">Erro ao carregar o template editável.</p>
        </div>
      );
    }
  };

  if (!editedMaterial) return null;

  // Layout Mobile - EXATAMENTE como no MaterialPreview
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl border-0 p-0 bg-white">
          <div className="h-full flex flex-col">
            {/* Header */}
            <SheetHeader className="p-4 pb-3 border-b bg-white rounded-t-3xl flex-shrink-0">
              <SheetTitle className="text-lg font-bold text-center flex items-center justify-center gap-2">
                <Edit3 className="h-5 w-5" />
                Editar Material
              </SheetTitle>
            </SheetHeader>
            
            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {renderEditableContent()}
            </div>
            
            {/* Action Buttons */}
            <div className="p-4 space-y-3 bg-white border-t flex-shrink-0 rounded-b-3xl">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                  className="rounded-xl"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="rounded-xl"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Layout Desktop - EXATAMENTE como no MaterialPreview
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 flex rounded-2xl">
        <div className="flex-1 overflow-hidden rounded-l-2xl">
          {renderEditableContent()}
        </div>
        
        {/* Sidebar com botões */}
        <div className="w-80 bg-gray-50 border-l flex flex-col rounded-r-2xl">
          <DialogHeader className="p-6 pb-4 border-b bg-white rounded-tr-2xl">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <Edit3 className="h-5 w-5" />
                Editar Material
              </DialogTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="rounded-lg"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="p-6 space-y-4">
            <div className="text-sm text-gray-600 space-y-2">
              <h3 className="font-semibold">Material</h3>
              <div>
                <span className="font-medium">Título:</span>
                <Input
                  value={editedMaterial.title}
                  onChange={(e) => setEditedMaterial({ ...editedMaterial, title: e.target.value })}
                  className="mt-1 border-dashed border-2 border-blue-300 hover:border-blue-500 focus:border-blue-600 bg-blue-50 hover:bg-blue-100 focus:bg-white transition-colors"
                />
              </div>
              <div>
                <span className="font-medium">Disciplina:</span>
                <Input
                  value={editedMaterial.subject}
                  onChange={(e) => setEditedMaterial({ ...editedMaterial, subject: e.target.value })}
                  className="mt-1 border-dashed border-2 border-blue-300 hover:border-blue-500 focus:border-blue-600 bg-blue-50 hover:bg-blue-100 focus:bg-white transition-colors"
                />
              </div>
              <div>
                <span className="font-medium">Turma:</span>
                <Input
                  value={editedMaterial.grade}
                  onChange={(e) => setEditedMaterial({ ...editedMaterial, grade: e.target.value })}
                  className="mt-1 border-dashed border-2 border-blue-300 hover:border-blue-500 focus:border-blue-600 bg-blue-50 hover:bg-blue-100 focus:bg-white transition-colors"
                />
              </div>
            </div>
          </div>
          
          <div className="p-6 border-t mt-auto rounded-br-2xl space-y-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="w-full rounded-lg"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MaterialInlineEditModal;
