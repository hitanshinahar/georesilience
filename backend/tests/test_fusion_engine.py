import unittest
from ml.fusion.schemas import FusionRequest, ModelSourceInput, FieldIntelligenceInput
from ml.fusion.engine import fuse_risk_assessments

class TestFusionEngine(unittest.TestCase):
    def test_all_models_available_and_high_risk(self):
        req = FusionRequest(
            xgboost=ModelSourceInput(risk_score=0.9, confidence=0.85, available=True),
            lstm=ModelSourceInput(risk_score=0.88, confidence=0.82, available=True),
            transformer=ModelSourceInput(risk_score=0.92, confidence=0.86, available=True),
            field_intelligence=FieldIntelligenceInput(
                hazard_type="landslide", hazard_confidence=0.9, severity="critical", urgency="immediate",
                observations=["active_landslide"], temporal_change="rapidly_worsening"
            )
        )
        resp = fuse_risk_assessments(req)
        self.assertGreaterEqual(resp.final_risk_score, 0.85)
        self.assertEqual(resp.risk_level, "RED")
        self.assertEqual(resp.model_agreement, "high")
        self.assertFalse(resp.requires_human_review)
        self.assertEqual(resp.recommended_action, "emergency_response")
        self.assertTrue(all(resp.source_availability.values()))

    def test_all_models_available_and_low_risk(self):
        req = FusionRequest(
            xgboost=ModelSourceInput(risk_score=0.1, available=True),
            lstm=ModelSourceInput(risk_score=0.15, available=True),
            transformer=ModelSourceInput(risk_score=0.12, available=True),
            field_intelligence=FieldIntelligenceInput(
                hazard_type="none", hazard_confidence=0.8, severity="low", urgency="routine",
                observations=[], temporal_change="stable"
            )
        )
        resp = fuse_risk_assessments(req)
        self.assertLess(resp.final_risk_score, 0.35)
        self.assertEqual(resp.risk_level, "GREEN")
        self.assertEqual(resp.model_agreement, "high")
        self.assertEqual(resp.recommended_action, "continue_monitoring")

    def test_strong_disagreement(self):
        req = FusionRequest(
            xgboost=ModelSourceInput(risk_score=0.1, available=True),
            lstm=ModelSourceInput(risk_score=0.9, available=True),
            transformer=ModelSourceInput(risk_score=0.5, available=True)
        )
        resp = fuse_risk_assessments(req)
        self.assertEqual(resp.model_agreement, "low")
        self.assertTrue(resp.requires_human_review)

    def test_transformer_unavailable(self):
        req = FusionRequest(
            xgboost=ModelSourceInput(risk_score=0.8, available=True),
            lstm=ModelSourceInput(risk_score=0.82, available=True),
            transformer=ModelSourceInput(risk_score=0.0, available=False) # unavailable shouldn't pull down to 0
        )
        resp = fuse_risk_assessments(req)
        self.assertFalse(resp.source_availability["transformer"])
        self.assertGreater(resp.final_risk_score, 0.7) # Should be around 0.8
        self.assertEqual(resp.model_agreement, "high") # 0.8 and 0.82

    def test_only_xgboost_available(self):
        req = FusionRequest(
            xgboost=ModelSourceInput(risk_score=0.8, available=True),
            lstm=ModelSourceInput(risk_score=0.0, available=False),
            transformer=ModelSourceInput(risk_score=0.0, available=False),
            field_intelligence=FieldIntelligenceInput() # also not provided properly, default handles as unavailable or low score
        )
        # Force field intel unavailable for clarity
        req.field_intelligence = None
        resp = fuse_risk_assessments(req)
        self.assertEqual(resp.model_agreement, "insufficient_data")
        self.assertTrue(resp.requires_human_review)
        self.assertEqual(resp.final_risk_score, 0.8)

    def test_moderate_environmental_with_severe_field_evidence(self):
        req = FusionRequest(
            xgboost=ModelSourceInput(risk_score=0.4, available=True),
            lstm=ModelSourceInput(risk_score=0.45, available=True),
            transformer=ModelSourceInput(risk_score=0.42, available=True),
            field_intelligence=FieldIntelligenceInput(
                hazard_confidence=0.9, severity="critical", urgency="immediate",
                observations=["debris_flow", "active_landslide"], temporal_change="rapidly_worsening"
            )
        )
        resp = fuse_risk_assessments(req)
        # Numerical agreement is high, but field evidence is severe and environmental is moderate/low.
        # This should trigger requires_human_review because of the disparity (field > 0.8, final < 0.5 initially or similar)
        # Wait, field evidence will pull score up. Let's see if it triggers human review.
        self.assertTrue(resp.requires_human_review)
        self.assertTrue(resp.source_availability["field_intelligence"])

    def test_high_environmental_no_field_intelligence(self):
        req = FusionRequest(
            xgboost=ModelSourceInput(risk_score=0.8, available=True),
            lstm=ModelSourceInput(risk_score=0.85, available=True),
            transformer=ModelSourceInput(risk_score=0.82, available=True),
            field_intelligence=None
        )
        resp = fuse_risk_assessments(req)
        self.assertFalse(resp.source_availability["field_intelligence"])
        self.assertGreater(resp.final_risk_score, 0.8)
        self.assertEqual(resp.model_agreement, "high")

    def test_malformed_input(self):
        # Passing None for models should be handled gracefully by normalizer
        req = FusionRequest()
        resp = fuse_risk_assessments(req)
        self.assertEqual(resp.model_agreement, "insufficient_data")
        self.assertTrue(resp.requires_human_review)
        self.assertEqual(resp.final_risk_score, 0.0)

if __name__ == '__main__':
    unittest.main()
