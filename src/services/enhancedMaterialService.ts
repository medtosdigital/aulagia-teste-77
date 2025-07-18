import { materialService, MaterialFormData, GeneratedMaterial } from './materialService';
import { supabase } from '@/integrations/supabase/client';

interface EnhancedMaterialFormData extends MaterialFormData {
  user_id?: string;
}

class EnhancedMaterialService {
  async generateEnhancedMaterial(type: string, formData: EnhancedMaterialFormData): Promise<GeneratedMaterial> {
    console.log('🚀 Starting ENHANCED material generation:', { type, formData });
    
    try {
      // ETAPA 1: Gerar material base
      const baseMaterial = await materialService.generateMaterial(type, formData);
      
      // ETAPA 2: Se for plano de aula, aplicar correções específicas
      if (type === 'plano-de-aula') {
        console.log('🔧 Applying plan-specific enhancements...');
        
        // Garantir que objetivos sejam preservados
        if (baseMaterial.content && baseMaterial.content.objetivos) {
          console.log('✅ Objectives preserved:', baseMaterial.content.objetivos);
        } else {
          console.warn('⚠️ No objectives found in generated material');
        }

        // Garantir que habilidades sejam objetos válidos
        if (baseMaterial.content && baseMaterial.content.habilidades) {
          const habilidades = baseMaterial.content.habilidades;
          if (Array.isArray(habilidades)) {
            const validHabilidades = habilidades.map(h => {
              if (typeof h === 'string') {
                // Tentar extrair código e descrição de string
                const match = h.match(/([A-Z]{2}\d{2}[A-Z]{2}\d{2,})\s*[-:]\s*(.*)/);
                if (match) {
                  return { codigo: match[1], descricao: match[2].trim() };
                }
                return { codigo: 'EF01MA01', descricao: h };
              }
              return h;
            });
            baseMaterial.content.habilidades = validHabilidades;
          }
        }

        // Garantir que referências sigam ABNT
        if (baseMaterial.content && baseMaterial.content.referencias) {
          const referencias = baseMaterial.content.referencias;
          if (Array.isArray(referencias)) {
            const validReferencias = referencias.map(ref => {
              if (typeof ref === 'string') {
                // Se não está no formato ABNT, tentar formatar
                if (!ref.includes('SOBRENOME, Nome') && !ref.includes(',')) {
                  return `AUTOR, Nome. Título da obra. Edição. Local: Editora, ano.`;
                }
              }
              return ref;
            });
            baseMaterial.content.referencias = validReferencias;
          }
        }

        // Garantir que desenvolvimento seja detalhado
        if (baseMaterial.content && baseMaterial.content.desenvolvimento) {
          const desenvolvimento = baseMaterial.content.desenvolvimento;
          if (Array.isArray(desenvolvimento)) {
            const enhancedDesenvolvimento = desenvolvimento.map(etapa => ({
              ...etapa,
              atividade: etapa.atividade || 'Atividade não especificada',
              recursos: etapa.recursos || 'Recursos não especificados',
              tempo: etapa.tempo || 'Tempo não especificado'
            }));
            baseMaterial.content.desenvolvimento = enhancedDesenvolvimento;
          }
        }
      }

      // ETAPA 3: Salvar material aprimorado
      console.log('💾 Saving enhanced material...');
      
      // Atualizar o material no banco de dados
      const { data: updatedMaterial, error } = await supabase
        .from('materiais')
        .update({
          conteudo: JSON.stringify(baseMaterial.content)
        })
        .eq('id', baseMaterial.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating enhanced material:', error);
      } else {
        console.log('✅ Enhanced material saved successfully');
      }

      return baseMaterial;
    } catch (error) {
      console.error('❌ Error in enhanced material generation:', error);
      throw error;
    }
  }

  async validateAndFixMaterial(material: GeneratedMaterial): Promise<GeneratedMaterial> {
    console.log('🔍 Validating and fixing material:', material.id);
    
    const fixedMaterial = { ...material };
    
    // Corrigir objetivos
    if (fixedMaterial.content && fixedMaterial.content.objetivos) {
      const objetivos = fixedMaterial.content.objetivos;
      if (Array.isArray(objetivos)) {
        const validObjetivos = objetivos
          .map(obj => typeof obj === 'string' ? obj.trim() : '')
          .filter(obj => obj.length > 0);
        
        if (validObjetivos.length === 0) {
          console.warn('⚠️ No valid objectives found, adding default');
          validObjetivos.push('Objetivo específico e mensurável relacionado ao tema');
        }
        
        fixedMaterial.content.objetivos = validObjetivos;
      }
    }

    // Corrigir habilidades
    if (fixedMaterial.content && fixedMaterial.content.habilidades) {
      const habilidades = fixedMaterial.content.habilidades;
      if (Array.isArray(habilidades)) {
        const validHabilidades = habilidades.map(h => {
          if (typeof h === 'object' && h.codigo && h.descricao) {
            return h;
          } else if (typeof h === 'string') {
            const match = h.match(/([A-Z]{2}\d{2}[A-Z]{2}\d{2,})\s*[-:]\s*(.*)/);
            if (match) {
              return { codigo: match[1], descricao: match[2].trim() };
            }
            return { codigo: 'EF01MA01', descricao: h };
          }
          return { codigo: 'EF01MA01', descricao: 'Habilidade BNCC' };
        });
        fixedMaterial.content.habilidades = validHabilidades;
      }
    }

    // Corrigir referências
    if (fixedMaterial.content && fixedMaterial.content.referencias) {
      const referencias = fixedMaterial.content.referencias;
      if (Array.isArray(referencias)) {
        const validReferencias = referencias.map(ref => {
          if (typeof ref === 'string') {
            if (!ref.includes('SOBRENOME, Nome') && !ref.includes(',')) {
              return 'AUTOR, Nome. Título da obra. Edição. Local: Editora, ano.';
            }
          }
          return ref;
        });
        fixedMaterial.content.referencias = validReferencias;
      }
    }

    return fixedMaterial;
  }
}

export const enhancedMaterialService = new EnhancedMaterialService(); 