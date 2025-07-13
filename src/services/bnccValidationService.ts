
interface BNCCValidation {
  isValid: boolean;
  confidence: number;
  suggestions: string[];
  feedback: string;
  justificativa?: string;
}

const SUPABASE_EDGE_URL = "https://xmxpteviwcnrljtxvaoo.supabase.co/functions/v1/validarTemaBNCC";

export class BNCCValidationService {
  static async validateTopic(tema: string, disciplina: string, serie: string): Promise<BNCCValidation> {
    console.log('🔍 Validando tema na BNCC (versão aprimorada):', { tema, disciplina, serie });
    
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
        confidence: data.confianca || (data.alinhado ? 0.8 : 0.3),
        suggestions: Array.isArray(data.sugestoes) ? data.sugestoes : [],
        feedback: data.mensagem || 'Validação concluída.',
        justificativa: data.justificativa || ''
      };

      console.log('✅ Resultado da validação processado:', result);
      return result;

    } catch (error) {
      console.error('❌ Erro ao validar tema na BNCC:', error);
      
      // Retornar um resultado de fallback mais permissivo
      return {
        isValid: true, // Ser mais permissivo em caso de erro
        confidence: 0.5,
        suggestions: [],
        feedback: 'Não foi possível validar completamente o tema no momento. Prosseguindo com a criação do material.',
        justificativa: 'Erro de validação - fallback aplicado'
      };
    }
  }

  // Método para validar múltiplos temas de uma vez
  static async validateMultipleTopics(temas: string[], disciplina: string, serie: string): Promise<BNCCValidation[]> {
    console.log('🔍 Validando múltiplos temas:', { temas, disciplina, serie });
    
    const promises = temas.map(tema => this.validateTopic(tema, disciplina, serie));
    
    try {
      const results = await Promise.all(promises);
      console.log('✅ Validação múltipla concluída:', results);
      return results;
    } catch (error) {
      console.error('❌ Erro na validação múltipla:', error);
      
      // Retornar fallback para todos os temas
      return temas.map(tema => ({
        isValid: true,
        confidence: 0.5,
        suggestions: [],
        feedback: 'Erro na validação múltipla. Prosseguindo com a criação.',
        justificativa: 'Fallback por erro de validação'
      }));
    }
  }

  // Método para obter estatísticas de validação
  static getValidationStats(validations: BNCCValidation[]): {
    totalValid: number;
    totalInvalid: number;
    averageConfidence: number;
    overallValid: boolean;
  } {
    const valid = validations.filter(v => v.isValid);
    const invalid = validations.filter(v => !v.isValid);
    const avgConfidence = validations.reduce((acc, v) => acc + v.confidence, 0) / validations.length;
    
    return {
      totalValid: valid.length,
      totalInvalid: invalid.length,
      averageConfidence: avgConfidence,
      overallValid: invalid.length === 0
    };
  }
}
