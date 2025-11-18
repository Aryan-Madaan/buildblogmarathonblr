# types.py
from dataclasses import dataclass
from typing import List, Dict, Any

@dataclass
class TripContext:
    """Shared state object passed throughout the workflow."""
    user_id: str
    trip_id: str
    destination: str
    travel_dates: List[str]
    group_members: List[str]
    # State updated by TPA
    preference_vector: Dict[str, float] = None
    # State updated by CDA
    compliance_status: str = "PENDING"
    visa_deadline: str = None
    insurance_required: bool = False
    # State updated by IPA
    base_itinerary: List[Dict[str, Any]] = None
    # State updated by MTA
    transport_options: Dict[str, Any] = None
    final_cost_estimate: float = 0.0

@dataclass
class ComplianceResult:
    """Structured output from a CDA sub-tool."""
    document_type: str
    status: str
    risk_level: str
    next_action: str

@dataclass
class ItinerarySegment:
    """Structured output for one day/stop in the itinerary."""
    day: int
    poi_name: str
    justification: str  # AI-Justified Recommendation (e.g., "Best for budget travelers")
    poi_confidence_score: float # From BigQuery grounding