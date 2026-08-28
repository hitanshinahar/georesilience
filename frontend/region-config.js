/**
 * GeoResilience-360 Region Configuration Engine
 * Configured with all 28 States and 8 Union Territories of India (36 Active Regions)
 */

window.GEO_REGIONS = [
  {
    id: "sikkim",
    code: "SK",
    name: "Sikkim",
    type: "State",
    center: [27.5330, 88.5122],
    lat: 27.5330,
    lng: 88.5122,
    bbox: [88.01, 27.08, 88.92, 28.13],
    primaryRisk: "Glacial Lake Outburst (GLOF) & Tectonic Schist Landslide",
    hazard: "Glacial Lake Outburst (GLOF) & Tectonic Schist Landslide",
    cadastreTerm: "Dag / Khasra / Jamabandi RoR",
    landTerm: "Dag / Khasra / Jamabandi RoR",
    languages: ["Nepali", "Bhutia", "Lepcha"],
    rainTriggerLimit: 55.0,
    status: "CRITICAL ALERT",
    activeKhasras: 1240,
    defaultSelected: true,
    sampleParcels: [
      { id: "104/A", owner: "Tashi Lepcha", familyCount: 6, slope: 44.5, baseFos: 1.42, status: "Watch" },
      { id: "104/B", owner: "Pem Bhutia", familyCount: 4, slope: 42.0, baseFos: 1.38, status: "Watch" },
      { id: "118/Govt", owner: "Govt Revenue Reserve (Burtuk)", familyCount: 0, slope: 8.2, baseFos: 2.65, status: "Stable Safe Zone" }
    ]
  },
  {
    id: "himachal-pradesh",
    code: "HP",
    name: "Himachal Pradesh",
    type: "State",
    center: [31.1048, 77.1734],
    lat: 31.1048,
    lng: 77.1734,
    bbox: [75.58, 30.38, 79.07, 33.26],
    primaryRisk: "Cloudburst & Debris Flow",
    hazard: "Cloudburst & Debris Flow",
    cadastreTerm: "Khatauni / Khasra Girdawari",
    landTerm: "Khatauni / Khasra Girdawari",
    languages: ["Hindi", "Pahari"],
    rainTriggerLimit: 65.0,
    status: "Critical",
    activeKhasras: 1840,
    sampleParcels: [
      { id: "HP-302", owner: "Rajesh Verma", familyCount: 5, slope: 38.2, baseFos: 1.51, status: "Stable" },
      { id: "HP-303", owner: "Sunita Devi", familyCount: 3, slope: 46.1, baseFos: 1.25, status: "Watch" }
    ]
  },
  {
    id: "meghalaya",
    code: "ML",
    name: "Meghalaya",
    type: "State",
    center: [25.4670, 91.3662],
    lat: 25.4670,
    lng: 91.3662,
    bbox: [89.80, 25.02, 92.80, 26.12],
    primaryRisk: "Sandstone Gorge Torrent Scour & Mass Slumping",
    hazard: "Sandstone Gorge Torrent Scour & Mass Slumping",
    cadastreTerm: "Khasi Syiemship / Autonomous Council Ledger",
    landTerm: "Khasi Syiemship / Autonomous Council Ledger",
    languages: ["Khasi", "Garo", "English"],
    rainTriggerLimit: 90.0,
    status: "High Risk",
    activeKhasras: 680,
    sampleParcels: [
      { id: "ML-12", owner: "Kynpham Lyngdoh", familyCount: 7, slope: 41.0, baseFos: 1.35, status: "Watch" }
    ]
  },
  {
    id: "kerala",
    code: "KL",
    name: "Kerala",
    type: "State",
    center: [10.8505, 76.2711],
    lat: 10.8505,
    lng: 76.2711,
    bbox: [74.85, 8.28, 77.41, 12.79],
    primaryRisk: "Thandaper / Re-survey Landslides & Flooding",
    hazard: "Deep Soil Liquefaction & Debris Slip",
    cadastreTerm: "Thandaper / Re-survey Pokkuvaravu",
    landTerm: "Thandaper / Re-survey Pokkuvaravu",
    languages: ["Malayalam", "Tamil"],
    rainTriggerLimit: 110.0,
    status: "Critical",
    activeKhasras: 2450,
    sampleParcels: [
      { id: "KL-701", owner: "Venu Nair", familyCount: 5, slope: 36.5, baseFos: 1.48, status: "Stable" }
    ]
  },
  {
    id: "assam",
    code: "AS",
    name: "Assam",
    type: "State",
    center: [26.2006, 92.9376],
    lat: 26.2006,
    lng: 92.9376,
    bbox: [89.70, 24.13, 96.02, 28.00],
    primaryRisk: "Railway Cut & Riverbank Toe Slip",
    hazard: "Brahmaputra Bank Erosion & Floods",
    cadastreTerm: "Dag / Patta / Jamabandi",
    landTerm: "Dag / Patta / Jamabandi",
    languages: ["Assamese", "Bengali", "Bodo"],
    rainTriggerLimit: 85.0,
    status: "Critical",
    activeKhasras: 3100,
    sampleParcels: [
      { id: "AS-88", owner: "Biren Das", familyCount: 4, slope: 29.0, baseFos: 1.62, status: "Stable" }
    ]
  },
  {
    id: "uttarakhand",
    code: "UK",
    name: "Uttarakhand",
    type: "State",
    center: [30.0668, 79.0193],
    lat: 30.0668,
    lng: 79.0193,
    bbox: [77.57, 28.72, 81.04, 31.45],
    primaryRisk: "High-Altitude Shear Rupture & Joshimath Subsidence",
    hazard: "Joshimath Subsidence & Cloudbursts",
    cadastreTerm: "Khatauni / Khasra / Khewat RoR",
    landTerm: "Khatauni / Khasra / Khewat RoR",
    languages: ["Hindi", "Garhwali", "Kumaoni"],
    rainTriggerLimit: 70.0,
    status: "CRITICAL ALERT",
    activeKhasras: 1560,
    sampleParcels: [
      { id: "UK-409", owner: "Harish Rawat", familyCount: 6, slope: 48.0, baseFos: 1.18, status: "High Risk" }
    ]
  },
  {
    id: "maharashtra",
    code: "MH",
    name: "Maharashtra",
    type: "State",
    center: [19.7515, 75.7139],
    lat: 19.7515,
    lng: 75.7139,
    bbox: [72.6, 15.6, 80.9, 22.0],
    primaryRisk: "Western Ghats Basalt Scarp & Landslide",
    hazard: "Konkan Landslides & Urban Surge",
    cadastreTerm: "7/12 Extract (Satbara) & Bhu-Aadhaar",
    landTerm: "7/12 Extract (Satbara) & Bhu-Aadhaar",
    languages: ["Marathi"],
    rainTriggerLimit: 100.0,
    status: "High Risk",
    activeKhasras: 6200,
    sampleParcels: [
      { id: "MH-109", owner: "Sanjay Patil", familyCount: 5, slope: 39.5, baseFos: 1.40, status: "Watch" }
    ]
  },
  {
    id: "jammu-and-kashmir",
    code: "JK",
    name: "Jammu & Kashmir",
    type: "UT",
    center: [33.7782, 76.5762],
    lat: 33.7782,
    lng: 76.5762,
    bbox: [73.2, 32.2, 79.8, 37.1],
    primaryRisk: "Ramban Highway Subsidence (NH-44)",
    hazard: "Ramban Landslides & Avalanche",
    cadastreTerm: "Khasra Girdawari / Jamabandi / Intiqal",
    landTerm: "Khasra Girdawari / Jamabandi / Intiqal",
    languages: ["Urdu", "Kashmiri", "Dogri"],
    rainTriggerLimit: 60.0,
    status: "CRITICAL ALERT",
    activeKhasras: 2100,
    sampleParcels: [
      { id: "JK-55", owner: "Tariq Bhatt", familyCount: 8, slope: 45.0, baseFos: 1.20, status: "Watch" }
    ]
  },
  {
    id: "mizoram",
    code: "MZ",
    name: "Mizoram",
    type: "State",
    center: [23.1645, 92.9376],
    lat: 23.1645,
    lng: 92.9376,
    bbox: [92.2, 21.9, 93.4, 24.5],
    primaryRisk: "Shale Ridge-Top Mass Failure",
    hazard: "Aizawl Slope Collapse",
    cadastreTerm: "Land Settlement Certificate (LSC)",
    landTerm: "Land Settlement Certificate (LSC)",
    languages: ["Mizo", "English"],
    rainTriggerLimit: 75.0,
    status: "Critical",
    activeKhasras: 590,
    sampleParcels: [
      { id: "MZ-44", owner: "Lalthlamuana", familyCount: 4, slope: 47.5, baseFos: 1.15, status: "High Risk" }
    ]
  },
  {
    id: "arunachal-pradesh",
    code: "AR",
    name: "Arunachal Pradesh",
    type: "State",
    center: [28.2180, 94.7278],
    lat: 28.2180,
    lng: 94.7278,
    bbox: [91.5, 26.6, 97.4, 29.5],
    primaryRisk: "Orographic Torrent Debris",
    hazard: "Flash Floods & Slope Instability",
    cadastreTerm: "Land Possession Certificate (LPC)",
    landTerm: "Land Possession Certificate (LPC)",
    languages: ["Nyishi", "Adi", "Hindi"],
    rainTriggerLimit: 80.0,
    status: "High Risk",
    activeKhasras: 850,
    sampleParcels: [
      { id: "AR-12", owner: "Kiren Tuki", familyCount: 5, slope: 43.0, baseFos: 1.32, status: "Watch" }
    ]
  },
  {
    id: "nagaland",
    code: "NL",
    name: "Nagaland",
    type: "State",
    center: [26.1584, 94.5624],
    lat: 26.1584,
    lng: 94.5624,
    bbox: [93.3, 25.2, 95.2, 27.0],
    primaryRisk: "Clay-Rich Slope Subsidence",
    hazard: "Naga Hills Subsidence",
    cadastreTerm: "Village Council Land Registry",
    landTerm: "Village Council Land Registry",
    languages: ["Ao", "Angami", "Nagamese"],
    rainTriggerLimit: 70.0,
    status: "High Risk",
    activeKhasras: 510,
    sampleParcels: [
      { id: "NL-89", owner: "Imti Naga", familyCount: 6, slope: 40.2, baseFos: 1.36, status: "Watch" }
    ]
  },
  {
    id: "manipur",
    code: "MN",
    name: "Manipur",
    type: "State",
    center: [24.6637, 93.9063],
    lat: 24.6637,
    lng: 93.9063,
    bbox: [93.0, 23.8, 94.8, 25.7],
    primaryRisk: "Valley Edge Toe Scouring",
    hazard: "Hill Slope Mudslides",
    cadastreTerm: "Dag / Patta (Meitei Record)",
    landTerm: "Dag / Patta (Meitei Record)",
    languages: ["Manipuri (Meiteilon)", "English"],
    rainTriggerLimit: 75.0,
    status: "High Risk",
    activeKhasras: 720,
    sampleParcels: [
      { id: "MN-30", owner: "N. Singh", familyCount: 5, slope: 41.5, baseFos: 1.31, status: "Watch" }
    ]
  },
  {
    id: "tripura",
    code: "TR",
    name: "Tripura",
    type: "State",
    center: [23.9408, 91.9882],
    lat: 23.9408,
    lng: 91.9882,
    bbox: [91.1, 22.9, 92.3, 24.5],
    primaryRisk: "Hillock Sand-Clay Slumping",
    hazard: "Flash Floods & Hill Erosion",
    cadastreTerm: "Khatian / Jote Record",
    landTerm: "Khatian / Jote Record",
    languages: ["Kokborok", "Bengali"],
    rainTriggerLimit: 85.0,
    status: "High Risk",
    activeKhasras: 610,
    sampleParcels: [
      { id: "TR-19", owner: "Bikram Debbarma", familyCount: 4, slope: 35.0, baseFos: 1.45, status: "Stable" }
    ]
  },
  {
    id: "tamil-nadu",
    code: "TN",
    name: "Tamil Nadu",
    type: "State",
    center: [11.1271, 78.6569],
    lat: 11.1271,
    lng: 78.6569,
    bbox: [76.2, 8.1, 80.3, 13.5],
    primaryRisk: "Nilgiris Terrace Landslide",
    hazard: "Nilgiris Landslides & Coastal Storms",
    cadastreTerm: "Patta / Chitta Extract",
    landTerm: "Patta / Chitta Extract",
    languages: ["Tamil"],
    rainTriggerLimit: 95.0,
    status: "High Risk",
    activeKhasras: 4800,
    sampleParcels: [
      { id: "TN-401", owner: "S. Murugan", familyCount: 5, slope: 37.8, baseFos: 1.42, status: "Stable" }
    ]
  },
  {
    id: "karnataka",
    code: "KA",
    name: "Karnataka",
    type: "State",
    center: [15.3173, 75.7139],
    lat: 15.3173,
    lng: 75.7139,
    bbox: [74.1, 11.6, 78.6, 18.5],
    primaryRisk: "Malenadu Soil Liquefaction",
    hazard: "Kodagu Landslides & Coastal Surge",
    cadastreTerm: "RTC / Pahani (Form 16)",
    landTerm: "RTC / Pahani (Form 16)",
    languages: ["Kannada"],
    rainTriggerLimit: 100.0,
    status: "Active Monitor",
    activeKhasras: 3890,
    sampleParcels: [
      { id: "KA-512", owner: "Manjunath Gowda", familyCount: 6, slope: 38.0, baseFos: 1.44, status: "Stable" }
    ]
  },
  {
    id: "west-bengal",
    code: "WB",
    name: "West Bengal (Darjeeling)",
    type: "State",
    center: [22.9868, 87.8550],
    lat: 22.9868,
    lng: 87.8550,
    bbox: [85.8, 21.5, 89.9, 27.2],
    primaryRisk: "Tea Garden Slope Creep",
    hazard: "Sundarbans Sea Erosion & Darjeeling Landslides",
    cadastreTerm: "Khatian (LR / RS) & Porcha Record",
    landTerm: "Khatian (LR / RS) & Porcha Record",
    languages: ["Nepali", "Bengali"],
    rainTriggerLimit: 85.0,
    status: "Critical",
    activeKhasras: 4300,
    sampleParcels: [
      { id: "WB-202", owner: "Subhash Roy", familyCount: 4, slope: 42.1, baseFos: 1.30, status: "Watch" }
    ]
  },
  {
    id: "andhra-pradesh",
    code: "AP",
    name: "Andhra Pradesh",
    type: "State",
    center: [15.9129, 79.7400],
    lat: 15.9129,
    lng: 79.7400,
    bbox: [76.8, 12.6, 84.8, 19.1],
    primaryRisk: "Coastal Cyclone & Inundation Surge",
    hazard: "Coastal Cyclone & Flooding",
    cadastreTerm: "Patta / Adangal",
    landTerm: "Patta / Adangal",
    languages: ["Telugu"],
    rainTriggerLimit: 105.0,
    status: "Active Monitor",
    activeKhasras: 1420,
    sampleParcels: [
      { id: "AP-67", owner: "Raju Reddy", familyCount: 5, slope: 22.0, baseFos: 1.85, status: "Stable" }
    ]
  },
  {
    id: "bihar",
    code: "BR",
    name: "Bihar",
    type: "State",
    center: [25.0961, 85.3131],
    lat: 25.0961,
    lng: 85.3131,
    bbox: [83.3, 24.3, 88.3, 27.5],
    primaryRisk: "Kosi River Flooding & Bank Collapse",
    hazard: "Kosi River Flooding",
    cadastreTerm: "Khata / Khasra",
    landTerm: "Khata / Khasra",
    languages: ["Hindi", "Maithili", "Bhojpuri"],
    rainTriggerLimit: 90.0,
    status: "Critical",
    activeKhasras: 2890,
    sampleParcels: [
      { id: "BR-90", owner: "Manoj Kumar", familyCount: 7, slope: 12.0, baseFos: 2.10, status: "Stable" }
    ]
  },
  {
    id: "chhattisgarh",
    code: "CT",
    name: "Chhattisgarh",
    type: "State",
    center: [21.2787, 81.8661],
    lat: 21.2787,
    lng: 81.8661,
    bbox: [80.2, 17.8, 84.4, 24.1],
    primaryRisk: "Mining Subsidence & Flash Slag Spills",
    hazard: "Mining Subsidence & Flash Spills",
    cadastreTerm: "Khasra / B-1 Ledger",
    landTerm: "Khasra / B-1 Ledger",
    languages: ["Chhattisgarhi", "Hindi"],
    rainTriggerLimit: 95.0,
    status: "Active Monitor",
    activeKhasras: 1950,
    sampleParcels: [
      { id: "CT-44", owner: "Ramesh Sahu", familyCount: 5, slope: 18.5, baseFos: 1.90, status: "Stable" }
    ]
  },
  {
    id: "goa",
    code: "GA",
    name: "Goa",
    type: "State",
    center: [15.2993, 74.1240],
    lat: 15.2993,
    lng: 74.1240,
    bbox: [73.6, 14.9, 74.3, 15.8],
    primaryRisk: "Western Ghats Mining Cut Slope Failure",
    hazard: "Western Ghats Landslides",
    cadastreTerm: "Form I & XIV",
    landTerm: "Form I & XIV",
    languages: ["Konkani", "Marathi"],
    rainTriggerLimit: 110.0,
    status: "Moderate",
    activeKhasras: 640,
    sampleParcels: [
      { id: "GA-15", owner: "Aleixo Fernandes", familyCount: 4, slope: 34.0, baseFos: 1.55, status: "Stable" }
    ]
  },
  {
    id: "gujarat",
    code: "GJ",
    name: "Gujarat",
    type: "State",
    center: [22.2587, 71.1924],
    lat: 22.2587,
    lng: 71.1924,
    bbox: [68.1, 20.1, 74.5, 24.7],
    primaryRisk: "Kutch Earthquake Liquefaction",
    hazard: "Coastal Erosion & Earthquakes",
    cadastreTerm: "7/12 Extract (Satbara)",
    landTerm: "7/12 Extract (Satbara)",
    languages: ["Gujarati"],
    rainTriggerLimit: 100.0,
    status: "Active Monitor",
    activeKhasras: 4120,
    sampleParcels: [
      { id: "GJ-80", owner: "Bhavesh Patel", familyCount: 5, slope: 15.0, baseFos: 2.05, status: "Stable" }
    ]
  },
  {
    id: "haryana",
    code: "HR",
    name: "Haryana",
    type: "State",
    center: [29.0588, 76.0856],
    lat: 29.0588,
    lng: 76.0856,
    bbox: [74.4, 27.6, 77.6, 30.9],
    primaryRisk: "Urban Inundation & Soil Salinity",
    hazard: "Urban Inundation & Soil Salinity",
    cadastreTerm: "Jamabandi / Khasra",
    landTerm: "Jamabandi / Khasra",
    languages: ["Haryanvi", "Hindi"],
    rainTriggerLimit: 80.0,
    status: "Stable",
    activeKhasras: 2100,
    sampleParcels: [
      { id: "HR-33", owner: "Virender Singh", familyCount: 6, slope: 16.0, baseFos: 2.00, status: "Stable" }
    ]
  },
  {
    id: "jharkhand",
    code: "JH",
    name: "Jharkhand",
    type: "State",
    center: [23.6102, 85.2799],
    lat: 23.6102,
    lng: 85.2799,
    bbox: [83.3, 21.9, 87.9, 25.3],
    primaryRisk: "Coal Mine Pit Wall Collapse & Subsidence",
    hazard: "Coal Mine Subsidence & Erosion",
    cadastreTerm: "Khatian / Register II",
    landTerm: "Khatian / Register II",
    languages: ["Hindi", "Santhali"],
    rainTriggerLimit: 85.0,
    status: "High Risk",
    activeKhasras: 1670,
    sampleParcels: [
      { id: "JH-71", owner: "Birsa Munda", familyCount: 5, slope: 32.0, baseFos: 1.50, status: "Stable" }
    ]
  },
  {
    id: "madhya-pradesh",
    code: "MP",
    name: "Madhya Pradesh",
    type: "State",
    center: [22.9734, 78.6569],
    lat: 22.9734,
    lng: 78.6569,
    bbox: [74.0, 21.1, 82.8, 26.9],
    primaryRisk: "Chambal Ravine Erosion",
    hazard: "Riverine Floods & Ravine Erosion",
    cadastreTerm: "Khasra / Khatauni",
    landTerm: "Khasra / Khatauni",
    languages: ["Hindi"],
    rainTriggerLimit: 85.0,
    status: "Active Monitor",
    activeKhasras: 5100,
    sampleParcels: [
      { id: "MP-99", owner: "Shivraj Chouhan", familyCount: 6, slope: 20.0, baseFos: 1.88, status: "Stable" }
    ]
  },
  {
    id: "odisha",
    code: "OD",
    name: "Odisha",
    type: "State",
    center: [20.9517, 85.0985],
    lat: 20.9517,
    lng: 85.0985,
    bbox: [81.4, 17.8, 87.5, 22.6],
    primaryRisk: "Super Cyclones & Coastal Surge",
    hazard: "Super Cyclones & Coastal Surge",
    cadastreTerm: "RoR (Record of Rights) / Khatian",
    landTerm: "RoR (Record of Rights)",
    languages: ["Odia"],
    rainTriggerLimit: 110.0,
    status: "Critical",
    activeKhasras: 3400,
    sampleParcels: [
      { id: "OD-14", owner: "Biju Patnaik", familyCount: 5, slope: 14.0, baseFos: 2.10, status: "Stable" }
    ]
  },
  {
    id: "punjab",
    code: "PB",
    name: "Punjab",
    type: "State",
    center: [31.1471, 75.3412],
    lat: 31.1471,
    lng: 75.3412,
    bbox: [73.9, 29.5, 76.9, 32.5],
    primaryRisk: "Sutlej River Overtopping",
    hazard: "Sutlej River Overtopping",
    cadastreTerm: "Fard / Jamabandi",
    landTerm: "Fard / Jamabandi",
    languages: ["Punjabi"],
    rainTriggerLimit: 75.0,
    status: "Moderate",
    activeKhasras: 2300,
    sampleParcels: [
      { id: "PB-88", owner: "Gurpreet Singh", familyCount: 6, slope: 10.0, baseFos: 2.20, status: "Stable" }
    ]
  },
  {
    id: "rajasthan",
    code: "RJ",
    name: "Rajasthan",
    type: "State",
    center: [27.0238, 74.2179],
    lat: 27.0238,
    lng: 74.2179,
    bbox: [69.5, 23.3, 78.3, 30.2],
    primaryRisk: "Flash Drought & Sand Movement",
    hazard: "Flash Drought & Sand Movement",
    cadastreTerm: "Jamabandi / Khasra",
    landTerm: "Jamabandi / Khasra",
    languages: ["Rajasthani", "Hindi"],
    rainTriggerLimit: 60.0,
    status: "Stable",
    activeKhasras: 4900,
    sampleParcels: [
      { id: "RJ-402", owner: "Kanwar Lal", familyCount: 5, slope: 11.0, baseFos: 2.30, status: "Stable" }
    ]
  },
  {
    id: "telangana",
    code: "TS",
    name: "Telangana",
    type: "State",
    center: [18.1124, 79.0193],
    lat: 18.1124,
    lng: 79.0193,
    bbox: [77.2, 15.8, 81.3, 19.9],
    primaryRisk: "Urban Inundation (Hyderabad)",
    hazard: "Urban Inundation (Hyderabad)",
    cadastreTerm: "Dharani Record / Pattadar Passbook",
    landTerm: "Dharani Record / Pattadar Passbook",
    languages: ["Telugu", "Urdu"],
    rainTriggerLimit: 95.0,
    status: "Active Monitor",
    activeKhasras: 2900,
    sampleParcels: [
      { id: "TS-66", owner: "K. Rao", familyCount: 4, slope: 19.0, baseFos: 1.95, status: "Stable" }
    ]
  },
  {
    id: "uttar-pradesh",
    code: "UP",
    name: "Uttar Pradesh",
    type: "State",
    center: [26.8467, 80.9462],
    lat: 26.8467,
    lng: 80.9462,
    bbox: [77.1, 23.9, 84.6, 30.4],
    primaryRisk: "Ganga-Yamuna River Basin Flooding",
    hazard: "Ganga-Yamuna River Basin Flooding",
    cadastreTerm: "Khatauni / Khasra Code",
    landTerm: "Khatauni / Khasra Code",
    languages: ["Hindi", "Urdu"],
    rainTriggerLimit: 85.0,
    status: "Active Monitor",
    activeKhasras: 8400,
    sampleParcels: [
      { id: "UP-101", owner: "Ram Kumar", familyCount: 8, slope: 13.0, baseFos: 2.15, status: "Stable" }
    ]
  },
  {
    id: "andaman-and-nicobar",
    code: "AN",
    name: "Andaman and Nicobar Islands",
    type: "UT",
    center: [11.7401, 92.6586],
    lat: 11.7401,
    lng: 92.6586,
    bbox: [92.2, 6.7, 93.9, 13.7],
    primaryRisk: "Tsunami & Marine Erosion",
    hazard: "Tsunami & Marine Erosion",
    cadastreTerm: "RoR / Grant Record",
    landTerm: "RoR / Grant Record",
    languages: ["Hindi", "Bengali", "Tamil"],
    rainTriggerLimit: 120.0,
    status: "Moderate",
    activeKhasras: 320,
    sampleParcels: [
      { id: "AN-05", owner: "Island Territory Reserve", familyCount: 3, slope: 25.0, baseFos: 1.70, status: "Stable" }
    ]
  },
  {
    id: "chandigarh",
    code: "CH",
    name: "Chandigarh",
    type: "UT",
    center: [30.7333, 76.7794],
    lat: 30.7333,
    lng: 76.7794,
    bbox: [76.7, 30.6, 76.8, 30.8],
    primaryRisk: "Urban Heat & Drainage Backflow",
    hazard: "Urban Heat & Drainage Backflow",
    cadastreTerm: "Urban Allotment Record",
    landTerm: "Urban Allotment Record",
    languages: ["Hindi", "Punjabi", "English"],
    rainTriggerLimit: 75.0,
    status: "Stable",
    activeKhasras: 180,
    sampleParcels: [
      { id: "CH-12", owner: "Sec 17 Commercial Plot", familyCount: 0, slope: 4.0, baseFos: 2.80, status: "Stable" }
    ]
  },
  {
    id: "dadra-nagar-haveli-daman-diu",
    code: "DN",
    name: "Dadra & Nagar Haveli and Daman & Diu",
    type: "UT",
    center: [20.1809, 73.0169],
    lat: 20.1809,
    lng: 73.0169,
    bbox: [72.8, 20.0, 73.2, 20.5],
    primaryRisk: "Coastal Inundation",
    hazard: "Coastal Inundation",
    cadastreTerm: "7/12 & Property Card",
    landTerm: "7/12 & Property Card",
    languages: ["Gujarati", "Marathi", "Hindi"],
    rainTriggerLimit: 100.0,
    status: "Stable",
    activeKhasras: 290,
    sampleParcels: [
      { id: "DN-08", owner: "Daman Coastal Parcel", familyCount: 3, slope: 10.0, baseFos: 2.20, status: "Stable" }
    ]
  },
  {
    id: "delhi",
    code: "DL",
    name: "Delhi (NCT)",
    type: "UT",
    center: [28.7041, 77.1025],
    lat: 28.7041,
    lng: 77.1025,
    bbox: [76.8, 28.4, 77.3, 28.9],
    primaryRisk: "Yamuna Floodplain Inundation",
    hazard: "Yamuna Floodplain Inundation",
    cadastreTerm: "Khasra / Khatauni / DDA Property Card",
    landTerm: "Khasra / Khatauni / DDA Property Card",
    languages: ["Hindi", "English", "Punjabi"],
    rainTriggerLimit: 70.0,
    status: "Active Monitor",
    activeKhasras: 1100,
    sampleParcels: [
      { id: "DL-45", owner: "Yamuna Bank DDA Sector", familyCount: 5, slope: 9.0, baseFos: 2.10, status: "Stable" }
    ]
  },
  {
    id: "ladakh",
    code: "LA",
    name: "Ladakh",
    type: "UT",
    center: [34.1526, 77.5771],
    lat: 34.1526,
    lng: 77.5771,
    bbox: [75.5, 32.5, 80.5, 36.0],
    primaryRisk: "Glacial Retreat & Flash Outburst",
    hazard: "Glacial Retreat & Flash Outburst",
    cadastreTerm: "Khasra Record",
    landTerm: "Khasra Record",
    languages: ["Ladakhi", "Balti", "Urdu"],
    rainTriggerLimit: 45.0,
    status: "High Risk",
    activeKhasras: 430,
    sampleParcels: [
      { id: "LA-01", owner: "Stanzin Norbu", familyCount: 4, slope: 41.0, baseFos: 1.28, status: "Watch" }
    ]
  },
  {
    id: "lakshadweep",
    code: "LD",
    name: "Lakshadweep",
    type: "UT",
    center: [10.5667, 72.6417],
    lat: 10.5667,
    lng: 72.6417,
    bbox: [71.5, 8.0, 74.0, 12.5],
    primaryRisk: "Coral Atoll Sea Level Rise",
    hazard: "Coral Atoll Sea Level Rise",
    cadastreTerm: "Janmam / Island Land Record",
    landTerm: "Janmam / Island Land Record",
    languages: ["Mahl", "Malayalam"],
    rainTriggerLimit: 115.0,
    status: "High Risk",
    activeKhasras: 150,
    sampleParcels: [
      { id: "LD-03", owner: "Kavaratti Atoll Parcel", familyCount: 6, slope: 3.0, baseFos: 2.90, status: "Stable" }
    ]
  },
  {
    id: "puducherry",
    code: "PY",
    name: "Puducherry",
    type: "UT",
    center: [11.9416, 79.8083],
    lat: 11.9416,
    lng: 79.8083,
    bbox: [79.6, 11.8, 80.0, 12.1],
    primaryRisk: "Storm Surge & Coastal Salinization",
    hazard: "Storm Surge & Coastal Salinization",
    cadastreTerm: "Patta / Revenue Record",
    landTerm: "Patta / Revenue Record",
    languages: ["Tamil", "French", "English"],
    rainTriggerLimit: 100.0,
    status: "Active Monitor",
    activeKhasras: 340,
    sampleParcels: [
      { id: "PY-18", owner: "Jean Luc Coastal Land", familyCount: 3, slope: 8.0, baseFos: 2.40, status: "Stable" }
    ]
  }
];

