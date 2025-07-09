import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Edit3, ChevronLeft, ChevronRight, FileText, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { materialService, type GeneratedMaterial } from '@/services/materialService';
import { templateService } from '@/services/templateService';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import SlideViewer from './SlideViewer';
import { activityService } from '@/services/activityService';

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
  const [currentPage, setCurrentPage] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [currentHtmlContent, setCurrentHtmlContent] = useState<string>('');

  useEffect(() => {
    if (material && open) {
      setEditedMaterial(JSON.parse(JSON.stringify(material)));
      setCurrentPage(0);
      setCurrentHtmlContent('');
    }
  }, [material, open]);

  // Function to sync content changes from iframe
  const syncContentChanges = (htmlContent: string) => {
    console.log('Syncing content changes from iframe');
    setCurrentHtmlContent(htmlContent);
    
    if (editedMaterial) {
      // Extract the content from the HTML and update the material
      const updatedMaterial = { ...editedMaterial };
      
      // For now, we'll store the raw HTML content
      // In a more sophisticated implementation, you might parse this back to structured data
      if (typeof updatedMaterial.content === 'string') {
        updatedMaterial.content = htmlContent;
      } else {
        // If content is an object, we need to preserve its structure
        // but update the rendered content
        updatedMaterial.content = {
          ...updatedMaterial.content,
          renderedHtml: htmlContent
        };
      }
      
      setEditedMaterial(updatedMaterial);
      console.log('Material content updated with changes');
    }
  };

  // Make the sync function available to iframe
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).syncContentChanges = syncContentChanges;
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).syncContentChanges;
      }
    };
  }, [editedMaterial]);

  const handleSave = async () => {
    if (!editedMaterial) return;

    setLoading(true);
    try {
      // If we have HTML content changes, make sure they're reflected in the material
      let materialToSave = editedMaterial;
      
      if (currentHtmlContent) {
        materialToSave = {
          ...editedMaterial,
          content: typeof editedMaterial.content === 'string' 
            ? currentHtmlContent 
            : { ...editedMaterial.content, renderedHtml: currentHtmlContent }
        };
        console.log('Saving material with updated HTML content');
      }

      const success = await materialService.updateMaterial(materialToSave.id, materialToSave);
      if (success) {
        toast.success('Material atualizado com sucesso!');
        activityService.addActivity({
          type: 'updated',
          title: materialToSave.title,
          description: `Material editado: ${materialToSave.title} (${materialToSave.type})`,
          materialType: materialToSave.type,
          materialId: materialToSave.id,
          subject: materialToSave.subject,
          grade: materialToSave.grade
        });
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
        <div class="shape-circle purple"></div>
        <div class="shape-circle blue"></div>

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

        <div class="footer">
          ${getFooterText()}
        </div>

        <div class="${contentClass}">
          ${content}
        </div>
      </div>
    `;
  };

  const splitContentIntoPages = (htmlContent: string): string[] => {
    console.log('Starting optimized page split for:', editedMaterial?.type);
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    if (editedMaterial?.type === 'atividade' || editedMaterial?.type === 'avaliacao') {
      const pages: string[] = [];
      const questions = tempDiv.querySelectorAll('.questao-container, .question');
      
      if (questions.length === 0) {
        return [htmlContent];
      }

      const header = tempDiv.querySelector('.header-section')?.outerHTML || '';
      const instructions = tempDiv.querySelector('.instructions-section')?.outerHTML || '';
      const questionsPerPage = 4;
      let questionIndex = 0;

      while (questionIndex < questions.length) {
        const isFirstPage = pages.length === 0;
        const questionsForPage = [];
        
        for (let i = 0; i < questionsPerPage && questionIndex < questions.length; i++) {
          questionsForPage.push(questions[questionIndex]);
          questionIndex++;
        }

        let pageContent = '';
        if (isFirstPage) {
          pageContent += editedMaterial.type === 'atividade' ? '<h2>ATIVIDADE</h2>' : '<h2>AVALIAÇÃO</h2>';
          
          pageContent += `
            <table>
              <tr>
                <th>Escola:</th>
                <td>_________________________________</td>
                <th>Data:</th>
                <td>${new Date().toLocaleDateString('pt-BR')}</td>
              </tr>
              <tr>
                <th>Disciplina:</th>
                <td>${editedMaterial.subject || '[DISCIPLINA]'}</td>
                <th>Série/Ano:</th>
                <td>${editedMaterial.grade || '[SERIE_ANO]'}</td>
              </tr>
              <tr>
                <th>Aluno(a):</th>
                <td class="student-info-cell">____________________________________________</td>
                <th>${editedMaterial.type === 'avaliacao' ? 'NOTA:' : 'BNCC:'}</th>
                <td class="student-info-cell ${editedMaterial.type === 'avaliacao' ? 'nota-highlight-cell' : ''}">${editedMaterial.type === 'avaliacao' ? '' : '{bncc}'}</td>
              </tr>
            </table>
          `;
          
          pageContent += `
            <div class="instructions">
              <strong>${editedMaterial.title}:</strong><br>
              ${instructions || (editedMaterial.type === 'avaliacao' ? 'Leia com atenção cada questão e escolha a alternativa correta ou responda de forma completa.' : 'Leia atentamente cada questão e responda de acordo com o solicitado.')}
            </div>
          `;
        }
        
        questionsForPage.forEach(question => {
          pageContent += question.outerHTML;
        });

        pages.push(wrapPageContentWithTemplate(pageContent, isFirstPage));
      }
      
      return pages.length > 0 ? pages : [htmlContent];
    }

    if (editedMaterial?.type === 'plano-de-aula') {
      const sections = tempDiv.querySelectorAll('.section');
      if (sections.length <= 1) {
        return [htmlContent];
      }

      const pages: string[] = [];
      const sectionsPerPage = 3;
      let sectionIndex = 0;

      const header = tempDiv.querySelector('.header-section')?.outerHTML || '';
      
      while (sectionIndex < sections.length) {
        const isFirstPage = pages.length === 0;
        const sectionsForPage = [];
        
        for (let i = 0; i < sectionsPerPage && sectionIndex < sections.length; i++) {
          sectionsForPage.push(sections[sectionIndex]);
          sectionIndex++;
        }

        let pageContent = '';
        if (isFirstPage) {
          pageContent += header;
        }
        
        sectionsForPage.forEach(section => {
          pageContent += section.outerHTML;
        });

        pages.push(wrapPageContentWithTemplate(pageContent, isFirstPage));
      }
      
      return pages.length > 0 ? pages : [htmlContent];
    }

    return [htmlContent];
  };

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
            pointer-events: none !important;
          }
          .header .logo svg {
            width: 16px;
            height: 16px;
            stroke: white;
            fill: none;
            stroke-width: 2;
            pointer-events: none !important;
          }
          .header .brand-text {
            display: flex;
            flex-direction: column;
            justify-content: center;
            pointer-events: none !important;
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
            pointer-events: none !important;
          }
          .header .brand-text p {
            font-size: 8px;
            color: #6b7280;
            margin: -1px 0 0 0;
            font-family: 'Inter', sans-serif;
            line-height: 1;
            font-weight: 400;
            pointer-events: none !important;
          }
          
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
            position: relative;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 15px;
            background: #fafafa;
          }
          
          .question-delete-btn {
            position: absolute;
            top: 8px;
            right: 8px;
            width: 24px;
            height: 24px;
            background: #ef4444;
            color: white;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            opacity: 0.7;
            transition: opacity 0.2s ease;
            z-index: 10;
          }
          
          .question-delete-btn:hover {
            opacity: 1;
            background: #dc2626;
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
            pointer-events: none !important;
          }

          .answer-lines {
            border-bottom: 1px solid #d1d5db;
            margin-bottom: 8px;
            height: 20px;
            width: 100%;
            display: block;
          }
          .answer-lines:last-child {
            margin-bottom: 0;
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
            font-size: 0.9rem;
          }

          .fill-blank {
            display: inline-block;
            border-bottom: 2px solid #4338ca;
            min-width: 100px;
            height: 20px;
            margin: 0 5px;
          }

          .image-space, .math-space {
            border: 2px dashed #d1d5db;
            min-height: 120px;
            margin: 15px 0;
            padding: 15px;
            border-radius: 6px;
            background: #fafafa;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #9ca3af;
            font-size: 0.85rem;
          }
          .math-space {
            min-height: 80px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
          }
          
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
            pointer-events: none !important;
          }

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
          
          .section {
            margin-bottom: 25px;
            page-break-inside: avoid;
          }
          
          .section h3 {
            color: #4f46e5;
            font-size: 1.1rem;
            margin-bottom: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .info-table {
            width: 100%;
            margin-bottom: 20px;
            border-collapse: collapse;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
          
          .info-table th {
            background: #f3f4f6;
            color: #1f2937;
            font-weight: 600;
            text-align: left;
            padding: 8px 12px;
            font-size: 0.85rem;
            width: 25%;
          }
          
          .info-table td {
            background: #ffffff;
            padding: 8px 12px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 0.85rem;
          }
          
          .objectives-list, .skills-list {
            list-style: none;
            padding: 0;
            margin: 0;
          }
          
          .objectives-list li, .skills-list li {
            margin-bottom: 8px;
            padding-left: 20px;
            position: relative;
            font-size: 0.9rem;
            line-height: 1.4;
          }
          
          .objectives-list li:before {
            content: "•";
            color: #3b82f6;
            font-weight: bold;
            position: absolute;
            left: 0;
          }
          
          .skills-list li:before {
            content: "•";
            color: #10b981;
            font-weight: bold;
            position: absolute;
            left: 0;
          }
          
          .development-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
          
          .development-table th {
            background: #f3f4f6;
            color: #1f2937;
            font-weight: 600;
            text-align: left;
            padding: 10px 12px;
            font-size: 0.85rem;
          }
          
          .development-table td {
            background: #ffffff;
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 0.85rem;
            vertical-align: top;
          }
          
          .resources-list {
            list-style: none;
            padding: 0;
            margin: 0;
          }
          
          .resources-list li {
            margin-bottom: 6px;
            padding-left: 20px;
            position: relative;
            font-size: 0.9rem;
          }
          
          .resources-list li:before {
            content: "•";
            color: #f59e0b;
            font-weight: bold;
            position: absolute;
            left: 0;
          }
          
          .evaluation-text {
            font-size: 0.9rem;
            line-height: 1.5;
            text-align: justify;
            margin-top: 10px;
          }
          
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
            .question-delete-btn {
              display: none !important;
            }
          }
        </style>
        <script>
          document.addEventListener('DOMContentLoaded', function() {
            const questions = document.querySelectorAll('.questao-container, .question');
            questions.forEach((question, index) => {
              const deleteBtn = document.createElement('button');
              deleteBtn.className = 'question-delete-btn';
              deleteBtn.innerHTML = '×';
              deleteBtn.title = 'Excluir questão';
              deleteBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                if (confirm('Tem certeza que deseja excluir esta questão?')) {
                  question.remove();
                  const remainingQuestions = document.querySelectorAll('.questao-container, .question');
                  remainingQuestions.forEach((q, i) => {
                    const questionHeader = q.querySelector('.questao-numero, .question-header');
                    if (questionHeader) {
                      questionHeader.textContent = 'Questão ' + (i + 1);
                    }
                  });
                  
                  if (window.parent && window.parent.syncContentChanges) {
                    window.parent.syncContentChanges(document.body.innerHTML);
                  }
                }
              };
              question.appendChild(deleteBtn);
            });

            const editableFields = document.querySelectorAll('.editable-field');
            editableFields.forEach(field => {
              field.addEventListener('input', function() {
                if (window.parent && window.parent.syncContentChanges) {
                  window.parent.syncContentChanges(document.body.innerHTML);
                }
              });
              
              field.addEventListener('blur', function() {
                if (window.parent && window.parent.syncContentChanges) {
                  window.parent.syncContentChanges(document.body.innerHTML);
                }
              });
            });
          });
        </script>
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
    `;
  };

  const makeContentEditable = (htmlContent: string): string => {
    let editableHtml = htmlContent;

    // Make table cells editable (excluding footer links and blank fields)
    editableHtml = editableHtml.replace(
      /<td([^>]*)>([^<]+)<\/td>/g,
      (match, attrs, content) => {
        if (content.includes('aulagia.com.br') || 
            content.includes('AulagIA') || 
            content.includes('_____')) {
          return match;
        }
        return `<td${attrs}><span class="editable-field" contenteditable="true">${content}</span></td>`;
      }
    );

    // Make headers editable (excluding brand headers)
    editableHtml = editableHtml.replace(
      /<h([1-6])([^>]*)>([^<]*)<\/h([1-6])>/g,
      (match, tag1, attrs, content, tag2) => {
        if (content.includes('AulagIA') || content.includes('AVALIAÇÃO') || content.includes('ATIVIDADE')) return match;
        return `<h${tag1}${attrs}><span class="editable-field" contenteditable="true">${content}</span></h${tag1}>`;
      }
    );

    // Make list items editable
    editableHtml = editableHtml.replace(
      /<li([^>]*)>([^<]*)<\/li>/g,
      (match, attrs, content) => {
        if (content.trim() === '') return match;
        return `<li${attrs}><span class="editable-field" contenteditable="true">${content}</span></li>`;
      }
    );

    // Make development table cells editable
    editableHtml = editableHtml.replace(
      /<td([^>]*class="[^"]*development[^"]*"[^>]*)>([^<]*)<\/td>/g,
      '<td$1><span class="editable-field" contenteditable="true">$2</span></td>'
    );

    // Make question text editable
    editableHtml = editableHtml.replace(
      /<div([^>]*class="[^"]*questao-enunciado[^"]*"[^>]*)>([^<]*)<\/div>/g,
      '<div$1><span class="editable-field" contenteditable="true">$2</span></div>'
    );

    editableHtml = editableHtml.replace(
      /<div([^>]*class="[^"]*question-text[^"]*"[^>]*)>([^<]*)<\/div>/g,
      '<div$1><span class="editable-field" contenteditable="true">$2</span></div>'
    );

    // Make question headers editable
    editableHtml = editableHtml.replace(
      /(<div[^>]*class="[^"]*question-header[^"]*"[^>]*>Questão \d+<\/div>\s*)([^<]+)(<\/div>|<div)/g,
      '$1<span class="editable-field" contenteditable="true">$2</span>$3'
    );

    editableHtml = editableHtml.replace(
      /(<div[^>]*class="[^"]*questao-container[^"]*"[^>]*>[\s\S]*?<div[^>]*class="[^"]*questao-numero[^"]*"[^>]*>Questão \d+<\/div>\s*)([^<]+?)(\s*<div)/g,
      '$1<span class="editable-field" contenteditable="true">$2</span>$3'
    );

    // Make True/False options editable
    editableHtml = editableHtml.replace(
      /(Verdadeiro|Falso)(?=\s*<\/)/g,
      '<span class="editable-field" contenteditable="true">$1</span>'
    );

    editableHtml = editableHtml.replace(
      /(\(\s*\)\s*)(Verdadeiro|Falso)/g,
      '$1<span class="editable-field" contenteditable="true">$2</span>'
    );

    // Protect already processed spans
    const protectedSpans: string[] = [];
    editableHtml = editableHtml.replace(
      /<span[^>]*class="[^"]*editable-field[^"]*"[^>]*>[^<]*<\/span>/g,
      (match) => {
        const index = protectedSpans.length;
        protectedSpans.push(match);
        return `{{PROTECTED_SPAN_${index}}}`;
      }
    );

    // Make multiple choice options editable - structured options
    editableHtml = editableHtml.replace(
      /<div([^>]*class="[^"]*opcao[^"]*"[^>]*>)\s*(<span[^>]*class="[^"]*opcao-letra[^"]*"[^>]*>[A-E]\)<\/span>)\s*([^<]+?)\s*<\/div>/g,
      '<div$1$2 <span class="editable-field" contenteditable="true">$3</span></div>'
    );

    editableHtml = editableHtml.replace(
      /<div([^>]*class="[^"]*option[^"]*"[^>]*>)\s*(<span[^>]*class="[^"]*option-letter[^"]*"[^>]*>[A-E]\)<\/span>)\s*([^<]+?)\s*<\/div>/g,
      '<div$1$2 <span class="editable-field" contenteditable="true">$3</span></div>'
    );

    // Make multiple choice options editable - simple text patterns
    editableHtml = editableHtml.replace(
      /^(\s*)([A-E]\))\s+([^<\n]+?)$/gm,
      (match, indent, letter, text) => {
        if (text.trim().length > 2 && !text.includes('editable-field') && !text.includes('<span')) {
          return `${indent}${letter} <span class="editable-field" contenteditable="true">${text.trim()}</span>`;
        }
        return match;
      }
    );

    // Make bold letter options editable
    editableHtml = editableHtml.replace(
      /(<(?:strong|b)>[A-E]\)<\/(?:strong|b)>)\s*([^<\n]+)/g,
      (match, letter, text) => {
        if (text.trim().length > 2 && !text.includes('editable-field')) {
          return `${letter} <span class="editable-field" contenteditable="true">${text.trim()}</span>`;
        }
        return match;
      }
    );

    // Make paragraph options editable
    editableHtml = editableHtml.replace(
      /<p([^>]*)>([A-E]\))\s*([^<]+)<\/p>/g,
      '<p$1>$2 <span class="editable-field" contenteditable="true">$3</span></p>'
    );

    // Make list item options editable
    editableHtml = editableHtml.replace(
      /<li([^>]*)>([A-E]\))\s*([^<]+)<\/li>/g,
      '<li$1>$2 <span class="editable-field" contenteditable="true">$3</span></li>'
    );

    // Make break-separated options editable - FIXED REGEX
    editableHtml = editableHtml.replace(
      /(<br\s*\/?>)\s*([A-E]\))\s+([^<]+?)(?=\s*(?:<br|<\/|$))/g,
      (match, br, letter, text) => {
        if (text.trim().length > 2 && !text.includes('editable-field')) {
          return `${br}${letter} <span class="editable-field" contenteditable="true">${text.trim()}</span>`;
        }
        return match;
      }
    );

    // Restore protected spans
    protectedSpans.forEach((span, index) => {
      editableHtml = editableHtml.replace(`{{PROTECTED_SPAN_${index}}}`, span);
    });

    // Make other elements editable
    editableHtml = editableHtml.replace(
      /<div([^>]*class="[^"]*matching-item[^"]*"[^>]*)>([^<]*)<\/div>/g,
      '<div$1><span class="editable-field" contenteditable="true">$2</span></div>'
    );

    editableHtml = editableHtml.replace(
      /<div([^>]*class="[^"]*evaluation-text[^"]*"[^>]*)>([^<]*)<\/div>/g,
      '<div$1><span class="editable-field" contenteditable="true">$2</span></div>'
    );

    editableHtml = editableHtml.replace(
      /<div([^>]*class="[^"]*instructions[^"]*"[^>]*)>(<strong>[^<]*<\/strong><br>)([^<]*)<\/div>/g,
      '<div$1>$2<span class="editable-field" contenteditable="true">$3</span></div>'
    );

    editableHtml = editableHtml.replace(
      /(Leia atentamente cada questão e responda de acordo com o solicitado\.|Leia com atenção cada questão e escolha a alternativa correta ou responda de forma completa\.)/g,
      '<span class="editable-field" contenteditable="true">$1</span>'
    );

    editableHtml = editableHtml.replace(
      /(<h3[^>]*>RECURSOS DIDÁTICOS<\/h3>\s*)([^<]+)/g,
      '$1<span class="editable-field" contenteditable="true">$2</span>'
    );

    editableHtml = editableHtml.replace(
      /(<h3[^>]*>AVALIAÇÃO<\/h3>\s*)([^<]+)/g,
      '$1<span class="editable-field" contenteditable="true">$2</span>'
    );

    editableHtml = editableHtml.replace(
      /<p([^>]*)>([^<]+)<\/p>/g,
      (match, attrs, content) => {
        if (content.includes('aulagia.com.br') || 
            content.includes('AulagIA') || 
            content.includes('Sua aula com toque mágico')) {
          return match;
        }
        return `<p${attrs}><span class="editable-field" contenteditable="true">${content}</span></p>`;
      }
    );

    editableHtml = editableHtml.replace(
      /<h1([^>]*)>([^<]*)<\/h1>/g,
      (match, attrs, content) => {
        if (content.includes('AulagIA')) return match;
        return `<h1${attrs}><span class="editable-field" contenteditable="true">${content}</span></h1>`;
      }
    );

    editableHtml = editableHtml.replace(
      /<h2([^>]*)>([^<]*)<\/h2>/g,
      (match, attrs, content) => {
        if (content.includes('AulagIA') || content.includes('APRESENTAÇÃO')) return match;
        return `<h2${attrs}><span class="editable-field" contenteditable="true">${content}</span></h2>`;
      }
    );

    editableHtml = editableHtml.replace(
      /<div([^>]*class="[^"]*subtitle[^"]*"[^>]*)>([^<]*)<\/div>/g,
      '<div$1><span class="editable-field" contenteditable="true">$2</span></div>'
    );

    editableHtml = editableHtml.replace(
      /Apresentado por:/g,
      '<span class="editable-field" contenteditable="true">Apresentado por:</span>'
    );

    editableHtml = editableHtml.replace(
      /<div([^>]*class="[^"]*professor[^"]*"[^>]*)>([^<]*)<\/div>/g,
      '<div$1><span class="editable-field" contenteditable="true">$2</span></div>'
    );

    editableHtml = editableHtml.replace(
      /<div([^>]*class="[^"]*escola[^"]*"[^>]*)>([^<]*)<\/div>/g,
      '<div$1><span class="editable-field" contenteditable="true">$2</span></div>'
    );

    editableHtml = editableHtml.replace(
      /<div([^>]*class="[^"]*keywords[^"]*"[^>]*)>([^<]*)<\/div>/g,
      '<div$1><span class="editable-field" contenteditable="true">$2</span></div>'
    );

    editableHtml = editableHtml.replace(
      /<div([^>]*class="[^"]*slide-content[^"]*"[^>]*)>([^<]*)<\/div>/g,
      '<div$1><span class="editable-field" contenteditable="true">$2</span></div>'
    );

    editableHtml = editableHtml.replace(
      /(RECURSOS DIDÁTICOS<\/h3>\s*)([\s\S]*?)(<h3|<div class="footer"|$)/g,
      (match, title, content, after) => {
        if (content.trim() && !content.includes('<')) {
          return title + '<span class="editable-field" contenteditable="true">' + content.trim() + '</span>' + after;
        }
        return match;
      }
    );

    editableHtml = editableHtml.replace(
      /(AVALIAÇÃO<\/h3>\s*)([\s\S]*?)(<div class="footer"|$)/g,
      (match, title, content, after) => {
        if (content.trim() && !content.includes('<')) {
          return title + '<span class="editable-field" contenteditable="true">' + content.trim() + '</span>' + after;
        }
        return match;
      }
    );

    // Remove editable spans from footer text
    editableHtml = editableHtml.replace(
      /<span class="editable-field" contenteditable="true">([^<]*Sua aula com toque mágico[^<]*)<\/span>/g,
      '$1'
    );

    return editableHtml;
  };

  const renderMaterialWithSameSystem = () => {
    if (!editedMaterial) return null;

    const selectedTemplateId = getDefaultTemplateId(editedMaterial.type);
    
    try {
      const renderedHtml = templateService.renderTemplate(selectedTemplateId, editedMaterial.content);
      
      if (editedMaterial.type === 'slides') {
        return <SlideViewer htmlContent={makeContentEditable(renderedHtml)} material={editedMaterial} />;
      }
      
      const pages = splitContentIntoPages(renderedHtml);
      
      if (pages.length === 1) {
        return (
          <iframe
            ref={iframeRef}
            srcDoc={enhanceHtmlWithNewTemplate(makeContentEditable(pages[0]))}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              backgroundColor: 'white'
            }}
            title="Material Editor"
          />
        );
      }

      return (
        <div className="multi-page-container h-full flex flex-col relative">
          {!isMobile && (
            <div className="flex items-center justify-between p-4 bg-white border-b shadow-sm">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-700">
                  Página {currentPage + 1} de {pages.length}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className="flex items-center space-x-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Anterior</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(pages.length - 1, currentPage + 1))}
                  disabled={currentPage === pages.length - 1}
                  className="flex items-center space-x-1"
                >
                  <span>Próxima</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {isMobile && (
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-50 bg-white/95 backdrop-blur-sm px-8 py-4 rounded-full shadow-xl border-2">
              <div className="flex items-center space-x-4">
                <FileText className="w-8 h-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-700">
                  {currentPage + 1} / {pages.length}
                </span>
              </div>
            </div>
          )}

          {isMobile && pages.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="absolute left-6 top-1/2 transform -translate-y-1/2 z-50 w-24 h-24 rounded-full shadow-2xl bg-white/95 backdrop-blur-sm disabled:opacity-30 border-3"
              >
                <ChevronLeft className="w-12 h-12" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(Math.min(pages.length - 1, currentPage + 1))}
                disabled={currentPage === pages.length - 1}
                className="absolute right-6 top-1/2 transform -translate-y-1/2 z-50 w-24 h-24 rounded-full shadow-2xl bg-white/95 backdrop-blur-sm disabled:opacity-30 border-3"
              >
                <ChevronRight className="w-12 h-12" />
              </Button>
            </>
          )}

          <div className="flex-1 overflow-hidden">
            <iframe
              ref={iframeRef}
              srcDoc={enhanceHtmlWithNewTemplate(makeContentEditable(pages[currentPage]))}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                backgroundColor: 'white'
              }}
              title={`Material Editor - Página ${currentPage + 1}`}
            />
          </div>
        </div>
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

  if (!editedMaterial) return null;

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl border-0 p-0 bg-white">
          <div className="h-full flex flex-col">
            <SheetHeader className="p-4 pb-3 border-b bg-white rounded-t-3xl flex-shrink-0">
              <SheetTitle className="text-lg font-bold text-center">
                {editedMaterial.title}
              </SheetTitle>
              <div className="text-sm text-gray-600 text-center">
                Edição • {editedMaterial.subject} • {editedMaterial.grade}
              </div>
            </SheetHeader>
            
            <div className="flex-1 p-4 overflow-hidden">
              <div className="h-full border rounded-2xl bg-gray-50 overflow-hidden shadow-inner">
                <div 
                  className="origin-top-left transform scale-[0.3] w-[333%] h-[333%] overflow-hidden"
                  style={{ transformOrigin: '0 0' }}
                >
                  {renderMaterialWithSameSystem()}
                </div>
              </div>
            </div>
            
            <div className="p-4 space-y-3 bg-white border-t flex-shrink-0 rounded-b-3xl">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                  className="text-xs rounded-xl"
                >
                  <X className="h-3 w-3 mr-1" />
                  Cancelar
                </Button>
                
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="text-xs rounded-xl bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="h-3 w-3 mr-1" />
                  {loading ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 flex rounded-2xl">
        <div className="flex-1 overflow-hidden rounded-l-2xl">
          {renderMaterialWithSameSystem()}
        </div>
        
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
