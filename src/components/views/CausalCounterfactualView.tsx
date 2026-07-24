import React, { useState } from 'react';
import { GitBranch, Play, CheckCircle2, AlertTriangle, ArrowRight, Sparkles, Activity } from 'lucide-react';
import { Patient, CausalIntervention } from '../../types/pharmaguard';
import { INITIAL_PATIENTS } from '../../data/mockClinicalData';
import { AILoadingOverlay } from '../AILoadingOverlay';

interface CausalCounterfactualViewProps {
  patient?: Patient;
  interventions?: CausalIntervention[];
  onApplyIntervention?: (intervention: CausalIntervention) => void;
}

export const CausalCounterfactualView: React.FC<CausalCounterfactualViewProps> = ({
  patient,
  interventions = [],
  onApplyIntervention
}) => {
  const activePatient = patient || INITIAL_PATIENTS[0];
  const [selectedIntervention, setSelectedIntervention] = useState<CausalIntervention | undefined>(interventions[0]);
  const activeIntervention = selectedIntervention || interventions[0];
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationComplete, setSimulationComplete] = useState(false);

  const handleRunDoCalculus = () => {
    setIsSimulating(true);
    setSimulationComplete(false);
    setTimeout(() => {
      setIsSimulating(false);
      setSimulationComplete(true);
    }, 2200);
  };

  const CAUSAL_STEPS = [
    "Building Structural Causal Model (SCM) Directed Acyclic Graph...",
    "Conditioning on Backdoor Adjustment Confounders {eGFR, CYP2D6, Age}...",
    "Evaluating Pearl's Do-Calculus Operator P(Arrhythmia | do(Replace Drug))...",
    "Deriving Individual Treatment Effect (ITE) & Average Treatment Effect (ATE)...",
    "Finalizing Counterfactual Safety Bounds..."
  ];

  return (
    <div className="space-y-6 text-slate-100 max-w-7xl mx-auto pb-10">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <GitBranch className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Causal AI & Structural Causal Model (SCM) Engine</h1>
              <p className="text-xs text-slate-400">
                DoWhy & PyWhy Causal Inference pipeline evaluating counterfactual interventions via Pearl's Do-calculus `P(Y | do(X))`, Individual Treatment Effects (ITE), and confounder adjustment.
              </p>
            </div>
          </div>

          <button
            onClick={handleRunDoCalculus}
            disabled={isSimulating}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Computing Do-Calculus...' : 'Run Causal Do-Calculus'}</span>
          </button>
        </div>
      </div>

      <AILoadingOverlay
        isLoading={isSimulating}
        title="Executing Do-Calculus Structural Inference..."
        subtitle={`Computing counterfactual risk reduction for ${activePatient.name}`}
        steps={CAUSAL_STEPS}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Causal Directed Acyclic Graph (DAG) & Intervention Selector */}
        <div className="lg:col-span-2 space-y-6">
          {/* Causal DAG Visual Representation */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
              <span>Causal Directed Acyclic Graph (DAG) for {activePatient.name}</span>
              <span className="text-xs text-emerald-400 font-mono font-bold">Structural Equation Model</span>
            </h2>

            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
              <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-center font-bold text-cyan-300">
                  Genetics (CYP2D6/2C9)
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600" />
                <div className="p-3 rounded-xl bg-indigo-900/40 border border-indigo-700 text-center font-bold text-indigo-300">
                  Enzyme Clearance Rate
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600" />
                <div className="p-3 rounded-xl bg-amber-900/40 border border-amber-700 text-center font-bold text-amber-300">
                  Drug Serum Conc.
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600" />
                <div className="p-3 rounded-xl bg-rose-900/40 border border-rose-700 text-center font-bold text-rose-300">
                  Adverse Event Probability
                </div>
              </div>

              <div className="text-[11px] text-slate-400 text-center italic border-t border-slate-800/80 pt-2">
                Confounders adjusted: Age, eGFR ({patient.kidneyFunction.egfr}), Comorbidities, Baseline Vitals.
              </div>
            </div>
          </div>

          {/* Counterfactual Scenario Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3">
              Select Counterfactual Intervention `do(X)`
            </h2>

            <div className="space-y-3">
              {interventions.map((item) => {
                const isSelected = activeIntervention?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedIntervention(item);
                      setSimulationComplete(false);
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800 border-emerald-500 shadow-md'
                        : 'bg-slate-800/40 border-slate-700/80 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-sm text-white">
                        {item.interventionType}: <span className="text-emerald-300">{item.targetDrug}</span> → {item.replacementDrug || `${item.doseAdjustment}mg`}
                      </div>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                        -{item.estimatedRiskReductionPercent}% Risk Delta
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">{item.counterfactualOutcome}</p>
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleRunDoCalculus}
              disabled={isSimulating}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all disabled:opacity-50"
            >
              {isSimulating ? (
                <span>Executing DoWhy Do-calculus Math...</span>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Run Counterfactual Inference Simulation</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Col: Causal Estimates (ATE, ITE, Counterfactual Output) */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <span>Counterfactual Inference Results</span>
            </h2>

            {activeIntervention && (
              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                  <div className="text-slate-400 font-semibold text-[11px]">Estimated Treatment Effect</div>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">ATE (Population)</span>
                      <strong className="text-emerald-300 font-bold text-sm">{activeIntervention.ateScore}</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">ITE ({activePatient.name})</span>
                      <strong className="text-cyan-300 font-bold text-sm">{activeIntervention.iteScore}</strong>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                  <div className="text-slate-400 font-semibold text-[11px]">Predicted Outcome under `do(X)`</div>
                  <div className="text-slate-200 leading-relaxed font-medium">
                    {activeIntervention.counterfactualOutcome}
                  </div>
                  <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-700 flex justify-between">
                    <span>Calibrated P-value:</span>
                    <strong className="text-emerald-400 font-mono">p = {activeIntervention.pCalibratedValue}</strong>
                  </div>
                </div>

                {simulationComplete && (
                  <button
                    onClick={() => onApplyIntervention && onApplyIntervention(activeIntervention)}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    Apply Intervention to Active Regimen
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      </AILoadingOverlay>
    </div>
  );
};
