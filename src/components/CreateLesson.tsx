import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, BookOpen, FileText, ClipboardList, GraduationCap, Users } from "lucide-react";
import { materialService } from '@/services/materialService';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { usePlanPermissions } from '@/hooks/usePlanPermissions';
import { BNCCValidationService } from '@/services/bnccValidationService';

interface FormData {
  tema?: string;
  topic?: string;
  disciplina?: string;
  subject?: string;
  serie?: string;
  grade?: string;
  professor?: string;
  escola?: string;
  duracao?: string;
  numeroQuestoes?: number;
  quantidadeQuestoes?: number;
  tipoQuestoes?: string;
  tiposQuestoes?: string[];
  turma?: string;
}

interface ValidationResult {
  isValid: boolean;
  confidence: number;
  suggestions: string[];
  feedback: string;
}

interface GeneratedMaterial {
  id: string;
  title: string;
  type: string;
  subject: string;
  grade: string;
  createdAt: string;
  content: any;
}

const CreateLesson = () => {
  const navigate = useNavigate();
  const { permissions, loading: permissionsLoading } = usePlanPermissions();
  
  const [activeTab, setActiveTab] = useState('plano-de-aula');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [formData, setFormData] = useState<FormData>({
    tema: '',
    disciplina: '',
    serie: '',
    professor: '',
    escola: '',
    duracao: '50 minutos',
    numeroQuestoes: 5,
    tipoQuestoes: 'múltipla escolha',
    turma: ''
  });

  const validateTopic = useCallback(async () => {
    if (!formData.tema || !formData.disciplina || !formData.serie) {
      toast.error('Preencha o tema, disciplina e série antes de validar');
      return;
    }

    setIsValidating(true);
    try {
      const result = await BNCCValidationService.validateTopic(
        formData.tema,
        formData.disciplina,
        formData.serie
      );
      
      if (typeof result === 'object' && result !== null && 'isValid' in result) {
        setValidationResult(result as ValidationResult);
        
        if ((result as ValidationResult).isValid) {
          toast.success('Tema alinhado com a BNCC!');
        } else {
          toast.warning('Tema pode precisar de ajustes para melhor alinhamento com a BNCC');
        }
      } else {
        throw new Error('Resultado de validação inválido');
      }
    } catch (error) {
      console.error('Erro na validação:', error);
      toast.error('Erro ao validar tema na BNCC');
    } finally {
      setIsValidating(false);
    }
  }, [formData.tema, formData.disciplina, formData.serie]);

  const handleGenerate = async () => {
    if (!formData.tema || !formData.disciplina || !formData.serie) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await materialService.generateMaterial(activeTab, formData);
      
      if (typeof result === 'object' && result !== null && 'id' in result) {
        const material = result as GeneratedMaterial;
        
        toast.success(`${material.title || 'Material'} criado com sucesso!`);
        navigate(`/material/${material.id}`);
      } else {
        throw new Error('Resultado de geração inválido');
      }
    } catch (error) {
      console.error('Erro na geração:', error);
      toast.error('Erro ao gerar material');
    } finally {
      setIsGenerating(false);
    }
  };

  const updateFormData = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (permissionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Criar Material Educacional</h1>
        <p className="text-gray-600">Crie planos de aula, slides, atividades e avaliações personalizadas</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="plano-de-aula" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Plano de Aula
          </TabsTrigger>
          <TabsTrigger value="slides" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Slides
          </TabsTrigger>
          <TabsTrigger value="atividade" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Atividade
          </TabsTrigger>
          <TabsTrigger value="avaliacao" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Avaliação
          </TabsTrigger>
          <TabsTrigger value="apoio" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Material de Apoio
          </TabsTrigger>
        </TabsList>

        {/* Formulário Base */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
            <CardDescription>
              Preencha as informações básicas para gerar seu material
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tema">Tema da Aula *</Label>
                <Input
                  id="tema"
                  placeholder="Ex: Multiplicação, Sistema Solar, etc."
                  value={formData.tema || ''}
                  onChange={(e) => updateFormData('tema', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="disciplina">Disciplina *</Label>
                <Select value={formData.disciplina || ''} onValueChange={(value) => updateFormData('disciplina', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a disciplina" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Matemática">Matemática</SelectItem>
                    <SelectItem value="Português">Português</SelectItem>
                    <SelectItem value="Ciências">Ciências</SelectItem>
                    <SelectItem value="História">História</SelectItem>
                    <SelectItem value="Geografia">Geografia</SelectItem>
                    <SelectItem value="Arte">Arte</SelectItem>
                    <SelectItem value="Educação Física">Educação Física</SelectItem>
                    <SelectItem value="Inglês">Inglês</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="serie">Série/Ano *</Label>
                <Select value={formData.serie || ''} onValueChange={(value) => updateFormData('serie', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a série" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1º ano">1º ano</SelectItem>
                    <SelectItem value="2º ano">2º ano</SelectItem>
                    <SelectItem value="3º ano">3º ano</SelectItem>
                    <SelectItem value="4º ano">4º ano</SelectItem>
                    <SelectItem value="5º ano">5º ano</SelectItem>
                    <SelectItem value="6º ano">6º ano</SelectItem>
                    <SelectItem value="7º ano">7º ano</SelectItem>
                    <SelectItem value="8º ano">8º ano</SelectItem>
                    <SelectItem value="9º ano">9º ano</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="turma">Turma</Label>
                <Input
                  id="turma"
                  placeholder="Ex: A, B, 1A, etc."
                  value={formData.turma || ''}
                  onChange={(e) => updateFormData('turma', e.target.value)}
                />
              </div>
            </div>

            {/* Validação BNCC */}
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={validateTopic}
                disabled={isValidating || !formData.tema || !formData.disciplina || !formData.serie}
              >
                {isValidating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Validando...
                  </>
                ) : (
                  'Validar com BNCC'
                )}
              </Button>
              
              {validationResult && (
                <Badge variant={validationResult.isValid ? "default" : "secondary"}>
                  {validationResult.isValid ? 'Alinhado com BNCC' : 'Pode precisar de ajustes'}
                </Badge>
              )}
            </div>

            {validationResult && !validationResult.isValid && validationResult.suggestions.length > 0 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">Sugestões de melhoria:</h4>
                <ul className="list-disc list-inside text-yellow-700 space-y-1">
                  {validationResult.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Configurações específicas por tipo */}
        <TabsContent value="plano-de-aula">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Plano de Aula</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="professor">Professor</Label>
                  <Input
                    id="professor"
                    placeholder="Nome do professor"
                    value={formData.professor || ''}
                    onChange={(e) => updateFormData('professor', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="duracao">Duração da Aula</Label>
                  <Select value={formData.duracao || '50 minutos'} onValueChange={(value) => updateFormData('duracao', value)}>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="atividade">
          <Card>
            <CardHeader>
              <CardTitle>Configurações da Atividade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="numeroQuestoes">Número de Questões</Label>
                  <Select 
                    value={formData.numeroQuestoes?.toString() || '5'} 
                    onValueChange={(value) => updateFormData('numeroQuestoes', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 questões</SelectItem>
                      <SelectItem value="5">5 questões</SelectItem>
                      <SelectItem value="8">8 questões</SelectItem>
                      <SelectItem value="10">10 questões</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tipoQuestoes">Tipos de Questões</Label>
                  <Select value={formData.tipoQuestoes || 'múltipla escolha'} onValueChange={(value) => updateFormData('tipoQuestoes', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="múltipla escolha">Múltipla Escolha</SelectItem>
                      <SelectItem value="dissertativa">Dissertativa</SelectItem>
                      <SelectItem value="múltipla escolha, dissertativa">Mistas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="avaliacao">
          <Card>
            <CardHeader>
              <CardTitle>Configurações da Avaliação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="numeroQuestoes">Número de Questões</Label>
                  <Select 
                    value={formData.numeroQuestoes?.toString() || '10'} 
                    onValueChange={(value) => updateFormData('numeroQuestoes', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 questões</SelectItem>
                      <SelectItem value="8">8 questões</SelectItem>
                      <SelectItem value="10">10 questões</SelectItem>
                      <SelectItem value="15">15 questões</SelectItem>
                      <SelectItem value="20">20 questões</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tipoQuestoes">Tipos de Questões</Label>
                  <Select value={formData.tipoQuestoes || 'múltipla escolha'} onValueChange={(value) => updateFormData('tipoQuestoes', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="múltipla escolha">Múltipla Escolha</SelectItem>
                      <SelectItem value="dissertativa">Dissertativa</SelectItem>
                      <SelectItem value="múltipla escolha, dissertativa">Mistas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="slides">
          <Card>
            <CardHeader>
              <CardTitle>Configurações dos Slides</CardTitle>
              <CardDescription>
                Os slides serão gerados automaticamente com base no tema e disciplina
              </CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>

        <TabsContent value="apoio">
          <Card>
            <CardHeader>
              <CardTitle>Material de Apoio</CardTitle>
              <CardDescription>
                Material complementar será gerado com explicações e exemplos detalhados
              </CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>

        {/* Botão de Gerar */}
        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !formData.tema || !formData.disciplina || !formData.serie}
            className="min-w-32"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando...
              </>
            ) : (
              'Gerar Material'
            )}
          </Button>
        </div>
      </Tabs>
    </div>
  );
};

export default CreateLesson;
