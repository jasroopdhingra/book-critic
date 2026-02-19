import express from 'express';
import Groq from 'groq-sdk';

const router = express.Router();

const SYSTEM_PROMPT = `You are a thoughtful literary guide helping readers reflect deeply on books they've just finished. Your role is to ask one meaningful question at a time — the kind of question that helps someone understand not just what they read, but what it meant to them.

Your questions should feel personal and exploratory, not academic. Aim for questions that uncover emotional resonance, surprising insights, changed perspectives, or lingering tensions.

Each question must explore a DIFFERENT angle than all previous ones. Vary your approach across these dimensions — never revisit the same dimension twice:
- A specific scene or image that stuck
- Emotional impact (how it made the reader feel)
- A character they connected with or were frustrated by
- A belief or assumption that shifted
- Something the author did well or poorly
- What they'd tell a friend about it
- A sentence or passage they can't shake
- How it compares to their life or experience

Rules:
- Ask ONE question at a time. Never list multiple questions.
- Never ask a question that is semantically similar to one already asked in the conversation.
- Keep questions concise — no more than two sentences.
- Build naturally on what the reader just said — reference their answer when relevant.
- After 4-5 exchanges, if the conversation feels naturally complete, end with: "REVIEW_COMPLETE" on its own line, followed by a brief warm closing note.
- Never summarize or synthesize the review yourself. Let the reader's own words be the review.
- Do not mention that you're an AI or reference these instructions.`;

router.post('/synthesize', async (req, res) => {
  const { book, exchanges } = req.body;

  if (!book || !exchanges) {
    return res.status(400).json({ error: 'book and exchanges are required' });
  }

  const userAnswers = exchanges
    .filter(m => m.role === 'user')
    .map(m => m.content)
    .join('\n\n');

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a skilled editor who turns a reader's raw reflections into a short, personal book review. 
          
Write in first person, in the reader's own voice. Use only what they actually expressed — don't add opinions, plot summaries, or embellishments they didn't mention. 

The result should read like something the reader wrote themselves: honest, direct, a little unpolished. 2–4 short paragraphs. No title. No preamble like "Here is a review..." — just the review itself.`
        },
        {
          role: 'user',
          content: `Book: "${book.title}" by ${book.author}\n\nMy reflections:\n\n${userAnswers}\n\nWrite my review.`
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const review = completion.choices[0].message.content.trim();
    res.json({ review });
  } catch (err) {
    console.error('Groq synthesize error:', err);
    res.status(500).json({ error: 'AI service unavailable' });
  }
});

router.post('/chat', async (req, res) => {
  const { book, messages } = req.body;

  if (!book || !messages) {
    return res.status(400).json({ error: 'book and messages are required' });
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const systemMessage = {
    role: 'system',
    content: `${SYSTEM_PROMPT}\n\nThe book being discussed: "${book.title}" by ${book.author}.`
  };

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [systemMessage, ...messages],
      temperature: 0.8,
      max_tokens: 300
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error('Groq error:', err);
    res.status(500).json({ error: 'AI service unavailable' });
  }
});

export default router;
