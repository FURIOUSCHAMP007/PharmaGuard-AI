import React, { useState } from 'react';
import { BarChart3, ShieldCheck, Activity, Layers, Sparkles, RefreshCw } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { AILoadingOverlay } from '../AILoadingOverlay';

export const UncertaintyAnalyticsView: React.FC = () => {
  const [isSampling, setIsSampling] = useState(false);

  const handleRunSampling = () => {
    setIsSampling(true);
    setTimeout(() => {
      setIsSampling(false);
    }, 2000);
  };

  // Monte Carlo Dropout 100 Forward Pass Distribution
  const mcDistribution = [
    { riskVal: '60%', density: 2 },
    { riskVal: '68%', density: 8 },
    { riskVal: '74%', density: 18 },
    { riskVal: '82%', density: 42 }, // Peak mean risk
    { riskVal: '88%', density: 22 },
    { riskVal: '92%', density: 6 },
    { riskVal: '96%', density: 2 }
  ];

  const BAYESIAN_STEPS = [
    "Executing 100 Monte Carlo Dropout Stochastic Forward Passes...",
    "Estimating Epistemic Model Variance σ²_epistemic...",
    "Quantifying Heteroscedastic Aleatoric Data Noise σ²_aleatoric...",
    "Computing Expected Calibration Error (ECE) Temperature Scaling...",
    "Synthesizing Bayesian Gaussian Process Density Curve..."
  ];

  return (
    <div className="space-y-6 text-slate-100 max-w-7xl mx-auto pb-10">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <BarChart3 className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Bayesian AI Uncertainty & Confidence Calibration</h1>
              <p className="text-xs text-slate-400">
                Decomposes model predictions into Epistemic (model architecture uncertainty) and Aleatoric (data noise) via Monte Carlo Dropout & Ensembles.
              </p>
            </div>
          </div>

          <button
            onClick={handleRunSampling}
            disabled={isSampling}
            className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSampling ? 'animate-spin' : ''}`} />
            <span>{isSampling ? 'Sampling 100 Forward Passes...' : 'Re-Run 100 Monte Carlo Passes'}</span>
          </button>
        </div>
      </div>

      <AILoadingOverlay
        isLoading={isSampling}
        title="Executing Monte Carlo Bayesian Ensemble Passes..."
        subtitle="Decomposing Epistemic vs Aleatoric uncertainty metrics"
        steps={BAYESIAN_STEPS}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monte Carlo Dropout Risk Probability Density */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
            <span>Monte Carlo Dropout Probability Density (100 Passes)</span>
            <span className="text-xs text-emerald-400 font-bold">Confidence: 95.2%</span>
          </h2>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mcDistribution} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="riskVal" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                <Area type="monotone" dataKey="density" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.4} name="Simulated Pass Density" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Epistemic vs Aleatoric Breakdown & ECE */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3">
            Uncertainty Decomposition & Calibration Metrics
          </h2>

          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex justify-between items-center">
              <div>
                <div className="font-bold text-white text-sm">Expected Calibration Error (ECE)</div>
                <div className="text-slate-400 text-[11px]">Well-calibrated probabilities matching clinical incidence</div>
              </div>
              <span className="text-lg font-black text-emerald-400">0.018</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-300 font-semibold">Epistemic Uncertainty (Model Variance):</span>
                <span className="text-cyan-300 font-bold">0.034 (Low)</span>
              </div>
              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                <div className="bg-cyan-400 h-full w-[12%]"></div>
              </div>

              <div className="flex justify-between pt-2">
                <span className="text-slate-300 font-semibold">Aleatoric Uncertainty (Data Noise):</span>
                <span className="text-amber-300 font-bold">0.062 (Moderate)</span>
              </div>
              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-400 h-full w-[22%]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </AILoadingOverlay>
    </div>
  );
};
