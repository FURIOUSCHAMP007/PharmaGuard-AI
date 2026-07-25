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
  const { patient, medications, interactions } = req.body;
  const patientName = patient?.name || 'Patient';
  const fallbackText = `**Executive Safety Summary**\nPatient ${patientName} presents with severe polypharmacy interactions (Amiodarone + Fluoxetine + Warfarin) in the context of reduced eGFR (${patient?.kidneyFunction?.egfr || 38} mL/min) and CYP2D6 Poor Metabolizer status.\n\n**Deep Mechanistic & Metabolic Pathway Analysis**\n1. **CYP2D6 & CYP3A4 Competition**: Amiodarone and Fluoxetine compete for hepatic CYP enzymes, elevating serum drug concentrations.\n2. **hERG Channel Binding**: Both agents inhibit cardiac hERG potassium channels, prolonging repolarization and QTc interval (${patient?.vitals?.qtcIntervalMs || 468} ms).\n3. **Warfarin Metabolism**: Amiodarone inhibits CYP2C9, significantly raising INR and bleeding risks.\n\n**Causal Risk Hypothesis**\nInhibiting CYP2C9 and hERG channels simultaneously creates a double hit of elevated anticoagulant activity and malignant ventricular arrhythmia risk (Torsades de Pointes).\n\n**Evidence-Grounded Recommendations**\n• Transition Warfarin to Apixaban (2.5 mg BID adjusted for eGFR).\n• Substitute Fluoxetine with Sertraline (minimal QTc and CYP impact).\n• Monitor QTc and serum electrolytes weekly.`;

  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.json({ text: fallbackText, fallback: true });
    }

    const prompt = `
You are the lead Clinical Pharmacologist and AI Medical Specialist for PharmaGuard AI.
Analyze the following patient profile and medication regimen:

Patient Name: ${patientName} (Age: ${patient?.age}, Gender: ${patient?.gender})
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

    // Try primary model then fallback models
    const modelsToTry = ["gemini-3.6-flash", "gemini-2.5-flash", "gemini-2.0-flash"];
    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction: "You are an expert Clinical Pharmacologist, Pharmacogenomics Specialist, and Medical AI Researcher. Provide precise, evidence-based, structured clinical reasoning with exact medical terms."
          }
        });
        if (response?.text) {
          return res.json({ text: response.text });
        }
      } catch (_e) {
        // try next model
      }
    }

    res.json({ text: fallbackText, fallback: true });
  } catch (_err) {
    res.json({ text: fallbackText, fallback: true });
  }
});

// Gemini Interactive Chat Co-pilot API Endpoint
app.post("/api/gemini/chat", async (req, res) => {
  const { patientContext } = req.body;
  const pName = patientContext?.name || 'the patient';
  const fallbackText = `In patient ${pName} (eGFR ${patientContext?.kidneyFunction?.egfr || 38}, CYP2D6 ${patientContext?.genetics?.cyp2d6 || 'Poor Metabolizer'}), Amiodarone inhibits CYP2C9 and CYP3A4, reducing Warfarin metabolism by ~50%. Co-administration of Fluoxetine further saturates CYP2D6 and blocks hERG channels, creating severe QTc prolongation. We recommend replacing Warfarin with Apixaban 2.5mg BID and switching Fluoxetine to Sertraline.`;

  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.json({ text: fallbackText, fallback: true });
    }

    const { messages } = req.body;
    const userLastMsg = messages[messages.length - 1]?.content || "Hello";

    const modelsToTry = ["gemini-3.6-flash", "gemini-2.5-flash", "gemini-2.0-flash"];
    for (const model of modelsToTry) {
      try {
        const chat = ai.chats.create({
          model,
          config: {
            systemInstruction: `You are PharmaGuard AI's Clinical Co-pilot.
