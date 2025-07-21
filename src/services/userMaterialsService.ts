
import { unifiedMaterialsService, UnifiedMaterial } from './unifiedMaterialsService';

// Manter compatibilidade com a interface existente
export interface UserMaterial {
  id: string;
  title: string;
  type: 'plano-aula' | 'atividade' | 'slides' | 'avaliacao' | 'apoio';
  subject: string;
  grade: string;
  createdAt: string;
  status: 'completed' | 'draft';
  userId: string;
  content?: string;
}

// Mapeamento de tipos para compatibilidade
const mapUnifiedToUser = (unified: UnifiedMaterial): UserMaterial => ({
  id: unified.id,
  title: unified.title,
  type: unified.type === 'plano-de-aula' ? 'plano-aula' : unified.type,
  subject: unified.subject,
  grade: unified.grade,
  createdAt: unified.createdAt,
  status: unified.status === 'ativo' ? 'completed' : 'draft',
  userId: unified.userId,
  content: unified.content
});

const mapUserToUnified = (userMaterial: Omit<UserMaterial, 'id' | 'createdAt' | 'status'>): Omit<UnifiedMaterial, 'id' | 'createdAt' | 'status'> => ({
  title: userMaterial.title,
  type: userMaterial.type === 'plano-aula' ? 'plano-de-aula' : userMaterial.type,
  subject: userMaterial.subject,
  grade: userMaterial.grade,
  userId: userMaterial.userId,
  content: userMaterial.content
});

class UserMaterialsService {
  // Wrapper methods to maintain compatibility
  async getMaterialsByUser(): Promise<UserMaterial[]> {
    const unifiedMaterials = await unifiedMaterialsService.getMaterialsByUser();
    return unifiedMaterials.map(mapUnifiedToUser);
  }

  async getMaterialsByUserId(userId: string): Promise<UserMaterial[]> {
    const unifiedMaterials = await unifiedMaterialsService.getMaterialsByUserId(userId);
    return unifiedMaterials.map(mapUnifiedToUser);
  }

  async getAllMaterials(): Promise<UserMaterial[]> {
    return this.getMaterialsByUser();
  }

  async addMaterial(material: Omit<UserMaterial, 'id' | 'createdAt' | 'status'>): Promise<UserMaterial | null> {
    const unifiedMaterial = mapUserToUnified(material);
    const result = await unifiedMaterialsService.addMaterial(unifiedMaterial);
    return result ? mapUnifiedToUser(result) : null;
  }

  async updateMaterial(id: string, updates: Partial<UserMaterial>): Promise<boolean> {
    const unifiedUpdates: Partial<UnifiedMaterial> = {};
    
    if (updates.title !== undefined) unifiedUpdates.title = updates.title;
    if (updates.subject !== undefined) unifiedUpdates.subject = updates.subject;
    if (updates.grade !== undefined) unifiedUpdates.grade = updates.grade;
    if (updates.type !== undefined) {
      unifiedUpdates.type = updates.type === 'plano-aula' ? 'plano-de-aula' : updates.type;
    }
    if (updates.content !== undefined) unifiedUpdates.content = updates.content;

    return unifiedMaterialsService.updateMaterial(id, unifiedUpdates);
  }

  async deleteMaterial(id: string): Promise<boolean> {
    return unifiedMaterialsService.deleteMaterial(id);
  }

  async getMaterialPrincipalInfo(materialId: string): Promise<{ tipo: string, titulo: string } | null> {
    const material = await unifiedMaterialsService.getMaterialById(materialId);
    if (!material) return null;
    
    return {
      tipo: material.type,
      titulo: material.title
    };
  }

  async initializeSampleMaterials(): Promise<void> {
    // Implementação mantida para compatibilidade, mas pode ser removida se não for mais necessária
    console.log('Sample materials initialization - using unified service');
  }
}

export const userMaterialsService = new UserMaterialsService();

// Helper function mantida para compatibilidade
export const getMaterialPrincipalInfo = async (materialId: string): Promise<{ tipo: string, titulo: string } | null> => {
  return userMaterialsService.getMaterialPrincipalInfo(materialId);
};
