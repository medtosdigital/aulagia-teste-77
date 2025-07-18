import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router'
import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

interface Material {
  id: string;
  titulo: string;
  disciplina: string;
  serie: string;
  conteudo: string;
  created_at: string;
  tipo_material: string;
}

const MaterialsList = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [supportMaterials, setSupportMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSupportMaterial, setIsLoadingSupportMaterial] = useState(false);
  const { toast } = useToast()
  const supabase = useSupabaseClient()
  const user = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    loadMaterials();
    loadSupportMaterials();
  }, [user, router]);

  const loadMaterials = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('materiais')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'ativo')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar materiais:', error);
        return;
      }

      const materialsData = data?.map(item => ({
        id: item.id,
        titulo: item.titulo,
        disciplina: item.disciplina,
        serie: item.serie,
        conteudo: item.conteudo,
        created_at: item.created_at,
        tipo_material: 'principal'
      })) || [];

      setMaterials(materialsData);
    } catch (error) {
      console.error('Erro ao carregar materiais:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSupportMaterial = async (materialData: any) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return;
    }

    console.log('🎯 Gerando material de apoio para:', materialData);
    setIsLoadingSupportMaterial(true);

    try {
      const supportData = {
        materialType: 'apoio',
        formData: {
          tema: materialData.tema || 'Tema não especificado',
          disciplina: materialData.disciplina || 'Disciplina não especificada',
          serie: materialData.serie || 'Série não especificada',
          titulo_material_principal: materialData.titulo || 'Material Principal',
          user_id: user.id,
          material_principal_id: materialData.id
        }
      };

      console.log('📋 Dados para enviar:', supportData);

      const { data, error } = await supabase.functions.invoke('gerarMaterialIA', {
        body: supportData
      });

      if (error) {
        console.error('❌ Erro na função:', error);
        throw error;
      }

      if (!data?.success) {
        console.error('❌ Resposta sem sucesso:', data);
        throw new Error(data?.error || 'Erro desconhecido na geração');
      }

      console.log('✅ Material de apoio gerado com sucesso:', data);

      toast({
        title: "Sucesso!",
        description: "Material de apoio gerado com sucesso!",
      });

      // Recarregar a lista de materiais de apoio
      await loadSupportMaterials();

    } catch (error: any) {
      console.error('❌ Erro ao gerar material de apoio:', error);
      toast({
        title: "Erro",
        description: error.message || "Falha ao gerar material de apoio",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSupportMaterial(false);
    }
  };

  const loadSupportMaterials = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('materiais_apoio' as any)
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'ativo')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar materiais de apoio:', error);
        return;
      }

      const supportMaterialsData = data?.map((item: any) => ({
        id: item.id,
        titulo: item.titulo || 'Material de Apoio',
        disciplina: item.disciplina || 'Não especificada',
        serie: item.turma || 'Não especificada',
        conteudo: item.conteudo,
        created_at: item.created_at,
        tipo_material: 'apoio'
      })) || [];

      setSupportMaterials(supportMaterialsData);
    } catch (error) {
      console.error('Erro ao carregar materiais de apoio:', error);
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-4">Meus Materiais</h1>
      <Separator className="mb-4" />

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle><Skeleton /></CardTitle>
                <CardDescription><Skeleton /></CardDescription>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-[80%]" />
                <Skeleton className="h-4 w-[50%]" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle><Skeleton /></CardTitle>
                <CardDescription><Skeleton /></CardDescription>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-[80%]" />
                <Skeleton className="h-4 w-[50%]" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle><Skeleton /></CardTitle>
                <CardDescription><Skeleton /></CardDescription>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-[80%]" />
                <Skeleton className="h-4 w-[50%]" />
              </CardContent>
            </Card>
          </>
        ) : materials.length > 0 ? (
          materials.map(material => (
            <Card key={material.id}>
              <CardHeader>
                <CardTitle>{material.titulo}</CardTitle>
                <CardDescription>
                  {material.disciplina} - {material.serie}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Criado em: {format(new Date(material.created_at), 'dd/MM/yyyy', { locale: ptBR })}</p>
                <div className="flex justify-between items-center mt-4">
                  <Link href={`/material/${material.id}`} className="text-blue-500 hover:underline">
                    Visualizar
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => generateSupportMaterial(material)}
                    disabled={isLoadingSupportMaterial}
                  >
                    {isLoadingSupportMaterial ? 'Gerando...' : 'Gerar Material de Apoio'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center">
            <p>Nenhum material criado ainda.</p>
          </div>
        )}
      </div>

      <h2 className="text-2xl font-bold mt-8 mb-4">Materiais de Apoio Gerados</h2>
      <Separator className="mb-4" />

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {supportMaterials.length > 0 ? (
          supportMaterials.map(material => (
            <Card key={material.id}>
              <CardHeader>
                <CardTitle>{material.titulo}</CardTitle>
                <CardDescription>
                  {material.disciplina} - {material.serie}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Criado em: {format(new Date(material.created_at), 'dd/MM/yyyy', { locale: ptBR })}</p>
                <Link href={`/material/${material.id}`} className="text-blue-500 hover:underline">
                  Visualizar
                </Link>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center">
            <p>Nenhum material de apoio gerado ainda.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialsList;
