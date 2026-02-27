# Bookshelf

A reading journal that turns your reflections into real reviews.

Log a book you just finished, answer a few thoughtful questions guided by AI, and get a personal review — written in your own voice — saved to your shelf permanently.

**Live:** https://book-critic-pearl.vercel.app/

---

## How it works

1. **Search** for the book you just finished
2. **Reflect** — an AI (acting like an AP English teacher) asks you 4–6 book-specific questions, one at a time
3. **Review** — your answers are synthesized into a cohesive, first-person review in your own voice
4. **Shelf** — the book and review are saved to your personal bookshelf

---

## Stack

- **Frontend** — React + Vite, CSS Modules
- **Backend** — Node.js + Express
- **Database** — Turso (libSQL)
- **AI** — Groq API (Llama 3.3 70B)
- **Book data** — Open Library API (free, no key required)
- **Deployed** — Vercel (frontend + serverless API)

---

## Running locally

### Prerequisites

- Node.js 18+
- A free [Groq API key](https://console.groq.com)

### Setup

```bash
# Clone the repo
git clone https://github.com/jasroopdhingra/book-critic.git
cd book-critic

# Install server dependencies
npm install

# Install client dependencies
cd client && npm install && cd ..

# Add your Groq API key
echo "GROQ_API_KEY=your_key_here" > .env
```

### Run

```bash
# Start both servers (runs on localhost:5173 + localhost:3001)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Deploying to Vercel

1. Push to GitHub and connect the repo at [vercel.com](https://vercel.com)
2. Add these environment variables in Vercel → Settings → Environment Variables:
   - `GROQ_API_KEY` — your Groq API key
   - `TURSO_DATABASE_URL` — your Turso database URL
   - `TURSO_AUTH_TOKEN` — your Turso auth token
   - `CLERK_SECRET_KEY` — from Clerk dashboard (for backend auth)
   - `VITE_CLERK_PUBLISHABLE_KEY` — from Clerk (for frontend, add to Production)
3. Deploy — Vercel will use the `vercel.json` config automatically
4. Add your Vercel URL (e.g. `https://your-app.vercel.app`) to Clerk’s allowed origins
