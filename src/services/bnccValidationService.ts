interface BNCCValidation {
  isValid: boolean;
  confidence: number;
  suggestions: string[];
  feedback: string;
}

const SUPABASE_EDGE_URL = "https://xmxpteviwcnrljtxvaoo.supabase.co/functions/v1/validarTemaBNCC";

export class BNCCValidationService {
  private static disciplineMapping: Record<string, string[]> = {
    'matemática': ['números', 'álgebra', 'geometria', 'estatística', 'probabilidade', 'grandezas', 'medidas'],
    'português': ['leitura', 'escrita', 'oralidade', 'análise linguística', 'literatura', 'gramática', 'texto'],
    'ciências': ['matéria', 'energia', 'vida', 'evolução', 'terra', 'universo', 'experimento'],
    'história': ['tempo', 'espaço', 'formas de organização', 'configurações políticas', 'circulação de pessoas'],
    'geografia': ['mundo do trabalho', 'conexões', 'redes', 'formas de representação', 'natureza'],
    'educação física': ['brincadeiras', 'jogos', 'esportes', 'ginásticas', 'danças', 'lutas'],
    'inglês': ['reading', 'listening', 'speaking', 'writing', 'vocabulary', 'grammar'],
    'espanhol': ['lectura', 'escritura', 'comprensión', 'expresión', 'vocabulario', 'gramática']
  };

  private static gradeTopics: Record<string, string[]> = {
    'Educação Infantil': ['coordenação motora', 'socialização', 'linguagem oral', 'brincadeiras', 'arte'],
    'Ensino Fundamental I': ['alfabetização', 'numeração', 'operações básicas', 'leitura', 'escrita'],
    'Ensino Fundamental II': ['análise crítica', 'pensamento científico', 'tecnologia', 'cidadania'],
    'Ensino Médio': ['projeto de vida', 'protagonismo', 'pesquisa', 'análise complexa', 'preparação profissional']
  };

  static async validateTopic(tema: string, disciplina: string, serie: string): Promise<BNCCValidation> {
    try {
      const response = await fetch(SUPABASE_EDGE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tema, disciplina, serie })
      });
      if (!response.ok) throw new Error('Erro ao validar tema na BNCC');
      const data = await response.json();
      return {
        isValid: !!data.alinhado,
        confidence: data.alinhado ? 1 : 0,
        suggestions: data.sugestoes || [],
        feedback: data.mensagem || ''
      };
    } catch (e) {
      return {
        isValid: false,
        confidence: 0,
        suggestions: [],
        feedback: 'Erro ao validar tema na BNCC.'
      };
    }
  }
}
