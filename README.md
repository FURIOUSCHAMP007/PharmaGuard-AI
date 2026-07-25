# PharmaGuard AI: Autonomous Clinical Safety Intelligence System

**PharmaGuard AI** is an advanced, enterprise-grade autonomous clinical safety intelligence application designed to predict, explain, and mitigate complex adverse drug events (ADEs), drug-drug interactions (DDIs), and proarrhythmic hazards in polypharmacy regimens.

Powered by **Causal AI Structural Causal Models (SCM)**, **Graph Neural Networks (GNNs)**, **Digital Patient Twin simulation**, **Knowledge Graph RAG**, and **Gemini Multi-Agent Reasoning**, PharmaGuard AI provides real-time actionable decision support for clinicians, pharmacists, and medical researchers.

---

## 🌟 Core Technical Capabilities

### 1. 🛡️ Clinical Safety Intelligence
* **Autonomous DDI & Toxicity Engine:** Detects competitive enzyme inhibition cascades (e.g., CYP2C9 competitive inhibition of S-Warfarin clearance by Amiodarone and Fluoxetine), pharmacogenomic phenoconversion, and severe proarrhythmic QTc extension hazards.
* **Causal AI Counterfactual Analysis (Do-Calculus):** Uses Structural Causal Models (SCMs) based on Judea Pearl's do-calculus to model counterfactual clinical scenarios (e.g., *"What happens to Eleanor Vance's QTc interval and bleeding risk if we substitute Fluoxetine with Escitalopram?"*).
* **Multi-Agent Consensus Network:** Deploys specialized LLM agents (Clinical Pharmacologist, Genomics Specialist, Cardiology Safety Agent, Regulatory Compliance Agent) that collaboratively evaluate complex drug interactions and synthesize consensus recommendations.
* **SHAP & LIME XAI Attribution:** Provides transparent, interpretable explainability scores for clinical predictions, showing exact feature attributions for risk score elevations.

### 2. 🕸️ Biomedical Knowledge Graph RAG
* **Multi-Order Interaction Graph:** Integrates multi-modal biomedical knowledge bases (DrugBank, FDA FAERS, CPIC Guidelines, ChEBI, PubChem) into a high-density knowledge graph.
* **Graph Neural Network (GNN) Visualizer:** Interactive 2D/3D force-directed graph explorer displaying drug nodes, target enzyme edges, metabolic pathways, and attentional edge weights.
* **Retrieval-Augmented Generation (RAG):** Contextually retrieves evidence-based medical literature, clinical trial findings, and CPIC dosing guidelines to ground all AI recommendations in validated medical science.

### 3. ⏳ Temporal Risk & PK/PD Simulation
* **Pharmacokinetic / Pharmacodynamic (PK/PD) Trajectories:** Simulates dynamic 24-to-72-hour plasma concentration curves ($C_{\max}$, $T_{\max}$, $t_{1/2}$ elimination half-life) for co-administered drugs.
* **Longitudinal Vitals & Risk Heatmap Grid:** Renders a 30-day temporal heatmap matrix tracking daily proarrhythmic risk scores mapped against patient vitals (QTc interval, eGFR clearance, serum $K^+$, $Mg^{2+}$, blood pressure, and medication regimen changes).
* **Predictive Pre-Symptomatic Safety Alerts:** Anticipates upcoming toxicity spikes and QTc prolongation risks hours before clinical manifestation, prompting timely dosage adjustments.

---

## 🖥️ Dashboard Usage Guide & Workflow

### 1. Patient Selection & Digital Twin Inspection
1. **Select Patient:** Use the patient dropdown selector in the top navbar or voice commands (*"Select Eleanor Vance"*) to switch between active patient twins.
2. **Review Vitals & Genotype:** Navigate to **Digital Patient Twin** (`/digital_twin`) to inspect real-time multi-organ biomarkers (e.g., eGFR $38\text{ mL/min}$, QTc $468\text{ ms}$, *CYP2D6 Poor Metabolizer* genotype).
3. **Hover over Patient Avatar:** Hover or click on the patient avatar in the header navbar to view quick EHR summaries, active risk badges, and contact details.

### 2. Multi-Select Batch Patient Management
1. **Navigate to Registry:** Go to **Patient Registry** (`/patient_management`).
2. **Select Multiple Patients:** Click the multi-select checkboxes next to patient records. A sticky **Bulk Action Toolbar** will appear at the top.
3. **Batch Export Data:** Click **Export Selected (CSV/JSON)** to download consolidated patient records and risk profiles.
4. **Cohort Comparative Risk Analysis:** Click **Batch Risk Assessment** to open a comparative modal featuring side-by-side Recharts bar charts (Risk Score % vs. eGFR) and cross-patient feature comparison matrices.

### 3. Prescription Testing & Interaction Checking
1. **Go to Drug Prescription View:** Select **Order Entry & Rx Check** (`/drug_prescribe`).
2. **Add Candidate Drug:** Select a new medication (e.g., *Sertraline*, *Clarithromycin*, *Warfarin*) and specify dosage/frequency.
3. **Run Safety Audit:** Click **Evaluate Regimen Safety** to execute real-time multi-drug interaction checking, GNN subgraph analysis, and QTc risk projection.

### 4. Counterfactual What-If Simulation
1. **Access Counterfactual Engine:** Open **Causal Counterfactual SCM** (`/causal_counterfactual`).
2. **Configure Intervention:** Choose a target drug to discontinue, adjust dosage, or substitute.
3. **Simulate Scenario:** Click **Execute Counterfactual Intervention** to view predicted changes in QTc interval (ms), bleeding risk (INR shift), and eGFR impact.

