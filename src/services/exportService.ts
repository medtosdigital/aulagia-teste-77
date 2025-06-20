
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak } from 'docx';
import { saveAs } from 'file-saver';
import { GeneratedMaterial, LessonPlan, Activity, Slide, Assessment } from './materialService';
import { templateService } from './templateService';

class ExportService {
  private splitContentIntoPages(htmlContent: string, materialType: string): string[] {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    // Split content by questions or sections for activities and evaluations
    if (materialType === 'atividade' || materialType === 'avaliacao') {
      const pages: string[] = [];
      const questions = tempDiv.querySelectorAll('.questao-container');
      
      if (questions.length === 0) {
        return [this.wrapPageContent(htmlContent, '', true)];
      }

      let currentPageContent = '';
      let questionsPerPage = 3; // Limit questions per page to avoid overflow
      let currentQuestionCount = 0;
      
      const header = tempDiv.querySelector('.header-section')?.outerHTML || '';
      const instructions = tempDiv.querySelector('.instructions-section')?.outerHTML || '';
      
      questions.forEach((question, index) => {
        if (currentQuestionCount >= questionsPerPage && currentPageContent) {
          pages.push(this.wrapPageContent(currentPageContent, pages.length === 0 ? header + instructions : '', true));
          currentPageContent = '';
          currentQuestionCount = 0;
        }
        
        currentPageContent += question.outerHTML;
        currentQuestionCount++;
      });
      
      if (currentPageContent) {
        pages.push(this.wrapPageContent(currentPageContent, pages.length === 0 ? header + instructions : '', true));
      }
      
      return pages.length > 0 ? pages : [this.wrapPageContent(htmlContent, '', true)];
    }

    // For lesson plans, split by sections
    if (materialType === 'plano-de-aula') {
      const sections = tempDiv.querySelectorAll('.section');
      if (sections.length <= 1) {
        return [this.wrapPageContent(htmlContent, '', false)];
      }

      const pages: string[] = [];
      let currentPageContent = '';
      let sectionCount = 0;
      const sectionsPerPage = 2; // Limit sections per page

      const header = tempDiv.querySelector('.header-section')?.outerHTML || '';
      
      sections.forEach((section, index) => {
        if (sectionCount >= sectionsPerPage && currentPageContent) {
          pages.push(this.wrapPageContent(currentPageContent, index < sectionsPerPage ? header : '', false));
          currentPageContent = '';
          sectionCount = 0;
        }
        
        currentPageContent += section.outerHTML;
        sectionCount++;
      });
      
      if (currentPageContent) {
        pages.push(this.wrapPageContent(currentPageContent, pages.length === 0 ? header : '', false));
      }
      
      return pages.length > 0 ? pages : [this.wrapPageContent(htmlContent, '', false)];
    }

    return [this.wrapPageContent(htmlContent, '', false)];
  }

  private wrapPageContent(content: string, header: string, includeFooter: boolean): string {
    return `
      <div class="page-content">
        <div class="page-header">
          <div class="logo-section">
            <img src="/placeholder.svg" alt="Logo da Escola" style="height: 50px; width: auto; display: block; margin: 0 auto 15px;">
            <h2 style="text-align: center; color: #4F46E5; margin: 0 0 10px 0; font-size: 18px;">Sistema Educacional</h2>
          </div>
          ${header}
        </div>
        <div class="main-content">
          ${content}
        </div>
        ${includeFooter ? `
          <div class="page-footer">
            <div style="border-top: 1px solid #e5e5e5; padding-top: 15px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #666;">Gerado automaticamente pelo Sistema Educacional</p>
              <p style="margin: 5px 0 0 0; font-size: 10px; color: #999;">www.sistemaeducacional.com.br</p>
            </div>
          </div>
        ` : ''}
      </div>
    `;
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
            margin: 15mm;
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.5;
            color: #333;
            background: white;
            font-size: 14px;
          }
          
          .page-content {
            min-height: calc(100vh - 30mm);
            max-height: calc(100vh - 30mm);
            display: flex;
            flex-direction: column;
            page-break-after: always;
            padding: 0;
            margin: 0;
            position: relative;
          }
          
