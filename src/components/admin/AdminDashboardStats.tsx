
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Users, Badge, FileText, TrendingUp } from 'lucide-react';

interface AdminDashboardStatsProps {
  metrics: Array<{
    label: string;
    value: number;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }>;
  loading: boolean;
}

export default function AdminDashboardStats({ metrics, loading }: AdminDashboardStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {metrics.map((metric) => (
        <Card key={metric.label} className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                <p className="text-3xl font-bold text-foreground">{metric.value}</p>
              </div>
              <div className={`p-3 rounded-full bg-gradient-to-r ${metric.color}`}>
                <metric.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
