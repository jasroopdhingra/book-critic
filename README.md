# Bookshelf

A reading journal that turns your reflections into real reviews.

Log a book you just finished, answer a few thoughtful questions guided by AI, and get a personal review — written in your own voice — saved to your shelf permanently.

**Live:** [book-critic.onrender.com](https://book-critic.onrender.com)

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
- **Database** — SQLite via `better-sqlite3`
- **AI** — Groq API (Llama 3.3 70B)
- **Book data** — Open Library API (free, no key required)
- **Deployed** — Render (full-stack, single URL)

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

## Deploying to Render

The repo includes a `render.yaml`. To deploy:

1. Push to GitHub
2. Go to [render.com](https://render.com) → New → Web Service → connect repo
3. Set the following in Render dashboard settings:
   - **Build command:** `npm install && cd client && npm install && npm run build`
   - **Start command:** `node server/index.js`
   - **Environment variable:** `GROQ_API_KEY` → your Groq key
4. Deploy
