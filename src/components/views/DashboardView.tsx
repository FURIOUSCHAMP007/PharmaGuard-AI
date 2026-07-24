import React, { useState } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  Pill, 
  GitBranch, 
  Share2, 
  Bot, 
  ArrowRight, 
  TrendingUp, 
  Heart, 
  Zap,
  Sparkles,
  RefreshCw,
  Cpu,
  BarChart2,
  PieChart as PieIcon
} from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Patient, DrugInteraction, AgentStep, FDAAlert } from '../../types/pharmaguard';
import { INITIAL_PATIENTS } from '../../data/mockClinicalData';
import { ViewId } from '../Sidebar';
import { AILoadingOverlay } from '../AILoadingOverlay';
import { RiskScoreSparkline } from '../RiskScoreSparkline';
import { CriticalAlertsBanner } from '../CriticalAlertsBanner';
import { PredictiveSafetyAlert } from '../PredictiveSafetyAlert';
import { ClinicalRiskHeatmapGrid } from '../ClinicalRiskHeatmapGrid';
import { GNNGraphVisualizer } from '../GNNGraphVisualizer';

interface DashboardViewProps {
  patient?: Patient;
  selectedPatient?: Patient;
  interactions?: DrugInteraction[];
  agentSteps?: AgentStep[];
  fdaAlerts?: FDAAlert[];
  interventions?: any[];
  onNavigate: (view: ViewId) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  patient,
  selectedPatient,
  interactions = [],
  agentSteps = [],
  fdaAlerts = [],
  onNavigate
}) => {
  const activePatient = patient || selectedPatient || INITIAL_PATIENTS[0];
  const [isSimulating, setIsSimulating] = useState(false);

  const handleRunAiSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
    }, 2400);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Simulation Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 text-white shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
              <span>PharmaGuard AI Clinical Co-Pilot Core</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">LIVE MODEL ON</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Active Patient: <strong className="text-white">{activePatient.name} ({activePatient.mrn})</strong> | eGFR {activePatient.kidneyFunction.egfr} mL/min | CYP2D6 {activePatient.genetics.cyp2d6}
            </p>
          </div>
        </div>

        <button
          onClick={handleRunAiSimulation}
          disabled={isSimulating}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-indigo-950/50 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
          <span>{isSimulating ? 'Running AI Simulations...' : 'Re-run AI Thinking Engine'}</span>
        </button>
      </div>

      <AILoadingOverlay
        isLoading={isSimulating}
        title="PharmaGuard AI Engine Thinking..."
        subtitle={`Evaluating clinical safety pathways & drug interactions for ${activePatient.name}`}
      >
        <div className="space-y-6">
          {/* Critical Clinical Alerts Banner */}
          <CriticalAlertsBanner
            patient={activePatient}
            interactions={interactions}
            fdaAlerts={fdaAlerts}
            onNavigate={onNavigate}
            thresholdPercent={45}
          />

          {/* Real-Time Predictive Safety Alert Engine */}
          <PredictiveSafetyAlert
            patient={activePatient}
            interactions={interactions}
            onNavigate={onNavigate}
          />

          {/* Executive Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Regimen Risk Score</div>
                <div className="text-2xl font-extrabold text-rose-600 mt-1">{activePatient.riskScorePercent}%</div>
                <div className="text-[11px] text-rose-700 font-medium mt-0.5">{activePatient.riskCategory} Proarrhythmic Risk</div>
              </div>
              <div className="p-3 bg-rose-50 text-rose-600 rounded-lg border border-rose-200">
                <ShieldAlert className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Metabolic Interactions</div>
                <div className="text-2xl font-extrabold text-amber-600 mt-1">{interactions.length} Severe</div>
                <div className="text-[11px] text-slate-500 mt-0.5">CYP2C9 & CYP2D6 Conflicts</div>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-lg border border-amber-200">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Organ Impairment</div>
                <div className="text-2xl font-extrabold text-indigo-600 mt-1">eGFR {activePatient.kidneyFunction.egfr}</div>
                <div className="text-[11px] text-indigo-700 font-medium mt-0.5">{activePatient.kidneyFunction.stage}</div>
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-200">
                <Activity className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cardiac QTc Interval</div>
                <div className="text-2xl font-extrabold text-purple-600 mt-1">{activePatient.vitals.qtcIntervalMs} ms</div>
                <div className="text-[11px] text-purple-700 font-medium mt-0.5">hERG Channel Stacking</div>
              </div>
              <div className="p-3 bg-purple-50 text-purple-600 rounded-lg border border-purple-200">
                <Heart className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* 30-Day Risk Trajectory Sparkline Visualization */}
          <RiskScoreSparkline currentRiskScore={activePatient.riskScorePercent} patientName={activePatient.name} />

          {/* 30-Day Heatmap Grid Visualization */}
          <ClinicalRiskHeatmapGrid patient={activePatient} />

          {/* GNN Graph Neural Network Subgraph Explorer */}
          <GNNGraphVisualizer
            title="Graph Neural Network (GNN) Polypharmacy Subgraph & Attention Explorer"
            subtitle={`Node-level GAT attention, 512-dim embedding space, and multi-head attributions for ${activePatient.name}`}
            patientName={activePatient.name}
          />

          {/* Visual Analytics Overview Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Multi-Organ Stress Radar Chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 text-white shadow-md">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <BarChart2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Multi-Organ Toxicity & Clearance Stress Profile</h3>
                    <p className="text-[11px] text-slate-400">Real-time physiological stress vector for {activePatient.name}</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  5-Axis Vector
                </span>
              </div>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart
                    data={[
                      { axis: 'Renal Clearance', stress: Math.max(10, 100 - activePatient.kidneyFunction.egfr), baseline: 25 },
                      { axis: 'Hepatic CYP', stress: 70, baseline: 30 },
                      { axis: 'Cardiac hERG', stress: Math.min(95, Math.max(20, (activePatient.vitals.qtcIntervalMs - 380) / 1.5)), baseline: 20 },
                      { axis: 'PGx Variance', stress: activePatient.genetics.cyp2d6.includes('Poor') ? 85 : 40, baseline: 20 },
                      { axis: 'Hemostasis', stress: 75, baseline: 25 }
                    ]}
                  >
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="axis" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 8 }} />
                    <Radar name="Patient Stress" dataKey="stress" stroke="#818cf8" fill="#6366f1" fillOpacity={0.45} />
                    <Radar name="Safety Baseline" dataKey="baseline" stroke="#10b981" fill="#10b981" fillOpacity={0.15} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-center gap-6 text-[11px] border-t border-slate-800/80 pt-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block"></span>
                  <span className="text-slate-300 font-medium">Patient Organ Load</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                  <span className="text-slate-400 font-medium">Healthy Threshold</span>
                </div>
              </div>
            </div>

            {/* Interaction Severity Donut Chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 text-white shadow-md">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <PieIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Regimen Interaction Conflict Spectrum</h3>
                    <p className="text-[11px] text-slate-400">Breakdown of active drug-pair interaction severity</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {interactions.length} Active Conflicts
                </span>
              </div>

              <div className="h-56 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Contraindicated', value: interactions.filter(i => i.severity === 'Contraindicated').length || 1, color: '#f43f5e' },
                        { name: 'Severe Risk', value: interactions.filter(i => i.severity === 'Severe').length || 2, color: '#f97316' },
                        { name: 'Moderate Risk', value: interactions.filter(i => i.severity === 'Moderate').length || 1, color: '#eab308' },
                        { name: 'Safe Compatible', value: 3, color: '#10b981' }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {[
                        { color: '#f43f5e' },
                        { color: '#f97316' },
                        { color: '#eab308' },
                        { color: '#10b981' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] border-t border-slate-800/80 pt-2">
                <div className="flex items-center gap-1.5 text-rose-300">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span>Contraindicated (1)</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-300">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span>Severe Risk (2)</span>
                </div>
                <div className="flex items-center gap-1.5 text-yellow-300">
                  <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                  <span>Moderate Risk (1)</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Safe Compatible (3)</span>
                </div>
              </div>
            </div>
          </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Case Regimen</span>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mt-0.5">
                  <Pill className="w-5 h-5 text-indigo-600" />
                  <span>{activePatient.name}</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Genotype: CYP2D6 ({activePatient.genetics.cyp2d6}) | CYP2C19 ({activePatient.genetics.cyp2c19})
                </p>
              </div>

              <button
                onClick={() => onNavigate('drug_prescribe' as ViewId)}
                className="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5 cursor-pointer transition-colors uppercase tracking-wider"
              >
                <span>Edit Regimen</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activePatient.activeMedications.map((med) => (
                <div key={med.id} className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">{med.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {med.doseMg}mg {med.frequency}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600">{med.category}</div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2 pt-1 border-t border-slate-200">
                    <span>Metabolism: <strong className="text-slate-800">{med.cypMetabolism.join(', ')}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Identified Critical Interactions Table */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Intervention Targets</span>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mt-0.5">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <span>Pharmacokinetic & Target Conflicts</span>
                </h2>
              </div>

              <button
                onClick={() => onNavigate('interaction_matrix' as ViewId)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                <span>View Full Matrix</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {interactions.map((int) => (
                <div key={int.id} className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{int.drugA}</span>
                      <span className="text-xs text-slate-400 font-extrabold">⚡</span>
                      <span className="font-bold text-sm text-slate-900">{int.drugB}</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 uppercase">
                      {int.severity} Risk
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{int.mechanism}</p>
                  <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                    <span>Conflict: <strong className="text-slate-800">{int.metabolicConflict}</strong></span>
                    <span>Confidence: <strong className="text-indigo-600 font-bold">{(int.confidenceScore * 100).toFixed(0)}%</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col */}
        <div className="space-y-6">
          {/* Multi-Agent Console Widget */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-4 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Consensus</span>
                <h2 className="text-base font-bold text-white flex items-center gap-2 mt-0.5">
                  <Bot className="w-5 h-5 text-indigo-400" />
                  <span>Multi-Agent Pipeline</span>
                </h2>
              </div>
              <button
                onClick={() => onNavigate('multi_agent_console' as ViewId)}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer"
              >
                Inspect
              </button>
            </div>

            <div className="space-y-2.5">
              {agentSteps.slice(0, 4).map((step, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/80 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-300">{step.agentName}</span>
                    <span className="text-[10px] text-emerald-400 font-extrabold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> {(step.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] line-clamp-2">{step.output}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigate('causal_counterfactual' as ViewId)}
              className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer uppercase tracking-wider"
            >
              <GitBranch className="w-4 h-4" />
              <span>Simulate Counterfactuals</span>
            </button>
          </div>

          {/* FDA Safety Alerts */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Regulatory Watch</span>
              <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold rounded">FDA ALERTS</span>
            </div>
            {fdaAlerts.slice(0, 2).map((alert) => (
              <div key={alert.id} className="p-3.5 rounded-lg bg-rose-50/50 border border-rose-200 text-xs space-y-1">
                <div className="font-bold text-rose-800">{alert.drugName} - {alert.alertType}</div>
                <p className="text-slate-600 text-[11px] leading-relaxed">{alert.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
      </AILoadingOverlay>
    </div>
  );
};
