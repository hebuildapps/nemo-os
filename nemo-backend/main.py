import os
import google.generativeai as genai
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class StageRequest(BaseModel):
    stage_name: str
    user_name: str

@app.post("/stage-briefing")
async def stage_briefing(req: StageRequest):
    model = genai.GenerativeModel("gemini-2.0-flash-exp")
    
    prompt = f"""
    You are the narrator of a gamified coding prep journey called Nemo OS.
    
    The student {req.user_name} has just completed all tasks in the previous stage 
    and is now entering the {req.stage_name} stage of their software interview preparation.
    
    Write a short stage briefing with exactly this structure:
    
    TITLE: A dramatic 4-6 word title for this stage
    
    NARRATIVE: Two sentences. Dramatic, motivational, game-like tone. 
    Like a video game cutscene narrator. Reference the stage topic briefly.
    
    CHALLENGE: One sentence describing the main challenge ahead.
    
    REWARD: One sentence about what mastering this stage unlocks.
    
    TIP: One practical study tip specific to {req.stage_name}.
    
    Keep total response under 120 words. Make it feel epic but grounded.
    """
    
    response = model.generate_content(prompt)
    
    return {
        "title": extract_section(response.text, "TITLE"),
        "narrative": extract_section(response.text, "NARRATIVE"),
        "challenge": extract_section(response.text, "CHALLENGE"),
        "reward": extract_section(response.text, "REWARD"),
        "tip": extract_section(response.text, "TIP"),
        "raw": response.text
    }

def extract_section(text, section):
    lines = text.split('\n')
    for line in lines:
        if line.startswith(section + ":"):
            return line.replace(section + ":", "").strip()
    return ""

@app.get("/health")
async def health():
    return {"status": "ok"}