window.getRegionById = function(id) {
  if (!id) return window.GEO_REGIONS[0];
  const query = id.toString().toLowerCase();
  return window.GEO_REGIONS.find(r => r.id === query || r.code.toLowerCase() === query) || window.GEO_REGIONS[0];
};

window.getDefaultRegion = function() {
  const savedId = localStorage.getItem('geo360_selected_region') || localStorage.getItem('active_region');
  if (savedId) {
    const r = window.getRegionById(savedId);
    if (r) return r;
  }
  return window.GEO_REGIONS.find(r => r.defaultSelected) || window.GEO_REGIONS[0];
};

window.setSelectedRegion = function(regionId) {
  const reg = window.getRegionById(regionId);
  if (reg) {
    localStorage.setItem('geo360_selected_region', reg.id);
    localStorage.setItem('active_region', reg.id);
    localStorage.setItem('geo360_selected_region_name', reg.name);
    window.dispatchEvent(new CustomEvent('regionChanged', { detail: reg }));
  }
  return reg;
};

// Sub-division generator
window.getDistrictsForRegion = function(regionId) {
  const reg = window.getRegionById(regionId);
  return [
    { id: `${reg.id}-dist-1`, name: `${reg.name} Capital / Sector A`, center: reg.center },
    { id: `${reg.id}-dist-2`, name: `${reg.name} Highland Sector B`, center: [reg.lat + 0.1, reg.lng + 0.1] }
  ];
};

window.getLocalAreasForDistrict = function(districtId) {
  return [
    { id: `${districtId}-la-1`, name: `High-Risk Slope Corridor 104`, center: [27.33, 88.61] },
    { id: `${districtId}-la-2`, name: `Valley Highway Resettlement Zone`, center: [27.28, 88.59] }
  ];
};
