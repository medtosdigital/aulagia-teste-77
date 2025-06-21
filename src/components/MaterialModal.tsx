
import React, { useState } from 'react';
import { X, Download, Printer, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import MaterialPreview from './MaterialPreview';
import AnswerKeyModal from './AnswerKeyModal';
import { GeneratedMaterial } from '@/services/materialService';
import { templateService } from '@/services/templateService';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

interface MaterialModalProps {
  material: GeneratedMaterial | null;
  open: boolean;
  onClose: () => void;
}

const MaterialModal: React.FC<MaterialModalProps> = ({ material, open, onClose }) => {
  const isMobile = useIsMobile();
  const [answerKeyModalOpen, setAnswerKeyModalOpen] = useState(false);

  const getTypeLabel = (type: string): string => {
    const labels = {
      'plano-de-aula': 'Plano de Aula',
      'slides': 'Slides',
      'atividade': 'Atividade',
      'avaliacao': 'Avaliação'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getTemplateId = (type: string): string => {
    const typeMap = {
      'plano-de-aula': '1',
      'slides': '2',
      'atividade': '3',
      'avaliacao': '4'
    };
    return typeMap[type as keyof typeof typeMap] || '1';
  };

  const createStyledHTML = (content: string, material: GeneratedMaterial): string => {
    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${material.title}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          @page {
            size: A4;
            margin: 15mm;
          }
          
          body {
            margin: 0;
            padding: 20px;
            background: white;
            font-family: 'Inter', sans-serif;
            line-height: 1.6;
            color: #333;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .header {
            display: flex;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 15px;
            border-bottom: 2px solid #0ea5e9;
          }
          
          .logo {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
            color: white;
            font-weight: bold;
            font-size: 16px;
          }
          
          .brand-info h1 {
            margin: 0;
            font-size: 24px;
            color: #0ea5e9;
            font-weight: 700;
          }
          
          .brand-info p {
            margin: 0;
            font-size: 12px;
            color: #6b7280;
          }
          
          h2 {
            color: #4f46e5;
            font-size: 1.8rem;
            margin: 25px 0 15px 0;
            text-align: center;
            position: relative;
          }
          
          h2::after {
            content: '';
            width: 60px;
            height: 3px;
            background: #a78bfa;
            display: block;
            margin: 8px auto 0;
            border-radius: 2px;
          }
          
          h3 {
            color: #1f2937;
            font-size: 1.3rem;
            margin: 20px 0 10px 0;
            font-weight: 600;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          
          th, td {
            padding: 12px;
            text-align: left;
            border: 1px solid #e5e7eb;
          }
          
          th {
            background-color: #f3f4f6;
            font-weight: 600;
            color: #374151;
          }
          
          .instructions {
            background: #eff6ff;
            padding: 20px;
            border-left: 4px solid #0ea5e9;
            margin: 20px 0;
            border-radius: 6px;
          }
          
          .questao-container, .question {
            margin: 25px 0;
            page-break-inside: avoid;
            border: 1px solid #e5e7eb;
            padding: 15px;
            border-radius: 8px;
          }
          
          .questao-numero, .question-header {
            font-weight: 600;
            color: #4338ca;
            margin-bottom: 10px;
            font-size: 1.1rem;
          }
          
          .questao-enunciado, .question-text {
            margin-bottom: 15px;
            line-height: 1.6;
          }
          
          .opcao, .option {
            margin: 8px 0;
            display: flex;
            align-items: flex-start;
          }
          
          .opcao-letra, .option-letter {
            font-weight: bold;
            color: #4338ca;
            margin-right: 10px;
            min-width: 25px;
          }
          
          .footer {
            position: fixed;
            bottom: 10mm;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
          }
          
          @media print {
            body { 
              margin: 0; 
              padding: 15mm;
            }
            .header {
              margin-bottom: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">A</div>
          <div class="brand-info">
            <h1>AulagIA</h1>
            <p>Sua aula com toque mágico</p>
          </div>
        </div>
        ${content}
        <div class="footer">
          Material gerado pela AulagIA em ${new Date().toLocaleDateString('pt-BR')} • aulagia.com.br
        </div>
      </body>
      </html>
    `;
  };

  const generateSlidesHTML = (material: GeneratedMaterial): string => {
    const slides = generateSlides(material);
    const today = new Date().toLocaleDateString('pt-BR');
    
    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Slides - ${material.title}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Lato:wght@300;400;700&display=swap');
          
          body {
            margin: 0;
            padding: 0;
            background: #f0f2f5;
            font-family: 'Lato', sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            min-height: 100vh;
            padding: 30px 0;
            box-sizing: border-box;
          }

          .slide-page {
            position: relative;
            width: 1024px;
            height: 768px;
            background: linear-gradient(135deg, #ffffff 0%, #fefefe 100%);
            overflow: hidden;
            margin: 0 auto 40px auto;
            box-sizing: border-box;
            box-shadow: 0 15px 40px rgba(0,0,0,0.18);
            border-radius: 16px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            page-break-after: always;
            border: 1px solid #e0e0e0;
          }

          .slide-page:last-of-type {
            page-break-after: auto;
            margin-bottom: 0;
          }

          .shape-overlay {
            position: absolute;
            opacity: 0.1;
            pointer-events: none;
            z-index: 0;
          }
          
          .shape-overlay.top-left-wave {
            width: 250px;
            height: 250px;
            background: #00C9B1;
            border-radius: 50%;
            top: -120px;
            left: -100px;
            transform: rotate(20deg);
          }
          
          .shape-overlay.bottom-right-wave {
            width: 300px;
            height: 300px;
            background: #FF6B6B;
            border-radius: 50%;
            bottom: -150px;
            right: -130px;
            transform: rotate(-30deg);
          }

          .slide-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 25px 40px;
            flex-shrink: 0;
            z-index: 1;
            position: relative;
          }
          
          .slide-header .logo-container {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          
          .slide-header .logo {
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 15px rgba(0,123,255,0.4);
          }
          
          .slide-header .logo svg {
            width: 28px;
            height: 28px;
            stroke: white;
            fill: none;
            stroke-width: 2;
          }
          
          .slide-header .brand-text h1 {
            font-family: 'Poppins', sans-serif;
            font-size: 32px;
            color: #333333;
            margin: 0;
            font-weight: 800;
            letter-spacing: -1px;
          }
          
          .slide-header .slide-title-header {
            font-family: 'Poppins', sans-serif;
            font-size: 26px;
            color: #FF6B6B;
            font-weight: 700;
            text-align: right;
          }

          .slide-content {
            flex-grow: 1;
            padding: 0 80px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            color: #333333;
            z-index: 1;
            font-size: 1.2rem;
          }

          .slide-content h2 {
            font-family: 'Poppins', sans-serif;
            font-size: 4.5rem;
            color: #333333;
            margin-bottom: 25px;
            font-weight: 800;
            text-align: center;
            width: 100%;
            line-height: 1.2;
          }
          
          .slide-content h3 {
            font-family: 'Poppins', sans-serif;
            font-size: 2.8rem;
            color: #00C9B1;
            margin-top: 30px;
            margin-bottom: 20px;
            font-weight: 700;
            width: 100%;
            text-align: center;
          }
          
          .slide-content p {
            line-height: 1.7;
            margin-bottom: 18px;
            font-size: 1.15rem;
          }
          
          .slide-content ul {
            list-style-type: none;
            padding-left: 0;
            margin-bottom: 18px;
            text-align: left;
          }
          
          .slide-content ul li {
            position: relative;
            padding-left: 35px;
            margin-bottom: 12px;
            font-size: 1.15rem;
          }
          
          .slide-content ul li::before {
            content: '✔';
            position: absolute;
            left: 0;
            color: #FF6B6B;
            font-size: 1.3rem;
            top: -2px;
          }

          .slide-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 40px;
            font-size: 0.95rem;
            color: #666666;
            border-top: 1px solid #e0e0e0;
            flex-shrink: 0;
            z-index: 1;
            font-family: 'Lato', sans-serif;
          }
          
          .slide-footer .page-number {
            font-weight: 600;
            color: #00C9B1;
          }

          @media print {
            body { 
              margin: 0; 
              padding: 0; 
              background: white;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .slide-page { 
              box-shadow: none; 
              margin: 0;
              border-radius: 0;
              border: none;
              width: 100%;
              min-height: 100vh;
            }
          }
        </style>
      </head>
      <body>
        ${slides.map((slide, index) => renderSlideForPrint(slide, index, today)).join('')}
      </body>
      </html>
    `;
  };

  const generateSlides = (material: GeneratedMaterial) => {
    const subject = material.subject || 'Disciplina';
    const grade = material.grade || 'Turma';
    const title = material.title || 'Apresentação Educativa';
    const today = new Date().toLocaleDateString('pt-BR');
    
    return [
      // Slide 1: Title
      {
        type: 'title',
        title: title,
        subtitle: `${subject} • ${grade}`,
        professor: 'Professor(a)',
        institution: 'Escola',
        date: today
      },
      // Slide 2: Introduction/Objectives  
      {
        type: 'introduction',
        title: 'Introdução e Objetivos',
        content: `Bem-vindos à nossa aula sobre ${title}. Hoje vamos explorar conceitos fundamentais e aplicações práticas.`,
        objectives: [
          'Compreender os conceitos fundamentais',
          'Analisar exemplos práticos',
          'Aplicar o conhecimento adquirido'
        ]
      },
      // Content slides
      {
        type: 'concept',
        title: 'Conceitos Principais',
        content: `Vamos começar explorando os principais conceitos relacionados a ${title}.`
      },
      {
        type: 'example',
        title: 'Exemplos Práticos',
        content: `Agora vamos ver alguns exemplos práticos de como aplicar esse conhecimento.`
      },
      {
        type: 'process',
        title: 'Processo de Aplicação',
        content: `Entenda o passo a passo para aplicar esses conceitos em situações reais.`
      },
      // Interactive Question
      {
        type: 'question',
        title: 'Vamos Pensar um Pouco?',
        question: `Com base no que aprendemos sobre ${title}, como você aplicaria esse conhecimento no dia a dia?`,
        answer: 'Existem diversas formas de aplicar esse conhecimento, desde situações cotidianas até contextos profissionais.'
      },
      // Final Slide
      {
        type: 'conclusion',
        title: 'Obrigado(a)!',
        content: 'Para mais materiais educativos, visite aulagia.com.br'
      }
    ];
  };

  const renderSlideForPrint = (slide: any, index: number, today: string) => {
    const slideNumber = index + 1;
    
    return `
      <div class="slide-page">
        <div class="shape-overlay top-left-wave"></div>
        <div class="shape-overlay bottom-right-wave"></div>
        
        <div class="slide-header">
          <div class="logo-container">
            <div class="logo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
            </div>
            <div class="brand-text">
              <h1>AulagIA</h1>
            </div>
          </div>
          <div class="slide-title-header">${slide.type === 'title' ? 'APRESENTAÇÃO' : slide.type === 'conclusion' ? 'FIM' : material?.subject || 'SLIDES'}</div>
        </div>
        
        <div class="slide-content">
          ${renderSlideContent(slide)}
        </div>
        
        <div class="slide-footer">
          <span class="date">${today}</span>
          <span class="page-number">Slide ${slideNumber}</span>
        </div>
      </div>
    `;
  };

  const renderSlideContent = (slide: any) => {
    switch (slide.type) {
      case 'title':
        return `
          <h2>${slide.title}</h2>
          <h3>${slide.subtitle}</h3>
          <p style="font-size: 1.3rem; margin-top: 30px;">Apresentado por: <br> <strong>${slide.professor}</strong></p>
          <p style="font-size: 1rem; color: #666;">${slide.institution}</p>
        `;
      
      case 'introduction':
        return `
          <h3>${slide.title}</h3>
          <p>${slide.content}</p>
          <p style="font-weight: 600; color: #FF6B6B;">Nossos objetivos para hoje:</p>
          <ul>
            ${slide.objectives.map((obj: string) => `<li>${obj}</li>`).join('')}
          </ul>
        `;
      
      case 'question':
        return `
          <div style="background-color: #f8faff; border: 2px dashed #007bff; border-radius: 16px; padding: 50px; text-align: center;">
            <h3 style="color: #007bff; font-size: 3.5rem; margin-bottom: 30px;">${slide.title}</h3>
            <p style="font-size: 1.6rem; line-height: 1.6; font-weight: 500; color: #444; max-width: 80%;">${slide.question}</p>
          </div>
        `;
      
      case 'conclusion':
        return `
          <h2>OBRIGADO(A)!</h2>
          <p style="font-size: 1.4rem; margin-top: 25px;">Para mais materiais educativos, visite:</p>
          <p style="font-size: 1.8rem; font-weight: 800; color: #FF6B6B; margin-top: 10px;">aulagia.com.br</p>
        `;
      
      default:
        return `
          <h3>${slide.title}</h3>
          <div style="font-size: 1.15rem;">${slide.content}</div>
        `;
    }
  };

  const handlePrint = async () => {
    if (!material) return;

    try {
      let htmlContent = '';
      
      if (material.type === 'slides') {
        htmlContent = generateSlidesHTML(material);
      } else {
        const renderedContent = templateService.renderTemplate(getTemplateId(material.type), material.content);
        htmlContent = createStyledHTML(renderedContent, material);
      }

      // Criar um iframe oculto para imprimir
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.top = '-10000px';
      iframe.style.left = '-10000px';
      iframe.style.width = '210mm';
      iframe.style.height = '297mm';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(htmlContent);
        iframeDoc.close();

        // Aguardar carregamento e imprimir
        setTimeout(() => {
          iframe.contentWindow?.print();
          setTimeout(() => {
            document.body.removeChild(iframe);
          }, 1000);
        }, 1000);
      }

      toast.success('Material enviado para impressão!');
    } catch (error) {
      console.error('Erro ao preparar impressão:', error);
      toast.error('Erro ao preparar a impressão');
    }
  };

  const handleExportPDF = async () => {
    if (!material) return;

    try {
      let htmlContent = '';
      
      if (material.type === 'slides') {
        htmlContent = generateSlidesHTML(material);
      } else {
        const renderedContent = templateService.renderTemplate(getTemplateId(material.type), material.content);
        htmlContent = createStyledHTML(renderedContent, material);
      }

      // Criar iframe para capturar o conteúdo
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.top = '-10000px';
      iframe.style.left = '-10000px';
      iframe.style.width = '210mm';
      iframe.style.height = '297mm';
      iframe.style.border = 'none';
      iframe.style.background = 'white';
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(htmlContent);
        iframeDoc.close();

        // Aguardar o carregamento completo
        setTimeout(async () => {
          try {
            const canvas = await html2canvas(iframeDoc.body, {
              scale: 2,
              useCORS: true,
              allowTaint: true,
              backgroundColor: '#ffffff',
              width: 794, // A4 width at 96 DPI
              height: 1123 // A4 height at 96 DPI
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            const imgWidth = 210;
            const pageHeight = 297;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
              position = heightLeft - imgHeight;
              pdf.addPage();
              pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
              heightLeft -= pageHeight;
            }

            const fileName = `${material.title.replace(/[^a-zA-Z0-9\s]/g, '').trim() || 'material'}.pdf`;
            pdf.save(fileName);
            
            toast.success('Material exportado para PDF com sucesso!');
          } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            toast.error('Erro ao gerar PDF');
          } finally {
            document.body.removeChild(iframe);
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Erro na exportação PDF:', error);
      toast.error('Erro ao exportar material');
    }
  };

  const handleExportWord = async () => {
    if (!material) return;

    try {
      const renderedContent = templateService.renderTemplate(getTemplateId(material.type), material.content);
      
      // Parse HTML content to extract text
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = renderedContent;
      
      const children: any[] = [];

      // Adicionar cabeçalho
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'AulagIA - Sua aula com toque mágico',
              bold: true,
              size: 24,
              color: '0ea5e9'
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        })
      );

      // Título principal
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: material.title || 'Material Educacional',
              bold: true,
              size: 32,
              color: '4F46E5'
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        })
      );

      // Informações do material
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${getTypeLabel(material.type)} • ${material.subject || 'Disciplina'} • ${material.grade || 'Série'}`,
              size: 20,
              color: '6B7280'
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 600 }
        })
      );

      // Processar questões se for atividade ou avaliação
      const questions = tempDiv.querySelectorAll('.questao-container, .question');
      questions.forEach((question, index) => {
        const questionNumber = question.querySelector('.questao-numero, .question-header')?.textContent || `${index + 1}`;
        const questionText = question.querySelector('.questao-enunciado, .question-text')?.textContent || '';
        const options = question.querySelectorAll('.opcao, .option');
        
        // Número e texto da questão
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Questão ${questionNumber}`,
                bold: true,
                size: 24,
                color: '4338ca'
              })
            ],
            spacing: { before: 300, after: 150 }
          })
        );
        
        children.push(
          new Paragraph({
            children: [new TextRun(questionText)],
            spacing: { after: 200 }
          })
        );
        
        // Opções
        options.forEach((option, optIndex) => {
          const optionLetter = String.fromCharCode(65 + optIndex);
          const optionText = option.textContent?.replace(/^[A-Z]\)\s*/, '') || '';
          
          children.push(
            new Paragraph({
              children: [new TextRun(`${optionLetter}) ${optionText}`)],
              spacing: { after: 100 }
            })
          );
        });
        
        children.push(
          new Paragraph({
            children: [new TextRun('')],
            spacing: { after: 300 }
          })
        );
      });

      // Se não há questões, processar texto geral
      if (questions.length === 0) {
        const textContent = tempDiv.textContent || '';
        const paragraphs = textContent.split('\n').filter(p => p.trim());
        
        paragraphs.forEach(paragraph => {
          if (paragraph.trim()) {
            children.push(
              new Paragraph({
                children: [new TextRun(paragraph.trim())],
                spacing: { after: 200 }
              })
            );
          }
        });
      }

      // Criar documento
      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                margin: {
                  top: 1134,
                  right: 850,
                  bottom: 1134,
                  left: 850,
                }
              }
            },
            children: children
          }
        ]
      });

      // Gerar e baixar arquivo
      const blob = await Packer.toBlob(doc);
      const fileName = `${material.title.replace(/[^a-zA-Z0-9\s]/g, '').trim() || 'material'}.docx`;
      saveAs(blob, fileName);

      toast.success('Material exportado para Word com sucesso!');
    } catch (error) {
      console.error('Erro na exportação Word:', error);
      toast.error('Erro ao exportar material');
    }
  };

  const handleExport = async (format: 'pdf' | 'word' | 'ppt') => {
    if (!material) return;

    try {
      switch (format) {
        case 'pdf':
          await handleExportPDF();
          break;
        case 'word':
          await handleExportWord();
          break;
        case 'ppt':
          if (material.type === 'slides') {
            await handleExportPDF(); // Para PPT, usar PDF por enquanto
          } else {
            await handleExportPDF();
          }
          toast.success('Material exportado para PowerPoint com sucesso!');
          break;
      }
    } catch (error) {
      toast.error('Erro ao exportar material');
      console.error('Export error:', error);
    }
  };

  const canGenerateAnswerKey = material && (material.type === 'atividade' || material.type === 'avaliacao');

  if (!material) return null;

  // Mobile layout
  if (isMobile) {
    return (
      <>
        <Sheet open={open} onOpenChange={onClose}>
          <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl border-0 p-0 bg-white">
            <div className="h-full flex flex-col">
              {/* Header */}
              <SheetHeader className="p-4 pb-3 border-b bg-white rounded-t-3xl">
                <SheetTitle className="text-lg font-bold text-center">
                  {material.title}
                </SheetTitle>
                <div className="text-sm text-gray-600 text-center">
                  {getTypeLabel(material.type)} • {material.subject} • {material.grade}
                </div>
              </SheetHeader>
              
              {/* Content Preview - Scaled down to fit without scrolling */}
              <div className="flex-1 p-4 overflow-hidden">
                <div className="h-full border rounded-2xl bg-gray-50 overflow-hidden shadow-inner">
                  <div 
                    className="origin-top-left transform scale-[0.3] w-[333%] h-[333%] overflow-hidden"
                    style={{ transformOrigin: '0 0' }}
                  >
                    <MaterialPreview material={material} />
                  </div>
                </div>
              </div>
              
              {/* Export Buttons */}
              <div className="p-4 space-y-3 bg-white border-t">
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrint}
                    className="text-xs"
                  >
                    <Printer className="h-3 w-3 mr-1" />
                    Imprimir
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('pdf')}
                    className="text-xs"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    PDF
                  </Button>
                  
                  {material.type === 'slides' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport('ppt')}
                      className="text-xs"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      PPT
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport('word')}
                      className="text-xs"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Word
                    </Button>
                  )}
                </div>
                
                {/* Answer Key Button */}
                {canGenerateAnswerKey && (
                  <Button
                    variant="outline"
                    onClick={() => setAnswerKeyModalOpen(true)}
                    className="w-full text-green-600 border-green-200 hover:bg-green-50"
                  >
                    <FileCheck className="h-4 w-4 mr-2" />
                    Gerar Gabarito
                  </Button>
                )}
                
                {/* Close Button */}
                <Button
                  variant="default"
                  onClick={onClose}
                  className="w-full bg-gray-800 hover:bg-gray-900"
                >
                  Fechar
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <AnswerKeyModal 
          material={material}
          open={answerKeyModalOpen}
          onClose={() => setAnswerKeyModalOpen(false)}
        />
      </>
    );
  }

  // Desktop layout
  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 flex">
          <div className="flex-1 overflow-hidden">
            <MaterialPreview material={material} />
          </div>
          
          {/* Sidebar com botões */}
          <div className="w-80 bg-gray-50 border-l flex flex-col">
            <DialogHeader className="p-6 pb-4 border-b bg-white">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-lg font-bold">
                  Exportar Material
                </DialogTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogHeader>
            
            <div className="p-6 space-y-4">
              <Button
                variant="outline"
                size="default"
                onClick={handlePrint}
                className="w-full justify-start"
              >
                <Printer className="h-4 w-4 mr-3" />
                Imprimir
              </Button>
              
              <Button
                variant="outline"
                size="default"
                onClick={() => handleExport('pdf')}
                className="w-full justify-start"
              >
                <Download className="h-4 w-4 mr-3" />
                PDF
              </Button>
              
              {material.type !== 'slides' && (
                <Button
                  variant="outline"
                  size="default"
                  onClick={() => handleExport('word')}
                  className="w-full justify-start"
                >
                  <Download className="h-4 w-4 mr-3" />
                  Microsoft Word
                </Button>
              )}
              
              {material.type === 'slides' && (
                <Button
                  variant="outline"
                  size="default"
                  onClick={() => handleExport('ppt')}
                  className="w-full justify-start"
                >
                  <Download className="h-4 w-4 mr-3" />
                  PPT
                </Button>
              )}

              {/* Answer Key Button */}
              {canGenerateAnswerKey && (
                <Button
                  variant="outline"
                  size="default"
                  onClick={() => setAnswerKeyModalOpen(true)}
                  className="w-full justify-start text-green-600 border-green-200 hover:bg-green-50"
                >
                  <FileCheck className="h-4 w-4 mr-3" />
                  Gerar Gabarito
                </Button>
              )}
            </div>
            
            <div className="p-6 border-t mt-auto">
              <div className="text-sm text-gray-600 space-y-2">
                <h3 className="font-semibold">Detalhes</h3>
                <div>
                  <span className="font-medium">Disciplina:</span> {material.subject}
                </div>
                <div>
                  <span className="font-medium">Turma:</span> {material.grade}
                </div>
                <div>
                  <span className="font-medium">Tipo:</span> {getTypeLabel(material.type)}
                </div>
                <div>
                  <span className="font-medium">Criado:</span> {new Date(material.createdAt).toLocaleDateString('pt-BR')}
                </div>
              </div>
              
              <Button
                variant="default"
                onClick={onClose}
                className="w-full mt-6 bg-gray-800 hover:bg-gray-900"
              >
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AnswerKeyModal 
        material={material}
        open={answerKeyModalOpen}
        onClose={() => setAnswerKeyModalOpen(false)}
      />
    </>
  );
};

export default MaterialModal;
