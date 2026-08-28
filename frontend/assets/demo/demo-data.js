/**
 * GeoRaksha / GeoResilience-360 — Bundled Local Demo Datasets
 * Ensures 100% offline demonstration capability.
 */
window.GEO_DEMO_DATA = {
  hierarchy: {
    country: "India",
    regions: [
      {
        id: "SK",
        name: "Sikkim",
        type: "State",
        bbox: [88.01, 27.08, 88.92, 28.13],
        center: [27.5330, 88.5122],
        hazard: "Glacial Lake Outburst (GLOF) & Landslides",
        landTerm: "Khasra / Dag / RoR",
        districts: [
          {
            id: "SK-E",
            name: "East Sikkim (Gangtok District)",
            center: [27.3314, 88.6138],
            localAreas: [
              {
                id: "SK-E-GTK",
                name: "Gangtok Urban & Ridge Corridor",
                center: [27.3314, 88.6138],
                parcels: [
                  { id: "104A", khasraNo: "104/A", name: "Upper Gangtok Ridge Sector 1", slope: 42.6, elevation: 1420, baseFos: 1.42, residents: 9, insarDisplacement: "-14.2 mm/yr", soilMoisture: "32%", status: "Watch" },
                  { id: "104B", khasraNo: "104/B", name: "Upper Gangtok Ridge Sector 2", slope: 39.1, elevation: 1390, baseFos: 1.38, residents: 4, insarDisplacement: "-11.8 mm/yr", soilMoisture: "34%", status: "Watch" },
                  { id: "104C", khasraNo: "104/C", name: "Tadong Valley Terrace A", slope: 24.0, elevation: 1150, baseFos: 1.85, residents: 0, insarDisplacement: "-1.1 mm/yr", soilMoisture: "24%", status: "Stable" },
                  { id: "104D", khasraNo: "104/D", name: "Tadong Valley Terrace B", slope: 19.5, elevation: 1110, baseFos: 2.10, residents: 0, insarDisplacement: "-0.5 mm/yr", soilMoisture: "21%", status: "Stable" }
                ]
              },
              {
                id: "SK-E-RNP",
                name: "Ranipool & Singtam Highway Zone",
                center: [27.2800, 88.5900],
                parcels: [
                  { id: "201A", khasraNo: "201/A", name: "Ranipool Bypass Slope", slope: 31.0, elevation: 980, baseFos: 1.55, residents: 12, insarDisplacement: "-3.1 mm/yr", soilMoisture: "28%", status: "Stable" }
                ]
              }
            ]
          },
          {
            id: "SK-N",
            name: "North Sikkim (Mangan District)",
            center: [27.5000, 88.5300],
            localAreas: [
              { id: "SK-N-MGN", name: "Mangan Sub-Division", center: [27.5000, 88.5300], parcels: [] }
            ]
          }
        ]
      },
      {
        id: "KL",
        name: "Kerala",
        type: "State",
        bbox: [74.85, 8.28, 77.41, 12.79],
        center: [10.8505, 76.2711],
        hazard: "Wayanad-Style Landslides & Extreme Flooding",
        landTerm: "Thandaper / Pokkuvaravu",
        districts: [
          {
            id: "KL-WY",
            name: "Wayanad District",
            center: [11.6854, 76.1320],
            localAreas: [
              {
                id: "KL-WY-MEP",
                name: "Meppadi & Chooralmala Slope Sector",
                center: [11.5333, 76.1167],
                parcels: [
                  { id: "W101", khasraNo: "Sy. 402/1", name: "Chooralmala Tea Plantation Upper Slope", slope: 44.0, elevation: 1100, baseFos: 1.35, residents: 28, insarDisplacement: "-18.5 mm/yr", soilMoisture: "41%", status: "Watch" },
                  { id: "W102", khasraNo: "Sy. 402/2", name: "Mundakkai Village Settlement Cluster", slope: 38.5, elevation: 950, baseFos: 1.28, residents: 45, insarDisplacement: "-22.1 mm/yr", soilMoisture: "44%", status: "Watch" }
                ]
              }
            ]
          }
        ]
      },
      {
        id: "HP",
        name: "Himachal Pradesh",
        type: "State",
        bbox: [75.58, 30.38, 79.07, 33.26],
        center: [31.1048, 77.1734],
        hazard: "Cloudburst & Debris Flow",
        landTerm: "Khatauni / Khasra Girdawari",
        districts: [
          {
            id: "HP-KL",
            name: "Kullu District",
            center: [31.9579, 77.1095],
            localAreas: [
              { id: "HP-KL-MNL", name: "Manali Right Bank Corridor", center: [32.2432, 77.1892], parcels: [] }
            ]
          }
        ]
      },
      {
        id: "UK",
        name: "Uttarakhand",
        type: "State",
        bbox: [77.57, 28.72, 81.04, 31.45],
        center: [30.0668, 79.0193],
        hazard: "Joshimath Subsidence & Cloudbursts",
        landTerm: "Khatauni / Khasra",
        districts: [
          {
            id: "UK-CM",
            name: "Chamoli District (Joshimath)",
            center: [30.5562, 79.5603],
            localAreas: [
              { id: "UK-CM-JSH", name: "Joshimath Upper Ward Subsidence Zone", center: [30.5562, 79.5603], parcels: [] }
            ]
          }
        ]
      }
    ]
  },

  samplePrediction: {
    "104A": {
      rainfallThresholds: {
        low: { maxRain: 45, riskScore: 28, fos: 1.42, level: "LOW", color: "#22c55e" },
        med: { maxRain: 80, riskScore: 64, fos: 1.08, level: "AMBER", color: "#f97316" },
        high: { maxRain: 140, riskScore: 92, fos: 0.84, level: "RED", color: "#ef4444" }
      },
      shapBreakdown: [
        { feature: "Simulated Rainfall Intensity", weight: 42, icon: "🌧️" },
        { feature: "Slope Angle (42.6°)", weight: 28, icon: "⛰️" },
        { feature: "Soil Moisture (VWC 88%)", weight: 18, icon: "💧" },
        { feature: "InSAR Displacement (-14.2mm/yr)", weight: 12, icon: "🛰️" }
      ],
      models: {
        xgboostStatic: 68,
        lstmTemporalDelta: 24,
        fusedScore: 92,
        confidence: "94.2%"
      }
    }
  },

  incidents: [
    {
      id: "INC-901",
      title: "Slope Collapse — NH-10 KM 42",
      severity: "sev-critical",
      meta: "22:14 IST · Khasra #GK-4821 · 27.3314°N 88.6138°E",
      desc: "Major slope failure blocking NH-10. ~200m road buried. NDRF Team 3 dispatched. OSRM alternate route computed via Ranipool bypass.",
      location: "NH-10 Highway Corridor",
      khasraId: "104A"
    },
    {
      id: "INC-902",
      title: "Flash Flood Warning — Teesta River",
      severity: "sev-high",
      meta: "21:40 IST · Mangan Sub-Division · River km 18",
      desc: "Upstream debris dam formed. Flow gauge 3.8× normal. 3 riverside Khasra clusters in inundation zone. Evacuation advisory issued.",
      location: "Teesta Basin",
      khasraId: "104B"
    },
    {
      id: "INC-903",
      title: "Crack Report — Tadong Area",
      severity: "sev-medium",
      meta: "19:55 IST · Field Sentinel · Tadong",
      desc: "Citizen report with geo-tagged photo. MobileNetV3 crack confidence: 0.88. Khasra risk score elevated to Watch status.",
      location: "Tadong Sector",
      khasraId: "104A"
    }
  ],

  routes: [
    {
      id: "R1",
      name: "Ranipool Bypass",
      time: "+22 min · 14.3 km",
      status: "st-open",
      statusLabel: "Open",
      icon: "🟢",
      description: "Safe alternate corridor via Ranipool bridge. Fully operational."
    },
    {
      id: "R2",
      name: "Singtam via Rangpo",
      time: "+47 min · 31.8 km",
      status: "st-risk",
      statusLabel: "At Risk",
      icon: "🟡",
      description: "Pore pressure rising on lower cut slopes. Drive with caution."
    },
    {
      id: "R3",
      name: "NH-10 Direct",
      time: "Blocked · KM 42",
      status: "st-block",
      statusLabel: "Blocked",
      icon: "🔴",
      description: "200m debris deposit across carriage-way. Heavy machinery deployed."
    }
  ]
};
