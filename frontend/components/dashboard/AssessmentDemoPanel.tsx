"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Activity, Zap, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';

interface AssessmentDemoPanelProps {
  onRunAssessment: (scenario: any) => Promise<any>;
  onAssessmentComplete: (result: any) => void;
}

export function AssessmentDemoPanel({ onRunAssessment, onAssessmentComplete }: AssessmentDemoPanelProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const scenarios = {
    LOW_RISK: {
      name: "Low Risk",
      payload: {
        static_features: {
            elevation_m: 1200, slope_deg: 15, aspect_deg: 90, tri_ruggedness: 2,
            plan_curvature: 0.05, rainfall_3h_accum_mm: 5, rainfall_72h_accum_mm: 20,
            soil_moisture_saturation_pct: 30, ground_deformation_proxy_mm_yr: 2,
            anthropogenic_load_proxy_kpa: 10
        },
        timeseries_sequence: [
            {"rainfall_mm": 2, "cumulative_rainfall_mm": 5, "soil_moisture": 25},
            {"rainfall_mm": 3, "cumulative_rainfall_mm": 10, "soil_moisture": 30}
        ],
        field_report: "Everything looks normal, no cracks visible.",
        location: { latitude: 27.3200, longitude: 88.6050, name: "Deorali" }
      }
    },
    ELEVATED_RISK: {
      name: "Elevated Risk",
      payload: {
        static_features: {
            elevation_m: 1200, slope_deg: 30, aspect_deg: 180, tri_ruggedness: 4,
            plan_curvature: 0.1, rainfall_3h_accum_mm: 30, rainfall_72h_accum_mm: 120,
            soil_moisture_saturation_pct: 65, ground_deformation_proxy_mm_yr: 5,
            anthropogenic_load_proxy_kpa: 30
        },
        timeseries_sequence: [
            {"rainfall_mm": 10, "cumulative_rainfall_mm": 50, "soil_moisture": 50},
            {"rainfall_mm": 15, "cumulative_rainfall_mm": 80, "soil_moisture": 65}
        ],
        field_report: "Minor water pooling observed on the road edge.",
        location: { latitude: 27.3385, longitude: 88.6122, name: "Upper Sichey" }
      }
    },
    CRITICAL: {
      name: "Critical Scenario",
      payload: {
        static_features: {
            elevation_m: 1200, slope_deg: 42, aspect_deg: 180, tri_ruggedness: 6,
            plan_curvature: 0.2, rainfall_3h_accum_mm: 80, rainfall_72h_accum_mm: 250,
            soil_moisture_saturation_pct: 95, ground_deformation_proxy_mm_yr: 15,
            anthropogenic_load_proxy_kpa: 60
        },
        timeseries_sequence: [
            {"rainfall_mm": 40, "cumulative_rainfall_mm": 150, "soil_moisture": 80},
            {"rainfall_mm": 50, "cumulative_rainfall_mm": 250, "soil_moisture": 95}
        ],
        field_report: "Large crack in the road surface and active soil sliding.",
        location: { latitude: 27.3235, longitude: 88.5120, name: "NH-10 Sector 4" }
      }
    },
    DISAGREEMENT: {
      name: "Model Disagreement",
      payload: {
        static_features: {
            elevation_m: 1200, slope_deg: 20, aspect_deg: 180, tri_ruggedness: 3,
            plan_curvature: 0.1, rainfall_3h_accum_mm: 10, rainfall_72h_accum_mm: 40,
            soil_moisture_saturation_pct: 40, ground_deformation_proxy_mm_yr: 3,
            anthropogenic_load_proxy_kpa: 20
        },
        timeseries_sequence: [
            {"rainfall_mm": 50, "cumulative_rainfall_mm": 150, "soil_moisture": 80},
            {"rainfall_mm": 60, "cumulative_rainfall_mm": 250, "soil_moisture": 95}
        ],
        field_report: "Stable condition, no cracks.",
        location: { latitude: 27.3501, longitude: 88.6210, name: "Burtuk Area" }
      }
    }
  };

  const handleRun = async (key: string) => {
    setActiveScenario(key);
    setIsRunning(true);
    setResult(null);
    try {
      const res = await onRunAssessment((scenarios as any)[key].payload);
      setResult(res);
      onAssessmentComplete(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunning(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'bg-red-500/20 text-red-500 border-red-500/50';
      case 'HIGH': return 'bg-orange-500/20 text-orange-500 border-orange-500/50';
      case 'MODERATE': return 'bg-amber-500/20 text-amber-500 border-amber-500/50';
      default: return 'bg-green-500/20 text-green-500 border-green-500/50';
    }
  };

  return (
    <Card className="bg-background/95 border border-border/50 shadow-lg flex flex-col mt-4">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-400" />
          Real-time Assessment Demo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(scenarios).map(([key, sc]) => (
            <Button 
              key={key}
              variant={activeScenario === key ? "default" : "outline"}
              onClick={() => handleRun(key)}
              disabled={isRunning}
              className="w-full text-xs h-9"
            >
              {sc.name}
            </Button>
          ))}
        </div>

        {isRunning && (
          <div className="flex flex-col items-center justify-center p-6 space-y-4 text-muted-foreground animate-in fade-in">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-sm">Orchestrating Models (XGBoost, LSTM, Transformer, SLM)...</span>
          </div>
        )}

        {result && !isRunning && (
          <div className="mt-4 space-y-4 animate-in slide-in-from-bottom-4 fade-in">
            <div className="p-4 bg-muted/20 border border-border rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="font-semibold text-lg">{result.location?.name || "Zone"}</div>
                <Badge variant="outline" className={getRiskColor(result.assessment.risk_level)}>
                  {result.assessment.risk_level}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Final Risk Score</div>
                  <div className="text-2xl font-bold">{Math.round(result.assessment.final_risk_score * 100)}%</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Evidence Coverage</div>
                  <div className="text-2xl font-bold">{Math.round(result.assessment.evidence_coverage * 100)}%</div>
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-border/50">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Intelligence Sources</div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={result.data_sources.xgboost_available ? "default" : "secondary"} className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30">
                    XGBoost
                  </Badge>
                  <Badge variant={result.data_sources.lstm_available ? "default" : "secondary"} className="bg-purple-500/20 text-purple-400 hover:bg-purple-500/30">
                    LSTM
                  </Badge>
                  <Badge variant={result.data_sources.transformer_available ? "default" : "secondary"} className="bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30">
                    Transformer
                  </Badge>
                  <Badge variant={result.data_sources.field_intelligence_available ? "default" : "secondary"} className="bg-green-500/20 text-green-400 hover:bg-green-500/30">
                    Field SLM
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2 pt-3 mt-3 border-t border-border/50">
                  <div className="text-xs text-muted-foreground">Model Agreement: <strong className="text-foreground">{result.assessment.model_agreement}</strong></div>
                  {result.assessment.requires_human_review && (
                      <div className="text-xs text-orange-400 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Requires Human Review
                      </div>
                  )}
                  <div className="text-xs text-muted-foreground mt-1 text-primary">
                    Action: {result.assessment.recommended_action.replace(/_/g, " ")}
                  </div>
              </div>

            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
