import json
import os
from typing import List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from google.genai import types

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

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


class McqRequest(BaseModel):
    topic: str
    difficulty: str
    stage: str


class McqResponse(BaseModel):
    question: str
    options: List[str]
    correct: int

@app.post("/stage-briefing")
async def stage_briefing(req: StageRequest):
    if not client:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not configured")

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

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt,
    )

    text = response.text
    return {
        "title": extract_section(text, "TITLE"),
        "narrative": extract_section(text, "NARRATIVE"),
        "challenge": extract_section(text, "CHALLENGE"),
        "reward": extract_section(text, "REWARD"),
        "tip": extract_section(text, "TIP"),
        "raw": text,
    }


@app.post("/api/generate-mcq", response_model=McqResponse)
async def generate_mcq(req: McqRequest):
    if not client:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not configured")

    prompt = (
        f"You are a quiz generator for software engineering interview preparation.\n\n"
        f"Generate exactly 1 multiple-choice question to validate understanding of the given topic.\n\n"
        f"Topic: {req.topic}\nDifficulty: {req.difficulty}\nStage: {req.stage}\n\n"
        f'Return ONLY valid JSON with this exact shape and nothing else:\n'
        f'{{"question":"...","options":["...","...","...","..."],"correct":0}}\n\n'
        f"correct is the 0-based index of the correct answer. Provide exactly 4 options, only one correct."
    )

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            ),
        )

        data = json.loads(response.text)
        mcq = McqResponse(**data)

        if len(mcq.options) != 4:
            raise ValueError("MCQ must include exactly 4 options")
        if mcq.correct < 0 or mcq.correct >= len(mcq.options):
            raise ValueError("MCQ correct index is out of range")

        return mcq
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to generate MCQ: {exc}") from exc

def extract_section(text, section):
    lines = text.split('\n')
    for line in lines:
        if line.startswith(section + ":"):
            return line.replace(section + ":", "").strip()
    return ""

@app.get("/health")
async def health():
    return {"status": "ok"}