
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

      // Adicionar conteúdo específico
      const contentParagraphs = this.getWordContent(material);
      children.push(...contentParagraphs);

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
