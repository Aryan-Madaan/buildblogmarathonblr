# tools.py
import json
from google.adk.tools import FunctionTool
from custom_types import *

# --- Proprietary Data Tools (MCP) ---

def fetch_preference_vector(user_id: str) -> Dict[str, float]:
    """Retrieves or calculates the traveler's preference vector from Firestore/BigQuery."""
    # Placeholder for Firestore/BigQuery logic
    print(f"[Tool Call] Fetching Preference Vector for {user_id}")
    return {"budget": 0.2, "nature": 0.9, "history": 0.4, "luxury": 0.1}

def query_verified_ugc(query: str, vector: Dict[str, float]) -> List[ItinerarySegment]:
    """Queries BigQuery for verified, high-Visual_Score POIs based on the Preference Vector."""
    # Placeholder for BigQuery and Gemini grounding logic
    print(f"[Tool Call] Grounding itinerary using BigQuery UGC with vector: {vector}")
    return [
        ItinerarySegment(1, "Hidden Waterfall Trail", "Matches high 'nature' score.", 0.95),
        ItinerarySegment(1, "Local Artisan Market", "Matches medium 'budget' score.", 0.88),
    ]

# --- Compliance & Logistics Tools (External APIs) ---

def check_visa_requirements(nationality: str, destination: str) -> ComplianceResult:
    """Calls external Visa/Passport API."""
    print(f"[Tool Call] Checking Visa API: {nationality} -> {destination}")
    if nationality == 'US' and destination == 'Schengen':
        return ComplianceResult("Visa", "REQUIREMENT", "MEDIUM", "Start application within 60 days.")
    return ComplianceResult("Visa", "NOT_REQUIRED", "LOW", "No action needed.")

def query_multimodal_routes(origin: str, destination: str, date: str) -> Dict[str, Any]:
    """Simultaneously queries Google Flights, Trains, and Rental Car APIs (MCP Logic)."""
    # Placeholder for simultaneous API calls and price aggregation
    print(f"[Tool Call] Querying Flights, Trains, and Rental APIs simultaneously.")
    return {
        "flight": {"price": 150, "duration": "2h", "justification": "Fastest option."},
        "train": {"price": 90, "duration": "4h", "justification": "Best for high 'comfort' score."},
    }

# Wrap tools for ADK
TPA_tools = [FunctionTool(fetch_preference_vector)]
CDA_tools = [FunctionTool(check_visa_requirements)]
IPA_tools = [FunctionTool(query_verified_ugc)]
MTA_tools = [FunctionTool(query_multimodal_routes)]