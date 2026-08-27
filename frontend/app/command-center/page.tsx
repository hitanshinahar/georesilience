"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Incident, Alert } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AlertTriangle, Shield, Eye, CheckCircle2, XCircle,
  Bell, ArrowUpRight, Clock, RefreshCw, Activity
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const POLL_INTERVAL = 15000;

const riskColors: Record<string, string> = {
  RED: 'bg-red-500/15 text-red-500 border-red-500/40',
  ORANGE: 'bg-orange-500/15 text-orange-500 border-orange-500/40',
  YELLOW: 'bg-amber-500/15 text-amber-500 border-amber-500/40',
  GREEN: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/40',
};

const statusColors: Record<string, string> = {
  OPEN: 'bg-blue-500/15 text-blue-400 border-blue-500/40',
  UNDER_REVIEW: 'bg-orange-500/15 text-orange-400 border-orange-500/40',
  FIELD_VERIFIED: 'bg-teal-500/15 text-teal-400 border-teal-500/40',
  ESCALATED: 'bg-red-500/15 text-red-400 border-red-500/40',
  RESOLVED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40',
  DISMISSED: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/40',
};

const alertSeverityColors: Record<string, string> = {
  RED: 'bg-red-500/15 text-red-400 border-red-500/40',
  ORANGE: 'bg-orange-500/15 text-orange-400 border-orange-500/40',
  YELLOW: 'bg-amber-500/15 text-amber-400 border-amber-500/40',
};

