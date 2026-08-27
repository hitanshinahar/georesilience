"use client";

import { RiskZone, FactorContribution } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ShieldAlert, CloudRain, Droplets, Mountain, History, Network, Camera, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ZoneIntelligencePanelProps {
  zone: RiskZone;
  onClose: () => void;
  onViewInfrastructure: (zoneId: string) => void;
  onRequestVerification: (zoneId: string) => void;
}

export function ZoneIntelligencePanel({ 
  zone, 
  onClose,
  onViewInfrastructure,
  onRequestVerification
}: ZoneIntelligencePanelProps) {
  
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'bg-red-500/20 text-red-500 border-red-500/50';
      case 'HIGH': return 'bg-orange-500/20 text-orange-500 border-orange-500/50';
      case 'MODERATE': return 'bg-amber-500/20 text-amber-500 border-amber-500/50';
      default: return 'bg-green-500/20 text-green-500 border-green-500/50';
    }
  };

  const getProgressColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return '[&>div]:bg-red-500';
      case 'HIGH': return '[&>div]:bg-orange-500';
      case 'MODERATE': return '[&>div]:bg-amber-500';
      default: return '[&>div]:bg-green-500';
    }
  };

  return (
    <Card className="h-full bg-background/95 border-l border-border/50 shadow-2xl flex flex-col rounded-none relative">
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-2 right-2 text-muted-foreground z-10"
        onClick={onClose}
      >
        <X className="h-4 w-4" />
      </Button>

      <CardHeader className="pb-4 pt-6">
        <div className="flex items-center justify-between mb-1">
          <div className="text-xs font-mono text-muted-foreground">{zone.id}</div>
          <Badge variant="outline" className={getRiskColor(zone.riskLevel)}>
            {zone.riskLevel}
          </Badge>
        </div>
        <CardTitle className="text-xl">{zone.name}</CardTitle>
        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
          <ShieldAlert className="w-3 h-3" />
          Last updated {formatDistanceToNow(new Date(zone.lastUpdated), { addSuffix: true })}
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-auto space-y-6">
        {/* Risk Scores */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Landslide Risk</div>
            <div className="text-3xl font-bold">{zone.riskScore}%</div>
            <Progress value={zone.riskScore} className={`h-1.5 mt-2 ${getProgressColor(zone.riskLevel)}`} />
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Evidence Coverage</div>
            <div className="text-3xl font-bold">{zone.evidenceCoverage}%</div>
            <Progress value={zone.evidenceCoverage} className="h-1.5 mt-2 [&>div]:bg-blue-500" />
          </div>
        </div>

        {/* Environmental Factors */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Environmental Intelligence</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/30 p-3 rounded-lg border border-border/50 flex flex-col">
              <CloudRain className="w-4 h-4 text-blue-400 mb-2" />
              <span className="text-xs text-muted-foreground">24h Rainfall</span>
              <span className="font-semibold">{zone.environmentalFactors.rainfall24h} mm</span>
            </div>
            <div className="bg-muted/30 p-3 rounded-lg border border-border/50 flex flex-col">
              <Droplets className="w-4 h-4 text-cyan-400 mb-2" />
              <span className="text-xs text-muted-foreground">Soil Moisture</span>
              <span className="font-semibold">{zone.environmentalFactors.soilMoisture}%</span>
            </div>
            <div className="bg-muted/30 p-3 rounded-lg border border-border/50 flex flex-col">
              <Mountain className="w-4 h-4 text-amber-600 mb-2" />
              <span className="text-xs text-muted-foreground">Slope Gradient</span>
              <span className="font-semibold">{zone.environmentalFactors.slope}°</span>
            </div>
            <div className="bg-muted/30 p-3 rounded-lg border border-border/50 flex flex-col">
              <History className="w-4 h-4 text-purple-400 mb-2" />
              <span className="text-xs text-muted-foreground">Historical Events</span>
              <span className="font-semibold">{zone.environmentalFactors.historicalEvents} nearby</span>
            </div>
          </div>
        </div>

        {/* SHAP Explanation */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Why is this high risk?</h4>
          <div className="space-y-3 bg-muted/10 p-4 rounded-lg border border-border/50">
            {zone.topFactors.map((factor: FactorContribution, idx: number) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>{factor.factor}</span>
                  <span className="text-red-400 font-mono">+{factor.contribution}%</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden flex justify-end">
                  <div 
                    className="h-full bg-red-500/80 rounded-full" 
                    style={{ width: `${(factor.contribution / 40) * 100}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Actions */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Recommended Actions</h4>
          <ul className="space-y-2">
            {zone.recommendedActions.map((action: string, idx: number) => (
              <li key={idx} className="text-sm flex items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 mr-2 flex-shrink-0" />
                {action}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 p-4 border-t border-border/50">
        <Button 
          variant="default" 
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => onRequestVerification(zone.id)}
        >
          <Camera className="w-4 h-4 mr-2" />
          Request Field Verification
        </Button>
        <Button 
          variant="outline" 
          className="w-full border-border/50 hover:bg-muted"
          onClick={() => onViewInfrastructure(zone.id)}
        >
          <Network className="w-4 h-4 mr-2 text-blue-400" />
          View Infrastructure Impact
        </Button>
      </CardFooter>
    </Card>
  );
}
