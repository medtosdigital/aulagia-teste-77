import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak } from 'docx';
import { saveAs } from 'file-saver';
import { GeneratedMaterial, LessonPlan, Activity, Slide, Assessment } from './materialService';
import { templateService } from './templateService';

class ExportService {
  private calculateQuestionHeight(question: Element): number {
    const enunciado = question.querySelector('.questao-enunciado')?.textContent || '';
    const opcoes = question.querySelectorAll('.opcao');
    
    // Base height for question structure
    let height = 120; // Base padding, margins, and question number
    
    // Add height based on text length (approximate)
    height += Math.ceil(enunciado.length / 80) * 25; // ~25px per line
    
    // Add height for options
    height += opcoes.length * 35; // ~35px per option
    
    // Add extra space for complex questions
    if (enunciado.length > 200 || opcoes.length > 4) {
      height += 50;
    }
    
    return height;
  }

  private getTypeLabel(type: string): string {
    const labels = {
      'plano-de-aula': 'Plano de Aula',
      'slides': 'Slides',
      'atividade': 'Atividade',
      'avaliacao': 'Avaliação'
    };
    return labels[type as keyof typeof labels] || type;
  }

  private wrapPageContent(content: string, isFirstPage: boolean, materialType: string, materialTitle: string, materialSubject: string, materialGrade: string): string {
    const standardHeader = `
      <div class="page-header-complete">
        <div class="logo-section">
          <div class="logo-circle"></div>
          <h3 class="logo-text">Sistema Educacional</h3>
        </div>
        <div class="material-info">
          <h2 class="material-title">${materialTitle}</h2>
          <div class="material-meta">
            <span class="material-type">${this.getTypeLabel(materialType)}</span>
            <span class="separator">•</span>
            <span class="material-subject">${materialSubject || 'Disciplina'}</span>
            <span class="separator">•</span>
            <span class="material-grade">${materialGrade || 'Série'}</span>
          </div>
        </div>
      </div>
    `;

    const studentInfo = (materialType === 'atividade' || materialType === 'avaliacao') ? `
      <div class="student-info-section">
        <div class="student-field">
          <label>Nome:</label>
          <div class="field-line"></div>
        </div>
        <div class="student-field">
          <label>Data:</label>
          <div class="field-line short"></div>
        </div>
        <div class="student-field">
          <label>Turma:</label>
          <div class="field-line short"></div>
        </div>
      </div>
    ` : '';

    const footer = `
      <div class="page-footer">
        <div class="footer-decorative-circle"></div>
        <p class="footer-text">Gerado automaticamente pelo Sistema Educacional</p>
        <div class="footer-line"></div>
      </div>
    `;

    return `
      <div class="page-content">
        ${standardHeader}
        ${studentInfo}
        <div class="main-content-area">
          ${content}
        </div>
        ${footer}
      </div>
    `;
  }

