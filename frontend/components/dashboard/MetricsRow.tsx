import { AlertTriangle, AlertCircle, Bell, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export interface MetricsRowProps {
  activeIncidents: number;
  criticalIncidents: number;
  activeAlerts: number;
  pendingReviews: number;
  loading?: boolean;
}

export function MetricsRow({ activeIncidents, criticalIncidents, activeAlerts, pendingReviews, loading }: MetricsRowProps) {
  const metrics = [
    {
      title: 'Active Incidents',
      value: activeIncidents,
      icon: AlertTriangle,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: 'Critical/High Risk Incidents',
      value: criticalIncidents,
      icon: AlertCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
    {
      title: 'Active Alerts',
      value: activeAlerts,
      icon: Bell,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Pending Human Reviews',
      value: pendingReviews,
      icon: Eye,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      {metrics.map((metric) => (
        <Card key={metric.title} className="bg-background/60 border-border/50 backdrop-blur">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">{metric.title}</p>
              {loading ? (
                <div className="h-8 w-16 bg-muted/50 rounded animate-pulse" />
              ) : (
                <h3 className="text-2xl font-bold">{metric.value}</h3>
              )}
            </div>
            <div className={`p-3 rounded-full ${metric.bgColor}`}>
              <metric.icon className={`w-5 h-5 ${metric.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
