import React, { useState } from 'react';
import { Clock, Activity, TrendingUp, AlertTriangle, Layers, Sliders, RefreshCw } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import { Patient, PKPDSimulationPoint } from '../../types/pharmaguard';
import { INITIAL_PATIENTS } from '../../data/mockClinicalData';
import { AILoadingOverlay } from '../AILoadingOverlay';
import { GNNGraphVisualizer } from '../GNNGraphVisualizer';

interface TemporalRiskSimulationViewProps {
  patient?: Patient;
  pkpdPoints?: PKPDSimulationPoint[];
}

export const TemporalRiskSimulationView: React.FC<TemporalRiskSimulationViewProps> = ({
  patient,
  pkpdPoints = []
}) => {
  const activePatient = patient || INITIAL_PATIENTS[0];
  const [selectedHour, setSelectedHour] = useState<number>(12);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleRunPkPdSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
    }, 2100);
  };

  const currentPoint = pkpdPoints.find(p => p.timeHours === selectedHour) || pkpdPoints[3] || { timeHours: 12, drug1Conc: 4.2, drug2Conc: 2.1, combinedToxicityScore: 65, qtcRiskFactor: 1.2 };

  const PKPD_STEPS = [
    "Solving System of Two-Compartment Pharmacokinetic Differential Equations...",
    "Computing Non-Linear Elimination Rate Constants (Vmax / Km)...",
    "Integrating Renal Clearance Decay (Cockcroft-Gault Adjustments)...",
    "Predicting Longitudinal 72-Hour Drug Accumulation Curves...",
    "Generating Combined Proarrhythmic Toxicity Profile & Thresholds..."
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Multi-Agent Predictive Engine</span>
              <h1 className="text-xl font-bold text-slate-900">Temporal Risk Simulation & PK/PD Engine</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Longitudinal Pharmacokinetic (PK) and Pharmacodynamic (PD) concentration-time simulation over 72 hours with toxic threshold boundaries.
              </p>
            </div>
          </div>

          <button
            onClick={handleRunPkPdSimulation}
            disabled={isSimulating}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Solving PK/PD ODEs...' : 'Re-Run 72H PK/PD ODE Solver'}</span>
          </button>
        </div>
      </div>

      <AILoadingOverlay
        isLoading={isSimulating}
        title="Solving 72-Hour Longitudinal PK/PD Differential Equations..."
        subtitle={`Simulating drug accumulation & toxicity profiles for ${activePatient.name}`}
        steps={PKPD_STEPS}
      >
        <div className="space-y-6">
          {/* GNN Graph Neural Network Subgraph Visualizer */}
          <GNNGraphVisualizer
            title="GNN Temporal Node Weighting & Pharmacokinetic Network Dynamics"
            subtitle={`Longitudinal GAT attention weights evolving over 72-hour dosing windows for ${activePatient.name}`}
            patientName={activePatient.name}
          />

          {/* PK/PD Chart Container */}
      <div className="bg-slate-900 border border-slate-800 text-white rounded-xl p-6 space-y-4 shadow-sm relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Simulation Visualizer</span>
            <h2 className="text-base font-bold text-white flex items-center gap-2 mt-0.5">
              <Activity className="w-5 h-5 text-indigo-400" />
              <span>72-Hour Drug Concentration & Combined Toxicity Profile</span>
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-medium bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
            eGFR Clearance Factor: <strong className="text-indigo-300">{activePatient.kidneyFunction.egfr} mL/min</strong>
          </span>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={pkpdPoints} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTox" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorDrug1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="timeHours" stroke="#64748b" unit="h" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
              />
              <ReferenceLine y={8.0} label={{ value: 'Toxic Threshold (8.0 mg/L)', fill: '#f43f5e', fontSize: 11 }} stroke="#f43f5e" strokeDasharray="4 4" />
              <Area type="monotone" dataKey="drug1Conc" name="Amiodarone Conc." stroke="#6366f1" fillOpacity={1} fill="url(#colorDrug1)" />
              <Area type="monotone" dataKey="drug2Conc" name="Warfarin Conc." stroke="#a855f7" fillOpacity={0.3} fill="#a855f7" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Time Hour Scrubbing Slider */}
        <div className="p-4 rounded-lg bg-slate-800/80 border border-slate-700 space-y-3">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-300">Scrub Simulation Timeline:</span>
            <span className="text-indigo-300">Hour {selectedHour}:00</span>
          </div>

          <input
            type="range"
            min="0"
            max="72"
            step="4"
            value={selectedHour}
            onChange={(e) => setSelectedHour(parseInt(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[10px] block font-bold uppercase">Amiodarone Conc.</span>
              <strong className="text-indigo-300 text-sm font-bold">{currentPoint.drug1Conc} mg/L</strong>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[10px] block font-bold uppercase">Warfarin Conc.</span>
              <strong className="text-purple-300 text-sm font-bold">{currentPoint.drug2Conc} mg/L</strong>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[10px] block font-bold uppercase">Combined Toxicity Score</span>
              <strong className={`text-sm font-bold ${currentPoint.combinedToxicityScore > 80 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {currentPoint.combinedToxicityScore} / 100
              </strong>
            </div>
          </div>
        </div>
      </div>
      </div>
      </AILoadingOverlay>
    </div>
  );
};
