/* =============================================================
   GeoShield 🇮🇳 — Dynamic State & Cadastral Parcel Registry
   ============================================================= */
(function() {
  'use strict';

  const REGIONS_DATABASE = {
    sikkim: {
      id: "sikkim",
      name: "Sikkim",
      capital: "Gangtok",
      sector: "Gangtok Sector-04",
      lat: 27.3389,
      lng: 88.6065,
      cadastreTerm: "Dag / Khasra / Jamabandi RoR",
      highway: "NH-10 Highway Corridor",
      detour: "Ranipool Bypass Detour",
      shelterName: "Burtuk Relief Shelter",
      rainThreshold: 55,
      languages: ["English", "Hindi", "Nepali"],
      bbox: [88.01, 27.08, 88.92, 28.13],
      parcels: [
        { id: "Dag #104/A", name: "Dag #104/A", owner: "Pemba Tenzing Bhutia", ownerName: "Pemba Tenzing Bhutia", slope: 42.6, familyCount: 5, structure: "Upper Ridge Dwelling", status: "Critical Scarp", baseFos: 0.76 },
        { id: "Dag #104/B", name: "Dag #104/B", owner: "Dawa Lepcha", ownerName: "Dawa Lepcha", slope: 39.4, familyCount: 4, structure: "Terrace Timber House", status: "Watch Scarp", baseFos: 1.15 },
        { id: "Dag #105/C", name: "Dag #105/C", owner: "Karma Norbu", ownerName: "Karma Norbu", slope: 36.8, familyCount: 6, structure: "Ridge Hillside RCC", status: "Watch Scarp", baseFos: 1.28 },
        { id: "Dag #118/Govt", name: "Dag #118/Govt", owner: "State Revenue Pool", ownerName: "State Revenue Pool", slope: 8.2, familyCount: 0, structure: "Unencumbered Plateau", status: "Safe Pool", baseFos: 2.65 },
        { id: "Dag #204/Govt", name: "Dag #204/Govt", owner: "Government Reserve", ownerName: "Government Reserve", slope: 12.4, familyCount: 0, structure: "Secondary Terrace", status: "Safe Reserve", baseFos: 2.10 }
      ]
    },
    himachal: {
      id: "himachal",
      name: "Himachal Pradesh",
      capital: "Shimla",
      sector: "Shimla / Kullu Ridge Sector",
      lat: 31.1048,
      lng: 77.1734,
      cadastreTerm: "Khasra / Khatauni / Girdawari",
      highway: "NH-5 Highway Corridor",
      detour: "Kufri Bypass Detour",
      shelterName: "Shimla Ridge Relief Shelter",
      rainThreshold: 50,
      languages: ["English", "Hindi", "Pahari"],
      bbox: [75.78, 30.38, 79.07, 33.22],
      parcels: [
        { id: "Khasra #302/Girdawari", name: "Khasra #302/Girdawari", owner: "Rajesh Verma", ownerName: "Rajesh Verma", slope: 38.2, familyCount: 5, structure: "4-Story Hill RCC", status: "Critical Scarp", baseFos: 0.82 },
        { id: "Khasra #303", name: "Khasra #303", owner: "Sunita Devi", ownerName: "Sunita Devi", slope: 46.1, familyCount: 3, structure: "Steep Cut Masonry", status: "Critical Scarp", baseFos: 0.71 },
        { id: "Khasra #305/B", name: "Khasra #305/B", owner: "Ramesh Chand", ownerName: "Ramesh Chand", slope: 35.0, familyCount: 4, structure: "Ridge Timber House", status: "Watch Scarp", baseFos: 1.20 },
        { id: "Khasra #410/Govt", name: "Khasra #410/Govt", owner: "State Ridge Pool", ownerName: "State Ridge Pool", slope: 7.8, familyCount: 0, structure: "Stable Plateau Reserve", status: "Safe Pool", baseFos: 2.70 },
        { id: "Khasra #412/Govt", name: "Khasra #412/Govt", owner: "Revenue Department Pool", ownerName: "Revenue Department Pool", slope: 11.2, familyCount: 0, structure: "Government Plateau", status: "Safe Reserve", baseFos: 2.25 }
      ]
    },
    assam: {
      id: "assam",
      name: "Assam",
      capital: "Dispur",
      sector: "Dima Hasao - Haflong Sector",
      lat: 25.1764,
      lng: 93.0159,
      cadastreTerm: "Dag / Patta / Jamabandi",
      highway: "NH-27 Arterial Highway",
      detour: "Haflong Hill Bypass",
      shelterName: "Haflong Central Relief Shelter",
      rainThreshold: 60,
      languages: ["English", "Hindi", "Assamese"],
      bbox: [89.70, 24.14, 96.02, 27.97],
      parcels: [
        { id: "Dag #482/Patta-12", name: "Dag #482/Patta-12", owner: "Biren Bodo", ownerName: "Biren Bodo", slope: 38.2, familyCount: 6, structure: "Railway Cut Dwelling", status: "Critical Scarp", baseFos: 0.79 },
        { id: "Dag #483/Patta-08", name: "Dag #483/Patta-08", owner: "Anil Das", ownerName: "Anil Das", slope: 41.5, familyCount: 4, structure: "Hill Footprint House", status: "Critical Scarp", baseFos: 0.74 },
        { id: "Dag #485/Patta-15", name: "Dag #485/Patta-15", owner: "Jiten Kachari", ownerName: "Jiten Kachari", slope: 33.5, familyCount: 5, structure: "Valley Side Cottage", status: "Watch Scarp", baseFos: 1.32 },
        { id: "Dag #512/Govt", name: "Dag #512/Govt", owner: "Safe Valley Reserve", ownerName: "Safe Valley Reserve", slope: 6.5, familyCount: 0, structure: "Unencumbered Land", status: "Safe Pool", baseFos: 2.80 },
        { id: "Dag #520/Govt", name: "Dag #520/Govt", owner: "District Land Bank", ownerName: "District Land Bank", slope: 9.8, familyCount: 0, structure: "Flat Hilltop Reserve", status: "Safe Reserve", baseFos: 2.40 }
      ]
    },
    maharashtra: {
      id: "maharashtra",
      name: "Maharashtra",
      capital: "Mumbai",
      sector: "Western Ghats - Mahad / Raigad",
      lat: 18.0827,
      lng: 73.4188,
      cadastreTerm: "7/12 Satbara Extract / Gat No",
      highway: "NH-66 Konkan Highway",
      detour: "Mahad Plateau Bypass",
      shelterName: "Mahad Plateau Relief Shelter",
      rainThreshold: 65,
      languages: ["English", "Hindi", "Marathi"],
      bbox: [72.63, 15.60, 80.89, 22.02],
      parcels: [
        { id: "Gat #204/7-12", name: "Gat #204/7-12", owner: "Suresh Patil", ownerName: "Suresh Patil", slope: 37.8, familyCount: 6, structure: "Konkan Scarp Farmhouse", status: "Critical Scarp", baseFos: 0.81 },
        { id: "Gat #205", name: "Gat #205", owner: "Ganesh Shinde", ownerName: "Ganesh Shinde", slope: 42.0, familyCount: 4, structure: "Scarp Base Dwelling", status: "Critical Scarp", baseFos: 0.73 },
        { id: "Gat #208/A", name: "Gat #208/A", owner: "Pandurang Kadam", ownerName: "Pandurang Kadam", slope: 34.0, familyCount: 5, structure: "Hillside Masonry", status: "Watch Scarp", baseFos: 1.25 },
        { id: "Gat #310/Govt", name: "Gat #310/Govt", owner: "Plateau Safe Pool", ownerName: "Plateau Safe Pool", slope: 8.5, familyCount: 0, structure: "Gaothan Reserve", status: "Safe Pool", baseFos: 2.75 },
        { id: "Gat #315/Govt", name: "Gat #315/Govt", owner: "Government Plateau Reserve", ownerName: "Government Plateau Reserve", slope: 10.0, familyCount: 0, structure: "Public Revenue Plateau", status: "Safe Reserve", baseFos: 2.35 }
      ]
    },
    kerala: {
      id: "kerala",
      name: "Kerala",
      capital: "Thiruvananthapuram",
      sector: "Wayanad - Meppadi Sector",
      lat: 11.5528,
      lng: 76.1242,
      cadastreTerm: "Re-survey / Thandaper Ledger",
      highway: "NH-766 Calicut-Wayanad Highway",
      detour: "Chooralmala Bypass Detour",
      shelterName: "Meppadi Safe Relief Shelter",
      rainThreshold: 55,
      languages: ["English", "Hindi", "Malayalam"],
      bbox: [74.85, 8.28, 77.41, 12.79],
      parcels: [
        { id: "Re-survey #142/8", name: "Re-survey #142/8", owner: "Muhammed Shafi", ownerName: "Muhammed Shafi", slope: 36.5, familyCount: 5, structure: "Estate Valley Dwelling", status: "Critical Scarp", baseFos: 0.83 },
        { id: "Re-survey #142/9", name: "Re-survey #142/9", owner: "Sujatha Nair", ownerName: "Sujatha Nair", slope: 40.2, familyCount: 4, structure: "Hill Plantation Homestead", status: "Critical Scarp", baseFos: 0.77 },
        { id: "Re-survey #145/2", name: "Re-survey #145/2", owner: "Abdurahman K", ownerName: "Abdurahman K", slope: 35.1, familyCount: 6, structure: "Tea Estate Slope Cottage", status: "Watch Scarp", baseFos: 1.22 },
        { id: "Thandaper #88/Govt", name: "Thandaper #88/Govt", owner: "Plantation Safe Buffer", ownerName: "Plantation Safe Buffer", slope: 9.0, familyCount: 0, structure: "State Plantation Buffer", status: "Safe Pool", baseFos: 2.55 },
        { id: "Thandaper #92/Govt", name: "Thandaper #92/Govt", owner: "Government Plateau Buffer", ownerName: "Government Plateau Buffer", slope: 11.5, familyCount: 0, structure: "Public Revenue Buffer", status: "Safe Reserve", baseFos: 2.20 }
      ]
    },
    uttarakhand: {
      id: "uttarakhand",
      name: "Uttarakhand",
      capital: "Dehradun",
      sector: "Joshimath / Chamoli Ridge",
      lat: 30.5526,
      lng: 79.5658,
      cadastreTerm: "Khasra / Khatauni",
      highway: "NH-7 Badrinath Highway",
      detour: "Pipalkoti Detour Corridor",
      shelterName: "Joshimath Relief Center",
      rainThreshold: 50,
      languages: ["English", "Hindi", "Garhwali"],
      bbox: [77.57, 28.72, 81.04, 31.45],
      parcels: [
        { id: "Khasra #112/Josh", name: "Khasra #112/Josh", owner: "Subhash Joshi", ownerName: "Subhash Joshi", slope: 41.2, familyCount: 5, structure: "Subsidence Scarp Hotel", status: "Critical Scarp", baseFos: 0.72 },
        { id: "Khasra #114", name: "Khasra #114", owner: "Ankita Rawat", ownerName: "Ankita Rawat", slope: 38.5, familyCount: 4, structure: "Hill Slope Dwelling", status: "Critical Scarp", baseFos: 0.78 },
        { id: "Khasra #118/A", name: "Khasra #118/A", owner: "Devendra Singh", ownerName: "Devendra Singh", slope: 34.2, familyCount: 5, structure: "Upper Ridge House", status: "Watch Scarp", baseFos: 1.24 },
        { id: "Khasra #200/Govt", name: "Khasra #200/Govt", owner: "State Subsidence Safe Pool", ownerName: "State Subsidence Safe Pool", slope: 7.5, familyCount: 0, structure: "Stable Bedrock Plateau", status: "Safe Pool", baseFos: 2.80 },
        { id: "Khasra #210/Govt", name: "Khasra #210/Govt", owner: "District Rehabilitation Reserve", ownerName: "District Rehabilitation Reserve", slope: 10.2, familyCount: 0, structure: "Government Reserve Pool", status: "Safe Reserve", baseFos: 2.30 }
      ]
    },
    meghalaya: {
      id: "meghalaya",
      name: "Meghalaya",
      capital: "Shillong",
      sector: "Cherrapunji / East Khasi Hills",
      lat: 25.2713,
      lng: 91.7323,
      cadastreTerm: "Plot / Patta RoR",
      highway: "NH-6 Shillong Corridor",
      detour: "Sohra Bypass Detour",
      shelterName: "Sohra Central Shelter",
      rainThreshold: 70,
      languages: ["English", "Hindi", "Khasi"],
      bbox: [89.82, 25.03, 92.80, 26.12],
      parcels: [
        { id: "Plot #88/Khasi", name: "Plot #88/Khasi", owner: "Wanlang Lyngdoh", ownerName: "Wanlang Lyngdoh", slope: 44.0, familyCount: 5, structure: "High Rainfall Scarp House", status: "Critical Scarp", baseFos: 0.75 },
        { id: "Plot #89/B", name: "Plot #89/B", owner: "Pyndap Nongrum", ownerName: "Pyndap Nongrum", slope: 39.8, familyCount: 4, structure: "Slope Timber Cottage", status: "Critical Scarp", baseFos: 0.80 },
        { id: "Plot #92/C", name: "Plot #92/C", owner: "Banrap Syiem", ownerName: "Banrap Syiem", slope: 35.5, familyCount: 6, structure: "Ridge Settlement", status: "Watch Scarp", baseFos: 1.25 },
        { id: "Plot #140/Govt", name: "Plot #140/Govt", owner: "State Plateau Reserve", ownerName: "State Plateau Reserve", slope: 8.0, familyCount: 0, structure: "Flat Ridge Reserve", status: "Safe Pool", baseFos: 2.70 },
        { id: "Plot #145/Govt", name: "Plot #145/Govt", owner: "District Land Reserve", ownerName: "District Land Reserve", slope: 11.0, familyCount: 0, structure: "Government Land Bank", status: "Safe Reserve", baseFos: 2.30 }
      ]
    },
    odisha: {
      id: "odisha",
      name: "Odisha",
      capital: "Bhubaneswar",
      sector: "Koraput / Rayagada Eastern Ghats",
      lat: 18.8135,
      lng: 82.7123,
      cadastreTerm: "Khata / Plot / RoR",
      highway: "NH-16 Coastal Corridor",
      detour: "Koraput Hill Bypass",
      shelterName: "Koraput Relief Shelter",
      rainThreshold: 55,
      languages: ["English", "Hindi", "Odia"],
      bbox: [81.38, 17.81, 87.49, 22.57],
      parcels: [
        { id: "Khata #44/Plot-1", name: "Khata #44/Plot-1", owner: "Ramesh Sahu", ownerName: "Ramesh Sahu", slope: 37.2, familyCount: 5, structure: "Hillside Masonry House", status: "Critical Scarp", baseFos: 0.80 },
        { id: "Khata #44/Plot-2", name: "Khata #44/Plot-2", owner: "Pradeep Nayak", ownerName: "Pradeep Nayak", slope: 40.5, familyCount: 4, structure: "Slope Footprint House", status: "Critical Scarp", baseFos: 0.76 },
        { id: "Khata #46/Plot-5", name: "Khata #46/Plot-5", owner: "Sujata Mohanty", ownerName: "Sujata Mohanty", slope: 33.8, familyCount: 6, structure: "Valley Cottage", status: "Watch Scarp", baseFos: 1.28 },
        { id: "Khata #100/Govt", name: "Khata #100/Govt", owner: "State Government Pool", ownerName: "State Government Pool", slope: 7.2, familyCount: 0, structure: "Unencumbered Plateau", status: "Safe Pool", baseFos: 2.80 },
        { id: "Khata #105/Govt", name: "Khata #105/Govt", owner: "Revenue Department Land", ownerName: "Revenue Department Land", slope: 10.5, familyCount: 0, structure: "Public Revenue Reserve", status: "Safe Reserve", baseFos: 2.35 }
      ]
    }
  };

  window.getRegionById = function(id) {
    if (!id) return REGIONS_DATABASE.sikkim;
    const cleanId = String(id).toLowerCase().trim();
    return REGIONS_DATABASE[cleanId] || REGIONS_DATABASE.sikkim;
  };

  window.getDefaultRegion = function() {
    const savedId = localStorage.getItem('active_region_id') || localStorage.getItem('geo360_selected_region') || localStorage.getItem('active_region');
    return window.getRegionById(savedId);
  };

  window.getParcelsForRegion = function(id) {
    const reg = window.getRegionById(id);
    return reg.parcels || [];
  };

  window.getAllRegions = function() {
    return Object.values(REGIONS_DATABASE);
  };
})();
