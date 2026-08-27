"use client";

import { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { api } from '@/lib/api';
import { RiskZone, PriorityIncident, RiskLevel } from '@/types';
import { MetricsRow } from '@/components/dashboard/MetricsRow';
import { PriorityIncidents } from '@/components/dashboard/PriorityIncidents';
import { ZoneIntelligencePanel } from '@/components/dashboard/ZoneIntelligencePanel';
import { AssessmentDemoPanel } from '@/components/dashboard/AssessmentDemoPanel';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Camera, AlertTriangle, Route } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Dynamically import map to avoid SSR issues with Leaflet
const Map = dynamic(() => import('@/components/map/MapClient'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-muted/20 animate-pulse rounded-lg border border-border/50 flex items-center justify-center">
      <div className="text-muted-foreground flex flex-col items-center">
        <MapPin className="w-8 h-8 mb-2 opacity-50" />
        <span>Initializing Geospatial Engine...</span>
      </div>
    </div>
  )
});

export default function CommandCenter() {
  const [zones, setZones] = useState<RiskZone[]>([]);
  const [incidents, setIncidents] = useState<PriorityIncident[]>([]);
  const [impacts, setImpacts] = useState<any[]>([]);
  
  const [selectedZone, setSelectedZone] = useState<RiskZone | null>(null);
  const [isFieldReportOpen, setIsFieldReportOpen] = useState(false);
  const [isInfrastructureOpen, setIsInfrastructureOpen] = useState(false);
  
  // Real metrics state
  const [metrics, setMetrics] = useState({
    activeIncidents: 0,
    criticalIncidents: 0,
    activeAlerts: 0,
    pendingReviews: 0,
  });
  const [metricsLoading, setMetricsLoading] = useState(true);

  useEffect(() => {
    async function fetchInitialData() {
      try {
        const [zonesRes, incidentsRes, impactsRes] = await Promise.all([
          api.getInfrastructureImpacts().catch(() => []),
          api.getIncidents().catch(() => []),
          api.getInfrastructureImpacts().catch(() => [])
        ]);
        setZones(zonesRes);
        setIncidents(incidentsRes);
        setImpacts(impactsRes);
      } catch (err) {
        console.error('Failed to fetch initial data:', err);
      }
    }
    fetchInitialData();
  }, []);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const [incidentsRes, alertsRes] = await Promise.all([
          fetch('/api/incidents').catch(() => null),
          fetch('/api/alerts').catch(() => null)
        ]);
        
        let activeIncs = 0;
        let criticalIncs = 0;
        let pendingRev = 0;
        let activeAlts = 0;

        if (incidentsRes && incidentsRes.ok) {
          const incidents = await incidentsRes.json();
          const active = incidents.filter((i: any) => i.status !== 'RESOLVED' && i.status !== 'DISMISSED');
          activeIncs = active.length;
          criticalIncs = incidents.filter((i: any) => i.risk_level === 'CRITICAL' || i.risk_level === 'HIGH').length;
          pendingRev = incidents.filter((i: any) => i.status === 'UNDER_REVIEW').length;
        }

        if (alertsRes && alertsRes.ok) {
          const alerts = await alertsRes.json();
          activeAlts = alerts.filter((a: any) => a.status === 'ACTIVE').length;
        }
        
        setMetrics({
          activeIncidents: activeIncs,
          criticalIncidents: criticalIncs,
          activeAlerts: activeAlts,
          pendingReviews: pendingRev
        });
      } catch (err) {
        console.error('Failed to fetch metrics:', err);
      } finally {
        setMetricsLoading(false);
      }
    }
    
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);
  
  // Field Report form state
  const [reportType, setReportType] = useState('Visible crack');
  const [reportDesc, setReportDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);

  const activeImpact = useMemo(() => {
    if (!selectedZone) return null;
    return impacts.find((i: any) => i.zoneId === selectedZone.id) || null;
  }, [selectedZone, impacts]);

  const handleSelectZone = (zone: RiskZone) => {
    setSelectedZone(zone);
    setIsFieldReportOpen(false);
    setIsInfrastructureOpen(false);
    setShowAIAnalysis(false);
  };

  const handleSelectIncident = (zoneId: string) => {
    const zone = zones.find(z => z.id === zoneId);
    if (zone) handleSelectZone(zone);
  };

  const handleViewInfrastructure = (_zoneId: string) => {
    setIsInfrastructureOpen(true);
  };

  const handleRequestVerification = (_zoneId: string) => {
    setIsFieldReportOpen(true);
    setShowAIAnalysis(false);
    setReportDesc('');
  };

  // SLM analysis result state
  const [slmResult, setSlmResult] = useState<{
    hazard_type: string;
    hazard_confidence: number;
    severity: string;
    urgency: string;
    observations: string[];
    temporal_change: string;
    recommended_action: string;
  } | null>(null);

  const submitFieldReport = async () => {
    setIsSubmitting(true);
    setSlmResult(null);
    try {
      const fieldText = `${reportType}. ${reportDesc}`.trim();

      // Build payload for backend Assessment Orchestrator
      const static_features = {
        elevation_m: 1200,
        slope_deg: selectedZone?.environmentalFactors.slope ?? 30,
        aspect_deg: 180,
        tri_ruggedness: 4,
        plan_curvature: 0.1,
        rainfall_3h_accum_mm: selectedZone?.environmentalFactors.rainfall24h ? Math.round(selectedZone.environmentalFactors.rainfall24h / 8) : 20,
        rainfall_72h_accum_mm: selectedZone?.environmentalFactors.rainfall7d ?? 150,
        soil_moisture_saturation_pct: selectedZone?.environmentalFactors.soilMoisture ?? 60,
        ground_deformation_proxy_mm_yr: 5,
        anthropogenic_load_proxy_kpa: 30
      };

      // Generate 72h sequence for backend temporal models
      const rain24 = selectedZone?.environmentalFactors.rainfall24h ?? 50;
      const moisture = selectedZone?.environmentalFactors.soilMoisture ?? 60;
      const timeseries_sequence = [];
      let cumRain = 0;
      for (let i = 0; i < 72; i++) {
        const stepRain = Math.max(0, (rain24 / 24) * (0.8 + (i / 72) * 0.4));
        cumRain += stepRain;
        timeseries_sequence.push({
          rainfall_mm: Math.round(stepRain * 100) / 100,
          cumulative_rainfall_mm: Math.round(cumRain * 100) / 100,
          soil_moisture: Math.round(moisture * 100) / 100
        });
      }

      const payload = {
        static_features,
        timeseries_sequence,
        field_report: fieldText,
        location: {
          latitude: selectedZone?.latitude ?? 27.3235,
          longitude: selectedZone?.longitude ?? 88.5120,
          name: selectedZone?.name ?? "NH-10 Sector 4"
        }
      };

      const res = await fetch('/api/assessment/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.error('Assessment orchestrator request failed:', res.status);
        return;
      }

      const data = await res.json();

      // Store real backend SLM extraction
      if (data.model_outputs?.field_intelligence) {
        setSlmResult(data.model_outputs.field_intelligence);
      }
      setShowAIAnalysis(true);

      // Apply backend-computed final risk score & level directly from Fusion Engine
      const backendAssessment = data.assessment;
      if (selectedZone && backendAssessment) {
        const newRiskScore = Math.round(backendAssessment.final_risk_score * 100);
        const newRiskLevel: RiskLevel = backendAssessment.risk_level as RiskLevel;
        const newCoverage = Math.round(backendAssessment.evidence_coverage * 100);
        const newAction = backendAssessment.recommended_action?.replace(/_/g, " ") || selectedZone.recommendedActions[0];

        setZones((prev: RiskZone[]) => prev.map(z => {
          if (z.id === selectedZone.id) {
            return {
              ...z,
              riskScore: newRiskScore,
              riskLevel: newRiskLevel,
              evidenceCoverage: newCoverage,
              recommendedActions: [newAction, ...z.recommendedActions.slice(0, 1)],
              lastUpdated: new Date().toISOString()
            };
          }
          return z;
        }));

        setIncidents(prev => {
          const newIncidents = [...prev];
          const idx = newIncidents.findIndex(i => i.zoneId === selectedZone.id);
          if (idx >= 0) {
            newIncidents[idx] = {
              ...newIncidents[idx],
              riskScore: newRiskScore,
              priorityScore: Math.min(99, newRiskScore + 5),
              status: newRiskLevel,
            };
            return newIncidents.sort((a, b) => b.priorityScore - a.priorityScore);
          }
          return newIncidents;
        });

        setSelectedZone(prev => prev ? {
          ...prev,
          riskScore: newRiskScore,
          riskLevel: newRiskLevel,
          evidenceCoverage: newCoverage,
          recommendedActions: [newAction, ...prev.recommendedActions.slice(0, 1)],
          lastUpdated: new Date().toISOString()
        } : null);
      }
    } catch (err) {
      console.error('Field report submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRunAssessment = async (payload: Record<string, unknown>) => {
    const res = await fetch('/api/assessment/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Assessment failed");
    return res.json();
  };

  const handleAssessmentComplete = (result: { location?: { name: string }; assessment: { final_risk_score: number; risk_level: string; evidence_coverage: number; recommended_action: string; model_agreement: string; requires_human_review: boolean; }; data_sources: { xgboost_available: boolean; lstm_available: boolean; transformer_available: boolean; field_intelligence_available: boolean; } }) => {
    // Update map zones with new assessment
    const targetName = result.location?.name;
    if (!targetName) return;
    setZones(prev => prev.map(z => {
      if (z.name === targetName || (z.name.includes("NH-10") && targetName.includes("NH-10"))) {
        return {
          ...z,
          riskScore: Math.round(result.assessment.final_risk_score * 100),
          riskLevel: result.assessment.risk_level as RiskLevel,
          evidenceCoverage: Math.round(result.assessment.evidence_coverage * 100),
          recommendedActions: [result.assessment.recommended_action.replace(/_/g, " "), ...z.recommendedActions.slice(0, 1)],
          lastUpdated: new Date().toISOString()
        };
      }
      return z;
    }));
    
    // Also select this zone to show intelligence panel updated
    const updatedZone = zones.find(z => z.name === targetName || (z.name.includes("NH-10") && targetName.includes("NH-10")));
    if (updatedZone) {
      setSelectedZone({
          ...updatedZone,
          riskScore: Math.round(result.assessment.final_risk_score * 100),
          riskLevel: result.assessment.risk_level as RiskLevel,
          evidenceCoverage: Math.round(result.assessment.evidence_coverage * 100),
          recommendedActions: [result.assessment.recommended_action.replace(/_/g, " "), ...updatedZone.recommendedActions.slice(0, 1)],
          lastUpdated: new Date().toISOString()
      });
    }
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <MetricsRow 
        activeIncidents={metrics.activeIncidents}
        criticalIncidents={metrics.criticalIncidents}
        activeAlerts={metrics.activeAlerts}
        pendingReviews={metrics.pendingReviews}
        loading={metricsLoading}
      />

      <div className="flex-1 flex gap-4 min-h-0">
        {/* Main Map Area */}
        <div className="flex-1 relative rounded-lg overflow-hidden flex">
          <Map 
            zones={zones} 
            selectedZone={selectedZone} 
            onSelectZone={handleSelectZone} 
          />
          
          {/* Intelligence Panel Overlay */}
          {selectedZone && (
            <div className="absolute top-0 right-0 w-96 h-full z-10 animate-in slide-in-from-right">
              <ZoneIntelligencePanel 
                zone={selectedZone} 
                onClose={() => setSelectedZone(null)}
                onViewInfrastructure={handleViewInfrastructure}
                onRequestVerification={handleRequestVerification}
              />
            </div>
          )}
        </div>

        {/* Right Sidebar - Priority Incidents & Demo Panel */}
        <div className="w-80 flex flex-col gap-4 overflow-y-auto pr-2 pb-4">
          <AssessmentDemoPanel 
            onRunAssessment={handleRunAssessment} 
            onAssessmentComplete={handleAssessmentComplete} 
          />
          <PriorityIncidents 
            incidents={incidents} 
            onSelectIncident={handleSelectIncident} 
          />
        </div>
      </div>

      {/* Field Report Sheet */}
      <Sheet open={isFieldReportOpen} onOpenChange={setIsFieldReportOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Submit Field Verification</SheetTitle>
            <SheetDescription>
              Reporting evidence for zone {selectedZone?.id} ({selectedZone?.name})
            </SheetDescription>
          </SheetHeader>
          
          {!showAIAnalysis ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Report Type</Label>
                <Select value={reportType} onValueChange={(val) => setReportType(val || 'Visible crack')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Visible crack">Visible crack</SelectItem>
                    <SelectItem value="Soil movement">Soil movement</SelectItem>
                    <SelectItem value="Road blockage">Road blockage</SelectItem>
                    <SelectItem value="Water seepage">Water seepage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Photographic Evidence</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center text-muted-foreground bg-muted/10 cursor-pointer hover:bg-muted/20 transition-colors">
                  <Camera className="w-8 h-8 mb-2" />
                  <span className="text-sm">Tap to upload photo from field</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Field Notes</Label>
                <Textarea 
                  placeholder="Describe observed conditions..." 
                  className="min-h-[100px]"
                  value={reportDesc}
                  onChange={(e) => setReportDesc(e.target.value)}
                />
              </div>

              <Button 
                className="w-full" 
                onClick={submitFieldReport}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Analyzing Evidence with AI...' : 'Submit Evidence'}
              </Button>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className={`${slmResult && (slmResult.severity === 'critical' || slmResult.severity === 'high') ? 'bg-red-500/10 border border-red-500/30' : 'bg-amber-500/10 border border-amber-500/30'} rounded-lg p-5`}>
                <div className={`flex items-center gap-2 ${slmResult && (slmResult.severity === 'critical' || slmResult.severity === 'high') ? 'text-red-500' : 'text-amber-500'} mb-3`}>
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="font-semibold text-lg">AI Evidence Analysis</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Detected Indicators</div>
                    <div className="flex flex-wrap gap-2">
                      {slmResult?.observations?.length ? slmResult.observations.map((obs, i) => (
                        <Badge key={i} variant="outline" className={`${slmResult.severity === 'critical' || slmResult.severity === 'high' ? 'border-red-500/30 text-red-400' : 'border-amber-500/30 text-amber-400'}`}>{obs}</Badge>
                      )) : (
                        <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground">No specific indicators</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Severity</div>
                      <div className={`font-bold ${slmResult?.severity === 'critical' || slmResult?.severity === 'high' ? 'text-red-500' : slmResult?.severity === 'moderate' ? 'text-amber-500' : 'text-green-500'}`}>{slmResult?.severity?.toUpperCase() ?? 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Confidence</div>
                      <div className="font-bold text-blue-400">{slmResult ? `${Math.round(slmResult.hazard_confidence * 100)}%` : 'N/A'}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Hazard Type</div>
                      <div className="font-medium text-foreground">{slmResult?.hazard_type?.replace(/_/g, ' ') ?? 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Urgency</div>
                      <div className="font-medium text-foreground">{slmResult?.urgency ?? 'N/A'}</div>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-red-500/20">
                    <div className="text-sm font-medium text-primary">SLM Recommended Action</div>
                    <div className="text-sm">{slmResult?.recommended_action || 'No specific action recommended.'}</div>
                  </div>
                </div>
              </div>
              
              <Button variant="outline" className="w-full" onClick={() => setIsFieldReportOpen(false)}>
                Return to Command Center
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Infrastructure Impact Sheet */}
      <Sheet open={isInfrastructureOpen} onOpenChange={setIsInfrastructureOpen}>
        <SheetContent side="left" className="overflow-y-auto w-full sm:max-w-md border-r border-border">
          <SheetHeader className="mb-6">
            <SheetTitle className="flex items-center gap-2">
              <Route className="w-5 h-5 text-blue-400" />
              Connectivity Impact
            </SheetTitle>
            <SheetDescription>
              Potential infrastructure isolation for zone {selectedZone?.id}
            </SheetDescription>
          </SheetHeader>
          
          {activeImpact ? (
            <div className="space-y-6">
              <div className="p-4 bg-muted/20 border border-border rounded-lg space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground">Affected Road Segment</div>
                  <div className="font-medium text-lg">{activeImpact.affectedRoad}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/50">
                  <div>
                    <div className="text-sm text-muted-foreground">Status</div>
                    <Badge variant="outline" className={
                      activeImpact.primaryRouteStatus === 'BLOCKED' ? 'border-red-500/50 text-red-500' : 'border-orange-500/50 text-orange-500'
                    }>
                      {activeImpact.primaryRouteStatus}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Pop. at Risk</div>
                    <div className="font-medium text-amber-500">{activeImpact.populationAffected.toLocaleString()}</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Routing Intelligence</h4>
                
                <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-md">
                  <div className="text-xs text-red-400 font-medium mb-1">Primary Access to {activeImpact.hospital}</div>
                  <div className="text-sm">Severely compromised. Estimated delay: +45 mins.</div>
                </div>
                
                <div className="p-3 bg-green-500/5 border border-green-500/20 rounded-md">
                  <div className="text-xs text-green-400 font-medium mb-1">Alternate Route</div>
                  <div className="text-sm">{activeImpact.alternateRoute} (+{activeImpact.additionalTravelMinutes} mins)</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Affected Communities</h4>
                <div className="flex flex-wrap gap-2">
                  {activeImpact.affectedVillages.map((village: string) => (
                    <Badge key={village} variant="secondary">{village}</Badge>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-12">
              <Route className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No critical infrastructure impact detected for this zone.</p>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
