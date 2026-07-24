# PharmaGuard AI: Autonomous Clinical Safety Intelligence System

**PharmaGuard AI** is an advanced, enterprise-grade autonomous clinical safety intelligence application designed to predict, explain, and mitigate complex adverse drug events (ADEs), drug-drug interactions (DDIs), and proarrhythmic hazards in polypharmacy regimens.

Powered by **Causal AI Structural Causal Models (SCM)**, **Graph Neural Networks (GNNs)**, **Digital Patient Twin simulation**, and **Gemini 2.5 Multi-Agent Reasoning**, PharmaGuard AI provides real-time actionable decision support for clinicians, pharmacists, and medical researchers.

---

## 🌟 Key Architectural Pillars

### 1. 🧬 Digital Patient Twin Engine
* **Dynamic Multi-Organ State:** Tracks real-time hepatic (CYP450 enzymes like CYP2D6, CYP3A4, CYP2C9), renal (eGFR, clearance), and cardiac (QTc interval, electrolyte serum levels like $K^+$ and $Mg^{2+}$) biomarkers.
* **Genomic Profile Integration:** Incorporates pharmacogenomic metabolizer phenotypes (e.g., *CYP2D6 Poor Metabolizer*, *CYP3A4 Ultra-Rapid Metabolizer*) to calibrate individual drug clearance rates and toxicity thresholds.
* **Personalized Patient Avatars:** Features custom clinical profile avatars with live risk-glow halos, real-time status indicators, and interactive EHR summary popovers in the header.

### 2. 🔀 Causal AI & Counterfactual SCM Analysis
* **Do-Calculus Interventions:** Simulates counterfactual clinical scenarios using Judea Pearl's Causal Structural Causal Models (SCMs) (e.g., *"What happens to cardiac QTc risk if we discontinue Amiodarone or substitute Fluoxetine with Sertraline?"*).
* **Confounder Adjustment:** Distinguishes genuine drug-drug interactions from confounding clinical background variables like renal insufficiency or electrolyte imbalances.

### 3. 🕸️ Graph Neural Network (GNN) Polypharmacy Explorer
* **Synergistic Hazard Detection:** Maps complex multi-drug interaction networks as subgraphs, extracting multi-order attentional weights across drug nodes, enzyme target edges, and clinical pathway endpoints.
* **Interactive Node Analysis:** Allows clinicians to inspect individual drug nodes, binding affinities, enzyme competitive inhibition pathways, and structural chemical properties.

### 4. 📊 30-Day Clinical Risk & Vitals Heatmap Grid
* **Dense Longitudinal Matrix:** Renders a 30-day temporal heatmap tracking daily proarrhythmic risk scores mapped against daily patient vitals (QTc interval, eGFR clearance, serum $K^+$, blood pressure, and active prescription load).
* **Intervention Marker Annotations:** Flags specific dosage adjustments, drug additions, and clinical interventions with interactive date-specific drawer panels.

### 5. ⏳ Temporal Risk & PK/PD Simulator
* **Pharmacokinetic / Pharmacodynamic Modeling:** Simulates time-course plasma drug concentration curves ($C_{\max}$, $T_{\max}$, steady-state clearance, half-life $t_{1/2}$) and predicts QTc prolongation trajectories over 24–72 hour windows.
* **Predictive Safety Alerts:** Anticipates upcoming high-probability adverse drug events before clinical manifestation.

### 6. 🤖 Multi-Agent AI System & Gemini Assistant
* **Collaborative Reasoning Agents:** Features specialized AI agents (Clinical Pharmacologist Agent, Genomics Specialist Agent, Cardiology Safety Agent, and Regulatory Agent) that debate and synthesize evidence-backed consensus recommendations.
* **Voice-to-Text Clinical Commands:** Includes Web Speech API integration in the header navbar, allowing clinicians to navigate views or search for specific patients using voice commands (e.g., *"Go to Digital Twin"*, *"Select Eleanor Vance"*).

### 7. ⚖️ Explainable AI (xAI) & Uncertainty Analytics
* **SHAP & LIME Feature Attribution:** Visualizes the exact feature contributions driving risk scores (e.g., $+28\%$ CYP2D6 inhibition, $+18\%$ Hypokalemia, $+22\%$ Reduced eGFR).
* **Expected Calibration Error (ECE):** Displays model confidence intervals, epistemic vs. aleatoric uncertainty bounds, and reliability diagrams.

---

## 🚀 Technology Stack

| Domain | Technologies Used |
| :--- | :--- |
| **Frontend Framework** | React 19, TypeScript, Vite 6 |
| **UI & Styling** | Tailwind CSS v4, Lucide React Icons, Motion Animation |
| **Data Visualization** | Recharts, Custom Canvas / SVG Graph Neural Renderers |
| **AI & Generative LLM** | Google GenAI SDK (`@google/genai`), Gemini 2.5 Flash / Pro |
| **Voice Interface** | Web Speech API (SpeechRecognition / webkitSpeechRecognition) |
| **Backend & Dev Server** | Express.js, `tsx`, `esbuild` CommonJS bundle compilation |

