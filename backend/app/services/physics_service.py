import math
from typing import Dict, Any

def calculate_factor_of_safety(rain_mm: float, slope_deg: float, moisture_pct: float, insar_disp: float) -> Dict[str, float]:
    """
    Prototype Limit Equilibrium Calculation for demonstration.
    This calculates pore pressure, shear stress, and Factor of Safety (FoS).
    """
    # Geotechnical limit equilibrium calculations for prototype fallback
    u_pore = 0.098 * rain_mm * (moisture_pct / 50.0)
    
    slope_rad = math.radians(slope_deg)
    eff_sigma_n = max(0.1, (19.5 * 3.5 * (math.cos(slope_rad) ** 2)) - u_pore)
    
    tau_res = 12.5 + eff_sigma_n * math.tan(math.radians(32.0))
    tau_drive = 19.5 * 3.5 * math.sin(slope_rad) * math.cos(slope_rad)
    
    fos = max(0.40, min(3.50, tau_res / max(0.1, tau_drive)))
    
    if insar_disp < 0:
        fos -= abs(insar_disp) * 0.015
        
    fos = round(fos, 2)
    
    return {
        "factor_of_safety": fos,
        "pore_pressure_kpa": round(u_pore, 1),
        "shear_stress_kpa": round(tau_drive, 1)
    }

def estimate_runout(rain_mm: float, slope_deg: float) -> Dict[str, Any]:
    """
    Prototype Runout Estimation based on empirical approximations.
    """
    base_factor = (slope_deg / 40.0) * (rain_mm / 35.0) * 1.8
    debris_reach_km = round(base_factor, 2)
    inundation_area_km2 = round(base_factor * 0.18, 2)
    impacted_khasras = max(5, round(base_factor * 44))
    impacted_residents = max(35, impacted_khasras * 7)
    
    return {
        "debris_reach_km": debris_reach_km,
        "inundation_area_km2": inundation_area_km2,
        "impacted_khasras": impacted_khasras,
        "impacted_residents": impacted_residents
    }

def calculate_unified_risk_score(static_susceptibility_score: float, factor_of_safety: float) -> Dict[str, Any]:
    """
    Fuses the ML static susceptibility score with the prototype limit equilibrium FoS
    to generate a unified 0-100 risk score and risk level.
    """
    # Map ML susceptibility (0.0 - 1.0) to a baseline score (0 - 100)
    baseline_score = static_susceptibility_score * 100
    
    # Scale based on FoS
    if factor_of_safety < 1.0:
        # Critical failure
        score = max(82, baseline_score + 20)
    elif factor_of_safety <= 1.3:
        score = baseline_score + 10
    else:
        score = baseline_score
        
    score = max(5, min(99, round(score)))
    
    if score >= 76:
        risk_level = "CRITICAL"
    elif score >= 56:
        risk_level = "ALERT"
    elif score >= 36:
        risk_level = "WARNING"
    else:
        risk_level = "WATCH"
        
    return {
        "risk_score": score,
        "risk_level": risk_level
    }
