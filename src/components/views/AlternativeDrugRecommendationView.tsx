import React from 'react';
import { Sparkles, CheckCircle2, ShieldCheck, ArrowRight, Award, BookOpen, BarChart2, Shield } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, Legend } from 'recharts';
import { Patient, CausalIntervention } from '../../types/pharmaguard';
import { INITIAL_PATIENTS } from '../../data/mockClinicalData';
import { GNNGraphVisualizer } from '../GNNGraphVisualizer';

interface AlternativeDrugRecommendationViewProps {
  patient?: Patient;
  interventions?: CausalIntervention[];
  onApplyIntervention?: (intervention: CausalIntervention) => void;
}

export const AlternativeDrugRecommendationView: React.FC<AlternativeDrugRecommendationViewProps> = ({
  patient,
  interventions = [],
  onApplyIntervention
}) => {
  const activePatient = patient || INITIAL_PATIENTS[0];

  const radarComparisonData = [
    { dimension: 'Efficacy Index', currentRegimen: 85, recommendedRegimen: 92 },
    { dimension: 'Renal Safety', currentRegimen: 30, recommendedRegimen: 88 },
    { dimension: 'QTc Preservation', currentRegimen: 40, recommendedRegimen: 90 },
    { dimension: 'Low CYP Conflict', currentRegimen: 25, recommendedRegimen: 85 },
    { dimension: 'Guideline Grade', currentRegimen: 70, recommendedRegimen: 95 }
  ];

  return (
    <div className="space-y-6 text-slate-100 max-w-7xl mx-auto pb-10">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Safety-Ranked Alternative Drug Recommendation Engine</h1>
            <p className="text-xs text-slate-400">
              Evaluates target affinity, pharmacogenomic compatibility, renal clearance, and clinical trial evidence to score safer alternative regimens.
            </p>
          </div>
        </div>
      </div>

      {/* GNN Graph Neural Network Subgraph Visualizer */}
      <GNNGraphVisualizer
        title="GNN Latent Embedding Distance & Alternative Drug Substitution Network"
        subtitle={`Embedding distance vectors in 512-dim latent space identifying optimal low-toxicity substitutes for ${activePatient.name}`}
        patientName={activePatient.name}
      />

      {/* Visual Multi-Dimensional Regimen Comparison Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Current Regimen vs Recommended Optimization Profile</h2>
              <p className="text-xs text-slate-400">5-Axis trade-off matrix showing safety, efficacy, and renal preservation deltas</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            +42% Net Safety Boost
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarComparisonData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="dimension" tick={{ fill: '#cbd5e1', fontSize: 11, fontWeight: 600 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 9 }} />
              <Radar name="Current High-Risk Regimen" dataKey="currentRegimen" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.35} />
              <Radar name="Optimized AI Regimen" dataKey="recommendedRegimen" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
              <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-4">
        {interventions.map((item, idx) => (
          <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-cyan-500/10 text-cyan-400 font-bold text-xs flex items-center justify-center border border-cyan-500/30">
                  #{idx + 1}
                </span>
                <span className="font-extrabold text-base text-white">
                  Replace <span className="text-rose-400">{item.targetDrug}</span> with <span className="text-emerald-400">{item.replacementDrug}</span>
                </span>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                +{item.estimatedRiskReductionPercent}% Safety Score Delta
              </span>
            </div>

            {/* Visual Risk Reduction Progress Bar */}
            <div className="space-y-1 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-slate-400">Estimated Safety Improvement</span>
                <span className="text-emerald-400">+{item.estimatedRiskReductionPercent}% Risk Reduction</span>
              </div>
              <div className="w-full h-2.5 bg-slate-700/80 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, item.estimatedRiskReductionPercent * 2)}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-1">
                <div className="text-slate-400 font-semibold text-[11px]">Pharmacogenomic Mechanism</div>
                <div className="text-slate-200 font-medium leading-relaxed">{item.counterfactualOutcome}</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-1">
                <div className="text-slate-400 font-semibold text-[11px]">Trial & Guideline Support</div>
                <div className="text-cyan-300 font-bold">ACC/AHA 2023 Class I-A Guidance</div>
                <div className="text-slate-400 text-[11px]">ARISTOTLE Phase 3 RCT (n=18,201 patients)</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 flex flex-col justify-between space-y-2">
                <div>
                  <div className="text-slate-400 font-semibold text-[11px]">Treatment Effect Scores</div>
                  <div className="text-emerald-400 font-bold">ATE: {item.ateScore} | ITE: {item.iteScore}</div>
                </div>

                <button
                  onClick={() => onApplyIntervention && onApplyIntervention(item)}
                  className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Apply Recommendation</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
