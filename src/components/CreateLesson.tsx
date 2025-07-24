
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, Presentation, ClipboardList, FileCheck, BookOpen, X } from 'lucide-react';
import { useCreateMaterial } from '@/hooks/useCreateMaterial';
import { ScrollArea } from '@/components/ui/scroll-area';

const CreateLesson = () => {
  const { state, openModal, closeModal, updateFormData, nextStep, prevStep, createMaterial, getRemainingCreations } = useCreateMaterial();

  const materialTypes = [
    { 
      id: 'plano-de-aula', 
      name: 'Plano de Aula', 
      icon: <FileText className="w-6 h-6" />,
      description: 'Plano detalhado para suas aulas com objetivos, metodologia e avaliação'
    },
    { 
      id: 'slides', 
      name: 'Slides', 
      icon: <Presentation className="w-6 h-6" />,
      description: 'Apresentação visual para apoiar suas aulas'
    },
    { 
      id: 'atividade', 
      name: 'Atividade', 
      icon: <ClipboardList className="w-6 h-6" />,
      description: 'Exercícios e atividades para os alunos'
    },
    { 
      id: 'avaliacao', 
      name: 'Avaliação', 
      icon: <FileCheck className="w-6 h-6" />,
      description: 'Provas e testes para avaliar o aprendizado'
    },
    { 
      id: 'apoio', 
      name: 'Material de Apoio', 
      icon: <BookOpen className="w-6 h-6" />,
      description: 'Materiais complementares para enriquecer suas aulas'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMaterial();
  };

  const renderFormStep = () => {
    if (state.currentStep === 1) {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tema">Tema *</Label>
              <Input
                id="tema"
                value={state.formData.tema || ''}
                onChange={(e) => updateFormData({ tema: e.target.value })}
                placeholder="Ex: Matemática básica"
                required
              />
            </div>
            <div>
              <Label htmlFor="disciplina">Disciplina *</Label>
              <Select value={state.formData.disciplina || ''} onValueChange={(value) => updateFormData({ disciplina: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a disciplina" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="matematica">Matemática</SelectItem>
                  <SelectItem value="portugues">Português</SelectItem>
                  <SelectItem value="ciencias">Ciências</SelectItem>
                  <SelectItem value="historia">História</SelectItem>
                  <SelectItem value="geografia">Geografia</SelectItem>
                  <SelectItem value="educacao-fisica">Educação Física</SelectItem>
                  <SelectItem value="artes">Artes</SelectItem>
                  <SelectItem value="ingles">Inglês</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="serie">Série/Ano *</Label>
              <Select value={state.formData.serie || ''} onValueChange={(value) => updateFormData({ serie: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a série" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-ano">1º Ano</SelectItem>
                  <SelectItem value="2-ano">2º Ano</SelectItem>
                  <SelectItem value="3-ano">3º Ano</SelectItem>
                  <SelectItem value="4-ano">4º Ano</SelectItem>
                  <SelectItem value="5-ano">5º Ano</SelectItem>
                  <SelectItem value="6-ano">6º Ano</SelectItem>
                  <SelectItem value="7-ano">7º Ano</SelectItem>
                  <SelectItem value="8-ano">8º Ano</SelectItem>
                  <SelectItem value="9-ano">9º Ano</SelectItem>
                  <SelectItem value="1-medio">1º Médio</SelectItem>
                  <SelectItem value="2-medio">2º Médio</SelectItem>
                  <SelectItem value="3-medio">3º Médio</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="professor">Professor</Label>
              <Input
                id="professor"
                value={state.formData.professor || ''}
                onChange={(e) => updateFormData({ professor: e.target.value })}
                placeholder="Nome do professor"
              />
            </div>
          </div>

          {state.materialType === 'plano-de-aula' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duracao">Duração da Aula</Label>
                <Select value={state.formData.duracao || ''} onValueChange={(value) => updateFormData({ duracao: value })}>
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
              <div>
                <Label htmlFor="data">Data da Aula</Label>
                <Input
                  id="data"
                  type="date"
                  value={state.formData.data || ''}
                  onChange={(e) => updateFormData({ data: e.target.value })}
                />
              </div>
            </div>
          )}

          {(state.materialType === 'atividade' || state.materialType === 'avaliacao') && (
            <div>
              <Label htmlFor="numeroQuestoes">Número de Questões</Label>
              <Select value={state.formData.numeroQuestoes?.toString() || ''} onValueChange={(value) => updateFormData({ numeroQuestoes: parseInt(value) })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o número de questões" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 questões</SelectItem>
                  <SelectItem value="10">10 questões</SelectItem>
                  <SelectItem value="15">15 questões</SelectItem>
                  <SelectItem value="20">20 questões</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Criar Material</h1>
        <p className="text-gray-600">
          Escolha o tipo de material que deseja criar e nossa IA irá gerar conteúdo personalizado para você.
        </p>
        <div className="mt-4">
          <Badge variant="outline" className="text-sm">
            {getRemainingCreations()} materiais restantes este mês
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {materialTypes.map((type) => (
          <Card key={type.id} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  {type.icon}
                </div>
                <CardTitle className="text-lg">{type.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4">{type.description}</p>
              <Button 
                onClick={() => openModal(type.id)}
                className="w-full"
                disabled={state.isLoading}
              >
                Criar {type.name}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={state.isModalOpen} onOpenChange={closeModal}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl">
                Criar {materialTypes.find(t => t.id === state.materialType)?.name}
              </DialogTitle>
              <Button variant="ghost" size="sm" onClick={closeModal}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh]">
            <form onSubmit={handleSubmit} className="space-y-6">
              {state.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">{state.error}</p>
                </div>
              )}

              {renderFormStep()}

              <div className="flex justify-between pt-6 border-t">
                <div className="flex gap-2">
                  {state.currentStep > 1 && (
                    <Button type="button" variant="outline" onClick={prevStep}>
                      Voltar
                    </Button>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  disabled={state.isLoading || !state.formData.tema || !state.formData.disciplina || !state.formData.serie}
                >
                  {state.isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    'Gerar Material'
                  )}
                </Button>
              </div>
            </form>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateLesson;