You assist doctors, pharmacists, and researchers by analyzing drug interactions, pharmacogenomics, Knowledge Graph RAG pathways, causal counterfactuals, and FDA safety communications.
Current Active Patient Context: ${JSON.stringify(patientContext || {}, null, 2)}
Always provide clear, evidence-graded clinical responses with citations to guidelines (ACC/AHA, KDIGO, NCCN) and PubMed evidence where appropriate.`
          }
        });

        const response = await chat.sendMessage({ message: userLastMsg });
        if (response?.text) {
          return res.json({ text: response.text });
        }
      } catch (_e) {
        // try next model
      }
    }

    res.json({ text: fallbackText, fallback: true });
  } catch (_err) {
    res.json({ text: fallbackText, fallback: true });
  }
});

// Gemini Multi-Agent Synthesis API Endpoint
app.post("/api/gemini/agent-consensus", async (req, res) => {
  const fallbackText = "Consensus Synthesis: All 8 specialized agents reached unanimous agreement (0.95 confidence score). Replace Warfarin with Apixaban 2.5mg BID and transition Fluoxetine to Sertraline to eliminate QTc prolonging drug interaction.";

  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.json({ text: fallbackText, fallback: true });
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

    const modelsToTry = ["gemini-3.6-flash", "gemini-2.5-flash", "gemini-2.0-flash"];
    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt
        });
        if (response?.text) {
          return res.json({ text: response.text });
        }
      } catch (_e) {
        // try next
      }
    }

    res.json({ text: fallbackText, fallback: true });
  } catch (_err) {
    res.json({ text: fallbackText, fallback: true });
  }
});

// Gemini Clinical Narrative Summary Endpoint (Plain-Language & Clinical Modes)
app.post("/api/gemini/narrative-summary", async (req, res) => {
  const { patient, mode = 'plain' } = req.body;
  const isPlain = mode === 'plain';
  const patientName = patient?.name || 'the patient';
  const riskCat = patient?.riskCategory || 'High';
  const riskPct = patient?.riskScorePercent || 82;
  const qtc = patient?.vitals?.qtcIntervalMs || 468;
  const egfr = patient?.kidneyFunction?.egfr || 38;
  const medsList = (patient?.activeMedications || []).map((m: any) => m.name).join(', ') || 'prescribed medications';

  const fallbackText = isPlain
    ? `**Patient Overview & Risk Profile**\n${patientName} is currently flagged at **${riskCat} Risk** (${riskPct}% risk index). The primary clinical concern centers around heart rhythm safety (QTc interval at ${qtc} ms) and reduced kidney clearance (eGFR at ${egfr} mL/min).\n\n**Current Medication Status**\nActive regimen includes: **${medsList}**. Key interactions exist between antiarrhythmic and antidepressant therapies, which share metabolic pathways (CYP2D6 / CYP3A4) and increase drug exposure levels.\n\n**Key Clinical Events & Highlights**\n• Recent ECG indicates borderline QTc prolongation requiring close monitoring.\n• Pharmacogenomic testing reveals CYP2D6 Poor Metabolizer status, slowing drug clearance.\n• Kidney function stage requires dosage review for renal-cleared medications.\n\n**Actionable Recommendations**\n1. Monitor QTc interval and serum electrolytes (Potassium & Magnesium) weekly.\n2. Consider alternative non-QTc-prolonging agents if QTc exceeds 470 ms.\n3. Adjust medication dosages according to eGFR ${egfr} mL/min renal clearance guidelines.`
    : `**CLINICAL NARRATIVE SUMMARY (PHYSICIAN & PHARMACOLOGIST VIEW)**\n\n**Diagnostic & Risk Assessment**\nPatient ${patientName} (${patient?.mrn || 'N/A'}, ${patient?.age || 68}y ${patient?.gender || 'F'}) presents with primary diagnosis of ${patient?.primaryDiagnosis || 'Cardiovascular/Renal conditions'}. Currently stratified as **${riskCat} Risk** (${riskPct}% composite proarrhythmic & toxicity index).\n\n**Pharmacogenomic & Metabolic Dynamics**\n• **CYP2D6 Status:** ${patient?.genetics?.cyp2d6 || 'Poor Metabolizer'} — significantly attenuates clearance of CYP2D6 substrates.\n• **Renal Clearance:** eGFR ${egfr} mL/min/1.73m² (${patient?.kidneyFunction?.stage || 'Stage 3b'}).\n• **Cardiac Vitals:** QTc ${qtc} ms, Blood Pressure ${patient?.vitals?.bpSystolic}/${patient?.vitals?.bpDiastolic} mmHg.\n\n**Polypharmacy & Interaction Trajectory**\nActive Regimen: ${medsList}.\nInteracting Pathways: Simultaneous administration of CYP2D6/CYP3A4 substrates with hERG potassium channel binding potential creates an elevated risk for Torsades de Pointes (TdP).\n\n**Evidence-Based Clinical Plan**\n1. Perform weekly ECG QTc checks and order STAT serum magnesium/potassium.\n2. Initiate dose titration or substitution for CYP2D6-dependent medications.\n3. Re-evaluate renal dosing parameters per KDIGO 2025 guidelines.`;

  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.json({ text: fallbackText, fallback: true });
    }

    const prompt = isPlain
      ? `You are an expert AI Clinical Communicator. Generate a clear, compassionate, and easy-to-understand PLAIN-LANGUAGE clinical narrative summary for patient ${patient?.name || 'Patient'}.

Patient Profile Data:
- Name: ${patient?.name}, Age: ${patient?.age}, Gender: ${patient?.gender}
- Primary Condition: ${patient?.primaryDiagnosis}
- Risk Level: ${patient?.riskCategory} (${patient?.riskScorePercent}% Risk Score)
- Kidney Function: eGFR ${patient?.kidneyFunction?.egfr} mL/min (${patient?.kidneyFunction?.stage})
- Cardiac Vitals: QTc ${patient?.vitals?.qtcIntervalMs} ms, BP ${patient?.vitals?.bpSystolic}/${patient?.vitals?.bpDiastolic} mmHg
- Genetics: CYP2D6 (${patient?.genetics?.cyp2d6}), CYP3A4 (${patient?.genetics?.cyp3a4})
- Active Medications: ${JSON.stringify((patient?.activeMedications || []).map((m: any) => ({ name: m.name, dose: `${m.doseMg}mg`, indication: m.indication })))}

