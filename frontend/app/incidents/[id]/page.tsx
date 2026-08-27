"use client";

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Incident, ReviewActionType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  AlertTriangle, CheckCircle2, ArrowUpCircle, XCircle,
  Shield, Eye, Clock, MapPin, ArrowLeft, Activity,
  Brain, Zap, FileText
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const riskColors: Record<string, string> = {
  RED: 'bg-red-500/15 text-red-500 border-red-500/40',
  ORANGE: 'bg-orange-500/15 text-orange-500 border-orange-500/40',
  YELLOW: 'bg-amber-500/15 text-amber-500 border-amber-500/40',
  GREEN: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/40',
};

const riskProgressColors: Record<string, string> = {
  RED: '[&>div]:bg-red-500',
  ORANGE: '[&>div]:bg-orange-500',
  YELLOW: '[&>div]:bg-amber-500',
  GREEN: '[&>div]:bg-emerald-500',
};

const statusColors: Record<string, string> = {
  OPEN: 'bg-blue-500/15 text-blue-400 border-blue-500/40',
  UNDER_REVIEW: 'bg-orange-500/15 text-orange-400 border-orange-500/40',
  FIELD_VERIFIED: 'bg-teal-500/15 text-teal-400 border-teal-500/40',
  ESCALATED: 'bg-red-500/15 text-red-400 border-red-500/40',
  RESOLVED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40',
  DISMISSED: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/40',
};

