const { materialService } = require('./src/services/materialService');

jest.mock('./src/integrations/supabase/client', () => ({
  supabase: {
    auth: { getUser: jest.fn() },
    functions: { invoke: jest.fn() }
  }
}));

jest.mock('./src/services/unifiedMaterialsService', () => ({
  unifiedMaterialsService: {
    addMaterial: jest.fn().mockResolvedValue({
      id: 'fake-id',
      title: 'Frações',
      type: 'plano-de-aula',
      subject: 'Matemática',
      grade: '6º Ano',
      createdAt: new Date().toISOString(),
      status: 'ativo',
      userId: 'user-123',
      content: JSON.stringify({ titulo: 'Frações', disciplina: 'Matemática', serie: '6º Ano', tema: 'Frações' }),
      tema: 'Frações'
    })
  }
}));

describe('materialService.generateMaterial', () => {
  it('deve criar e salvar um plano de aula corretamente', async () => {
    const { supabase } = require('./src/integrations/supabase/client');
    supabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });
    supabase.functions.invoke.mockResolvedValue({
      data: { success: true, content: { titulo: 'Frações', disciplina: 'Matemática', serie: '6º Ano', tema: 'Frações' } }
    });

    const result = await materialService.generateMaterial('plano-de-aula', {
      tema: 'Frações',
      disciplina: 'Matemática',
      serie: '6º Ano'
    });

    expect(result.title).toBe('Frações');
    expect(result.type).toBe('plano-de-aula');
    expect(result.subject).toBe('Matemática');
    expect(result.grade).toBe('6º Ano');
    expect(result.content.tema).toBe('Frações');
  });
}); 