          .page-content:last-child {
            page-break-after: avoid;
          }
          
          .page-header {
            margin-bottom: 20px;
            border-bottom: 2px solid #e5e5e5;
            padding-bottom: 15px;
            flex-shrink: 0;
          }
          
          .logo-section {
            text-align: center;
            margin-bottom: 15px;
          }
          
          .logo-section img {
            max-height: 50px;
            width: auto;
          }
          
          .main-content {
            flex: 1;
            overflow: hidden;
            margin-bottom: 15px;
          }
          
          .page-footer {
            margin-top: auto;
            padding-top: 15px;
            border-top: 1px solid #e5e5e5;
            text-align: center;
            font-size: 12px;
            color: #666;
            flex-shrink: 0;
            height: 60px;
          }
          
          .questao-container {
            margin-bottom: 20px;
            padding: 15px;
            background: #fafafa;
            border-left: 4px solid #3b82f6;
            border-radius: 8px;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          .questao-numero {
            font-weight: bold;
            color: #3b82f6;
            margin-bottom: 10px;
            font-size: 16px;
          }
          
          .questao-enunciado {
            margin-bottom: 15px;
            line-height: 1.6;
          }
          
          .questao-opcoes {
            margin-left: 20px;
          }
          
          .opcao {
            margin: 8px 0;
            display: flex;
            align-items: flex-start;
            line-height: 1.4;
          }
          
          .opcao-letra {
            font-weight: bold;
            margin-right: 10px;
            min-width: 25px;
          }
          
          .espaco-resposta {
            border-bottom: 1px solid #ccc;
            margin: 15px 0;
            min-height: 30px;
          }
          
          .area-calculo {
            border: 1px dashed #ccc;
            padding: 25px;
            margin: 20px 0;
            background: #f9f9f9;
            text-align: center;
            color: #666;
            font-style: italic;
            min-height: 80px;
          }
          
          .section {
            margin-bottom: 25px;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 15px;
            padding-bottom: 5px;
            border-bottom: 2px solid #e5e7eb;
          }
          
          .instructions-section {
            background: #f0f9ff;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            border-left: 4px solid #0ea5e9;
          }
          
          @media print {
            body {
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            .page-content {
              margin: 0;
              padding: 0;
              max-width: none;
              height: auto;
              min-height: calc(100vh - 30mm);
              max-height: calc(100vh - 30mm);
            }
            
            .questao-container {
              page-break-inside: avoid;
              break-inside: avoid;
            }
            
            .section {
              page-break-inside: avoid;
              break-inside: avoid;
            }
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
    const pages = this.splitContentIntoPages(renderedHtml, material.type);
    
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

      // Logo e cabeçalho
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
              color: 'E5E5E5'
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 }
        })
      );

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'SISTEMA EDUCACIONAL',
              bold: true,
              size: 24,
              color: '4F46E5'
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
              text: `${this.getTypeLabel(material.type)} • ${material.subject || 'Disciplina'} • ${material.grade || 'Série'}`,
              size: 20,
              color: '6B7280'
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 600 }
        })
      );

      // Renderizar conteúdo e dividir em páginas
      const renderedHtml = templateService.renderTemplate(this.getTemplateId(material.type), material.content);
      const pages = this.splitContentIntoPages(renderedHtml, material.type);
      
      // Processar cada página
      pages.forEach((pageContent, pageIndex) => {
        if (pageIndex > 0) {
          children.push(
            new Paragraph({
              children: [new PageBreak()],
            })
          );
          
          // Adicionar cabeçalho em páginas subsequentes
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: 'SISTEMA EDUCACIONAL',
                  bold: true,
                  size: 20,
                  color: '4F46E5'
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
        
        // Adicionar rodapé
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
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
                size: 18,
                color: '9CA3AF'
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 }
          })
        );
        
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: 'www.sistemaeducacional.com.br',
                size: 16,
                color: 'CCCCCC'
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
          })
        );
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
