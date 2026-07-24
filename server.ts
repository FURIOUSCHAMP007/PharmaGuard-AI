import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client server-side with telemetry user-agent
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
};

// API Health Check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "online",
    system: "PharmaGuard AI Autonomous Clinical Safety Intelligence System",
    version: "2.5.0-RESEARCH",
    timestamp: new Date().toISOString()
  });
});

// Gemini Clinical Reasoning API Endpoint
app.post("/api/gemini/reasoning", async (req, res) => {
  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: "GEMINI_API_KEY is not configured in environment.",
        fallback: true
      });
    }

    const { patient, medications, interactions } = req.body;

    const prompt = `
You are the lead Clinical Pharmacologist and AI Medical Specialist for PharmaGuard AI.
Analyze the following patient profile and medication regimen:

Patient Name: ${patient?.name || 'Unknown'} (Age: ${patient?.age}, Gender: ${patient?.gender})
Primary Diagnosis: ${patient?.primaryDiagnosis}
Kidney Function: eGFR ${patient?.kidneyFunction?.egfr} mL/min/1.73m2, Cr ${patient?.kidneyFunction?.serumCreatinine} mg/dL (${patient?.kidneyFunction?.stage})
Liver Function: ALT ${patient?.liverFunction?.alt}, AST ${patient?.liverFunction?.ast}, Child-Pugh ${patient?.liverFunction?.childPughScore}
Pharmacogenomics: CYP2D6: ${patient?.genetics?.cyp2d6}, CYP2C19: ${patient?.genetics?.cyp2c19}, CYP3A4: ${patient?.genetics?.cyp3a4}
Vitals: BP ${patient?.vitals?.bpSystolic}/${patient?.vitals?.bpDiastolic}, Heart Rate ${patient?.vitals?.heartRate}, QTc ${patient?.vitals?.qtcIntervalMs} ms

Active Medications:
${JSON.stringify(medications, null, 2)}

Identified Known Interactions:
${JSON.stringify(interactions, null, 2)}

Provide a comprehensive clinical reasoning output with the following structured sections:
1. Executive Safety Summary
2. Deep Mechanistic & Metabolic Pathway Analysis (CYP450 competition, transporter binding, hERG channel impacts)
3. Causal Risk Hypothesis (Why these interactions produce adverse outcomes for THIS specific patient twin)
4. Evidence-Grounded Recommendations (Safer drug replacements, dose modifications, monitoring plan)
5. Patient-Friendly Clinical Explanation
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert Clinical Pharmacologist, Pharmacogenomics Specialist, and Medical AI Researcher. Provide precise, evidence-based, structured clinical reasoning with exact medical terms."
      }
    });

    res.json({ text: response.text });
  } catch (err: any) {
    console.error("Gemini Reasoning Error:", err);
    res.status(500).json({ error: err?.message || "Failed to generate reasoning" });
  }
});

// Gemini Interactive Chat Co-pilot API Endpoint
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: "GEMINI_API_KEY is not configured.",
        fallbackText: "I am operating in offline mode because GEMINI_API_KEY is missing. You can view all pre-computed Knowledge Graph paths and causal counterfactual models directly in the interactive UI tabs."
      });
    }

    const { messages, patientContext } = req.body;

    const chat = ai.chats.create({
      model: "gemini-3.6-flash",
      config: {
        systemInstruction: `You are PharmaGuard AI's Clinical Co-pilot.
You assist doctors, pharmacists, and researchers by analyzing drug interactions, pharmacogenomics, Knowledge Graph RAG pathways, causal counterfactuals, and FDA safety communications.
Current Active Patient Context: ${JSON.stringify(patientContext || {}, null, 2)}
Always provide clear, evidence-graded clinical responses with citations to guidelines (ACC/AHA, KDIGO, NCCN) and PubMed evidence where appropriate.`
      }
    });

    const userLastMsg = messages[messages.length - 1]?.content || "Hello";
    const response = await chat.sendMessage({ message: userLastMsg });

    res.json({ text: response.text });
  } catch (err: any) {
    console.error("Gemini Chat Error:", err);
    res.status(500).json({ error: err?.message || "Gemini Chat API Error" });
  }
});

// Gemini Multi-Agent Synthesis API Endpoint
app.post("/api/gemini/agent-consensus", async (req, res) => {
  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ error: "Gemini API key missing" });
    }

    const { agentOutputs, patientName } = req.body;

    const prompt = `
Synthesize a consensus clinical recommendation for patient ${patientName} from the outputs of 8 specialized AI Agents:
${JSON.stringify(agentOutputs, null, 2)}

Provide:
1. Overall Consensus Safety Score (0 to 100%)
2. Unanimous Consensus Agreements
3. Key Differences or Dissents among agents
4. Final Actionable Physician Guidance
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt
    });

    res.json({ text: response.text });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Synthesis failed" });
  }
});

// Mount Vite in dev, static files in prod
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PharmaGuard AI Express Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
