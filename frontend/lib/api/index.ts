import { RiskZone, FieldReport, InfrastructureImpact, PriorityIncident, Incident, Alert, FieldReportSubmission, FieldReportResponse, ReviewActionRequest } from '@/types';
// import { MOCK_ZONES, MOCK_REPORTS, MOCK_IMPACTS, MOCK_INCIDENTS } from '../mock-data';

const USE_MOCK_DATA = false; // Mock data disabled for production

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const api = {


  async getInfrastructureImpacts(): Promise<InfrastructureImpact[]> {
    if (USE_MOCK_DATA) {
      return MOCK_IMPACTS;
    }
    const res = await fetch(`${API_BASE_URL}/infrastructure/impact`);
    if (!res.ok) throw new Error('Failed to fetch impacts');
    return res.json();
  },

  async getFieldReports(): Promise<FieldReport[]> {
    if (USE_MOCK_DATA) {
      return MOCK_REPORTS;
    }
    const res = await fetch(`${API_BASE_URL}/reports`);
    if (!res.ok) throw new Error('Failed to fetch reports');
    return res.json();
  },

  // Phase 7: Incident Management APIs

  async getIncidents(filters?: { risk_level?: string; status?: string; requires_human_review?: boolean }): Promise<Incident[]> {
    const params = new URLSearchParams();
    if (filters?.risk_level) params.set('risk_level', filters.risk_level);
    if (filters?.status) params.set('status', filters.status);
    if (filters?.requires_human_review !== undefined) params.set('requires_human_review', String(filters.requires_human_review));
    const qs = params.toString();
    const res = await fetch(`${API_BASE_URL}/incidents${qs ? `?${qs}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch incidents');
    return res.json();
  },

  async getIncident(id: string): Promise<Incident> {
    const res = await fetch(`${API_BASE_URL}/incidents/${id}`);
    if (!res.ok) throw new Error('Failed to fetch incident');
    return res.json();
  },

  async reviewIncident(id: string, review: ReviewActionRequest): Promise<unknown> {
    const res = await fetch(`${API_BASE_URL}/incidents/${id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Review action failed');
    }
    return res.json();
  },

  async updateIncidentStatus(id: string, status: string, note?: string): Promise<Incident> {
    const res = await fetch(`${API_BASE_URL}/incidents/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, note }),
    });
    if (!res.ok) throw new Error('Failed to update incident status');
    return res.json();
  },

  // Phase 7: Alert APIs

  async getAlerts(filters?: { severity?: string; status?: string }): Promise<Alert[]> {
    const params = new URLSearchParams();
    if (filters?.severity) params.set('severity', filters.severity);
    if (filters?.status) params.set('status', filters.status);
    const qs = params.toString();
    const res = await fetch(`${API_BASE_URL}/alerts${qs ? `?${qs}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch alerts');
    return res.json();
  },

  async acknowledgeAlert(id: string): Promise<Alert> {
    const res = await fetch(`${API_BASE_URL}/alerts/${id}/acknowledge`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to acknowledge alert');
    return res.json();
  },

  async resolveAlert(id: string): Promise<Alert> {
    const res = await fetch(`${API_BASE_URL}/alerts/${id}/resolve`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to resolve alert');
    return res.json();
  },

  // Phase 7: Field Report APIs

  async submitFieldReport(data: FieldReportSubmission): Promise<FieldReportResponse> {
    const res = await fetch(`${API_BASE_URL}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to submit report');
    }
    return res.json();
  },

  async getFieldReportsFromAPI(): Promise<FieldReportResponse[]> {
    const res = await fetch(`${API_BASE_URL}/reports`);
    if (!res.ok) throw new Error('Failed to fetch reports');
    return res.json();
  },
};
