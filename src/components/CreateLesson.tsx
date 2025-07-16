
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, Clock, BookOpen, Users, Target, Settings, Sparkles, FileText, Presentation, ClipboardList, Calendar as CalendarIcon, Lightbulb, Download, Share2, Eye, Edit3, Trash2, Plus, Minus, ChevronDown, ChevronRight, Search, Filter, SortAsc, SortDesc, X, Check, AlertCircle, Info, HelpCircle, Star, Heart, Bookmark, Tag, Folder, Archive, Copy, Move, Link, ExternalLink, RefreshCw, Save, Upload, Image, Video, Music, File, Palette, Type, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline, List, ListOrdered, Quote, Code, Table, Columns, Rows, Grid, Layout, Maximize, Minimize, ZoomIn, ZoomOut, RotateCcw, RotateCw, FlipHorizontal, FlipVertical, Crop, Scissors, PaintBucket, Brush, Pen, Pencil, Eraser, Ruler, Compass, Calculator, Book, GraduationCap, School, Library, Newspaper, Briefcase, Clipboard, Folder as FolderIcon, FileImage, FileVideo, FileAudio, FilePdf, FileSpreadsheet, FileCode, Database, Server, Globe, Wifi, Bluetooth, Battery, Signal, Volume2, VolumeX, Mic, MicOff, Camera, CameraOff, Phone, PhoneCall, PhoneOff, Mail, MailOpen, MessageSquare, MessageCircle, Send, Reply, Forward, Inbox, Outbox, Archive as ArchiveIcon, Trash, Delete, Backspace, Enter, Space, Shift, Ctrl, Alt, Command, Option, Tab, Escape, Home, End, PageUp, PageDown, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ChevronUp, ChevronLeft, Menu, MoreHorizontal, MoreVertical, PlusCircle, MinusCircle, XCircle, CheckCircle, AlertTriangle, HelpCircle as HelpIcon, InfoIcon, WarningIcon, ErrorIcon, SuccessIcon } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabasePlanPermissions } from '@/hooks/useSupabasePlanPermissions';
import AudioTranscriptionButton from '@/components/AudioTranscriptionButton';

interface FormData {
  topic: string;
  subject: string;
  grade: string;
  questionType: string;
  questionCount: number[];
  subjects: string[];
}

