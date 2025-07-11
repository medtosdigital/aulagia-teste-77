import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Printer, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from './ui/pagination';
import { exportService } from '@/services/exportService';
import { GeneratedMaterial } from '@/services/materialService';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

interface SlideViewerProps {
  htmlContent: string;
  material?: GeneratedMaterial;
}

const SlideViewer: React.FC<SlideViewerProps> = ({ htmlContent, material }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const isMobile = useIsMobile();

  // Generate slides based on content
  const slides = React.useMemo(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const slideDivs = doc.querySelectorAll('div.slide');
    return Array.from(slideDivs).map(div => ({
      html: div.outerHTML
    }));
  }, [htmlContent]);

  // Função para obter imagem gerada para um slide específico
  const getImagemGerada = (slideIndex: number): string | null => {
    if (!material?.content?.imagensGeradas) return null;
    
    const imagensGeradas = material.content.imagensGeradas;
    const paginasComImagem = [0, 2, 3, 4, 5, 8]; // Páginas 1, 3, 4, 5, 6, 9
    
    if (!paginasComImagem.includes(slideIndex)) return null;
    
    // Mapear índice do slide para a chave da imagem
    switch (slideIndex) {
      case 0: // Página 1 - Capa
        return imagensGeradas.slide_1_imagem || imagensGeradas.tema_imagem || null;
      case 2: // Página 3 - Introdução
        return imagensGeradas.introducao_imagem || null;
      case 3: // Página 4 - Conceito Principal
        return imagensGeradas.conceitos_imagem || null;
      case 4: // Página 5 - Desenvolvimento 1
        return imagensGeradas.desenvolvimento_1_imagem || null;
      case 5: // Página 6 - Desenvolvimento 2
        return imagensGeradas.desenvolvimento_2_imagem || null;
      case 8: // Página 9 - Exemplo Prático
        return imagensGeradas.exemplo_imagem || null;
      default:
        return null;
    }
  };

  const handlePrint = async () => {
    try {
      // Create print-friendly HTML
      const printContent = generatePrintHTML();
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
      }
      toast.success('Slides enviados para impressão!');
    } catch (error) {
      toast.error('Erro ao preparar impressão');
      console.error('Print error:', error);
    }
  };

  const handleExportPDF = async () => {
    try {
      if (material) {
        // Create enhanced material for PDF export
        const enhancedMaterial = {
          ...material,
          content: generatePrintHTML()
        };
        await exportService.exportToPDF(enhancedMaterial);
        toast.success('PDF exportado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao exportar PDF');
    }
  };

  const handleExportPPT = async () => {
    try {
      if (material) {
        // Create enhanced material for PPT export
        const enhancedMaterial = {
          ...material,
          content: generateSlidesForPPT()
        };
        await exportService.exportToPPT(enhancedMaterial);
        toast.success('PowerPoint exportado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao exportar PPT:', error);
      toast.error('Erro ao exportar PowerPoint');
    }
  };

  const generatePrintHTML = () => {
    const today = new Date().toLocaleDateString('pt-BR');
    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Slides - ${material?.title || 'Apresentação'}</title>
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
        ${slides.map((slide, index) => renderSlideForPrint(slide, index)).join('')}
      </body>
      </html>
    `;
  };

  const generateSlidesForPPT = () => {
    return slides.map((slide, index) => ({
      html: slide.html,
      slideNumber: index + 1
    }));
  };

  const renderSlideForPrint = (slide: any, index: number) => {
    const slideNumber = index + 1;
    const today = new Date().toLocaleDateString('pt-BR');
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
          ${renderSlideContent(slide, index)}
        </div>
      </div>
    `;
  };

  const renderSlideContent = (slide: any, index: number) => {
    // Se slide não tem propriedades específicas, apenas retorna o HTML bruto
    if (!slide.title && !slide.type && !slide.objectives) {
      return slide.html;
    }
    // (Se no futuro houver slides com propriedades, pode-se reabilitar o switch acima)
  };

  const renderSlide = (slide: any, index: number) => {
    // Fundo: azul para o primeiro slide e para os ímpares
    const isBlue = index === 0 || index % 2 !== 0;
    const bgClass = isBlue ? 'bg-blue-700' // fundo azul sólido
    : 'bg-white';

    // Detecta se o slide tem imagem central ou ícone destacado
    const hasImagemCentral = /class=['"]imagem-central['"]/.test(slide.html) || /<img /.test(slide.html);
    const hasIcone = /class=['"]icone['"]/.test(slide.html);

    // Cor do texto principal
    const textColor = isBlue ? 'text-white' : 'text-slate-800';
    const subTextColor = isBlue ? 'text-blue-100' : 'text-slate-600';

    // Remove datas do tipo dd/mm/yyyy e números de página do tipo n/n do HTML do slide
    let htmlSemData = slide.html.replace(/\d{2}\/\d{2}\/\d{4}/g, '');
    htmlSemData = htmlSemData.replace(/\b\d{1,2}\s*\/\s*\d{1,2}\b/g, '');

    // Detectar se é slide de agradecimento OU se é o último slide
    const isObrigado = /obrigado\(a\)|obrigado!/i.test(htmlSemData) || index === slides.length - 1;

    // Logo no canto superior esquerdo
    const logoEsquerda = <div className="absolute top-0 left-0 flex items-center gap-2 p-6 z-10">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-md">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-7 h-7">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </div>
        <span className={`text-2xl font-extrabold tracking-tight drop-shadow-sm ${isBlue ? 'text-blue-200' : 'text-blue-700'}`}>AulagIA</span>
      </div>;
    
    // Disciplina no canto superior direito
    const disciplina = material?.subject || 'Disciplina';
    const disciplinaFormatada = disciplina.charAt(0).toUpperCase() + disciplina.slice(1);
    const disciplinaDireita = <div className="absolute top-0 right-0 flex items-center p-6 z-10">
        <span className={`text-lg font-bold ${isBlue ? 'text-white' : 'text-slate-700'}`}>{disciplinaFormatada}</span>
      </div>;

    if (isObrigado) {
      return <div className="relative w-full h-full flex items-center justify-center bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200"
        style={{
          aspectRatio: '4/3',
          width: '100%',
          maxWidth: '950px',
          minWidth: '320px',
          height: 'auto',
          maxHeight: '68vh',
          minHeight: '240px',
          margin: '0 auto',
          fontFamily: 'Poppins, Lato, sans-serif',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fff',
          boxSizing: 'border-box',
        }}>
          {/* Logo com azul forte */}
          <div className="absolute top-0 left-0 flex items-center gap-2 p-6 z-10">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-md">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-7 h-7">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </div>
            <span className="text-2xl font-extrabold tracking-tight drop-shadow-sm" style={{color:'#2563eb'}}>AulagIA</span>
          </div>
          {disciplinaDireita}
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-12" style={{
          maxWidth: 700,
          margin: '0 auto'
        }}>
            <div style={{
            fontSize: '3.2rem',
            fontWeight: 900,
            color: '#1e293b',
            marginBottom: 18,
            letterSpacing: '-2px',
            textShadow: '0 2px 12px #0001',
            textAlign: 'center'
          }}>OBRIGADO(A)!</div>
          <div style={{fontSize:'1.15rem',color:'#64748b',marginBottom:18}}>Para mais materiais educativos, visite:</div>
          <div style={{fontSize:'2rem',fontWeight:700,letterSpacing:'-1px',color:'#2563eb',marginBottom:24,background:'rgba(37,99,235,0.07)',borderRadius:8,padding:'6px 24px',display:'inline-block',boxShadow:'0 2px 8px #2563eb11'}}>aulagia.com.br</div>
          <div style={{fontSize:'1.05rem',color:'#64748b',marginBottom:2}}>Slides gerados pela AulagIA</div>
          <div style={{fontSize:'1.05rem',color:'#94a3b8'}}>Sua aula com toque mágico</div>
          </div>
        </div>;
    }

    // Layout de duas colunas para páginas específicas (1, 3, 4, 5, 6, 9)
    const paginasDuasColunas = [0, 2, 3, 4, 5, 8]; // índices das páginas com imagens
    if (paginasDuasColunas.includes(index)) {
      // Verificar se há imagem gerada para este slide
      const imagemGerada = getImagemGerada(index);
      let imagemHtml = '';
      
      if (imagemGerada) {
        imagemHtml = `<img src="${imagemGerada}" alt="Imagem gerada por IA" style="max-width:100%;max-height:100%;border-radius:16px;object-fit:cover;" />`;
      } else {
        imagemHtml = '<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:1.1rem;color:#888;">Imagem aqui</div>';
      }

      // Para a página 3 (index 2): imagem à esquerda, texto à direita
      if (index === 2) {
        htmlSemData = `
          <div style='display:flex;flex-direction:row;align-items:center;justify-content:center;width:100%;gap:2.5rem;min-height:320px;flex-wrap:wrap;'>
            <div class='imagem-intro' style='flex:1 1 220px;min-width:220px;min-height:220px;max-width:320px;max-height:320px;background:#e5e7eb;border-radius:18px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;color:#888;margin:0 0.5em;'>${imagemHtml}</div>
            <div style='flex:2 1 320px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;min-width:260px;'>
              ${htmlSemData}
            </div>
          </div>
          <style>
            @media (max-width: 800px) {
              .imagem-intro { margin-bottom: 1.5em; }
              .slide-content > div[style*="display:flex"] { flex-direction: column !important; gap: 0.5em !important; }
            }
          </style>
        `;
      } else {
        // Para outras páginas com imagens: imagem à direita, texto à esquerda
        htmlSemData = `
          <div style='display:flex;flex-direction:row;align-items:center;justify-content:center;width:100%;gap:2.5rem;min-height:320px;flex-wrap:wrap;'>
            <div style='flex:2 1 320px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;min-width:260px;'>
              ${htmlSemData}
            </div>
            <div class='imagem-intro' style='flex:1 1 220px;min-width:220px;min-height:220px;max-width:320px;max-height:320px;background:#e5e7eb;border-radius:18px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;color:#888;margin:0 0.5em;'>${imagemHtml}</div>
          </div>
          <style>
            @media (max-width: 800px) {
              .imagem-intro { margin-bottom: 1.5em; }
              .slide-content > div[style*="display:flex"] { flex-direction: column !important; gap: 0.5em !important; }
            }
          </style>
        `;
      }
    }

    if (index === 0) {
      // Layout especial da capa
      let tema = '';
      let disciplina = material?.subject || 'Matemática';
      let serie = material?.grade || 'Ensino Fundamental I-3º Ano';
      let professor = material?.formData?.professor || 'Prof. Maria';
      
      const temaMatch = htmlSemData.match(/<h1[^>]*>(.*?)<\/h1>/i);
      if (temaMatch) tema = temaMatch[1].trim();
      
      let subtitulo = `Aula de ${disciplina} - ${serie}`;
      
      // Imagem para a capa
      const imagemGerada = getImagemGerada(index);
      let imagemHtml = imagemGerada
        ? `<img src="${imagemGerada}" alt="Imagem gerada por IA" style="max-width:100%;max-height:100%;border-radius:16px;object-fit:cover;" />`
        : '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#888;font-size:1.5rem;">Imagem aqui</div>';

      return (
        <div className="relative w-full h-full flex items-center justify-center bg-blue-700 rounded-2xl shadow-2xl overflow-hidden border border-gray-200" style={{
          aspectRatio: '4/3',
          maxWidth: '950px',
          height: '68vh',
          minHeight: '500px',
          margin: '0 auto',
          fontFamily: 'Poppins, Lato, sans-serif'
        }}>
          {/* Logo e nome no canto superior esquerdo */}
          <div className="absolute top-0 left-0 flex items-center gap-2 p-6 z-10">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-md">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-7 h-7">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </div>
            <span className="text-2xl font-extrabold tracking-tight drop-shadow-sm text-blue-200">AulagIA</span>
          </div>
          {/* Disciplina no canto superior direito */}
          <div className="absolute top-0 right-0 flex items-center p-6 z-10">
            <span className="text-lg font-bold text-white">{disciplina}</span>
          </div>
          {/* Bloco Apresentado por fixo no canto inferior esquerdo */}
          <div className="absolute left-0 bottom-0 z-20 p-8" style={{paddingLeft:32,paddingBottom:32}}>
            <div style={{fontWeight: 800, color: '#fde047', fontSize: '1.35rem', marginBottom: 0, textAlign: 'left'}}>Apresentado por:</div>
            <div style={{fontWeight: 700, color: '#fff', fontSize: '1.15rem', textAlign: 'left'}}>Professor(a): {professor}</div>
          </div>
          {/* Conteúdo central em duas colunas */}
          <div className="w-full h-full flex flex-row items-center justify-between p-12 gap-8" style={{maxWidth: 1100, margin: '0 auto'}}>
            {/* Coluna texto */}
            <div className="flex-1 flex flex-col items-start justify-center text-left" style={{minWidth: 320}}>
              <div style={{
                fontSize: '3.2rem',
                fontWeight: 700,
                color: '#fff',
                lineHeight: 1.08,
                letterSpacing: '-1px',
                textShadow: '0 2px 12px #0002',
                marginBottom: 18,
                fontFamily: 'Poppins, Lato, Arial, sans-serif',
                whiteSpace: 'pre-line',
                textAlign: 'left'
              }}>{tema || 'Multiplicação\ne Divisão'}</div>
              <div style={{
                fontSize: '1.2rem',
                fontWeight: 700,
                color: '#fff',
                marginBottom: 32,
                textAlign: 'left',
                textShadow: '0 2px 12px #0002',
                fontFamily: 'Poppins, Lato, Arial, sans-serif'
              }}>{subtitulo}</div>
            </div>
            {/* Coluna imagem */}
            <div className="flex-1 flex flex-col items-center justify-center text-center" style={{minWidth: 320}}>
              <div style={{width: '100%', height: 220, background: '#e5e7eb', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: '1.5rem'}} dangerouslySetInnerHTML={{__html: imagemHtml}} />
            </div>
          </div>
        </div>
      );
    }

    // Renderização padrão para outros slides
    return <div className={`relative w-full h-full flex items-center justify-center ${bgClass} rounded-2xl shadow-2xl overflow-hidden border border-gray-200`} style={{
      aspectRatio: '4/3',
      maxWidth: '950px',
      height: '68vh',
      minHeight: '500px',
      margin: '0 auto',
      fontFamily: 'Poppins, Lato, sans-serif'
    }}>
        {/* Logo no canto superior esquerdo */}
        <div className="absolute top-0 left-0 flex items-center gap-2 p-6 z-10">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-md">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-7 h-7">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </div>
          <span className={`text-2xl font-extrabold tracking-tight drop-shadow-sm ${isBlue ? 'text-blue-200' : 'text-blue-700'}`}>AulagIA</span>
        </div>
        {disciplinaDireita}
        <div className="w-full h-full flex flex-col items-center justify-center p-12" style={{
        maxWidth: 820,
        margin: '0 auto'
      }}>
          {/* Renderização do conteúdo do slide */}
          <div className="w-full h-full flex flex-col items-center justify-center text-center" style={{
        minHeight: 320
      }}>
            <div className={`w-full slide-content-rich ${textColor}`} style={{
          fontSize: '1.35rem',
          fontWeight: 500,
          lineHeight: 1.5
        }}>
              <div dangerouslySetInnerHTML={{
            __html: `
                  <style>
                    .slide-content-rich ul { list-style: disc inside; color: ${isBlue ? '#fff' : '#2563eb'}; font-size: 1.25rem; margin: 1.2em 0; font-weight: 700; }
                    .slide-content-rich li { margin-bottom: 0.7em; font-size: 1.18rem; }
                    .slide-content-rich .formula { background: #fef9c3; color: #b45309; font-family: 'Fira Mono', monospace; font-size: 1.3em; padding: 0.7em 1.3em; border-radius: 10px; margin: 1em auto; display: inline-block; box-shadow: 0 2px 12px #fde68a55; }
                    .slide-content-rich .imagem-central { display: flex; justify-content: center; margin: 1.5em 0; }
                    .slide-content-rich .imagem-central img { max-width: 340px; max-height: 220px; border-radius: 14px; box-shadow: 0 4px 24px #6366f133; border: 2px solid #e0e7ff; }
                    .slide-content-rich .icone { display: inline-block; margin: 0 0.3em; font-size: 2.3em; vertical-align: middle; color: #0ea5e9; }
                    .slide-content-rich .forma { display: inline-block; margin: 0 0.5em; vertical-align: middle; }
                    .slide-content-rich .forma svg { width: 54px; height: 54px; }
                    .slide-content-rich h2, .slide-content-rich h3 { color: ${isBlue ? '#fff' : '#2563eb'}; font-size: 2.1rem; font-weight: 800; margin: 1.2em 0 0.7em 0; }
                  </style>
                  ${htmlSemData}
                `
          }} />
          </div>
          </div>
        </div>
      </div>;
  };

  if (slides.length === 0) {
    return <div className="flex items-center justify-center h-96 text-gray-500">
        Nenhum slide encontrado
      </div>;
  }

  return <div className="w-full h-full flex flex-col">
      {/* Slide Content com proporção 4:3 corrigida */}
      <div className="flex-1 flex justify-center items-center p-4">
        {isMobile ?
      // Mobile: Container com altura muito maior para visualização adequada
      <div className="w-full bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200" style={{
        aspectRatio: '4/3',
        width: '100%',
        maxWidth: '95vw',
        minWidth: '240px',
        height: 'auto',
        maxHeight: '75vh',
        minHeight: '180px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fff',
        boxSizing: 'border-box',
      }}>
            <div className="w-full h-full flex items-center justify-center" style={{aspectRatio:'4/3'}}>
              {renderSlide(slides[currentSlide], currentSlide)}
            </div>
          </div> :
      // Desktop: Container com largura e altura balanceadas para não cortar
      <div className="w-full bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200" style={{
        aspectRatio: '4/3',
        width: '100%',
        maxWidth: '950px',
        minWidth: '320px',
        height: 'auto',
        maxHeight: '68vh',
        minHeight: '240px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fff',
        boxSizing: 'border-box',
      }}>
            <div className="w-full h-full flex items-center justify-center" style={{aspectRatio:'4/3'}}>
              {renderSlide(slides[currentSlide], currentSlide)}
            </div>
          </div>}
      </div>

      {/* Desktop Navigation */}
      {!isMobile && <div className="bg-white border-t border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="flex justify-between items-center max-w-4xl mx-auto">
            {/* Previous Button */}
            <Button variant="outline" onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))} disabled={currentSlide === 0} className="flex items-center gap-2 h-12 px-6 text-base font-semibold bg-white border-2 border-gray-300 hover:bg-gray-50 hover:border-blue-400 transition-all duration-200 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
              <ChevronLeft className="h-5 w-5" />
              Anterior
            </Button>

            {/* Page Info and Numbers */}
            <div className="flex items-center gap-4">
              {/* Page Numbers */}
              <div className="flex items-center gap-2">
                {slides.map((_, index) => <button key={index} onClick={() => setCurrentSlide(index)} className={`w-10 h-10 rounded-full text-sm font-bold transition-all duration-200 ${currentSlide === index ? 'bg-blue-600 text-white shadow-lg scale-110' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:scale-105'}`}>
                    {index + 1}
                  </button>)}
              </div>
            </div>
            {/* Página X de Y flutuante no canto inferior direito, dentro do container azul do slide */}
            {typeof currentSlide !== 'undefined' && (
              <div style={{position: 'fixed', right: 400, bottom: 100, zIndex: 50}} className="hidden md:block text-base font-semibold text-gray-700 bg-gray-100 px-4 py-1 rounded-lg whitespace-nowrap shadow pointer-events-none">
                Página {currentSlide + 1} de {slides.length}
              </div>
            )}

            {/* Next Button */}
            <Button variant="outline" onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))} disabled={currentSlide === slides.length - 1} className="flex items-center gap-2 h-12 px-6 text-base font-semibold bg-white border-2 border-gray-300 hover:bg-gray-50 hover:border-blue-400 transition-all duration-200 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
              Próximo
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>}

      {/* Mobile Navigation */}
      {isMobile && <div className="flex-shrink-0 bg-white border-t border-gray-200">
          <div className="px-4 py-4">
            {/* Principais botões de navegação - AUMENTADOS */}
            <div className="flex justify-between items-center mb-4">
              <Button onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))} disabled={currentSlide === 0} variant="outline" className={`flex items-center gap-3 h-16 px-8 text-lg font-bold rounded-2xl border-3 transition-all duration-200 shadow-lg ${currentSlide === 0 ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300 active:scale-95'}`}>
                <ChevronLeft className="h-6 w-6" />
                Anterior
              </Button>

              <Button onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))} disabled={currentSlide === slides.length - 1} className={`flex items-center gap-3 h-16 px-8 text-lg font-bold rounded-2xl transition-all duration-200 shadow-lg ${currentSlide === slides.length - 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-3 border-gray-200' : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'}`}>
                Próximo
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>

            {/* Indicador de página central - AUMENTADO */}
            <div className="text-center text-lg font-bold text-gray-700 bg-gray-100 py-4 rounded-2xl mb-4">
              Página {currentSlide + 1} de {slides.length}
            </div>

            {/* Números das páginas - AUMENTADOS */}
            <div className="flex justify-center items-center gap-3">
              {slides.map((_, index) => <button key={index} onClick={() => setCurrentSlide(index)} className={`w-14 h-14 rounded-full text-lg font-bold transition-all duration-200 shadow-lg ${currentSlide === index ? 'bg-blue-600 text-white shadow-xl scale-110' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 active:scale-95'}`}>
                  {index + 1}
                </button>)}
            </div>
          </div>
        </div>}
    </div>;
};

export default SlideViewer;
