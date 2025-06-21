import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, AlignmentType, PageBreak, Table, TableRow, TableCell, WidthType } from 'docx';
import { saveAs } from 'file-saver';
import { GeneratedMaterial, LessonPlan, Activity, Slide, Assessment } from './materialService';
import { templateService } from './templateService';

class ExportService {
  private wrapPageContentWithTemplate = (content: string, isFirstPage: boolean, material: GeneratedMaterial): string => {
    const pageClass = isFirstPage ? 'first-page-content' : 'subsequent-page-content';
    const contentClass = isFirstPage ? 'content' : 'content subsequent-page';
    
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

        <!-- Rodapé - Atualizado -->
        <div class="footer">
          ${material.type === 'atividade' ? 'Atividade' : material.type === 'avaliacao' ? 'Avaliação' : material.type === 'plano-de-aula' ? 'Plano de Aula' : 'Material'} gerada pela AulagIA em ${new Date().toLocaleDateString('pt-BR')} • aulagia.com.br
        </div>

        <div class="${contentClass}">
          ${content}
        </div>
      </div>
    `;
  };

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
        return [htmlContent];
      }

      console.log(`ExportService: Processing ${questions.length} questions for optimized pagination`);

      const header = tempDiv.querySelector('.header-section')?.outerHTML || '';
      const instructions = tempDiv.querySelector('.instructions-section')?.outerHTML || '';
      const questionsPerPage = 4; // Baseado no MaterialPreview: 4 questões por página
      let questionIndex = 0;

      while (questionIndex < questions.length) {
        const isFirstPage = pages.length === 0;
        const questionsForPage = [];
        
        // Adicionar até 4 questões por página
        for (let i = 0; i < questionsPerPage && questionIndex < questions.length; i++) {
          questionsForPage.push(questions[questionIndex]);
          questionIndex++;
        }

        // Construir conteúdo da página usando o mesmo template do MaterialPreview
        let pageContent = '';
        if (isFirstPage) {
          // Título do Material
          pageContent += material.type === 'atividade' ? '<h2>ATIVIDADE</h2>' : '<h2>AVALIAÇÃO</h2>';
          
          // Informações básicas do Material
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
          
          // Instruções do Material
          pageContent += `
            <div class="instructions">
              <strong>${material.title}:</strong><br>
              ${instructions || (material.type === 'avaliacao' ? 'Leia com atenção cada questão e escolha a alternativa correta ou responda de forma completa.' : 'Leia atentamente cada questão e responda de acordo com o solicitado.')}
            </div>
          `;
        }
        
        questionsForPage.forEach(question => {
          pageContent += question.outerHTML;
        });

        pages.push(this.wrapPageContentWithTemplate(pageContent, isFirstPage, material));
      }
      
      console.log(`ExportService: Split into ${pages.length} optimized pages`);
      return pages.length > 0 ? pages : [htmlContent];
    }

    // Para planos de aula - manter lógica existente
    if (material.type === 'plano-de-aula') {
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

        pages.push(this.wrapPageContentWithTemplate(pageContent, isFirstPage, material));
      }
      
      return pages.length > 0 ? pages : [htmlContent];
    }

    return [htmlContent];
  };

  private enhanceHtmlWithNewTemplate = (htmlContent: string, material: GeneratedMaterial): string => {
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
            margin: 0;
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
        ${htmlContent}
      </body>
      </html>
    `;
  };

