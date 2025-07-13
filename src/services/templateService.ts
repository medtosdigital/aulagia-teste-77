import Handlebars from 'handlebars';

Handlebars.registerHelper('eq', function (a, b) {
  return a === b;
});

Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {
  switch (operator) {
    case '==':
      return (v1 == v2) ? options.fn(this) : options.inverse(this);
    case '===':
      return (v1 === v2) ? options.fn(this) : options.inverse(this);
    case '!=':
      return (v1 != v2) ? options.fn(this) : options.inverse(this);
    case '!==':
      return (v1 !== v2) ? options.fn(this) : options.inverse(this);
    case '<':
      return (v1 < v2) ? options.fn(this) : options.inverse(this);
    case '<=':
      return (v1 <= v2) ? options.fn(this) : options.inverse(this);
    case '>':
      return (v1 > v2) ? options.fn(this) : options.inverse(this);
    case '>=':
      return (v1 >= v2) ? options.fn(this) : options.inverse(this);
    case '&&':
      return (v1 && v2) ? options.fn(this) : options.inverse(this);
    case '||':
      return (v1 || v2) ? options.fn(this) : options.inverse(this);
    default:
      return options.inverse(this);
  }
});

Handlebars.registerHelper('abc', function (index) {
  return String.fromCharCode(97 + index);
});