  private splitContentIntoPages(htmlContent: string, materialType: string, materialTitle: string, materialSubject: string, materialGrade: string): string[] {
    console.log('ExportService: Starting page split for', materialType);
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    // Ajustar altura da página para acomodar cabeçalho completo e rodapé
    const pageHeight = 1100; // Reduzido para dar mais espaço aos elementos fixos
    const headerFooterHeight = 400; // Aumentado para incluir cabeçalho completo e rodapé
    const availableContentHeight = pageHeight - headerFooterHeight;

    console.log('ExportService page calculation:', { pageHeight, headerFooterHeight, availableContentHeight });

    // Split content by questions or sections for activities and evaluations
    if (materialType === 'atividade' || materialType === 'avaliacao') {
      const pages: string[] = [];
      const questions = tempDiv.querySelectorAll('.questao-container');
      
      if (questions.length === 0) {
        console.log('ExportService: No questions found, returning original content with wrapper');
        return [this.wrapPageContent(htmlContent, true, materialType, materialTitle, materialSubject, materialGrade)];
      }

      console.log(`ExportService: Found ${questions.length} questions to paginate`);

      let currentPageContent = '';
      let currentPageHeight = 0;
      
      // Remove cabeçalho original do conteúdo, pois será adicionado pelo wrapper
      const originalInstructions = tempDiv.querySelector('.instructions-section');
      
      // Preservar apenas as instruções para a primeira página
      const instructionsContent = originalInstructions?.outerHTML || '';
      
      questions.forEach((question, index) => {
        const questionHeight = this.calculateQuestionHeight(question);
        console.log(`ExportService: Question ${index + 1} estimated height: ${questionHeight}px`);
        
        if (currentPageHeight + questionHeight > availableContentHeight && currentPageContent) {
          console.log(`ExportService: Creating new page at question ${index + 1}, current height: ${currentPageHeight}px`);
          const isFirstPage = pages.length === 0;
          const pageContent = isFirstPage ? instructionsContent + currentPageContent : currentPageContent;
          pages.push(this.wrapPageContent(pageContent, isFirstPage, materialType, materialTitle, materialSubject, materialGrade));
          currentPageContent = '';
          currentPageHeight = 0;
        }
        
        currentPageContent += question.outerHTML;
        currentPageHeight += questionHeight;
      });
      
      if (currentPageContent) {
        const isFirstPage = pages.length === 0;
        const pageContent = isFirstPage ? instructionsContent + currentPageContent : currentPageContent;
        pages.push(this.wrapPageContent(pageContent, isFirstPage, materialType, materialTitle, materialSubject, materialGrade));
      }
      
      console.log(`ExportService: Split into ${pages.length} pages`);
      return pages.length > 0 ? pages : [this.wrapPageContent(htmlContent, true, materialType, materialTitle, materialSubject, materialGrade)];
    }

    // For lesson plans, split by sections
    if (materialType === 'plano-de-aula') {
      const sections = tempDiv.querySelectorAll('.section');
      if (sections.length <= 1) {
        return [this.wrapPageContent(htmlContent, true, materialType, materialTitle, materialSubject, materialGrade)];
      }

      const pages: string[] = [];
      let currentPageContent = '';
      let currentPageHeight = 0;
      const sectionHeight = 250; // Average height per section
      
      sections.forEach((section, index) => {
        if (currentPageHeight + sectionHeight > availableContentHeight && currentPageContent) {
          const isFirstPage = pages.length === 0;
          pages.push(this.wrapPageContent(currentPageContent, isFirstPage, materialType, materialTitle, materialSubject, materialGrade));
          currentPageContent = '';
          currentPageHeight = 0;
        }
        
        currentPageContent += section.outerHTML;
        currentPageHeight += sectionHeight;
      });
      
      if (currentPageContent) {
        const isFirstPage = pages.length === 0;
        pages.push(this.wrapPageContent(currentPageContent, isFirstPage, materialType, materialTitle, materialSubject, materialGrade));
      }
      
      return pages.length > 0 ? pages : [this.wrapPageContent(htmlContent, true, materialType, materialTitle, materialSubject, materialGrade)];
    }

    return [this.wrapPageContent(htmlContent, true, materialType, materialTitle, materialSubject, materialGrade)];
  }

