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

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = margin;

    // Título
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text(material.title, margin, yPosition);
    yPosition += 15;

    // Subtítulo
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`${this.getTypeLabel(material.type)} • ${material.subject} • ${material.grade}`, margin, yPosition);
    yPosition += 20;

    // Conteúdo baseado no tipo
    switch (material.type) {
      case 'plano-de-aula':
        this.addLessonPlanToPDF(doc, material.content as LessonPlan, yPosition);
        break;
      case 'atividade':
        this.addActivityToPDF(doc, material.content as Activity, yPosition);
        break;
      case 'avaliacao':
        this.addAssessmentToPDF(doc, material.content as Assessment, yPosition);
        break;
    }

    doc.save(`${material.title}.pdf`);
  }

  private async exportSlidesToPDF(material: GeneratedMaterial): Promise<void> {
    const doc = new jsPDF('landscape', 'mm', [254, 190.5]); // 4:3 ratio
    const slides = material.content as Slide[];
    
    // Renderizar HTML completo usando o template
    const renderedHtml = templateService.renderTemplate('2', slides);
    
    // Extrair slides do HTML renderizado
    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(renderedHtml, 'text/html');
    const slideElements = htmlDoc.querySelectorAll('.slide');
    
    slideElements.forEach((slideElement, index) => {
      if (index > 0) doc.addPage();
      
      const textContent = slideElement.querySelector('.text-content');
      const imageContent = slideElement.querySelector('.image-side');
      
      const title = textContent?.querySelector('.title')?.textContent || `Slide ${index + 1}`;
      const content = textContent?.querySelector('.content')?.textContent || '';
      const table = textContent?.querySelector('.table');
      const grid = textContent?.querySelector('.grid');
      
      // Fundo azul claro
      doc.setFillColor(224, 242, 254);
      doc.rect(0, 0, 254, 190.5, 'F');
      
      // Fundo branco do slide
      doc.setFillColor(255, 255, 255);
      doc.rect(20, 20, 214, 150.5, 'F');
      
      // Título - usando cor #0f172a
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text(title, 30, 40);
      
      // Conteúdo - usando cor #1e293b
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
      
      // Tabela
      if (table) {
        const rows = table.querySelectorAll('tr');
        y += 10;
        rows.forEach((row) => {
          const cells = row.querySelectorAll('th, td');
          let x = 30;
          cells.forEach((cell) => {
            // Fundo cinza para headers
            if (cell.tagName === 'TH') {
              doc.setFillColor(243, 244, 246);
              doc.rect(x, y - 5, 30, 10, 'F');
            }
            doc.text(cell.textContent || '', x + 2, y);
            x += 32;
          });
          y += 12;
        });
      }
      
      // Grid
      if (grid) {
        const boxes = grid.querySelectorAll('.box');
        let x = 30;
        let gridY = y + 10;
        boxes.forEach((box, boxIndex) => {
          // Fundo amarelo claro (#fef9c3)
          doc.setFillColor(254, 249, 195);
          doc.rect(x, gridY, 50, 20, 'F');
          
          const boxText = box.textContent || '';
          const boxLines = doc.splitTextToSize(boxText, 45);
          let boxTextY = gridY + 8;
          boxLines.forEach((line: string) => {
            doc.text(line, x + 2, boxTextY);
            boxTextY += 6;
          });
          
          if (boxIndex % 2 === 1) {
            x = 30;
            gridY += 25;
          } else {
            x += 55;
          }
        });
      }
    });

    doc.save(`${material.title}-slides.pdf`);
  }

  async exportToWord(material: GeneratedMaterial): Promise<void> {
    let children: any[] = [];

    // Título
    children.push(
      new Paragraph({
        children: [new TextRun({ text: material.title, bold: true, size: 32 })],
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
      })
    );

    // Subtítulo
    children.push(
      new Paragraph({
        children: [new TextRun(`${this.getTypeLabel(material.type)} • ${material.subject} • ${material.grade}`)],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      })
    );

    // Conteúdo baseado no tipo
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
        properties: {},
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

    // Para slides, usar o PDF otimizado para apresentação
    await this.exportSlidesToPDF(material);
  }

  private addLessonPlanToPDF(doc: jsPDF, content: LessonPlan, startY: number): void {
    let y = startY;
    const margin = 20;
    const pageHeight = doc.internal.pageSize.getHeight();

    // Informações básicas
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('PLANO DE AULA', margin, y);
    y += 20;

    // Tabela de informações
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const info = [
      ['Professor(a):', content.professor, 'Data:', content.data],
      ['Disciplina:', content.disciplina, 'Série/Ano:', content.serie],
      ['Tema:', content.tema, 'BNCC:', content.bncc],
      ['Duração:', content.duracao, '', '']
    ];

    info.forEach(row => {
      if (y > pageHeight - 30) {
        doc.addPage();
        y = margin;
      }
      doc.text(row[0], margin, y);
      doc.text(row[1], margin + 40, y);
      if (row[2]) doc.text(row[2], margin + 120, y);
      if (row[3]) doc.text(row[3], margin + 160, y);
      y += 15;
    });

    y += 10;

    // Objetivos
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('OBJETIVOS DE APRENDIZAGEM', margin, y);
    y += 15;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    content.objetivos.forEach(obj => {
      if (y > pageHeight - 30) {
        doc.addPage();
        y = margin;
      }
      doc.text(`• ${obj}`, margin + 5, y);
      y += 12;
    });

    y += 10;

    // Habilidades BNCC
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('HABILIDADES BNCC (EF03MA07)', margin, y);
    y += 15;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    content.habilidades.forEach(hab => {
      if (y > pageHeight - 30) {
        doc.addPage();
        y = margin;
      }
      const lines = doc.splitTextToSize(hab, 170);
      lines.forEach((line: string) => {
        doc.text(line, margin + 5, y);
        y += 10;
      });
      y += 5;
    });
  }

  private addActivityToPDF(doc: jsPDF, activity: Activity, startY: number): void {
    let y = startY;
    const margin = 20;

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('ATIVIDADE', margin, y);
    y += 20;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const lines = doc.splitTextToSize(activity.instrucoes, 170);
    lines.forEach((line: string) => {
      doc.text(line, margin, y);
      y += 10;
    });

    y += 15;

    activity.questoes.forEach((questao) => {
      doc.setFont(undefined, 'bold');
      doc.text(`Questão ${questao.numero}`, margin, y);
      y += 12;

      doc.setFont(undefined, 'normal');
      const questionLines = doc.splitTextToSize(questao.pergunta, 170);
      questionLines.forEach((line: string) => {
        doc.text(line, margin, y);
        y += 10;
      });

      if (questao.opcoes) {
        questao.opcoes.forEach((opcao) => {
          doc.text(`• ${opcao}`, margin + 10, y);
          y += 10;
        });
      }

      y += 15;
    });
  }

  private addAssessmentToPDF(doc: jsPDF, assessment: Assessment, startY: number): void {
    let y = startY;
    const margin = 20;

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('AVALIAÇÃO', margin, y);
    y += 20;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const lines = doc.splitTextToSize(assessment.instrucoes, 170);
    lines.forEach((line: string) => {
      doc.text(line, margin, y);
      y += 10;
    });

    y += 15;

    assessment.questoes.forEach((questao) => {
      doc.setFont(undefined, 'bold');
      doc.text(`Questão ${questao.numero} (${questao.pontuacao} pontos)`, margin, y);
      y += 12;

      doc.setFont(undefined, 'normal');
      const questionLines = doc.splitTextToSize(questao.pergunta, 170);
      questionLines.forEach((line: string) => {
        doc.text(line, margin, y);
        y += 10;
      });

      if (questao.opcoes) {
        questao.opcoes.forEach((opcao) => {
          doc.text(`• ${opcao}`, margin + 10, y);
          y += 10;
        });
      }

      y += 15;
    });
  }

  private getLessonPlanWordContent(content: LessonPlan): any[] {
    const paragraphs = [];

    // Seção de informações básicas
    paragraphs.push(new Paragraph({
      children: [new TextRun({ text: 'PLANO DE AULA', bold: true, size: 24 })],
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 }
    }));

    // Informações da aula
    paragraphs.push(new Paragraph({
      children: [new TextRun({ text: 'Informações da Aula', bold: true, size: 20 })],
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 }
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

    // Objetivos
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
