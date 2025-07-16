import { supabase } from '@/integrations/supabase/client';

export interface UserMaterial {
  id: string;
  title: string;
  type: 'plano-aula' | 'atividade' | 'slides' | 'avaliacao';
  subject: string;
  grade: string;
  createdAt: string;
  status: 'completed' | 'draft';
  userId: string;
  content?: string;
}

// Mapeamento correto dos tipos para nomes de tabelas
const TABLE_MAPPING = {
  'plano-aula': 'planos_de_aula',
  'atividade': 'atividades', 
  'slides': 'slides',
  'avaliacao': 'avaliacoes'
} as const;

class UserMaterialsService {
  private async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error getting current user:', error);
      return null;
    }
    return user;
  }

  private mapFromSupabase(item: any, type: string): UserMaterial {
    return {
      id: item.id,
      title: item.titulo,
      type: type as 'plano-aula' | 'atividade' | 'slides' | 'avaliacao',
      subject: item.disciplina || 'Não informado',
      grade: item.serie || 'Não informado',
      createdAt: item.data_criacao?.split('T')[0] || new Date().toISOString().split('T')[0],
      status: 'completed' as const,
      userId: item.user_id,
      content: item.conteudo
    };
  }

  private mapToSupabase(material: Omit<UserMaterial, 'id' | 'createdAt' | 'status'>) {
    return {
      titulo: material.title,
      tipo_material: material.type,
      conteudo: material.content || '',
      disciplina: material.subject,
      serie: material.grade,
      user_id: material.userId
    };
  }

  async getMaterialPrincipalInfo(materialId: string): Promise<{ tipo: string, titulo: string } | null> {
    try {
      // Search in all material tables
      for (const [tipo, tableName] of Object.entries(TABLE_MAPPING)) {
        const { data, error } = await supabase
          .from(tableName)
          .select('titulo')
          .eq('id', materialId)
          .single();
        
        if (data && !error) {
          return { tipo, titulo: data.titulo };
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting material principal info:', error);
      return null;
    }
  }

  async getMaterialsByUser(userId?: string): Promise<UserMaterial[]> {
    try {
      // Always get current authenticated user - ignore passed userId for security
      const user = await this.getCurrentUser();
      if (!user) {
        console.log('No authenticated user found');
        return [];
      }

      console.log('Loading materials for authenticated user:', user.id);
      // Buscar todos os tipos de material em paralelo
      const [planosData, atividadesData, slidesData, avaliacoesData] = await Promise.all([
        supabase
          .from('planos_de_aula')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('atividades')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('slides')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('avaliacoes')
          .select('*')
          .order('created_at', { ascending: false })
      ]);

      const allMaterials: UserMaterial[] = [];

      if (!planosData.error && planosData.data) {
        const mappedPlanos = planosData.data.map(item => this.mapFromSupabase(item, 'plano-aula'));
        allMaterials.push(...mappedPlanos);
        console.log('Loaded planos de aula:', mappedPlanos.length);
      } else if (planosData.error) {
        console.error('Error loading planos de aula:', planosData.error);
      }

      if (!atividadesData.error && atividadesData.data) {
        const mappedAtividades = atividadesData.data.map(item => this.mapFromSupabase(item, 'atividade'));
        allMaterials.push(...mappedAtividades);
        console.log('Loaded atividades:', mappedAtividades.length);
      } else if (atividadesData.error) {
        console.error('Error loading atividades:', atividadesData.error);
      }

      if (!slidesData.error && slidesData.data) {
        const mappedSlides = slidesData.data.map(item => this.mapFromSupabase(item, 'slides'));
        allMaterials.push(...mappedSlides);
        console.log('Loaded slides:', mappedSlides.length);
      } else if (slidesData.error) {
        console.error('Error loading slides:', slidesData.error);
      }

      if (!avaliacoesData.error && avaliacoesData.data) {
        const mappedAvaliacoes = avaliacoesData.data.map(item => this.mapFromSupabase(item, 'avaliacao'));
        allMaterials.push(...mappedAvaliacoes);
        console.log('Loaded avaliacoes:', mappedAvaliacoes.length);
      } else if (avaliacoesData.error) {
        console.error('Error loading avaliacoes:', avaliacoesData.error);
      }

      // Sort by creation date
      const sortedMaterials = allMaterials.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      console.log('Total materials loaded for authenticated user:', sortedMaterials.length);
      return sortedMaterials;
    } catch (error) {
      console.error('Error getting materials:', error);
      return [];
    }
  }

  async addMaterial(material: Omit<UserMaterial, 'id' | 'createdAt' | 'status'>): Promise<UserMaterial | null> {
    try {
      console.log('🚀 Starting addMaterial process');
      console.log('📋 Input material data:', {
        title: material.title,
        type: material.type,
        subject: material.subject,
        grade: material.grade,
        contentLength: material.content?.length || 0
      });
      
      // Get current authenticated user - ignore passed userId for security
      const user = await this.getCurrentUser();
      if (!user) {
        console.error('❌ User must be authenticated to add material');
        throw new Error('Usuário deve estar logado para salvar material');
      }

      console.log('✅ Authenticated user found:', user.id);

      // Validate required fields
      if (!material.title?.trim()) {
        console.error('❌ Material title is required');
        throw new Error('Título do material é obrigatório');
      }

      if (!material.type) {
        console.error('❌ Material type is required');
        throw new Error('Tipo do material é obrigatório');
      }

      // Create material data with authenticated user ID
      const materialWithUser = { ...material, userId: user.id };
      const supabaseData = this.mapToSupabase(materialWithUser);
      const tableName = TABLE_MAPPING[material.type];

      if (!tableName) {
        console.error('❌ Invalid material type:', material.type);
        throw new Error(`Tipo de material inválido: ${material.type}`);
      }

      console.log('📊 Supabase data prepared:', {
        tableName,
        titulo: supabaseData.titulo,
        tipo_material: supabaseData.tipo_material,
        disciplina: supabaseData.disciplina,
        serie: supabaseData.serie,
        user_id: supabaseData.user_id,
        contentLength: supabaseData.conteudo?.length || 0
      });

      console.log(`💾 Inserting into table: ${tableName}`);

      const { data, error } = await supabase
        .from(tableName)
        .insert([supabaseData])
        .select()
        .single();

      if (error) {
        console.error(`❌ Error adding ${material.type}:`, error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(`Erro ao salvar ${material.type}: ${error.message}`);
      }

      if (!data) {
        console.error('❌ No data returned from insert');
        throw new Error('Nenhum dado retornado após inserção');
      }

      console.log('✅ Material saved successfully:', {
        id: data.id,
        titulo: data.titulo,
        created_at: data.created_at
      });

      const savedMaterial = this.mapFromSupabase(data, material.type);
      console.log('🔄 Material mapped back to UserMaterial format:', savedMaterial.id);

      return savedMaterial;
    } catch (error) {
      console.error('❌ Error in addMaterial:', error);
      // Re-throw with user-friendly message if it's not already one
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro interno ao salvar material');
    }
  }

  async getAllMaterials(): Promise<UserMaterial[]> {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        console.log('No authenticated user found');
        return [];
      }
      
      console.log('Getting all materials for authenticated user:', user.id);
      return await this.getMaterialsByUser();
    } catch (error) {
      console.error('Error getting all materials:', error);
      return [];
    }
  }

  async deleteMaterial(id: string): Promise<boolean> {
    try {
      console.log('Deleting material with id:', id);

      // Get current authenticated user
      const user = await this.getCurrentUser();
      if (!user) {
        console.error('User must be authenticated to delete material');
        return false;
      }

      // Buscar em qual tabela o material existe
      let foundTable: string | null = null;
      for (const [type, tableName] of Object.entries(TABLE_MAPPING)) {
        const { data, error } = await supabase
          .from(tableName)
          .select('id, user_id')
          .eq('id', id)
          .single();
        if (data && data.id) {
          if (data.user_id !== user.id) {
            console.error('Usuário não tem permissão para excluir este material');
            return false;
          }
          foundTable = tableName;
          break;
        }
      }
      if (!foundTable) {
        console.error('Material não encontrado em nenhuma tabela');
        return false;
      }
      // Garantir que foundTable é um dos nomes literais das tabelas
      const validTables = ['planos_de_aula', 'atividades', 'slides', 'avaliacoes'] as const;
      if (!validTables.includes(foundTable as any)) {
        console.error('Tabela inválida para exclusão:', foundTable);
        return false;
      }
      // Tentar deletar na tabela correta
      const { error: deleteError } = await supabase
        .from(foundTable as typeof validTables[number])
        .delete()
        .eq('id', id);
      if (deleteError) {
        console.error('Erro ao excluir material:', deleteError.message);
        return false;
      }
      console.log(`Material excluído com sucesso da tabela ${foundTable}`);
      return true;
    } catch (error) {
      console.error('Error deleting material:', error);
      return false;
    }
  }

  async updateMaterial(id: string, updates: Partial<UserMaterial>): Promise<boolean> {
    try {
      console.log('Updating material:', id, updates);

      // Get current authenticated user
      const user = await this.getCurrentUser();
      if (!user) {
        console.error('User must be authenticated to update material');
        return false;
      }

      const updateData: any = {};
      if (updates.title) updateData.titulo = updates.title;
      if (updates.content) updateData.conteudo = typeof updates.content === 'string' ? updates.content : JSON.stringify(updates.content);
      if (updates.subject) updateData.disciplina = updates.subject;
      if (updates.grade) updateData.serie = updates.grade;
      if (updates.type) updateData.tipo_material = updates.type;

      console.log('Update data to send:', updateData);

      // Try to update in each table - RLS will ensure only user's own materials can be updated
      for (const [type, tableName] of Object.entries(TABLE_MAPPING)) {
        const { data: existingData } = await supabase
          .from(tableName)
          .select('id')
          .eq('id', id)
          .single();

        if (existingData) {
          const { error } = await supabase
            .from(tableName)
            .update(updateData)
            .eq('id', id);

          if (!error) {
            console.log(`Material updated successfully in ${tableName}`);
            return true;
          } else {
            console.error(`Erro ao atualizar material na tabela ${tableName}:`, error.message);
          }
        }
      }
      
      console.error('Material not found for update');
      return false;
    } catch (error) {
      console.error('Error updating material:', error);
      return false;
    }
  }

  async initializeSampleMaterials(): Promise<void> {
    try {
      // Get current authenticated user
      const user = await this.getCurrentUser();
      if (!user) {
        console.error('User must be authenticated to initialize sample materials');
        return;
      }

      console.log('Initializing sample materials for authenticated user:', user.id);
      
      const existingMaterials = await this.getMaterialsByUser();
      
      if (existingMaterials.length === 0) {
        console.log('No existing materials found, creating sample materials');
        
        const sampleMaterials = [
          {
            title: 'Plano de Aula - Frações',
            type: 'plano-aula' as const,
            subject: 'Matemática',
            grade: '6º ano',
            userId: user.id,
            content: JSON.stringify({
              objetivo: 'Ensinar conceitos básicos de frações',
              desenvolvimento: 'Explicação teórica seguida de exercícios práticos',
              recursos: 'Quadro, giz, material concreto',
              avaliacao: 'Exercícios em classe'
            })
          },
          {
            title: 'Atividade - Operações Básicas',
            type: 'atividade' as const,
            subject: 'Matemática',
            grade: '6º ano',
            userId: user.id,
            content: JSON.stringify({
              instrucoes: 'Resolva as operações básicas abaixo',
              exercicios: ['2 + 3 = ?', '5 - 2 = ?', '4 × 3 = ?', '8 ÷ 2 = ?']
            })
          },
          {
            title: 'Slides - Geometria Básica',
            type: 'slides' as const,
            subject: 'Matemática',
            grade: '7º ano',
            userId: user.id,
            content: JSON.stringify({
              slides: [
                { titulo: 'Introdução à Geometria', conteudo: 'Conceitos básicos' },
                { titulo: 'Formas Geométricas', conteudo: 'Círculo, quadrado, triângulo' },
                { titulo: 'Exercícios', conteudo: 'Identificar formas' }
              ]
            })
          }
        ];

        for (const material of sampleMaterials) {
          const result = await this.addMaterial(material);
          if (result) {
            console.log('Sample material created:', result.title);
          }
        }
        
        console.log('Sample materials initialization completed');
      } else {
        console.log('User already has materials, skipping sample creation');
      }
    } catch (error) {
      console.error('Error initializing sample materials:', error);
    }
  }
}

export const userMaterialsService = new UserMaterialsService();

// Helper function to get material principal info
export const getMaterialPrincipalInfo = async (materialId: string): Promise<{ tipo: string, titulo: string } | null> => {
  return userMaterialsService.getMaterialPrincipalInfo(materialId);
};
