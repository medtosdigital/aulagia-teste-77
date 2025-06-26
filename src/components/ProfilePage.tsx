
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { User, Camera, Shield, Crown, Save, Edit2, Upload, Check, X, Eye, EyeOff, Lock, Settings } from 'lucide-react';
import { usePlanPermissions } from '@/hooks/usePlanPermissions';

const ProfilePage = () => {
  const { currentPlan } = usePlanPermissions();
  const [isEditing, setIsEditing] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: 'Professor(a)',
    photo: '',
    teachingLevel: '',
    grades: [],
    subjects: [],
    school: '',
    materialTypes: []
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
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
    'Sociologia', 'Informática', 'Teatro', 'Literatura', 'Música', 'Dança', 'Artes'
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
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
      case 'grupo-escolar':
        return 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white';
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white';
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

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleInputChange('photo', e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    // Aqui você salvaria os dados no backend
    console.log('Salvando dados do perfil:', formData);
    setIsEditing(false);
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      alert('A nova senha deve ter pelo menos 6 caracteres!');
      return;
    }

    // Aqui você faria a alteração da senha no backend
    console.log('Alterando senha...');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setIsChangingPassword(false);
    alert('Senha alterada com sucesso!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Meu Perfil
          </h1>
          <p className="text-gray-600 text-lg">Gerencie suas informações pessoais e preferências</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card de Informações Básicas */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <User className="w-5 h-5" />
                    </div>
                    Informações Básicas
                  </div>
                  <Button 
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    variant="outline"
                    size="sm"
                    className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                  >
                    {isEditing ? (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Salvar
                      </>
                    ) : (
                      <>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Editar
                      </>
                    )}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Foto e Nome */}
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="relative">
                    <Avatar className="w-24 h-24 md:w-32 md:h-32 ring-4 ring-blue-100">
                      <AvatarImage src={formData.photo} />
                      <AvatarFallback className="text-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                        {formData.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                          id="photo-upload"
                        />
                        <label
                          htmlFor="photo-upload"
                          className="absolute -bottom-2 -right-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 cursor-pointer transition-colors shadow-lg"
                        >
                          <Camera className="w-4 h-4" />
                        </label>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-4 w-full">
                    <div>
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700">Nome completo</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        disabled={!isEditing}
                        placeholder="Como deseja ser chamado(a)?"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="school" className="text-sm font-medium text-gray-700">Escola (opcional)</Label>
                      <Input
                        id="school"
                        value={formData.school}
                        onChange={(e) => handleInputChange('school', e.target.value)}
                        disabled={!isEditing}
                        placeholder="Nome da sua escola"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card de Informações Educacionais */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Settings className="w-5 h-5" />
                  </div>
                  Preferências Educacionais
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Etapa de Ensino */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">Etapa de Ensino (opcional)</Label>
                  <RadioGroup
                    value={formData.teachingLevel}
                    onValueChange={(value) => handleInputChange('teachingLevel', value)}
                    disabled={!isEditing}
                    className="grid grid-cols-1 md:grid-cols-2 gap-3"
                  >
                    {teachingLevels.map((level) => (
                      <div key={level} className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-gray-50">
                        <RadioGroupItem value={level} id={level} />
                        <Label htmlFor={level} className="flex-1 cursor-pointer">{level}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Anos/Séries */}
                {formData.teachingLevel && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">Anos/Séries que atende</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {gradesByLevel[formData.teachingLevel]?.map((grade) => (
                        <Button
                          key={grade}
                          variant={formData.grades.includes(grade) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleArrayItem('grades', grade)}
                          disabled={!isEditing}
                          className="h-10 text-sm"
                        >
                          {grade}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Disciplinas */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">Disciplinas que leciona (opcional)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg">
                    {subjects.map((subject) => (
                      <Button
                        key={subject}
                        variant={formData.subjects.includes(subject) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleArrayItem('subjects', subject)}
                        disabled={!isEditing}
                        className="h-9 text-xs justify-start"
                      >
                        {subject}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Tipos de Material */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">Tipos de material que deseja criar</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {materialTypes.map((type) => (
                      <Button
                        key={type}
                        variant={formData.materialTypes.includes(type) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleArrayItem('materialTypes', type)}
                        disabled={!isEditing}
                        className="h-10 justify-start"
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Card do Plano */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
              <div className={`p-6 ${getPlanColor()}`}>
                <div className="flex items-center gap-3 mb-2">
                  <Crown className="w-6 h-6" />
                  <h3 className="font-semibold text-lg">Plano Atual</h3>
                </div>
                <p className="text-2xl font-bold">{getPlanDisplayName()}</p>
                <p className="text-sm opacity-90 mt-1">
                  {currentPlan.id === 'gratuito' 
                    ? 'Recursos básicos disponíveis'
                    : currentPlan.id === 'professor'
                    ? 'Acesso completo aos recursos'
                    : 'Gerenciamento escolar completo'
                  }
                </p>
              </div>
              <CardContent className="p-4">
                <Button variant="outline" className="w-full">
                  Gerenciar Assinatura
                </Button>
              </CardContent>
            </Card>

            {/* Card de Segurança */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Shield className="w-5 h-5" />
                  </div>
                  Segurança
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setIsChangingPassword(!isChangingPassword)}
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Alterar Senha
                </Button>
                
                {isChangingPassword && (
                  <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                    <div className="space-y-2">
                      <Label className="text-sm">Senha Atual</Label>
                      <div className="relative">
                        <Input
                          type={showCurrentPassword ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData(prev => ({...prev, currentPassword: e.target.value}))}
                          placeholder="Digite sua senha atual"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm">Nova Senha</Label>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData(prev => ({...prev, newPassword: e.target.value}))}
                          placeholder="Digite a nova senha"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm">Confirmar Nova Senha</Label>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData(prev => ({...prev, confirmPassword: e.target.value}))}
                          placeholder="Confirme a nova senha"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button onClick={handlePasswordChange} size="sm" className="flex-1">
                        <Check className="w-4 h-4 mr-1" />
                        Salvar
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsChangingPassword(false)} 
                        size="sm"
                        className="flex-1"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Card de Estatísticas */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Resumo do Perfil</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Disciplinas:</span>
                  <Badge variant="secondary">{formData.subjects.length}</Badge>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Séries:</span>
                  <Badge variant="secondary">{formData.grades.length}</Badge>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tipos de material:</span>
                  <Badge variant="secondary">{formData.materialTypes.length}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
