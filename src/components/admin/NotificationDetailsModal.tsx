
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Save, Users, UserCheck, UserX, MessageSquare, Calendar, Edit3, X, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';

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
    }
  }, [notification]);

  const handleSave = () => {
    onSave(notification.id, {
      titulo: title,
      mensagem: message,
      icon,
      image_url: imageUrl
    });
    setEditMode(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('notificacoes')
        .upload(fileName, file, { upsert: true });
      
      if (error) throw error;
      
      const { data: publicUrlData } = supabase.storage
        .from('notificacoes')
        .getPublicUrl(fileName);
      
      if (publicUrlData?.publicUrl) {
        setImageUrl(publicUrlData.publicUrl);
      }
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
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              Detalhes da Notificação
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
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
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-start gap-4">
                    {notification.icon && (
                      <div className="text-3xl">{notification.icon}</div>
                    )}
                    {notification.image_url && (
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={notification.image_url} />
                        <AvatarFallback>IMG</AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold mb-2">{notification.titulo}</h2>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(notification.data_envio || notification.created_at)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Message */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Mensagem</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {notification.mensagem}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* Sidebar - Statistics */}
            <div className="space-y-4">
              {/* Statistics */}
              <div className="grid grid-cols-2 gap-3">
                <Card className="text-center">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {readUsers.length}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                      <UserCheck className="w-3 h-3" />
                      Lidas
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="text-center">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-orange-600 mb-1">
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
              <div className="grid grid-cols-1 gap-4">
                <Card className="border-green-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-green-700 flex items-center gap-2">
                      <UserCheck className="w-4 h-4" />
                      Usuários que leram ({readUsers.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ScrollArea className="h-32">
                      <div className="space-y-1">
                        {readUsers.map((user, index) => (
                          <div key={index} className="text-xs p-2 bg-green-50 rounded flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            {user}
                          </div>
                        ))}
                        {readUsers.length === 0 && (
                          <p className="text-xs text-muted-foreground text-center py-4">
                            Nenhum usuário leu ainda
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card className="border-orange-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-orange-700 flex items-center gap-2">
                      <UserX className="w-4 h-4" />
                      Não leram ainda ({unreadUsers.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ScrollArea className="h-32">
                      <div className="space-y-1">
                        {unreadUsers.map((user, index) => (
                          <div key={index} className="text-xs p-2 bg-orange-50 rounded flex items-center gap-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            {user}
                          </div>
                        ))}
                        {unreadUsers.length === 0 && (
                          <p className="text-xs text-muted-foreground text-center py-4">
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
