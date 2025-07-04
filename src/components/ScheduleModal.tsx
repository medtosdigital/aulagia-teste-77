import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock, MapPin, Book, FileText, FileQuestion, Monitor, Search } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { scheduleService, ScheduleEvent } from '@/services/scheduleService';
import { materialService, GeneratedMaterial } from '@/services/materialService';
import { toast } from 'sonner';
import { activityService } from '@/services/activityService';
import { useSupabaseSchedule } from '@/hooks/useSupabaseSchedule';
import { CalendarEvent } from '@/services/supabaseScheduleService';

interface ScheduleModalProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  event?: CalendarEvent | null;
  selectedDate?: Date;
  startDate?: Date;
  endDate?: Date;
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({
  open,
  onClose,
  onSave,
  event,
  selectedDate,
  startDate: propStartDate,
  endDate: propEndDate
}) => {
  const [materials, setMaterials] = useState<GeneratedMaterial[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'aula' | 'avaliacao'>('aula');
  const [startDate, setStartDate] = useState<Date>(propStartDate || selectedDate || new Date());
  const [endDate, setEndDate] = useState<Date>(propEndDate || selectedDate || new Date());
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:00');
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<Date>(new Date());
  const [description, setDescription] = useState('');
  const [classroom, setClassroom] = useState('');
  const [step, setStep] = useState(1);
  const [scheduleType, setScheduleType] = useState<'unica' | 'recorrente'>('unica');

  const { saveEvent, updateEvent } = useSupabaseSchedule();

  // Filtros de pesquisa para materiais
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterDiscipline, setFilterDiscipline] = useState('');
  const [filterClass, setFilterClass] = useState('');

  // Gerar listas únicas para filtros
  const materialTypes = useMemo(() => Array.from(new Set(materials.map(m => m.type))), [materials]);
  const materialDisciplines = useMemo(() => Array.from(new Set(materials.map(m => m.subject).filter(Boolean))), [materials]);
  const materialClasses = useMemo(() => Array.from(new Set(materials.map(m => m.grade).filter(Boolean))), [materials]);

  // Filtragem dos materiais
  const filteredMaterials = useMemo(() => {
    return materials.filter(m => {
      const matchesSearch = m.title.toLowerCase().includes(search.toLowerCase());
      const matchesType = !filterType || m.type === filterType;
      const matchesDiscipline = !filterDiscipline || m.subject === filterDiscipline;
      const matchesClass = !filterClass || m.grade === filterClass;
      return matchesSearch && matchesType && matchesDiscipline && matchesClass;
    });
  }, [materials, search, filterType, filterDiscipline, filterClass]);

  const weekDays = [
    { value: 'monday', label: 'Segunda' },
    { value: 'tuesday', label: 'Terça' },
    { value: 'wednesday', label: 'Quarta' },
    { value: 'thursday', label: 'Quinta' },
    { value: 'friday', label: 'Sexta' },
    { value: 'saturday', label: 'Sábado' },
    { value: 'sunday', label: 'Domingo' }
  ];

  // No início do componente, definir as opções de tipo de agendamento
  const eventTypes = [
    { value: 'aula', label: 'Aula' },
    { value: 'avaliacao', label: 'Avaliação' },
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
      setSelectedMaterials(Array.isArray(event.material_ids) ? event.material_ids : []);
      setTitle(event.title);
      setType(event.event_type === 'avaliacao' ? 'avaliacao' : 'aula');
      setStartDate(propStartDate || (event.start_date ? new Date(event.start_date) : new Date()));
      setEndDate(propEndDate || (event.end_date ? new Date(event.end_date) : new Date()));
      setStartTime(event.start_time);
      setEndTime(event.end_time);
      setDescription(event.description || '');
      setClassroom(event.classroom || '');
      setScheduleType(event.schedule_type || 'unica');
      if (event.recurrence) {
        setIsRecurring(true);
        setFrequency(event.recurrence.frequency);
        setSelectedDays(event.recurrence.days || []);
        setRecurrenceEndDate(event.recurrence.endDate ? new Date(event.recurrence.endDate) : new Date());
      }
    } else {
      setSelectedMaterials([]);
      setTitle('');
      setType('aula');
      setStartDate(propStartDate || selectedDate || new Date());
      setEndDate(propEndDate || selectedDate || new Date());
      setStartTime('08:00');
      setEndTime('09:00');
      setIsRecurring(false);
      setFrequency('weekly');
      setSelectedDays([]);
      setRecurrenceEndDate(new Date());
      setDescription('');
      setClassroom('');
      setScheduleType('unica');
    }
  }, [event, selectedDate, open, propStartDate, propEndDate]);

  const handleMaterialToggle = (materialId: string) => {
    setSelectedMaterials(prev =>
      prev.includes(materialId)
        ? prev.filter(id => id !== materialId)
        : [...prev, materialId]
    );
  };

  // Função robusta para garantir data local (sem UTC)
  function formatDateOnly(date: Date) {
    // Atenção: NÃO use toISOString ou métodos que convertem para UTC!
    // Sempre use os valores locais do objeto Date
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
    const selectedMaterialsData = materials.filter(m => selectedMaterials.includes(m.id));
    const eventData = {
      material_ids: selectedMaterials,
      title,
      event_type: type,
      schedule_type: scheduleType,
      start_date: formatDateOnly(startDate),
      end_date: formatDateOnly(startDate),
      start_time: startTime,
      end_time: endTime,
      description,
      classroom,
      recurrence: null
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

  // Função utilitária para ícone do material (tipo)
  function getMaterialTypeIcon(type: string) {
    switch (type) {
      case 'plano-de-aula':
        return <Book className="w-6 h-6 text-blue-500" />;
      case 'slides':
        return <Monitor className="w-6 h-6 text-purple-500" />;
      case 'atividade':
        return <FileQuestion className="w-6 h-6 text-green-500" />;
      case 'avaliacao':
        return <FileText className="w-6 h-6 text-orange-500" />;
      default:
        return <FileText className="w-6 h-6 text-gray-400" />;
    }
  }

  const handleDayToggle = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  // Validação do passo 1
  const canGoNext = title.trim().length > 0 && selectedMaterials.length > 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-0 sm:p-6">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Agendar Aula
          </DialogTitle>
        </DialogHeader>
        <div className="divide-y divide-gray-100">
          {/* Passo 1: Título e Materiais */}
          {step === 1 && (
            <div className="space-y-2 px-6 py-6 bg-gray-50 rounded-lg">
              <div className="flex flex-col sm:flex-row sm:items-end gap-2 mb-6">
                <div className="flex-1">
                  <Label className="font-medium">Título da Aula</Label>
                  <Input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Ex: Aula de Geometria, Revisão de Prova, etc."
                  />
                </div>
                <div className="flex flex-col justify-end min-w-[140px]">
                  <Label className="font-medium mb-1">Tipo</Label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as any)}
                    className="h-10 px-3 rounded-lg border border-gray-200 bg-white focus:border-blue-200 focus:ring-2 focus:ring-blue-100 text-sm outline-none transition w-full"
                  >
                    {eventTypes.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              {/* Texto orientativo acima do campo de busca/filtros */}
              <div className="mb-2">
                <div className="font-semibold text-base text-gray-800">Escolha os materiais para a aula</div>
                <div className="text-sm text-gray-500">Selecione 1 ou mais materiais que serão utilizados nesta aula.</div>
              </div>
              {/* Campo de pesquisa/filtros ajustado: input à esquerda, filtros à direita */}
              <div className="w-full bg-white rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center gap-2 p-2 mb-4 overflow-x-auto max-w-full">
                <div className="relative flex-1 min-w-0 order-1 sm:order-none">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Search className="w-5 h-5" />
                  </span>
                  <input
                    type="text"
                    placeholder="Buscar por título ou disciplina..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-10 pr-2 w-full h-10 rounded-lg border border-transparent bg-gray-50 focus:bg-white focus:border-blue-200 focus:ring-2 focus:ring-blue-100 text-sm placeholder:text-gray-400 outline-none transition"
                  />
                </div>
                <div className="flex gap-2 min-w-0 order-2 sm:order-none sm:ml-2">
                  <select
                    value={filterType}
                    onChange={e => setFilterType(e.target.value)}
                    className="h-10 px-3 rounded-lg border border-transparent bg-gray-50 focus:bg-white focus:border-blue-200 focus:ring-2 focus:ring-blue-100 text-sm outline-none transition min-w-[90px] max-w-[120px]"
                  >
                    <option value="">Tipos</option>
                    {materialTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <select
                    value={filterDiscipline}
                    onChange={e => setFilterDiscipline(e.target.value)}
                    className="h-10 px-3 rounded-lg border border-transparent bg-gray-50 focus:bg-white focus:border-blue-200 focus:ring-2 focus:ring-blue-100 text-sm outline-none transition min-w-[110px] max-w-[140px]"
                  >
                    <option value="">Disciplinas</option>
                    {materialDisciplines.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
              {/* Lista de materiais filtrados - cards organizados */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-x-hidden max-w-full">
                {filteredMaterials.length === 0 && (
                  <div className="text-gray-400 text-sm col-span-full">Nenhum material encontrado.</div>
                )}
                {filteredMaterials.map(material => (
                  <label
                    key={material.id}
                    className={cn(
                      "flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all shadow-sm bg-white hover:bg-gray-50",
                      selectedMaterials.includes(material.id)
                        ? "border-blue-500 ring-2 ring-blue-200"
                        : "border-gray-200"
                    )}
                    style={{ minHeight: 64 }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedMaterials.includes(material.id)}
                      onChange={() => handleMaterialToggle(material.id)}
                      className="accent-blue-500 mt-0.5"
                    />
                    <div className="flex items-center justify-center w-10 h-10 rounded bg-gray-100">
                      {getMaterialTypeIcon(material.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate text-base">{material.title}</div>
                      <div className="flex flex-wrap gap-2 mt-1 items-center">
                        {material.subject && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">{material.subject}</span>}
                        {material.grade && <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium">{material.grade}</span>}
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-medium ml-auto">{material.type}</span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex justify-end mt-6">
                <Button onClick={() => setStep(2)} disabled={!canGoNext} className="px-8 py-3 text-base h-12 min-w-[120px]">
                  Próximo
                </Button>
          </div>
          </div>
          )}
          {/* Passo 2: Detalhes do agendamento */}
          {step === 2 && (
            <div className="space-y-6 px-6 py-6">
          {/* Tipo de Agendamento */}
          <div className="space-y-3">
            <Label>Tipo de Agendamento</Label>
            <div className="grid grid-cols-2 gap-4">
              <div 
                className={cn(
                  "p-4 border rounded-lg cursor-pointer transition-colors",
                  scheduleType === 'unica' ? "border-blue-500 bg-blue-50" : "border-gray-200"
                )}
                onClick={() => setScheduleType('unica')}
              >
                <h4 className="font-medium">Única</h4>
                <p className="text-sm text-gray-600">Uma única aula em data específica</p>
              </div>
              <div 
                className={cn(
                  "p-4 border rounded-lg cursor-pointer transition-colors",
                  scheduleType === 'recorrente' ? "border-blue-500 bg-blue-50" : "border-gray-200"
                )}
                onClick={() => setScheduleType('recorrente')}
              >
                <h4 className="font-medium">Recorrente</h4>
                <p className="text-sm text-gray-600">Aulas em múltiplas datas (ex: seg, qua, sex)</p>
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
          {/* Sala de Aula e Observações */}
              <div className="space-y-6 bg-gray-50 p-4 rounded-lg">
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
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Voltar
          </Button>
          <Button onClick={handleSave}>
            {event ? 'Atualizar' : 'Criar'} Agendamento
          </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleModal;
