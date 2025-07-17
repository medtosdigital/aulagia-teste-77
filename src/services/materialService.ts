import { userMaterialsService, UserMaterial } from './userMaterialsService';
import { supabase } from '@/integrations/supabase/client';
import { QuestionParserService } from './questionParserService';

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

// Updated LessonPlan interface to match what components expect
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
  conteudosProgramaticos: string[];
  metodologia: string;
  avaliacao: string;
  referencias: string[];
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
    imagem?: string;
    icones?: string[];
    grafico?: any;
    figuraGeometrica?: any;
    colunaA?: string[];
    colunaB?: string[];
    textoComLacunas?: string;
    linhasResposta?: number;
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
    imagem?: string;
    icones?: string[];
    grafico?: any;
    figuraGeometrica?: any;
    colunaA?: string[];
    colunaB?: string[];
    textoComLacunas?: string;
    linhasResposta?: number;
  }>;
  htmlContent?: string;
}

class MaterialService {
  async generateMaterial(type: string, formData: MaterialFormData): Promise<GeneratedMaterial> {
    console.log('🚀 Starting material generation with OpenAI:', { type, formData });
    
    try {
      // Call the Supabase Edge Function to generate content with OpenAI
      console.log('📞 Calling gerarMaterialIA Edge Function...');
      const { data, error } = await supabase.functions.invoke('gerarMaterialIA', {
        body: {
          materialType: type,
          formData
        }
      });

      if (error) {
        console.error('❌ Edge Function error:', error);
        throw new Error(`Erro ao gerar conteúdo: ${error.message}`);
      }

      if (!data || !data.success) {
        console.error('❌ Invalid response from Edge Function:', data);
        throw new Error('Resposta inválida do serviço de geração');
      }

      console.log('✅ Content generated successfully with OpenAI');
      let generatedContent = data.content;
      
      // Se for slides, gerar imagens com o sistema ultra-otimizado
      if (type === 'slides' && generatedContent) {
        console.log('🎨 Starting ULTRA-OPTIMIZED image generation for slides...');
        generatedContent = await this.generateUltraOptimizedImagesForSlides(generatedContent, formData);
      }
      
      // Map form data to UserMaterial format
      const materialData = this.mapToUserMaterial(type, formData, generatedContent);
      console.log('📝 Material data mapped:', materialData);
      
      // Save to Supabase
      console.log('💾 Saving material to Supabase...');
      const savedMaterial = await userMaterialsService.addMaterial(materialData);
      
      if (!savedMaterial) {
        console.error('❌ Failed to save material to Supabase');
        throw new Error('Falha ao salvar material no banco de dados');
      }
      
      console.log('✅ Material saved successfully to Supabase:', savedMaterial.id);
      
      // Convert back to GeneratedMaterial format for UI compatibility
      const result = this.convertToGeneratedMaterial(savedMaterial, generatedContent, formData);
      console.log('🔄 Material converted for UI:', result.id);
      
      return result;
    } catch (error) {
      console.error('❌ Error in generateMaterial:', error);
      throw error;
    }
  }

  // Função para gerar Material de Apoio
  async generateSupportMaterial(materialPrincipalId: string, materialPrincipalData: any): Promise<{ success: boolean; apoioId?: string; error?: string }> {
    console.log('🚀 Starting support material generation...');
    
    try {
      // Obter dados do usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Preparar dados para o prompt
      const formData = {
        tema: materialPrincipalData.tema || '',
        disciplina: materialPrincipalData.disciplina || '',
        serie: materialPrincipalData.serie || '',
        titulo_material_principal: materialPrincipalData.titulo || '',
        objetivos_material_principal: Array.isArray(materialPrincipalData.objetivos) 
          ? materialPrincipalData.objetivos.join(', ') 
          : materialPrincipalData.objetivos || '',
        user_id: user.id,
        material_principal_id: materialPrincipalId
      };

      console.log('📞 Calling gerarMaterialIA Edge Function for support material...');
      const { data, error } = await supabase.functions.invoke('gerarMaterialIA', {
        body: {
          materialType: 'apoio',
          formData
        }
      });

      if (error) {
        console.error('❌ Edge Function error:', error);
        return { success: false, error: `Erro ao gerar conteúdo: ${error.message}` };
      }

      if (!data || !data.success) {
        console.error('❌ Invalid response from Edge Function:', data);
        return { success: false, error: 'Resposta inválida do serviço de geração' };
      }

      console.log('✅ Support material generated successfully with ID:', data.apoioId);
      return { success: true, apoioId: data.apoioId };
    } catch (error) {
      console.error('❌ Error in generateSupportMaterial:', error);
      return { success: false, error: error.message };
    }
  }