export default function CommandCenterPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [reviewFilter, setReviewFilter] = useState<string>('all');

  const fetchData = useCallback(async () => {
    try {
      const filters: Record<string, string | boolean> = {};
      if (riskFilter !== 'all') filters.risk_level = riskFilter;
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (reviewFilter === 'yes') filters.requires_human_review = true;
      if (reviewFilter === 'no') filters.requires_human_review = false;

      const [incData, alertData] = await Promise.all([
        api.getIncidents(filters as Record<string, unknown>),
        api.getAlerts(),
      ]);
      setIncidents(incData);
      setAlerts(alertData);
    } catch (e) {
      console.error('Failed to fetch command center data:', e);
    } finally {
      setLoading(false);
    }
  }, [riskFilter, statusFilter, reviewFilter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
    const interval = setInterval(fetchData, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  const activeIncidents = incidents.filter(i => !['RESOLVED', 'DISMISSED'].includes(i.status));
  const criticalIncidents = incidents.filter(i => i.risk_level === 'RED' && !['RESOLVED', 'DISMISSED'].includes(i.status));
  const reviewIncidents = incidents.filter(i => i.status === 'UNDER_REVIEW');
  const resolvedIncidents = incidents.filter(i => i.status === 'RESOLVED');
  const activeAlerts = alerts.filter(a => a.status === 'ACTIVE');

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await api.acknowledgeAlert(alertId);
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      await api.resolveAlert(alertId);
      fetchData();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Operations Command Center</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time incident monitoring and response coordination</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} className="gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Active Incidents', value: activeIncidents.length, icon: Activity, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Critical', value: criticalIncidents.length, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
          { label: 'Under Review', value: reviewIncidents.length, icon: Eye, color: 'text-orange-400', bg: 'bg-orange-500/10' },
          { label: 'Resolved', value: resolvedIncidents.length, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Active Alerts', value: activeAlerts.length, icon: Bell, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        ].map(m => (
          <Card key={m.label} className="bg-background/60 border-border/50">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{m.label}</p>
                <p className="text-2xl font-bold mt-1">{m.value}</p>
              </div>
              <div className={`p-2.5 rounded-full ${m.bg}`}>
                <m.icon className={`w-5 h-5 ${m.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="incidents" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="incidents" className="gap-2"><Shield className="w-4 h-4" /> Incident Queue</TabsTrigger>
          <TabsTrigger value="alerts" className="gap-2"><Bell className="w-4 h-4" /> Alert Center</TabsTrigger>
        </TabsList>

        {/* Incident Queue Tab */}
        <TabsContent value="incidents" className="space-y-4">
          <div className="flex flex-wrap gap-3 items-center">
            <Select value={riskFilter} onValueChange={(v: string | null) => setRiskFilter(v || 'all')}>
              <SelectTrigger className="w-40 h-9 text-xs"><SelectValue placeholder="Risk Level" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="RED">RED</SelectItem>
                <SelectItem value="ORANGE">ORANGE</SelectItem>
                <SelectItem value="YELLOW">YELLOW</SelectItem>
                <SelectItem value="GREEN">GREEN</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v: string | null) => setStatusFilter(v || 'all')}>
              <SelectTrigger className="w-44 h-9 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                <SelectItem value="FIELD_VERIFIED">Verified</SelectItem>
                <SelectItem value="ESCALATED">Escalated</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
                <SelectItem value="DISMISSED">Dismissed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={reviewFilter} onValueChange={(v: string | null) => setReviewFilter(v || 'all')}>
              <SelectTrigger className="w-44 h-9 text-xs"><SelectValue placeholder="Human Review" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="yes">Needs Review</SelectItem>
                <SelectItem value="no">No Review</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card className="bg-background/60 border-border/50">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead className="text-xs">ID</TableHead>
                  <TableHead className="text-xs">Location</TableHead>
                  <TableHead className="text-xs">Risk</TableHead>
                  <TableHead className="text-xs">Score</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Review</TableHead>
                  <TableHead className="text-xs">Updated</TableHead>
                  <TableHead className="text-xs"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">Loading incidents...</TableCell></TableRow>
                ) : incidents.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No incidents found</TableCell></TableRow>
                ) : incidents.map(inc => (
                  <TableRow key={inc.incident_id} className="border-border/30 hover:bg-muted/30 cursor-pointer">
                    <TableCell className="font-mono text-xs text-muted-foreground">{inc.incident_id}</TableCell>
                    <TableCell className="text-sm font-medium">{inc.location_name || `${inc.latitude.toFixed(4)}, ${inc.longitude.toFixed(4)}`}</TableCell>
                    <TableCell><Badge variant="outline" className={`text-xs ${riskColors[inc.risk_level] || ''}`}>{inc.risk_level}</Badge></TableCell>
                    <TableCell className="font-mono text-sm">{Math.round(inc.risk_score * 100)}%</TableCell>
                    <TableCell><Badge variant="outline" className={`text-xs ${statusColors[inc.status] || ''}`}>{inc.status.replace('_', ' ')}</Badge></TableCell>
                    <TableCell>
                      {inc.requires_human_review ? (
                        <Badge variant="outline" className="text-xs bg-orange-500/10 text-orange-400 border-orange-500/30">
                          <Eye className="w-3 h-3 mr-1" /> Required
                        </Badge>
                      ) : <span className="text-xs text-muted-foreground">--</span>}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {formatDistanceToNow(new Date(inc.updated_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <Link href={`/incidents/${inc.incident_id}`}>
                        <Button variant="ghost" size="sm" className="gap-1 text-xs">
                          Open <ArrowUpRight className="w-3 h-3" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Alert Center Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <Card className="bg-background/60 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" /> Active Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {alerts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No alerts</p>
              ) : alerts.map(alert => (
                <div key={alert.alert_id} className="p-4 rounded-lg border border-border/50 bg-muted/10 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={alertSeverityColors[alert.severity] || ''}>
                          {alert.severity}
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${alert.status === 'ACTIVE' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : alert.status === 'ACKNOWLEDGED' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}`}>
                          {alert.status}
                        </Badge>
                      </div>
                      <h3 className="font-medium text-sm">{alert.title}</h3>
                      <p className="text-xs text-muted-foreground">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    {alert.status === 'ACTIVE' && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => handleAcknowledgeAlert(alert.alert_id)}>
                          Acknowledge
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => handleResolveAlert(alert.alert_id)}>
                          Resolve
                        </Button>
                      </div>
                    )}
                    {alert.status === 'ACKNOWLEDGED' && (
                      <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => handleResolveAlert(alert.alert_id)}>
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
