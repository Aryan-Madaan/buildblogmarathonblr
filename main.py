# main.py
from google.adk.agents import SequentialAgent, LlmAgent
from google.adk.context import InvocationContext
from agent import TravelerProfileAgent, create_cda_workflow, itinerary_planning_agent, create_mta_workflow
from types import TripContext

# --- Instantiate Specialized Agents ---
TPA = TravelerProfileAgent()
CDA = create_cda_workflow()
MTA = create_mta_workflow()

# --- 5. Root Orchestration Agent (Sequential Workflow) ---
# Defines the end-to-end process: Profile -> Compliance -> Planning -> Logistics.

RootOrchestrationAgent = SequentialAgent(
    name="RootOrchestrationAgent",
    description="Central Router for the Safar Saarthi platform. Manages the full trip planning pipeline.",
    sub_agents=[
        TPA,                                  # Step 1: Get Profile Vector
        CDA,                                  # Step 2: Check Compliance & Risk
        itinerary_planning_agent,             # Step 3: Generate Grounded Itinerary
        MTA                                   # Step 4: Plan Multimodal Logistics
    ]
)

# --- Execution Simulation ---

def run_trip_planner(user_request: str, user_id: str, destination: str):
    """Simulates the start of the ADK session."""
    print("--- SAFAR SAARTHI: AGENT PIPELINE START ---")
    
    # Initialize the shared state (TripContext)
    initial_context = TripContext(
        user_id=user_id,
        trip_id="TRIP-001",
        destination=destination,
        travel_dates=["2026-03-10", "2026-03-15"],
        group_members=["User1", "User2"]
    )
    
    # Create the ADK Invocation Context and set the initial state
    context = InvocationContext(
        input_message=user_request,
        state={"trip_context": initial_context}
    )

    # Execute the sequential workflow
    final_context = RootOrchestrationAgent.execute(context)
    
    print("\n--- AGENT PIPELINE COMPLETE ---")
    print(f"Compliance Status: {final_context.compliance_status}")
    print(f"Itinerary Generated: {len(final_context.base_itinerary)} segments")
    print(f"Logistics Planned (Best Pick): {final_context.transport_options['train']['justification']}")

# Example of a user query kicking off the complex flow:
run_trip_planner(
    user_request="Plan a 5-day nature trip to the Schengen Area. I prioritize unique experiences and comfort over budget.",
    user_id="alice_adk",
    destination="Schengen Area (focus on Switzerland)"
)

# Expected Output Flow:
# 1. [TPA] Fetches preference vector (high nature/comfort, low budget). Updates state.
# 2. [CDA] Sequential run starts: VisaCheckAgent flags 'REQUIREMENT'. InsuranceRiskAgent flags 'insurance_required=True'. Updates state.
# 3. [IPA] Uses the updated state (preferences) to query BigQuery and generates a grounded itinerary with AI justification. Updates state.
# 4. [MTA] Parallel run starts: SegmentTransportAgent simultaneously queries flights and trains, recommending the Train ('Best for high 'comfort' score'). LocalLogisticsAgent plans individual local transport. Updates state.
# 5. [Root] Gathers results and presents the final, complex output.