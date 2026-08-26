import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PriorityIncident } from '@/types';
import { Activity } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface PriorityIncidentsProps {
  incidents: PriorityIncident[];
  onSelectIncident: (zoneId: string) => void;
}

export function PriorityIncidents({ incidents, onSelectIncident }: PriorityIncidentsProps) {
  return (
    <Card className="h-full bg-background/60 border-border/50 backdrop-blur flex flex-col overflow-hidden">
      <CardHeader className="py-3 px-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center">
            <Activity className="w-4 h-4 mr-2 text-primary" />
            Priority Action Queue
          </CardTitle>
          <Badge variant="secondary" className="text-xs">{incidents.length} Active</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-auto">
        <div className="divide-y divide-border/50">
          {incidents.map((incident, index) => (
            <div 
              key={incident.id} 
              className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => onSelectIncident(incident.zoneId)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground">0{index + 1}</span>
                  <span className="font-medium text-sm">{incident.zoneName}</span>
                </div>
                <Badge variant="outline" className={
                  incident.status === 'CRITICAL' ? 'border-red-500/50 text-red-500' : 'border-orange-500/50 text-orange-500'
                }>
                  {incident.status}
                </Badge>
              </div>
              
              <div className="space-y-3 mt-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Risk Score</span>
                    <span className="font-medium">{incident.riskScore}%</span>
                  </div>
                  <Progress value={incident.riskScore} className={`h-1.5 ${incident.status === 'CRITICAL' ? '[&>div]:bg-red-500' : '[&>div]:bg-orange-500'}`} />
                </div>
                
                <div className="flex items-center justify-between text-xs pt-2 border-t border-border/50">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">Priority Score</span>
                    <span className="font-semibold text-primary">{incident.priorityScore}/100</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-muted-foreground">Connectivity Impact</span>
                    <span className="font-medium">{incident.connectivityScore}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
