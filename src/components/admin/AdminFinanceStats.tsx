
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { DollarSign, TrendingUp, Calendar, Users } from 'lucide-react';

interface FinanceData {
  monthlyRevenue: number;
  annualRevenue: number;
  averageRevenuePerUser: number;
  totalPaidUsers: number;
}

interface AdminFinanceStatsProps {
  financeData: FinanceData;
  loading: boolean;
}

export default function AdminFinanceStats({ financeData, loading }: AdminFinanceStatsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Gestão Financeira</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const metrics = [
    {
      label: 'Receita Mensal',
      value: formatCurrency(financeData.monthlyRevenue),
      icon: Calendar,
      color: 'from-green-500 to-green-600',
      textColor: 'text-green-700'
    },
    {
      label: 'Receita Anual',
      value: formatCurrency(financeData.annualRevenue),
      icon: TrendingUp,
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-700'
    },
    {
      label: 'Receita por Usuário',
      value: formatCurrency(financeData.averageRevenuePerUser),
      icon: DollarSign,
      color: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-700'
    },
    {
      label: 'Usuários Pagantes',
      value: financeData.totalPaidUsers.toString(),
      icon: Users,
      color: 'from-orange-500 to-orange-600',
      textColor: 'text-orange-700'
    }
  ];

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg">Gestão Financeira</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="bg-gradient-to-br from-background to-muted/30 rounded-xl p-4 border border-border/50">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${metric.color}`}>
                  <metric.icon className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                <p className={`text-2xl font-bold ${metric.textColor}`}>{metric.value}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
