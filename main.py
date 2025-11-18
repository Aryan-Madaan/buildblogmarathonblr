# main.py
import uuid
import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import json

from dotenv import load_dotenv
load_dotenv()

import uvicorn

# Correct imports for the ADK runtime and tools
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService, Session
from google.genai import types as genai_types

# Import your agent and tools from other files
from agent import RootOrchestrationAgent
from custom_types import TripContext
from tools import TPA_tools, CDA_tools, Discovery_tools, Transport_tools

# --- 0. Environment Setup ---
# UNCOMMENT AND SET YOUR KEY. For Google Maps to work.
# os.environ["GOOGLE_API_KEY"] = "YOUR_GOOGLE_API_KEY"
if not os.getenv("GOOGLE_API_KEY"):
    print("WARNING: GOOGLE_API_KEY environment variable not set. Google Maps tool will fail.")

# --- 1. Initialize Core ADK Components ---
APP_NAME = "SafarSaarthi"
session_service = InMemorySessionService()

# --- 2. Initialize FastAPI ---
app = FastAPI(title="Safar Saarthi Agent API", description="Trip planner using Google ADK")

# --- 3. API Models ---
class CreateSessionRequest(BaseModel):
    user_ids: List[str]
    destination: str
    travel_dates: List[str]

class ChatRequest(BaseModel):
    user_request: str
    user_id:str

class ChatResponse(BaseModel):
    reply: str
    session_id: str
    final_context: TripContext

# --- 4. FastAPI Endpoints ---
@app.post("/sessions", summary="Create a new trip session")
async def create_session(request: CreateSessionRequest):
    """Initializes a new trip planning session."""
    session_id = str(uuid.uuid4())
    initial_context = TripContext(
        user_id=request.user_ids[0],
        group_members=request.user_ids,
        trip_id=f"TRIP-{session_id[:8]}",
        destination=request.destination,
        travel_dates=request.travel_dates,
    )
    await session_service.create_session(
        app_name=APP_NAME,
        user_id=request.user_ids[0],
        session_id=session_id,
        state={"trip_context": initial_context.model_dump()}
    )
    return {"message": "Session created.", "session_id": session_id}

@app.post("/sessions/{session_id}/chat", response_model=ChatResponse)
async def chat(session_id: str, request: ChatRequest):
    """Runs the full RootOrchestrationAgent workflow."""
    session = await session_service.get_session(user_id=request.user_id,app_name=APP_NAME,session_id=session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    final_reply = "Agent execution finished without a final summary."
    try:
        runner = Runner(app_name=APP_NAME,agent=RootOrchestrationAgent,session_service=session_service)


        async for event in runner.run_async(user_id=request.user_id,session_id=session_id,new_message=genai_types.Content(parts=[genai_types.Part(text=request.user_request)])):
            if event.is_final_response() and event.content and event.content.parts:
                final_reply = event.content.parts[0].text

        updated_session = await session_service.get_session(session_id)
        final_trip_context = TripContext(**updated_session.state.get("trip_context", {}))

        return ChatResponse(
            reply=final_reply,
            session_id=session_id,
            final_context=final_trip_context
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {e}")
    

if __name__== "__main__":
    uvicorn.run(app,host="0.0.0.0",port=8000)