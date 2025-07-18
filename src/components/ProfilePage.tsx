import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { User, Camera, Shield, Crown, Save, Edit2, Lock, Phone, FileText, Plus, CheckCircle, Download, Calendar as CalendarIcon } from 'lucide-react';
import { usePlanPermissions } from '@/hooks/usePlanPermissions';
import { userMaterialsService } from '@/services/userMaterialsService';
import { statsService } from '@/services/statsService';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { activityService } from '@/services/activityService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ProfilePhotoCropModal from './ProfilePhotoCropModal';

// Cache em memória para perfil do usuário
const profileCache = new Map<string, { data: any, timestamp: number }>();
const PROFILE_CACHE_DURATION = 60000; // 60 segundos

const ProfilePage = () => {
  const { user } = useAuth();
  const { currentPlan } = usePlanPermissions();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [formData, setFormData] = useState({
    name: '',
    photo: '',
    teachingLevel: '',
    grades: [] as string[],
    subjects: [] as string[],
    school: '',
    materialTypes: [] as string[],
    celular: ''
  });

  const [materialStats, setMaterialStats] = useState({
    totalMaterials: 0,
    planoAula: 0,
    slides: 0,
    atividades: 0,
    avaliacoes: 0
  });

  const [recentActivities, setRecentActivities] = useState([]);

  const teachingLevels = [
    'Educação Infantil',
    'Ensino Fundamental I',
    'Ensino Fundamental II',
    'Ensino Médio',
    'Ensino Superior'
  ];

  const gradesByLevel: { [key: string]: string[] } = {
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

  const [showCropModal, setShowCropModal] = useState(false);
  const [rawPhoto, setRawPhoto] = useState<string | null>(null);

  const loadProfile = async () => {
    if (!user?.id) return;

    const cacheKey = `profile_${user.id}`;
    const cached = profileCache.get(cacheKey);
    const now = Date.now();
    if (cached && (now - cached.timestamp) < PROFILE_CACHE_DURATION) {
      setFormData(cached.data);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Buscar perfil do usuário com todos os campos
      const { data: profile, error } = await supabase
        .from('perfis')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        toast({
          title: "Erro ao carregar perfil",
          description: "Não foi possível carregar os dados do perfil.",
          variant: "destructive"
        });
        return;
      }

      let newFormData;
      if (profile) {
        newFormData = {
          name: profile.nome_preferido || profile.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
          photo: profile.avatar_url || '',
          teachingLevel: profile.etapas_ensino?.[0] || '',
          grades: profile.anos_serie || [],
          subjects: profile.disciplinas || [],
          school: profile.escola || '',
          materialTypes: profile.tipo_material_favorito || [],
          celular: profile.celular || ''
        };
      } else {
        newFormData = {
          ...formData,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário'
        };
      }

      setFormData(newFormData);
      profileCache.set(cacheKey, { data: newFormData, timestamp: now });
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadMaterialStats = async () => {
      try {
        // Carregar estatísticas dos materiais
        const stats = await statsService.getMaterialStats();
        setMaterialStats(stats);

      } catch (error) {
        console.error('Error loading material stats:', error);
        setMaterialStats({
          totalMaterials: 0,
          planoAula: 0,
          slides: 0,
          atividades: 0,
          avaliacoes: 0
        });
      }
    };

    loadMaterialStats();
  }, [user]);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  useEffect(() => {
    const loadActivities = async () => {
      const activities = await activityService.getRecentActivities(10);
      setRecentActivities(activities);
    };
    loadActivities();
  }, []);

  const getPlanDisplayName = () => {
    switch (currentPlan.id) {
      case 'gratuito':
        return 'Plano Gratuito';
      case 'professor':
        return 'Plano Professor';
      case 'grupo_escolar':
      case 'grupo-escolar':
        return 'Grupo Escolar';
      case 'admin':
        return 'Plano Administrador';
      default:
        return 'Plano Gratuito';
    }
  };

  const getPlanColor = () => {
    switch (currentPlan.id) {
      case 'professor':
        return 'bg-blue-500 text-white';
      case 'grupo_escolar':
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
      [field]: (prev[field as keyof typeof prev] as string[]).includes(item) 
        ? (prev[field as keyof typeof prev] as string[]).filter(i => i !== item)
        : [...(prev[field as keyof typeof prev] as string[]), item]
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const photoUrl = event.target?.result as string;
        setRawPhoto(photoUrl);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedDataUrl: string) => {
    setFormData(prev => ({
      ...prev,
      photo: croppedDataUrl
    }));
    setShowCropModal(false);
    setRawPhoto(null);
  };

  const handleSave = async () => {
    if (!user?.id) return;

    try {
      setSaving(true);

      // Preparar dados para salvar na tabela perfis
      const profileData = {
        user_id: user.id,
        nome_preferido: formData.name,
        full_name: formData.name,
        email: user.email,
        avatar_url: formData.photo,
        etapas_ensino: formData.teachingLevel ? [formData.teachingLevel] : [],
        anos_serie: formData.grades,
        disciplinas: formData.subjects,
        tipo_material_favorito: formData.materialTypes,
        preferencia_bncc: false, // valor padrão
        celular: formData.celular,
        escola: formData.school
      };

      // Upsert na tabela perfis
      const { error: profileError } = await supabase
        .from('perfis')
        .upsert(profileData, { onConflict: 'user_id' });

      if (profileError) {
        console.error('Error saving profile:', profileError);
        toast({
          title: "Erro ao salvar perfil",
          description: "Não foi possível salvar os dados do perfil.",
          variant: "destructive"
        });
        return;
      }

      // Disparar evento para atualizar header
      window.dispatchEvent(new CustomEvent('profileUpdated'));
      
      toast({
        title: "Perfil salvo",
        description: "Suas informações foram atualizadas com sucesso!"
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Erro ao salvar perfil",
        description: "Ocorreu um erro inesperado ao salvar o perfil.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Erro na validação",
        description: "As senhas não coincidem!",
        variant: "destructive"
      });
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A nova senha deve ter pelo menos 6 caracteres!",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });

      if (error) {
        toast({
          title: "Erro ao alterar senha",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Senha alterada",
        description: "Sua senha foi alterada com sucesso!"
      });
      
      setShowPasswordModal(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: "Erro inesperado",
        description: "Erro ao alterar senha. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleManageSubscription = () => {
    // Disparar evento para navegar para página de assinatura
    window.dispatchEvent(new CustomEvent('navigateToSubscription'));
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-96 bg-gray-200 rounded"></div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-6">
              <div className="h-48 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          disabled={saving}
        >
          {saving ? (
            <>
              <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Salvando...
            </>
          ) : isEditing ? (
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
                  <ProfilePhotoCropModal
                    open={showCropModal}
                    imageSrc={rawPhoto}
                    onClose={() => setShowCropModal(false)}
                    onCropComplete={handleCropComplete}
                  />
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
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">E-mail</Label>
                    <Input
                      id="email"
                      value={user?.email || ''}
                      disabled={true}
                      className="mt-1 bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="celular" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Celular
                    </Label>
                    <Input
                      id="celular"
                      value={formData.celular}
                      onChange={(e) => handleInputChange('celular', e.target.value)}
                      disabled={!isEditing}
                      placeholder="(11) 99999-9999"
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
              {formData.teachingLevel && gradesByLevel[formData.teachingLevel] && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">Anos/Séries que atende</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {gradesByLevel[formData.teachingLevel].map((grade) => (
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
                  : (currentPlan.id === 'grupo_escolar' || currentPlan.id === 'grupo-escolar')
                  ? 'Gerenciamento escolar completo'
                  : currentPlan.id === 'admin'
                  ? 'Criação ilimitada de materiais e acesso total à plataforma'
                  : 'Recursos básicos disponíveis'
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
                <span className="font-bold text-lg">{currentPlan.id === 'admin' ? 'Ilimitada' : materialStats.totalMaterials}</span>
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
          {/* Atividades Recentes */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
              <CardTitle>Atividades Recentes</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4 max-h-96 overflow-y-auto">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                  <div
                    key={activity.id}
                    className="flex items-start space-x-4 p-3 hover:bg-gray-50 rounded-lg transition animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="mt-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        activity.type === 'created' ? 'bg-green-100 text-green-600' :
                        activity.type === 'exported' ? 'bg-blue-100 text-blue-600' :
                        activity.type === 'updated' ? 'bg-purple-100 text-purple-600' :
                        activity.type === 'scheduled' ? 'bg-orange-100 text-orange-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {activity.type === 'created' && <Plus size={16} />}
                        {activity.type === 'exported' && <Download size={16} />}
                        {activity.type === 'updated' && <CheckCircle size={16} />}
                        {activity.type === 'scheduled' && <CalendarIcon size={16} />}
                        {!['created','exported','updated','scheduled'].includes(activity.type) && <FileText size={16} />}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-gray-500">{activity.description}</p>
                      <div className="flex items-center space-x-3 mt-1">
                        <p className="text-xs text-gray-400">{format(new Date(activity.timestamp), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
                        {activity.subject && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            {activity.subject}
                          </span>
                        )}
                        {activity.grade && (
                          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                            {activity.grade}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <h4 className="font-medium text-gray-800 mb-2">Ainda não há atividades</h4>
                  <p className="text-gray-500 mb-4">Suas atividades aparecerão aqui quando você começar a criar materiais</p>
                </div>
              )}
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
