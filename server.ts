import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Google Gen AI
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }

  // API route for query explanation
  app.post("/api/gemini/explain", async (req, res) => {
    try {
      if (!ai) {
        return res.status(500).json({ error: "Gemini API key is not configured. Please add it to Settings > Secrets." });
      }

      const { sessionTitle, questionTitle, questionPrompt, officialSolution, userQuery, executionError } = req.body;

      const prompt = `
You are an expert DBMS SQL tutor guiding a student who is learning SQL through a 10-hour training course.
The student is currently working on:
- **Session**: ${sessionTitle}
- **Question**: ${questionTitle}
- **Goal**: ${questionPrompt}
- **Official SQL Solution**: \`${officialSolution}\`

The student typed the following query:
\`\`\`sql
${userQuery || "/* Empty query */"}
\`\`\`

${executionError ? `The database returned this execution error:\n\`\`\`\n${executionError}\n\`\`\`` : `The query executed without syntactic errors, but it did not return the expected correct results.`}

Provide a concise, friendly, encouraging, and educational explanation (max 2-3 paragraphs) to help the student understand what's wrong and how they can fix their query.
Guidelines:
1. Speak in a supportive, positive tutor tone.
2. Explain the core SQL concept (e.g. JOINs, GROUP BY, WHERE vs HAVING, row numbering) that applies here.
3. Guide them towards the correct solution *without* just printing the exact solution query verbatim unless they are extremely close or it's a syntax error. Encourage active learning!
4. Format your output in clean Markdown.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are a patient and helpful SQL database instructor.",
        },
      });

      res.json({ explanation: response.text });
    } catch (err: any) {
      console.error("Gemini API Error:", err);
      res.status(500).json({ error: err.message || "An error occurred while generating explanation." });
    }
  });

  // Serve static files / Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
