# Nemo

AI-powered software interview preparation. Students get a personalised day-by-day prep plan, complete tasks verified by AI-generated MCQs, earn diamonds, unlock companions, and track progress through a pixel-art character that evolves with their mood.

## Features

- Deterministic stage-based prep plan.
- AI-generated MCQ validation via Gemini.
- Pixel art character with gender selection and mood states.
- Pokemon companions from shop.
- Streak and diamond reward system.
- Badge achievements.
- Calendar view of full prep timeline.
- Adaptive replan placeholder.

## Tech Stack

- Next.js 14.
- TypeScript.
- TailwindCSS.
- Supabase (PostgreSQL).
- Google Gemini AI.
- FastAPI Python backend.

## Architecture

Frontend (Next.js) -> Supabase (auth + database) -> FastAPI backend -> Gemini AI for MCQ generation.

## AI Integration

When a user completes a task, a live Gemini API call generates a unique MCQ specific to the topic and difficulty. No two attempts see the same question.

## How to Run Locally

- Clone the repo.
- Run `npm install`.
- Create `.env` in the root folder using `.env.example` as reference and fill in your keys.
- Run `npm run dev` for frontend.
- Run `uvicorn main:app --reload` inside nemo-backend for backend.