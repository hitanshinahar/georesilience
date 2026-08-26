import { RiskZone, FieldReport, InfrastructureImpact, PriorityIncident } from '@/types';
import { addDays, subHours, subMinutes } from 'date-fns';

const now = new Date();

export const MOCK_ZONES: RiskZone[] = [
  {
    id: 'SK-GTK-042',
    name: 'NH-10 Sector 4',
    latitude: 27.3235,
    longitude: 88.5120,
    riskScore: 91,
    riskLevel: 'CRITICAL',
    confidence: 87,
    environmentalFactors: {
      rainfall24h: 148,
      rainfall7d: 320,
      soilMoisture: 84,
      slope: 42,
      historicalEvents: 6,
    },
    topFactors: [
      { factor: 'Rainfall', contribution: 32 },
      { factor: 'Soil Moisture', contribution: 24 },
      { factor: 'Slope Gradient', contribution: 18 },
      { factor: 'Historical Risk', contribution: 12 },
    ],
    affectedInfrastructure: ['NH-10', 'STNM Hospital Route'],
    recommendedActions: [
      'Dispatch field verification team',
      'Monitor NH-10 Sector 4',
      'Notify nearby communities',
      'Pre-position emergency response'
    ],
    lastUpdated: subMinutes(now, 5).toISOString(),
  },
  {
    id: 'SK-GTK-088',
    name: 'Ranka Road Corridor',
    latitude: 27.3320,
    longitude: 88.5830,
    riskScore: 88,
    riskLevel: 'HIGH',
    confidence: 82,
    environmentalFactors: {
      rainfall24h: 110,
      rainfall7d: 280,
      soilMoisture: 78,
      slope: 38,
      historicalEvents: 3,
    },
    topFactors: [
      { factor: 'Rainfall', contribution: 28 },
      { factor: 'Soil Moisture', contribution: 22 },
      { factor: 'Slope Gradient', contribution: 15 },
    ],
    affectedInfrastructure: ['Ranka Road'],
    recommendedActions: [
      'Alert local authorities',
      'Deploy ground sensors'
    ],
    lastUpdated: subMinutes(now, 15).toISOString(),
  },
  {
    id: 'SK-GTK-112',
    name: 'Upper Sichey',
    latitude: 27.3385,
    longitude: 88.6122,
    riskScore: 82,
    riskLevel: 'HIGH',
    confidence: 76,
    environmentalFactors: {
      rainfall24h: 95,
      rainfall7d: 240,
      soilMoisture: 72,
      slope: 35,
      historicalEvents: 2,
    },
    topFactors: [
      { factor: 'Rainfall', contribution: 25 },
      { factor: 'Soil Moisture', contribution: 20 },
      { factor: 'Slope Gradient', contribution: 14 },
    ],
    affectedInfrastructure: ['Sichey Link Road'],
    recommendedActions: [
      'Monitor closely',
      'Prepare advisory'
    ],
    lastUpdated: subHours(now, 1).toISOString(),
  },
  {
    id: 'SK-GTK-055',
    name: 'Burtuk Area',
    latitude: 27.3501,
    longitude: 88.6210,
    riskScore: 76,
    riskLevel: 'HIGH',
    confidence: 62,
    environmentalFactors: {
      rainfall24h: 85,
      rainfall7d: 210,
      soilMoisture: 68,
      slope: 30,
      historicalEvents: 1,
    },
    topFactors: [
      { factor: 'Rainfall', contribution: 20 },
      { factor: 'Soil Moisture', contribution: 18 },
    ],
    affectedInfrastructure: ['Burtuk Road'],
    recommendedActions: [
      'Request Field Verification',
    ],
    lastUpdated: subHours(now, 2).toISOString(),
  },
  {
    id: 'SK-GTK-201',
    name: 'Tadong',
    latitude: 27.3150,
    longitude: 88.5980,
    riskScore: 65,
    riskLevel: 'MODERATE',
    confidence: 85,
    environmentalFactors: {
      rainfall24h: 50,
      rainfall7d: 150,
      soilMoisture: 60,
      slope: 25,
      historicalEvents: 0,
    },
    topFactors: [
      { factor: 'Rainfall', contribution: 15 },
      { factor: 'Soil Moisture', contribution: 10 },
    ],
    affectedInfrastructure: [],
    recommendedActions: [
      'Routine monitoring',
    ],
    lastUpdated: subHours(now, 4).toISOString(),
  },
  {
    id: 'SK-GTK-015',
    name: 'Deorali',
    latitude: 27.3200,
    longitude: 88.6050,
    riskScore: 45,
    riskLevel: 'LOW',
    confidence: 90,
    environmentalFactors: {
      rainfall24h: 30,
      rainfall7d: 100,
      soilMoisture: 50,
      slope: 20,
      historicalEvents: 0,
    },
    topFactors: [],
    affectedInfrastructure: [],
    recommendedActions: [],
    lastUpdated: subHours(now, 6).toISOString(),
  }
];

