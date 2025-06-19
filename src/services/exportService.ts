import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
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
          <style>
            @page {
              size: A4;
              margin: 1.5cm;
            }
            
            body { 
              margin: 0; 
              padding: 0; 
              font-family: 'Times New Roman', serif;
              background: white;
              display: flex;
              justify-content: center;
              align-items: flex-start;
              min-height: 100vh;
            }
            
            .page {
              width: 100%;
              max-width: 800px;
              background: white;
              padding: 2rem;
              box-sizing: border-box;
              position: relative;
              margin: 0 auto;
              font-family: 'Times New Roman', serif;
              font-size: 12pt;
              line-height: 1.5;
              color: #000;
              min-height: 100vh;
            }

            .shape-circle {
              position: absolute;
              border-radius: 50%;
              opacity: 0.15;
              pointer-events: none;
              z-index: 0;
            }
            .shape-circle.purple {
              width: 200px; 
              height: 200px;
              background: #a78bfa;
              top: 50px; 
              left: -50px;
            }
            .shape-circle.blue {
              width: 250px; 
              height: 250px;
              background: #60a5fa;
              bottom: 200px; 
              right: -80px;
            }
            .shape-circle.pink {
              width: 150px; 
              height: 150px;
              background: #f472b6;
              top: 300px; 
              right: 50px;
            }
            .shape-circle.yellow {
              width: 180px; 
              height: 180px;
              background: #fbbf24;
              bottom: 400px; 
              left: -30px;
            }
            .shape-circle.green {
              width: 200px; 
              height: 200px;
              background: #10b981;
              top: 50px; 
              left: -50px;
            }
            .shape-circle.red {
              width: 200px; 
              height: 200px;
              background: #ef4444;
              top: 50px; 
              left: -50px;
            }
            .shape-circle.orange {
              width: 180px; 
              height: 180px;
              background: #f97316;
              top: 280px; 
              right: -40px;
            }

            .content-wrapper {
              position: relative;
              z-index: 1;
            }
            
            h1 {
              text-align: center;
              margin: 0 0 30px 0;
              font-size: 18pt;
              font-weight: bold;
              text-transform: uppercase;
            }
            
            h1::after {
              content: '';
              width: 80px;
              height: 3px;
              display: block;
              margin: 10px auto 0;
              border-radius: 2px;
            }
            
            .section-title {
              font-weight: bold;
              margin: 25px 0 15px 0;
              font-size: 14pt;
              text-transform: uppercase;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
              font-size: 11pt;
            }
            
            th, td {
              padding: 8px 12px;
              border: 1px solid #333;
              text-align: left;
              vertical-align: top;
            }
            
            th {
              background-color: #f8f9fa;
              font-weight: bold;
              color: #1f2937;
            }
            
            .header-table th {
              color: white;
              padding: 10px;
              font-weight: bold;
              text-align: center;
            }
            
            ul {
              margin: 0 0 20px 20px;
              padding: 0;
            }
            
            li {
              margin-bottom: 8px;
              text-align: justify;
            }
            
            p {
              text-align: justify;
              margin-bottom: 12px;
            }

            .instructions {
              padding: 15px;
              border-left: 4px solid;
              margin-bottom: 30px;
              font-style: italic;
            }

            .question {
              margin-bottom: 30px;
              page-break-inside: avoid;
            }

            .question-header {
              font-weight: bold;
              margin-bottom: 10px;
              font-size: 13pt;
            }

            .question-text {
              margin-bottom: 15px;
              text-align: justify;
            }

            .options {
              margin-left: 20px;
            }

            .option {
              margin-bottom: 8px;
              display: flex;
              align-items: flex-start;
            }

            .option-letter {
              font-weight: bold;
              margin-right: 10px;
              min-width: 25px;
            }

            .answer-space {
              border-bottom: 1px solid #333;
              height: 40px;
              margin: 10px 0;
            }

            .evaluation-info {
              padding: 15px;
              border-left: 4px solid #dc2626;
              margin-bottom: 30px;
            }

            .points {
              background: #fef2f2;
              color: #dc2626;
              padding: 4px 8px;
              border: 1px solid #dc2626;
              border-radius: 4px;
              font-size: 10pt;
            }

            .footer {
              position: fixed;
              bottom: 1.5cm;
              left: 1.5cm;
              right: 1.5cm;
              text-align: center;
              font-size: 10pt;
              color: #666;
              border-top: 1px solid #ddd;
              padding-top: 10px;
              background: white;
              z-index: 2;
            }

            @media print {
              body { 
                margin: 0; 
                padding: 0; 
                background: white;
                display: block;
              }
              .page { 
                box-shadow: none; 
                margin: 0; 
                padding: 1.5cm;
                max-width: none;
                width: 100%;
              }
              .footer {
                position: fixed;
                bottom: 1cm;
                left: 1.5cm;
                right: 1.5cm;
              }
            }
          </style>
        </head>
        <body>
          ${renderedHtml}
        </body>
        </html>
      `);
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

    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: {
              top: 1701, // 1.5cm em twips
              right: 1701, // 1.5cm em twips  
              bottom: 1701, // 1.5cm em twips
              left: 1701, // 1.5cm em twips
            },
          },
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
