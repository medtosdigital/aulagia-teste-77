import React from 'react';
    import { useParams, useNavigate } from 'react-router-dom';
    import { ArrowLeft, Download, Edit, Trash2, FileText, Presentation, ClipboardList, GraduationCap } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { Badge } from '@/components/ui/badge';
    import { Separator } from '@/components/ui/separator';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { toast } from 'sonner';
    import { materialService, type GeneratedMaterial, type LessonPlan, type Activity, type Slide, type Assessment } from '@/services/materialService';
    import { exportService } from '@/services/exportService';
    import MaterialEditModal from './MaterialEditModal';

    const MaterialViewer = () => {
      // ... (código anterior mantido)

      const renderLessonPlan = (content: LessonPlan) => (
        <div className="space-y-6">
          {/* ... (outras seções mantidas) */}

          <div>
            <h4 className="font-semibold text-sm text-gray-600 mb-3">Desenvolvimento da Aula</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Etapa</TableHead>
                  <TableHead>Atividade</TableHead>
                  <TableHead>Tempo</TableHead>
                  <TableHead>Recursos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {content.desenvolvimento.map((etapa, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{etapa.etapa}</TableCell>
                    <TableCell>{etapa.atividade}</TableCell>
                    <TableCell>{etapa.tempo}</TableCell>
                    <TableCell>
                      <ul className="space-y-1">
                        {etapa.recursos.map((recurso, i) => (
                          <li key={i} className="flex items-start">
                            <span className="text-blue-500 font-bold mr-2">•</span>
                            <span className="text-sm">{recurso}</span>
                          </li>
                        ))}
                      </ul>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* ... (código posterior mantido) */}
        </div>
      );

      // ... (restante do código mantido)
    };

    export default MaterialViewer;
