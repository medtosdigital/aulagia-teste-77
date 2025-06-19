
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Header, Footer } from 'docx';
import { saveAs } from 'file-saver';
import { GeneratedMaterial, LessonPlan, Activity, Slide, Assessment } from './materialService';
import { templateService } from './templateService';

class ExportService {
  async exportToPDF(material: GeneratedMaterial): Promise<void> {
    if (material.type === 'slides') {
      await this.exportSlidesToPDF(material);
      return;
    }

    // Usar o template renderizado igual à visualização
    const renderedHtml = templateService.renderTemplate(this.getTemplateId(material.type), material.content);
    
    // Criar nova janela para capturar o conteúdo renderizado
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${material.title}</title>
          <meta charset="utf-8">
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            @page {
              size: A4;
              margin: 20mm 15mm 25mm 15mm;
            }
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body { 
              margin: 0; 
              padding: 0; 
              font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: white;
              width: 100%;
              height: 100vh;
              font-size: 11pt;
              line-height: 1.4;
              color: #1f2937;
            }
            
            .page-container {
              position: relative;
              width: 100%;
              min-height: 100vh;
              background: white;
              overflow: hidden;
            }

            .shape-circle {
              position: absolute;
              border-radius: 50%;
              opacity: 0.1;
              pointer-events: none;
              z-index: 1;
            }
            
            .shape-circle.top {
              width: 180px; 
              height: 180px;
              background: #3b82f6;
              top: -60px; 
              left: -40px;
            }
            
            .shape-circle.bottom {
              width: 240px; 
              height: 240px;
              background: #60a5fa;
              bottom: -80px; 
              right: -60px;
            }

            .header {
              position: fixed;
              top: 15mm;
              left: 15mm;
              right: 15mm;
              display: flex;
              align-items: center;
              z-index: 10;
              background: transparent;
            }
            
            .header .logo {
              width: 42px;
              height: 42px;
              background: #3b82f6;
              border-radius: 8px;
              margin-right: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: 600;
              font-size: 16px;
            }
            
            .header .texts h1 {
              font-size: 1.5rem;
              color: #3b82f6;
              margin: 0;
              font-weight: 600;
            }
            
            .header .texts p {
              font-size: 0.8rem;
              color: #6b7280;
              margin: 0;
            }

            .content {
              position: relative;
              z-index: 5;
              margin-top: 80px;
              margin-bottom: 60px;
              padding: 0 15mm;
            }

            .footer {
              position: fixed;
              bottom: 15mm;
              left: 15mm;
              right: 15mm;
              text-align: center;
              font-size: 0.7rem;
              color: #9ca3af;
              border-top: 1px solid #e5e7eb;
              padding-top: 8px;
              background: white;
              z-index: 10;
            }

            @media print {
              body { 
                margin: 0 !important; 
                padding: 0 !important; 
                background: white !important;
                width: 100% !important;
                height: 100vh !important;
              }
              
              .page-container { 
                box-shadow: none !important; 
                margin: 0 !important; 
                padding: 0 !important;
                max-width: none !important;
                width: 100% !important;
                height: 100vh !important;
                page-break-after: always;
              }
              
              .page-container:last-child {
                page-break-after: avoid;
              }

              .header {
                position: fixed !important;
                top: 15mm !important;
                left: 15mm !important;
                right: 15mm !important;
              }

              .footer {
                position: fixed !important;
                bottom: 15mm !important;
                left: 15mm !important;
                right: 15mm !important;
                display: block !important;
              }

              .content {
                margin-top: 80px !important;
                margin-bottom: 60px !important;
                padding: 0 15mm !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="page-container">
            <div class="shape-circle top"></div>
            <div class="shape-circle bottom"></div>
            
            <div class="header">
              <div class="logo">📖</div>
              <div class="texts">
                <h1>aulagIA</h1>
                <p>Sua aula com toque mágico</p>
              </div>
            </div>
            
            <div class="content">
              ${renderedHtml.replace(/<body[^>]*>|<\/body>|<html[^>]*>|<\/html>|<head[^>]*>[\s\S]*?<\/head>/gi, '')}
            </div>
            
            <div class="footer">
              Plano de aula gerado pela aulagIA - Sua aula com toque mágico em ${new Date().toLocaleDateString('pt-BR')} • Template Padrão
            </div>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 1000);
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
    let children: any[] = [];

    children.push(
      new Paragraph({
        children: [new TextRun({ text: material.title, bold: true, size: 32 })],
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
      })
    );

    children.push(
      new Paragraph({
        children: [new TextRun(`${this.getTypeLabel(material.type)} • ${material.subject} • ${material.grade}`)],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      })
    );

    // Adicionar rodapé com logo aulagIA
    children.push(
      new Paragraph({
        children: [new TextRun('')],
        spacing: { after: 200 }
      })
    );

    switch (material.type) {
      case 'plano-de-aula':
        children = [...children, ...this.getLessonPlanWordContent(material.content as LessonPlan)];
        break;
      case 'slides':
        children = [...children, ...this.getSlidesWordContent(material.content as Slide[])];
        break;
      case 'atividade':
        children = [...children, ...this.getActivityWordContent(material.content as Activity)];
        break;
      case 'avaliacao':
        children = [...children, ...this.getAssessmentWordContent(material.content as Assessment)];
        break;
    }

    // Adicionar rodapé
    children.push(
      new Paragraph({
        children: [new TextRun('')],
        spacing: { before: 400 }
      })
    );

    children.push(
      new Paragraph({
        children: [new TextRun({ text: `Documento gerado pela aulagIA - Sua aula com toque mágico em ${new Date().toLocaleDateString('pt-BR')}`, size: 16, color: '9CA3AF' })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 200 }
      })
    );

    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: {
              top: 851, // 1.5cm em twips
              right: 851, // 1.5cm em twips  
              bottom: 851, // 1.5cm em twips
              left: 851, // 1.5cm em twips
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: 'aulagIA', bold: true, size: 24, color: '3B82F6' }),
                  new TextRun({ text: ' - Sua aula com toque mágico', size: 16, color: '6B7280' })
                ],
                alignment: AlignmentType.LEFT,
              })
            ]
          })
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: `Documento gerado pela aulagIA em ${new Date().toLocaleDateString('pt-BR')}`, size: 16, color: '9CA3AF' })
                ],
                alignment: AlignmentType.CENTER,
              })
            ]
          })
        },
        children: children
      }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${material.title}.docx`);
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

  private getLessonPlanWordContent(content: LessonPlan): any[] {
    const paragraphs = [];

    paragraphs.push(new Paragraph({
      children: [new TextRun({ text: 'PLANO DE AULA', bold: true, size: 24 })],
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 }
    }));

    const infoItems = [
      `Professor(a): ${content.professor}`,
      `Disciplina: ${content.disciplina}`,
      `Tema: ${content.tema}`,
      `Duração: ${content.duracao}`,
      `Data: ${content.data}`,
      `Série/Ano: ${content.serie}`,
      `BNCC: ${content.bncc}`
    ];

    infoItems.forEach(item => {
      paragraphs.push(new Paragraph({
        children: [new TextRun(item)],
        spacing: { after: 100 }
      }));
    });

    paragraphs.push(new Paragraph({
      children: [new TextRun({ text: 'Objetivos de Aprendizagem', bold: true, size: 20 })],
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 }
    }));

    content.objetivos.forEach(objetivo => {
      paragraphs.push(new Paragraph({
        children: [new TextRun(`• ${objetivo}`)],
        spacing: { after: 100 }
      }));
    });

    return paragraphs;
  }

  private getSlidesWordContent(slides: Slide[]): any[] {
    const paragraphs: any[] = [];

    slides.forEach((slide, index) => {
      if (index > 0) {
        paragraphs.push(new Paragraph({
          children: [new TextRun('')],
          pageBreakBefore: true
        }));
      }

      paragraphs.push(new Paragraph({
        children: [new TextRun({ text: `Slide ${slide.numero}: ${slide.titulo}`, bold: true, size: 24 })],
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      }));

      slide.conteudo.forEach(item => {
        paragraphs.push(new Paragraph({
          children: [new TextRun(item)],
          spacing: { after: 200 }
        }));
      });
    });

    return paragraphs;
  }

  private getActivityWordContent(activity: Activity): any[] {
    const paragraphs = [];

    paragraphs.push(new Paragraph({
      children: [new TextRun({ text: 'ATIVIDADE', bold: true, size: 24 })],
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 }
    }));

    paragraphs.push(new Paragraph({
      children: [new TextRun(activity.instrucoes)],
      spacing: { after: 400 }
    }));

    activity.questoes.forEach(questao => {
      paragraphs.push(new Paragraph({
        children: [new TextRun({ text: `Questão ${questao.numero}`, bold: true })],
        spacing: { before: 300, after: 100 }
      }));

      paragraphs.push(new Paragraph({
        children: [new TextRun(questao.pergunta)],
        spacing: { after: 200 }
      }));

      if (questao.opcoes) {
        questao.opcoes.forEach(opcao => {
          paragraphs.push(new Paragraph({
            children: [new TextRun(`• ${opcao}`)],
            spacing: { after: 100 }
          }));
        });
      }
    });

    return paragraphs;
  }

  private getAssessmentWordContent(assessment: Assessment): any[] {
    const paragraphs = [];

    paragraphs.push(new Paragraph({
      children: [new TextRun({ text: 'AVALIAÇÃO', bold: true, size: 24 })],
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 }
    }));

    paragraphs.push(new Paragraph({
      children: [new TextRun(assessment.instrucoes)],
      spacing: { after: 400 }
    }));

    assessment.questoes.forEach(questao => {
      paragraphs.push(new Paragraph({
        children: [new TextRun({ text: `Questão ${questao.numero} (${questao.pontuacao} pontos)`, bold: true })],
        spacing: { before: 300, after: 100 }
      }));

      paragraphs.push(new Paragraph({
        children: [new TextRun(questao.pergunta)],
        spacing: { after: 200 }
      }));

      if (questao.opcoes) {
        questao.opcoes.forEach(opcao => {
          paragraphs.push(new Paragraph({
            children: [new TextRun(`• ${opcao}`)],
            spacing: { after: 100 }
          }));
        });
      }
    });

    return paragraphs;
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
