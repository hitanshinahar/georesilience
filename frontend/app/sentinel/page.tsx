"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, MapPin, Bell, ChevronRight, Activity, Camera } from 'lucide-react';

export default function SentinelHome() {
  const [activeAlerts, setActiveAlerts] = useState(0);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const alerts = await api.getAlerts({ status: 'ACTIVE' });
        setActiveAlerts(alerts.length);
      } catch (e) {
        console.error(e);
      }
    };
    fetchAlerts();
  }, []);

  return (
    <div className="p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2 text-orange-500 font-bold tracking-tight">
          <ShieldAlert className="w-5 h-5" />
          <span>Field Sentinel</span>
        </div>
        <div className="flex items-center text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
          <MapPin className="w-3 h-3 mr-1 text-primary" /> Gangtok
        </div>
      </div>

      {/* Local Risk Status */}
      <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30 overflow-hidden">
        <CardContent className="p-5 flex flex-col gap-3 relative">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-500/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-orange-500 uppercase tracking-wider">Local Risk Level</p>
              <h2 className="text-3xl font-bold mt-1">ELEVATED</h2>
            </div>
            <div className="bg-orange-500/20 p-2 rounded-full">
              <Activity className="w-6 h-6 text-orange-500" />
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mt-2">
            Recent rainfall has increased landslide susceptibility in your sector. Stay alert and report any ground anomalies.
          </p>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 mt-2">
        <Link href="/sentinel/report" className="flex-1">
          <Card className="h-full bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20 transition-colors active:scale-95 duration-150 cursor-pointer">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2 h-full">
              <div className="bg-blue-500/20 p-3 rounded-full">
                <Camera className="w-6 h-6 text-blue-400" />
              </div>
              <span className="font-semibold text-sm text-blue-100">Submit Report</span>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/sentinel/alerts" className="flex-1">
          <Card className="h-full bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20 transition-colors active:scale-95 duration-150 cursor-pointer relative">
            {activeAlerts > 0 && (
              <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {activeAlerts}
              </span>
            )}
            <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2 h-full">
              <div className="bg-amber-500/20 p-3 rounded-full">
                <Bell className="w-6 h-6 text-amber-400" />
              </div>
              <span className="font-semibold text-sm text-amber-100">View Alerts</span>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Link href="/sentinel/safety">
        <Card className="bg-emerald-500/10 border-emerald-500/30 mt-2 hover:bg-emerald-500/20 transition-colors cursor-pointer">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/20 p-2 rounded-full">
                <ShieldAlert className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm">Safety Guidelines</span>
                <span className="text-xs text-muted-foreground">What to do during a landslide</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </CardContent>
        </Card>
      </Link>
      
      {/* Footer Info */}
      <div className="mt-8 mb-4 text-center">
        <p className="text-xs text-muted-foreground">GeoResilience System</p>
        <p className="text-[10px] text-muted-foreground/60 mt-1">Prototype - Not for actual emergencies</p>
      </div>
    </div>
  );
}