export const MOCK_INCIDENTS: PriorityIncident[] = [
  {
    id: 'INC-001',
    zoneId: 'SK-GTK-042',
    zoneName: 'NH-10 Sector 4',
    riskScore: 91,
    impactScore: 95,
    connectivityScore: 98,
    priorityScore: 96,
    status: 'CRITICAL'
  },
  {
    id: 'INC-002',
    zoneId: 'SK-GTK-088',
    zoneName: 'Ranka Road Corridor',
    riskScore: 88,
    impactScore: 90,
    connectivityScore: 85,
    priorityScore: 91,
    status: 'CRITICAL'
  },
  {
    id: 'INC-003',
    zoneId: 'SK-GTK-112',
    zoneName: 'Upper Sichey',
    riskScore: 82,
    impactScore: 75,
    connectivityScore: 70,
    priorityScore: 76,
    status: 'HIGH'
  }
];

export const MOCK_IMPACTS: InfrastructureImpact[] = [
  {
    zoneId: 'SK-GTK-042',
    affectedRoad: 'NH-10 Sector 4',
    affectedVillages: ['Singtam', 'Rangpo'],
    populationAffected: 1360,
    hospital: 'STNM Hospital',
    primaryRouteStatus: 'BLOCKED',
    alternateRoute: 'Available via Pakyong',
    additionalTravelMinutes: 42,
    priorityScore: 96
  },
  {
    zoneId: 'SK-GTK-088',
    affectedRoad: 'Ranka Road',
    affectedVillages: ['Ranka', 'Luing'],
    populationAffected: 850,
    hospital: 'CRH Tadong',
    primaryRouteStatus: 'PARTIALLY_BLOCKED',
    alternateRoute: 'None',
    additionalTravelMinutes: 25,
    priorityScore: 91
  }
];

export const MOCK_REPORTS: FieldReport[] = [
  {
    id: 'FR-1001',
    zoneId: 'SK-GTK-042',
    type: 'Visible crack',
    description: 'Large surface crack observed across both lanes of NH-10. Subsidence approximately 15cm.',
    latitude: 27.3236,
    longitude: 88.5121,
    submittedAt: subMinutes(now, 30).toISOString(),
    status: 'VERIFIED',
    severity: 'CRITICAL',
    confidence: 95,
    aiAnalysis: {
      indicators: ['Surface crack', 'Road subsidence', 'Asphalt displacement'],
      severity: 'CRITICAL',
      confidence: 92,
      recommendedAction: 'Immediate road closure required'
    }
  },
  {
    id: 'FR-1002',
    zoneId: 'SK-GTK-088',
    type: 'Soil movement',
    description: 'Minor rocks falling from the slope. Soil appears heavily saturated.',
    latitude: 27.3321,
    longitude: 88.5831,
    submittedAt: subHours(now, 2).toISOString(),
    status: 'PENDING',
    severity: 'HIGH',
    confidence: 80,
    aiAnalysis: {
      indicators: ['Rockfall', 'Soil saturation', 'Erosion'],
      severity: 'HIGH',
      confidence: 85,
      recommendedAction: 'Escalate for verification'
    }
  }
];
