
import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { templateService, type Template } from '@/services/templateService';
import { toast } from 'sonner';

const TemplateAdmin: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>(templateService.getTemplates());
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este template?')) {
      const success = templateService.deleteTemplate(id);
      if (success) {
        setTemplates(templateService.getTemplates());
        toast.success('Template excluído com sucesso!');
      } else {
        toast.error('Erro ao excluir template');
      }
    }
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      'plano-de-aula': 'Plano de Aula',
      'slides': 'Slides',
      'atividade': 'Atividade',
      'avaliacao': 'Avaliação'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      'plano-de-aula': 'bg-blue-100 text-blue-800',
      'slides': 'bg-green-100 text-green-800',
      'atividade': 'bg-yellow-100 text-yellow-800',
      'avaliacao': 'bg-purple-100 text-purple-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gerenciar Templates</h1>
        <Button onClick={() => setIsEditing(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <Badge className={getTypeColor(template.type)}>
                  {getTypeLabel(template.type)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Variáveis: {template.variables.length}
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Criado em: {new Date(template.createdAt).toLocaleDateString('pt-BR')}
              </p>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTemplate(template)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Ver
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedTemplate(template);
                    setIsEditing(true);
                  }}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(template.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Template Preview Modal */}
      {selectedTemplate && !isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{selectedTemplate.name}</h2>
              <Button
                variant="outline"
                onClick={() => setSelectedTemplate(null)}
              >
                Fechar
              </Button>
            </div>
            
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Variáveis disponíveis:</h3>
              <div className="flex flex-wrap gap-2">
                {selectedTemplate.variables.map((variable) => (
                  <Badge key={variable} variant="secondary">
                    {`{{${variable}}}`}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">HTML Template:</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
                {selectedTemplate.htmlContent}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Template Editor Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {selectedTemplate ? 'Editar Template' : 'Novo Template'}
              </h2>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setSelectedTemplate(null);
                }}
              >
                Cancelar
              </Button>
            </div>
            
            <div className="text-center text-gray-600">
              <p>Editor de templates em desenvolvimento...</p>
              <p className="text-sm mt-2">
                Em breve você poderá criar e editar templates HTML personalizados.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateAdmin;
