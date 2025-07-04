import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CalendarEvent } from '@/services/supabaseScheduleService';
import { materialService, GeneratedMaterial } from '@/services/materialService';
import { BookOpen, FileText, Users, Sliders, FileText as AtividadeIcon, FileText as AvaliacaoIcon, Calendar as CalendarIcon, Clock, Eye, Download, Edit3, Trash2, Printer, FileDown } from 'lucide-react';
import MaterialModal from './MaterialModal';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { exportService } from '@/services/exportService';

interface LessonModalProps {
  open: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (event: CalendarEvent) => void;
  onRefresh: () => void;
}

const getMaterialTypeIcon = (type: string) => {
  switch (type) {
    case 'plano-de-aula':
      return <BookOpen className="w-4 h-4 text-blue-600" />;
    case 'slides':
      return <Sliders className="w-4 h-4 text-gray-600" />;
    case 'atividade':
      return <AtividadeIcon className="w-4 h-4 text-green-600" />;
    case 'avaliacao':
      return <AvaliacaoIcon className="w-4 h-4 text-purple-600" />;
    default:
      return <FileText className="w-4 h-4 text-gray-400" />;
  }
};

const LessonModal: React.FC<LessonModalProps> = ({ open, onClose, event, onEdit, onDelete, onRefresh }) => {
  const [materials, setMaterials] = useState<GeneratedMaterial[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<GeneratedMaterial | null>(null);
  const [materialModalOpen, setMaterialModalOpen] = useState(false);

  React.useEffect(() => {
    const loadMaterials = async () => {
      if (event && event.material_ids && event.material_ids.length > 0) {
        const allMaterials = await materialService.getMaterials();
        setMaterials(allMaterials.filter(m => event.material_ids?.includes(m.id)));
      } else {
        setMaterials([]);
      }
    };
    if (open) loadMaterials();
  }, [event, open]);

  if (!event) return null;

  // Agrupar disciplinas e turmas dos materiais
  const allDisciplines = materials.map(m => m.subject).filter(Boolean);
  const uniqueDisciplines = Array.from(new Set(allDisciplines));
  const showDiscipline = uniqueDisciplines.length === 1 ? uniqueDisciplines[0] : undefined;
  const allGrades = materials.map(m => m.grade).filter(Boolean);
  const uniqueGrades = Array.from(new Set(allGrades));
  const showGrade = uniqueGrades.length === 1 ? uniqueGrades[0] : undefined;
  // Data formatada
  const dateStr = event.start_date ? new Date(event.start_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '';
  const timeStr = `${event.start_time?.slice(0,5)} - ${event.end_time?.slice(0,5)}`;
  // Recorrência
  const recurrence = event.recurrence;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Aula
            {showDiscipline && (
              <span className="ml-2 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">{showDiscipline}</span>
            )}
            {showGrade && (
              <span className="ml-2 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">{showGrade}</span>
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 mt-4">
          {/* Seção: Dados principais */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-blue-600 font-medium">
              <CalendarIcon className="w-4 h-4" />
              <span>{dateStr}</span>
            </div>
            <div className="flex items-center gap-2 text-green-600 font-medium">
              <Clock className="w-4 h-4" />
              <span>{timeStr}</span>
            </div>
            {event.classroom && (
              <div className="flex items-center gap-2 text-gray-600 font-medium">
                <Users className="w-4 h-4" />
                <span>{event.classroom}</span>
              </div>
            )}
            {recurrence && (
              <div className="flex items-center gap-2 text-purple-600 font-medium">
                <Sliders className="w-4 h-4" />
                <span>
                  {recurrence.frequency === 'weekly' && 'Semanal'}
                  {recurrence.frequency === 'daily' && 'Diária'}
                  {recurrence.frequency === 'monthly' && 'Mensal'}
                  {recurrence.days && recurrence.days.length > 0 && (
                    <> ({recurrence.days.map(d => d.charAt(0).toUpperCase() + d.slice(1,3)).join(', ')})</>
                  )}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-bold text-gray-900 text-lg truncate">{event.title}</span>
          </div>
          {/* Seção: Materiais */}
          {materials.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-gray-700">Materiais vinculados</span>
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost" title="Exportar PDF">
                    <FileDown className="w-5 h-5" />
                  </Button>
                  <Button size="icon" variant="ghost" title="Exportar Word">
                    <FileText className="w-5 h-5" />
                  </Button>
                  <Button size="icon" variant="ghost" title="Exportar PPT">
                    <Sliders className="w-5 h-5" />
                  </Button>
                  <Button size="icon" variant="ghost" title="Imprimir">
                    <Printer className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              {materials.map((mat) => (
                <div key={mat.id} className="flex items-center gap-2 p-2 border rounded bg-gray-50">
                  {getMaterialTypeIcon(mat.type)}
                  <span className="font-medium text-gray-800 flex-1 truncate">{mat.title}</span>
                  <Button variant="outline" size="sm" className="flex items-center gap-2 px-3 py-2 h-10 font-semibold" onClick={() => { setSelectedMaterial(mat); setMaterialModalOpen(true); }}>
                    <Eye className="w-4 h-4" />
                    <span className="ml-1 text-xs font-medium">Ver material</span>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="flex items-center gap-2 px-3 py-2 h-10 font-semibold" title="Exportar">
                        <Download className="w-4 h-4" />
                        <span className="ml-1 text-xs font-medium">Exportar</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={async () => { await exportService.exportToPDF(mat); }}>
                        <Printer className="w-4 h-4 mr-2" /> Imprimir
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={async () => { await exportService.exportToPDF(mat); }}>
                        <FileDown className="w-4 h-4 mr-2" /> PDF
                      </DropdownMenuItem>
                      {mat.type === 'slides' ? (
                        <DropdownMenuItem onClick={async () => { await exportService.exportToPPT(mat); }}>
                          <Sliders className="w-4 h-4 mr-2" /> PPT
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={async () => { await exportService.exportToWord(mat); }}>
                          <FileText className="w-4 h-4 mr-2" /> Word
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
          {/* Seção: Observações */}
          {event.description && (
            <div className="bg-gray-50 rounded p-3 text-gray-700">
              <span className="font-semibold">Observações: </span>{event.description}
            </div>
          )}
          <div className="flex gap-2 mt-6">
            <Button variant="outline" onClick={() => onEdit(event)}>
              <Edit3 className="w-4 h-4 mr-1" /> Editar Aula
            </Button>
            <Button variant="destructive" onClick={() => onDelete(event)}>
              <Trash2 className="w-4 h-4 mr-1" /> Excluir Aula
            </Button>
          </div>
        </div>
        {/* Modal de material */}
        <MaterialModal material={selectedMaterial} open={materialModalOpen} onClose={() => setMaterialModalOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};

export default LessonModal; 