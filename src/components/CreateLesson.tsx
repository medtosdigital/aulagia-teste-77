import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { materialService } from '@/services/materialService';
import { BookOpen, Clock, User, Calendar, GraduationCap, School } from 'lucide-react';
import { useSupabasePlanPermissions } from '@/hooks/useSupabasePlanPermissions';

interface CreateLessonProps {
  isOpen: boolean;
  onClose: () => void;
  onMaterialCreated: (material: any) => void;
  materialType: string;
}

interface LessonFormData {
  topic: string;
  subject: string;
  grade: string;
  questionType: string;
  questionCount: number[];
  subjects: string[];
  // Campos para plano de aula
  professor?: string;
  duracao?: string;
  data?: string;
  bncc?: string;
  turma?: string;
  // Campo para outros tipos
  tipoQuestoes?: string[];
}

const CreateLesson: React.FC<CreateLessonProps> = ({
  isOpen,
  onClose,
  onMaterialCreated,
  materialType
}) => {
  const { permissions } = useSupabasePlanPermissions();
  
  const [formData, setFormData] = useState<LessonFormData>({
    topic: '',
    subject: '',
    grade: '',
    questionType: '',
    questionCount: [5],
    subjects: [],
    professor: '',
    duracao: '50 minutos',
    data: new Date().toLocaleDateString('pt-BR'),
    bncc: '',
    turma: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.topic.trim()) {
      toast.error('Por favor, preencha o tema do material');
      return;
    }

    if (!formData.subject.trim()) {
      toast.error('Por favor, selecione a disciplina');
      return;
    }

    if (!formData.grade.trim()) {
      toast.error('Por favor, selecione a série');
      return;
    }

    setIsLoading(true);

    try {
      const materialFormData = {
        tema: formData.topic.trim(), // Garantir que o tema seja usado exatamente como digitado
        topic: formData.topic.trim(),
        disciplina: formData.subject,
        subject: formData.subject,
        serie: formData.grade,
        grade: formData.grade,
        ...(materialType === 'plano-de-aula' && {
          professor: formData.professor || 'Professor(a)',
          duracao: formData.duracao || '50 minutos',
          data: formData.data || new Date().toLocaleDateString('pt-BR'),
          bncc: formData.bncc || '',
          turma: formData.turma || ''
        }),
        ...(materialType === 'atividade' || materialType === 'avaliacao') && {
          tipoQuestoes: formData.tipoQuestoes || ['múltipla escolha'],
          numeroQuestoes: formData.questionCount[0] || 5,
          quantidadeQuestoes: formData.questionCount[0] || 5
        })
      };

      console.log('📤 Enviando dados do formulário:', materialFormData);

      const generatedMaterial = await materialService.generateMaterial(materialType, materialFormData);
      
      console.log('✅ Material gerado com sucesso:', generatedMaterial);
      
      toast.success(`${getMaterialTypeName(materialType)} criado com sucesso!`);
      onMaterialCreated(generatedMaterial);
      onClose();
      
      // Reset form
      setFormData({
        topic: '',
        subject: '',
        grade: '',
        questionType: '',
        questionCount: [5],
        subjects: [],
        professor: '',
        duracao: '50 minutos',
        data: new Date().toLocaleDateString('pt-BR'),
        bncc: '',
        turma: ''
      });
      
    } catch (error) {
      console.error('❌ Erro ao criar material:', error);
      toast.error('Erro ao criar o material. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const getMaterialTypeName = (type: string): string => {
    const types: { [key: string]: string } = {
      'plano-de-aula': 'Plano de Aula',
      'slides': 'Apresentação em Slides',
      'atividade': 'Atividade',
      'avaliacao': 'Avaliação',
      'apoio': 'Material de Apoio'
    };
    return types[type] || 'Material';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Criar {getMaterialTypeName(materialType)}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo de tema - sempre obrigatório */}
            <div className="space-y-2">
              <Label htmlFor="topic" className="flex items-center gap-2">
                <BookOpen size={16} />
                Tema do Material *
              </Label>
              <Input
                id="topic"
                type="text"
                placeholder="Ex: Multiplicação, Geometria, Sistema Solar..."
                value={formData.topic}
                onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                required
                className="w-full"
              />
            </div>

            {/* Disciplina */}
            <div className="space-y-2">
              <Label htmlFor="subject" className="flex items-center gap-2">
                <GraduationCap size={16} />
                Disciplina *
              </Label>
              <Select 
                value={formData.subject} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a disciplina" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Matemática">Matemática</SelectItem>
                  <SelectItem value="Português">Português</SelectItem>
                  <SelectItem value="História">História</SelectItem>
                  <SelectItem value="Geografia">Geografia</SelectItem>
                  <SelectItem value="Ciências">Ciências</SelectItem>
                  <SelectItem value="Inglês">Inglês</SelectItem>
                  <SelectItem value="Educação Física">Educação Física</SelectItem>
                  <SelectItem value="Artes">Artes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Série */}
            <div className="space-y-2">
              <Label htmlFor="grade" className="flex items-center gap-2">
                <School size={16} />
                Série *
              </Label>
              <Select 
                value={formData.grade} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, grade: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a série" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1º Ano - Ensino Fundamental">1º Ano - Ensino Fundamental</SelectItem>
                  <SelectItem value="2º Ano - Ensino Fundamental">2º Ano - Ensino Fundamental</SelectItem>
                  <SelectItem value="3º Ano - Ensino Fundamental">3º Ano - Ensino Fundamental</SelectItem>
                  <SelectItem value="4º Ano - Ensino Fundamental">4º Ano - Ensino Fundamental</SelectItem>
                  <SelectItem value="5º Ano - Ensino Fundamental">5º Ano - Ensino Fundamental</SelectItem>
                  <SelectItem value="6º Ano - Ensino Fundamental">6º Ano - Ensino Fundamental</SelectItem>
                  <SelectItem value="7º Ano - Ensino Fundamental">7º Ano - Ensino Fundamental</SelectItem>
                  <SelectItem value="8º Ano - Ensino Fundamental">8º Ano - Ensino Fundamental</SelectItem>
                  <SelectItem value="9º Ano - Ensino Fundamental">9º Ano - Ensino Fundamental</SelectItem>
                  <SelectItem value="1º Ano - Ensino Médio">1º Ano - Ensino Médio</SelectItem>
                  <SelectItem value="2º Ano - Ensino Médio">2º Ano - Ensino Médio</SelectItem>
                  <SelectItem value="3º Ano - Ensino Médio">3º Ano - Ensino Médio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Campos específicos para plano de aula */}
            {materialType === 'plano-de-aula' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="professor" className="flex items-center gap-2">
                      <User size={16} />
                      Professor
                    </Label>
                    <Input
                      id="professor"
                      type="text"
                      placeholder="Nome do professor"
                      value={formData.professor || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, professor: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="duracao" className="flex items-center gap-2">
                      <Clock size={16} />
                      Duração
                    </Label>
                    <Select 
                      value={formData.duracao || '50 minutos'} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, duracao: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="50 minutos">50 minutos (1 aula)</SelectItem>
                        <SelectItem value="100 minutos">100 minutos (2 aulas)</SelectItem>
                        <SelectItem value="150 minutos">150 minutos (3 aulas)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="data" className="flex items-center gap-2">
                      <Calendar size={16} />
                      Data
                    </Label>
                    <Input
                      id="data"
                      type="date"
                      value={formData.data ? new Date(formData.data.split('/').reverse().join('-')).toISOString().split('T')[0] : ''}
                      onChange={(e) => {
                        const date = new Date(e.target.value);
                        setFormData(prev => ({ ...prev, data: date.toLocaleDateString('pt-BR') }));
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="turma" className="flex items-center gap-2">
                      <School size={16} />
                      Turma
                    </Label>
                    <Input
                      id="turma"
                      type="text"
                      placeholder="Ex: 5º A, 3º B..."
                      value={formData.turma || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, turma: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bncc">Código BNCC (Opcional)</Label>
                  <Input
                    id="bncc"
                    type="text"
                    placeholder="Ex: EF03MA01"
                    value={formData.bncc || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, bncc: e.target.value }))}
                  />
                </div>
              </>
            )}

            {/* Campos para atividades e avaliações */}
            {(materialType === 'atividade' || materialType === 'avaliacao') && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Número de Questões</Label>
                  <Select 
                    value={formData.questionCount[0]?.toString() || '5'} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, questionCount: [parseInt(value)] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[5, 10, 15, 20, 25, 30].map(num => (
                        <SelectItem key={num} value={num.toString()}>{num} questões</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || !formData.topic.trim() || !formData.subject || !formData.grade}
              >
                {isLoading ? 'Criando...' : `Criar ${getMaterialTypeName(materialType)}`}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateLesson;
