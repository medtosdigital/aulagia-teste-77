import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { MaterialFixer } from '@/utils/materialFixer';
import { toast } from 'sonner';
import { Wrench, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface MaterialFixerComponentProps {
  onComplete?: () => void;
}

const MaterialFixerComponent: React.FC<MaterialFixerComponentProps> = ({ onComplete }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState('');
  const [options, setOptions] = useState({
    fixObjectives: true,
    fixSkills: true,
    fixReferences: true,
    fixDevelopment: true
  });

  const handleFixMaterials = async () => {
    setIsRunning(true);
    setProgress(0);
    setCurrentTask('Iniciando correção de materiais...');

    try {
      // Simular progresso
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      setCurrentTask('Corrigindo objetivos...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      setCurrentTask('Corrigindo habilidades BNCC...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      setCurrentTask('Corrigindo referências ABNT...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      setCurrentTask('Corrigindo desenvolvimento...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Executar correção real
      setCurrentTask('Aplicando correções...');
      await MaterialFixer.fixExistingMaterials(options);

      clearInterval(progressInterval);
      setProgress(100);
      setCurrentTask('Correção concluída!');

      toast.success('Materiais corrigidos com sucesso!', {
        description: 'Todos os problemas identificados foram corrigidos.'
      });

      if (onComplete) {
        onComplete();
      }

    } catch (error) {
      console.error('Error fixing materials:', error);
      toast.error('Erro ao corrigir materiais', {
        description: 'Ocorreu um erro durante a correção. Tente novamente.'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleOptionChange = (option: keyof typeof options) => {
    setOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          Corretor de Materiais
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Este utilitário corrige problemas comuns nos materiais existentes:
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="fixObjectives"
                checked={options.fixObjectives}
                onCheckedChange={() => handleOptionChange('fixObjectives')}
              />
              <Label htmlFor="fixObjectives" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Corrigir objetivos não salvos
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="fixSkills"
                checked={options.fixSkills}
                onCheckedChange={() => handleOptionChange('fixSkills')}
              />
              <Label htmlFor="fixSkills" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Corrigir códigos de habilidades BNCC
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="fixReferences"
                checked={options.fixReferences}
                onCheckedChange={() => handleOptionChange('fixReferences')}
              />
              <Label htmlFor="fixReferences" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Formatar referências em ABNT
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="fixDevelopment"
                checked={options.fixDevelopment}
                onCheckedChange={() => handleOptionChange('fixDevelopment')}
              />
              <Label htmlFor="fixDevelopment" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Melhorar desenvolvimento da aula
              </Label>
            </div>
          </div>
        </div>

        {isRunning && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm font-medium">{currentTask}</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        <div className="flex gap-3">
          <Button
            onClick={handleFixMaterials}
            disabled={isRunning}
            className="flex-1"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Corrigindo...
              </>
            ) : (
              <>
                <Wrench className="h-4 w-4 mr-2" />
                Corrigir Materiais
              </>
            )}
          </Button>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Importante:</p>
              <ul className="space-y-1 text-xs">
                <li>• Esta operação corrige todos os planos de aula existentes</li>
                <li>• As correções são aplicadas automaticamente</li>
                <li>• Recomenda-se fazer backup antes de executar</li>
                <li>• O processo pode levar alguns minutos</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MaterialFixerComponent; 