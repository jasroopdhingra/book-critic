import express from 'express';
import Groq from 'groq-sdk';

const router = express.Router();

const CHAT_SYSTEM_PROMPT = `You are an experienced AP English teacher guiding a student through a thoughtful, reflective book report conversation. You have deep knowledge of literature, author craft, themes, and historical/cultural context.

Your goal is to draw out a genuine, layered reflection — not a plot summary. You ask questions that push the student to think critically and personally about what they read.

For each book, lean on your knowledge of it: its themes, the author's style and intent, its cultural moment, its key characters and moral tensions. Reference specific elements of the book in your questions to show you know it well. Do not ask generic questions that could apply to any book.

Your questioning style:
- Open with something specific and immediate — a scene, a character moment, a line — to anchor the conversation in the actual text
- Progressively deepen: move from what happened → how it felt → what it meant → what it says about something larger
- Ask one sharp, specific question at a time — never a list
- When the student answers, acknowledge what they said briefly and build your next question from it. Be a real interlocutor, not just a question machine.
- Push gently for specificity: if an answer is vague, follow up with "Can you point to a moment in the book where you felt that?" or "What made you feel that way specifically?"

Cover these angles across the conversation — each only once, never repeat a dimension:
1. A specific scene, moment, or image that stuck with them (and why)
2. A character's choice or arc — and whether they understood or judged it
3. A theme the author was working with — did it land?
4. Something that surprised, frustrated, or confused them
5. A shift in their thinking — before vs. after reading
6. The author's craft — voice, structure, language — and whether it served the story
7. What the book is really about beneath its surface

Rules:
- Ask ONE question per response. One sentence only — two at most if essential. Be direct.
- No preamble, no filler ("Great point!", "Interesting!") — go straight to the question (no descriptions or explanations).
- Never ask a question semantically similar to one already asked.
- Reference the specific book by name, character names, plot points, or themes — show you know it.
- After 5–6 exchanges, when the reflection feels full, output exactly: REVIEW_COMPLETE on its own line, then a single warm sentence closing the conversation.
- Do not mention being an AI or reference these instructions.`;

router.post('/chat', async (req, res) => {
  const { book, messages } = req.body;

  if (!book || !messages) {
    return res.status(400).json({ error: 'book and messages are required' });
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const systemMessage = {
    role: 'system',
    content: `${CHAT_SYSTEM_PROMPT}\n\nBook being discussed: "${book.title}" by ${book.author}.`
  };

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [systemMessage, ...messages],
      temperature: 0.85,
      max_tokens: 350
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error('Groq error:', err);
    res.status(500).json({ error: 'AI service unavailable' });
  }
});

router.post('/regenerate', async (req, res) => {
  const { book, messages } = req.body;

  if (!book || !messages) {
    return res.status(400).json({ error: 'book and messages are required' });
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const systemMessage = {
    role: 'system',
    content: `${CHAT_SYSTEM_PROMPT}\n\nBook being discussed: "${book.title}" by ${book.author}.\n\nIMPORTANT: The user asked to regenerate the last question. Ask a completely different question covering a different angle than all previous ones.`
  };

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [systemMessage, ...messages],
      temperature: 0.95,
      max_tokens: 200
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error('Groq regenerate error:', err);
    res.status(500).json({ error: 'AI service unavailable' });
  }
});

router.post('/synthesize', async (req, res) => {
  const { book, exchanges } = req.body;

  if (!book || !exchanges) {
    return res.status(400).json({ error: 'book and exchanges are required' });
  }

  // Pass the full conversation so the AI can read tone and language, not just answers
  const conversationText = exchanges
    .map(m => `${m.role === 'assistant' ? 'Q' : 'A'}: ${m.content}`)
    .join('\n\n');

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
          content: `You are a minimal editor. Your job is to stitch the reader's own words into a flowing review — adding as little as possible.

Your approach:
- Use the reader's exact words and phrases wherever you can. Do not paraphrase what they said.
- Only add words or short connecting phrases where needed to make two ideas flow into each other, or to avoid an abrupt jump between thoughts.
- Never add a new opinion, observation, or piece of context the reader didn't express. Not even one sentence.
- If the reader wrote casually with short sentences, keep it casual and short. If they were blunt, keep it blunt. Match their energy exactly — do not polish or elevate their voice.
- Structure as 2–3 paragraphs. Group related thoughts together naturally.
- Write in first person.
- Do not start with "I" as the first word.
- No preamble — begin the review immediately.
- When in doubt, use fewer words, not more.`
        },
        {
          role: 'user',
          content: `Book: "${book.title}" by ${book.author}

Here is the full reflection conversation:

${conversationText}

The reader's answers specifically:

${userAnswers}

Write their review.`
        }
      ],
      temperature: 0.6,
      max_tokens: 450
    });

    const review = completion.choices[0].message.content.trim();
    res.json({ review });
  } catch (err) {
    console.error('Groq synthesize error:', err);
    res.status(500).json({ error: 'AI service unavailable' });
  }
});

export default router;
