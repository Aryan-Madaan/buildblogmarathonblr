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
        instruction="""Your goal is to determine visa entry compliance for a given destination using the provided tools.
        Specifically, you must utilize the `check_visa_requirements` tool.
        Analyze the output from `check_visa_requirements` and structure your final response as a `ComplianceResult`.
        The `ComplianceResult` should clearly indicate whether the traveler meets the entry requirements and any relevant details or next steps.
        Focus on accuracy and clarity in presenting the compliance status.""",
        tools=CDA_tools
    )
    
    # Helper Agent 2: Assess Insurance Risk
    # This agent takes the output of the visa check and decides if insurance is mandatory.
    insurance_agent = LlmAgent(
        name="InsuranceRiskAgent",
        model="gemini-2.5-flash",
        instruction="Your task is to evaluate the need for high-risk insurance based on the provided `ComplianceResult` and the complete `TripContext`. Analyze the `ComplianceResult` to understand visa compliance and any associated complexities. Additionally, review the `TripContext` for destination-specific risk factors and the proximity of the visa application deadline. Set the `insurance_required` flag within the `TripContext` state to `True` if the destination is identified as high-risk or if the visa application deadline is critically short, indicating potential issues. Otherwise, set it to `False`. Your assessment should be thorough and directly update the `TripContext` state.",
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
        Your core responsibility is to meticulously plan personalized first and last-mile transportation for each individual within the 'group_members' list. 
        For every group member, you must assess their 'departure_location' and cross-reference it with their 'budget' preference score. 
        Based on this analysis, determine the most suitable individual transport options, specifically choosing between a rental car (implying self-drive or group rental if applicable) and cab/ride-share services. 
        Your output should enrich the 'transport_options' field within the overall TripContext by appending these personalized, calculated suggestions for each group member, ensuring the recommendations align with their specified budget constraints and individual logistical needs. 
        Provide clear reasoning for the chosen option (e.g., "rental recommended due to remote departure and good budget score" or "ride-share suggested for urban departure and tight budget").
        """,
    )

    # Workflow Agent: Executes sub-agents concurrently to save time.
    return ParallelAgent(
        name="MultimodalTransportAgent",
        description="Logistics Solver: Finds and compares all transport modes simultaneously.",
        sub_agents=[segment_agent, logistics_agent]
    )