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

// Phase 7: Incident Management Types

export type IncidentStatusType =
  | 'OPEN'
  | 'UNDER_REVIEW'
  | 'FIELD_VERIFIED'
  | 'ESCALATED'
  | 'RESOLVED'
  | 'DISMISSED';

export type ReviewActionType = 'VERIFY' | 'ESCALATE' | 'DISMISS' | 'RESOLVE';

export type AlertStatusType = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';

export type AlertSeverity = 'YELLOW' | 'ORANGE' | 'RED';

export interface ReviewAction {
  review_id: string;
  incident_id: string;
  action: string;
  reviewer_id: string;
  note?: string;
  timestamp: string;
}

export interface Incident {
  incident_id: string;
  latitude: number;
  longitude: number;
  location_name?: string;
  status: IncidentStatusType;
  risk_level: string;
  risk_score: number;
  evidence_coverage: number;
  model_agreement: string;
  requires_human_review: boolean;
  recommended_action?: string;
  source: string;
  assessment_data?: Record<string, unknown>;
  linked_report_ids: string[];
  review_history: ReviewAction[];
  created_at: string;
  updated_at: string;
}

export interface Alert {
  alert_id: string;
  incident_id?: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  target_area?: string;
  status: AlertStatusType;
  created_at: string;
}

export interface FieldReportSubmission {
  report_text: string;
  latitude: number;
  longitude: number;
  location_name?: string;
  reporter_type: 'citizen' | 'field_officer';
  timestamp?: string;
  image_url?: string;
}

export interface FieldReportResponse {
  report_id: string;
  report_text: string;
  latitude: number;
  longitude: number;
  location_name?: string;
  reporter_type: string;
  timestamp: string;
  image_url?: string;
  status: string;
  slm_analysis?: Record<string, unknown>;
  linked_incident_id?: string;
  created_at: string;
}

export interface ReviewActionRequest {
  action: ReviewActionType;
  reviewer_id?: string;
  note?: string;
}
