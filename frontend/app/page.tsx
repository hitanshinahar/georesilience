"use client";

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { MOCK_ZONES, MOCK_INCIDENTS, MOCK_IMPACTS } from '@/lib/mock-data';
import { RiskZone, PriorityIncident, InfrastructureImpact } from '@/types';
import { MetricsRow } from '@/components/dashboard/MetricsRow';
import { PriorityIncidents } from '@/components/dashboard/PriorityIncidents';
import { ZoneIntelligencePanel } from '@/components/dashboard/ZoneIntelligencePanel';
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
  const [zones, setZones] = useState<RiskZone[]>(MOCK_ZONES);
  const [incidents, setIncidents] = useState<PriorityIncident[]>(MOCK_INCIDENTS);
  
  const [selectedZone, setSelectedZone] = useState<RiskZone | null>(null);
  const [isFieldReportOpen, setIsFieldReportOpen] = useState(false);
  const [isInfrastructureOpen, setIsInfrastructureOpen] = useState(false);
  
  // Field Report form state
  const [reportType, setReportType] = useState('Visible crack');
  const [reportDesc, setReportDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);

  const activeImpact = useMemo(() => {
    if (!selectedZone) return null;
    return MOCK_IMPACTS.find(i => i.zoneId === selectedZone.id) || null;
  }, [selectedZone]);

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

  const handleViewInfrastructure = (zoneId: string) => {
    setIsInfrastructureOpen(true);
  };

  const handleRequestVerification = (zoneId: string) => {
    setIsFieldReportOpen(true);
    setShowAIAnalysis(false);
    setReportDesc('');
  };

  const submitFieldReport = () => {
    setIsSubmitting(true);
    // Simulate AI processing
    setTimeout(() => {
      setIsSubmitting(false);
      setShowAIAnalysis(true);
      
      // Simulate risk escalation after analysis
      setTimeout(() => {
        if (selectedZone) {
          setZones((prev: RiskZone[]) => prev.map(z => {
            if (z.id === selectedZone.id) {
              return {
                ...z,
                riskScore: Math.min(99, z.riskScore + 15),
                riskLevel: 'CRITICAL',
                confidence: Math.min(99, z.confidence + 25)
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
                riskScore: Math.min(99, newIncidents[idx].riskScore + 15),
                priorityScore: Math.min(99, newIncidents[idx].priorityScore + 20),
                status: 'CRITICAL'
              };
              // re-sort
              return newIncidents.sort((a, b) => b.priorityScore - a.priorityScore);
            }
            return newIncidents;
          });
          
          setSelectedZone(prev => prev ? {
            ...prev,
            riskScore: Math.min(99, prev.riskScore + 15),
            riskLevel: 'CRITICAL',
            confidence: Math.min(99, prev.confidence + 25)
          } : null);
        }
      }, 1500);
    }, 2000);
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <MetricsRow />

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

        {/* Right Sidebar - Priority Incidents */}
        <div className="w-80 flex flex-col gap-4">
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
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-5">
                <div className="flex items-center gap-2 text-red-500 mb-3">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="font-semibold text-lg">AI Evidence Analysis</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Detected Indicators</div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="border-red-500/30 text-red-400">Surface crack</Badge>
                      <Badge variant="outline" className="border-red-500/30 text-red-400">Active soil movement</Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Severity</div>
                      <div className="font-bold text-red-500">HIGH</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Confidence</div>
                      <div className="font-bold text-blue-400">84%</div>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-red-500/20">
                    <div className="text-sm font-medium text-red-400">System Action</div>
                    <div className="text-sm">Risk score automatically escalated to CRITICAL. Priority action queue updated.</div>
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
