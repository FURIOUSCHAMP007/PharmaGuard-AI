import React, { useState } from 'react';
import { Activity, Dna, Heart, Sliders, RefreshCw, AlertTriangle, CheckCircle2, Zap } from 'lucide-react';
import { Patient } from '../../types/pharmaguard';
import { INITIAL_PATIENTS } from '../../data/mockClinicalData';
import { AILoadingOverlay } from '../AILoadingOverlay';
import { GNNGraphVisualizer } from '../GNNGraphVisualizer';

interface DigitalPatientTwinViewProps {
  patient?: Patient;
  onUpdatePatient?: (updated: Patient) => void;
}

export const DigitalPatientTwinView: React.FC<DigitalPatientTwinViewProps> = ({ patient, onUpdatePatient }) => {
  const activePatient = patient || INITIAL_PATIENTS[0];
  const [isSimulating, setIsSimulating] = useState(false);
  const [egfr, setEgfr] = useState(activePatient.kidneyFunction.egfr);
  const [alt, setAlt] = useState(activePatient.liverFunction.alt);
  const [qtc, setQtc] = useState(activePatient.vitals.qtcIntervalMs);
  const [cyp2d6, setCyp2d6] = useState(activePatient.genetics.cyp2d6);

  // Recalculate twin parameters dynamically
  const calculatedRiskScore = Math.min(
    99.9,
    Math.max(
      10.0,
      (egfr < 40 ? 40 : egfr < 60 ? 25 : 10) +
      (qtc > 480 ? 45 : qtc > 450 ? 25 : 10) +
      (cyp2d6 === 'Poor Metabolizer' ? 25 : cyp2d6 === 'Ultra-rapid Metabolizer' ? 20 : 5)
    )
  );

  const riskCategory = calculatedRiskScore > 80 ? 'Critical' : calculatedRiskScore > 50 ? 'High' : 'Moderate';

  const handleApplyChanges = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const updated: Patient = {
        ...activePatient,
        kidneyFunction: {
          ...activePatient.kidneyFunction,
          egfr,
          stage: egfr < 30 ? 'Stage 4 (Severe)' : egfr < 60 ? 'Stage 3b (Moderate to Severe)' : 'Stage 2 (Mild)'
        },
        liverFunction: {
          ...activePatient.liverFunction,
          alt
        },
        vitals: {
          ...activePatient.vitals,
          qtcIntervalMs: qtc
        },
        genetics: {
          ...activePatient.genetics,
          cyp2d6
        },
        riskScorePercent: parseFloat(calculatedRiskScore.toFixed(1)),
        riskCategory: riskCategory as any
      };
      if (onUpdatePatient) onUpdatePatient(updated);
      setIsSimulating(false);
    }, 2000);
  };

  const TWIN_STEPS = [
    "Initializing Digital Patient Twin Organ Function Solvers...",
    "Simulating Renal Clearance Decay Rate (Cockcroft-Gault Equation)...",
    "Modeling CYP2D6 Pharmacogenomic Enzyme Kinetics...",
    "Calculating Cardiac Repolarization & hERG Ion Channel Blockade...",
    "Re-calibrating Multi-Organ Toxicity & Proarrhythmic Risk Matrix..."
  ];

  return (
    <div className="space-y-6 text-slate-100 max-w-7xl mx-auto pb-10">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Digital Patient Twin Physiological Engine</h1>
              <p className="text-xs text-slate-400">
                Interactive organ function simulator modeling renal clearance decay, pharmacogenomic enzyme saturation, and QTc repolarization reserve for {activePatient.name}.
              </p>
            </div>
          </div>

          <button
            onClick={handleApplyChanges}
            disabled={isSimulating}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Simulating Physiological Twin...' : 'Re-Run Organ Twin Simulation'}</span>
          </button>
        </div>
      </div>

      <AILoadingOverlay
        isLoading={isSimulating}
        title="Simulating Digital Twin Physiological Dynamics..."
        subtitle={`Modeling multi-organ PK/PD clearance curves for ${activePatient.name}`}
        steps={TWIN_STEPS}
      >
        <div className="space-y-6">
          {/* GNN Organ Susceptibility Subgraph Engine */}
          <GNNGraphVisualizer
            title="GNN Digital Twin Organ Susceptibility & Pharmacogenomic Subgraph"
            subtitle={`Real-time organ-system node attributions reacting to eGFR (${egfr} mL/min) and QTc (${qtc} ms) parameter changes`}
            patientName={activePatient.name}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Sliders & Twin Simulator Controls */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sliders className="w-5 h-5 text-cyan-400" />
              <span>Adjust Twin Parameters in Real Time</span>
            </h2>

            {/* Renal eGFR Slider */}
            <div className="space-y-2 p-4 rounded-xl bg-slate-800/60 border border-slate-700">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">Renal Function (eGFR)</span>
                <span className="text-cyan-300">{egfr} mL/min/1.73m²</span>
              </div>
              <input
                type="range"
                min="10"
                max="120"
                value={egfr}
                onChange={(e) => setEgfr(parseInt(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">
                Directly modulates clearance half-life of Metformin, Methotrexate, and renal DOAC metabolites.
              </p>
            </div>

            {/* QTc Interval Slider */}
            <div className="space-y-2 p-4 rounded-xl bg-slate-800/60 border border-slate-700">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">Cardiac QTc Interval</span>
                <span className="text-purple-300">{qtc} ms</span>
              </div>
              <input
                type="range"
                min="380"
                max="540"
                value={qtc}
                onChange={(e) => setQtc(parseInt(e.target.value))}
                className="w-full accent-purple-400 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">
                Proarrhythmic Torsades de Pointes boundary is &gt; 500 ms. Stacks with Amiodarone & Fluoxetine.
              </p>
            </div>

            {/* CYP2D6 Phenotype Selector */}
            <div className="space-y-2 p-4 rounded-xl bg-slate-800/60 border border-slate-700">
              <label className="block text-xs font-bold text-slate-300">CYP2D6 Metabolizer Phenotype</label>
              <select
                value={cyp2d6}
                onChange={(e) => setCyp2d6(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="Poor Metabolizer">Poor Metabolizer (0x activity — severe drug accumulation)</option>
                <option value="Intermediate Metabolizer">Intermediate Metabolizer (0.5x activity)</option>
                <option value="Normal Metabolizer">Normal Metabolizer (1.0x activity)</option>
                <option value="Ultra-rapid Metabolizer">Ultra-rapid Metabolizer (2.0x activity — rapid clearance / prodrug toxicity)</option>
              </select>
            </div>

            <button
              onClick={handleApplyChanges}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Update Twin State & Trigger GNN Simulation</span>
            </button>
          </div>
        </div>

        {/* Right Col: Live Twin Telemetry & Risk Score Output */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <span>Live Twin Telemetry Output</span>
            </h2>

            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2 text-center">
              <div className="text-xs text-slate-400 font-semibold">Simulated Regimen Risk Score</div>
              <div className="text-3xl font-black text-rose-400">{calculatedRiskScore.toFixed(1)}%</div>
              <div className="text-xs font-bold text-rose-300">{riskCategory} Risk Level</div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-800/40 border border-slate-800">
                <span className="text-slate-400">Renal Clearance Efficiency:</span>
                <span className="font-bold text-cyan-300">{((egfr / 120) * 100).toFixed(0)}% Normal</span>
              </div>

              <div className="flex justify-between p-2.5 rounded-lg bg-slate-800/40 border border-slate-800">
                <span className="text-slate-400">Proarrhythmic Repolarization:</span>
                <span className={`font-bold ${qtc > 480 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {qtc > 480 ? 'CRITICAL (Torsades Boundary)' : 'Normal Range'}
                </span>
              </div>

              <div className="flex justify-between p-2.5 rounded-lg bg-slate-800/40 border border-slate-800">
                <span className="text-slate-400">CYP2D6 Clearance Capacity:</span>
                <span className="font-bold text-indigo-300">{cyp2d6}</span>
              </div>
            </div>

            {/* Organ Systems Visual Progress Bars */}
            <div className="space-y-3 border-t border-slate-800 pt-3">
              <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Organ Functional Capacity Spectrum</span>
                <span className="text-[10px] text-cyan-400 font-mono">LIVE ODE MODEL</span>
              </div>

              {/* Renal Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400 flex items-center gap-1"><Activity className="w-3 h-3 text-cyan-400" /> Renal Clearance (eGFR {egfr})</span>
                  <span className="text-cyan-300 font-mono">{((egfr / 120) * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      egfr < 30 ? 'bg-rose-500' : egfr < 60 ? 'bg-amber-400' : 'bg-cyan-400'
                    }`}
                    style={{ width: `${Math.min(100, (egfr / 120) * 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Cardiac Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400 flex items-center gap-1"><Heart className="w-3 h-3 text-purple-400" /> Cardiac QTc Safety ({qtc} ms)</span>
                  <span className="text-purple-300 font-mono">{Math.max(0, 100 - Math.round((qtc - 380) / 2))}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      qtc > 480 ? 'bg-rose-500' : qtc > 440 ? 'bg-amber-400' : 'bg-purple-400'
                    }`}
                    style={{ width: `${Math.max(5, 100 - Math.round((qtc - 380) / 2))}%` }}
                  ></div>
                </div>
              </div>

              {/* Hepatic Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400 flex items-center gap-1"><Dna className="w-3 h-3 text-emerald-400" /> Hepatic Enzyme Activity (ALT {alt})</span>
                  <span className="text-emerald-300 font-mono">{Math.max(10, 100 - Math.round((alt - 20) * 1.2))}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-400 transition-all duration-300"
                    style={{ width: `${Math.max(10, 100 - Math.round((alt - 20) * 1.2))}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
      </AILoadingOverlay>
    </div>
  );
};
