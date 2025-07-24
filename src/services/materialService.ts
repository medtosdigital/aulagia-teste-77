
import { unifiedMaterialsService, UnifiedMaterial } from './unifiedMaterialsService';
import { supabase } from '@/integrations/supabase/client';
import { QuestionParserService } from './questionParserService';

export interface GeneratedMaterial {
  id: string;
  title: string;
  type: 'plano-de-aula' | 'slides' | 'atividade' | 'avaliacao' | 'apoio';
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
  material_principal_id?: string;
  turma?: string;
}

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
    console.log('🚀 [MATERIALSERVICE] Iniciando geração de material:', { type, formData });
    
    try {
      // Verificar se o usuário pode criar material
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Verificar limite de criação
      const { data: canCreate, error: canCreateError } = await supabase
        .rpc('can_create_material', { p_user_id: user.id });
      
      if (canCreateError) {
        console.error('❌ [LIMITE] Erro ao verificar limite:', canCreateError);
        throw new Error('Erro ao verificar limite de criação');
      }

      if (!canCreate) {
        console.error('❌ [LIMITE] Usuário atingiu limite de criação');
        throw new Error('Limite de criação de materiais atingido');
      }

      console.log('✅ [LIMITE] Usuário pode criar material');
      
      // Incrementar contador antes de gerar
      const { error: incrementError } = await supabase
        .rpc('increment_material_usage', { p_user_id: user.id });
      
      if (incrementError) {
        console.error('❌ [CONTADOR] Erro ao incrementar contador:', incrementError);
        throw new Error('Erro ao incrementar contador de uso');
      }

      console.log('✅ [CONTADOR] Contador incrementado com sucesso');

      // Chamar edge function para gerar conteúdo
      console.log('📞 [EDGE-FUNCTION] Chamando gerarMaterialIA...');
      const { data, error } = await supabase.functions.invoke('gerarMaterialIA', {
        body: {
          materialType: type,
          formData
        }
      });

      if (error) {
        console.error('❌ [EDGE-FUNCTION] Erro na edge function:', error);
        throw new Error(`Erro ao gerar conteúdo: ${error.message}`);
      }

      if (!data || !data.success) {
        console.error('❌ [EDGE-FUNCTION] Resposta inválida:', data);
        throw new Error('Resposta inválida do serviço de geração');
      }

      console.log('✅ [EDGE-FUNCTION] Conteúdo gerado com sucesso');
      let generatedContent = data.content;
      
      // Mapear dados para a tabela unificada
      const materialData = this.mapToUnifiedMaterial(type, formData, generatedContent, user.id);
      console.log('📝 [MAPEAMENTO] Material mapeado:', materialData);
      
      // Salvar no banco
      console.log('💾 [SAVE] Salvando material no banco...');
      const savedMaterial = await unifiedMaterialsService.addMaterial(materialData);
      
      if (!savedMaterial) {
        console.error('❌ [SAVE] Falha ao salvar material');
        throw new Error('Falha ao salvar material no banco de dados');
      }
      
      console.log('✅ [SAVE] Material salvo com sucesso:', savedMaterial.id);
      
      // Converter para formato esperado
      const result = this.convertToGeneratedMaterial(savedMaterial, generatedContent, formData);
      console.log('🏁 [FINAL] Material convertido e retornado');
      
      return result;
    } catch (error) {
      console.error('❌ [ERRO] Erro em generateMaterial:', error);
      throw error;
    }
  }

  async getMaterials(): Promise<GeneratedMaterial[]> {
    console.log('📋 [GET-MATERIALS] Buscando materiais...');
    try {
      const unifiedMaterials = await unifiedMaterialsService.getMaterialsByUser();
      console.log('✅ [GET-MATERIALS] Materiais carregados:', unifiedMaterials.length);
      
      return unifiedMaterials.map(material => this.convertUnifiedToGenerated(material));
    } catch (error) {
      console.error('❌ [GET-MATERIALS] Erro ao buscar materiais:', error);
      return [];
    }
  }

  async getMaterialById(id: string): Promise<GeneratedMaterial | null> {
    console.log('🔍 [GET-BY-ID] Buscando material por ID:', id);
    try {
      const material = await unifiedMaterialsService.getMaterialById(id);
      
      if (!material) {
        console.log('❌ [GET-BY-ID] Material não encontrado:', id);
        return null;
      }
      
      console.log('✅ [GET-BY-ID] Material encontrado:', material.title);
      return this.convertUnifiedToGenerated(material);
    } catch (error) {
      console.error('❌ [GET-BY-ID] Erro ao buscar material:', error);
      return null;
    }
  }

  async deleteMaterial(id: string): Promise<boolean> {
    console.log('🗑️ [DELETE] Deletando material:', id);
    try {
      const success = await unifiedMaterialsService.deleteMaterial(id);
      if (success) {
        console.log('✅ [DELETE] Material deletado com sucesso');
      } else {
        console.log('❌ [DELETE] Falha ao deletar material');
      }
      return success;
    } catch (error) {
      console.error('❌ [DELETE] Erro ao deletar material:', error);
      return false;
    }
  }

  async updateMaterial(id: string, updates: Partial<GeneratedMaterial>): Promise<boolean> {
    console.log('📝 [UPDATE] Atualizando material:', id);
    
    try {
      const unifiedUpdates: Partial<UnifiedMaterial> = {};
      
      if (updates.title !== undefined) unifiedUpdates.title = updates.title;
      if (updates.subject !== undefined) unifiedUpdates.subject = updates.subject;
      if (updates.grade !== undefined) unifiedUpdates.grade = updates.grade;
      if (updates.type !== undefined) {
        unifiedUpdates.type = updates.type === 'plano-de-aula' ? 'plano-de-aula' : updates.type;
      }
      
      if (updates.content !== undefined) {
        let contentToStore = updates.content;
        if (typeof contentToStore === 'string') {
          try {
            contentToStore = JSON.parse(contentToStore);
          } catch (e) {
            console.warn('⚠️ [UPDATE] Content string não é JSON válido');
          }
        }
        unifiedUpdates.content = JSON.stringify(contentToStore);
      }

      const success = await unifiedMaterialsService.updateMaterial(id, unifiedUpdates);
      
      if (success) {
        console.log('✅ [UPDATE] Material atualizado com sucesso');
      } else {
        console.error('❌ [UPDATE] Falha na atualização');
      }
      
      return success;
    } catch (error) {
      console.error('❌ [UPDATE] Erro ao atualizar material:', error);
      return false;
    }
  }

  private mapToUnifiedMaterial(type: string, formData: MaterialFormData, content: any, userId: string): Omit<UnifiedMaterial, 'id' | 'createdAt' | 'status'> {
    const isApoio = type === 'apoio';
    
    // Extrair campos extras do conteúdo ou formData
    const tema = content.tema || content.topic || formData.tema || formData.topic || '';
    const turma = content.turma || formData.turma || '';
    const disciplina = content.disciplina || content.subject || formData.disciplina || formData.subject || '';
    const serie = content.serie || content.grade || formData.serie || formData.grade || '';
    
    return {
      title: this.generateTitle(type, formData),
      type: type as UnifiedMaterial['type'],
      subject: disciplina || 'Não informado',
      grade: serie || 'Não informado',
      userId,
      content: JSON.stringify(content),
      // Campos extras conforme necessário
      ...(tema ? { tema } : {}),
      ...(turma ? { turma } : {}),
      ...(isApoio && formData.material_principal_id ? { mainMaterialId: formData.material_principal_id } : {})
    };
  }

  private convertUnifiedToGenerated(unifiedMaterial: UnifiedMaterial): GeneratedMaterial {
    let content;
    try {
      content = unifiedMaterial.content ? JSON.parse(unifiedMaterial.content) : {};
    } catch (error) {
      console.error('❌ [CONVERT] Erro ao fazer parse do conteúdo:', error);
      content = {};
    }

    return {
      id: unifiedMaterial.id,
      title: unifiedMaterial.title,
      type: unifiedMaterial.type,
      subject: unifiedMaterial.subject,
      grade: unifiedMaterial.grade,
      createdAt: unifiedMaterial.createdAt,
      content
    };
  }

  private convertToGeneratedMaterial(unifiedMaterial: UnifiedMaterial, content: any, formData: MaterialFormData): GeneratedMaterial {
    // Processar recursos e habilidades para planos de aula
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

    // Processar habilidades BNCC
    let habilidades: string[] = [];
    let objetivos: string[] = [];
    const bnccCodigos: string[] = [];

    if (content.habilidades && Array.isArray(content.habilidades)) {
      habilidades = content.habilidades
        .map((h: any) => {
          if (typeof h === 'object' && h.codigo && h.descricao) {
            bnccCodigos.push(h.codigo);
            return `${h.codigo} - ${h.descricao}`;
          } else if (typeof h === 'string') {
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
    }

    if (content.objetivos && Array.isArray(content.objetivos)) {
      objetivos = content.objetivos
        .map((o: any) => typeof o === 'string' ? o.trim() : '')
        .filter((o: string, idx: number, arr: string[]) => o && arr.indexOf(o) === idx);
    }

    let bncc = '';
    if (bnccCodigos.length > 0) {
      bncc = bnccCodigos.join(', ');
    } else if (formData && formData.bncc) {
      bncc = formData.bncc;
    }

    // Conteúdo final processado
    const contentFinal = {
      ...content,
      recursos,
      habilidades,
      objetivos,
      bncc
    };

    return {
      id: unifiedMaterial.id,
      title: unifiedMaterial.title,
      type: unifiedMaterial.type,
      subject: unifiedMaterial.subject,
      grade: unifiedMaterial.grade,
      createdAt: unifiedMaterial.createdAt,
      content: contentFinal,
      formData
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
}

// Função para normalizar campos das questões
function normalizeQuestionFields(q: any) {
  const newQ = { ...q };
  if (q.colunaA && !q.coluna_a) newQ.coluna_a = q.colunaA;
  if (q.colunaB && !q.coluna_b) newQ.coluna_b = q.colunaB;
  delete newQ.colunaA;
  delete newQ.colunaB;
  return newQ;
}

// Função utilitária para normalizar material para preview/modal
export function normalizeMaterialForPreview(material: any) {
  if (!material) return material;
  const normalized = { ...material };
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

// Função para obter informações principais do material
export async function getMaterialPrincipalInfo(material_principal_id: string): Promise<{ tipo: string, titulo: string } | null> {
  const material = await unifiedMaterialsService.getMaterialById(material_principal_id);
  if (!material) return null;
  
  return {
    tipo: material.type,
    titulo: material.title
  };
}

export const materialService = new MaterialService();
