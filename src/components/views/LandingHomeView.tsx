import React from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Share2, 
  GitBranch, 
  Bot, 
  ArrowRight, 
  Sparkles, 
  Cpu, 
  CheckCircle2, 
  FileText, 
  Layers
} from 'lucide-react';
import { ViewId } from '../Sidebar';
import { Patient } from '../../types/pharmaguard';
import { INITIAL_PATIENTS } from '../../data/mockClinicalData';

interface LandingHomeViewProps {
  onNavigate: (view: ViewId) => void;
  selectedPatient?: Patient;
}

export const LandingHomeView: React.FC<LandingHomeViewProps> = ({ onNavigate, selectedPatient }) => {
  const activePatient = selectedPatient || INITIAL_PATIENTS[0];
  return (
    <div className="space-y-6 text-slate-100 max-w-7xl mx-auto pb-10">
      {/* Hero Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 border border-slate-800 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 px-3 py-1 rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Autonomous Clinical Safety Intelligence System</span>
          </div>
          
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Prevent Adverse Drug Events with <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">Causal AI & Digital Patient Twins</span>
          </h1>

          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            PharmaGuard AI moves beyond traditional static lookup tables to provide mechanistic, causal, and temporal reasoning for multi-drug regimens. Powered by Biomedical Knowledge Graph RAG, GNNs, DoWhy Causal Inference, and 8 Specialized Gemini Agents.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('dashboard')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs md:text-sm font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-900/30 transition-all cursor-pointer"
            >
              <span>Launch Clinical Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('research_hub')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs md:text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>IEEE Publication Architecture</span>
            </button>
          </div>
        </div>
      </div>

      {/* Core Architectural Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => onNavigate('digital_twin')}
          className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 p-5 rounded-xl space-y-2 cursor-pointer transition-all hover:bg-slate-800/60 group"
        >
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
            <Activity className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">Digital Patient Twin</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Simulates patient-specific renal eGFR, CYP450 genetics, liver enzymes, and physiological PK/PD clearance curves over time.
          </p>
        </div>

        <div 
          onClick={() => onNavigate('kg_explorer')}
          className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 p-5 rounded-xl space-y-2 cursor-pointer transition-all hover:bg-slate-800/60 group"
        >
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
            <Share2 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors">Knowledge Graph RAG</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Multi-hop graph neural networks linking drugs, genes, proteins, pathways, and side effects across SNOMED CT & RxNorm.
          </p>
        </div>

        <div 
          onClick={() => onNavigate('causal_counterfactual')}
          className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 p-5 rounded-xl space-y-2 cursor-pointer transition-all hover:bg-slate-800/60 group"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
            <GitBranch className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">Causal Counterfactuals</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Structural Causal Models (DoWhy) estimating "What if Warfarin is replaced with Apixaban?" with Individual Treatment Effects.
          </p>
        </div>

        <div 
          onClick={() => onNavigate('multi_agent')}
          className="bg-slate-900 border border-slate-800 hover:border-purple-500/50 p-5 rounded-xl space-y-2 cursor-pointer transition-all hover:bg-slate-800/60 group"
        >
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
            <Bot className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-white group-hover:text-purple-300 transition-colors">Multi-Agent AI Engine</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            8 autonomous specialized agents (Risk, Interaction, Replacement, Guidelines, Evidence, Safety) verifying consensus.
          </p>
        </div>
      </div>

      {/* Active Patient Highlights & Quick Demo Workflows */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <span>Active Case Trial: {activePatient.name} ({activePatient.mrn})</span>
            </h2>
            <p className="text-slate-400 text-xs">
              Primary Diagnosis: {activePatient.primaryDiagnosis} | eGFR: {activePatient.kidneyFunction.egfr} | Risk Score: {activePatient.riskScorePercent}%
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-rose-500/10 text-rose-300 border border-rose-500/30">
            {activePatient.riskCategory} Risk Case
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <button 
            onClick={() => onNavigate('interaction_matrix')}
            className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/70 hover:border-cyan-500 text-left transition-all group cursor-pointer"
          >
            <div className="text-xs text-slate-400 font-semibold mb-1">Step 1: Interaction Matrix</div>
            <div className="text-sm font-bold text-white group-hover:text-cyan-300 flex items-center justify-between">
              <span>Inspect Multi-Drug Conflicts</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Review Amiodarone + Warfarin CYP2C9 competitive inhibition and QTc stacking.
            </p>
          </button>

          <button 
            onClick={() => onNavigate('causal_counterfactual')}
            className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/70 hover:border-emerald-500 text-left transition-all group cursor-pointer"
          >
            <div className="text-xs text-slate-400 font-semibold mb-1">Step 2: Causal Counterfactual</div>
            <div className="text-sm font-bold text-white group-hover:text-emerald-300 flex items-center justify-between">
              <span>Simulate Drug Replacement</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Apply Do-calculus `do(Warfarin → Apixaban)` to predict 68.4% bleeding risk reduction.
            </p>
          </button>

          <button 
            onClick={() => onNavigate('reports_export')}
            className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/70 hover:border-indigo-500 text-left transition-all group cursor-pointer"
          >
            <div className="text-xs text-slate-400 font-semibold mb-1">Step 3: Clinical Safety Report</div>
            <div className="text-sm font-bold text-white group-hover:text-indigo-300 flex items-center justify-between">
              <span>Generate Signed PDF Report</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Compile full evidence summary, physician notes, and patient-friendly instructions.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};