  private async generateUltraOptimizedImagesForSlides(slidesContent: any, formData: MaterialFormData): Promise<any> {
    console.log('🎨 Starting ULTRA-OPTIMIZED image generation for slides v2.0...');
    
    // Campos de imagem otimizados por prioridade educacional
    const prioritizedImageFields = [
      { field: 'tema_imagem', priority: 'high', context: 'capa' },
      { field: 'introducao_imagem', priority: 'high', context: 'introdução' },
      { field: 'conceitos_imagem', priority: 'medium', context: 'conceitos' },
      { field: 'exemplo_imagem', priority: 'high', context: 'exemplo' },
      { field: 'desenvolvimento_1_imagem', priority: 'medium', context: 'desenvolvimento' },
      { field: 'desenvolvimento_2_imagem', priority: 'low', context: 'desenvolvimento' },
      { field: 'desenvolvimento_3_imagem', priority: 'low', context: 'desenvolvimento' },
      { field: 'desenvolvimento_4_imagem', priority: 'low', context: 'desenvolvimento' }
    ];

    const updatedContent = { ...slidesContent };
    let successfulGenerations = 0;
    let totalAttempts = 0;
    let highPrioritySuccess = 0;
    let highPriorityTotal = 0;

    // Processar campos por prioridade
    const sortedFields = prioritizedImageFields.sort((a, b) => {
      const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 };
      return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
    });

    for (const fieldInfo of sortedFields) {
      const { field, priority, context } = fieldInfo;
      const prompt = slidesContent[field];
      
      if (prompt && typeof prompt === 'string' && prompt.trim() !== '') {
        totalAttempts++;
        if (priority === 'high') highPriorityTotal++;
        
        try {
          console.log(`🎨 Generating ULTRA-OPTIMIZED ${priority} priority image for ${field} (${context})...`);
          console.log(`📝 Ultra-optimizing prompt: ${prompt.substring(0, 80)}...`);
          
          // Sistema de otimização contextual por disciplina
          const contextualPrompt = this.optimizePromptByContext(prompt, formData, context);
          
          console.log(`🧠 Contextually optimized prompt: ${contextualPrompt.substring(0, 100)}...`);

          const { data, error } = await supabase.functions.invoke('gerarImagemIA', {
            body: { prompt: contextualPrompt }
          });

          if (error) {
            console.error(`❌ Error generating ultra-optimized image for ${field}:`, error);
            continue;
          }

          if (data?.success && data?.imageUrl) {
            // Salvar dados da imagem ultra-otimizada
            updatedContent[field + '_url'] = data.imageUrl;
            updatedContent[field + '_data'] = data.imageData;
            
            // Salvar sugestão de posicionamento de texto se disponível
            if (data.textPlacementSuggestion) {
              updatedContent[field + '_text_placement'] = data.textPlacementSuggestion;
            }
            
            successfulGenerations++;
            if (priority === 'high') highPrioritySuccess++;
            
            console.log(`✅ ULTRA-OPTIMIZED image generated successfully for ${field} (${priority} priority)`);
            if (data.stats) {
              console.log(`📊 Ultra-optimized stats - Size: ${data.stats.sizeKB}KB, Format: ${data.stats.mimeType}`);
            }
          } else {
            console.warn(`⚠️ No ultra-optimized image URL returned for ${field}`);
          }

          // Delay inteligente baseado na prioridade
          const delay = priority === 'high' ? 2000 : priority === 'medium' ? 1500 : 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          
        } catch (error) {
          console.error(`❌ Exception in ultra-optimized generation for ${field}:`, error);
          continue;
        }
      }
    }