  private enhanceHtmlWithStyles(htmlContent: string, title: string): string {
    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          @page {
            size: A4;
            margin: 10mm 15mm 10mm 15mm;
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: white;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .page-content {
            display: flex;
            flex-direction: column;
            min-height: calc(100vh - 20mm);
            page-break-after: always;
            padding: 10mm 0;
          }
          
          .page-content:last-child {
            page-break-after: avoid;
          }
          
          .page-header-complete {
            margin-bottom: 25px;
            padding: 20px 20mm;
            border-bottom: 3px solid #e5e5e5;
            background: #fafafa;
            position: relative;
          }
          
          .logo-section {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
          }
          
          .logo-circle {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            border-radius: 50%;
            margin-right: 15px;
            box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
          }
          
          .logo-text {
            font-size: 18px;
            font-weight: bold;
            color: #1e40af;
            margin: 0;
          }
          
          .material-info {
            text-align: center;
          }
          
          .material-title {
            font-size: 22px;
            font-weight: bold;
            color: #1e293b;
            margin-bottom: 8px;
          }
          
          .material-meta {
            font-size: 14px;
            color: #64748b;
          }
          
          .separator {
            margin: 0 8px;
            color: #cbd5e1;
          }
          
          .student-info-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 20px 20mm 30px 20mm;
            padding: 15px 20px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
          }
          
          .student-field {
            display: flex;
            align-items: center;
          }
          
          .student-field label {
            font-weight: 600;
            color: #374151;
            margin-right: 10px;
            font-size: 14px;
          }
          
          .field-line {
            border-bottom: 2px solid #d1d5db;
            height: 20px;
            width: 200px;
          }
          
          .field-line.short {
            width: 120px;
          }
          
          .main-content-area {
            flex: 1;
            padding: 0 20mm;
            margin-bottom: 30px;
          }
          
          .page-footer {
            margin-top: auto;
            padding: 20px 20mm;
            border-top: 2px solid #e5e5e5;
            background: #f9fafb;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .footer-decorative-circle {
            width: 25px;
            height: 25px;
            background: linear-gradient(135deg, #10b981, #059669);
            border-radius: 50%;
            margin-right: 12px;
            box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);
          }
          
          .footer-text {
            font-size: 12px;
            color: #6b7280;
            font-style: italic;
          }
          
          .footer-line {
            position: absolute;
            top: 0;
            left: 20mm;
            right: 20mm;
            height: 3px;
            background: linear-gradient(90deg, #3b82f6, #10b981);
          }
          
          .questao-container {
            margin-bottom: 30px;
            padding: 25px;
            background: #fafafa;
            border-left: 5px solid #3b82f6;
            border-radius: 10px;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          .questao-numero {
            font-weight: bold;
            color: #3b82f6;
            margin-bottom: 15px;
            font-size: 16px;
          }
          
          .questao-enunciado {
            margin-bottom: 20px;
            line-height: 1.8;
            font-size: 14px;
          }
          
          .questao-opcoes {
            margin-left: 20px;
          }
          
          .opcao {
            margin: 12px 0;
            display: flex;
            align-items: flex-start;
            font-size: 14px;
          }
          
          .opcao-letra {
            font-weight: bold;
            margin-right: 15px;
            min-width: 25px;
          }
          
          .instructions-section {
            background: #eff6ff;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 25px;
            border-left: 4px solid #3b82f6;
          }
          
          .section {
            margin-bottom: 35px;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 20px;
            padding-bottom: 8px;
            border-bottom: 2px solid #e5e7eb;
          }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
    `;
  }

  async exportToPDF(material: GeneratedMaterial): Promise<void> {
    if (material.type === 'slides') {
      await this.exportSlidesToPDF(material);
      return;
    }

    const renderedHtml = templateService.renderTemplate(this.getTemplateId(material.type), material.content);
    const pages = this.splitContentIntoPages(renderedHtml, material.type, material.title, material.subject || '', material.grade || '');
    
    let finalHtml = '';
    pages.forEach((page, index) => {
      finalHtml += page;
    });
    
    const styledHtml = this.enhanceHtmlWithStyles(finalHtml, material.title);
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(styledHtml);
      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  }

  private async exportSlidesToPDF(material: GeneratedMaterial): Promise<void> {
    const doc = new jsPDF('landscape', 'mm', [254, 190.5]);
    const slides = material.content as Slide[];
    
    const renderedHtml = templateService.renderTemplate('2', slides);
    
    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(renderedHtml, 'text/html');
    const slideElements = htmlDoc.querySelectorAll('.slide');
    
    slideElements.forEach((slideElement, index) => {
      if (index > 0) doc.addPage();
      
      const textContent = slideElement.querySelector('.text-content');
      const title = textContent?.querySelector('.title')?.textContent || `Slide ${index + 1}`;
      const content = textContent?.querySelector('.content')?.textContent || '';
      
      doc.setFillColor(224, 242, 254);
      doc.rect(0, 0, 254, 190.5, 'F');
      
      doc.setFillColor(255, 255, 255);
      doc.rect(20, 20, 214, 150.5, 'F');
      
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text(title, 30, 40);
      
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      
      let y = 60;
      if (content) {
        const lines = doc.splitTextToSize(content, 120);
        lines.forEach((line: string) => {
          doc.text(line, 30, y);
          y += 8;
        });
      }
    });

    doc.save(`${material.title}-slides.pdf`);
  }

  async exportToWord(material: GeneratedMaterial): Promise<void> {
    try {
      console.log('Iniciando exportação para Word:', material.type);
      
      const children: any[] = [];

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
          spacing: { after: 600 }
        })
      );

      // Informações do material
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${this.getTypeLabel(material.type)} • ${material.subject || 'Disciplina'} • ${material.grade || 'Série'}`,
              size: 24,
              color: '6B7280'
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 800 }
        })
      );

      // Renderizar conteúdo e dividir em páginas
      const renderedHtml = templateService.renderTemplate(this.getTemplateId(material.type), material.content);
      const pages = this.splitContentIntoPages(renderedHtml, material.type, material.title, material.subject || '', material.grade || '');
      
      // Processar cada página
      pages.forEach((pageContent, pageIndex) => {
        if (pageIndex > 0) {
          // Adicionar quebra de página entre as páginas
          children.push(
            new Paragraph({
              children: [new PageBreak()],
            })
          );
        }
        
        // Adicionar cabeçalho da página (logo e informações)
        if (pageIndex === 0 || material.type === 'atividade' || material.type === 'avaliacao') {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: '═══════════════════════════════════════',
                  color: 'E5E5E5'
                })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 }
            })
          );
        }
        
        // Processar conteúdo da página
        const pageContentParagraphs = this.processPageContentForWord(pageContent, material);
        children.push(...pageContentParagraphs);
        
        if (material.type === 'atividade' || material.type === 'avaliacao') {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: '═══════════════════════════════════════',
                  color: 'E5E5E5'
                })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { before: 400, after: 200 }
            })
          );
          
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Gerado automaticamente pelo Sistema Educacional',
                  size: 20,
                  color: '9CA3AF'
                })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 }
            })
          );
        }
      });

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

      // Gerar arquivo
      const blob = await Packer.toBlob(doc);
      const fileName = `${material.title.replace(/[^a-zA-Z0-9\s]/g, '').trim() || 'material'}.docx`;
      saveAs(blob, fileName);

      console.log('Exportação para Word concluída com sucesso');

    } catch (error) {
      console.error('Erro detalhado na exportação Word:', error);
      throw new Error(`Falha na exportação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  private processPageContentForWord(pageContent: string, material: GeneratedMaterial): any[] {
    // Parse HTML content and convert to Word paragraphs
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = pageContent;
    
    const paragraphs: any[] = [];
    
    // Process questions if present
    const questions = tempDiv.querySelectorAll('.questao-container');
    questions.forEach((question, index) => {
      const questionNumber = question.querySelector('.questao-numero')?.textContent || `${index + 1}`;
      const questionText = question.querySelector('.questao-enunciado')?.textContent || '';
      const options = question.querySelectorAll('.opcao');
      
      // Question number and text
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Questão ${questionNumber}`,
              bold: true,
              size: 28,
              color: '3B82F6'
            })
          ],
          spacing: { before: 300, after: 150 }
        })
      );
      
      paragraphs.push(
        new Paragraph({
          children: [new TextRun(questionText)],
          spacing: { after: 200 }
        })
      );
      
      // Options
      options.forEach((option, optIndex) => {
        const optionLetter = String.fromCharCode(65 + optIndex);
        const optionText = option.textContent?.replace(/^[A-Z]\)\s*/, '') || '';
        
        paragraphs.push(
          new Paragraph({
            children: [new TextRun(`${optionLetter}) ${optionText}`)],
            spacing: { after: 100 }
          })
        );
      });
      
      paragraphs.push(
        new Paragraph({
          children: [new TextRun('')],
          spacing: { after: 200 }
        })
      );
    });
    
    // Process sections for lesson plans
    const sections = tempDiv.querySelectorAll('.section');
    sections.forEach(section => {
      const title = section.querySelector('.section-title')?.textContent || '';
      const content = section.textContent?.replace(title, '').trim() || '';
      
      if (title) {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: title,
                bold: true,
                size: 28,
                color: '2563EB'
              })
            ],
            spacing: { before: 400, after: 200 }
          })
        );
      }
      
      if (content) {
        paragraphs.push(
          new Paragraph({
            children: [new TextRun(content)],
            spacing: { after: 300 }
          })
        );
      }
    });
    
    return paragraphs;
  }

  private getWordContent(material: GeneratedMaterial): any[] {
    try {
      switch (material.type) {
        case 'plano-de-aula':
          return this.createLessonPlanContent(material.content as LessonPlan);
        case 'slides':
          return this.createSlidesContent(material.content);
        case 'atividade':
          return this.createActivityContent(material.content as Activity);
        case 'avaliacao':
          return this.createAssessmentContent(material.content as Assessment);
        default:
          return [
            new Paragraph({
              children: [new TextRun('Conteúdo não disponível')],
              spacing: { after: 200 }
            })
          ];
      }
    } catch (error) {
      console.error('Erro ao processar conteúdo:', error);
      return [
        new Paragraph({
          children: [new TextRun('Erro ao processar o conteúdo do material')],
          spacing: { after: 200 }
        })
      ];
    }
  }

  private createLessonPlanContent(content: LessonPlan): any[] {
    const paragraphs: any[] = [];

    // Informações básicas
    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: 'INFORMAÇÕES BÁSICAS', bold: true, size: 28, color: '4F46E5' })],
        spacing: { before: 400, after: 300 }
      })
    );

    if (content.professor) {
      paragraphs.push(new Paragraph({
        children: [new TextRun(`Professor(a): ${content.professor}`)],
        spacing: { after: 150 }
      }));
    }

    if (content.disciplina) {
      paragraphs.push(new Paragraph({
        children: [new TextRun(`Disciplina: ${content.disciplina}`)],
        spacing: { after: 150 }
      }));
    }

    if (content.tema) {
      paragraphs.push(new Paragraph({
        children: [new TextRun(`Tema: ${content.tema}`)],
        spacing: { after: 150 }
      }));
    }

    if (content.duracao) {
      paragraphs.push(new Paragraph({
        children: [new TextRun(`Duração: ${content.duracao}`)],
        spacing: { after: 150 }
      }));
    }

    if (content.serie) {
      paragraphs.push(new Paragraph({
        children: [new TextRun(`Série: ${content.serie}`)],
        spacing: { after: 300 }
      }));
    }

    // Objetivos
    if (content.objetivos && Array.isArray(content.objetivos) && content.objetivos.length > 0) {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: 'OBJETIVOS DE APRENDIZAGEM', bold: true, size: 28, color: '4F46E5' })],
          spacing: { before: 400, after: 300 }
        })
      );

      content.objetivos.forEach(objetivo => {
        paragraphs.push(new Paragraph({
          children: [new TextRun(`• ${objetivo}`)],
          spacing: { after: 150 }
        }));
      });
    }

    // Desenvolvimento
    if (content.desenvolvimento && Array.isArray(content.desenvolvimento) && content.desenvolvimento.length > 0) {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: 'DESENVOLVIMENTO DA AULA', bold: true, size: 28, color: '4F46E5' })],
          spacing: { before: 400, after: 300 }
        })
      );

      content.desenvolvimento.forEach((etapa, index) => {
        if (etapa && typeof etapa === 'object') {
          paragraphs.push(new Paragraph({
            children: [new TextRun({ text: `${index + 1}. ${etapa.etapa || 'Etapa'}`, bold: true })],
            spacing: { before: 200, after: 100 }
          }));
          
          if (etapa.atividade) {
            paragraphs.push(new Paragraph({
              children: [new TextRun(`Atividade: ${etapa.atividade}`)],
              spacing: { after: 100 }
            }));
          }
          
          if (etapa.tempo) {
            paragraphs.push(new Paragraph({
              children: [new TextRun(`Tempo: ${etapa.tempo}`)],
              spacing: { after: 100 }
            }));
          }
        }
      });
    }

    // Recursos
    if (content.recursos && Array.isArray(content.recursos) && content.recursos.length > 0) {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: 'RECURSOS NECESSÁRIOS', bold: true, size: 28, color: '4F46E5' })],
          spacing: { before: 400, after: 300 }
        })
      );

      content.recursos.forEach(recurso => {
        paragraphs.push(new Paragraph({
          children: [new TextRun(`• ${recurso}`)],
          spacing: { after: 150 }
        }));
      });
    }

    // Avaliação
    if (content.avaliacao) {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: 'AVALIAÇÃO', bold: true, size: 28, color: '4F46E5' })],
          spacing: { before: 400, after: 300 }
        })
      );

      paragraphs.push(new Paragraph({
        children: [new TextRun(content.avaliacao)],
        spacing: { after: 200 }
      }));
    }

    return paragraphs;
  }

  private createSlidesContent(slidesContent: any): any[] {
    const paragraphs: any[] = [];
    
    try {
      const slides = slidesContent.slides || [];
      
      if (!Array.isArray(slides)) {
        return [new Paragraph({
          children: [new TextRun('Conteúdo de slides inválido')],
          spacing: { after: 200 }
        })];
      }

      slides.forEach((slide, index) => {
        if (index > 0) {
          paragraphs.push(new Paragraph({
            children: [new TextRun('')],
            pageBreakBefore: true
          }));
        }

        paragraphs.push(new Paragraph({
          children: [new TextRun({ 
            text: `Slide ${slide.numero || index + 1}: ${slide.titulo || 'Sem título'}`, 
            bold: true, 
            size: 32,
            color: '4F46E5'
          })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        }));

        if (slide.conteudo && Array.isArray(slide.conteudo)) {
          slide.conteudo.forEach((item: string) => {
            paragraphs.push(new Paragraph({
              children: [new TextRun(`• ${item}`)],
              spacing: { after: 200 }
            }));
          });
        }
      });
    } catch (error) {
      console.error('Erro ao processar slides:', error);
      paragraphs.push(new Paragraph({
        children: [new TextRun('Erro ao processar slides')],
        spacing: { after: 200 }
      }));
    }

    return paragraphs;
  }

  private createActivityContent(activity: Activity): any[] {
    const paragraphs: any[] = [];

    if (activity.instrucoes) {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: 'INSTRUÇÕES', bold: true, size: 28, color: '4F46E5' })],
          spacing: { before: 400, after: 300 }
        })
      );

      paragraphs.push(new Paragraph({
        children: [new TextRun(activity.instrucoes)],
        spacing: { after: 400 }
      }));
    }

    if (activity.questoes && Array.isArray(activity.questoes)) {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: 'QUESTÕES', bold: true, size: 28, color: '4F46E5' })],
          spacing: { before: 400, after: 300 }
        })
      );

      activity.questoes.forEach(questao => {
        paragraphs.push(new Paragraph({
          children: [new TextRun({ text: `Questão ${questao.numero}`, bold: true })],
          spacing: { before: 300, after: 150 }
        }));

        paragraphs.push(new Paragraph({
          children: [new TextRun(questao.pergunta)],
          spacing: { after: 200 }
        }));

        if (questao.opcoes && Array.isArray(questao.opcoes)) {
          questao.opcoes.forEach((opcao, index) => {
            const letra = String.fromCharCode(65 + index);
            paragraphs.push(new Paragraph({
              children: [new TextRun(`${letra}) ${opcao}`)],
              spacing: { after: 100 }
            }));
          });
        }
      });
    }

    return paragraphs;
  }

  private createAssessmentContent(assessment: Assessment): any[] {
    const paragraphs: any[] = [];

    if (assessment.instrucoes) {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: 'INSTRUÇÕES DA AVALIAÇÃO', bold: true, size: 28, color: '4F46E5' })],
          spacing: { before: 400, after: 300 }
        })
      );

      paragraphs.push(new Paragraph({
        children: [new TextRun(assessment.instrucoes)],
        spacing: { after: 200 }
      }));
    }

    if (assessment.tempoLimite) {
      paragraphs.push(new Paragraph({
        children: [new TextRun(`Tempo limite: ${assessment.tempoLimite}`)],
        spacing: { after: 400 }
      }));
    }

    if (assessment.questoes && Array.isArray(assessment.questoes)) {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: 'QUESTÕES', bold: true, size: 28, color: '4F46E5' })],
          spacing: { before: 400, after: 300 }
        })
      );

      assessment.questoes.forEach(questao => {
        paragraphs.push(new Paragraph({
          children: [new TextRun({ text: `Questão ${questao.numero} (${questao.pontuacao} pontos)`, bold: true })],
          spacing: { before: 300, after: 150 }
        }));

        paragraphs.push(new Paragraph({
          children: [new TextRun(questao.pergunta)],
          spacing: { after: 200 }
        }));

        if (questao.opcoes && Array.isArray(questao.opcoes)) {
          questao.opcoes.forEach((opcao, index) => {
            const letra = String.fromCharCode(65 + index);
            paragraphs.push(new Paragraph({
              children: [new TextRun(`${letra}) ${opcao}`)],
              spacing: { after: 100 }
            }));
          });
        }
      });
    }

    return paragraphs;
  }

  async exportToPPT(material: GeneratedMaterial): Promise<void> {
    if (material.type !== 'slides') {
      throw new Error('Exportação PPT disponível apenas para slides');
    }

    await this.exportSlidesToPDF(material);
  }

  private getTemplateId(type: string): string {
    const typeMap = {
      'plano-de-aula': '1',
      'slides': '2',
      'atividade': '3',
      'avaliacao': '4'
    };
    return typeMap[type as keyof typeof typeMap] || '1';
  }
}

export const exportService = new ExportService();
