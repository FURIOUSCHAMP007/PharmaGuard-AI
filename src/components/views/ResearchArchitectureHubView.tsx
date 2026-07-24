import React, { useState } from 'react';
import { BookMarked, Layers, GitBranch, Share2, ShieldAlert, CheckCircle2, Code, Cpu } from 'lucide-react';

export const ResearchArchitectureHubView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'sequence' | 'class' | 'ieee_critique'>('architecture');

  return (
    <div className="space-y-6 text-slate-100 max-w-7xl mx-auto pb-10">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
            <BookMarked className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">IEEE / Nature Digital Medicine Research Publication Hub</h1>
            <p className="text-xs text-slate-400">
              Complete publication-grade architecture specification, formal Mermaid diagrams, sequence flows, and IEEE peer-reviewer critique & autonomous redesign.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'architecture' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            System Architecture & Mermaid
          </button>
          <button
            onClick={() => setActiveTab('sequence')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'sequence' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Sequence Diagram
          </button>
          <button
            onClick={() => setActiveTab('class')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'class' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Class & Data Flow
          </button>
          <button
            onClick={() => setActiveTab('ieee_critique')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'ieee_critique' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            IEEE Reviewer Critique & Redesign
          </button>
        </div>
      </div>

      {/* Tab 1: System Architecture & Mermaid Diagram */}
      {activeTab === 'architecture' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3">
            End-to-End System Layer Architecture (Mermaid Formal Specification)
          </h2>

          <div className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-cyan-300 overflow-x-auto space-y-1 border border-slate-800">
            <div>graph TD</div>
            <div className="pl-4">%% Data & Ingestion Layer</div>
            <div className="pl-4">A[FHIR R4 EHR Data] --&gt; B[UMLS / RxNorm / SNOMED Grounding]</div>
            <div className="pl-4">B --&gt; C[(Neo4j Biomedical Knowledge Graph)]</div>
            <div className="pl-4">%% Graph AI Layer</div>
            <div className="pl-4">C --&gt; D[GNN / GraphSAGE / Relational GCN Embeddings]</div>
            <div className="pl-4">D --&gt; E[Knowledge Graph RAG Pipeline]</div>
            <div className="pl-4">%% Causal & Temporal Layer</div>
            <div className="pl-4">E --&gt; F[DoWhy Structural Causal Models - SCM]</div>
            <div className="pl-4">F --&gt; G[72h PK/PD Temporal Concentration Engine]</div>
            <div className="pl-4">G --&gt; H[Digital Patient Twin Simulator]</div>
            <div className="pl-4">%% Multi-Agent Reasoning Layer</div>
            <div className="pl-4">H --&gt; I[8 Parallel Gemini Specialized Agents]</div>
            <div className="pl-4">I --&gt; J[Consensus Verifier & Bayesian Uncertainty Calibrator]</div>
            <div className="pl-4">%% Clinical Action Layer</div>
            <div className="pl-4">J --&gt; K[Human-in-the-Loop Doctor Review & RLHF Feedback]</div>
          </div>

          <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
            <h3 className="font-bold text-white text-sm">Key Research Contributions:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Mechanistic vs Correlation:</strong> Replaces black-box association models with causal Do-calculus `P(Y | do(X))` isolating true drug-drug conflicts from confounders.</li>
              <li><strong>Organ-Aware Digital Twin:</strong> Dynamically couples patient renal eGFR and hepatic CYP2D6/CYP2C19 genotypes with PK/PD differential equation solvers.</li>
              <li><strong>Multi-Agent Verification:</strong> 8-agent distributed consensus pipeline ensuring recommendations satisfy guidelines before clinical review.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Tab 2: Sequence Diagram */}
      {activeTab === 'sequence' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3">
            Sequence Diagram: Multi-Agent Clinical Evaluation Flow
          </h2>

          <div className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-indigo-300 overflow-x-auto space-y-1 border border-slate-800">
            <div>sequenceDiagram</div>
            <div className="pl-4">autonumber</div>
            <div className="pl-4">actor Doctor</div>
            <div className="pl-4">participant UI as React Frontend</div>
            <div className="pl-4">participant Server as Express Server</div>
            <div className="pl-4">participant KG as Neo4j Knowledge Graph</div>
            <div className="pl-4">participant Gemini as Gemini 3.6 Flash Agent</div>
            <div className="pl-4">Doctor-&gt;&gt;UI: Select Regimen (Amiodarone + Warfarin)</div>
            <div className="pl-4">UI-&gt;&gt;Server: POST /api/gemini/reasoning</div>
            <div className="pl-4">Server-&gt;&gt;KG: Query 3-hop CYP2C9 subpath</div>
            <div className="pl-4">KG--&gt;&gt;Server: Return target & enzyme edges</div>
            <div className="pl-4">Server-&gt;&gt;Gemini: Run 8-agent reasoning pipeline</div>
            <div className="pl-4">Gemini--&gt;&gt;Server: Return consensus & counterfactuals</div>
            <div className="pl-4">Server--&gt;&gt;UI: Render XAI SHAP & PK/PD curves</div>
            <div className="pl-4">Doctor-&gt;&gt;UI: Sign & Approve Recommendation</div>
          </div>
        </div>
      )}

      {/* Tab 3: Class & Data Flow */}
      {activeTab === 'class' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3">
            Data Entity Class Diagram
          </h2>

          <div className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-emerald-300 overflow-x-auto space-y-1 border border-slate-800">
            <div>classDiagram</div>
            <div className="pl-4">class Patient {"{"}</div>
            <div className="pl-8">+string id</div>
            <div className="pl-8">+string mrn</div>
            <div className="pl-8">+KidneyFunction kidneyFunction</div>
            <div className="pl-8">+Genetics genetics</div>
            <div className="pl-8">+PrescribedDrug[] activeMedications</div>
            <div className="pl-4">{"}"}</div>
            <div className="pl-4">class PrescribedDrug {"{"}</div>
            <div className="pl-8">+string rxNormCode</div>
            <div className="pl-8">+string name</div>
            <div className="pl-8">+string[] cypMetabolism</div>
            <div className="pl-4">{"}"}</div>
            <div className="pl-4">Patient "1" *-- "many" PrescribedDrug</div>
          </div>
        </div>
      )}

      {/* Tab 4: IEEE Peer Reviewer Critique & Autonomous Redesign */}
      {activeTab === 'ieee_critique' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/40 text-xs space-y-2">
            <h3 className="font-extrabold text-rose-300 text-sm">IEEE Peer Reviewer Critique:</h3>
            <p className="text-slate-200 leading-relaxed">
              "The initial architecture relies heavily on LLM text generation for predictions, introducing risks of hallucination in drug interaction detection. Additionally, static graph embeddings fail to account for dynamic organ function deterioration."
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-xs space-y-2">
            <h3 className="font-extrabold text-emerald-300 text-sm">Autonomous System Redesign & Hardening:</h3>
            <ul className="list-disc pl-5 space-y-1 text-slate-200">
              <li><strong>Decoupled Prediction vs Reasoning:</strong> Predictions are computed strictly by deterministic GNNs & DoWhy SCM engines; Gemini is strictly limited to reasoning synthesis and explanation generation.</li>
              <li><strong>Dynamic Temporal Graphs:</strong> Integrated Temporal Graph Networks (TGN) that continuously recalculate node embeddings as eGFR or liver enzymes change.</li>
              <li><strong>Bayesian Uncertainty Calibration:</strong> Monte Carlo Dropout enforces a hard fallback flag when epistemic uncertainty exceeds 0.05.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
