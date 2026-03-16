import sys
print("Python:", sys.version)
import fastapi
print("fastapi OK:", fastapi.__version__)
import uvicorn
print("uvicorn OK")
import pydantic
print("pydantic OK:", pydantic.__version__)
import boto3
print("boto3 OK:", boto3.__version__)
print("ALL IMPORTS OK")
