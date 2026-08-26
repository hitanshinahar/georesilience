from ml.inference.predict import LandslidePredictor

def test_prediction_output():
    predictor = LandslidePredictor()
    sample_safe = {
        "elevation_m": 900.0, "slope_deg": 8.0, "aspect_deg": 120.0,
        "tri_ruggedness": 3.0, "plan_curvature": 0.0, "rainfall_3h_accum_mm": 5.0,
        "rainfall_72h_accum_mm": 15.0, "soil_moisture_saturation_pct": 30.0,
        "ground_deformation_proxy_mm_yr": -0.5, "anthropogenic_load_proxy_kpa": 0.0
    }
    result = predictor.predict_susceptibility(sample_safe)
    assert "static_susceptibility_score" in result
    assert "risk_tier" in result
    assert "top_contributing_factors" in result
    print("✔ Inference contract test passed with zero errors!")

if __name__ == "__main__":
    test_prediction_output()