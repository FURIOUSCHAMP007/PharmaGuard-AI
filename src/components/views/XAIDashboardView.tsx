import React, { useState } from 'react';
import { Eye, BarChart2, Share2, Sparkles, ShieldCheck, RefreshCw, Cpu, Activity } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Patient } from '../../types/pharmaguard';
import { INITIAL_PATIENTS } from '../../data/mockClinicalData';
import { AILoadingOverlay } from '../AILoadingOverlay';
import { GNNGraphVisualizer } from '../GNNGraphVisualizer';

interface XAIDashboardViewProps {
  patient?: Patient;
}

export const XAIDashboardView: React.FC<XAIDashboardViewProps> = ({ patient }) => {
  const activePatient = patient || INITIAL_PATIENTS[0];
  const [isExplaining, setIsExplaining] = useState(false);

  const handleRunXai = () => {
    setIsExplaining(true);
    setTimeout(() => {
      setIsExplaining(false);
    }, 2000);
  };

  const shapData = [
    { feature: 'Amiodarone CYP2C9 Inhibit', shapValue: 0.38, color: '#f43f5e' },
    { feature: 'Renal eGFR 38 (Stage 3b)', shapValue: 0.26, color: '#f59e0b' },
    { feature: 'CYP2D6 Poor Metabolizer', shapValue: 0.18, color: '#38bdf8' },
    { feature: 'Fluoxetine hERG Channel Stacking', shapValue: 0.12, color: '#a855f7' },
    { feature: 'Age 68 Female Gender', shapValue: 0.06, color: '#10b981' }
  ];

  const XAI_STEPS = [
    "Computing Shapley Values (KernelSHAP Background Sampling)...",
    "Running GNNExplainer Subgraph Masking Solvers...",
    "Calculating Integrated Gradients across Input Feature Map...",
    "Decomposing Neural Net Weights into Biological Sub-paths...",
    "Synthesizing Human-Interpretable Feature Attributions..."
  ];

  return (
    <div className="space-y-6 text-slate-100 max-w-7xl mx-auto pb-10">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
              <Eye className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Explainable AI (XAI) & SHAP / GNNExplainer Dashboard</h1>
              <p className="text-xs text-slate-400">
                Surgical transparency into neural network decisions using SHAP feature attributions, GNNExplainer graph paths, and Integrated Gradients.
              </p>
            </div>
          </div>

          <button
            onClick={handleRunXai}
            disabled={isExplaining}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isExplaining ? 'animate-spin' : ''}`} />
            <span>{isExplaining ? 'Computing SHAP Attributions...' : 'Re-Compute SHAP & GNN Explanations'}</span>
          </button>
        </div>
      </div>

      <AILoadingOverlay
        isLoading={isExplaining}
        title="Computing Neural Attribution Explanations (SHAP & GNNExplainer)..."
        subtitle={`Isolating core risk drivers for ${activePatient.name}`}
        steps={XAI_STEPS}
      >
        <div className="space-y-6">
          {/* Interactive GNN Explainer Subgraph Visualizer */}
          <GNNGraphVisualizer
            title={`GNNExplainer Neural Attribution Graph for ${activePatient.name}`}
            subtitle="Isolating the most influential subpaths, GAT edge weights, and 512-dim node attributions"
            patientName={activePatient.name}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SHAP Feature Attributions Bar Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-purple-400" />
            <span>SHAP Feature Importance (Adverse Risk Drivers)</span>
          </h2>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={shapData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#94a3b8" />
                <YAxis type="category" dataKey="feature" stroke="#f8fafc" fontSize={11} width={130} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                <Bar dataKey="shapValue" name="SHAP Attribution Score">
                  {shapData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GNNExplainer Subgraph Explanation */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-cyan-400" />
            <span>GNNExplainer Most Influential Graph Subpath</span>
          </h2>

          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-3 text-xs">
            <div className="font-bold text-cyan-300">Dominant Subgraph Neural Attribution:</div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-amber-300 space-y-1">
              <div>Node(Amiodarone) -[INHIBITS weight=0.95]→ Node(CYP2C9)</div>
              <div>Node(CYP2C9) -[METABOLIZES weight=0.92]→ Node(Warfarin)</div>
              <div>Node(Warfarin) -[ASSOCIATED_WITH weight=0.91]→ Node(Major Hemorrhage)</div>
            </div>

            <div className="text-slate-300 leading-relaxed pt-1">
              The GNNExplainer isolated the CYP2C9 enzyme node as the core bottleneck responsible for 64% of the predicted risk score in patient {activePatient.name}.
            </div>
          </div>
        </div>
      </div>
      </div>
      </AILoadingOverlay>
    </div>
  );
};