    console.log(`🎨 ULTRA-OPTIMIZED image generation completed for slides v2.0`);
    console.log(`📊 Ultra-optimization summary:`);
    console.log(`  ✓ Total: ${successfulGenerations}/${totalAttempts} images generated`);
    console.log(`  ✓ High Priority: ${highPrioritySuccess}/${highPriorityTotal} critical images`);
    console.log(`  ✓ Success Rate: ${Math.round((successfulGenerations/totalAttempts) * 100)}%`);
    console.log(`  ✓ Critical Success Rate: ${Math.round((highPrioritySuccess/highPriorityTotal) * 100)}%`);
    
    // Verificar se pelo menos as imagens de alta prioridade foram geradas
    if (highPrioritySuccess === 0 && highPriorityTotal > 0) {
      console.warn('⚠️ CRITICAL: No high-priority images were generated successfully');
    } else if (highPrioritySuccess >= Math.ceil(highPriorityTotal * 0.7)) {
      console.log('✅ SUCCESS: Majority of critical images generated successfully');
    }
    
    return updatedContent;
  }

  private optimizePromptByContext(originalPrompt: string, formData: MaterialFormData, slideContext: string): string {
    console.log('🧠 Applying contextual prompt optimization...');
    
    // Análise da disciplina
    const subject = (formData.disciplina || formData.subject || '').toLowerCase();
    const grade = (formData.serie || formData.grade || '').toLowerCase();
    
    // Contexto educacional brasileiro
    let optimizedPrompt = originalPrompt;
    
    // Otimizações por disciplina
    if (subject.includes('matemática') || subject.includes('math')) {
      optimizedPrompt += ', mathematical concept illustration, geometric shapes, Brazilian educational context';
    } else if (subject.includes('ciência') || subject.includes('science')) {
      optimizedPrompt += ', scientific illustration, natural phenomena, Brazilian educational context';
    } else if (subject.includes('história') || subject.includes('history')) {
      optimizedPrompt += ', Brazilian historical illustration, cultural elements';
    } else if (subject.includes('geografia') || subject.includes('geography')) {
      optimizedPrompt += ', Brazilian geographical illustration, landscape elements';
    } else if (subject.includes('português') || subject.includes('language')) {
      optimizedPrompt += ', Brazilian language arts illustration, communication concept';
    }
    
    // Otimizações por contexto do slide
    if (slideContext === 'capa') {
      optimizedPrompt += ', attractive cover illustration, engaging title design';
    } else if (slideContext === 'conceitos') {
      optimizedPrompt += ', clear concept visualization, explanatory illustration';
    } else if (slideContext === 'exemplo') {
      optimizedPrompt += ', practical example illustration, real-world application';
    }
    
    // Otimizações por série
    if (grade.includes('fundamental') || grade.includes('elementary')) {
      optimizedPrompt += ', child-friendly illustration, colorful and engaging';
    } else if (grade.includes('médio') || grade.includes('high')) {
      optimizedPrompt += ', sophisticated illustration, mature educational design';
    }
    
    // Estratégia anti-texto ultra-robusta contextual
    optimizedPrompt += ', Brazilian educational illustration, high quality, clean design, ABSOLUTELY NO TEXT, NO WORDS, NO LETTERS, NO NUMBERS, visual elements only';
    
    return optimizedPrompt;
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

  // FLUXO DE SALVAMENTO SIMPLIFICADO E CORRIGIDO
  async updateMaterial(id: string, updates: Partial<GeneratedMaterial>): Promise<boolean> {
    console.log('📝 MaterialService.updateMaterial: Starting update process');
    console.log('📊 Input data:', {
      id,
      title: updates.title,
      subject: updates.subject,
      grade: updates.grade,
      type: updates.type,
      contentKeys: updates.content ? Object.keys(updates.content) : [],
      contentSample: updates.content
    });
    
    try {
      // Preparar dados para userMaterialsService - mapeamento direto e simples
      const userMaterialUpdates: any = {};
      
      // Mapear campos básicos
      if (updates.title !== undefined) userMaterialUpdates.title = updates.title;
      if (updates.subject !== undefined) userMaterialUpdates.subject = updates.subject;
      if (updates.grade !== undefined) userMaterialUpdates.grade = updates.grade;
      if (updates.type !== undefined) {
        userMaterialUpdates.type = updates.type === 'plano-de-aula' ? 'plano-aula' : updates.type;
      }
      
      // Para o content: serializar EXATAMENTE como recebido, sem modificações
      if (updates.content !== undefined) {
        console.log('📦 MaterialService: Serializing content for storage');
        
        // Garantir que o content seja um objeto válido
        let contentToStore = updates.content;
        if (typeof contentToStore === 'string') {
          try {
            contentToStore = JSON.parse(contentToStore);
          } catch (e) {
            console.warn('⚠️ MaterialService: Content string is not valid JSON, using as-is');
          }
        }
        
        // Serializar para string JSON
        userMaterialUpdates.content = JSON.stringify(contentToStore);
        console.log('📊 MaterialService: Content prepared for storage:', {
          originalType: typeof updates.content,
          serializedLength: userMaterialUpdates.content.length,
          contentKeys: Object.keys(contentToStore || {})
        });
      }

      console.log('📤 MaterialService: Calling userMaterialsService.updateMaterial with:', {
        id,
        title: userMaterialUpdates.title,
        subject: userMaterialUpdates.subject,
        grade: userMaterialUpdates.grade,
        type: userMaterialUpdates.type,
        contentLength: userMaterialUpdates.content?.length || 0
      });
      
      // Chamar o serviço de usuário para fazer o update
      const success = await userMaterialsService.updateMaterial(id, userMaterialUpdates);
      
      if (success) {
        console.log('✅ MaterialService: Update completed successfully');
      } else {
        console.error('❌ MaterialService: Update failed');
      }
      
      return success;
    } catch (error) {
      console.error('❌ MaterialService: Error in updateMaterial:', error);
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
    const title = this.generateTitle(type, formData);
    const materialType = type === 'plano-de-aula' ? 'plano-aula' : type as 'plano-aula' | 'atividade' | 'slides' | 'avaliacao';

    // Corrigir habilidades para sempre salvar como array de strings
    let habilidades: string[] = [];
    if (content.habilidades && Array.isArray(content.habilidades)) {
      habilidades = content.habilidades.map((h: any) => {
        if (typeof h === 'object' && h.codigo && h.descricao) {
          return `${h.codigo} - ${h.descricao}`;
        } else if (typeof h === 'string') {
          return h;
        }
        return '';
      });
      content.habilidades = habilidades;
    } else if (typeof content.habilidades === 'string') {
      content.habilidades = [content.habilidades];
    }

    return {
      title,
      type: materialType,
      subject: formData.disciplina || formData.subject || 'Não informado',
      grade: formData.serie || formData.grade || 'Não informado',
      userId: '',
      content: JSON.stringify(content)
    };
  }

  private generateTitle(type: string, formData: MaterialFormData): string {
    if (type === 'avaliacao' && formData.assuntos && formData.assuntos.length > 0) {
      const topics = formData.assuntos.filter(s => s.trim() !== '').slice(0, 2);
      const topicText = topics.length > 1 ? `${topics[0]} e mais` : topics[0];
      return topicText;
    }
    const topic = formData.tema || formData.topic || 'Conteúdo Personalizado';
    return topic;
  }

  private convertToGeneratedMaterial(userMaterial: UserMaterial, content: any, formData: MaterialFormData): GeneratedMaterial {
    // Ajuste de recursos didáticos: juntar todos os recursos das etapas do desenvolvimento, sem duplicados
    let recursos: string[] = [];
    if (content.desenvolvimento && Array.isArray(content.desenvolvimento)) {
      const recursosSet = new Set<string>();
      content.desenvolvimento.forEach((etapa: any) => {
        if (etapa.recursos) {
          const recursosEtapa = Array.isArray(etapa.recursos)
            ? etapa.recursos
            : etapa.recursos.split(',').map((r: string) => r.trim());
          recursosEtapa.forEach((r: string) => {
            if (r && !recursosSet.has(r.toLowerCase())) recursosSet.add(r);
          });
        }
      });
      recursos = Array.from(recursosSet);
    }
    // Ajuste de habilidades: garantir formato 'CÓDIGO - DESCRIÇÃO' e nunca misturar com objetivos
    let habilidades: string[] = [];
    let objetivos: string[] = [];
    let bnccCodigos: string[] = [];
    if (content.habilidades && Array.isArray(content.habilidades)) {
      habilidades = content.habilidades
        .map((h: any) => {
          if (typeof h === 'object' && h.codigo && h.descricao) {
            bnccCodigos.push(h.codigo);
            return `${h.codigo} - ${h.descricao}`;
          } else if (typeof h === 'string') {
            // Tenta separar código e descrição por ':' ou '-'
            const match = h.match(/([A-Z]{2}\d{2}[A-Z]{2}\d{2,})\s*[-:]?\s*(.*)/);
            if (match) {
              bnccCodigos.push(match[1]);
              return `${match[1]} - ${match[2]}`;
            }
            return h;
          }
          return '';
        })
        .filter((h: string, idx: number, arr: string[]) => h && arr.indexOf(h) === idx);
    } else if (typeof content.habilidades === 'string') {
      habilidades = [content.habilidades];
    }
    if (content.objetivos && Array.isArray(content.objetivos)) {
      objetivos = content.objetivos
        .map((o: any) => typeof o === 'string' ? o.trim() : '')
        .filter((o: string, idx: number, arr: string[]) => o && arr.indexOf(o) === idx);
    } else if (typeof content.objetivos === 'string') {
      objetivos = [content.objetivos];
    }
    // Ajuste do campo BNCC: apenas os códigos
    let bncc = '';
    if (bnccCodigos.length > 0) {
      bncc = bnccCodigos.join(', ');
    } else if (Array.isArray(content.bncc)) {
      // Se for array de objetos com código
      if (content.bncc.length > 0 && typeof content.bncc[0] === 'object' && content.bncc[0].codigo) {
        bncc = content.bncc.map((b: any) => b.codigo).filter(Boolean).join(', ');
      } else {
        bncc = content.bncc.join(', ');
      }
    } else if (typeof content.bncc === 'object') {
      bncc = Object.values(content.bncc).join(', ');
    } else if (typeof content.bncc === 'string') {
      bncc = content.bncc;
    } else if (formData && formData.bncc) {
      bncc = formData.bncc;
    }
    return {
      id: userMaterial.id,
      title: userMaterial.title,
      type: userMaterial.type === 'plano-aula' ? 'plano-de-aula' : userMaterial.type,
      subject: userMaterial.subject,
      grade: userMaterial.grade,
      createdAt: userMaterial.createdAt,
      content: {
        ...content,
        recursos,
        habilidades,
        objetivos,
        bncc
      },
      formData
    };
  }
}

// Função utilitária para normalizar campos das questões
function normalizeQuestionFields(q) {
  // Converte colunaA/colunaB para coluna_a/coluna_b se necessário
  const newQ = { ...q };
  if (q.colunaA && !q.coluna_a) newQ.coluna_a = q.colunaA;
  if (q.colunaB && !q.coluna_b) newQ.coluna_b = q.colunaB;
  // Remove os campos antigos para evitar duplicidade
  delete newQ.colunaA;
  delete newQ.colunaB;
  return newQ;
}

// Função utilitária para normalizar material para preview/modal
export function normalizeMaterialForPreview(material: any) {
  if (!material) return material;
  // Copia superficial para não mutar o original
  const normalized = { ...material };
  // Normaliza questões se for atividade ou avaliação
  if (normalized.type === 'atividade' || normalized.type === 'avaliacao') {
    const questoes = (normalized.content?.questoes || normalized.questoes || []).map((q: any, i: number) =>
      QuestionParserService.validateAndFixQuestion(normalizeQuestionFields(q), i)
    );
    if (normalized.content) {
      normalized.content = { ...normalized.content, questoes };
    } else {
      normalized.questoes = questoes;
    }
  }
  return normalized;
}

export async function getMaterialPrincipalInfo(material_principal_id: string): Promise<{ tipo: string, titulo: string } | null> {
  // Tenta buscar em cada tabela
  const tables: Array<{ type: string, table: 'planos_de_aula' | 'atividades' | 'slides' | 'avaliacoes' }> = [
    { type: 'plano-de-aula', table: 'planos_de_aula' },
    { type: 'atividade', table: 'atividades' },
    { type: 'slides', table: 'slides' },
    { type: 'avaliacao', table: 'avaliacoes' }
  ];
  for (const { type, table } of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('id, titulo')
      .eq('id', material_principal_id)
      .single();
    if (data && data.id) {
      return { tipo: type, titulo: data.titulo };
    }
  }
  return null;
}

export const materialService = new MaterialService();