### 5. AI Co-Pilot & Report Export
1. **Gemini Chat Assistant:** Open **Gemini AI Assistant** (`/gemini_chat`) to query clinical guidelines, ask about drug metabolic pathways, or request evidence summaries.
2. **Print/Export Reports:** Navigate to **Clinical Reports & PDF Export** (`/reports_pdf`) or click **Print Analysis**. The application features built-in `@media print` CSS rules that generate clean hardcopy clinical summaries without UI sidebar chrome.

---

## 🚀 Technology Stack

| Domain | Technologies Used |
| :--- | :--- |
| **Frontend Framework** | React 19, TypeScript, Vite 6 |
| **UI & Styling** | Tailwind CSS v4, Lucide React Icons, Motion Animation |
| **Markdown & Formatting** | `react-markdown`, `remark-gfm` |
| **Data Visualization** | Recharts, Custom Canvas & SVG Graph Neural Renderers |
| **AI & Generative LLM** | Google GenAI SDK (`@google/genai`), Gemini 2.5 Flash / Pro |
| **Voice Interface** | Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`) |
| **Backend & Dev Server** | Express.js, `tsx`, `esbuild` CommonJS bundle compilation |

---

## 📂 Project Directory Map

```
├── .env.example                  # Environment variable template (GEMINI_API_KEY)
├── metadata.json                 # AI Studio Application metadata & permissions
├── package.json                  # Dependencies, build & run scripts
├── server.ts                     # Express server & Vite development middleware
├── index.html                    # Single-Page Application entry point
├── src/
│   ├── main.tsx                  # React entry bootstrap
│   ├── App.tsx                   # Main layout container & view routing
│   ├── index.css                 # Tailwind CSS imports, custom animations & @media print styles
│   ├── types/
│   │   └── pharmaguard.ts        # Global TypeScript interfaces, enums, & models
│   ├── data/
│   │   └── mockClinicalData.ts   # Comprehensive clinical patient twins & drug data
│   ├── components/
│   │   ├── HeaderNavbar.tsx             # Header bar with voice search, roles, patient selector
│   │   ├── PatientAvatar.tsx            # Personalization avatar component with risk popover
│   │   ├── Sidebar.tsx                  # Primary application view navigation
│   │   ├── FormattedClinicalAnalysis.tsx# Markdown renderer for clinical notes & analyses
│   │   ├── ClinicalRiskHeatmapGrid.tsx  # 30-Day longitudinal risk & vitals grid
│   │   ├── RiskScoreSparkline.tsx       # 30-day history + 30-day forecast sparkline
│   │   ├── GNNGraphVisualizer.tsx       # GNN polypharmacy graph explorer
│   │   ├── PredictiveSafetyAlert.tsx    # Temporal prediction alert banner
│   │   └── views/                       # Application Views
│   │       ├── DashboardView.tsx               # Main Clinical Safety Dashboard
│   │       ├── DigitalPatientTwinView.tsx      # Dynamic Digital Patient Twin Inspect
│   │       ├── PatientManagementView.tsx       # Patient Registry, Cohort Selection & Batch Tools
│   │       ├── DrugPrescriptionView.tsx        # Drug Interaction Check & Order Entry
│   │       ├── DrugInteractionMatrixView.tsx   # Interactive Polypharmacy Matrix
│   │       ├── CausalCounterfactualView.tsx    # SCM Do-Calculus Counterfactual Engine
│   │       ├── TemporalRiskSimulationView.tsx  # PK/PD Time-Course Trajectory Simulator
│   │       ├── KnowledgeGraphExplorerView.tsx  # Biomedical Knowledge Graph RAG
│   │       ├── MultiAgentConsoleView.tsx       # Collaborative Multi-Agent Consensus
│   │       ├── GeminiChatAssistantView.tsx     # Gemini AI Clinical Chat Assistant
│   │       ├── AlternativeDrugRecommendationView.tsx # Safe Drug Substitution Engine
│   │       ├── ClinicalGuidelinesViewerView.tsx# ACC/AHA & CPIC Guideline Viewer
│   │       ├── XAIDashboardView.tsx            # SHAP/LIME Feature Attribution
│   │       ├── UncertaintyAnalyticsView.tsx    # Epistemic Confidence Calibration
│   │       ├── PharmacovigilanceFDAView.tsx    # FDA FAERS Signal & Real-World Data
│   │       └── ReportsPdfExportView.tsx        # Clinical Decision Support PDF Exporter
```

---

## ⚙️ Installation & Setup Instructions

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher
* **Gemini API Key** *(Optional for live LLM responses)*: Set `GEMINI_API_KEY` in `.env`.

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and configure your API key:
```bash
cp .env.example .env
```
Inside `.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Run Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your web browser.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 👥 User Roles & Access Control

PharmaGuard AI adapts UI features and clinical recommendations based on user roles:
* **Cardiologist / Attending Physician:** Full prescribing access, SCM counterfactual simulations, and final decision sign-off.
* **Clinical Pharmacist:** Interaction matrix evaluation, alternative drug candidate scoring, and CPIC dose adjustments.
* **Nurse Practitioner:** Real-time vitals monitoring, QTc interval alerts, and bed-side safety checks.
* **Medical Researcher:** GNN attentional weights, SHAP feature attributions, and academic benchmark validation.

---

## 📜 Compliance & Clinical Disclaimer

* **Clinical Decision Support:** PharmaGuard AI is designed as an intelligent clinical decision support system for medical professionals and clinical researchers.
* **Guideline Compliance:** Algorithmic recommendations adhere to **CPIC** (Clinical Pharmacogenetics Implementation Consortium) and **ACC/AHA** (American College of Cardiology / American Heart Association) guidelines.
