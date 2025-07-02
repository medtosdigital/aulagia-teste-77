export class GrammarService {
  static async correctText(text: string): Promise<string> {
    // Simula uma chamada para API de correção gramatical
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulação de correções básicas
    let correctedText = text
      // Capitalizar primeira letra
      .replace(/^([a-z])/, (match) => match.toUpperCase())
      // Corrigir espaçamentos
      .replace(/\s+/g, ' ')
      .trim()
      // Adicionar ponto final se não houver pontuação
      .replace(/([^.!?])$/, '$1.');
    
    return correctedText;
  }
  
  static async hasGrammarIssues(text: string): Promise<boolean> {
    // Simula verificação de problemas gramaticais
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Verificações básicas
    const hasIssues = 
      text.length < 5 ||
      !text.match(/^[A-Z]/) ||
      text.includes('  ') ||
      !text.match(/[.!?]$/);
    
    return hasIssues;
  }
}