export const getPlanoDeAulaTemplate = () => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{titulo}}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
        .info { display: flex; justify-content: space-between; margin-bottom: 20px; }
        .section { margin-bottom: 30px; }
        .section-title { font-size: 1.2em; font-weight: bold; margin-bottom: 10px; }
        .table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .table th { background-color: #f0f0f0; }
        .list { padding-left: 20px; margin-top: 5px; }
        .list li { margin-bottom: 3px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{titulo}}</h1>
        <div class="info">
            <span><strong>Professor(a):</strong> {{professor}}</span>
            <span><strong>Data:</strong> {{data}}</span>
            <span><strong>Disciplina:</strong> {{disciplina}}</span>
            <span><strong>Série:</strong> {{serie}}</span>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Tema</div>
        <p>{{tema}}</p>
    </div>

    <div class="section">
        <div class="section-title">Duração</div>
        <p>{{duracao}}</p>
    </div>

    <div class="section">
        <div class="section-title">Habilidades BNCC</div>
        <table class="table">
            <thead>
                <tr>
                    <th>Código</th>
                    <th>Descrição</th>
                </tr>
            </thead>
            <tbody>
                {{#each habilidades}}
                <tr>
                    <td>{{codigo}}</td>
                    <td>{{descricao}}</td>
                </tr>
                {{/each}}
            </tbody>
        </table>
    </div>

    <div class="section">
        <div class="section-title">Objetivos</div>
        <ul class="list">
            {{#each objetivos}}
            <li>{{this}}</li>
            {{/each}}
        </ul>
    </div>

    <div class="section">
        <div class="section-title">Desenvolvimento</div>
        {{#each desenvolvimento}}
        <div>
            <strong>Etapa:</strong> {{etapa}}<br>
            <strong>Tempo:</strong> {{tempo}}<br>
            <strong>Atividade:</strong> {{atividade}}<br>
            <strong>Recursos:</strong> {{recursos}}
        </div>
        <hr style="margin: 10px 0;">
        {{/each}}
    </div>

    <div class="section">
        <div class="section-title">Recursos</div>
        <ul class="list">
            {{#each recursos}}
            <li>{{this}}</li>
            {{/each}}
        </ul>
    </div>

    <div class="section">
        <div class="section-title">Conteúdos Programáticos</div>
        <ul class="list">
            {{#each conteudosProgramaticos}}
            <li>{{this}}</li>
            {{/each}}
        </ul>
    </div>

    <div class="section">
        <div class="section-title">Metodologia</div>
        <p>{{metodologia}}</p>
    </div>

    <div class="section">
        <div class="section-title">Avaliação</div>
        <p>{{avaliacao}}</p>
    </div>

    <div class="section">
        <div class="section-title">Referências</div>
        <ul class="list">
            {{#each referencias}}
            <li>{{this}}</li>
            {{/each}}
        </ul>
    </div>
</body>
</html>
`;

export const getSlidesTemplate = () => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{titulo}}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .slide { margin-bottom: 30px; border: 1px solid #ddd; padding: 20px; border-radius: 5px; }
        .slide-title { font-size: 1.5em; font-weight: bold; margin-bottom: 10px; text-align: center; }
        .slide-content { margin-top: 20px; }
        .list { padding-left: 20px; margin-top: 5px; }
        .list li { margin-bottom: 3px; }
        .table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .table th { background-color: #f0f0f0; }
        .image { max-width: 100%; height: auto; display: block; margin: 20px auto; }
    </style>
</head>
<body>
    <div class="slide">
        <div class="slide-title">{{slide_1_titulo}}</div>
        <p>{{slide_1_subtitulo}}</p>
        <img src="{{tema_imagem}}" alt="Imagem do Tema" class="image">
    </div>

    <div class="slide">
        <div class="slide-title">Objetivos</div>
        <ul class="list">
            <li>{{objetivo_1}}</li>
            <li>{{objetivo_2}}</li>
            <li>{{objetivo_3}}</li>
            <li>{{objetivo_4}}</li>
        </ul>
    </div>

    <div class="slide">
        <div class="slide-title">Introdução</div>
        <p>{{introducao_texto}}</p>
        <img src="{{introducao_imagem}}" alt="Imagem de Introdução" class="image">
    </div>

    <div class="slide">
        <div class="slide-title">Conceitos</div>
        <p>{{conceitos_texto}}</p>
        <p><strong>Conceito Principal:</strong> {{conceito_principal}}</p>
        <img src="{{conceitos_imagem}}" alt="Imagem dos Conceitos" class="image">
    </div>

    <div class="slide">
        <div class="slide-title">{{desenvolvimento_1_titulo}}</div>
        <p>{{desenvolvimento_1_texto}}</p>
        <img src="{{desenvolvimento_1_imagem}}" alt="Imagem de Desenvolvimento 1" class="image">
    </div>

    <div class="slide">
        <div class="slide-title">{{desenvolvimento_2_titulo}}</div>
        <p>{{desenvolvimento_2_texto}}</p>
        <img src="{{desenvolvimento_2_imagem}}" alt="Imagem de Desenvolvimento 2" class="image">
    </div>

    <div class="slide">
        <div class="slide-title">{{desenvolvimento_3_titulo}}</div>
        <p>{{desenvolvimento_3_texto}}</p>
        <img src="{{desenvolvimento_3_imagem}}" alt="Imagem de Desenvolvimento 3" class="image">
    </div>

    <div class="slide">
        <div class="slide-title">{{desenvolvimento_4_titulo}}</div>
        <p>{{desenvolvimento_4_texto}}</p>
        <img src="{{desenvolvimento_4_imagem}}" alt="Imagem de Desenvolvimento 4" class="image">
    </div>

    <div class="slide">
        <div class="slide-title">{{exemplo_titulo}}</div>
        <p>{{exemplo_conteudo}}</p>
        <img src="{{exemplo_imagem}}" alt="Imagem do Exemplo" class="image">
    </div>

    <div class="slide">
        <div class="slide-title">{{tabela_titulo}}</div>
        <table class="table">
            <thead>
                <tr>
                    <th>{{coluna_1}}</th>
                    <th>{{coluna_2}}</th>
                    <th>{{coluna_3}}</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>{{linha_1_col_1}}</td>
                    <td>{{linha_1_col_2}}</td>
                    <td>{{linha_1_col_3}}</td>
                </tr>
                <tr>
                    <td>{{linha_2_col_1}}</td>
                    <td>{{linha_2_col_2}}</td>
                    <td>{{linha_2_col_3}}</td>
                </tr>
                 <tr>
                    <td>{{linha_3_col_1}}</td>
                    <td>{{linha_3_col_2}}</td>
                    <td>{{linha_3_col_3}}</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="slide">
        <div class="slide-title">Atividade Interativa</div>
        <p>{{atividade_pergunta}}</p>
        <ul class="list">
            <li>A) {{opcao_a}}</li>
            <li>B) {{opcao_b}}</li>
            <li>C) {{opcao_c}}</li>
            <li>D) {{opcao_d}}</li>
        </ul>
    </div>

    <div class="slide">
        <div class="slide-title">Conclusão</div>
        <p>{{conclusao_texto}}</p>
        <ul class="list">
            <li><strong>Ponto Chave 1:</strong> {{ponto_chave_1}}</li>
            <li><strong>Ponto Chave 2:</strong> {{ponto_chave_2}}</li>
        </ul>
        <p><strong>Próximos Passos:</strong></p>
        <ul class="list">
            <li>{{proximo_passo_1}}</li>
            <li>{{proximo_passo_2}}</li>
            <li>{{proximo_passo_3}}</li>
        </ul>
    </div>
</body>
</html>
`;

export const getAtividadeTemplate = () => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{titulo}}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
        .info { display: flex; justify-content: space-between; margin-bottom: 20px; }
        .question { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .question-header { font-weight: bold; color: #333; margin-bottom: 10px; }
        .options { margin: 10px 0; padding-left: 20px; }
        .option { margin: 5px 0; }
        .columns { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 10px 0; }
        .column { border: 1px solid #eee; padding: 10px; border-radius: 3px; }
        .answer-space { border: 2px dashed #ccc; padding: 20px; margin: 10px 0; min-height: 60px; text-align: center; color: #999; }
        .correct-answer { background-color: #e8f5e8; padding: 8px; margin: 10px 0; border-radius: 3px; font-size: 0.9em; }
        .explanation { background-color: #f0f8ff; padding: 8px; margin: 10px 0; border-radius: 3px; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{titulo}}</h1>
        <div class="info">
            <span><strong>Professor(a):</strong> {{professor}}</span>
            <span><strong>Data:</strong> {{data}}</span>
            <span><strong>Disciplina:</strong> {{disciplina}}</span>
            <span><strong>Série:</strong> {{serie}}</span>
        </div>
        {{#duracao}}<p><strong>Duração:</strong> {{duracao}}</p>{{/duracao}}
    </div>

    {{#objetivo_geral}}
    <div style="margin-bottom: 20px;">
        <h3>Objetivo da Atividade</h3>
        <p>{{objetivo_geral}}</p>
    </div>
    {{/objetivo_geral}}

    {{#introducao}}
    <div style="margin-bottom: 20px;">
        <h3>Introdução</h3>
        <p>{{introducao}}</p>
    </div>
    {{/introducao}}

    {{#instrucoes}}
    <div style="margin-bottom: 20px;">
        <h3>Instruções</h3>
        <p>{{instrucoes}}</p>
    </div>
    {{/instrucoes}}

    <h2>Questões</h2>
    {{#questoes}}
    <div class="question">
        <div class="question-header">Questão {{numero}} - {{tipo}}</div>
        
        <p><strong>{{#enunciado}}{{enunciado}}{{/enunciado}}{{#pergunta}}{{pergunta}}{{/pergunta}}</strong></p>

        {{#opcoes}}
        {{#.}}
        <div class="options">
            {{#each this}}
            <div class="option">{{this}}</div>
            {{/each}}
        </div>
        {{/.}}
        {{/opcoes}}

        {{#coluna_a}}
        <div class="columns">
            <div class="column">
                <h4>Coluna A</h4>
                {{#each this}}
                <div>{{@index}}. {{this}}</div>
                {{/each}}
            </div>
            <div class="column">
                <h4>Coluna B</h4>
                {{#each ../coluna_b}}
                <div>{{@abc}}. {{this}}</div>
                {{/each}}
            </div>
        </div>
        {{/coluna_a}}

        {{#if (eq tipo "verdadeiro_falso")}}
        <div class="options">
            <div class="option">( ) Verdadeiro</div>
            <div class="option">( ) Falso</div>
        </div>
        {{/if}}

        {{#if (eq tipo "completar")}}
        <div class="answer-space">Complete a lacuna acima</div>
        {{/if}}

        {{#if (eq tipo "dissertativa")}}
        <div class="answer-space">Espaço para resposta dissertativa</div>
        {{/if}}

        {{#if (eq tipo "desenho")}}
        <div class="answer-space" style="min-height: 120px;">Espaço para desenho</div>
        {{/if}}

        {{#resposta_correta}}
        <div class="correct-answer"><strong>Resposta Correta:</strong> {{resposta_correta}}</div>
        {{/resposta_correta}}

        {{#explicacao}}
        <div class="explanation"><strong>Explicação:</strong> {{explicacao}}</div>
        {{/explicacao}}
    </div>
    {{/questoes}}

    {{#recursos_necessarios}}
    <div style="margin-top: 30px;">
        <h3>Recursos Necessários</h3>
        <ul>
        {{#each this}}
            <li>{{this}}</li>
        {{/each}}
        </ul>
    </div>
    {{/recursos_necessarios}}

</body>
</html>
`;

export const getAvaliacaoTemplate = () => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{titulo}}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
        .info { display: flex; justify-content: space-between; margin-bottom: 20px; }
        .question { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .question-header { font-weight: bold; color: #333; margin-bottom: 10px; }
        .options { margin: 10px 0; padding-left: 20px; }
        .option { margin: 5px 0; }
        .columns { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 10px 0; }
        .column { border: 1px solid #eee; padding: 10px; border-radius: 3px; }
        .answer-space { border: 2px dashed #ccc; padding: 20px; margin: 10px 0; min-height: 60px; text-align: center; color: #999; }
        .correct-answer { background-color: #e8f5e8; padding: 8px; margin: 10px 0; border-radius: 3px; font-size: 0.9em; }
        .value { float: right; font-weight: bold; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{titulo}}</h1>
        <div class="info">
            <span><strong>Professor(a):</strong> {{professor}}</span>
            <span><strong>Data:</strong> {{data}}</span>
            <span><strong>Disciplina:</strong> {{disciplina}}</span>
            <span><strong>Série:</strong> {{serie}}</span>
        </div>
        {{#duracao}}<p><strong>Duração:</strong> {{duracao}}</p>{{/duracao}}
        {{#valor_total}}<p><strong>Valor Total:</strong> {{valor_total}}</p>{{/valor_total}}
    </div>

    {{#objetivo_avaliativo}}
    <div style="margin-bottom: 20px;">
        <h3>Objetivo da Avaliação</h3>
        <p>{{objetivo_avaliativo}}</p>
    </div>
    {{/objetivo_avaliativo}}

    {{#instrucoes_gerais}}
    <div style="margin-bottom: 20px;">
        <h3>Instruções Gerais</h3>
        <p>{{instrucoes_gerais}}</p>
    </div>
    {{/instrucoes_gerais}}

    <h2>Questões</h2>
    {{#questoes}}
    <div class="question">
        <div class="question-header">
            Questão {{numero}} - {{tipo}}
            {{#valor}}<span class="value">({{valor}})</span>{{/valor}}
        </div>
        
        <p><strong>{{#enunciado}}{{enunciado}}{{/enunciado}}{{#pergunta}}{{pergunta}}{{/pergunta}}</strong></p>

        {{#opcoes}}
        {{#.}}
        <div class="options">
            {{#each this}}
            <div class="option">{{this}}</div>
            {{/each}}
        </div>
        {{/.}}
        {{/opcoes}}

        {{#coluna_a}}
        <div class="columns">
            <div class="column">
                <h4>Coluna A</h4>
                {{#each this}}
                <div>{{@index}}. {{this}}</div>
                {{/each}}
            </div>
            <div class="column">
                <h4>Coluna B</h4>
                {{#each ../coluna_b}}
                <div>{{@abc}}. {{this}}</div>
                {{/each}}
            </div>
        </div>
        {{/coluna_a}}

        {{#if (eq tipo "verdadeiro_falso")}}
        <div class="options">
            <div class="option">( ) Verdadeiro</div>
            <div class="option">( ) Falso</div>
        </div>
        {{/if}}

        {{#if (eq tipo "completar")}}
        <div class="answer-space">Complete a lacuna acima</div>
        {{/if}}

        {{#if (eq tipo "dissertativa")}}
        <div class="answer-space">Espaço para resposta dissertativa</div>
        {{/if}}

        {{#if (eq tipo "desenho")}}
        <div class="answer-space" style="min-height: 120px;">Espaço para desenho</div>
        {{/if}}

        {{#resposta_correta}}
        <div class="correct-answer"><strong>Resposta Correta:</strong> {{resposta_correta}}</div>
        {{/resposta_correta}}

        {{#criterios_correcao}}
        <div class="explanation"><strong>Critérios de Correção:</strong> {{criterios_correcao}}</div>
        {{/criterios_correcao}}
    </div>
    {{/questoes}}

    {{#criterios_avaliacao}}
    <div style="margin-top: 30px;">
        <h3>Critérios de Avaliação</h3>
        <ul>
            {{#excelente}}<li><strong>Excelente:</strong> {{excelente}}</li>{{/excelente}}
            {{#bom}}<li><strong>Bom:</strong> {{bom}}</li>{{/bom}}
            {{#satisfatorio}}<li><strong>Satisfatório:</strong> {{satisfatorio}}</li>{{/satisfatorio}}
            {{#insuficiente}}<li><strong>Insuficiente:</strong> {{insuficiente}}</li>{{/insuficiente}}
        </ul>
    </div>
    {{/criterios_avaliacao}}

</body>
</html>
`;
