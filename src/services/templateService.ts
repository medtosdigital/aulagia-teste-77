export const templateService = {
  generateSlideHTML: (data: any): string => {
    const slideTemplate = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Slides - ${data.tema}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=Lato:wght@300;400;700&display=swap');
        
        body {
            margin: 0;
            padding: 0;
            font-family: 'Lato', sans-serif;
            background: #f0f2f5;
            color: #333;
        }
        
        .slide {
            width: 100%;
            max-width: 1024px;
            height: 768px;
            margin: 0 auto 20px auto;
            background: white;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            border-radius: 12px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            position: relative;
        }
        
        .slide-header {
            background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
            color: white;
            padding: 20px 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .slide-content {
            flex: 1;
            padding: 40px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
        }
        
        h1 {
            font-family: 'Poppins', sans-serif;
            font-size: 3.5rem;
            font-weight: 900;
            margin: 0 0 30px 0;
            color: #333;
            line-height: 1.2;
            letter-spacing: -1px;
        }
        
        h2 {
            font-family: 'Poppins', sans-serif;
            font-size: 2.5rem;
            font-weight: 800;
            margin: 0 0 25px 0;
            color: #333;
        }
        
        h3 {
            font-family: 'Poppins', sans-serif;
            font-size: 2rem;
            font-weight: 700;
            margin: 0 0 20px 0;
            color: #007bff;
        }
        
        p {
            font-size: 1.3rem;
            line-height: 1.6;
            margin-bottom: 20px;
            color: #555;
        }
        
        ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        li {
            font-size: 1.2rem;
            margin-bottom: 15px;
            position: relative;
            padding-left: 30px;
            color: #555;
        }
        
        li::before {
            content: '✓';
            position: absolute;
            left: 0;
            color: #007bff;
            font-weight: bold;
            font-size: 1.4rem;
        }
        
        .professor-info {
            font-size: 1.4rem;
            color: white;
            margin-top: 20px;
        }
        
        .subtitle {
            font-size: 1.6rem;
            color: #ccc;
            margin-top: 10px;
            font-weight: 400;
        }
        
        .image-placeholder {
            width: 300px;
            height: 200px;
            background: #f8f9fa;
            border: 2px dashed #ddd;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #888;
            font-size: 1.1rem;
            margin: 20px auto;
        }
    </style>
</head>
<body>

<!-- Slide 1: Capa -->
<div class="slide">
    <div class="slide-header">
        <div>
            <h2 style="margin: 0; font-size: 2rem;">AulagIA</h2>
        </div>
        <div style="text-align: right;">
            <span style="font-size: 1.2rem; font-weight: 600;">${data.disciplina || 'Disciplina'}</span>
        </div>
    </div>
    <div class="slide-content">
        <h1>${data.tema}</h1>
        <p class="subtitle">Aula de ${data.disciplina} - ${data.serie}</p>
        <div class="professor-info" style="color: #333; margin-top: 40px;">
            <span style="color: #ffa500; font-weight: 600;">Apresentado por:</span><br>
            <strong style="font-size: 1.6rem;">Professor(a): ${data.professor}</strong>
        </div>
        <div class="image-placeholder">
            ${data.tema_imagem || 'Imagem aqui'}
        </div>
    </div>
</div>

<!-- Slide 2: Objetivos -->
<div class="slide">
    <div class="slide-header">
        <div>
            <h2 style="margin: 0; font-size: 2rem;">AulagIA</h2>
        </div>
        <div style="text-align: right;">
            <span style="font-size: 1.2rem; font-weight: 600;">${data.disciplina || 'Disciplina'}</span>
        </div>
    </div>
    <div class="slide-content">
        <h2>Objetivos da Aula</h2>
        <p style="font-weight: 600; font-size: 1.4rem; color: #333; margin-bottom: 30px;">Nossos objetivos para hoje:</p>
        <ul>
            ${(data.objetivos || []).map((objetivo: string) => `<li>${objetivo}</li>`).join('')}
        </ul>
    </div>
</div>

<!-- Slide 3: Introdução -->
<div class="slide">
    <div class="slide-header">
        <div>
            <h2 style="margin: 0; font-size: 2rem;">AulagIA</h2>
        </div>
        <div style="text-align: right;">
            <span style="font-size: 1.2rem; font-weight: 600;">${data.disciplina || 'Disciplina'}</span>
        </div>
    </div>
    <div class="slide-content">
        <h2>Introdução</h2>
        <p>${data.introducao}</p>
        <div class="image-placeholder">
            ${data.introducao_imagem || 'Imagem aqui'}
        </div>
    </div>
</div>

<!-- Slide 4: Conceitos -->
<div class="slide">
    <div class="slide-header">
        <div>
            <h2 style="margin: 0; font-size: 2rem;">AulagIA</h2>
        </div>
        <div style="text-align: right;">
            <span style="font-size: 1.2rem; font-weight: 600;">${data.disciplina || 'Disciplina'}</span>
        </div>
    </div>
    <div class="slide-content">
        <h2>Conceitos Fundamentais</h2>
        <p>${data.conceitos}</p>
        <div class="image-placeholder">
            ${data.conceitos_imagem || 'Imagem aqui'}
        </div>
    </div>
</div>

<!-- Slide 5: Exemplo -->
<div class="slide">
    <div class="slide-header">
        <div>
            <h2 style="margin: 0; font-size: 2rem;">AulagIA</h2>
        </div>
        <div style="text-align: right;">
            <span style="font-size: 1.2rem; font-weight: 600;">${data.disciplina || 'Disciplina'}</span>
        </div>
    </div>
    <div class="slide-content">
        <h2>Exemplo</h2>
        <p>${data.exemplo}</p>
        <div class="image-placeholder">
            ${data.exemplo_imagem || 'Imagem aqui'}
        </div>
    </div>
</div>

<!-- Slide 6: Desenvolvimento 1 -->
<div class="slide">
    <div class="slide-header">
        <div>
            <h2 style="margin: 0; font-size: 2rem;">AulagIA</h2>
        </div>
        <div style="text-align: right;">
            <span style="font-size: 1.2rem; font-weight: 600;">${data.disciplina || 'Disciplina'}</span>
        </div>
    </div>
    <div class="slide-content">
        <h2>Desenvolvimento - Parte 1</h2>
        <p>${data.desenvolvimento1}</p>
        <div class="image-placeholder">
            ${data.desenvolvimento1_imagem || 'Imagem aqui'}
        </div>
    </div>
</div>

<!-- Slide 7: Desenvolvimento 2 -->
<div class="slide">
    <div class="slide-header">
        <div>
            <h2 style="margin: 0; font-size: 2rem;">AulagIA</h2>
        </div>
        <div style="text-align: right;">
            <span style="font-size: 1.2rem; font-weight: 600;">${data.disciplina || 'Disciplina'}</span>
        </div>
    </div>
    <div class="slide-content">
        <h2>Desenvolvimento - Parte 2</h2>
        <p>${data.desenvolvimento2}</p>
        <div class="image-placeholder">
            ${data.desenvolvimento2_imagem || 'Imagem aqui'}
        </div>
    </div>
</div>

<!-- Slide 8: Desenvolvimento 3 -->
<div class="slide">
    <div class="slide-header">
        <div>
            <h2 style="margin: 0; font-size: 2rem;">AulagIA</h2>
        </div>
        <div style="text-align: right;">
            <span style="font-size: 1.2rem; font-weight: 600;">${data.disciplina || 'Disciplina'}</span>
        </div>
    </div>
    <div class="slide-content">
        <h2>Desenvolvimento - Parte 3</h2>
        <p>${data.desenvolvimento3}</p>
        <div class="image-placeholder">
            ${data.desenvolvimento3_imagem || 'Imagem aqui'}
        </div>
    </div>
</div>

<!-- Slide 9: Desenvolvimento 4 -->
<div class="slide">
    <div class="slide-header">
        <div>
            <h2 style="margin: 0; font-size: 2rem;">AulagIA</h2>
        </div>
        <div style="text-align: right;">
            <span style="font-size: 1.2rem; font-weight: 600;">${data.disciplina || 'Disciplina'}</span>
        </div>
    </div>
    <div class="slide-content">
        <h2>Desenvolvimento - Parte 4</h2>
        <p>${data.desenvolvimento4}</p>
        <div class="image-placeholder">
            ${data.desenvolvimento4_imagem || 'Imagem aqui'}
        </div>
    </div>
</div>

<!-- Slide 10: Exemplo Prático -->
<div class="slide">
    <div class="slide-header">
        <div>
            <h2 style="margin: 0; font-size: 2rem;">AulagIA</h2>
        </div>
        <div style="text-align: right;">
            <span style="font-size: 1.2rem; font-weight: 600;">${data.disciplina || 'Disciplina'}</span>
        </div>
    </div>
    <div class="slide-content">
        <h2>Exemplo Prático</h2>
        <p>${data.exemplo_pratico}</p>
        <div class="image-placeholder">
            ${data.imagem_principal || 'Imagem aqui'}
        </div>
    </div>
</div>

<!-- Slide 11: Revisão -->
<div class="slide">
    <div class="slide-header">
        <div>
            <h2 style="margin: 0; font-size: 2rem;">AulagIA</h2>
        </div>
        <div style="text-align: right;">
            <span style="font-size: 1.2rem; font-weight: 600;">${data.disciplina || 'Disciplina'}</span>
        </div>
    </div>
    <div class="slide-content">
        <h2>Revisão</h2>
        <p>Vamos revisar os principais pontos da aula:</p>
        <ul>
            ${(data.objetivos || []).slice(0, 3).map((objetivo: string) => `<li>${objetivo}</li>`).join('')}
        </ul>
    </div>
</div>

<!-- Slide 12: Obrigado -->
<div class="slide">
    <div class="slide-header">
        <div>
            <h2 style="margin: 0; font-size: 2rem;">AulagIA</h2>
        </div>
        <div style="text-align: right;">
            <span style="font-size: 1.2rem; font-weight: 600;">${data.disciplina || 'Disciplina'}</span>
        </div>
    </div>
    <div class="slide-content">
        <h1 style="font-size: 4rem; color: #007bff;">Obrigado(a)!</h1>
        <p style="font-size: 1.4rem; margin-top: 30px;">Dúvidas?</p>
    </div>
</div>

</body>
</html>
    `;

    return slideTemplate;
  },
};
