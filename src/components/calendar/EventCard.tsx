import React from 'react';
import { Clock, MapPin, Eye, Edit3, Download, Trash2, Printer, FileText, BookOpen, Users, FileText as AtividadeIcon, FileText as AvaliacaoIcon, FileText as PlanoIcon, FileText as SlidesIcon, Calendar as CalendarIcon, Sliders } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, MaterialCardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CalendarEvent } from '@/services/supabaseScheduleService';
import { materialService } from '@/services/materialService';
import { exportService } from '@/services/exportService';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EventCardProps {
  event: CalendarEvent;
  showDate?: boolean;
  compact?: boolean;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (event: CalendarEvent) => void;
  onViewMaterial: (event: CalendarEvent) => void;
}

const EventCard: React.FC<EventCardProps> = ({ 
  event, 
  showDate = false, 
  compact = false,
  onEdit,
  onDelete,
  onViewMaterial
}) => {
  const [materials, setMaterials] = React.useState<any[]>([]);

  React.useEffect(() => {
    const loadMaterials = async () => {
      if (event.material_ids && event.material_ids.length > 0) {
        const allMaterials = await materialService.getMaterials();
        setMaterials(allMaterials.filter(m => event.material_ids?.includes(m.id)));
      } else {
        setMaterials([]);
      }
    };
    loadMaterials();
  }, [event.material_ids]);

  const handleExportMaterial = async (event: CalendarEvent, formatType: 'print' | 'pdf' | 'word' | 'ppt') => {
    const materials = await materialService.getMaterials();
    // Seleciona o primeiro material vinculado ao evento, se houver
    const material = event.material_ids && event.material_ids.length > 0
      ? materials.find(m => event.material_ids?.includes(m.id))
      : undefined;
    if (!material) {
      toast.error('Material não encontrado');
      return;
    }
    try {
      switch (formatType) {
        case 'print':
          await exportService.exportToPDF(material);
          toast.success('Material enviado para impressão!');
          break;
        case 'pdf':
          await exportService.exportToPDF(material);
          toast.success('PDF baixado com sucesso!');
          break;
        case 'word':
          if (material.type === 'slides') {
            toast.error('Exportação Word não disponível para slides. Use PPT.');
            return;
          }
          await exportService.exportToWord(material);
          toast.success('Word baixado com sucesso!');
          break;
        case 'ppt':
          if (material.type !== 'slides') {
            toast.error('Exportação PPT disponível apenas para slides. Use Word.');
            return;
          }
          await exportService.exportToPPT(material);
          toast.success('PowerPoint baixado com sucesso!');
          break;
      }
    } catch (error) {
      console.error('Erro na exportação:', error);
      toast.error('Erro na exportação');
    }
  };

  const getMaterialTypeIcon = (type: string) => {
    switch (type) {
      case 'plano-de-aula':
        return <BookOpen className="w-4 h-4 text-blue-600" />;
      case 'slides':
        return <SlidesIcon className="w-4 h-4 text-gray-600" />;
      case 'atividade':
        return <AtividadeIcon className="w-4 h-4 text-green-600" />;
      case 'avaliacao':
        return <AvaliacaoIcon className="w-4 h-4 text-purple-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  // Agrupar disciplinas dos materiais
  const allDisciplines = materials.map(m => m.subject).filter(Boolean);
  const uniqueDisciplines = Array.from(new Set(allDisciplines));
  const showDiscipline = uniqueDisciplines.length === 1 ? uniqueDisciplines[0] : undefined;
  // Agrupar tipos de materiais
  const materialTypes = Array.from(new Set(materials.map(m => m.type)));
  // Data formatada
  let dateStr = '';
  if (event.start_date) {
    try {
      // Garante que a data está em formato ISO e válida
      const parsedDate = parseISO(event.start_date);
      dateStr = format(parsedDate, "dd/MM", { locale: ptBR });
    } catch (e) {
      dateStr = event.start_date;
    }
  }
  const timeStr = `${event.start_time?.slice(0,5)} - ${event.end_time?.slice(0,5)}`;

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'avaliacao':
        return { label: 'Avaliação Agendada', bg: 'bg-gradient-to-r from-purple-500 to-purple-700', badge: 'bg-purple-100 text-purple-700' };
      case 'atividade':
        return { label: 'Atividade Agendada', bg: 'bg-gradient-to-r from-green-500 to-green-700', badge: 'bg-green-100 text-green-700' };
      case 'slides':
        return { label: 'Slides Agendados', bg: 'bg-gradient-to-r from-gray-500 to-gray-700', badge: 'bg-gray-100 text-gray-700' };
      default:
        return { label: 'Aula Agendada', bg: 'bg-gradient-to-r from-blue-500 to-blue-700', badge: 'bg-blue-100 text-blue-700' };
    }
  };

  const typeConfig = getTypeConfig(event.event_type || 'aula');
  const disciplina = materials.length > 0 ? materials[0].subject : '';
  const sala = event.classroom;
  const observacoes = event.description;

  // Determina se é visualização compacta (semana, mês, ano)
  const isCompact = compact;

  return (
    <Card className={`group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] overflow-hidden flex flex-col p-0 ${isCompact ? 'max-w-full w-full' : ''}`}>
      {/* Cabeçalho colorido, ocupando toda a largura */}
      <div className={`flex items-center justify-between w-full ${isCompact ? 'px-1 py-0.5' : 'px-2 py-1'} ${typeConfig.bg}`}> 
        <div className={`flex items-center ${isCompact ? 'gap-0.5' : 'gap-1'}`}>
          <Users className={`text-white ${isCompact ? 'w-3 h-3' : 'w-4 h-4'}`} />
          <span className={`text-white font-semibold ${isCompact ? 'text-xs' : 'text-sm sm:text-base'}`}>{typeConfig.label}</span>
        </div>
        {disciplina && (
          <span className={`ml-1 ${typeConfig.badge} px-1 py-0.5 rounded-full text-[10px] font-medium truncate max-w-[60px]`}>{disciplina}</span>
        )}
      </div>
      {/* Informações em linhas, bem organizadas */}
      <div className={`flex flex-col gap-1 bg-white h-full ${isCompact ? 'px-1 py-1' : 'px-4 py-3'}`}>
        {/* Linha de data e horário centralizada nas visões compactas */}
        {isCompact ? (
          <div className="flex flex-col items-center justify-center mb-0 w-full">
            <div className="flex items-center gap-1 justify-center text-center">
              <span className="flex items-center gap-0.5 text-blue-600 font-medium text-[10px]">
                <CalendarIcon className="w-3 h-3" />
                {dateStr}
              </span>
              <span className="flex items-center gap-0.5 text-green-600 font-medium text-[10px]">
                <Clock className="w-3 h-3" />
                {timeStr}
              </span>
            </div>
            <span className="font-bold text-gray-900 text-sm truncate mt-0.5 w-full text-center block">{event.title}</span>
          </div>
        ) : (
          <div className="flex items-center justify-between mb-2 w-full">
            <span className="font-bold text-gray-900 text-xl sm:text-lg truncate flex-1">{event.title}</span>
            <div className="flex flex-col items-end min-w-[120px] ml-4">
              <div className="flex items-center gap-2 text-blue-600 font-medium">
                <CalendarIcon className="w-4 h-4" />
                <span>{dateStr}</span>
              </div>
              <div className="flex items-center gap-2 text-green-600 font-medium">
                <Clock className="w-4 h-4" />
                <span>{timeStr}</span>
              </div>
            </div>
          </div>
        )}
        {/* Ícones e títulos dos tipos de materiais */}
        {materialTypes.length > 0 && (
          <div className={`flex items-center ${isCompact ? 'gap-1 mb-1 mt-0' : 'gap-2 mb-2 mt-1'} flex-wrap ${isCompact ? 'justify-center' : ''}`}>
            {materials.map(material => (
              <span key={material.id} className="flex items-center gap-0.5">
                <span title={material.type} className={`inline-flex items-center justify-center ${isCompact ? 'w-6 h-6' : 'w-8 h-8'} rounded bg-gray-100`}>
                  {getMaterialTypeIcon(material.type)}
                </span>
                {!isCompact && (
                  <span className="text-xs text-gray-700 font-medium truncate max-w-[120px]">{material.title}</span>
                )}
              </span>
            ))}
          </div>
        )}
        {(sala || observacoes) && !isCompact && <hr className="my-2 border-gray-200" />}
        {sala && <span className={`text-xs text-gray-500 ${isCompact ? 'truncate' : ''}`}>Sala: {sala}</span>}
        {observacoes && !isCompact && <span className="text-xs text-gray-500">Obs: {observacoes}</span>}
        <div className="flex-1" />
        {/* Rodapé dos botões, alinhamento e responsividade */}
        <div className={`w-full pt-1 border-t border-gray-200 flex flex-row flex-wrap items-center justify-between ${isCompact ? 'gap-1 mt-1' : 'gap-2 mt-2'} sticky bottom-0 bg-white z-10`}>
          <Button
            variant="outline"
            size="sm"
            onClick={e => { e.stopPropagation(); onViewMaterial(event); }}
            className={`flex-1 ${isCompact ? 'min-w-[60px] h-7 text-[11px] px-1 py-1' : 'min-w-[110px] h-10 text-xs px-2 py-1'} flex items-center justify-center gap-1 font-semibold w-full`}
          >
            <Eye className={`${isCompact ? 'w-3 h-3' : 'w-4 h-4'}`} />
            <span className="block sm:hidden">Ver</span>
            <span className="hidden sm:block">Visualizar</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={e => { e.stopPropagation(); onEdit(event); }}
            className={`flex-1 ${isCompact ? 'min-w-[50px] h-7 text-[11px] px-1 py-1' : 'min-w-[90px] h-10 text-xs px-2 py-1'} flex items-center justify-center gap-1 w-full`}
            title="Editar"
          >
            <Edit3 className={`${isCompact ? 'w-3 h-3' : 'w-4 h-4'}`} />
            <span>Editar</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={e => { e.stopPropagation(); onDelete(event); }}
            className={`flex-1 ${isCompact ? 'min-w-[50px] h-7 text-[11px] px-1 py-1' : 'min-w-[90px] h-10 text-xs px-2 py-1'} flex items-center justify-center gap-1 text-red-600 hover:text-red-700 w-full`}
            title="Excluir"
          >
            <Trash2 className={`${isCompact ? 'w-3 h-3' : 'w-4 h-4'}`} />
            <span>Excluir</span>
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default EventCard;
