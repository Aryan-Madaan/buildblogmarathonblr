# agents.py
from google.adk.agents import LlmAgent, SequentialAgent, ParallelAgent, BaseAgent
from google.adk.agents import InvocationContext
from custom_types import TripContext, ComplianceResult, ItinerarySegment
from google.adk.agents import LlmAgent, SequentialAgent, ParallelAgent, BaseAgent
from google.adk.agents.invocation_context import InvocationContext
from google.adk.events import Event
from tools import TPA_tools, CDA_tools, IPA_tools, MTA_tools
from typing import AsyncGenerator

from google.genai import types

from tools import fetch_preference_vector


# --- 1. Custom Agent: Traveler Profile Agent (TPA) ---
# TPA needs full control over state and database interactions.

class TravelerProfileAgent(BaseAgent):
    """A custom agent to fetch profiles for all trip members."""
    def __init__(self, **kwargs):
        super().__init__(name="TravelerProfileAgent", **kwargs)

    async def _run_async_impl(self, context: InvocationContext) -> AsyncGenerator[Event, None]:
        trip_context = TripContext(**context.session.state.get("trip_context", {}))
        # tool = self.tools.get_tool("fetch_preference_vector")
        
        updated = False
        for user_id in trip_context.group_members:
            if user_id not in trip_context.user_preferences:
                print(f"[TPA] New user detected: {user_id}. Fetching profile.")
                preference_vector = fetch_preference_vector(user_id=user_id)
                trip_context.user_preferences[user_id] = preference_vector
                updated = True

        context.session.state["trip_context"] = trip_context.model_dump()
        yield Event(author=self.name, content=types.Content(parts=[types.Part(text="User profiles updated.")]))


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


# --- 2. Personalization Agent (NEW) ---
PersonalizationAgent = LlmAgent(
    name="PersonalizationAgent",
    model="gemini-2.5-flash",
    instruction="""
    Analyze the 'user_preferences' in the TripContext state.
    Calculate a single 'group_preference_vector' that represents the group's collective interests by averaging the scores.
    Update the TripContext with this new vector.
    """,
)

# --- 3. Place Discovery Agent (With REAL Maps Grounding) ---
PlaceDiscoveryAgent = LlmAgent(
    name="PlaceDiscoveryAgent",
    model="gemini-2.5-pro",
    instruction="""
    You are a travel discovery expert.
    1. Look at the 'destination' and 'group_preference_vector' in the TripContext.
    2. Formulate a search query based on the top preferences (e.g., "art museums and nature parks near Zurich, Switzerland").
    3. Use the `google_maps_tool.search_places` function with your query.
    4. Store the list of discovered places in the 'discovered_pois' field in the TripContext.
    """,
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

TransportAgent = LlmAgent(
    name="TransportAgent",
    model="gemini-2.5-flash",
    instruction="""
    You are a logistics planner.
    1. Identify the origin/destination cities and dates from the TripContext.
    2. Use the `query_flights_api` tool to search for flight options.
    3. Analyze the results based on the 'group_preference_vector' (price vs. duration).
    4. Update the 'transport_options' in the TripContext with your findings.
    """,
)


RootOrchestrationAgent = SequentialAgent(
    name="RootOrchestrationAgent",
    description="Manages the full trip planning pipeline with real-world grounding.",
    sub_agents=[
        TravelerProfileAgent(),
        PersonalizationAgent,
        PlaceDiscoveryAgent,
        itinerary_planning_agent,
        TransportAgent
    ],
    # instruction="Summarize the key outcomes: discovered places, itinerary highlights, and the recommended transport choice. Present this as your final answer."
)