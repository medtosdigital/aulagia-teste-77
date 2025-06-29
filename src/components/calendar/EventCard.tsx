
import React from 'react';
import { Clock, MapPin, Eye, Edit3, Download, Trash2, Printer, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, MaterialCardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScheduleEvent } from '@/services/scheduleService';
import { materialService } from '@/services/materialService';
import { exportService } from '@/services/exportService';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EventCardProps {
  event: ScheduleEvent;
  showDate?: boolean;
  compact?: boolean;
  onEdit: (event: ScheduleEvent) => void;
  onDelete: (event: ScheduleEvent) => void;
  onViewMaterial: (event: ScheduleEvent) => void;
}

const EventCard: React.FC<EventCardProps> = ({ 
  event, 
  showDate = false, 
  compact = false,
  onEdit,
  onDelete,
  onViewMaterial
}) => {
  const [materialType, setMaterialType] = React.useState<'plano-de-aula' | 'slides' | 'atividade' | 'avaliacao'>('atividade');

  React.useEffect(() => {
    const loadMaterialType = async () => {
      const materials = await materialService.getMaterials();
      const material = materials.find(m => m.id === event.materialId);
      if (material) {
        setMaterialType((material.type as 'plano-de-aula' | 'slides' | 'atividade' | 'avaliacao') || 'atividade');
      }
    };
    loadMaterialType();
  }, [event.materialId]);

  const handleExportMaterial = async (event: ScheduleEvent, format: 'print' | 'pdf' | 'word' | 'ppt') => {
    const materials = await materialService.getMaterials();
    const material = materials.find(m => m.id === event.materialId);
    if (!material) {
      toast.error('Material não encontrado');
      return;
    }

    try {
      switch (format) {
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

  return (
    <Card className={`group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] overflow-hidden ${compact ? 'text-xs' : ''}`}>
      <MaterialCardHeader materialType={materialType} subject={event.subject} />
      <CardContent className={`${compact ? 'p-3' : 'p-4'}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h3 className={`font-bold text-gray-900 truncate ${compact ? 'text-sm' : 'text-base'}`}>
                {event.title}
              </h3>
            </div>
            
            <div className="mb-3">
              <p className={`text-gray-600 font-medium ${compact ? 'text-xs' : 'text-sm'}`}>
                {event.grade}
              </p>
            </div>
            
            <div className={`space-y-3 ${compact ? 'text-xs' : 'text-sm'} text-gray-600`}>
              {showDate && (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="font-medium">
                      {format(event.startDate, "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                  </div>
                  <Separator className="my-2" />
                </>
              )}
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 text-green-500" />
                <span className="font-medium">{event.startTime} - {event.endTime}</span>
              </div>
              {event.classroom && (
                <>
                  <Separator className="my-2" />
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-purple-500" />
                    <span className="truncate">{event.classroom}</span>
                  </div>
                </>
              )}
            </div>
            
            {event.description && !compact && (
              <>
                <Separator className="my-3" />
                <p className="text-sm text-gray-600 p-2 bg-gray-50 rounded-md italic">
                  "{event.description}"
                </p>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onViewMaterial(event);
            }}
            className="flex items-center gap-2 text-xs px-3 py-2 h-8"
          >
            <Eye className="w-4 h-4" />
            Visualizar
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(event);
            }}
            className="p-2 h-8 w-8"
          >
            <Edit3 className="w-4 h-4" />
          </Button>
          
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                const menu = e.currentTarget.nextElementSibling as HTMLElement;
                if (menu) {
                  menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
                }
              }}
              className="p-2 h-8 w-8"
            >
              <Download className="w-4 h-4" />
            </Button>
            
            <div 
              style={{ display: 'none' }}
              className="absolute bottom-full left-0 mb-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleExportMaterial(event, 'print');
                  (e.target as HTMLElement).closest('div')!.style.display = 'none';
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 rounded-t-lg"
              >
                <Printer className="w-3 h-3" />
                Imprimir
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleExportMaterial(event, 'pdf');
                  (e.target as HTMLElement).closest('div')!.style.display = 'none';
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
              >
                <FileText className="w-3 h-3" />
                PDF
              </button>
              {materialType === 'slides' ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExportMaterial(event, 'ppt');
                    (e.target as HTMLElement).closest('div')!.style.display = 'none';
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 rounded-b-lg"
                >
                  <FileText className="w-3 h-3" />
                  PPT
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExportMaterial(event, 'word');
                    (e.target as HTMLElement).closest('div')!.style.display = 'none';
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 rounded-b-lg"
                >
                  <FileText className="w-3 h-3" />
                  Word
                </button>
              )}
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(event);
            }}
            className="p-2 h-8 w-8"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventCard;
