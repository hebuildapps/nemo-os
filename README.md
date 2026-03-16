# Nemo

AI-powered software interview preparation. Students get a personalised day-by-day prep plan, complete tasks verified by AI-generated MCQs, earn diamonds, unlock companions, and track progress through a pixel-art character that evolves with their mood.

## Features

- Deterministic stage-based prep plan.
- AI-generated MCQ validation via Amazon Nova (Amazon Bedrock).
- Pixel art character with gender selection and mood states.
- Pokemon companions from shop.
- Streak and diamond reward system.
- Badge achievements.
- Calendar view of full prep timeline.
- Adaptive replan placeholder.

## Tech Stack

- React + Vite.
- TypeScript.
- TailwindCSS.
- Supabase (PostgreSQL).
- Amazon Nova Lite (Amazon Bedrock).
- FastAPI Python backend.

## Architecture

Frontend (React/Vite) -> Supabase (auth + database) -> FastAPI backend -> Amazon Nova Lite via Amazon Bedrock for MCQ generation.

## AI Integration

When a user completes a task, a live Amazon Nova Lite call (via Amazon Bedrock) generates a unique MCQ specific to the topic and difficulty. No two attempts see the same question.

## How to Run Locally

- Clone the repo.
- Run `npm install`.
- Create `.env` in the root folder using `.env.example` as reference and fill in your keys.
- Run `npm run dev` for frontend.
- Run `uvicorn main:app --reload` inside nemo-backend for backend.