export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface EnvironmentalFactors {
  rainfall24h: number; // in mm
  rainfall7d: number; // in mm
  soilMoisture: number; // percentage
  slope: number; // degrees
  historicalEvents: number;
}

export interface FactorContribution {
  factor: string;
  contribution: number; // percentage (positive increases risk, negative decreases)
}

export interface RiskZone {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  riskScore: number; // 0-100
  riskLevel: RiskLevel;
  evidenceCoverage: number; // 0-100
  environmentalFactors: EnvironmentalFactors;
  topFactors: FactorContribution[];
  affectedInfrastructure: string[];
  recommendedActions: string[];
  lastUpdated: string;
}

export type ReportType = 'Visible crack' | 'Soil movement' | 'Road blockage' | 'Water seepage' | 'Other';
export type ReportSeverity = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type ReportStatus = 'PENDING' | 'VERIFIED' | 'DISMISSED';

export interface AIAnalysis {
  indicators: string[];
  severity: ReportSeverity;
  confidence: number; // 0-100
  recommendedAction: string;
}

export interface FieldReport {
  id: string;
  zoneId?: string; // Optional link to a zone
  type: ReportType;
  description: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  submittedAt: string;
  status: ReportStatus;
  aiAnalysis?: AIAnalysis;
  severity: ReportSeverity;
  confidence: number;
}

export interface InfrastructureImpact {
  zoneId: string;
  affectedRoad: string;
  affectedVillages: string[];
  populationAffected: number;
  hospital: string;
  primaryRouteStatus: 'OPEN' | 'PARTIALLY_BLOCKED' | 'BLOCKED';
  alternateRoute: string;
  additionalTravelMinutes: number;
  priorityScore: number;
}

export interface PriorityIncident {
  id: string;
  zoneId: string;
  zoneName: string;
  riskScore: number;
  impactScore: number;
  connectivityScore: number;
  priorityScore: number;
  status: RiskLevel;
}