---

## 📂 Project Structure

```
├── .env.example                  # Environment variable template (GEMINI_API_KEY)
├── metadata.json                 # AI Studio Application metadata & permissions
├── package.json                  # Dependencies, build & run scripts
├── server.ts                     # Express server & Vite development middleware
├── index.html                    # Single-Page Application entry point
├── src/
│   ├── main.tsx                  # React entry bootstrap
│   ├── App.tsx                   # Main layout container & view routing
│   ├── index.css                 # Tailwind CSS imports & global design tokens
│   ├── types/
│   │   └── pharmaguard.ts        # Global TypeScript interfaces, enums, & models
│   ├── data/
│   │   └── mockClinicalData.ts   # Comprehensive clinical patient twins & drug data
│   ├── components/
│   │   ├── HeaderNavbar.tsx      # Header bar with voice search, roles, patient selector
│   │   ├── PatientAvatar.tsx     # Personalization avatar component with risk popover
│   │   ├── Sidebar.tsx           # Primary application view navigation
│   │   ├── ClinicalRiskHeatmapGrid.tsx  # 30-Day longitudinal risk & vitals grid
│   │   ├── RiskScoreSparkline.tsx       # 30-day history + 30-day forecast sparkline
│   │   ├── GNNGraphVisualizer.tsx       # GNN polypharmacy graph explorer
│   │   ├── PredictiveSafetyAlert.tsx    # Temporal prediction alert banner
│   │   ├── CriticalAlertsBanner.tsx     # Active high-priority safety warnings
│   │   └── views/                # Individual Application Screen Modules
│   │       ├── DashboardView.tsx               # Main Clinical Safety Dashboard
│   │       ├── DigitalTwinView.tsx             # Dynamic Digital Patient Twin Inspect
│   │       ├── PatientListView.tsx             # Patient Registry & Management
│   │       ├── DrugPrescribeView.tsx           # Drug Interaction Check & Order Entry
│   │       ├── InteractionMatrixView.tsx       # Interactive Polypharmacy Matrix
│   │       ├── CausalCounterfactualView.tsx    # SCM Do-Calculus Counterfactual Engine
│   │       ├── TemporalSimulationView.tsx      # PK/PD Time-Course Trajectory Simulator
│   │       ├── KnowledgeGraphView.tsx          # Biomedical Knowledge Graph RAG
│   │       ├── MultiAgentView.tsx              # Collaborative Multi-Agent Consensus
│   │       ├── AIChatAssistantView.tsx         # Gemini AI Clinical Chat Assistant
│   │       ├── AltDrugEngineView.tsx           # Safe Drug Substitution Engine
│   │       ├── ClinicalGuidelinesView.tsx      # ACC/AHA & CPIC Guideline Viewer
│   │       ├── ExplainableAIView.tsx           # SHAP/LIME Feature Attribution
│   │       ├── UncertaintyAnalyticsView.tsx    # Epistemic Confidence Calibration
│   │       ├── PharmacovigilanceView.tsx       # FDA FAERS Signal & Real-World Data
│   │       ├── ReportsPDFExportView.tsx        # Clinical Decision Support PDF Exporter
│   │       ├── DoctorReviewView.tsx            # Human-in-the-Loop Sign-off Console
│   │       ├── IEEEResearchHubView.tsx         # Academic Architecture & Benchmarks
│   │       └── AdminMonitoringView.tsx         # System Logs & Agent Telemetry
```

---

## ⚙️ Installation & Running Locally

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher
* **Gemini API Key** *(Optional for live LLM responses)*: Set `GEMINI_API_KEY` in `.env`.

### 1. Clone the repository & install dependencies
```bash
npm install
```

### 2. Configure environment variables
Copy `.env.example` to `.env` and add your Gemini API key:
```bash
cp .env.example .env
```
Inside `.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Start the Development Server
```bash
npm run dev
```
The server will start on `http://localhost:3000`.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 👥 User Roles & Permissions

PharmaGuard AI adapts its interface and recommendations according to the active user role:
* **Cardiologist / Physician:** Complete prescribing authority, counterfactual simulation controls, and final Human-in-the-Loop (HITL) approval.
* **Pharmacist:** Focused drug-drug interaction matrix, dose adjustment calculators, and alternative substitute ranking.
* **Nurse Practitioner:** Real-time vitals monitoring, QTc interval alerts, and bed-side safety notifications.
* **Clinical Researcher:** IEEE benchmark evaluation, GNN attentional node weights, and pharmacokinetic parameter analysis.

---

## 📜 License & Acknowledgments

* Designed for research and clinical decision support evaluation.
* Complies with CPIC (Clinical Pharmacogenetics Implementation Consortium) and ACC/AHA guidelines.
