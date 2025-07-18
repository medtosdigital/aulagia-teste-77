import { supabase } from '@/integrations/supabase/client';
import { enhancedMaterialService } from '@/services/enhancedMaterialService';

interface MaterialFixerOptions {
  fixObjectives?: boolean;
  fixSkills?: boolean;
  fixReferences?: boolean;
  fixDevelopment?: boolean;
}

export class MaterialFixer {
  static async fixExistingMaterials(options: MaterialFixerOptions = {}) {
    console.log('🔧 Starting material fixer with options:', options);
    
    try {
      // Buscar todos os materiais
      const { data: materials, error } = await supabase
        .from('materiais')
        .select('*')
        .eq('tipo_material', 'plano-de-aula');

      if (error) {
        console.error('❌ Error fetching materials:', error);
        return;
      }

      console.log(`📋 Found ${materials?.length || 0} planos de aula to fix`);

      for (const material of materials || []) {
        console.log(`🔧 Fixing material: ${material.titulo} (ID: ${material.id})`);
        
        try {
          // Parse content
          let content;
          try {
            content = JSON.parse(material.conteudo);
          } catch (parseError) {
            console.warn(`⚠️ Error parsing content for material ${material.id}:`, parseError);
            continue;
          }

          let needsUpdate = false;

          // Fix objectives
          if (options.fixObjectives && content.objetivos) {
            const fixedObjectives = this.fixObjectives(content.objetivos);
            if (JSON.stringify(fixedObjectives) !== JSON.stringify(content.objetivos)) {
              content.objetivos = fixedObjectives;
              needsUpdate = true;
              console.log(`✅ Fixed objectives for material ${material.id}`);
            }
          }

          // Fix skills
          if (options.fixSkills && content.habilidades) {
            const fixedSkills = this.fixSkills(content.habilidades);
            if (JSON.stringify(fixedSkills) !== JSON.stringify(content.habilidades)) {
              content.habilidades = fixedSkills;
              needsUpdate = true;
              console.log(`✅ Fixed skills for material ${material.id}`);
            }
          }

          // Fix references
          if (options.fixReferences && content.referencias) {
            const fixedReferences = this.fixReferences(content.referencias);
            if (JSON.stringify(fixedReferences) !== JSON.stringify(content.referencias)) {
              content.referencias = fixedReferences;
              needsUpdate = true;
              console.log(`✅ Fixed references for material ${material.id}`);
            }
          }

          // Fix development
          if (options.fixDevelopment && content.desenvolvimento) {
            const fixedDevelopment = this.fixDevelopment(content.desenvolvimento);
            if (JSON.stringify(fixedDevelopment) !== JSON.stringify(content.desenvolvimento)) {
              content.desenvolvimento = fixedDevelopment;
              needsUpdate = true;
              console.log(`✅ Fixed development for material ${material.id}`);
            }
          }

          // Update material if needed
          if (needsUpdate) {
            const { error: updateError } = await supabase
              .from('materiais')
              .update({
                conteudo: JSON.stringify(content)
              })
              .eq('id', material.id);

            if (updateError) {
              console.error(`❌ Error updating material ${material.id}:`, updateError);
            } else {
              console.log(`✅ Successfully updated material ${material.id}`);
            }
          }

        } catch (materialError) {
          console.error(`❌ Error processing material ${material.id}:`, materialError);
        }
      }

      console.log('✅ Material fixer completed');
    } catch (error) {
      console.error('❌ Error in material fixer:', error);
    }
  }

  private static fixObjectives(objectives: any[]): string[] {
    if (!Array.isArray(objectives)) {
      return ['Objetivo específico e mensurável relacionado ao tema'];
    }

    return objectives
      .map(obj => {
        if (typeof obj === 'string') {
          const trimmed = obj.trim();
          if (trimmed.length > 0) {
            return trimmed;
          }
        }
        return null;
      })
      .filter(obj => obj !== null) as string[];
  }

  private static fixSkills(skills: any[]): any[] {
    if (!Array.isArray(skills)) {
      return [{ codigo: 'EF01MA01', descricao: 'Habilidade BNCC' }];
    }

    return skills.map(skill => {
      if (typeof skill === 'object' && skill.codigo && skill.descricao) {
        return skill;
      } else if (typeof skill === 'string') {
        const match = skill.match(/([A-Z]{2}\d{2}[A-Z]{2}\d{2,})\s*[-:]\s*(.*)/);
        if (match) {
          return { codigo: match[1], descricao: match[2].trim() };
        }
        return { codigo: 'EF01MA01', descricao: skill };
      }
      return { codigo: 'EF01MA01', descricao: 'Habilidade BNCC' };
    });
  }

  private static fixReferences(references: any[]): string[] {
    if (!Array.isArray(references)) {
      return ['AUTOR, Nome. Título da obra. Edição. Local: Editora, ano.'];
    }

    return references.map(ref => {
      if (typeof ref === 'string') {
        if (!ref.includes('SOBRENOME, Nome') && !ref.includes(',')) {
          return 'AUTOR, Nome. Título da obra. Edição. Local: Editora, ano.';
        }
      }
      return ref;
    });
  }

  private static fixDevelopment(development: any[]): any[] {
    if (!Array.isArray(development)) {
      return [];
    }

    return development.map(etapa => ({
      etapa: etapa.etapa || 'Etapa não especificada',
      atividade: etapa.atividade || 'Atividade não especificada',
      tempo: etapa.tempo || 'Tempo não especificado',
      recursos: etapa.recursos || 'Recursos não especificados'
    }));
  }

  static async validateAndFixMaterial(materialId: string): Promise<boolean> {
    console.log(`🔍 Validating and fixing material: ${materialId}`);
    
    try {
      const { data: material, error } = await supabase
        .from('materiais')
        .select('*')
        .eq('id', materialId)
        .single();

      if (error || !material) {
        console.error('❌ Error fetching material:', error);
        return false;
      }

      // Parse content
      let content;
      try {
        content = JSON.parse(material.conteudo);
      } catch (parseError) {
        console.error('❌ Error parsing material content:', parseError);
        return false;
      }

      // Apply all fixes
      content.objetivos = this.fixObjectives(content.objetivos);
      content.habilidades = this.fixSkills(content.habilidades);
      content.referencias = this.fixReferences(content.referencias);
      content.desenvolvimento = this.fixDevelopment(content.desenvolvimento);

      // Update material
      const { error: updateError } = await supabase
        .from('materiais')
        .update({
          conteudo: JSON.stringify(content)
        })
        .eq('id', materialId);

      if (updateError) {
        console.error('❌ Error updating material:', updateError);
        return false;
      }

      console.log('✅ Material validated and fixed successfully');
      return true;
    } catch (error) {
      console.error('❌ Error in validateAndFixMaterial:', error);
      return false;
    }
  }
} 