const CreateLesson = () => {
  const { user } = useAuth();
  const { canCreateMaterial } = useSupabasePlanPermissions();
  
  const [formData, setFormData] = useState<FormData>({
    topic: '',
    subject: '',
    grade: '',
    questionType: 'multipla_escolha',
    questionCount: [5],
    subjects: []
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const handleTranscriptionComplete = (result: {
    text: string;
    tema: string;
    disciplina: string | null;
    turma: string | null;
  }) => {
    setFormData(prev => ({
      ...prev,
      topic: result.tema,
      subject: result.disciplina || prev.subject,
      grade: result.turma || prev.grade
    }));
    
    toast.success('Transcrição concluída! Os campos foram preenchidos automaticamente.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Você precisa estar logado para criar materiais');
      return;
    }

    if (!canCreateMaterial()) {
      toast.error('Limite de materiais atingido para seu plano');
      return;
    }

    if (!formData.topic.trim()) {
      toast.error('Por favor, preencha o tema da aula');
      return;
    }

    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('gerarMaterialIA', {
        body: {
          tema: formData.topic,
          disciplina: formData.subject,
          turma: formData.grade,
          tipo_material: formData.questionType
        }
      });

      if (error) {
        console.error('Erro ao gerar material:', error);
        toast.error('Erro ao gerar material. Tente novamente.');
        return;
      }

      toast.success('Material criado com sucesso!');
      
      // Reset form
      setFormData({
        topic: '',
        subject: '',
        grade: '',
        questionType: 'multipla_escolha',
        questionCount: [5],
        subjects: []
      });
      
    } catch (error) {
      console.error('Erro ao criar material:', error);
      toast.error('Erro ao criar material. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Criar Material Educativo</h1>
          <p className="text-muted-foreground">
            Crie materiais educativos personalizados usando inteligência artificial
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Configurações do Material
            </CardTitle>
            <CardDescription>
              Defina os parâmetros para gerar seu material educativo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <Label htmlFor="topic">Tema da Aula *</Label>
                  <div className="relative">
                    <Input
                      id="topic"
                      value={formData.topic}
                      onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                      placeholder="Ex: Introdução à Álgebra Linear"
                      className="pr-12"
                      required
                    />
                    <AudioTranscriptionButton
                      onTranscriptionComplete={handleTranscriptionComplete}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="subject">Disciplina</Label>
                    <Select value={formData.subject} onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a disciplina" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="matematica">Matemática</SelectItem>
                        <SelectItem value="portugues">Português</SelectItem>
                        <SelectItem value="ciencias">Ciências</SelectItem>
                        <SelectItem value="historia">História</SelectItem>
                        <SelectItem value="geografia">Geografia</SelectItem>
                        <SelectItem value="fisica">Física</SelectItem>
                        <SelectItem value="quimica">Química</SelectItem>
                        <SelectItem value="biologia">Biologia</SelectItem>
                        <SelectItem value="educacao_fisica">Educação Física</SelectItem>
                        <SelectItem value="espanhol">Espanhol</SelectItem>
                        <SelectItem value="ingles">Inglês</SelectItem>
                        <SelectItem value="filosofia">Filosofia</SelectItem>
                        <SelectItem value="sociologia">Sociologia</SelectItem>
                        <SelectItem value="informatica">Informática</SelectItem>
                        <SelectItem value="teatro">Teatro</SelectItem>
                        <SelectItem value="literatura">Literatura</SelectItem>
                        <SelectItem value="musica">Música</SelectItem>
                        <SelectItem value="danca">Dança</SelectItem>
                        <SelectItem value="artes">Artes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="grade">Turma/Série</Label>
                    <Select value={formData.grade} onValueChange={(value) => setFormData(prev => ({ ...prev, grade: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a turma" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="maternal">Maternal</SelectItem>
                        <SelectItem value="jardim_1">Jardim I</SelectItem>
                        <SelectItem value="jardim_2">Jardim II</SelectItem>
                        <SelectItem value="pre_escola">Pré-Escola</SelectItem>
                        <SelectItem value="1_ano">1° Ano</SelectItem>
                        <SelectItem value="2_ano">2° Ano</SelectItem>
                        <SelectItem value="3_ano">3° Ano</SelectItem>
                        <SelectItem value="4_ano">4° Ano</SelectItem>
                        <SelectItem value="5_ano">5° Ano</SelectItem>
                        <SelectItem value="6_ano">6° Ano</SelectItem>
                        <SelectItem value="7_ano">7° Ano</SelectItem>
                        <SelectItem value="8_ano">8° Ano</SelectItem>
                        <SelectItem value="9_ano">9° Ano</SelectItem>
                        <SelectItem value="graduacao">Graduação</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Tipo de Material</Label>
                  <RadioGroup
                    value={formData.questionType}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, questionType: value }))}
                    className="grid grid-cols-2 gap-4 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="plano_aula" id="plano_aula" />
                      <Label htmlFor="plano_aula">Plano de Aula</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="atividade" id="atividade" />
                      <Label htmlFor="atividade">Atividade</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="avaliacao" id="avaliacao" />
                      <Label htmlFor="avaliacao">Avaliação</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="slides" id="slides" />
                      <Label htmlFor="slides">Slides</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormData({
                    topic: '',
                    subject: '',
                    grade: '',
                    questionType: 'multipla_escolha',
                    questionCount: [5],
                    subjects: []
                  })}
                >
                  Limpar
                </Button>
                <Button
                  type="submit"
                  disabled={isGenerating || !formData.topic.trim()}
                  className="min-w-[120px]"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Gerar Material
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateLesson;
