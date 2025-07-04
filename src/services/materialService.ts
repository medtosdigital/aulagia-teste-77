import { userMaterialsService, UserMaterial } from './userMaterialsService';
import { supabase } from '@/integrations/supabase/client';

export interface GeneratedMaterial {
  id: string;
  title: string;
  type: 'plano-de-aula' | 'slides' | 'atividade' | 'avaliacao';
  subject: string;
  grade: string;
  createdAt: string;
  content: any;
  formData?: any;
}

export interface MaterialFormData {
  tema?: string;
  topic?: string;
  disciplina?: string;
  subject?: string;
  serie?: string;
  grade?: string;
  assuntos?: string[];
  subjects?: string[];
  tipoQuestoes?: string;
  tiposQuestoes?: string[];
  numeroQuestoes?: number;
  quantidadeQuestoes?: number;
  professor?: string;
  data?: string;
  duracao?: string;
  bncc?: string;
}

// Type exports for backward compatibility
export interface LessonPlan {
  titulo?: string;
  professor: string;
  disciplina: string;
  serie: string;
  tema: string;
  data: string;
  duracao: string;
  bncc: string;
  objetivos: string[];
  habilidades: string[];
  desenvolvimento: Array<{
    etapa: string;
    atividade: string;
    tempo: string;
    recursos: string;
  }>;
  recursos: string[];
  avaliacao: string;
}

export interface Activity {
  titulo?: string;
  instrucoes: string;
  questoes: Array<{
    numero: number;
    tipo: string;
    pergunta: string;
    opcoes?: string[];
    resposta?: string;
  }>;
}

export interface Slide {
  numero: number;
  titulo: string;
  conteudo: string[] | string;
  tipo?: string;
}

export interface Assessment {
  titulo?: string;
  instrucoes: string;
  tempoLimite?: string;
  questoes: Array<{
    numero: number;
    tipo: string;
    pergunta: string;
    opcoes?: string[];
    pontuacao?: number;
  }>;
  htmlContent?: string;
}

