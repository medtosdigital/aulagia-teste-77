import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { materialService } from '@/services/materialService';
import { useAuth } from '@/hooks/useAuth';
import { Book, FileText, Presentation, ClipboardList, GraduationCap, Clock, Calendar, User, School } from 'lucide-react';
import { usePlanPermissions } from '@/hooks/usePlanPermissions';

interface FormData {
  topic: string;
  subject: string;
  grade: string;
  questionType: string;
  questionCount: number[];
  subjects: string[];
  professor?: string;
  duracao?: string;
  data?: string;
  bncc?: string;
  turma?: string;
  tipoQuestoes?: string;
}

const CreateLesson: React.FC = () => {
  const { user } = useAuth();
  const { canCreateSlides, canCreateAssessments } = usePlanPermissions();
  
  const [selectedType, setSelectedType] = useState<string>('plano-de-aula');
  const [formData, setFormData] = useState<FormData>({
    topic: '',
    subject: '',
    grade: '',
    questionType: '',
    questionCount: [],
    subjects: []
  });
  const [loading, setLoading] = useState(false);

  const materialTypes = [
    { value: 'plano-de-aula', label: 'Plano de Aula', icon: <Book className="mr-2 h-4 w-4" /> },
    { value: 'slides', label: 'Slides', icon: <Presentation className="mr-2 h-4 w-4" />, disabled: !canCreateSlides },
    { value: 'atividade', label: 'Atividade', icon: <FileText className="mr-2 h-4 w-4" /> },
    { value: 'avaliacao', label: 'Avaliação', icon: <ClipboardList className="mr-2 h-4 w-4" />, disabled: !canCreateAssessments },
    { value: 'apoio', label: 'Material de Apoio', icon: <GraduationCap className="mr-2 h-4 w-4" /> },
  ];

  const subjects = [
    'Artes',
    'Biologia',
    'Ciências',
    'Educação Física',
    'Física',
    'Geografia',
    'História',
    'Inglês',
    'Matemática',
    'Português',
    'Química',
    'Sociologia',
    'Filosofia'
  ];

  const grades = [
    '1º ano',
    '2º ano',
    '3º ano',
    '4º ano',
    '5º ano',
    '6º ano',
    '7º ano',
    '8º ano',
    '9º ano',
    '1º ano do Ensino Médio',
    '2º ano do Ensino Médio',
    '3º ano do Ensino Médio'
  ];

  const getMaterialTypeName = (type: string): string => {
    const typeMap = {
      'plano-de-aula': 'Plano de Aula',
      'slides': 'Slides',
      'atividade': 'Atividade',
      'avaliacao': 'Avaliação',
      'apoio': 'Material de Apoio'
    };
    return typeMap[type as keyof typeof typeMap] || 'Material';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Você precisa estar logado para criar materiais');
      return;
    }

    if (!formData.topic.trim()) {
      toast.error('Por favor, informe o tema');
      return;
    }

    if (!formData.subject) {
      toast.error('Por favor, selecione a disciplina');
      return;
    }

    if (!formData.grade) {
      toast.error('Por favor, selecione a série');
      return;
    }

    setLoading(true);

    try {
      // Preparar dados do formulário com campos adicionais para plano de aula
      const materialFormData = {
        tema: formData.topic.trim(),
        disciplina: formData.subject,
        serie: formData.grade,
        professor: formData.professor || 'Professor(a)',
        duracao: formData.duracao || '50 minutos',
        data: formData.data || new Date().toLocaleDateString('pt-BR'),
        bncc: formData.bncc || '',
        turma: formData.turma || '',
        ...(selectedType === 'atividade' || selectedType === 'avaliacao' ? {
          tipoQuestoes: formData.tipoQuestoes || formData.questionType || 'múltipla escolha',
          numeroQuestoes: Array.isArray(formData.questionCount) ? formData.questionCount[0] || 5 : 5
        } : {})
      };

      console.log('🎯 [FRONTEND] Enviando dados para materialService:', {
        type: selectedType,
        materialFormData
      });

      const material = await materialService.generateMaterial(selectedType, materialFormData);
      
      console.log('✅ [FRONTEND] Material gerado com sucesso:', material);
      
      toast.success(`${getMaterialTypeName(selectedType)} criado com sucesso!`);
      
      // Reset form
      setFormData({
        topic: '',
        subject: '',
        grade: '',
        questionType: '',
        questionCount: [],
        subjects: []
      });
      
    } catch (error) {
      console.error('❌ [FRONTEND] Erro ao criar material:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao criar material');
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Campos básicos sempre visíveis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="topic">Tema *</Label>
          <Input
            id="topic"
            value={formData.topic}
            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            placeholder="Ex: Geometria, Fotossíntese, História do Brasil..."
            required
          />
        </div>
        <div>
          <Label htmlFor="subject">Disciplina *</Label>
          <Select value={formData.subject} onValueChange={(value) => setFormData({ ...formData, subject: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a disciplina" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject) => (
                <SelectItem key={subject} value={subject}>{subject}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="grade">Série *</Label>
          <Select value={formData.grade} onValueChange={(value) => setFormData({ ...formData, grade: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a série" />
            </SelectTrigger>
            <SelectContent>
              {grades.map((grade) => (
                <SelectItem key={grade} value={grade}>{grade}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {selectedType === 'plano-de-aula' && (
          <div>
            <Label htmlFor="duracao">Duração</Label>
            <Select value={formData.duracao || ''} onValueChange={(value) => setFormData({ ...formData, duracao: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a duração" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="50 minutos">50 minutos (1 aula)</SelectItem>
                <SelectItem value="100 minutos">100 minutos (2 aulas)</SelectItem>
                <SelectItem value="150 minutos">150 minutos (3 aulas)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Campos específicos para plano de aula */}
      {selectedType === 'plano-de-aula' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="professor">Professor(a)</Label>
            <Input
              id="professor"
              value={formData.professor || ''}
              onChange={(e) => setFormData({ ...formData, professor: e.target.value })}
              placeholder="Nome do professor(a)"
            />
          </div>
          <div>
            <Label htmlFor="data">Data da Aula</Label>
            <Input
              id="data"
              type="date"
              value={formData.data || ''}
              onChange={(e) => setFormData({ ...formData, data: e.target.value })}
            />
          </div>
        </div>
      )}

      {selectedType === 'plano-de-aula' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="turma">Turma</Label>
            <Input
              id="turma"
              value={formData.turma || ''}
              onChange={(e) => setFormData({ ...formData, turma: e.target.value })}
              placeholder="Ex: 3º A, 5º B..."
            />
          </div>
          <div>
            <Label htmlFor="bncc">Código BNCC (opcional)</Label>
            <Input
              id="bncc"
              value={formData.bncc || ''}
              onChange={(e) => setFormData({ ...formData, bncc: e.target.value })}
              placeholder="Ex: EF03MA12"
            />
          </div>
        </div>
      )}

      {/* Campos específicos para atividades e avaliações */}
      {(selectedType === 'atividade' || selectedType === 'avaliacao') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="questionType">Tipo de Questões</Label>
            <Select value={formData.tipoQuestoes || ''} onValueChange={(value) => setFormData({ ...formData, tipoQuestoes: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="múltipla escolha">Múltipla Escolha</SelectItem>
                <SelectItem value="dissertativa">Dissertativa</SelectItem>
                <SelectItem value="mista">Mista</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="questionCount">Número de Questões</Label>
            <Select value={Array.isArray(formData.questionCount) && formData.questionCount.length > 0 ? formData.questionCount[0].toString() : ''} onValueChange={(value) => setFormData({ ...formData, questionCount: [parseInt(value)] })}>
              <SelectTrigger>
                <SelectValue placeholder="Quantidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 questões</SelectItem>
                <SelectItem value="10">10 questões</SelectItem>
                <SelectItem value="15">15 questões</SelectItem>
                <SelectItem value="20">20 questões</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Criando...' : `Criar ${getMaterialTypeName(selectedType)}`}
      </Button>
    </form>
  );

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Criar Material Educacional</h2>
        <div className="flex space-x-4">
          {materialTypes.map((type) => (
            <Button
              key={type.value}
              variant={selectedType === type.value ? 'default' : 'outline'}
              onClick={() => setSelectedType(type.value)}
              disabled={type.disabled}
            >
              {type.icon}
              {type.label}
            </Button>
          ))}
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {selectedType === 'plano-de-aula' && <Book className="w-5 h-5" />}
            {selectedType === 'slides' && <Presentation className="w-5 h-5" />}
            {selectedType === 'atividade' && <FileText className="w-5 h-5" />}
            {selectedType === 'avaliacao' && <ClipboardList className="w-5 h-5" />}
            {selectedType === 'apoio' && <GraduationCap className="w-5 h-5" />}
            Criar {getMaterialTypeName(selectedType)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campos básicos sempre visíveis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="topic">Tema *</Label>
                <Input
                  id="topic"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  placeholder="Ex: Geometria, Fotossíntese, História do Brasil..."
                  required
                />
              </div>
              <div>
                <Label htmlFor="subject">Disciplina *</Label>
                <Select value={formData.subject} onValueChange={(value) => setFormData({ ...formData, subject: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a disciplina" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="grade">Série *</Label>
                <Select value={formData.grade} onValueChange={(value) => setFormData({ ...formData, grade: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a série" />
                  </SelectTrigger>
                  <SelectContent>
                    {grades.map((grade) => (
                      <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedType === 'plano-de-aula' && (
                <div>
                  <Label htmlFor="duracao">Duração</Label>
                  <Select value={formData.duracao || ''} onValueChange={(value) => setFormData({ ...formData, duracao: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a duração" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50 minutos">50 minutos (1 aula)</SelectItem>
                      <SelectItem value="100 minutos">100 minutos (2 aulas)</SelectItem>
                      <SelectItem value="150 minutos">150 minutos (3 aulas)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Campos específicos para plano de aula */}
            {selectedType === 'plano-de-aula' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="professor">Professor(a)</Label>
                  <Input
                    id="professor"
                    value={formData.professor || ''}
                    onChange={(e) => setFormData({ ...formData, professor: e.target.value })}
                    placeholder="Nome do professor(a)"
                  />
                </div>
                <div>
                  <Label htmlFor="data">Data da Aula</Label>
                  <Input
                    id="data"
                    type="date"
                    value={formData.data || ''}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  />
                </div>
              </div>
            )}

            {selectedType === 'plano-de-aula' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="turma">Turma</Label>
                  <Input
                    id="turma"
                    value={formData.turma || ''}
                    onChange={(e) => setFormData({ ...formData, turma: e.target.value })}
                    placeholder="Ex: 3º A, 5º B..."
                  />
                </div>
                <div>
                  <Label htmlFor="bncc">Código BNCC (opcional)</Label>
                  <Input
                    id="bncc"
                    value={formData.bncc || ''}
                    onChange={(e) => setFormData({ ...formData, bncc: e.target.value })}
                    placeholder="Ex: EF03MA12"
                  />
                </div>
              </div>
            )}

            {/* Campos específicos para atividades e avaliações */}
            {(selectedType === 'atividade' || selectedType === 'avaliacao') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="questionType">Tipo de Questões</Label>
                  <Select value={formData.tipoQuestoes || ''} onValueChange={(value) => setFormData({ ...formData, tipoQuestoes: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="múltipla escolha">Múltipla Escolha</SelectItem>
                      <SelectItem value="dissertativa">Dissertativa</SelectItem>
                      <SelectItem value="mista">Mista</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="questionCount">Número de Questões</Label>
                  <Select value={Array.isArray(formData.questionCount) && formData.questionCount.length > 0 ? formData.questionCount[0].toString() : ''} onValueChange={(value) => setFormData({ ...formData, questionCount: [parseInt(value)] })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Quantidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 questões</SelectItem>
                      <SelectItem value="10">10 questões</SelectItem>
                      <SelectItem value="15">15 questões</SelectItem>
                      <SelectItem value="20">20 questões</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Criando...' : `Criar ${getMaterialTypeName(selectedType)}`}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateLesson;
