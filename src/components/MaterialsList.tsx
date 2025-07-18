import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DotsHorizontalIcon, AlertTriangle, RefreshCw, Copy, Edit, Trash2, Eye, Download, Share2 } from "@radix-ui/react-icons"
import { materialService, Material } from '@/services/materialService';
import { usePlanPermissions } from '@/hooks/usePlanPermissions';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { statsService } from '@/services/statsService';
import { useAuth } from '@/contexts/AuthContext';

interface MaterialsListProps {
  searchTerm: string;
  selectedType: string;
  selectedSubject: string;
  selectedGrade: string;
  selectedTemplate: string;
}

interface MaterialTableRow {
  id: string;
  titulo: string;
  tipo: string;
  assunto: string;
  serie: string;
  template: string;
  data_criacao: string;
  data_atualizacao: string;
  acoes: React.ReactNode;
}

const MaterialsList: React.FC<MaterialsListProps> = ({ 
  searchTerm, 
  selectedType, 
  selectedSubject, 
  selectedGrade, 
  selectedTemplate 
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState<Material[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareableLink, setShareableLink] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const { canDownloadWord, canDownloadPPT } = usePlanPermissions();

  const loadMaterials = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const materials = await materialService.getMaterials();
      setData(materials);
    } catch (err) {
      setError('Erro ao carregar materiais.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMaterials();
  }, [loadMaterials]);

  const deleteMaterial = async (id: string) => {
    confirmAlert({
      title: 'Confirmar Exclusão',
      message: 'Tem certeza que deseja excluir este material?',
      buttons: [
        {
          label: 'Sim',
          onClick: async () => {
            try {
              await materialService.deleteMaterial(id);
              setData(prevData => prevData ? prevData.filter(material => material.id !== id) : []);
              toast({
                title: "Material excluído",
                description: "O material foi excluído com sucesso.",
              })
              await statsService.recalculateStats();
            } catch (err) {
              toast({
                variant: "destructive",
                title: "Erro",
                description: "Não foi possível excluir o material.",
              })
              console.error(err);
            }
          }
        },
        {
          label: 'Não',
        }
      ]
    });
  };

  const duplicateMaterial = async (id: string) => {
    try {
      await materialService.duplicateMaterial(id);
      loadMaterials();
      toast({
        title: "Material duplicado",
        description: "O material foi duplicado com sucesso.",
      })
      await statsService.recalculateStats();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível duplicar o material.",
      })
      console.error(err);
    }
  };

  const handleShareClick = async (material: Material) => {
    setSelectedMaterial(material);
    setIsShareDialogOpen(true);

    try {
      const link = await materialService.generateShareableLink(material.id);
      setShareableLink(link);
    } catch (error) {
      console.error("Error generating shareable link:", error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o link compartilhável.",
        variant: "destructive",
      });
      setShareableLink('');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareableLink);
    toast({
      title: "Link copiado",
      description: "O link compartilhável foi copiado para a área de transferência.",
    });
  };

  const columns: ColumnDef<MaterialTableRow>[] = [
    {
      accessorKey: "titulo",
      header: "Título",
    },
    {
      accessorKey: "tipo",
      header: "Tipo",
    },
    {
      accessorKey: "assunto",
      header: "Assunto",
    },
    {
      accessorKey: "serie",
      header: "Série",
    },
    {
      accessorKey: "template",
      header: "Template",
    },
    {
      accessorKey: "data_criacao",
      header: "Criação",
    },
    {
      accessorKey: "data_atualizacao",
      header: "Atualização",
    },
    {
      accessorKey: "acoes",
      header: "Ações",
    },
  ]

  const tableData: MaterialTableRow[] = data
    ? data.filter(material => {
        const searchTermLower = searchTerm.toLowerCase();
        const matchesSearch = material.titulo.toLowerCase().includes(searchTermLower);
        const matchesType = selectedType === '' || material.tipo === selectedType;
        const matchesSubject = selectedSubject === '' || material.assunto === selectedSubject;
        const matchesGrade = selectedGrade === '' || material.serie === selectedGrade;
        const matchesTemplate = selectedTemplate === '' || material.template === selectedTemplate;

        return matchesSearch && matchesType && matchesSubject && matchesGrade && matchesTemplate;
      }).map((material) => ({
        id: material.id,
        titulo: material.titulo,
        tipo: material.tipo,
        assunto: material.assunto,
        serie: material.serie,
        template: material.template,
        data_criacao: format(new Date(material.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
        data_atualizacao: format(new Date(material.updated_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
        acoes: (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <DotsHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/edit-material/${material.id}`)}>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => duplicateMaterial(material.id)}>
                <Copy className="w-4 h-4 mr-2" />
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShareClick(material)}>
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar
              </DropdownMenuItem>
              {canDownloadWord() && (
                <DropdownMenuItem onClick={async () => {
                  try {
                    const blob = await materialService.downloadMaterial(material.id, 'docx');
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${material.titulo}.docx`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                  } catch (error) {
                    console.error("Download error:", error);
                    toast({
                      title: "Erro",
                      description: "Não foi possível baixar o arquivo .docx.",
                      variant: "destructive",
                    });
                  }
                }}>
                  <Download className="w-4 h-4 mr-2" />
                  Baixar .docx
                </DropdownMenuItem>
              )}
              {canDownloadPPT() && (
                <DropdownMenuItem onClick={async () => {
                  try {
                    const blob = await materialService.downloadMaterial(material.id, 'pptx');
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${material.titulo}.pptx`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                  } catch (error) {
                    console.error("Download error:", error);
                    toast({
                      title: "Erro",
                      description: "Não foi possível baixar o arquivo .pptx.",
                      variant: "destructive",
                    });
                  }
                }}>
                  <Download className="w-4 h-4 mr-2" />
                  Baixar .pptx
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => setSelectedMaterialId(material.id)}>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" className="h-8 w-full p-0 text-red-600 focus:text-red-600 justify-start">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação irá excluir o material permanentemente. Tem certeza que deseja continuar?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>
                        Cancelar
                      </AlertDialogCancel>
                      <AlertDialogAction onClick={() => {
                        if (selectedMaterialId) {
                          deleteMaterial(selectedMaterialId);
                          setSelectedMaterialId(null);
                        }
                      }}>
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      }))
    : [];

  const table = useReactTable({
    data: tableData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  // Fix the null data handling in the render section
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-48"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
        <p className="text-red-600 font-medium">Erro ao carregar materiais</p>
        <p className="text-gray-600 text-sm mt-1">{error}</p>
        <Button onClick={loadMaterials} className="mt-4">
          <RefreshCw className="w-4 h-4 mr-2" />
          Tentar Novamente
        </Button>
      </div>
    );
  }

  // Ensure data is not null before using it
  const safeData = data || [];
  const totalMaterials = safeData.length;
  const totalPages = Math.ceil(totalMaterials / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalMaterials);
  const currentMaterials = safeData.slice(startIndex, endIndex);

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : (
                          <div
                            {...{
                              className: header.column.getCanSort()
                                ? "cursor-pointer select-none" : "",
                              onClick: header.column.getToggleSortingHandler(),
                            }}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {
                              {
                                asc: "▲",
                                desc: "▼",
                              }[header.column.getIsSorted() as string]
                            }
                          </div>
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {currentMaterials.map((material) => (
              <TableRow key={material.id}>
                <TableCell>{material.titulo}</TableCell>
                <TableCell>{material.tipo}</TableCell>
                <TableCell>{material.assunto}</TableCell>
                <TableCell>{material.serie}</TableCell>
                <TableCell>{material.template}</TableCell>
                <TableCell>{format(new Date(material.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</TableCell>
                <TableCell>{format(new Date(material.updated_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <DotsHorizontalIcon className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/edit-material/${material.id}`)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => duplicateMaterial(material.id)}>
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleShareClick(material)}>
                        <Share2 className="w-4 h-4 mr-2" />
                        Compartilhar
                      </DropdownMenuItem>
                      {canDownloadWord() && (
                        <DropdownMenuItem onClick={async () => {
                          try {
                            const blob = await materialService.downloadMaterial(material.id, 'docx');
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `${material.titulo}.docx`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            window.URL.revokeObjectURL(url);
                          } catch (error) {
                            console.error("Download error:", error);
                            toast({
                              title: "Erro",
                              description: "Não foi possível baixar o arquivo .docx.",
                              variant: "destructive",
                            });
                          }
                        }}>
                          <Download className="w-4 h-4 mr-2" />
                          Baixar .docx
                        </DropdownMenuItem>
                      )}
                      {canDownloadPPT() && (
                        <DropdownMenuItem onClick={async () => {
                          try {
                            const blob = await materialService.downloadMaterial(material.id, 'pptx');
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `${material.titulo}.pptx`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            window.URL.revokeObjectURL(url);
                          } catch (error) {
                            console.error("Download error:", error);
                            toast({
                              title: "Erro",
                              description: "Não foi possível baixar o arquivo .pptx.",
                              variant: "destructive",
                            });
                          }
                        }}>
                          <Download className="w-4 h-4 mr-2" />
                          Baixar .pptx
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => setSelectedMaterialId(material.id)}>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" className="h-8 w-full p-0 text-red-600 focus:text-red-600 justify-start">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação irá excluir o material permanentemente. Tem certeza que deseja continuar?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>
                                Cancelar
                              </AlertDialogCancel>
                              <AlertDialogAction onClick={() => {
                                if (selectedMaterialId) {
                                  deleteMaterial(selectedMaterialId);
                                  setSelectedMaterialId(null);
                                }
                              }}>
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Anterior
        </Button>
        <span className="text-sm text-gray-500">
          Página {currentPage} de {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Próximo
        </Button>
      </div>

      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Compartilhar Material</DialogTitle>
            <DialogDescription>
              Compartilhe este material com um link.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="link" className="text-right">
                Link
              </Label>
              <Input type="text" id="link" value={shareableLink} readOnly className="col-span-3" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={copyToClipboard}>
              Copiar Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MaterialsList;
