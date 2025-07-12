
interface IndividualBNCCValidation {
  tema: string;
  isValid: boolean;
  confidence: number;
  feedback: string;
  suggestions: string[];
}

interface EnhancedBNCCValidation {
  overallValid: boolean;
  individualValidations: IndividualBNCCValidation[];
  overallFeedback: string;
  hasPartiallyValid: boolean;
  validThemes: string[];
  invalidThemes: string[];
}

const SUPABASE_EDGE_URL = "https://xmxpteviwcnrljtxvaoo.supabase.co/functions/v1/validarTemaBNCC";

export class EnhancedBNCCValidationService {
  static async validateMultipleTopics(temas: string[], disciplina: string, serie: string): Promise<EnhancedBNCCValidation> {
    console.log('🔍 Validando múltiplos temas na BNCC:', { temas, disciplina, serie });
    
    try {
      // Validar cada tema individualmente
      const validationPromises = temas.map(tema => 
        this.validateSingleTopic(tema, disciplina, serie)
      );
      
      const individualValidations = await Promise.all(validationPromises);
      
      // Calcular resultado geral
      const validThemes = individualValidations
        .filter(v => v.isValid)
        .map(v => v.tema);
      
      const invalidThemes = individualValidations
        .filter(v => !v.isValid)
        .map(v => v.tema);
      
      const overallValid = individualValidations.every(v => v.isValid);
      const hasPartiallyValid = validThemes.length > 0 && invalidThemes.length > 0;
      
      let overallFeedback = '';
      if (overallValid) {
        overallFeedback = 'Todos os conteúdos estão alinhados com a BNCC para a série selecionada.';
      } else if (hasPartiallyValid) {
        overallFeedback = `${validThemes.length} de ${temas.length} conteúdos estão alinhados com a BNCC. Revise os conteúdos destacados em vermelho.`;
      } else {
        overallFeedback = 'Nenhum dos conteúdos está adequadamente alinhado com a BNCC para a série selecionada.';
      }
      
      const result: EnhancedBNCCValidation = {
        overallValid,
        individualValidations,
        overallFeedback,
        hasPartiallyValid,
        validThemes,
        invalidThemes
      };
      
      console.log('✅ Resultado da validação múltipla processado:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Erro ao validar temas na BNCC:', error);
      
      // Retornar resultado de fallback
      return {
        overallValid: true, // Em caso de erro, permitir prosseguir
        individualValidations: temas.map(tema => ({
          tema,
          isValid: true,
          confidence: 0,
          feedback: 'Não foi possível validar este tema no momento.',
          suggestions: []
        })),
        overallFeedback: 'Não foi possível validar os temas no momento. Prosseguindo com a criação do material.',
        hasPartiallyValid: false,
        validThemes: temas,
        invalidThemes: []
      };
    }
  }
  
  private static async validateSingleTopic(tema: string, disciplina: string, serie: string): Promise<IndividualBNCCValidation> {
    try {
      const response = await fetch(SUPABASE_EDGE_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ tema, disciplina, serie })
      });

      if (!response.ok) {
        throw new Error(`Erro na validação: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      return {
        tema,
        isValid: Boolean(data.alinhado),
        confidence: data.alinhado ? 1 : 0,
        feedback: data.mensagem || 'Validação concluída.',
        suggestions: Array.isArray(data.sugestoes) ? data.sugestoes : []
      };
      
    } catch (error) {
      console.error('❌ Erro ao validar tema individual:', tema, error);
      
      return {
        tema,
        isValid: true, // Em caso de erro, permitir prosseguir
        confidence: 0,
        feedback: 'Não foi possível validar este tema no momento.',
        suggestions: []
      };
    }
  }
}
