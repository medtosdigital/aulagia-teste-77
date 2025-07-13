
interface BNCCValidation {
  isValid: boolean;
  confidence: number;
  suggestions: string[];
  feedback: string;
  relatedSkills?: string[];
}

const SUPABASE_EDGE_URL = "https://xmxpteviwcnrljtxvaoo.supabase.co/functions/v1/validarTemaBNCC";

export class BNCCValidationService {
  static async validateTopic(tema: string, disciplina: string, serie: string): Promise<BNCCValidation> {
    console.log('🔍 Validando tema na BNCC com dados reais:', { tema, disciplina, serie });
    
    try {
      const response = await fetch(SUPABASE_EDGE_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ tema, disciplina, serie })
      });

      console.log('📡 Resposta da validação BNCC:', response.status);

      if (!response.ok) {
        console.error('❌ Erro na requisição de validação BNCC:', response.status, response.statusText);
        throw new Error(`Erro na validação: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📊 Dados recebidos da validação:', data);

      if (data.error) {
        console.error('❌ Erro retornado pela API:', data.error);
        throw new Error(data.error);
      }

      const result: BNCCValidation = {
        isValid: Boolean(data.alinhado),
        confidence: data.alinhado ? 0.95 : 0.1, // Alta confiança quando baseado em dados reais
        suggestions: Array.isArray(data.sugestoes) ? data.sugestoes : [],
        feedback: data.mensagem || 'Validação concluída com base em dados reais da BNCC.',
        relatedSkills: Array.isArray(data.habilidades) ? data.habilidades : []
      };

      // Se o tema for válido, incluir informações sobre as habilidades relacionadas
      if (result.isValid && result.relatedSkills && result.relatedSkills.length > 0) {
        result.feedback += ` Habilidades BNCC relacionadas: ${result.relatedSkills.join(', ')}.`;
      }

      console.log('✅ Resultado da validação processado:', result);
      return result;

    } catch (error) {
      console.error('❌ Erro ao validar tema na BNCC:', error);
      
      return {
        isValid: false,
        confidence: 0,
        suggestions: [
          'Verifique se o tema está adequado para a série selecionada',
          'Consulte a BNCC oficial para temas apropriados',
          'Considere ajustar a complexidade do conteúdo'
        ],
        feedback: 'Não foi possível validar o tema no momento devido a problemas técnicos. Recomendamos verificar manualmente se o tema está alinhado com a BNCC antes de prosseguir.',
        relatedSkills: []
      };
    }
  }
}
