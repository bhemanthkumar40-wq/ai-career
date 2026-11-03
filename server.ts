import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json());

// Initialize Google GenAI if key is provided
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Could not initialize GoogleGenAI client:', err);
  }
}

// 1. Direct ZIP Download endpoint
app.get('/api/download-zip', (req, res) => {
  const zipPath = path.resolve(process.cwd(), 'CareerPilot-AI.zip');
  if (fs.existsSync(zipPath)) {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="CareerPilot-AI.zip"');
    const fileStream = fs.createReadStream(zipPath);
    fileStream.pipe(res);
  } else {
    res.status(404).json({ error: 'CareerPilot-AI.zip file not found' });
  }
});

// 2. Project File Inspector API (allows user to view Python files in UI)
app.get('/api/project-files', (req, res) => {
  const filePath = req.query.path as string;
  const projectRoot = path.resolve(process.cwd(), 'CareerPilot-AI');

  if (!filePath) {
    // List important project files
    const fileList = [
      { name: 'README.md', path: 'README.md', category: 'Documentation' },
      { name: 'requirements.txt', path: 'requirements.txt', category: 'Config' },
      { name: '.env.example', path: '.env.example', category: 'Config' },
      { name: 'backend/app/main.py', path: 'backend/app/main.py', category: 'Backend Entry' },
      { name: 'backend/app/models.py', path: 'backend/app/models.py', category: 'Database Models' },
      { name: 'backend/app/ml_engine.py', path: 'backend/app/ml_engine.py', category: 'ML Engine' },
      { name: 'backend/app/auth.py', path: 'backend/app/auth.py', category: 'Security' },
      { name: 'backend/app/gemini_service.py', path: 'backend/app/gemini_service.py', category: 'AI Assistant' },
      { name: 'backend/seed_data.py', path: 'backend/seed_data.py', category: 'Seed Data' },
      { name: 'backend/tests/test_ml_and_api.py', path: 'backend/tests/test_ml_and_api.py', category: 'Unit Tests' },
      { name: '.vscode/launch.json', path: '.vscode/launch.json', category: 'VS Code' }
    ];
    return res.json({ files: fileList });
  }

  // Prevent directory traversal
  const safePath = path.normalize(filePath).replace(/^(\.\.[\/\\])+/, '');
  const absoluteTarget = path.join(projectRoot, safePath);

  if (!absoluteTarget.startsWith(projectRoot) || !fs.existsSync(absoluteTarget)) {
    return res.status(404).json({ error: 'File not found' });
  }

  try {
    const content = fs.readFileSync(absoluteTarget, 'utf-8');
    res.json({ path: safePath, content });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. AI Assistant endpoint (calls Gemini 3.8 Flash or returns local coach)
app.post('/api/assistant/chat', async (req, res) => {
  const { messages, mode } = req.body;
  const lastMsg = messages && messages.length > 0 ? messages[messages.length - 1].content : '';

  if (aiClient && process.env.GEMINI_API_KEY) {
    try {
      const systemInstruction = `You are CareerPilot AI, an expert, encouraging, and honest career advisor and interview coach for software engineering and tech job seekers.
Provide structured feedback on resume bullets using Google's XYZ formula. Give mock interview practice with targeted follow-up questions and constructive critique.
Always maintain transparency: distinguish recommendations and estimates from guaranteed outcomes.`;

      let prompt = `${systemInstruction}\n\nMode: ${mode || 'general'}\n\nConversation:\n`;
      for (const m of messages || []) {
        prompt += `${m.role.toUpperCase()}: ${m.content}\n`;
      }
      prompt += '\nASSISTANT:';

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      return res.json({
        response: response.text || "I'm here to assist with your career navigation.",
        model_used: 'gemini-3.8-flash',
        is_gemini_active: true,
        suggestions: [
          'Can you give me an example?',
          'How do I highlight this in my resume?',
          'What is a common follow-up question?'
        ]
      });
    } catch (err: any) {
      console.warn('Gemini API call failed, falling back to local coach:', err.message);
    }
  }

  // Fallback local explainable responses
  let localReply = '';
  const lower = (lastMsg || '').toLowerCase();

  if (lower.includes('resume') || mode === 'resume_review') {
    localReply = `### 📄 Resume Optimization Advice (Local Career Coach)
To maximize interview callbacks, rewrite experience bullets using the **Google XYZ formula**:
*"Accomplished [X] as measured by [Y] by doing [Z]"*

**High-Impact Changes:**
1. **Quantify Results**: Replace *"Built backend APIs"* with *"Engineered 14 RESTful FastAPI endpoints with SQLite caching, reducing client response latency by 38%"*.
2. **Prioritize Relevant Stack**: Group skills by category (Languages, Frameworks, Cloud/DevOps) at the top of your resume.
3. **Trim Low-Signal Bullets**: Remove obvious tasks like "attended agile meetings" to showcase high-leverage architectural accomplishments.`;
  } else if (lower.includes('interview') || mode === 'interview_prep') {
    localReply = `### 🎯 STAR Behavioral Interview Practice (Local Career Coach)
Here is a high-frequency behavioral prompt for your target engineering tier:

> *"Tell me about a time you had to deliver a critical project under a tight deadline and discovered a major technical bug."*

**Structure your response using the STAR method:**
- **Situation (15%)**: What was the business impact and context?
- **Task (15%)**: What was your specific technical responsibility?
- **Action (50%)**: What diagnostic steps did you execute? How did you isolate root causes?
- **Result (20%)**: What was the measurable outcome and long-term fix?`;
  } else if (lower.includes('salary') || lower.includes('offer')) {
    localReply = `### 💼 Salary & Offer Negotiation Principles (Local Career Coach)
1. **Anchor with Market Data**: State expectations as a verified target range ($115k–$135k) based on company tier and responsibilities.
2. **Evaluate Total Compensation**: Factor in equity vesting, signing incentives, health benefits, and remote stipends.
3. **Lead with Gratitude**: Reaffirm excitement for the team before presenting counter-proposals.`;
  } else {
    localReply = `### 🧭 CareerPilot AI Advisor (Local Career Coach)
Welcome! Here are key areas I can help you with today:
- **Placement Readiness**: Strategies to improve from 68 to 85+ by targeting high-demand skill gaps.
- **Resume Bullets**: Framing project accomplishments into compelling metrics.
- **Interview Readiness**: Mock technical and behavioral interview preparation.
- **Job Match Breakdown**: Identifying why specific roles match or have missing qualifications.`;
  }

  return res.json({
    response: localReply,
    model_used: 'CareerPilot Local Domain Coach',
    is_gemini_active: false,
    suggestions: [
      'How do I format bullets using the Google XYZ formula?',
      'Simulate a STAR behavioral question for a backend engineer',
      'How to negotiate base salary for a tech offer'
    ]
  });
});

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CareerPilot AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