export default function IncidentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewNote, setReviewNote] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchIncident = useCallback(async () => {
    try {
      const data = await api.getIncident(id);
      setIncident(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchIncident();
    const interval = setInterval(fetchIncident, 15000);
    return () => clearInterval(interval);
  }, [fetchIncident]);

  const handleReviewAction = async (action: ReviewActionType) => {
    if (action === 'DISMISS' && !reviewNote.trim()) {
      setError('A note is required when dismissing an incident.');
      return;
    }
    setError(null);
    setActionLoading(action);
    try {
      await api.reviewIncident(id, {
        action,
        reviewer_id: 'operator',
        note: reviewNote.trim() || undefined,
      });
      setReviewNote('');
      fetchIncident();
    } catch (e: unknown) {
      setError((e as Error).message || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="text-muted-foreground animate-pulse">Loading incident...</div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Incident not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/command-center')}>
          Return to Command Center
        </Button>
      </div>
    );
  }

  const assessment = incident.assessment_data as Record<string, unknown> | null;
  
  interface Factor {
    source: string;
    raw_score: number;
    weight: number;
    risk_score_contribution: number;
    heuristic_metadata?: Record<string, unknown>;
    [key: string]: unknown;
  }

  const factors = (assessment?.contributing_factors || []) as Factor[];
  const sourceAvailability = (assessment?.source_availability || {}) as Record<string, boolean>;

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/command-center')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{incident.location_name || 'Incident Detail'}</h1>
            <Badge variant="outline" className={riskColors[incident.risk_level]}>{incident.risk_level}</Badge>
            <Badge variant="outline" className={statusColors[incident.status]}>{incident.status.replace('_', ' ')}</Badge>
          </div>
          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
            <span className="font-mono">{incident.incident_id}</span>
            <span><MapPin className="w-3 h-3 inline mr-1" />{incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)}</span>
            <span><Clock className="w-3 h-3 inline mr-1" />Created {formatDistanceToNow(new Date(incident.created_at), { addSuffix: true })}</span>
            <span>Source: {incident.source}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Assessment Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Risk Scores */}
          <Card className="bg-background/60 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><Shield className="w-4 h-4 text-blue-400" /> Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Risk Score</div>
                  <div className="text-3xl font-bold">{Math.round(incident.risk_score * 100)}%</div>
                  <Progress value={incident.risk_score * 100} className={`h-1.5 mt-2 ${riskProgressColors[incident.risk_level]}`} />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Evidence Coverage</div>
                  <div className="text-3xl font-bold">{Math.round(incident.evidence_coverage * 100)}%</div>
                  <Progress value={incident.evidence_coverage * 100} className="h-1.5 mt-2 [&>div]:bg-blue-500" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Model Agreement</div>
                  <div className="text-lg font-semibold capitalize">{incident.model_agreement.replace(/_/g, ' ')}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Recommended Action</div>
                  <div className="text-sm font-medium capitalize text-primary">{(incident.recommended_action || 'none').replace(/_/g, ' ')}</div>
                </div>
              </div>
              {incident.requires_human_review && (
                <div className="mt-4 p-3 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-orange-400" />
                  <span className="text-sm text-orange-400 font-medium">This incident requires human review</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Model Evidence */}
          <Card className="bg-background/60 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><Brain className="w-4 h-4 text-purple-400" /> Model Evidence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: 'XGBoost', key: 'xgboost', color: 'blue' },
                  { name: 'LSTM', key: 'lstm', color: 'purple' },
                  { name: 'Transformer', key: 'transformer', color: 'cyan' },
                  { name: 'Field SLM', key: 'field_intelligence', color: 'green' },
                ].map(model => {
                  const available = sourceAvailability[model.key];
                  const factor = factors.find((f: Factor) => f.source === model.key);
                  return (
                    <div key={model.key} className={`p-3 rounded-lg border ${available ? 'border-border/50 bg-muted/20' : 'border-border/20 bg-muted/5 opacity-50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium">{model.name}</span>
                        <Badge variant="outline" className={`text-[10px] ${available ? `bg-${model.color}-500/10 text-${model.color}-400 border-${model.color}-500/30` : 'bg-zinc-500/10 text-zinc-500 border-zinc-500/30'}`}>
                          {available ? 'Active' : 'N/A'}
                        </Badge>
                      </div>
                      {factor && (
                        <>
                          <div className="text-xl font-bold">{Math.round(factor.raw_score * 100)}%</div>
                          <div className="text-[10px] text-muted-foreground mt-1">Weight: {Math.round(factor.weight * 100)}% | Contribution: {Math.round(factor.risk_score_contribution * 100)}%</div>
                        </>
                      )}
                      {!factor && <div className="text-xs text-muted-foreground">No data</div>}
                    </div>
                  );
                })}
              </div>

              {/* Field intelligence details */}
              {factors.find((f: Factor) => f.source === 'field_intelligence')?.heuristic_metadata && (
                <div className="mt-4 p-4 rounded-lg border border-border/50 bg-muted/10">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Field Intelligence Details
                  </h4>
                  {(() => {
                    const meta = (factors.find((f: Factor) => f.source === 'field_intelligence')?.heuristic_metadata as Record<string, unknown>) || {};
                    return (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        <div><span className="text-muted-foreground">Severity Base:</span> <span className="font-medium">{String(meta.base_severity_score || '')}</span></div>
                        <div><span className="text-muted-foreground">Urgency Mult:</span> <span className="font-medium">{String(meta.urgency_multiplier || '')}</span></div>
                        <div><span className="text-muted-foreground">Temporal Mult:</span> <span className="font-medium">{String(meta.temporal_change_multiplier || '')}</span></div>
                        <div><span className="text-muted-foreground">Worsening:</span> <span className={`font-medium ${meta.is_worsening ? 'text-red-400' : 'text-emerald-400'}`}>{meta.is_worsening ? 'Yes' : 'No'}</span></div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contributing Factors */}
          {factors.length > 0 && (
            <Card className="bg-background/60 border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2"><Activity className="w-4 h-4 text-amber-400" /> Contributing Factors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {factors.map((f: Factor, i: number) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="capitalize">{f.source.replace(/_/g, ' ')}</span>
                      <span className="font-mono text-muted-foreground">
                        Score: {Math.round(f.raw_score * 100)}% x Weight: {Math.round(f.weight * 100)}% = {Math.round(f.risk_score_contribution * 100)}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary/60 rounded-full transition-all" style={{ width: `${Math.min(f.risk_score_contribution * 200, 100)}%` }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Linked Reports */}
          {incident.linked_report_ids.length > 0 && (
            <Card className="bg-background/60 border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2"><FileText className="w-4 h-4 text-blue-400" /> Linked Field Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {incident.linked_report_ids.map(rid => (
                    <Badge key={rid} variant="secondary" className="font-mono text-xs">{rid}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Actions and History */}
        <div className="space-y-6">
          {/* Review Actions */}
          <Card className="bg-background/60 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><Eye className="w-4 h-4 text-orange-400" /> Review Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs">Review Note</Label>
                <Textarea
                  placeholder="Add a note for this action..."
                  value={reviewNote}
                  onChange={e => setReviewNote(e.target.value)}
                  className="mt-1 min-h-[80px] text-sm"
                />
              </div>

              {error && (
                <div className="p-2 rounded bg-red-500/10 border border-red-500/30 text-xs text-red-400">{error}</div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="gap-1 text-xs border-teal-500/30 text-teal-400 hover:bg-teal-500/10"
                  onClick={() => handleReviewAction('VERIFY')}
                  disabled={actionLoading !== null}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verify
                </Button>
                <Button
                  variant="outline"
                  className="gap-1 text-xs border-red-500/30 text-red-400 hover:bg-red-500/10"
                  onClick={() => handleReviewAction('ESCALATE')}
                  disabled={actionLoading !== null}
                >
                  <ArrowUpCircle className="w-3.5 h-3.5" /> Escalate
                </Button>
                <Button
                  variant="outline"
                  className="gap-1 text-xs border-zinc-500/30 text-zinc-400 hover:bg-zinc-500/10"
                  onClick={() => handleReviewAction('DISMISS')}
                  disabled={actionLoading !== null}
                >
                  <XCircle className="w-3.5 h-3.5" /> Dismiss
                </Button>
                <Button
                  variant="outline"
                  className="gap-1 text-xs border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                  onClick={() => handleReviewAction('RESOLVE')}
                  disabled={actionLoading !== null}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Resolve
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Review History */}
          <Card className="bg-background/60 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><Clock className="w-4 h-4 text-muted-foreground" /> Review History</CardTitle>
            </CardHeader>
            <CardContent>
              {incident.review_history.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No review actions yet</p>
              ) : (
                <div className="space-y-3">
                  {incident.review_history.map((review, i) => (
                    <div key={i} className="p-3 rounded-lg border border-border/30 bg-muted/10 space-y-1">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[10px]">{review.action}</Badge>
                        <span className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(review.timestamp), { addSuffix: true })}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">by {review.reviewer_id}</div>
                      {review.note && <div className="text-xs mt-1 p-2 rounded bg-muted/30">{review.note}</div>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