class MaterialService {
  async generateMaterial(type: string, formData: MaterialFormData): Promise<GeneratedMaterial> {
    console.log('🚀 Starting ultra-fast material generation:', { type, formData });
    
    try {
      // Ultra-fast parallel processing with optimized data preparation
      const materialDataPromise = this.mapToUserMaterial(type, formData, {});
      
      // Optimized AI generation with timeout
      const aiResponse = await Promise.race([
        supabase.functions.invoke('generate-material-content', {
          body: { type, formData }
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout na geração de conteúdo')), 15000)
        )
      ]) as any;

      if (aiResponse.error) {
        console.error('❌ OpenAI Edge Function error:', aiResponse.error);
        throw new Error(`Erro na geração de conteúdo: ${aiResponse.error.message}`);
      }

      if (!aiResponse.data?.success) {
        console.error('❌ OpenAI generation failed:', aiResponse.data?.error);
        throw new Error(`Erro na geração de conteúdo: ${aiResponse.data?.error || 'Resposta inválida da IA'}`);
      }

      console.log('✅ Ultra-fast AI content generated successfully');
      
      // Lightning-fast content processing with intelligent variable filling
      const [generatedContent, materialData] = await Promise.all([
        this.processAIContentUltraFast(type, aiResponse.data.content, formData),
        materialDataPromise
      ]);
      console.log('⚡ Content processed with lightning speed');
      
      // Optimized material data structure
      const finalMaterialData = {
        ...materialData,
        content: JSON.stringify(generatedContent)
      };
      
      console.log('💾 Saving enhanced material to Supabase...');
      const savedMaterial = await userMaterialsService.addMaterial(finalMaterialData);
      
      if (!savedMaterial) {
        console.error('❌ Failed to save material to Supabase');
        throw new Error('Falha ao salvar material no banco de dados');
      }
      
      console.log('✅ Enhanced material saved successfully to Supabase:', savedMaterial.id);
      
      // Fast conversion to GeneratedMaterial format for UI compatibility
      const result = this.convertToGeneratedMaterial(savedMaterial, generatedContent, formData);
      console.log('🔄 Material converted for UI with enhanced speed:', result.id);
      
      return result;
    } catch (error) {
      console.error('❌ Error in enhanced generateMaterial:', error);
      throw error;
    }
  }

  async getMaterials(): Promise<GeneratedMaterial[]> {
    console.log('📋 Getting all materials from Supabase...');
    try {
      const userMaterials = await userMaterialsService.getAllMaterials();
      console.log('✅ Loaded materials from Supabase:', userMaterials.length);
      
      return userMaterials.map(material => this.convertUserMaterialToGenerated(material));
    } catch (error) {
      console.error('❌ Error getting materials:', error);
      return [];
    }
  }

  async getMaterialById(id: string): Promise<GeneratedMaterial | null> {
    console.log('🔍 Getting material by ID:', id);
    try {
      const userMaterials = await userMaterialsService.getAllMaterials();
      const material = userMaterials.find(m => m.id === id);
      
      if (!material) {
        console.log('❌ Material not found:', id);
        return null;
      }
      
      console.log('✅ Material found:', material.title);
      return this.convertUserMaterialToGenerated(material);
    } catch (error) {
      console.error('❌ Error getting material by ID:', error);
      return null;
    }
  }

  async deleteMaterial(id: string): Promise<boolean> {
    console.log('🗑️ Deleting material:', id);
    try {
      const success = await userMaterialsService.deleteMaterial(id);
      if (success) {
        console.log('✅ Material deleted successfully');
      } else {
        console.log('❌ Failed to delete material');
      }
      return success;
    } catch (error) {
      console.error('❌ Error deleting material:', error);
      return false;
    }
  }

  async updateMaterial(id: string, updates: Partial<GeneratedMaterial>): Promise<boolean> {
    console.log('📝 Updating material:', id, updates);
    try {
      const userMaterialUpdates: Partial<UserMaterial> = {};
      
      if (updates.title) userMaterialUpdates.title = updates.title;
      if (updates.subject) userMaterialUpdates.subject = updates.subject;
      if (updates.grade) userMaterialUpdates.grade = updates.grade;
      if (updates.content) userMaterialUpdates.content = JSON.stringify(updates.content);
      
      const success = await userMaterialsService.updateMaterial(id, userMaterialUpdates);
      if (success) {
        console.log('✅ Material updated successfully');
      } else {
        console.log('❌ Failed to update material');
      }
      return success;
    } catch (error) {
      console.error('❌ Error updating material:', error);
      return false;
    }
  }

  private convertUserMaterialToGenerated(userMaterial: UserMaterial): GeneratedMaterial {
    let content;
    try {
      content = userMaterial.content ? JSON.parse(userMaterial.content) : {};
    } catch (error) {
      console.error('Error parsing content:', error);
      content = {};
    }

    return {
      id: userMaterial.id,
      title: userMaterial.title,
      type: userMaterial.type === 'plano-aula' ? 'plano-de-aula' : userMaterial.type,
      subject: userMaterial.subject,
      grade: userMaterial.grade,
      createdAt: userMaterial.createdAt,
      content
    };
  }

  private mapToUserMaterial(type: string, formData: MaterialFormData, content: any): Omit<UserMaterial, 'id' | 'createdAt' | 'status'> {
    // Get topic/title - handle both single topic and multiple subjects for evaluations
    const title = this.generateTitle(type, formData);
    
    // Map type correctly
    const materialType = type === 'plano-de-aula' ? 'plano-aula' : type as 'plano-aula' | 'atividade' | 'slides' | 'avaliacao';
    
    return {
      title,
      type: materialType,
      subject: formData.disciplina || formData.subject || 'Não informado',
      grade: formData.serie || formData.grade || 'Não informado',
      userId: '', // This will be set by userMaterialsService using authenticated user
      content: JSON.stringify(content)
    };
  }

  private generateTitle(type: string, formData: MaterialFormData): string {
    const typeLabels = {
      'plano-de-aula': 'Plano de Aula',
      'slides': 'Slides',
      'atividade': 'Atividade',
      'avaliacao': 'Avaliação'
    };
    
    const typeLabel = typeLabels[type as keyof typeof typeLabels] || 'Material';
    
    // For evaluations with multiple subjects, join them
    if (type === 'avaliacao' && formData.assuntos && formData.assuntos.length > 0) {
      const topics = formData.assuntos.filter(s => s.trim() !== '').slice(0, 2); // Take first 2 topics
      const topicText = topics.length > 1 ? `${topics[0]} e mais` : topics[0];
      return `${typeLabel} - ${topicText}`;
    }
    
    // For other types, use the main topic
    const topic = formData.tema || formData.topic || 'Conteúdo Personalizado';
    return `${typeLabel} - ${topic}`;
  }

  private convertToGeneratedMaterial(userMaterial: UserMaterial, content: any, formData: MaterialFormData): GeneratedMaterial {
    return {
      id: userMaterial.id,
      title: userMaterial.title,
      type: userMaterial.type === 'plano-aula' ? 'plano-de-aula' : userMaterial.type,
      subject: userMaterial.subject,
      grade: userMaterial.grade,
      createdAt: userMaterial.createdAt,
      content,
      formData
    };
  }

  private processAIContentUltraFast(type: string, aiContent: string, formData: MaterialFormData): any {
    console.log('⚡ Ultra-fast processing AI content for type:', type);
    
    // Optimized data extraction
    const {
      tema: topic = 'Conteúdo',
      disciplina: subject = 'Disciplina', 
      serie: grade = 'Série',
      professor = 'Professor(a)',
      data = new Date().toLocaleDateString('pt-BR'),
      duracao = '50 minutos',
      bncc = `Habilidades da BNCC relacionadas a ${topic}`
    } = formData;

    // Intelligent variable replacement in AI content
    const processedContent = this.smartVariableReplacement(aiContent, {
      '{{tema}}': topic,
      '{{disciplina}}': subject,
      '{{serie}}': grade,
      '{{professor}}': professor,
      '{{data}}': data,
      '{{duracao}}': duracao,
      '{{bncc}}': bncc,
      '{{topic}}': topic,
      '{{subject}}': subject,
      '{{grade}}': grade
    });

    // Ultra-fast base structure
    const baseStructure = {
      titulo: `${this.getMaterialTypeLabel(type)} - ${topic}`,
      professor,
      data,
      disciplina: subject,
      serie: grade,
      tema: topic,
      duracao,
      bncc,
      conteudo_completo: processedContent,
      conteudo_original: aiContent
    };

    // Ultra-fast content extraction synchronously
    const extractions = this.getExtractionSync(type, processedContent);
    
    return {
      ...baseStructure,
      ...this.buildTypeSpecificContent(type, extractions, processedContent)
    };
  }

  private smartVariableReplacement(content: string, variables: Record<string, string>): string {
    let processedContent = content;
    
    // Replace all variable patterns efficiently
    Object.entries(variables).forEach(([key, value]) => {
      const patterns = [
        new RegExp(key.replace(/[{}]/g, '\\$&'), 'gi'),
        new RegExp(`\\[${key.replace(/[{}]/g, '')}\\]`, 'gi'),
        new RegExp(`\\{${key.replace(/[{}]/g, '')}\\}`, 'gi')
      ];
      
      patterns.forEach(pattern => {
        processedContent = processedContent.replace(pattern, value);
      });
    });

    return processedContent;
  }

  private getExtractionSync(type: string, content: string): any[] {
    const baseExtractions = [
      this.fastExtractObjectives(content),
      this.fastExtractSkills(content)
    ];

    switch (type) {
      case 'plano-de-aula':
        return [
          ...baseExtractions,
          this.fastExtractMethodology(content),
          this.fastExtractDevelopment(content),
          this.fastExtractResources(content),
          this.fastExtractEvaluation(content),
          this.fastExtractAdaptations(content)
        ];
      case 'slides':
        return [
          ...baseExtractions,
          this.fastExtractSlides(content),
          this.fastExtractSynthesis(content),
          this.fastExtractReferences(content)
        ];
      case 'atividade':
      case 'avaliacao':
        return [
          ...baseExtractions,
          this.fastExtractInstructions(content),
          this.fastExtractQuestions(content),
          this.fastExtractAnswerKey(content)
        ];
      default:
        return baseExtractions;
    }
  }

  private buildTypeSpecificContent(type: string, extractions: any[], content: string): any {
    const [objetivos, habilidades] = extractions;
    
    switch (type) {
      case 'plano-de-aula':
        const [, , metodologia, desenvolvimento, recursos, avaliacao, adaptacoes] = extractions;
        return { objetivos, habilidades, metodologia, desenvolvimento, recursos, avaliacao, adaptacoes };
      case 'slides':
        const [, , slides, sintese, referencias] = extractions;
        return { objetivos, slides, sintese, referencias };
      case 'atividade':
        const [, , instrucoes, questoes, gabarito] = extractions;
        return { objetivos, instrucoes, questoes, gabarito, criterios_avaliacao: this.extractEvaluationCriteria(content) };
      case 'avaliacao':
        const [, , instrucoes_av, questoes_av, gabarito_av] = extractions;
        return { 
          objetivos, 
          instrucoes: instrucoes_av, 
          questoes: questoes_av, 
          gabarito: gabarito_av,
          criterios_correcao: this.extractCorrectionCriteria(content),
          distribuicao_pontos: this.extractPointDistribution(content)
        };
      default:
        return { objetivos, habilidades };
    }
  }

  private getMaterialTypeLabel(type: string): string {
    const labels = {
      'plano-de-aula': 'Plano de Aula',
      'slides': 'Apresentação',
      'atividade': 'Atividade',
      'avaliacao': 'Avaliação'
    };
    return labels[type as keyof typeof labels] || 'Material';
  }

  // Ultra-fast extraction methods with intelligent parsing
  private fastExtractObjectives(content: string): string[] {
    const patterns = [/OBJETIVOS[\s\S]*?(?=\*\*|$)/i, /• [^•\n]+/g];
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        const objectives = Array.isArray(match) ? match : [match[0]];
        const splitObjectives = objectives.flatMap(obj => obj.split('•'));
        const filtered = splitObjectives.filter(obj => obj.trim().length > 10).map(obj => obj.trim().replace(/^•\s*/, ''));
        if (filtered.length > 0) return filtered;
      }
    }
    return [`Compreender os conceitos fundamentais do tema`, `Aplicar conhecimentos em situações práticas`, `Desenvolver habilidades de análise crítica`];
  }

  private fastExtractSkills(content: string): string[] {
    return this.extractSkills(content);
  }

  private fastExtractMethodology(content: string): string {
    return this.extractMethodology(content);
  }

  private fastExtractDevelopment(content: string): any[] {
    return this.extractDevelopment(content);
  }

  private fastExtractResources(content: string): string {
    return this.extractResources(content);
  }

  private fastExtractEvaluation(content: string): string {
    return this.extractEvaluation(content);
  }

  private fastExtractAdaptations(content: string): string {
    return this.extractAdaptations(content);
  }

  private fastExtractSlides(content: string): any[] {
    return this.extractSlides(content);
  }

  private fastExtractSynthesis(content: string): string {
    return this.extractSynthesis(content);
  }

  private fastExtractReferences(content: string): string[] {
    return this.extractReferences(content);
  }

  private fastExtractInstructions(content: string): string {
    return this.extractInstructions(content);
  }

  private fastExtractQuestions(content: string): any[] {
    return this.extractQuestions(content);
  }

  private fastExtractAnswerKey(content: string): string {
    return this.extractAnswerKey(content);
  }

  private extractSkills(content: string): string[] {
    const match = content.match(/HABILIDADES[\s\S]*?(?=\*\*|$)/i);
    if (match) {
      return match[0].split('•').filter(skill => skill.trim().length > 5).map(skill => skill.trim());
    }
    return [`Habilidades da BNCC relacionadas ao tema`];
  }

  private extractMethodology(content: string): string {
    const match = content.match(/METODOLOGIA[\s\S]*?(?=\*\*|$)/i);
    return match ? match[0].replace(/METODOLOGIA[:\s]*/i, '').trim() : 'Metodologia ativa e participativa';
  }

  private extractDevelopment(content: string): any[] {
    const match = content.match(/DESENVOLVIMENTO[\s\S]*?(?=\*\*|$)/i);
    if (match) {
      const steps = match[0].split(/\d+\.\s*\*\*/).filter(step => step.trim().length > 10);
      return steps.map((step, index) => ({
        etapa: `Etapa ${index + 1}`,
        atividade: step.trim().substring(0, 200),
        tempo: '10-15 min',
        recursos: 'Recursos didáticos diversos'
      }));
    }
    return [
      { etapa: 'Introdução', atividade: 'Apresentação do tema', tempo: '10 min', recursos: 'Quadro e projetor' },
      { etapa: 'Desenvolvimento', atividade: 'Conteúdo principal', tempo: '25 min', recursos: 'Material didático' },
      { etapa: 'Consolidação', atividade: 'Atividades práticas', tempo: '10 min', recursos: 'Exercícios' },
      { etapa: 'Encerramento', atividade: 'Síntese e avaliação', tempo: '5 min', recursos: 'Avaliação formativa' }
    ];
  }

  private extractResources(content: string): string {
    const match = content.match(/RECURSOS[\s\S]*?(?=\*\*|$)/i);
    return match ? match[0].replace(/RECURSOS[:\s]*/i, '').trim() : 'Quadro, projetor, material impresso, recursos digitais';
  }

  private extractEvaluation(content: string): string {
    const match = content.match(/AVALIAÇÃO[\s\S]*?(?=\*\*|$)/i);
    return match ? match[0].replace(/AVALIAÇÃO[:\s]*/i, '').trim() : 'Avaliação formativa e somativa baseada na participação e compreensão dos conceitos';
  }

  private extractAdaptations(content: string): string {
    const match = content.match(/ADAPTAÇÕES[\s\S]*?(?=\*\*|$)/i);
    return match ? match[0].replace(/ADAPTAÇÕES[:\s]*/i, '').trim() : 'Estratégias inclusivas para diferentes estilos de aprendizagem';
  }

  private extractSlides(content: string): any[] {
    const slideMatches = content.match(/SLIDE\s+\d+[\s\S]*?(?=SLIDE\s+\d+|$)/gi);
    if (slideMatches && slideMatches.length > 0) {
      return slideMatches.map((slide, index) => ({
        numero: index + 1,
        titulo: this.extractSlideTitle(slide),
        conteudo: this.extractSlideContent(slide),
        tipo: index === 0 ? 'capa' : 'conteudo'
      }));
    }
    return [
      { numero: 1, titulo: 'Título da Aula', conteudo: 'Apresentação do tema', tipo: 'capa' },
      { numero: 2, titulo: 'Objetivos', conteudo: 'O que vamos aprender', tipo: 'objetivos' },
      { numero: 3, titulo: 'Conteúdo Principal', conteudo: 'Desenvolvimento do tema', tipo: 'conteudo' }
    ];
  }

  private extractSlideTitle(slide: string): string {
    const match = slide.match(/SLIDE\s+\d+[^\n]*?([^\n]+)/i);
    return match ? match[1].trim() : 'Slide';
  }

  private extractSlideContent(slide: string): string {
    return slide.replace(/SLIDE\s+\d+[^\n]*\n/i, '').trim().substring(0, 300);
  }

  private extractInstructions(content: string): string {
    const match = content.match(/INSTRUÇÕES[\s\S]*?(?=\*\*|$)/i);
    return match ? match[0].replace(/INSTRUÇÕES[:\s]*/i, '').trim() : 'Leia atentamente cada questão e responda de forma completa e fundamentada.';
  }

  private extractQuestions(content: string): any[] {
    const questionMatches = content.match(/\d+[\.\)]\s*[\s\S]*?(?=\d+[\.\)]|$)/g);
    if (questionMatches && questionMatches.length > 0) {
      return questionMatches.map((question, index) => ({
        numero: index + 1,
        tipo: question.includes('A)') || question.includes('a)') ? 'objetiva' : 'dissertativa',
        pergunta: question.replace(/^\d+[\.\)]\s*/, '').trim().substring(0, 500),
        opcoes: this.extractOptions(question),
        pontuacao: 1.0
      }));
    }
    return [];
  }

  private extractOptions(question: string): string[] | undefined {
    const optionMatches = question.match(/[A-Da-d]\)\s*[^\n]+/g);
    return optionMatches ? optionMatches.map(opt => opt.replace(/^[A-Da-d]\)\s*/, '').trim()) : undefined;
  }

  private extractAnswerKey(content: string): string {
    const match = content.match(/GABARITO[\s\S]*?(?=\*\*|$)/i);
    return match ? match[0].replace(/GABARITO[:\s]*/i, '').trim() : 'Gabarito será fornecido separadamente';
  }

  private extractEvaluationCriteria(content: string): string[] {
    const match = content.match(/CRITÉRIOS[\s\S]*?(?=\*\*|$)/i);
    if (match) {
      return match[0].split('•').filter(criteria => criteria.trim().length > 5).map(criteria => criteria.trim());
    }
    return ['Compreensão dos conceitos', 'Clareza na expressão', 'Aplicação correta do conhecimento'];
  }

  private extractCorrectionCriteria(content: string): string {
    const match = content.match(/CRITÉRIOS DE CORREÇÃO[\s\S]*?(?=\*\*|$)/i);
    return match ? match[0].replace(/CRITÉRIOS DE CORREÇÃO[:\s]*/i, '').trim() : 'Critérios baseados na fundamentação teórica e aplicação prática';
  }

  private extractPointDistribution(content: string): string {
    const match = content.match(/DISTRIBUIÇÃO[\s\S]*?(?=\*\*|$)/i);
    return match ? match[0].replace(/DISTRIBUIÇÃO[:\s]*/i, '').trim() : 'Distribuição equilibrada entre questões objetivas e dissertativas';
  }

  private extractSynthesis(content: string): string {
    const match = content.match(/SÍNTESE[\s\S]*?(?=\*\*|$)/i);
    return match ? match[0].replace(/SÍNTESE[:\s]*/i, '').trim() : 'Síntese dos principais conceitos abordados';
  }

  private extractReferences(content: string): string[] {
    const match = content.match(/REFERÊNCIAS[\s\S]*?(?=\*\*|$)/i);
    if (match) {
      return match[0].split('\n').filter(ref => ref.trim().length > 5).map(ref => ref.trim());
    }
    return ['Base Nacional Comum Curricular (BNCC)', 'Recursos pedagógicos específicos do tema'];
  }
}

export const materialService = new MaterialService();
