
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Save, UserCheck, UserX, MessageSquare, Calendar, Edit3, X, Upload, ToggleLeft } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { notificationService } from '@/services/notificationService';

interface NotificationDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notification: any;
  userProfiles: Record<string, string>;
  onSave: (id: string, updates: any) => void;
  saving: boolean;
}

export default function NotificationDetailsModal({
  open,
  onOpenChange,
  notification,
  userProfiles,
  onSave,
  saving
}: NotificationDetailsModalProps) {
  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [icon, setIcon] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  const readUsers = (notification?.lida_por || []).map((id: string) => userProfiles[id] || id);
  const allUserIds = Object.keys(userProfiles);
  const unreadUsers = allUserIds.filter(id => !(notification?.lida_por || []).includes(id)).map(id => userProfiles[id] || id);

  useEffect(() => {
    if (notification) {
      setTitle(notification.titulo || '');
      setMessage(notification.mensagem || '');
      setIcon(notification.icon || '');
      setImageUrl(notification.image_url || '');
      setIsActive(notification.ativa || false);
    }
  }, [notification]);

  const handleSave = () => {
    onSave(notification.id, {
      titulo: title,
      mensagem: message,
      icon,
      image_url: imageUrl,
      ativa: isActive
    });
    setEditMode(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const uploadedUrl = await notificationService.uploadImage(file);
      setImageUrl(uploadedUrl);
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return format(new Date(dateStr), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  if (!notification) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-3 sm:pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg sm:text-2xl font-bold flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
                <MessageSquare className="w-4 h-4 sm:w-6 sm:h-6 text-primary" />
              </div>
              <span className="hidden sm:inline">Detalhes da Notificação</span>
              <span className="sm:hidden">Detalhes</span>
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Badge variant={notification.ativa ? "default" : "secondary"}>
                {notification.ativa ? "Ativa" : "Inativa"}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditMode(!editMode)}
                className="h-8 w-8 p-0"
              >
                <Edit3 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 h-full">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {editMode ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-title">Título</Label>
                    <Input
                      id="edit-title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-icon">Ícone</Label>
                      <Input
                        id="edit-icon"
                        value={icon}
                        onChange={(e) => setIcon(e.target.value)}
                        placeholder="Emoji ou ícone"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Imagem</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            disabled={uploading}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full"
                            disabled={uploading}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            {uploading ? 'Enviando...' : 'Upload'}
                          </Button>
                        </div>
                        {imageUrl && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setImageUrl('')}
                            className="px-2"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-message">Mensagem</Label>
                    <Textarea
                      id="edit-message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={6}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-base font-medium">
                      <ToggleLeft className="w-4 h-4" />
                      Status da Notificação
                    </Label>
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="notification-status"
                            checked={isActive}
                            onCheckedChange={setIsActive}
                          />
                          <Label htmlFor="notification-status" className="text-sm font-medium">
                            {isActive ? 'Ativa' : 'Inativa'}
                          </Label>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {isActive 
                            ? 'A notificação será exibida para todos os usuários'
                            : 'A notificação não será exibida para os usuários'
                          }
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        isActive 
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}>
                        {isActive ? 'VISÍVEL' : 'OCULTA'}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setEditMode(false)}
                      disabled={saving}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Salvar Alterações
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  {/* Banner Image */}
                  {notification.image_url && (
                    <div className="w-full">
                      <div className="aspect-[21/9] sm:aspect-[16/9] w-full overflow-hidden rounded-lg bg-muted max-h-32 sm:max-h-40">
                        <img 
                          src={notification.image_url} 
                          alt="Banner da notificação"
                          className="w-full h-full object-cover object-center"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Header */}
                  <div className="flex items-start gap-3 sm:gap-4">
                    {notification.icon && (
                      <div className="text-2xl sm:text-3xl">{notification.icon}</div>
                    )}
                    <div className="flex-1">
                      <h2 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">{notification.titulo}</h2>
                      <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                          {formatDate(notification.data_envio || notification.created_at)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Message */}
                  <Card>
                    <CardHeader className="pb-2 sm:pb-6">
                      <CardTitle className="text-base sm:text-lg">Mensagem</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 sm:pt-6">
                      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {notification.mensagem}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* Sidebar - Statistics */}
            <div className="space-y-3 sm:space-y-4">
              {/* Statistics */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <Card className="text-center">
                  <CardContent className="p-2 sm:p-4">
                    <div className="text-lg sm:text-2xl font-bold text-green-600 mb-1">
                      {readUsers.length}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                      <UserCheck className="w-3 h-3" />
                      Lidas
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="text-center">
                  <CardContent className="p-2 sm:p-4">
                    <div className="text-lg sm:text-2xl font-bold text-orange-600 mb-1">
                      {unreadUsers.length}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                      <UserX className="w-3 h-3" />
                      Não lidas
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Users Lists */}
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                <Card className="border-green-200">
                  <CardHeader className="pb-2 sm:pb-3">
                    <CardTitle className="text-xs sm:text-sm text-green-700 flex items-center gap-1 sm:gap-2">
                      <UserCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                      Usuários que leram ({readUsers.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ScrollArea className="h-24 sm:h-32">
                      <div className="space-y-1">
                        {readUsers.map((user, index) => (
                          <div key={index} className="text-xs p-1.5 sm:p-2 bg-green-50 rounded flex items-center gap-1.5 sm:gap-2">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full"></div>
                            {user}
                          </div>
                        ))}
                        {readUsers.length === 0 && (
                          <p className="text-xs text-muted-foreground text-center py-3 sm:py-4">
                            Nenhum usuário leu ainda
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card className="border-orange-200">
                  <CardHeader className="pb-2 sm:pb-3">
                    <CardTitle className="text-xs sm:text-sm text-orange-700 flex items-center gap-1 sm:gap-2">
                      <UserX className="w-3 h-3 sm:w-4 sm:h-4" />
                      Não leram ainda ({unreadUsers.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ScrollArea className="h-24 sm:h-32">
                      <div className="space-y-1">
                        {unreadUsers.map((user, index) => (
                          <div key={index} className="text-xs p-1.5 sm:p-2 bg-orange-50 rounded flex items-center gap-1.5 sm:gap-2">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-500 rounded-full"></div>
                            {user}
                          </div>
                        ))}
                        {unreadUsers.length === 0 && (
                          <p className="text-xs text-muted-foreground text-center py-3 sm:py-4">
                            Todos os usuários leram
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
