"use client";

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { FieldReportResponse } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MapPin, Clock, Brain, User, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export default function FieldReportsPage() {
  const [reports, setReports] = useState<FieldReportResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await api.getFieldReportsFromAPI();
      setReports(data);
    } catch (error) {
      console.error('Failed to fetch field reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReports();
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Field Intelligence Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Ground truth reports submitted by citizens and field officers</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchReports} className="gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      <Card className="bg-background/60 border-border/50">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="text-xs">Report ID</TableHead>
              <TableHead className="text-xs">Location</TableHead>
              <TableHead className="text-xs w-1/3">Report Text</TableHead>
              <TableHead className="text-xs">Source</TableHead>
              <TableHead className="text-xs">SLM Analysis</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs">Linked Incident</TableHead>
              <TableHead className="text-xs">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">Loading reports...</TableCell></TableRow>
            ) : reports.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No reports found</TableCell></TableRow>
            ) : reports.map(report => {
              const slm = report.slm_analysis as Record<string, unknown>;
              return (
                <TableRow key={report.report_id} className="border-border/30">
                  <TableCell className="font-mono text-xs text-muted-foreground">{report.report_id}</TableCell>
                  <TableCell className="text-sm">
                    {report.location_name || `${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`}
                  </TableCell>
                  <TableCell className="text-sm">{report.report_text}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs capitalize">
                      <User className="w-3 h-3 mr-1 inline" /> {report.reporter_type.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {slm ? (
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className="text-[10px] w-fit">
                          {(slm.hazard_type as string) || 'Unknown'}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">Sev: {(slm.severity as string) || 'low'}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Pending</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-xs ${report.status === 'PROCESSED' ? 'bg-teal-500/10 text-teal-400 border-teal-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}`}>
                      {report.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {report.linked_incident_id ? (
                      <Link href={`/incidents/${report.linked_incident_id}`}>
                        <Button variant="link" className="h-auto p-0 text-xs font-mono">
                          {report.linked_incident_id}
                        </Button>
                      </Link>
                    ) : (
                      <span className="text-xs text-muted-foreground">None</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
