"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Incident } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUpRight, Clock, RefreshCw, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const filters: Record<string, string> = {};
      if (riskFilter !== 'all') filters.risk_level = riskFilter;
      if (statusFilter !== 'all') filters.status = statusFilter;
      
      const data = await api.getIncidents(filters as Record<string, unknown>);
      setIncidents(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchIncidents();
  }, [riskFilter, statusFilter]);

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Incidents</h1>
          <p className="text-sm text-muted-foreground mt-1">All recorded incidents and their current status</p>
        </div>
        <div className="flex items-center gap-3">
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
          <Button variant="outline" size="sm" onClick={fetchIncidents} className="gap-2">
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
        </div>
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
    </div>
  );
}
