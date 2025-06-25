
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
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
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
    setMaterials(materialService.getMaterials());
  }, []);

  useEffect(() => {
    if (event) {
      setSelectedMaterial(event.materialId);
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
      // Reset form for new event
      setSelectedMaterial('');
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

  const handleMaterialChange = (materialId: string) => {
    setSelectedMaterial(materialId);
    const material = materials.find(m => m.id === materialId);
    if (material && !title) {
      setTitle(material.title);
    }
  };

  const handleDayToggle = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const handleSave = () => {
    if (!selectedMaterial) {
      toast.error('Selecione um material');
      return;
    }

    if (!title.trim()) {
      toast.error('Digite um título para o agendamento');
      return;
    }

    if (type === 'multiple' && isRecurring && selectedDays.length === 0 && frequency === 'weekly') {
      toast.error('Selecione pelo menos um dia da semana');
      return;
    }

    const material = materials.find(m => m.id === selectedMaterial);
    if (!material) return;

    const eventData = {
      materialId: selectedMaterial,
      title,
      subject: material.subject,
      grade: material.grade,
      type,
      startDate,
      endDate: type === 'single' ? startDate : endDate,
      startTime,
      endTime,
      description,
      classroom,
      recurrence: (type === 'multiple' && isRecurring) ? {
        frequency,
        days: frequency === 'weekly' ? selectedDays : undefined,
        endDate: recurrenceEndDate
      } : undefined
    };

    try {
      if (event) {
        scheduleService.updateEvent(event.id, eventData);
        toast.success('Agendamento atualizado com sucesso!');
      } else {
        scheduleService.saveEvent(eventData);
        toast.success('Agendamento criado com sucesso!');
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
            {event ? 'Editar Agendamento' : 'Novo Agendamento'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Seleção de Material */}
          <div className="space-y-2">
            <Label>Material</Label>
            <Select value={selectedMaterial} onValueChange={handleMaterialChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um material" />
              </SelectTrigger>
              <SelectContent>
                {materials.map(material => (
                  <SelectItem key={material.id} value={material.id}>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      <span>{material.title} - {material.subject}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título do Agendamento</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Aula de Matemática - Frações"
            />
          </div>

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
                <p className="text-sm text-gray-600">Série de aulas com período definido</p>
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

            {type === 'multiple' && (
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
            )}
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

          {/* Recorrência para múltiplas aulas */}
          {type === 'multiple' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="recurring"
                  checked={isRecurring}
                  onCheckedChange={setIsRecurring}
                />
                <Label htmlFor="recurring">Aulas recorrentes</Label>
              </div>

              {isRecurring && (
                <div className="space-y-4 pl-6 border-l-2 border-blue-200">
                  <div className="space-y-2">
                    <Label>Frequência</Label>
                    <Select value={frequency} onValueChange={(value: any) => setFrequency(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Diário</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="monthly">Mensal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {frequency === 'weekly' && (
                    <div className="space-y-2">
                      <Label>Dias da Semana</Label>
                      <div className="grid grid-cols-4 gap-2">
                        {weekDays.map(day => (
                          <div
                            key={day.value}
                            className={cn(
                              "p-2 text-center text-sm rounded cursor-pointer transition-colors",
                              selectedDays.includes(day.value)
                                ? "bg-blue-500 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            )}
                            onClick={() => handleDayToggle(day.value)}
                          >
                            {day.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Fim da Recorrência</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(recurrenceEndDate, "dd/MM/yyyy")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={recurrenceEndDate}
                          onSelect={(date) => date && setRecurrenceEndDate(date)}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}
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