  async exportToPDF(material: GeneratedMaterial): Promise<void> {
    try {
      if (material.type === 'slides') {
        await this.exportSlidesToPDF(material);
        return;
      }

      console.log('Iniciando exportação PDF para:', material.type);
      
      const renderedHtml = templateService.renderTemplate(this.getTemplateId(material.type), material.content);
      const pages = this.splitContentIntoPages(renderedHtml, material);
      
      let finalHtml = '';
      pages.forEach((page) => {
        finalHtml += page;
      });
      
      const styledHtml = this.enhanceHtmlWithNewTemplate(finalHtml, material);
      
      // Usar html2canvas e jsPDF para gerar PDF automaticamente
      const { default: html2canvas } = await import('html2canvas');
      
      // Criar container temporário
      const container = document.createElement('div');
      container.innerHTML = styledHtml;
      container.style.position = 'absolute';
      container.style.top = '-9999px';
      container.style.left = '-9999px';
      container.style.width = '210mm';
      document.body.appendChild(container);
      
      try {
        // Aguardar renderização
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Capturar páginas
        const pageElements = container.querySelectorAll('.page');
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        for (let i = 0; i < pageElements.length; i++) {
          if (i > 0) pdf.addPage();
          
          const canvas = await html2canvas(pageElements[i] as HTMLElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
          });
          
          const imgData = canvas.toDataURL('image/png');
          pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
        }
        
        // Download automático
        const fileName = `${material.title.replace(/[^a-zA-Z0-9\s]/g, '').trim() || 'material'}.pdf`;
        pdf.save(fileName);
        
      } finally {
        document.body.removeChild(container);
      }

    } catch (error) {
      console.error('Erro na exportação PDF:', error);
      throw error;
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
      console.log('Iniciando nova exportação para Word:', material.type);
      
      const children: any[] = [];

      // Cabeçalho AulagIA
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'AulagIA',
              bold: true,
              size: 28,
              color: '0EA5E9'
            }),
            new TextRun({
              text: ' - Sua aula com toque mágico',
              size: 16,
              color: '6B7280'
            })
          ],
          alignment: AlignmentType.LEFT,
          spacing: { after: 400 }
        })
      );

      // Título do material
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: this.getTypeLabel(material.type).toUpperCase(),
              bold: true,
              size: 32,
              color: '4F46E5'
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 600 }
        })
      );

      // Tabela de informações
      const infoTable = new Table({
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({
                  children: [new TextRun({ text: 'Escola:', bold: true })]
                })],
                width: { size: 25, type: WidthType.PERCENTAGE }
              }),
              new TableCell({
                children: [new Paragraph({
                  children: [new TextRun('_________________________________')]
                })],
                width: { size: 35, type: WidthType.PERCENTAGE }
              }),
              new TableCell({
                children: [new Paragraph({
                  children: [new TextRun({ text: 'Data:', bold: true })]
                })],
                width: { size: 15, type: WidthType.PERCENTAGE }
              }),
              new TableCell({
                children: [new Paragraph({
                  children: [new TextRun(new Date().toLocaleDateString('pt-BR'))]
                })],
                width: { size: 25, type: WidthType.PERCENTAGE }
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({
                  children: [new TextRun({ text: 'Disciplina:', bold: true })]
                })]
              }),
              new TableCell({
                children: [new Paragraph({
                  children: [new TextRun(material.subject || '[DISCIPLINA]')]
                })]
              }),
              new TableCell({
                children: [new Paragraph({
                  children: [new TextRun({ text: 'Série/Ano:', bold: true })]
                })]
              }),
              new TableCell({
                children: [new Paragraph({
                  children: [new TextRun(material.grade || '[SERIE_ANO]')]
                })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({
                  children: [new TextRun({ text: 'Aluno(a):', bold: true })]
                })]
              }),
              new TableCell({
                children: [new Paragraph({
                  children: [new TextRun('____________________________________________')]
                })]
              }),
              new TableCell({
                children: [new Paragraph({
                  children: [new TextRun({ 
                    text: material.type === 'avaliacao' ? 'NOTA:' : 'BNCC:', 
                    bold: true 
                  })]
                })]
              }),
              new TableCell({
                children: [new Paragraph({
                  children: [new TextRun(material.type === 'avaliacao' ? '' : '{{Código da BNCC}}')] 
                })]
              })
            ]
          })
        ]
      });

      children.push(infoTable);

      // Espaçamento
      children.push(
        new Paragraph({
          children: [new TextRun('')],
          spacing: { after: 400 }
        })
      );

      // Título do material
      if (material.title) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: material.title,
                bold: true,
                size: 24,
                color: '4F46E5'
              })
            ],
            spacing: { after: 300 }
          })
        );
      }

      // Processar conteúdo baseado no tipo
      if (material.type === 'plano-de-aula') {
        children.push(...this.createLessonPlanContentForWord(material.content as LessonPlan));
      } else if (material.type === 'atividade') {
        children.push(...this.createActivityContentForWord(material.content as Activity));
      } else if (material.type === 'avaliacao') {
        children.push(...this.createAssessmentContentForWord(material.content as Assessment));
      }

      // Rodapé
      children.push(
        new Paragraph({
          children: [new TextRun('')],
          spacing: { before: 800 }
        })
      );

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${this.getTypeLabel(material.type)} gerada pela AulagIA em ${new Date().toLocaleDateString('pt-BR')} • aulagia.com.br`,
              size: 16,
              color: '6B7280'
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 400 }
        })
      );

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

      console.log('Exportação Word concluída com sucesso');

    } catch (error) {
      console.error('Erro na exportação Word:', error);
      throw new Error(`Falha na exportação Word: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  private createLessonPlanContentForWord(content: LessonPlan): any[] {
    const paragraphs: any[] = [];

    // Objetivos
    if (content.objetivos && Array.isArray(content.objetivos) && content.objetivos.length > 0) {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: 'OBJETIVOS DE APRENDIZAGEM', bold: true, size: 24, color: '4F46E5' })],
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
          children: [new TextRun({ text: 'DESENVOLVIMENTO DA AULA', bold: true, size: 24, color: '4F46E5' })],
          spacing: { before: 400, after: 300 }
        })
      );

      content.desenvolvimento.forEach((etapa, index) => {
        if (etapa && typeof etapa === 'object') {
          paragraphs.push(new Paragraph({
            children: [new TextRun({ text: `${index + 1}. ${etapa.etapa || 'Etapa'}`, bold: true, size: 20 })],
            spacing: { before: 200, after: 100 }
          }));
          
          if (etapa.atividade) {
            paragraphs.push(new Paragraph({
              children: [new TextRun(`${etapa.atividade}`)],
              spacing: { after: 100 }
            }));
          }
          
          if (etapa.tempo) {
            paragraphs.push(new Paragraph({
              children: [new TextRun({ text: `Tempo: ${etapa.tempo}`, italics: true })],
              spacing: { after: 150 }
            }));
          }
        }
      });
    }

    // Recursos
    if (content.recursos && Array.isArray(content.recursos) && content.recursos.length > 0) {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: 'RECURSOS NECESSÁRIOS', bold: true, size: 24, color: '4F46E5' })],
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
          children: [new TextRun({ text: 'AVALIAÇÃO', bold: true, size: 24, color: '4F46E5' })],
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

  private createActivityContentForWord(activity: Activity): any[] {
    const paragraphs: any[] = [];

    // Instruções
    if (activity.instrucoes) {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: 'INSTRUÇÕES', bold: true, size: 24, color: '4F46E5' })],
          spacing: { before: 400, after: 300 }
        })
      );

      paragraphs.push(new Paragraph({
        children: [new TextRun(activity.instrucoes)],
        spacing: { after: 400 }
      }));
    }

    // Questões
    if (activity.questoes && Array.isArray(activity.questoes)) {
      activity.questoes.forEach(questao => {
        paragraphs.push(new Paragraph({
          children: [new TextRun({ text: `Questão ${questao.numero}`, bold: true, size: 20, color: '4338CA' })],
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

        paragraphs.push(new Paragraph({
          children: [new TextRun('')],
          spacing: { after: 200 }
        }));
      });
    }

    return paragraphs;
  }

  private createAssessmentContentForWord(assessment: Assessment): any[] {
    const paragraphs: any[] = [];

    // Instruções
    if (assessment.instrucoes) {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: 'INSTRUÇÕES DA AVALIAÇÃO', bold: true, size: 24, color: '4F46E5' })],
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
        children: [new TextRun({ text: `Tempo limite: ${assessment.tempoLimite}`, bold: true })],
        spacing: { after: 400 }
      }));
    }

    // Questões
    if (assessment.questoes && Array.isArray(assessment.questoes)) {
      assessment.questoes.forEach(questao => {
        paragraphs.push(new Paragraph({
          children: [new TextRun({ text: `Questão ${questao.numero}`, bold: true, size: 20, color: '4338CA' })],
          spacing: { before: 300, after: 150 }
        }));

        if (questao.pontuacao) {
          paragraphs.push(new Paragraph({
            children: [new TextRun({ text: `(${questao.pontuacao} pontos)`, italics: true, size: 18 })],
            spacing: { after: 100 }
          }));
        }

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

        paragraphs.push(new Paragraph({
          children: [new TextRun('')],
          spacing: { after: 200 }
        }));
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
