import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock, MapPin, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { scheduleService, ScheduleEvent } from '@/services/scheduleService';
import { materialService, GeneratedMaterial } from '@/services/materialService';
import { toast } from 'sonner';
import { activityService } from '@/services/activityService';
import { useSupabaseSchedule } from '@/hooks/useSupabaseSchedule';

interface ScheduleModalProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  event?: ScheduleEvent | null;
  selectedDate?: Date;
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({
  open,
  onClose,
  onSave,
  event,
  selectedDate
}) => {
  const [materials, setMaterials] = useState<GeneratedMaterial[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'single' | 'multiple'>('single');
  const [startDate, setStartDate] = useState<Date>(selectedDate || new Date());
  const [endDate, setEndDate] = useState<Date>(selectedDate || new Date());
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:00');
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<Date>(new Date());
  const [description, setDescription] = useState('');
  const [classroom, setClassroom] = useState('');

  const { saveEvent, updateEvent } = useSupabaseSchedule();

  const weekDays = [
    { value: 'monday', label: 'Segunda' },
    { value: 'tuesday', label: 'Terça' },
    { value: 'wednesday', label: 'Quarta' },
    { value: 'thursday', label: 'Quinta' },
    { value: 'friday', label: 'Sexta' },
    { value: 'saturday', label: 'Sábado' },
    { value: 'sunday', label: 'Domingo' }
  ];

  useEffect(() => {
    const loadMaterials = async () => {
      const loadedMaterials = await materialService.getMaterials();
      setMaterials(loadedMaterials);
    };
    loadMaterials();
  }, []);

  useEffect(() => {
    if (event) {
      setSelectedMaterials(Array.isArray(event.materialIds) ? event.materialIds : event.materialId ? [event.materialId] : []);
      setTitle(event.title);
      setType(event.type);
      setStartDate(event.startDate);
      setEndDate(event.endDate);
      setStartTime(event.startTime);
      setEndTime(event.endTime);
      setDescription(event.description || '');
      setClassroom(event.classroom || '');
      
      if (event.recurrence) {
        setIsRecurring(true);
        setFrequency(event.recurrence.frequency);
        setSelectedDays(event.recurrence.days || []);
        setRecurrenceEndDate(event.recurrence.endDate);
      }
    } else {
      setSelectedMaterials([]);
      setTitle('');
      setType('single');
      setStartDate(selectedDate || new Date());
      setEndDate(selectedDate || new Date());
      setStartTime('08:00');
      setEndTime('09:00');
      setIsRecurring(false);
      setFrequency('weekly');
      setSelectedDays([]);
      setRecurrenceEndDate(new Date());
      setDescription('');
      setClassroom('');
    }
  }, [event, selectedDate, open]);

  const handleMaterialToggle = (materialId: string) => {
    setSelectedMaterials(prev =>
      prev.includes(materialId)
        ? prev.filter(id => id !== materialId)
        : [...prev, materialId]
    );
  };

  function formatDateOnly(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const handleSave = async () => {
    if (selectedMaterials.length === 0) {
      toast.error('Selecione pelo menos um material para a aula');
      return;
    }
    if (!title.trim()) {
      toast.error('Digite um título para o agendamento');
      return;
    }
    if (type === 'multiple' && selectedDays.length === 0) {
      toast.error('Para múltiplas aulas, selecione pelo menos um dia da semana');
      return;
    }
    const selectedMaterialsData = materials.filter(m => selectedMaterials.includes(m.id));
    const eventData = {
      material_ids: selectedMaterials,
      title,
      event_type: type,
      start_date: formatDateOnly(startDate),
      end_date: formatDateOnly(type === 'single' ? startDate : endDate),
      start_time: startTime,
      end_time: endTime,
      description,
      classroom,
      recurrence: type === 'multiple' ? {
        frequency: frequency,
        days: selectedDays,
        endDate: formatDateOnly(endDate)
      } : null
    };
    try {
      if (event) {
        await updateEvent(event.id, eventData);
        toast.success('Aula agendada atualizada com sucesso!');
        activityService.addActivity({
          type: 'updated',
          title: `${title}`,
          description: `Aula editada: ${title} com ${selectedMaterialsData.length} material(is) para ${format(startDate, 'dd/MM/yyyy')} das ${startTime} às ${endTime}`
        });
      } else {
        const saved = await saveEvent(eventData);
        toast.success('Aula agendada com sucesso!');
        activityService.addActivity({
          type: 'scheduled',
          title: `${title}`,
          description: `Aula agendada: ${title} com ${selectedMaterialsData.length} material(is) para ${format(startDate, 'dd/MM/yyyy')} das ${startTime} às ${endTime}`
        });
      }
      onSave();
      onClose();
    } catch (error) {
      toast.error('Erro ao salvar agendamento');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Agendar Aula
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <Label className="font-medium">Título da Aula</Label>
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Ex: Aula de Geometria, Revisão de Prova, etc."
          />
          <Label className="font-medium">Materiais da Aula</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {materials.map(material => (
              <label key={material.id} className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedMaterials.includes(material.id)}
                  onChange={() => handleMaterialToggle(material.id)}
                />
                <span className="truncate">{material.title} <span className="text-xs text-gray-400">({material.type})</span></span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-6 py-4">
          {/* Tipo de Agendamento */}
          <div className="space-y-3">
            <Label>Tipo de Agendamento</Label>
            <div className="grid grid-cols-2 gap-4">
              <div 
                className={cn(
                  "p-4 border rounded-lg cursor-pointer transition-colors",
                  type === 'single' ? "border-blue-500 bg-blue-50" : "border-gray-200"
                )}
                onClick={() => setType('single')}
              >
                <h4 className="font-medium">Aula Única</h4>
                <p className="text-sm text-gray-600">Uma única aula em data específica</p>
              </div>
              <div 
                className={cn(
                  "p-4 border rounded-lg cursor-pointer transition-colors",
                  type === 'multiple' ? "border-blue-500 bg-blue-50" : "border-gray-200"
                )}
                onClick={() => setType('multiple')}
              >
                <h4 className="font-medium">Múltiplas Aulas</h4>
                <p className="text-sm text-gray-600">Série de aulas em dias específicos da semana</p>
              </div>
            </div>
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data de Início</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(startDate, "dd/MM/yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Data de Fim</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(endDate, "dd/MM/yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => date && setEndDate(date)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Horários */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Horário de Início</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">Horário de Fim</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Dias da Semana para Múltiplas Aulas */}
          {type === 'multiple' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Dias da Semana</Label>
                <p className="text-sm text-gray-600">
                  Selecione os dias da semana que as aulas irão ocorrer
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {weekDays.map(day => (
                    <div
                      key={day.value}
                      className={cn(
                        "p-3 text-center text-sm rounded-lg cursor-pointer transition-colors border",
                        selectedDays.includes(day.value)
                          ? "bg-blue-500 text-white border-blue-500"
                          : "bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-200"
                      )}
                      onClick={() => handleDayToggle(day.value)}
                    >
                      {day.label}
                    </div>
                  ))}
                </div>
                {selectedDays.length > 0 && (
                  <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                    Selecionados: {selectedDays.map(day => 
                      weekDays.find(d => d.value === day)?.label
                    ).join(', ')}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sala de Aula */}
          <div className="space-y-2">
            <Label htmlFor="classroom">Sala de Aula (Opcional)</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="classroom"
                value={classroom}
                onChange={(e) => setClassroom(e.target.value)}
                placeholder="Ex: Sala 101, Lab de Informática"
                className="pl-10"
              />
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Observações (Opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Adicione observações sobre a aula..."
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            {event ? 'Atualizar' : 'Criar'} Agendamento
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleModal;
