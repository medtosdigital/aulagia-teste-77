
interface BNCCValidation {
  isValid: boolean;
  confidence: number;
  suggestions: string[];
  feedback: string;
}

const SUPABASE_EDGE_URL = "https://xmxpteviwcnrljtxvaoo.supabase.co/functions/v1/validarTemaBNCC";

export class BNCCValidationService {
  static async validateTopic(tema: string, disciplina: string, serie: string): Promise<BNCCValidation> {
    console.log('🔍 Validando tema na BNCC:', { tema, disciplina, serie });
    
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

      // Verificar se houve erro na resposta
      if (data.error) {
        console.error('❌ Erro retornado pela API:', data.error);
        throw new Error(data.error);
      }

      const result: BNCCValidation = {
        isValid: Boolean(data.alinhado),
        confidence: data.alinhado ? 1 : 0,
        suggestions: Array.isArray(data.sugestoes) ? data.sugestoes : [],
        feedback: data.mensagem || 'Validação concluída.'
      };

      console.log('✅ Resultado da validação processado:', result);
      return result;

    } catch (error) {
      console.error('❌ Erro ao validar tema na BNCC:', error);
      
      // Retornar um resultado de fallback em caso de erro
      return {
        isValid: true, // Em caso de erro, permitir prosseguir
        confidence: 0,
        suggestions: [],
        feedback: 'Não foi possível validar o tema no momento. Prosseguindo com a criação do material.'
      };
    }
  }
}