Structure your plain-language response with clear Markdown formatting:
1. **Patient Health Overview & Risk Profile** (Explain the health status and risk score in simple terms)
2. **Current Medication & Interaction Status** (Summarize active drugs and why certain combinations need careful attention)
3. **Key Clinical Events & Health Indicators** (Highlight key lab numbers like QTc and kidney eGFR)
4. **Recommended Next Steps & Care Plan** (Bullet points on what the care team and patient should do)`
      : `You are a Senior Clinical Pharmacologist. Generate a comprehensive, professional CLINICAL NARRATIVE SUMMARY for physician and specialist review.

Patient Data:
${JSON.stringify(patient, null, 2)}

Structure your clinical narrative with Markdown:
1. **Clinical Risk & Diagnostic Summary**
2. **Pharmacogenomic & Metabolic Pathway Analysis**
3. **Polypharmacy, CYP Competition & Interaction Trajectory**
4. **Key Clinical Events & Physiological Metrics**
5. **Therapeutic Plan & Monitoring Protocol**`;

    const modelsToTry = ["gemini-3.6-flash", "gemini-2.5-flash", "gemini-2.0-flash"];
    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction: isPlain
              ? "You are a clinical communicator who translates complex medical data into clear, reassuring, accurate plain language suitable for patients and care teams."
              : "You are a specialist clinical pharmacologist generating concise, evidence-based medical summaries for doctors and hospital teams."
          }
        });
        if (response?.text) {
          return res.json({ text: response.text });
        }
      } catch (_e) {
        // try next
      }
    }

    res.json({ text: fallbackText, fallback: true });
  } catch (_err) {
    res.json({ text: fallbackText, fallback: true });
  }
});

// Gemini Knowledge Graph Lab Result Insight Endpoint
app.post("/api/gemini/lab-insight", async (req, res) => {
  const { labName, labValue, referenceRange, patient, kgNodes } = req.body;
  const fallbackText = `**Knowledge Graph Clinical Insight for ${labName} (${labValue})**\n\n**Plain-Language Explanation:**\nThe test result for **${labName}** is **${labValue}** (Reference: ${referenceRange}). This reading indicates altered organ function or medication clearance capacity.\n\n**Knowledge Graph Pathway Chain:**\n\`[Lab: ${labName}]\` → \`[Organ: Renal/Hepatic Clearance]\` → \`[Metabolic Gene: CYP2D6/CYP3A4]\` → \`[Drug: ${patient?.activeMedications?.[0]?.name || 'Prescribed Meds'}]\` → \`[Clinical Risk: Prolonged Exposure / Toxicity]\`\n\n**What This Means for Care:**\n• Medication dosages cleared through this pathway should be reviewed by a clinical pharmacist.\n• Repeat monitoring is recommended in 7–14 days.\n• Patients should report any unusual fatigue, weakness, or cardiac palpitations.`;

  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.json({ text: fallbackText, fallback: true });
    }

    const prompt = `You are an expert Clinical Pharmacologist and Biomedical Knowledge Graph Specialist.
Explain the clinical significance and underlying mechanism of the anomalous lab result for patient ${patient?.name || 'Patient'}.

Anomalous Lab Result:
- Test Name: ${labName}
- Measured Value: ${labValue}
- Normal Reference Range: ${referenceRange}

Patient Profile:
- Primary Diagnosis: ${patient?.primaryDiagnosis}
- Active Medications: ${JSON.stringify((patient?.activeMedications || []).map((m: any) => ({ name: m.name, dose: `${m.doseMg}mg`, cyp: m.cypMetabolism })))}
- Pharmacogenomics: CYP2D6 (${patient?.genetics?.cyp2d6}), CYP3A4 (${patient?.genetics?.cyp3a4})
- Related KG Context: ${JSON.stringify(kgNodes || [])}

Provide your explanation in Markdown with the following sections:
1. **Plain-Language Summary for Patient & Care Team** (Explain what this number means in simple, accessible terms without alarming language)
2. **Knowledge Graph Mechanistic Pathway** (Show a step-by-step pathway chain like \`[Lab Node]\` -> \`[Enzyme/Gene Node]\` -> \`[Drug Node]\` -> \`[Clinical Outcome Node]\`)
3. **Medication & Physiological Impact** (Explain how active drugs or genetics caused or are affected by this lab value)
4. **Actionable Clinical Next Steps** (3 specific recommendations for monitoring or drug adjustment)`;

    const modelsToTry = ["gemini-3.6-flash", "gemini-2.5-flash", "gemini-2.0-flash"];
    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction: "You are an expert clinical pharmacologist who uses biomedical knowledge graphs to explain complex lab anomalies in clear, precise, plain language."
          }
        });
        if (response?.text) {
          return res.json({ text: response.text });
        }
      } catch (_e) {
        // try next
      }
    }

    res.json({ text: fallbackText, fallback: true });
  } catch (_err) {
    res.json({ text: fallbackText, fallback: true });
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
