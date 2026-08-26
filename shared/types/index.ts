export interface RegionConfig {
  id: string;
  name: string;
  center: { lat: number; lng: number };
  land_tenure_term: string;
  languages: string[];
  critical_rainfall_threshold_mm_hr: number;
}

export interface KhasraParcel {
  khasra_id: string;
  ward: string;
  owner_name: string;
  family_count: number;
  slope_deg: number;
  structure_type: string;
  factor_of_safety: number;
  risk_tier: "LOW" | "MODERATE" | "HIGH";
  safe_shelter: string;
}

export interface StaticRiskPrediction {
  static_susceptibility_score: number;
  risk_tier: "LOW" | "MODERATE" | "HIGH";
  top_contributing_factors: { feature: string; contribution: number }[];
  provenance: string;
}

export interface FieldReport {
  report_id: string;
  latitude: number;
  longitude: number;
  hazard_type: string;
  confidence: number;
  image_url_or_hash?: string;
  is_offline_cached: boolean;
  timestamp_iso: string;
}
