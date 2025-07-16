
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Process base64 in chunks to prevent memory issues
function processBase64Chunks(base64String: string, chunkSize = 32768) {
  const chunks: Uint8Array[] = [];
  let position = 0;
  
  while (position < base64String.length) {
    const chunk = base64String.slice(position, position + chunkSize);
    const binaryChunk = atob(chunk);
    const bytes = new Uint8Array(binaryChunk.length);
    
    for (let i = 0; i < binaryChunk.length; i++) {
      bytes[i] = binaryChunk.charCodeAt(i);
    }
    
    chunks.push(bytes);
    position += chunkSize;
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

// Função para extrair informações usando IA
async function extractInformation(text: string) {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openAIApiKey) {
    throw new Error('OPENAI_API_KEY não configurada');
  }

  const disciplinas = [
    'Matemática', 'Português', 'Ciências', 'História', 'Geografia', 'Física', 'Química', 'Biologia',
    'Educação Física', 'Espanhol', 'Inglês', 'Filosofia', 'Sociologia', 'Informática', 'Física Quântica',
    'Teatro', 'Literatura', 'Música', 'Dança', 'Artes'
  ];

  const turmas = [
    'Maternal', 'Jardim I', 'Jardim II', 'Pré-Escola',
    '1° Ano', '2° Ano', '3° Ano', '4° Ano', '5° Ano',
    '6° Ano', '7° Ano', '8° Ano', '9° Ano',
    'Graduação'
  ];

  const prompt = `
Analise o seguinte texto transcrito de áudio e extraia as seguintes informações:

Texto: "${text}"

Disciplinas disponíveis: ${disciplinas.join(', ')}
Turmas disponíveis: ${turmas.join(', ')}

Por favor, identifique e retorne APENAS um objeto JSON com:
- tema: o tema principal da aula mencionado
- disciplina: a disciplina mencionada (deve ser exatamente uma das opções da lista, ou null se não encontrada)
- turma: a turma/série mencionada (deve ser exatamente uma das opções da lista, ou null se não encontrada)

Exemplo de resposta:
{
  "tema": "Introdução à Álgebra Linear",
  "disciplina": "Matemática",
  "turma": "1° Ano"
}

Retorne apenas o JSON, sem explicações adicionais.
`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Você é um assistente que extrai informações educacionais de textos transcritos. Retorne sempre um JSON válido.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      return JSON.parse(content);
    } catch {
      // Se não conseguir parsear, retorna apenas o tema
      return {
        tema: text,
        disciplina: null,
        turma: null
      };
    }
  } catch (error) {
    console.error('Erro ao extrair informações:', error);
    return {
      tema: text,
      disciplina: null,
      turma: null
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { audio } = await req.json();
    
    if (!audio) {
      throw new Error('Nenhum áudio fornecido');
    }

    console.log('Processando áudio recebido...');

    // Process audio in chunks
    const binaryAudio = processBase64Chunks(audio);
    
    // Prepare form data for OpenAI Whisper
    const formData = new FormData();
    const blob = new Blob([binaryAudio], { type: 'audio/webm' });
    formData.append('file', blob, 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('language', 'pt');

    console.log('Enviando para OpenAI Whisper...');

    // Send to OpenAI Whisper
    const transcribeResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      },
      body: formData,
    });

    if (!transcribeResponse.ok) {
      const errorText = await transcribeResponse.text();
      console.error('OpenAI Whisper error:', errorText);
      throw new Error(`OpenAI API error: ${errorText}`);
    }

    const transcriptionResult = await transcribeResponse.json();
    const transcribedText = transcriptionResult.text;

    console.log('Texto transcrito:', transcribedText);

    // Extract structured information using AI
    console.log('Extraindo informações estruturadas...');
    const extractedInfo = await extractInformation(transcribedText);

    console.log('Informações extraídas:', extractedInfo);

    return new Response(
      JSON.stringify({
        text: transcribedText,
        ...extractedInfo
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Erro na transcrição:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        text: '',
        tema: '',
        disciplina: null,
        turma: null
      }),
      {
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      }
    );
  }
});
