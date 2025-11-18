# agents.py
from google.adk.agents import LlmAgent, SequentialAgent, ParallelAgent, CustomAgent
from google.adk.context import InvocationContext
from custom_types import TripContext, ComplianceResult, ItinerarySegment
from tools import TPA_tools, CDA_tools, IPA_tools, MTA_tools

# --- 1. Custom Agent: Traveler Profile Agent (TPA) ---
# TPA needs full control over state and database interactions.

class TravelerProfileAgent(CustomAgent):
    def __init__(self, **kwargs):
        super().__init__(name="TravelerProfileAgent", description="Manages user PII, profile, and preference modeling.", **kwargs)
        self.tools = TPA_tools # Assign toolset

    async def execute(self, context: InvocationContext) -> TripContext:
        trip_context: TripContext = context.state.get("trip_context")

        # 1. Fetch Preference Vector using Tool
        preference_vector = self.tools[0].execute(user_id=trip_context.user_id)
        
        # 2. Update Shared State
        trip_context.preference_vector = preference_vector
        context.state["trip_context"] = trip_context
        
        print(f"[TPA] Profile complete. Preference Vector: {preference_vector}")
        return trip_context

# --- 2. Sequential Agent: Compliance & Documentation Agent (CDA) ---
# Enforces a strict pipeline (Passport Check -> Visa Check -> Insurance Check).

def create_cda_workflow():
    # Helper Agent 1: Check Passport/Visa Status
    visa_agent = LlmAgent(
        name="VisaCheckAgent",
        model="gemini-2.5-flash",
        instruction="Use the check_visa_requirements tool to determine entry compliance for the destination. Output structured ComplianceResult.",
        tools=CDA_tools
    )
    
    # Helper Agent 2: Assess Insurance Risk
    # This agent takes the output of the visa check and decides if insurance is mandatory.
    insurance_agent = LlmAgent(
        name="InsuranceRiskAgent",
        model="gemini-2.5-flash",
        instruction="Based on the ComplianceResult from the previous step and the overall TripContext, determine if high-risk insurance is needed. Set the 'insurance_required' flag in the TripContext state. Flag if destination is high-risk or Visa deadline is short.",
    )

    # Workflow Agent: Enforces the necessary order.
    return SequentialAgent(
        name="ComplianceDocumentationAgent",
        description="Legal Brain: Executes compliance checks in sequence.",
        sub_agents=[visa_agent, insurance_agent]
    )

# --- 3. LLM Agent: Itinerary Planning Agent (IPA) ---
# Core planner using grounding data (BigQuery via tool).

itinerary_planning_agent = LlmAgent(
    name="ItineraryPlanningAgent",
    model="gemini-2.5-pro", # Pro for complex reasoning and grounding
    instruction="""
    You are the Core Itinerary Planner. Your task is to generate a high-quality, anti-hallucination itinerary.
    1. Retrieve the 'preference_vector' from the TripContext state.
    2. Use the 'query_verified_ugc' tool to select only high-Visual_Score POIs that match the vector.
    3. Generate a 3-day itinerary, ensuring each segment includes an AI justification based on the user's preferences (e.g., 'Best for budget').
    4. Store the final list of ItinerarySegment objects in the 'base_itinerary' field of the TripContext.
    """,
    tools=IPA_tools
)

# --- 4. Parallel Agent: Multimodal Transport Agent (MTA) ---
# Solves action paralysis by simultaneously querying and comparing options (MCP logic).

def create_mta_workflow():
    # Segment 1: Inter-City Transport (e.g., London to Paris)
    segment_agent = LlmAgent(
        name="SegmentTransportAgent",
        model="gemini-2.5-flash",
        instruction="""
        Analyze the first inter-city segment in 'base_itinerary'.
        1. Use the 'query_multimodal_routes' tool to get all options (Flight, Train).
        2. Compare the options against the 'preference_vector' (e.g., price vs. duration).
        3. Determine the optimal **MTA Best Pick** and store the results in 'transport_options' with the AI justification.
        """,
        tools=MTA_tools
    )

    # Segment 2: Local Logistics (Individualized for each traveler)
    logistics_agent = LlmAgent(
        name="LocalLogisticsAgent",
        model="gemini-2.5-flash",
        instruction="""
        For each group member in 'group_members', calculate individual first/last-mile options (rental vs. cab/ride-share) based on their individual 'departure_location' and the 'budget' preference score. 
        Update the 'transport_options' with these personalized suggestions.
        """,
    )

    # Workflow Agent: Executes sub-agents concurrently to save time.
    return ParallelAgent(
        name="MultimodalTransportAgent",
        description="Logistics Solver: Finds and compares all transport modes simultaneously.",
        sub_agents=[segment_agent, logistics_agent]
    )