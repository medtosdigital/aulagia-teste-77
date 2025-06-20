
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
              margin: 0;
            }
            
            body { 
              margin: 0; 
              padding: 0; 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: white;
              width: 100%;
              height: 100vh;
            }
            
            .page {
              width: 100%;
              height: 100vh;
              background: white;
              margin: 0;
              padding: 0;
              box-sizing: border-box;
              position: relative;
              overflow: hidden;
            }

            @media print {
              body { 
                margin: 0 !important; 
                padding: 0 !important; 
                background: white !important;
                width: 100% !important;
                height: 100vh !important;
              }
              
              .page { 
                box-shadow: none !important; 
                margin: 0 !important; 
                padding: 0 !important;
                max-width: none !important;
                width: 100% !important;
                height: 100vh !important;
                page-break-after: avoid !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="page">
            ${renderedHtml}
          </div>
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
    try {
      let children: any[] = [];

      // Título do documento
      children.push(
        new Paragraph({
          children: [new TextRun({ text: material.title, bold: true, size: 32 })],
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        })
      );

      // Informações básicas
      children.push(
        new Paragraph({
          children: [new TextRun(`${this.getTypeLabel(material.type)} • ${material.subject} • ${material.grade}`)],
          alignment: AlignmentType.CENTER,
          spacing: { after: 600 }
        })
      );

      // Adicionar conteúdo específico baseado no tipo
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

      // Criar documento com configuração simplificada
      const doc = new Document({
        sections: [{
          properties: {},
          children: children
        }]
      });

      // Gerar e baixar o arquivo
      const blob = await Packer.toBlob(doc);
      const fileName = `${material.title.replace(/[^a-zA-Z0-9\s]/g, '')}.docx`;
      saveAs(blob, fileName);

    } catch (error) {
      console.error('Erro ao exportar para Word:', error);
      throw new Error('Falha na exportação para Word. Verifique o conteúdo do material.');
    }
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

    try {
      // Seção de informações básicas
      paragraphs.push(new Paragraph({
        children: [new TextRun({ text: 'INFORMAÇÕES BÁSICAS', bold: true, size: 20 })],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 }
      }));

      const basicInfo = [
        `Professor(a): ${content.professor || 'Não informado'}`,
        `Disciplina: ${content.disciplina || 'Não informado'}`,
        `Tema: ${content.tema || 'Não informado'}`,
        `Duração: ${content.duracao || 'Não informado'}`,
        `Data: ${content.data || 'Não informado'}`,
        `Série/Ano: ${content.serie || 'Não informado'}`
      ];

      basicInfo.forEach(item => {
        paragraphs.push(new Paragraph({
          children: [new TextRun(item)],
          spacing: { after: 120 }
        }));
      });

      // Objetivos de Aprendizagem
      if (content.objetivos && content.objetivos.length > 0) {
        paragraphs.push(new Paragraph({
          children: [new TextRun({ text: 'OBJETIVOS DE APRENDIZAGEM', bold: true, size: 20 })],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 }
        }));

        content.objetivos.forEach(objetivo => {
          paragraphs.push(new Paragraph({
            children: [new TextRun(`• ${objetivo}`)],
            spacing: { after: 120 }
          }));
        });
      }

      // Habilidades BNCC
      if (content.habilidades && content.habilidades.length > 0) {
        paragraphs.push(new Paragraph({
          children: [new TextRun({ text: 'HABILIDADES BNCC', bold: true, size: 20 })],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 }
        }));

        content.habilidades.forEach(habilidade => {
          paragraphs.push(new Paragraph({
            children: [new TextRun(`• ${habilidade}`)],
            spacing: { after: 120 }
          }));
        });
      }

      // Desenvolvimento da Aula
      if (content.desenvolvimento && Array.isArray(content.desenvolvimento)) {
        paragraphs.push(new Paragraph({
          children: [new TextRun({ text: 'DESENVOLVIMENTO DA AULA', bold: true, size: 20 })],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 }
        }));

        content.desenvolvimento.forEach((etapa: any) => {
          paragraphs.push(new Paragraph({
            children: [new TextRun({ text: `${etapa.etapa || 'Etapa'}:`, bold: true })],
            spacing: { before: 200, after: 100 }
          }));
          
          if (etapa.atividade) {
            paragraphs.push(new Paragraph({
              children: [new TextRun(`Atividade: ${etapa.atividade}`)],
              spacing: { after: 80 }
            }));
          }
          
          if (etapa.tempo) {
            paragraphs.push(new Paragraph({
              children: [new TextRun(`Tempo: ${etapa.tempo}`)],
              spacing: { after: 80 }
            }));
          }
          
          if (etapa.recursos) {
            paragraphs.push(new Paragraph({
              children: [new TextRun(`Recursos: ${etapa.recursos}`)],
              spacing: { after: 120 }
            }));
          }
        });
      }

      // Recursos Didáticos
      if (content.recursos && Array.isArray(content.recursos) && content.recursos.length > 0) {
        paragraphs.push(new Paragraph({
          children: [new TextRun({ text: 'RECURSOS DIDÁTICOS', bold: true, size: 20 })],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 }
        }));

        content.recursos.forEach(recurso => {
          paragraphs.push(new Paragraph({
            children: [new TextRun(`• ${recurso}`)],
            spacing: { after: 120 }
          }));
        });
      }

      // Avaliação
      if (content.avaliacao) {
        paragraphs.push(new Paragraph({
          children: [new TextRun({ text: 'AVALIAÇÃO', bold: true, size: 20 })],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 }
        }));

        paragraphs.push(new Paragraph({
          children: [new TextRun(content.avaliacao)],
          spacing: { after: 120 }
        }));
      }

    } catch (error) {
      console.error('Erro ao processar conteúdo do plano de aula:', error);
      paragraphs.push(new Paragraph({
        children: [new TextRun('Erro ao processar o conteúdo do plano de aula.')],
        spacing: { after: 120 }
      }));
    }

    return paragraphs;
  }

  private getSlidesWordContent(slides: Slide[]): any[] {
    const paragraphs: any[] = [];

    try {
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

        if (slide.conteudo && Array.isArray(slide.conteudo)) {
          slide.conteudo.forEach(item => {
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
        children: [new TextRun('Erro ao processar o conteúdo dos slides.')],
        spacing: { after: 120 }
      }));
    }

    return paragraphs;
  }

  private getActivityWordContent(activity: Activity): any[] {
    const paragraphs = [];

    try {
      // Instruções
      if (activity.instrucoes) {
        paragraphs.push(new Paragraph({
          children: [new TextRun({ text: 'INSTRUÇÕES', bold: true, size: 20 })],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 }
        }));

        paragraphs.push(new Paragraph({
          children: [new TextRun(activity.instrucoes)],
          spacing: { after: 400 }
        }));
      }

      // Questões
      if (activity.questoes && Array.isArray(activity.questoes)) {
        activity.questoes.forEach(questao => {
          paragraphs.push(new Paragraph({
            children: [new TextRun({ text: `Questão ${questao.numero}`, bold: true })],
            spacing: { before: 300, after: 100 }
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
    } catch (error) {
      console.error('Erro ao processar atividade:', error);
      paragraphs.push(new Paragraph({
        children: [new TextRun('Erro ao processar o conteúdo da atividade.')],
        spacing: { after: 120 }
      }));
    }

    return paragraphs;
  }

  private getAssessmentWordContent(assessment: Assessment): any[] {
    const paragraphs = [];

    try {
      // Instruções
      if (assessment.instrucoes) {
        paragraphs.push(new Paragraph({
          children: [new TextRun({ text: 'INSTRUÇÕES DA AVALIAÇÃO', bold: true, size: 20 })],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 }
        }));

        paragraphs.push(new Paragraph({
          children: [new TextRun(assessment.instrucoes)],
          spacing: { after: 200 }
        }));
      }

      // Tempo limite
      if (assessment.tempoLimite) {
        paragraphs.push(new Paragraph({
          children: [new TextRun(`Tempo limite: ${assessment.tempoLimite}`)],
          spacing: { after: 400 }
        }));
      }

      // Questões
      if (assessment.questoes && Array.isArray(assessment.questoes)) {
        assessment.questoes.forEach(questao => {
          paragraphs.push(new Paragraph({
            children: [new TextRun({ text: `Questão ${questao.numero} (${questao.pontuacao} pontos)`, bold: true })],
            spacing: { before: 300, after: 100 }
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
    } catch (error) {
      console.error('Erro ao processar avaliação:', error);
      paragraphs.push(new Paragraph({
        children: [new TextRun('Erro ao processar o conteúdo da avaliação.')],
        spacing: { after: 120 }
      }));
    }

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
