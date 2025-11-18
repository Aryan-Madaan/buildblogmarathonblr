# custom.py
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class TripContext(BaseModel):
    """Shared state object passed throughout the workflow."""
    group_members: List[str]
    trip_id: str
    destination: str
    travel_dates: List[str]
    
    # State updated by TPA: Stores profiles for each user
    user_preferences: Dict[str, Dict[str, float]] = Field(default_factory=dict)
    
    # State updated by PersonalizationAgent
    group_preference_vector: Optional[Dict[str, float]] = None
    
    # State updated by CDA
    compliance_status: str = "PENDING"
    visa_deadline: Optional[str] = None
    insurance_required: bool = False

    # State updated by PlaceDiscoveryAgent
    discovered_pois: Optional[List[Dict[str, Any]]] = None
    
    # State updated by IPA
    base_itinerary: Optional[List[Dict[str, Any]]] = None
    
    # State updated by MTA
    transport_options: Optional[Dict[str, Any]] = None
    final_cost_estimate: float = 0.0

# Other models remain the same
class ComplianceResult(BaseModel):
    document_type: str; status: str; risk_level: str; next_action: str

class ItinerarySegment(BaseModel):
    day: int; poi_name: str; justification: str; poi_confidence_score: float