import json
import os
import traceback
from pathlib import Path
from typing import List

import boto3
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


def load_local_env() -> None:
    env_path = Path(__file__).with_name(".env")
    if not env_path.exists():
        return

    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        os.environ[key.strip()] = value.strip().strip('"').strip("'")


load_local_env()

bedrock = boto3.client(
    service_name="bedrock-runtime",
    region_name="us-east-1",
    aws_access_key_id=os.environ.get("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.environ.get("AWS_SECRET_ACCESS_KEY"),
    aws_session_token=os.environ.get("AWS_SESSION_TOKEN")
)

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


def require_aws_credentials() -> None:
    if not os.environ.get("AWS_ACCESS_KEY_ID") or not os.environ.get("AWS_SECRET_ACCESS_KEY"):
        raise HTTPException(status_code=500, detail="AWS Bedrock credentials are not configured")


def extract_bedrock_text(response_body: dict) -> str:
    content_blocks = response_body.get("output", {}).get("message", {}).get("content", [])
    text_parts = [block.get("text", "") for block in content_blocks if isinstance(block, dict)]
    return "\n".join(part for part in text_parts if part).strip()


def extract_json_document(text: str) -> str:
    candidate = text.strip()

    if candidate.startswith("```"):
        lines = candidate.splitlines()
        if lines:
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        candidate = "\n".join(lines).strip()

    start = candidate.find("{")
    end = candidate.rfind("}")
    if start != -1 and end != -1 and start < end:
        return candidate[start:end + 1]

    return candidate


def invoke_nova_lite(prompt: str) -> str:
    require_aws_credentials()

    body = json.dumps({
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "text": prompt
                    }
                ]
            }
        ],
        "inferenceConfig": {
            "max_new_tokens": 300,
            "temperature": 0.7
        }
    })

    response = bedrock.invoke_model(
        modelId="amazon.nova-lite-v1:0",
        body=body
    )

    response_body = json.loads(response["body"].read())
    return extract_bedrock_text(response_body)

@app.post("/stage-briefing")
async def stage_briefing(req: StageRequest):
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

    try:
        text = invoke_nova_lite(prompt)
    except Exception as exc:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to generate stage briefing: {exc}") from exc

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
    prompt = (
        f"You are a quiz generator for software engineering interview preparation.\n\n"
        f"Generate exactly 1 multiple-choice question to validate understanding of the given topic.\n\n"
        f"Topic: {req.topic}\nDifficulty: {req.difficulty}\nStage: {req.stage}\n\n"
        f'Return ONLY valid JSON with this exact shape and nothing else:\n'
        f'{{"question":"...","options":["...","...","...","..."],"correct":0}}\n\n'
        f"correct is the 0-based index of the correct answer. Provide exactly 4 options, only one correct. "
        f"Do not wrap the JSON in markdown code fences or add any explanation."
    )

    text = ""
    try:
        text = invoke_nova_lite(prompt)
        data = json.loads(extract_json_document(text))
        mcq = McqResponse(**data)

        if len(mcq.options) != 4:
            raise ValueError("MCQ must include exactly 4 options")
        if mcq.correct < 0 or mcq.correct >= len(mcq.options):
            raise ValueError("MCQ correct index is out of range")

        return mcq
    except json.JSONDecodeError as exc:
        print(f"Unexpected MCQ model output: {text!r}")
        raise HTTPException(status_code=500, detail="Failed to generate MCQ: Model did not return valid JSON") from exc
    except Exception as exc:
        traceback.print_exc()
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