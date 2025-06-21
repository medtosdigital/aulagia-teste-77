
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, AlignmentType, PageBreak } from 'docx';
import { saveAs } from 'file-saver';
import { GeneratedMaterial, LessonPlan, Activity, Slide, Assessment } from './materialService';
import { templateService } from './templateService';

class ExportService {
  private splitContentIntoPages = (htmlContent: string, material: GeneratedMaterial): string[] => {
    console.log('ExportService: Starting optimized page split for:', material.type);
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    // Para atividades e avaliações - usar o mesmo sistema do MaterialPreview
    if (material.type === 'atividade' || material.type === 'avaliacao') {
      const pages: string[] = [];
      const questions = tempDiv.querySelectorAll('.questao-container, .question');
      
      if (questions.length === 0) {
        console.log('ExportService: No questions found, returning single page');
        return [this.createPageContent(htmlContent, true, material)];
      }

      console.log(`ExportService: Processing ${questions.length} questions for optimized pagination`);

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
          pageContent += material.type === 'atividade' ? '<h2>ATIVIDADE</h2>' : '<h2>AVALIAÇÃO</h2>';
          
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
                <td>${material.subject || '[DISCIPLINA]'}</td>
                <th>Série/Ano:</th>
                <td>${material.grade || '[SERIE_ANO]'}</td>
              </tr>
              <tr>
                <th>Aluno(a):</th>
                <td class="student-info-cell">____________________________________________</td>
                <th>${material.type === 'avaliacao' ? 'NOTA:' : 'BNCC:'}</th>
                <td class="student-info-cell ${material.type === 'avaliacao' ? 'nota-highlight-cell' : ''}">${material.type === 'avaliacao' ? '' : '{{Código da BNCC}}'}</td>
              </tr>
            </table>
          `;
          
          pageContent += `
            <div class="instructions">
              <strong>${material.title}:</strong><br>
              ${material.type === 'avaliacao' ? 'Leia com atenção cada questão e escolha a alternativa correta ou responda de forma completa.' : 'Leia atentamente cada questão e responda de acordo com o solicitado.'}
            </div>
          `;
        }
        
        questionsForPage.forEach(question => {
          pageContent += question.outerHTML;
        });

        pages.push(this.createPageContent(pageContent, isFirstPage, material));
      }
      
      console.log(`ExportService: Split into ${pages.length} optimized pages`);
      return pages;
    }

    return [this.createPageContent(htmlContent, true, material)];
  };

  private createPageContent = (content: string, isFirstPage: boolean, material: GeneratedMaterial): string => {
    const pageClass = isFirstPage ? 'first-page-content' : 'subsequent-page-content';
    const contentClass = isFirstPage ? 'content' : 'content subsequent-page';
    
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
          ${material.type === 'atividade' ? 'Atividade' : 'Avaliação'} gerada pela AulagIA - Sua aula com toque mágico em ${new Date().toLocaleDateString('pt-BR')} • aulagia.com.br
        </div>

        <div class="${contentClass}">
          ${content}
        </div>
      </div>
    `;
  };

  private createFullStyledHtml = (content: string): string => {
    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          @page {
            size: A4;
            margin: 0;
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            margin: 0;
            padding: 0;
            background: white;
            font-family: 'Inter', sans-serif;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .page {
            position: relative;
            width: 210mm;
            min-height: 297mm;
            background: white;
            overflow: hidden;
            margin: 0;
            box-sizing: border-box;
            padding: 0;
            display: flex;
            flex-direction: column;
            page-break-after: always;
          }

          .page:last-of-type {
            page-break-after: auto;
          }
          
          .shape-circle {
            position: absolute;
            border-radius: 50%;
            opacity: 0.25;
            pointer-events: none;
            z-index: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
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
            gap: 6px;
          }
          .header .logo {
            width: 24px;
            height: 24px;
            background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%) !important;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            flex-shrink: 0;
            box-shadow: 0 2px 6px rgba(14, 165, 233, 0.2);
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .header .logo svg {
            width: 14px;
            height: 14px;
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
            font-size: 14px;
            color: #0ea5e9;
            margin: 0;
            font-family: 'Inter', sans-serif;
            line-height: 1;
            font-weight: 700;
            letter-spacing: -0.2px;
            text-transform: none !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .header .brand-text p {
            font-size: 7px;
            color: #6b7280;
            margin: 0;
            font-family: 'Inter', sans-serif;
            line-height: 1;
            font-weight: 400;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
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
            color: #4f46e5 !important;
            position: relative;
            font-family: 'Inter', sans-serif;
            font-weight: 700;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          h2::after {
            content: '';
            width: 50px;
            height: 3px;
            background: #a78bfa !important;
            display: block;
            margin: 6px auto 0;
            border-radius: 2px;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
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
            background: #f3f4f6 !important;
            color: #1f2937;
            font-weight: 600;
            text-align: left;
            width: 18%;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
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
            background-color: #fef3c7 !important;
            color: #000000;
            font-weight: 600;
            border: 2px solid #f59e0b !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
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
            color: #4338ca !important;
            margin-bottom: 10px;
            font-size: 1.0rem;
            font-family: 'Inter', sans-serif;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
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
            color: #4338ca !important;
            min-width: 25px;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
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
          }
        </style>
      </head>
      <body>
        ${content}
      </body>
      </html>
    `;
  };

  async exportToPDF(material: GeneratedMaterial): Promise<void> {
    try {
      console.log('Iniciando exportação PDF:', material.type);
      
      if (material.type === 'slides') {
        await this.exportSlidesToPDF(material);
        return;
      }

      // Renderizar template
      const renderedHtml = templateService.renderTemplate(this.getTemplateId(material.type), material.content);
      
      // Dividir em páginas
      const pages = this.splitContentIntoPages(renderedHtml, material);
      
      // Combinar todas as páginas
      const finalHtml = pages.join('');
      const styledHtml = this.createFullStyledHtml(finalHtml);
      
      // Criar elemento temporário para renderização
      const element = document.createElement('div');
      element.innerHTML = styledHtml;
      element.style.position = 'absolute';
      element.style.left = '-9999px';
      element.style.top = '-9999px';
      document.body.appendChild(element);
      
      // Usar jsPDF para criar PDF diretamente
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Processar cada página usando html2canvas via jsPDF
      const pageElements = element.querySelectorAll('.page');
      
      for (let i = 0; i < pageElements.length; i++) {
        if (i > 0) {
          pdf.addPage();
        }
        
        try {
          await pdf.html(pageElements[i] as HTMLElement, {
            callback: () => {},
            x: 0,
            y: 0,
            width: 210,
            windowWidth: 794, // A4 width in pixels at 96 DPI
          });
        } catch (error) {
          console.warn('Erro ao renderizar página', i + 1, error);
        }
      }
      
      // Limpar elemento temporário
      document.body.removeChild(element);
      
      // Fazer download direto
      const fileName = `${material.title.replace(/[^a-zA-Z0-9\s]/g, '').trim() || 'material'}.pdf`;
      pdf.save(fileName);
      
      console.log('PDF exportado com sucesso');

    } catch (error) {
      console.error('Erro na exportação PDF:', error);
      throw error;
    }
  }

  private async exportSlidesToPDF(material: GeneratedMaterial): Promise<void> {
    const doc = new jsPDF('landscape', 'mm', [254, 190.5]);
    const slides = material.content as Slide[];
    
    slides.forEach((slide, index) => {
      if (index > 0) doc.addPage();
      
      doc.setFillColor(224, 242, 254);
      doc.rect(0, 0, 254, 190.5, 'F');
      
      doc.setFillColor(255, 255, 255);
      doc.rect(20, 20, 214, 150.5, 'F');
      
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text(slide.titulo || `Slide ${index + 1}`, 30, 40);
      
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      
      let y = 60;
      if (slide.conteudo && Array.isArray(slide.conteudo)) {
        slide.conteudo.forEach((item: string) => {
          const lines = doc.splitTextToSize(`• ${item}`, 180);
          lines.forEach((line: string) => {
            doc.text(line, 30, y);
            y += 8;
          });
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
      const pages = this.splitContentIntoPages(renderedHtml, material);
      
      // Processar cada página
      pages.forEach((pageContent, pageIndex) => {
        if (pageIndex > 0) {
          children.push(
            new Paragraph({
              children: [new PageBreak()],
            })
          );
        }
        
        const pageContentParagraphs = this.processPageContentForWord(pageContent, material);
        children.push(...pageContentParagraphs);
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

  private getTypeLabel(type: string): string {
    const labels = {
      'plano-de-aula': 'Plano de Aula',
      'slides': 'Slides',
      'atividade': 'Atividade',
      'avaliacao': 'Avaliação'
    };
    return labels[type as keyof typeof labels] || type;
  }
}

export const exportService = new ExportService();
