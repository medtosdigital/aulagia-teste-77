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

  async getMaterialsByUser(userId?: string): Promise<UserMaterial[]> {
    try {
      // Always get current authenticated user - ignore passed userId for security
      const user = await this.getCurrentUser();
      if (!user) {
        console.log('No authenticated user found');
        return [];
      }

      console.log('Loading materials for authenticated user:', user.id);
      const allMaterials: UserMaterial[] = [];

      // Buscar planos de aula - RLS automaticamente filtra por user_id
      const { data: planosData, error: planosError } = await supabase
        .from('planos_de_aula')
        .select('*')
        .order('created_at', { ascending: false });

      if (!planosError && planosData) {
        const mappedPlanos = planosData.map(item => this.mapFromSupabase(item, 'plano-aula'));
        allMaterials.push(...mappedPlanos);
        console.log('Loaded planos de aula:', mappedPlanos.length);
      } else if (planosError) {
        console.error('Error loading planos de aula:', planosError);
      }

      // Buscar atividades - RLS automaticamente filtra por user_id
      const { data: atividadesData, error: atividadesError } = await supabase
        .from('atividades')
        .select('*')
        .order('created_at', { ascending: false });

      if (!atividadesError && atividadesData) {
        const mappedAtividades = atividadesData.map(item => this.mapFromSupabase(item, 'atividade'));
        allMaterials.push(...mappedAtividades);
        console.log('Loaded atividades:', mappedAtividades.length);
      } else if (atividadesError) {
        console.error('Error loading atividades:', atividadesError);
      }

      // Buscar slides - RLS automaticamente filtra por user_id
      const { data: slidesData, error: slidesError } = await supabase
        .from('slides')
        .select('*')
        .order('created_at', { ascending: false });

      if (!slidesError && slidesData) {
        const mappedSlides = slidesData.map(item => this.mapFromSupabase(item, 'slides'));
        allMaterials.push(...mappedSlides);
        console.log('Loaded slides:', mappedSlides.length);
      } else if (slidesError) {
        console.error('Error loading slides:', slidesError);
      }

      // Buscar avaliações - RLS automaticamente filtra por user_id
      const { data: avaliacoesData, error: avaliacoesError } = await supabase
        .from('avaliacoes')
        .select('*')
        .order('created_at', { ascending: false });

      if (!avaliacoesError && avaliacoesData) {
        const mappedAvaliacoes = avaliacoesData.map(item => this.mapFromSupabase(item, 'avaliacao'));
        allMaterials.push(...mappedAvaliacoes);
        console.log('Loaded avaliacoes:', mappedAvaliacoes.length);
      } else if (avaliacoesError) {
        console.error('Error loading avaliacoes:', avaliacoesError);
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

      // Try to delete from each table - RLS will ensure only user's own materials can be deleted
      for (const [type, tableName] of Object.entries(TABLE_MAPPING)) {
        const { error } = await supabase
          .from(tableName)
          .delete()
          .eq('id', id);

        if (!error) {
          console.log(`Material deleted successfully from ${tableName}`);
          return true;
        }
      }
      
      console.error('Material not found in any table');
      return false;
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
      if (updates.content) updateData.conteudo = updates.content;
      if (updates.subject) updateData.disciplina = updates.subject;
      if (updates.grade) updateData.serie = updates.grade;

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
