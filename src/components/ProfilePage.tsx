
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Camera, Shield, Crown, Save, Edit2 } from 'lucide-react';
import { usePlanPermissions } from '@/hooks/usePlanPermissions';

const ProfilePage = () => {
  const { currentPlan } = usePlanPermissions();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: 'Professor(a)',
    photo: '',
    teachingLevel: '',
    grades: [],
    subjects: [],
    school: '',
    materialTypes: []
  });

  const teachingLevels = [
    'Educação Infantil',
    'Ensino Fundamental I',
    'Ensino Fundamental II',
    'Ensino Médio',
    'Ensino Superior'
  ];

  const gradesByLevel = {
    'Educação Infantil': ['Maternal', 'Jardim I', 'Jardim II', 'Pré-Escola'],
    'Ensino Fundamental I': ['1º Ano', '2º Ano', '3º Ano', '4º Ano', '5º Ano'],
    'Ensino Fundamental II': ['6º Ano', '7º Ano', '8º Ano', '9º Ano'],
    'Ensino Médio': ['1ª Série', '2ª Série', '3ª Série'],
    'Ensino Superior': ['Graduação', 'Pós-Graduação']
  };

  const subjects = [
    'Matemática', 'Português', 'Ciências', 'História', 'Geografia', 'Física',
    'Química', 'Biologia', 'Educação Física', 'Inglês', 'Espanhol', 'Filosofia',
    'Sociologia', 'Informática', 'Física Quântica', 'Teatro', 'Literatura',
    'Música', 'Dança', 'Artes'
  ];

  const materialTypes = [
    'Planos de Aula',
    'Atividades',
    'Avaliações',
    'Slides',
    'Exercícios',
    'Projetos'
  ];

  const getPlanDisplayName = () => {
    switch (currentPlan.id) {
      case 'gratuito':
        return 'Plano Gratuito';
      case 'professor':
        return 'Plano Professor';
      case 'grupo-escolar':
        return 'Grupo Escolar';
      default:
        return 'Plano Gratuito';
    }
  };

  const getPlanColor = () => {
    switch (currentPlan.id) {
      case 'professor':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'grupo-escolar':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleArrayItem = (field: string, item: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(item) 
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item]
    }));
  };

  const handleSave = () => {
    // Aqui você salvaria os dados
    setIsEditing(false);
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Meu Perfil</h1>
          <p className="text-gray-600">Gerencie suas informações pessoais e preferências</p>
        </div>
        <Button 
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className="w-full md:w-auto"
        >
          {isEditing ? (
            <>
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </>
          ) : (
            <>
              <Edit2 className="w-4 h-4 mr-2" />
              Editar Perfil
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações Básicas */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Foto e Nome */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="relative">
                  <Avatar className="w-20 h-20 md:w-24 md:h-24">
                    <AvatarImage src={formData.photo} />
                    <AvatarFallback className="text-lg">
                      {formData.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div className="flex-1 space-y-2 w-full">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Como deseja ser chamado(a)?"
                  />
                </div>
              </div>

              {/* Escola */}
              <div>
                <Label htmlFor="school">Escola (opcional)</Label>
                <Input
                  id="school"
                  value={formData.school}
                  onChange={(e) => handleInputChange('school', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Nome da sua escola"
                />
              </div>
            </CardContent>
          </Card>

          {/* Informações Educacionais */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Educacionais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Etapa de Ensino */}
              <div>
                <Label>Etapa de Ensino (opcional)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  {teachingLevels.map((level) => (
                    <div key={level} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id={level}
                        name="teachingLevel"
                        checked={formData.teachingLevel === level}
                        onChange={() => handleInputChange('teachingLevel', level)}
                        disabled={!isEditing}
                        className="w-4 h-4 text-primary-600"
                      />
                      <label htmlFor={level} className="text-sm">{level}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Anos/Séries */}
              {formData.teachingLevel && (
                <div>
                  <Label>Anos/Séries que atende</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-2">
                    {gradesByLevel[formData.teachingLevel]?.map((grade) => (
                      <Button
                        key={grade}
                        variant={formData.grades.includes(grade) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleArrayItem('grades', grade)}
                        disabled={!isEditing}
                        className="justify-start h-auto py-2"
                      >
                        {grade}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Disciplinas */}
              <div>
                <Label>Disciplinas que leciona (opcional)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-2">
                  {subjects.map((subject) => (
                    <Button
                      key={subject}
                      variant={formData.subjects.includes(subject) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleArrayItem('subjects', subject)}
                      disabled={!isEditing}
                      className="justify-start h-auto py-2 text-xs"
                    >
                      {subject}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Tipos de Material */}
              <div>
                <Label>Tipos de material que deseja criar</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {materialTypes.map((type) => (
                    <Button
                      key={type}
                      variant={formData.materialTypes.includes(type) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleArrayItem('materialTypes', type)}
                      disabled={!isEditing}
                      className="justify-start h-auto py-2"
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar com Segurança e Plano */}
        <div className="space-y-6">
          {/* Plano Atual */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5" />
                Plano Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={`${getPlanColor()} border w-full justify-center py-2`}>
                {getPlanDisplayName()}
              </Badge>
              <p className="text-sm text-gray-600 mt-2 text-center">
                {currentPlan.id === 'gratuito' 
                  ? 'Recursos básicos disponíveis'
                  : currentPlan.id === 'professor'
                  ? 'Acesso completo aos recursos'
                  : 'Gerenciamento escolar completo'
                }
              </p>
              <Button variant="outline" className="w-full mt-3">
                Gerenciar Assinatura
              </Button>
            </CardContent>
          </Card>

          {/* Segurança */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                Alterar Senha
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Autenticação em Duas Etapas
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Sessões Ativas
              </Button>
            </CardContent>
          </Card>

          {/* Estatísticas Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Disciplinas selecionadas:</span>
                <span className="font-semibold">{formData.subjects.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Séries atendidas:</span>
                <span className="font-semibold">{formData.grades.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tipos de material:</span>
                <span className="font-semibold">{formData.materialTypes.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
