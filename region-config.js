/**
 * GeoResilience-360 Region Configuration Dataset
 * Covers all 28 States and 8 Union Territories of India (36 active regions)
 */

window.GEO_REGIONS = [
  // 28 States
  { id: "AP", name: "Andhra Pradesh", type: "State", lat: 15.9129, lng: 79.7400, landTerm: "Patta / Adangal", hazard: "Coastal Cyclone & Flooding", status: "Active Monitor", activeKhasras: 1420 },
  { id: "AR", name: "Arunachal Pradesh", type: "State", lat: 28.2180, lng: 94.7278, landTerm: "Land Possession Certificate (LPC)", hazard: "Flash Floods & Slope Instability", status: "High Risk", activeKhasras: 850 },
  { id: "AS", name: "Assam", type: "State", lat: 26.2006, lng: 92.9376, landTerm: "Dag / Patta", hazard: "Brahmaputra Bank Erosion & Floods", status: "Critical", activeKhasras: 3100 },
  { id: "BR", name: "Bihar", type: "State", lat: 25.0961, lng: 85.3131, landTerm: "Khata / Khasra", hazard: "Kosi River Flooding", status: "Critical", activeKhasras: 2890 },
  { id: "CT", name: "Chhattisgarh", type: "State", lat: 21.2787, lng: 81.8661, landTerm: "Khasra / B-1", hazard: "Mining Subsidence & Flash Spills", status: "Active Monitor", activeKhasras: 1950 },
  { id: "GA", name: "Goa", type: "State", lat: 15.2993, lng: 74.1240, landTerm: "Form I & XIV", hazard: "Western Ghats Landslides", status: "Moderate", activeKhasras: 640 },
  { id: "GJ", name: "Gujarat", type: "State", lat: 22.2587, lng: 71.1924, landTerm: "7/12 Extract (Satbara)", hazard: "Coastal Erosion & Earthquakes", status: "Active Monitor", activeKhasras: 4120 },
  { id: "HR", name: "Haryana", type: "State", lat: 29.0588, lng: 76.0856, landTerm: "Jamabandi / Khasra", hazard: "Urban Inundation & Soil Salinity", status: "Stable", activeKhasras: 2100 },
  { id: "HP", name: "Himachal Pradesh", type: "State", lat: 31.1048, lng: 77.1734, landTerm: "Khatauni / Khasra Girdawari", hazard: "Cloudburst & Debris Flow", status: "Critical", activeKhasras: 1840 },
  { id: "JH", name: "Jharkhand", type: "State", lat: 23.6102, lng: 85.2799, landTerm: "Khatian / Register II", hazard: "Coal Mine Subsidence & Erosion", status: "High Risk", activeKhasras: 1670 },
  { id: "KA", name: "Karnataka", type: "State", lat: 15.3173, lng: 75.7139, landTerm: "RTC / Pahani (Form 16)", hazard: "Kodagu Landslides & Coastal Surge", status: "Active Monitor", activeKhasras: 3890 },
  { id: "KL", name: "Kerala", type: "State", lat: 10.8505, lng: 76.2711, landTerm: "Thandaper / Pokkuvaravu", hazard: "Wayanad-Style Landslides & Flooding", status: "Critical", activeKhasras: 2450 },
  { id: "MP", name: "Madhya Pradesh", type: "State", lat: 22.9734, lng: 78.6569, landTerm: "Khasra / Khatauni", hazard: "Riverine Floods & Ravine Erosion", status: "Active Monitor", activeKhasras: 5100 },
  { id: "MH", name: "Maharashtra", type: "State", lat: 19.7515, lng: 75.7139, landTerm: "7/12 Extract & Bhu-Aadhaar", hazard: "Konkan Landslides & Urban Surge", status: "High Risk", activeKhasras: 6200 },
  { id: "MN", name: "Manipur", type: "State", lat: 24.6637, lng: 93.9063, landTerm: "Jamabandi / Patta", hazard: "Hill Slope Mudslides", status: "High Risk", activeKhasras: 720 },
  { id: "ML", name: "Meghalaya", type: "State", lat: 25.4670, lng: 91.3662, landTerm: "Patta / Traditional Council Certificate", hazard: "Extreme Rainfall & Landslides", status: "High Risk", activeKhasras: 680 },
  { id: "MZ", name: "Mizoram", type: "State", lat: 23.1645, lng: 92.9376, landTerm: "Land Settlement Certificate (LSC)", hazard: "Aizawl Slope Collapse", status: "Critical", activeKhasras: 590 },
  { id: "NL", name: "Nagaland", type: "State", lat: 26.1584, lng: 94.5624, landTerm: "Patta / Village Council Record", hazard: "Naga Hills Subsidence", status: "High Risk", activeKhasras: 510 },
  { id: "OD", name: "Odisha", type: "State", lat: 20.9517, lng: 85.0985, landTerm: "RoR (Record of Rights)", hazard: "Super Cyclones & Coastal Surge", status: "Critical", activeKhasras: 3400 },
  { id: "PB", name: "Punjab", type: "State", lat: 31.1471, lng: 75.3412, landTerm: "Fard / Jamabandi", hazard: "Sutlej River Overtopping", status: "Moderate", activeKhasras: 2300 },
  { id: "RJ", name: "Rajasthan", type: "State", lat: 27.0238, lng: 74.2179, landTerm: "Jamabandi / Khasra", hazard: "Flash Drought & Sand Movement", status: "Stable", activeKhasras: 4900 },
  { id: "SK", name: "Sikkim", type: "State", lat: 27.5330, lng: 88.5122, landTerm: "Khasra / Dag / RoR", hazard: "Glacial Lake Outburst (GLOF) & Landslides", status: "CRITICAL ALERT", activeKhasras: 1240, defaultSelected: true },
  { id: "TN", name: "Tamil Nadu", type: "State", lat: 11.1271, lng: 78.6569, landTerm: "Patta / Chitta", hazard: "Nilgiris Landslides & Coastal Storms", status: "High Risk", activeKhasras: 4800 },
  { id: "TS", name: "Telangana", type: "State", lat: 18.1124, lng: 79.0193, landTerm: "Dharani Record / Pattadar Passbook", hazard: "Urban Inundation (Hyderabad)", status: "Active Monitor", activeKhasras: 2900 },
  { id: "TR", name: "Tripura", type: "State", lat: 23.9408, lng: 91.9882, landTerm: "Khatian / Khasra", hazard: "Flash Floods & Hill Erosion", status: "High Risk", activeKhasras: 610 },
  { id: "UP", name: "Uttar Pradesh", type: "State", lat: 26.8467, lng: 80.9462, landTerm: "Khatauni / Khasra Code", hazard: "Ganga-Yamuna River Basin Flooding", status: "Active Monitor", activeKhasras: 8400 },
  { id: "UK", name: "Uttarakhand", type: "State", lat: 30.0668, lng: 79.0193, landTerm: "Khatauni / Khasra", hazard: "Joshimath Subsidence & Cloudbursts", status: "CRITICAL ALERT", activeKhasras: 1560 },
  { id: "WB", name: "West Bengal", type: "State", lat: 22.9868, lng: 87.8550, landTerm: "Khatian (LR / RS) & Porcha", hazard: "Sundarbans Sea Erosion & Darjeeling Landslides", status: "Critical", activeKhasras: 4300 },

  // 8 Union Territories
  { id: "AN", name: "Andaman and Nicobar Islands", type: "UT", lat: 11.7401, lng: 92.6586, landTerm: "RoR / Grant Record", hazard: "Tsunami & Marine Erosion", status: "Moderate", activeKhasras: 320 },
  { id: "CH", name: "Chandigarh", type: "UT", lat: 30.7333, lng: 76.7794, landTerm: "Urban Allotment Record", hazard: "Urban Heat & Drainage Backflow", status: "Stable", activeKhasras: 180 },
  { id: "DN", name: "Dadra & Nagar Haveli and Daman & Diu", type: "UT", lat: 20.1809, lng: 73.0169, landTerm: "7/12 & Property Card", hazard: "Coastal Inundation", status: "Stable", activeKhasras: 290 },
  { id: "DL", name: "Delhi (NCT)", type: "UT", lat: 28.7041, lng: 77.1025, landTerm: "Khasra / Khatauni / DDA Property Card", hazard: "Yamuna Floodplain Inundation", status: "Active Monitor", activeKhasras: 1100 },
  { id: "JK", name: "Jammu and Kashmir", type: "UT", lat: 33.7782, lng: 76.5762, landTerm: "Khasra Girdawari / Jamabandi", hazard: "Ramban Landslides & Avalanche", status: "CRITICAL ALERT", activeKhasras: 2100 },
  { id: "LA", name: "Ladakh", type: "UT", lat: 34.1526, lng: 77.5771, landTerm: "Khasra Record", hazard: "Glacial Retreat & Flash Outburst", status: "High Risk", activeKhasras: 430 },
  { id: "LD", name: "Lakshadweep", type: "UT", lat: 10.5667, lng: 72.6417, landTerm: "Janmam / Island Land Record", hazard: "Coral Atoll Sea Level Rise", status: "High Risk", activeKhasras: 150 },
  { id: "PY", name: "Puducherry", type: "UT", lat: 11.9416, lng: 79.8083, landTerm: "Patta / Revenue Record", hazard: "Storm Surge & Coastal Salinization", status: "Active Monitor", activeKhasras: 340 }
];

window.getRegionById = function(id) {
  return window.GEO_REGIONS.find(r => r.id === id) || window.GEO_REGIONS.find(r => r.id === 'SK');
};

window.getDefaultRegion = function() {
  const savedId = localStorage.getItem('geo360_selected_region');
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
    localStorage.setItem('geo360_selected_region_name', reg.name);
    window.dispatchEvent(new CustomEvent('regionChanged', { detail: reg }));
  }
  return reg;
};
