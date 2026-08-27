"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Alert } from '@/types';
import { Bell, Clock, MapPin, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';

const severityColors: Record<string, string> = {
  RED: 'bg-red-500/15 text-red-500 border-red-500/40',
  ORANGE: 'bg-orange-500/15 text-orange-500 border-orange-500/40',
  YELLOW: 'bg-amber-500/15 text-amber-500 border-amber-500/40',
};

export default function SentinelAlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await api.getAlerts({ status: 'ACTIVE' });
        setAlerts(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 space-y-4">
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Bell className="w-5 h-5" /> Active Alerts
        </h1>
        <p className="text-xs text-muted-foreground mt-1">Real-time risk warnings for your area.</p>
      </div>

      {loading ? (
        <div className="text-center py-10 text-muted-foreground text-sm animate-pulse">Loading alerts...</div>
      ) : alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <div className="bg-emerald-500/10 p-4 rounded-full">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <div>
            <h3 className="font-semibold text-emerald-500">All Clear</h3>
            <p className="text-xs text-muted-foreground mt-1">There are no active alerts in your area right now.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map(alert => (
            <Card key={alert.alert_id} className={`bg-background/80 border ${alert.severity === 'RED' ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.15)]' : 'border-border/50'}`}>
              <CardContent className="p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <Badge variant="outline" className={`text-xs ${severityColors[alert.severity] || ''}`}>
                    {alert.severity} ALERT
                  </Badge>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                  </span>
                </div>
                
                <div>
                  <h3 className="font-bold text-sm leading-tight">{alert.title}</h3>
                  {alert.target_area && (
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
                      <MapPin className="w-3 h-3" /> {alert.target_area}
                    </div>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md">
                  {alert.message}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
