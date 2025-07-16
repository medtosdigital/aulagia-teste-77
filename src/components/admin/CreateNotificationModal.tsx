
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, Save, Upload, X, Image as ImageIcon, Smile } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CreateNotificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (title: string, message: string, icon?: string, imageUrl?: string) => void;
  saving: boolean;
}

export default function CreateNotificationModal({
  open,
  onOpenChange,
  onSave,
  saving
}: CreateNotificationModalProps) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [icon, setIcon] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  const iconGallery = ['🔔', '❗', '📢', '✨', '🎉', '📝', '💡', '⚡', '🔥', '🎯'];

  const handleClose = () => {
    setTitle('');
    setMessage('');
    setIcon('');
    setImageUrl('');
    onOpenChange(false);
  };

  const handleSave = () => {
    if (!title.trim() || !message.trim()) return;
    onSave(title, message, icon, imageUrl);
    handleClose();
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

  const removeImage = () => {
    setImageUrl('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Bell className="w-6 h-6 text-primary" />
            </div>
            Nova Notificação
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Título da Notificação
            </Label>
            <Input
              id="title"
              placeholder="Digite o título da notificação..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-12"
            />
          </div>

          {/* Visual Elements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Icon Section */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Smile className="w-4 h-4" />
                Ícone
              </Label>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Atual:</span>
                  <div className="text-2xl p-1">{icon || '🔔'}</div>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {iconGallery.map((emoji, i) => (
                    <Button
                      key={i}
                      type="button"
                      variant={icon === emoji ? "default" : "outline"}
                      size="sm"
                      className="h-10 w-10 p-0 text-lg"
                      onClick={() => setIcon(emoji)}
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
                <Input
                  placeholder="Ou digite um ícone personalizado..."
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="text-center"
                />
              </div>
            </div>

            {/* Image Section */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Imagem (opcional)
              </Label>
              {imageUrl ? (
                <Card className="relative">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={imageUrl} />
                        <AvatarFallback>IMG</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Imagem carregada</p>
                        <p className="text-xs text-muted-foreground">
                          Clique no X para remover
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeImage}
                        className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
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
                      className="w-full h-24 border-dashed flex flex-col gap-2"
                      disabled={uploading}
                    >
                      <Upload className="w-6 h-6 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {uploading ? 'Enviando...' : 'Clique para enviar imagem'}
                      </span>
                    </Button>
                  </div>
                  <Input
                    placeholder="Ou cole uma URL de imagem..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium">
              Mensagem
            </Label>
            <Textarea
              id="message"
              placeholder="Digite o conteúdo da notificação..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Preview */}
          {(title || message) && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Pré-visualização</Label>
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {icon && <span className="text-xl">{icon}</span>}
                    {imageUrl && (
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={imageUrl} />
                        <AvatarFallback>IMG</AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">
                        {title || 'Título da notificação'}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {message || 'Conteúdo da notificação aparecerá aqui...'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={!title.trim() || !message.trim() || saving}
              className="min-w-[120px]"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Criar Notificação
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
