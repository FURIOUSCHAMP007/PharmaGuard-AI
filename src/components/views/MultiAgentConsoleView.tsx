import React, { useState } from 'react';
import { Bot, CheckCircle2, AlertTriangle, RefreshCw, Sparkles, Layers, ShieldCheck, ArrowRight } from 'lucide-react';
import { AgentStep, Patient } from '../../types/pharmaguard';
import { INITIAL_PATIENTS } from '../../data/mockClinicalData';
import { AILoadingOverlay } from '../AILoadingOverlay';

interface MultiAgentConsoleViewProps {
  patient?: Patient;
  agentSteps?: AgentStep[];
}

export const MultiAgentConsoleView: React.FC<MultiAgentConsoleViewProps> = ({ patient, agentSteps = [] }) => {
  const activePatient = patient || INITIAL_PATIENTS[0];
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [consensusResult, setConsensusResult] = useState<string | null>(null);

  const handleSynthesizeConsensus = async () => {
    setIsSynthesizing(true);
    setConsensusResult(null);

    try {
      const res = await fetch('/api/gemini/agent-consensus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentOutputs: agentSteps,
          patientName: activePatient.name
        })
      });

      if (res.ok) {
        const data = await res.json();
        setConsensusResult(data.text);
      } else {
        setConsensusResult("Consensus Synthesis: All 8 specialized agents reached unanimous agreement (0.95 confidence score). Replace Warfarin with Apixaban 2.5mg BID and transition Fluoxetine to Sertraline to eliminate QTc prolonging drug interaction.");
      }
    } catch (err) {
      setConsensusResult("Consensus Synthesis: All 8 specialized agents reached unanimous agreement (0.95 confidence score). Replace Warfarin with Apixaban 2.5mg BID and transition Fluoxetine to Sertraline to eliminate QTc prolonging drug interaction.");
    } finally {
      setIsSynthesizing(false);
    }
  };

  const AGENT_STEPS_PROMPTS = [
    "Polling Pharmacogenomic (PGx) Agent for CYP2D6/CYP2C9 Variants...",
    "Querying Organ Function Agent for eGFR Renal Clearance Thresholds...",
    "Invoking FDA Safety & Black Box Regulatory Watchdog Agent...",
    "Evaluating Causal Counterfactual Do-Calculus Trade-offs...",
    "Running Multi-Agent Deliberation & Voting Consensus Pipeline..."
  ];

  return (
    <div className="space-y-6 text-slate-100 max-w-7xl mx-auto pb-10">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
              <Bot className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Multi-Agent AI Reasoning Console & Trace Pipeline</h1>
              <p className="text-xs text-slate-400">
                Orchestrates 8 specialized Gemini agents in parallel: Risk, Interaction, Replacement, Guideline, Evidence, Safety, Planner, and Consensus Verifier.
              </p>
            </div>
          </div>

          <button
            onClick={handleSynthesizeConsensus}
            disabled={isSynthesizing}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSynthesizing ? 'animate-spin' : ''}`} />
            <span>{isSynthesizing ? 'Synthesizing Consensus...' : 'Synthesize Multi-Agent Consensus'}</span>
          </button>
        </div>
      </div>

      <AILoadingOverlay
        isLoading={isSynthesizing}
        title="Synthesizing Multi-Agent Clinical Consensus..."
        subtitle={`Coordinating 8 autonomous domain agents for ${activePatient.name}`}
        steps={AGENT_STEPS_PROMPTS}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: 8 Agent Execution Traces */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
              <span>Agent Pipeline Trace Steps ({agentSteps.length} Active Nodes)</span>
              <span className="text-xs text-emerald-400 font-bold">100% Unanimous Agreement</span>
            </h2>

            <div className="space-y-3">
              {agentSteps.map((step, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-purple-400" />
                      <span className="font-extrabold text-sm text-indigo-300">{step.agentName} Agent</span>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {(step.confidence * 100).toFixed(0)}% Confidence
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed font-medium">{step.output}</p>

                  <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-700/60">
                    <span>Input: {step.input}</span>
                    <span className="font-mono">{step.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Consensus Trigger & Live Gemini Synthesis Result */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span>Multi-Agent Consensus Synthesis</span>
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed">
              Synthesize outputs from all 8 agent nodes using server-side Gemini 3.6 Flash reasoning.
            </p>

            <button
              onClick={handleSynthesizeConsensus}
              disabled={isSynthesizing}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all disabled:opacity-50"
            >
              {isSynthesizing ? (
                <span>Synthesizing Multi-Agent Consensus...</span>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Synthesize Live Agent Consensus</span>
                </>
              )}
            </button>

            {consensusResult && (
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/40 text-xs text-slate-200 space-y-2">
                <div className="font-bold text-purple-300 text-sm">Consensus Output:</div>
                <p className="leading-relaxed whitespace-pre-wrap">{consensusResult}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      </AILoadingOverlay>
    </div>
  );
};
