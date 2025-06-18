
import React, { useState } from 'react';
import { BookOpen, Wand2, Save, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CreateLesson: React.FC = () => {
  const [lessonData, setLessonData] = useState({
    subject: '',
    grade: '',
    topic: '',
    objectives: '',
    duration: '',
    template: 'standard'
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      setIsGenerating(false);
    }, 3000);
  };

  return (
    <main className="p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Criar Novo Plano de Aula</h1>
          <p className="text-gray-600">Use nossa IA para criar planos de aula alinhados à BNCC</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5" />
                  <span>Informações da Aula</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="subject">Disciplina</Label>
                    <Select value={lessonData.subject} onValueChange={(value) => setLessonData({...lessonData, subject: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma disciplina" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="matematica">Matemática</SelectItem>
                        <SelectItem value="portugues">Português</SelectItem>
                        <SelectItem value="ciencias">Ciências</SelectItem>
                        <SelectItem value="historia">História</SelectItem>
                        <SelectItem value="geografia">Geografia</SelectItem>
                        <SelectItem value="arte">Arte</SelectItem>
                        <SelectItem value="educacao-fisica">Educação Física</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="grade">Série/Ano</Label>
                    <Select value={lessonData.grade} onValueChange={(value) => setLessonData({...lessonData, grade: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a série/ano" />
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
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="topic">Tema da Aula</Label>
                  <Input 
                    id="topic"
                    placeholder="Ex: Introdução à Álgebra, Fotossíntese, Guerra do Paraguai..."
                    value={lessonData.topic}
                    onChange={(e) => setLessonData({...lessonData, topic: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="duration">Duração da Aula</Label>
                  <Select value={lessonData.duration} onValueChange={(value) => setLessonData({...lessonData, duration: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a duração" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="45min">45 minutos</SelectItem>
                      <SelectItem value="50min">50 minutos</SelectItem>
                      <SelectItem value="90min">1h 30min (Aula dupla)</SelectItem>
                      <SelectItem value="120min">2 horas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="objectives">Objetivos de Aprendizagem</Label>
                  <Textarea 
                    id="objectives"
                    placeholder="Descreva os objetivos que os alunos devem alcançar com esta aula..."
                    rows={4}
                    value={lessonData.objectives}
                    onChange={(e) => setLessonData({...lessonData, objectives: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Template do Plano</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                    <div 
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                        lessonData.template === 'standard' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setLessonData({...lessonData, template: 'standard'})}
                    >
                      <div className="bg-gray-100 h-20 mb-2 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="font-medium">Padrão</p>
                      <p className="text-sm text-gray-500">Modelo simples e objetivo</p>
                    </div>
                    
                    <div 
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                        lessonData.template === 'detailed' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setLessonData({...lessonData, template: 'detailed'})}
                    >
                      <div className="bg-gray-100 h-20 mb-2 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="font-medium">Detalhado</p>
                      <p className="text-sm text-gray-500">Com metodologias ativas</p>
                    </div>
                    
                    <div 
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                        lessonData.template === 'creative' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setLessonData({...lessonData, template: 'creative'})}
                    >
                      <div className="bg-gray-100 h-20 mb-2 rounded-lg flex items-center justify-center">
                        <Wand2 className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="font-medium">Criativo</p>
                      <p className="text-sm text-gray-500">Dinâmico e interativo</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button variant="outline">
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Rascunho
                  </Button>
                  <Button 
                    className="btn-magic"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                  >
                    <Wand2 className="w-4 h-4 mr-2" />
                    {isGenerating ? 'Gerando...' : 'Gerar com IA'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview/Tips */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dicas da IA</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 rounded-full bg-primary-500 mt-2"></div>
                    <p>Seja específico no tema para obter um plano mais detalhado</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 rounded-full bg-secondary-500 mt-2"></div>
                    <p>Os objetivos serão automaticamente alinhados à BNCC</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                    <p>Você pode editar o plano após a geração</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recursos Inclusos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded bg-green-100 flex items-center justify-center">
                      <div className="w-2 h-2 rounded bg-green-500"></div>
                    </div>
                    <span>Objetivos BNCC</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded bg-blue-100 flex items-center justify-center">
                      <div className="w-2 h-2 rounded bg-blue-500"></div>
                    </div>
                    <span>Metodologias Ativas</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded bg-purple-100 flex items-center justify-center">
                      <div className="w-2 h-2 rounded bg-purple-500"></div>
                    </div>
                    <span>Atividades Práticas</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded bg-yellow-100 flex items-center justify-center">
                      <div className="w-2 h-2 rounded bg-yellow-500"></div>
                    </div>
                    <span>Recursos Digitais</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {isGenerating && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sm text-gray-600">Gerando seu plano de aula...</p>
                    <p className="text-xs text-gray-500 mt-1">Isso pode levar alguns segundos</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default CreateLesson;
