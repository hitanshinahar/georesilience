import { RiskZone, FieldReport, InfrastructureImpact, PriorityIncident } from '@/types';
import { MOCK_ZONES, MOCK_REPORTS, MOCK_IMPACTS, MOCK_INCIDENTS } from '../mock-data';

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== 'false';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const api = {
  async getRiskZones(): Promise<RiskZone[]> {
    if (USE_MOCK_DATA) {
      return MOCK_ZONES;
    }
    const res = await fetch(`${API_BASE_URL}/risk`);
    if (!res.ok) throw new Error('Failed to fetch risk zones');
    return res.json();
  },

  async getPriorityIncidents(): Promise<PriorityIncident[]> {
    if (USE_MOCK_DATA) {
      return MOCK_INCIDENTS;
    }
    const res = await fetch(`${API_BASE_URL}/priority`);
    if (!res.ok) throw new Error('Failed to fetch incidents');
    return res.json();
  },

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
  }
};
