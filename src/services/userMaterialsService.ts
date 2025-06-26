
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

class UserMaterialsService {
  private readonly STORAGE_KEY = 'user_materials';

  getMaterialsByUser(userId: string): UserMaterial[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return [];
    
    try {
      const allMaterials = JSON.parse(stored) as UserMaterial[];
      return allMaterials.filter(material => material.userId === userId);
    } catch {
      return [];
    }
  }

  addMaterial(material: Omit<UserMaterial, 'id' | 'createdAt' | 'status'>): UserMaterial {
    const newMaterial: UserMaterial = {
      ...material,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      status: 'completed'
    };

    const stored = localStorage.getItem(this.STORAGE_KEY);
    const materials = stored ? JSON.parse(stored) : [];
    materials.push(newMaterial);
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(materials));
    return newMaterial;
  }

  getAllMaterials(): UserMaterial[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return [];
    
    try {
      return JSON.parse(stored) as UserMaterial[];
    } catch {
      return [];
    }
  }

  // Função para inicializar alguns materiais de exemplo se não existirem
  initializeSampleMaterials(userId: string): void {
    const existingMaterials = this.getMaterialsByUser(userId);
    
    if (existingMaterials.length === 0) {
      const sampleMaterials = [
        {
          title: 'Plano de Aula - Frações',
          type: 'plano-aula' as const,
          subject: 'Matemática',
          grade: '6º ano',
          userId: userId,
          content: 'Conteúdo do plano de aula sobre frações...'
        },
        {
          title: 'Atividade - Operações Básicas',
          type: 'atividade' as const,
          subject: 'Matemática',
          grade: '6º ano',
          userId: userId,
          content: 'Lista de exercícios sobre operações básicas...'
        },
        {
          title: 'Slides - Geometria Básica',
          type: 'slides' as const,
          subject: 'Matemática',
          grade: '7º ano',
          userId: userId,
          content: 'Apresentação sobre geometria básica...'
        }
      ];

      sampleMaterials.forEach(material => this.addMaterial(material));
    }
  }
}

export const userMaterialsService = new UserMaterialsService();
