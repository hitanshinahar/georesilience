import { AlertTriangle, AlertCircle, FileText, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { MOCK_ZONES, MOCK_REPORTS, MOCK_IMPACTS } from '@/lib/mock-data';

export function MetricsRow() {
  const criticalZones = MOCK_ZONES.filter(z => z.riskLevel === 'CRITICAL').length;
  const highRiskZones = MOCK_ZONES.filter(z => z.riskLevel === 'HIGH').length;
  const activeReports = MOCK_REPORTS.filter(r => r.status === 'PENDING').length;
  const isolatedPopulation = MOCK_IMPACTS.reduce((acc, impact) => acc + impact.populationAffected, 0);

  const metrics = [
    {
      title: 'Critical Zones',
      value: criticalZones,
      icon: AlertTriangle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
    {
      title: 'High Risk Zones',
      value: highRiskZones,
      icon: AlertCircle,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: 'Active Field Reports',
      value: activeReports,
      icon: FileText,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Isolated Population (Est.)',
      value: isolatedPopulation.toLocaleString(),
      icon: Users,
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
              <h3 className="text-2xl font-bold">{metric.value}</h3>
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
