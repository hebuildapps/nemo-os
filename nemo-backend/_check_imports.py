import sys
print("Python:", sys.version)
import fastapi
print("fastapi OK:", fastapi.__version__)
import uvicorn
print("uvicorn OK")
import pydantic
print("pydantic OK:", pydantic.__version__)
from google import genai
print("google-genai OK")
print("ALL IMPORTS OK")
