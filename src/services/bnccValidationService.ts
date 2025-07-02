interface BNCCValidation {
  isValid: boolean;
  confidence: number;
  suggestions: string[];
  feedback: string;
}

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
    // Simula chamada para API de validação
    await new Promise(resolve => setTimeout(resolve, 1500));

    const normalizedDisciplina = disciplina.toLowerCase();
    const normalizedTema = tema.toLowerCase();
    
    // Extrair categoria da série
    const gradeCategory = serie.split('-')[0];
    
    // Verificar compatibilidade com disciplina
    const disciplineKeywords = this.disciplineMapping[normalizedDisciplina] || [];
    const disciplineMatch = disciplineKeywords.some(keyword => 
      normalizedTema.includes(keyword)
    );

    // Verificar compatibilidade com série
    const gradeKeywords = this.gradeTopics[gradeCategory] || [];
    const gradeMatch = gradeKeywords.some(keyword => 
      normalizedTema.includes(keyword)
    );

    const confidence = (disciplineMatch ? 0.6 : 0) + (gradeMatch ? 0.4 : 0);
    const isValid = confidence >= 0.5;

    let suggestions: string[] = [];
    let feedback = '';

    if (!isValid) {
      if (!disciplineMatch) {
        suggestions.push(`Temas relacionados a ${disciplina}: ${disciplineKeywords.slice(0, 3).join(', ')}`);
      }
      if (!gradeMatch) {
        suggestions.push(`Temas adequados para ${gradeCategory}: ${gradeKeywords.slice(0, 3).join(', ')}`);
      }
      feedback = `O tema "${tema}" pode não estar totalmente alinhado com a BNCC para ${disciplina} - ${serie}.`;
    } else {
      feedback = `O tema "${tema}" está bem alinhado com a BNCC para ${disciplina} - ${serie}.`;
    }

    return {
      isValid,
      confidence,
      suggestions,
      feedback
    };
  }
}
