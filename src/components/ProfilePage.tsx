
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { User, Camera, Shield, Crown, Save, Edit2, Lock } from 'lucide-react';
import { usePlanPermissions } from '@/hooks/usePlanPermissions';
import { userMaterialsService } from '@/services/userMaterialsService';
import { statsService } from '@/services/statsService';

const ProfilePage = () => {
  const { currentPlan } = usePlanPermissions();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [formData, setFormData] = useState({
    name: 'Professor(a)',
    photo: '',
    teachingLevel: '',
    grades: [],
    subjects: [],
    school: '',
    materialTypes: []
  });

  const [materialStats, setMaterialStats] = useState({
    totalMaterials: 0,
    planoAula: 0,
    slides: 0,
    atividades: 0,
    avaliacoes: 0
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

  useEffect(() => {
    // Carregar estatísticas dos materiais
    const stats = statsService.getMaterialStats();
    setMaterialStats(stats);

    // Inicializar materiais de exemplo se necessário
    userMaterialsService.initializeSampleMaterials('user1');
  }, []);

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
        return 'bg-blue-500 text-white';
      case 'grupo-escolar':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const photoUrl = event.target?.result as string;
        setFormData(prev => ({
          ...prev,
          photo: photoUrl
        }));
        
        // Salvar no localStorage para persistir
        localStorage.setItem('userPhoto', photoUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    // Salvar dados do perfil
    localStorage.setItem('userProfile', JSON.stringify(formData));
    setIsEditing(false);
  };

  const handlePasswordChange = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      alert('A nova senha deve ter pelo menos 6 caracteres!');
      return;
    }

    // Simular alteração de senha
    console.log('Senha alterada com sucesso!');
    setShowPasswordModal(false);
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    alert('Senha alterada com sucesso!');
  };

  const handleManageSubscription = () => {
    // Navegar para página de assinatura
    window.location.hash = '#subscription';
  };

  // Carregar dados salvos
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    const savedPhoto = localStorage.getItem('userPhoto');
    
    if (savedProfile) {
      setFormData(JSON.parse(savedProfile));
    }
    
    if (savedPhoto) {
      setFormData(prev => ({
        ...prev,
        photo: savedPhoto
      }));
    }
  }, []);

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Meu Perfil</h1>
          <p className="text-gray-600">Gerencie suas informações pessoais e preferências</p>
        </div>
        <Button 
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          size="lg"
        >
          {isEditing ? (
            <>
              <Save className="w-4 h-4 mr-2" />
              Salvar Alterações
            </>
          ) : (
            <>
              <Edit2 className="w-4 h-4 mr-2" />
              Editar Perfil
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informações Básicas */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                  <User className="w-5 h-5 text-white" />
                </div>
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {/* Foto e Nome */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
                <div className="relative">
                  <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                    <AvatarImage src={formData.photo} />
                    <AvatarFallback className="text-xl bg-gradient-to-br from-blue-400 to-purple-400 text-white">
                      {formData.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <label className="absolute -bottom-2 -right-2 cursor-pointer">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-2 rounded-full shadow-lg hover:shadow-xl transition-shadow">
                        <Camera className="w-4 h-4" />
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <div className="flex-1 space-y-4 w-full">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">Nome</Label>
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

          {/* Informações Educacionais */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b">
              <CardTitle className="text-xl">Informações Educacionais</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Etapa de Ensino */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">Etapa de Ensino (opcional)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {teachingLevels.map((level) => (
                    <label key={level} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name="teachingLevel"
                        checked={formData.teachingLevel === level}
                        onChange={() => handleInputChange('teachingLevel', level)}
                        disabled={!isEditing}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm">{level}</span>
                    </label>
                  ))}
                </div>
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
                        className="h-auto py-2 text-xs"
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {subjects.map((subject) => (
                    <Button
                      key={subject}
                      variant={formData.subjects.includes(subject) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleArrayItem('subjects', subject)}
                      disabled={!isEditing}
                      className="h-auto py-2 text-xs justify-start"
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
                      className="h-auto py-2"
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Direita */}
        <div className="space-y-6">
          {/* Plano Atual */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                Plano Atual
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 text-center">
              <Badge className={`${getPlanColor()} px-4 py-2 text-sm font-medium mb-4`}>
                {getPlanDisplayName()}
              </Badge>
              <p className="text-sm text-gray-600 mb-4">
                {currentPlan.id === 'gratuito' 
                  ? 'Recursos básicos disponíveis'
                  : currentPlan.id === 'professor'
                  ? 'Acesso completo aos recursos'
                  : 'Gerenciamento escolar completo'
                }
              </p>
              <Button 
                variant="outline" 
                className="w-full border-2 hover:bg-blue-50"
                onClick={handleManageSubscription}
              >
                Gerenciar Assinatura
              </Button>
            </CardContent>
          </Card>

          {/* Segurança */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 border-b">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start border-2 hover:bg-red-50"
                onClick={() => setShowPasswordModal(true)}
              >
                <Lock className="w-4 h-4 mr-2" />
                Alterar Senha
              </Button>
            </CardContent>
          </Card>

          {/* Resumo de Materiais */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
              <CardTitle>Resumo de Materiais</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total de materiais:</span>
                <span className="font-bold text-lg">{materialStats.totalMaterials}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Planos de aula:</span>
                <span className="font-semibold">{materialStats.planoAula}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Atividades:</span>
                <span className="font-semibold">{materialStats.atividades}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Slides:</span>
                <span className="font-semibold">{materialStats.slides}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avaliações:</span>
                <span className="font-semibold">{materialStats.avaliacoes}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de Alterar Senha */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Alterar Senha
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="currentPassword">Senha Atual</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm(prev => ({...prev, currentPassword: e.target.value}))}
                placeholder="Digite sua senha atual"
              />
            </div>
            <div>
              <Label htmlFor="newPassword">Nova Senha</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({...prev, newPassword: e.target.value}))}
                placeholder="Digite sua nova senha"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({...prev, confirmPassword: e.target.value}))}
                placeholder="Confirme sua nova senha"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handlePasswordChange} className="bg-red-500 hover:bg-red-600">
              Alterar Senha
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePage;
