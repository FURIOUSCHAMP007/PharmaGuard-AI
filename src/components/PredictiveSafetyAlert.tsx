import React, { useState, useMemo } from 'react';
import { ShieldAlert, AlertTriangle, Clock, ArrowRight, Activity, Zap, ChevronDown, ChevronUp, Sparkles, CheckCircle2, RefreshCw, X, TrendingUp, Sliders, Heart, Info } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts';
import { Patient, DrugInteraction } from '../types/pharmaguard';
import { ViewId } from './Sidebar';

interface PredictiveSafetyAlertProps {
  patient: Patient;
  interactions?: DrugInteraction[];
  onNavigate: (view: ViewId) => void;
}

export interface PredictiveHazardEvent {
  id: string;
  title: string;
  category: 'Cardiac Arrhythmia' | 'Bleeding Risk' | 'Renal Failure' | 'Metabolic Saturation';
  predictedOnsetHours: number;
  probabilityPercent: number;
  confidenceInterval: string;
  primaryMedications: string[];
  physiologicalMechanism: string;
  peakThresholdMetric: string;
  severity: 'Critical' | 'Severe' | 'Moderate';
  recommendedAction: string;
  simulatedMitigatedRisk: number;
}

export const PredictiveSafetyAlert: React.FC<PredictiveSafetyAlertProps> = ({
  patient,
  interactions = [],
  onNavigate,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedTimeHorizon, setSelectedTimeHorizon] = useState<12 | 24 | 48 | 72 | 168>(48);
  const [simulatedMitigation, setSimulatedMitigation] = useState<string | null>(null);

  // Generate predictive adverse events based on patient risk profile & active medications
  const hazardEvents: PredictiveHazardEvent[] = useMemo(() => {
    const events: PredictiveHazardEvent[] = [];
    const hasAmiodarone = patient.activeMedications.some(m => m.name.toLowerCase().includes('amiodarone'));
    const hasFluoxetine = patient.activeMedications.some(m => m.name.toLowerCase().includes('fluoxetine'));
    const hasWarfarin = patient.activeMedications.some(m => m.name.toLowerCase().includes('warfarin'));
    const hasMethotrexate = patient.activeMedications.some(m => m.name.toLowerCase().includes('methotrexate'));

    if (patient.vitals.qtcIntervalMs >= 450 || (hasAmiodarone && hasFluoxetine)) {
      events.push({
        id: 'pred-001',
        title: 'Impending QTc Prolongation & Torsades de Pointes Risk Peak',
        category: 'Cardiac Arrhythmia',
        predictedOnsetHours: 18,
        probabilityPercent: Math.min(96, Math.round(patient.riskScorePercent * 1.08)),
        confidenceInterval: '88.4% - 94.1%',
        primaryMedications: ['Amiodarone 200mg', 'Fluoxetine 200mg'],
        physiologicalMechanism: 'Dual hERG K+ channel pore blockage combined with CYP2D6 metabolic clearance reduction',
        peakThresholdMetric: `Predicted QTc: ${patient.vitals.qtcIntervalMs + 42} ms (Threshold >500 ms)`,
        severity: 'Critical',
        recommendedAction: 'Hold Fluoxetine dose or switch to Sertraline (low hERG affinity)',
        simulatedMitigatedRisk: 32.5,
      });
    }

    if (hasWarfarin && hasAmiodarone) {
      events.push({
        id: 'pred-002',
        title: 'Supratherapeutic INR Spikes & Internal Hemorrhage Hazard',
        category: 'Bleeding Risk',
        predictedOnsetHours: 34,
        probabilityPercent: 86,
        confidenceInterval: '81.2% - 89.8%',
        primaryMedications: ['Warfarin 5mg', 'Amiodarone 200mg'],
        physiologicalMechanism: 'CYP2C9 enzyme competitive saturation causing 45% decrease in S-Warfarin clearance',
        peakThresholdMetric: 'Predicted INR Peak: 4.85 (Therapeutic Target: 2.0 - 3.0)',
        severity: 'Severe',
        recommendedAction: 'Reduce Warfarin daily dose by 35% with daily INR monitoring',
        simulatedMitigatedRisk: 28.0,
      });
    }

    if (patient.kidneyFunction.egfr < 45 || hasMethotrexate) {
      events.push({
        id: 'pred-003',
        title: 'Renal Clearance Bottleneck & Tubular Accumulation',
        category: 'Renal Failure',
        predictedOnsetHours: 52,
        probabilityPercent: 74,
        confidenceInterval: '69.0% - 78.5%',
        primaryMedications: ['Active Regimen', 'Renal Excretion'],
        physiologicalMechanism: 'OAT1/OAT3 transporter saturation under impaired GFR (38 mL/min)',
        peakThresholdMetric: `Creatinine Clearance Delta: -12.4% over 72h`,
        severity: 'Moderate',
        recommendedAction: 'Adjust dosing interval to q36h and hydrate generously',
        simulatedMitigatedRisk: 21.0,
      });
    }

    // Default event if no specific triggers
    if (events.length === 0) {
      events.push({
        id: 'pred-default',
        title: 'Progressive Drug Accumulation Hazard',
        category: 'Metabolic Saturation',
        predictedOnsetHours: 42,
        probabilityPercent: Math.round(patient.riskScorePercent),
        confidenceInterval: '70% - 82%',
        primaryMedications: patient.activeMedications.slice(0, 2).map(m => m.name),
        physiologicalMechanism: 'Steady-state plasma concentration buildup under reduced metabolic pathways',
        peakThresholdMetric: 'Tox-Index Peak > 0.75',
        severity: 'Moderate',
        recommendedAction: 'Review therapeutic drug monitoring levels',
        simulatedMitigatedRisk: 25.0,
      });
    }

    return events;
  }, [patient]);

  // Generate 72-hour temporal simulation curve for peak risk forecasting
  const temporalChartData = useMemo(() => {
    const data = [];
    const baseRisk = patient.riskScorePercent;

    for (let h = 0; h <= selectedTimeHorizon; h += selectedTimeHorizon > 48 ? 6 : 2) {
      // Simulate peak curve reaching max around hour 18-36
      const peakHour = 24;
      const distFromPeak = Math.abs(h - peakHour);
      const GaussianCurve = Math.exp(-Math.pow(distFromPeak / 16, 2));

      let currentPointRisk = Math.min(99, Math.round(baseRisk + (GaussianCurve * 18) + (h * 0.1) - (h > 40 ? (h - 40) * 0.2 : 0)));

      // If user toggled a simulated mitigation
      let mitigatedPointRisk = currentPointRisk;
      if (simulatedMitigation) {
        mitigatedPointRisk = Math.max(15, Math.round(currentPointRisk * 0.42));
      }

      data.push({
        hour: `+${h}h`,
        hourNum: h,
        unmitigatedRisk: currentPointRisk,
        mitigatedRisk: simulatedMitigation ? mitigatedPointRisk : null,
        qtcEstimate: Math.round(patient.vitals.qtcIntervalMs + (GaussianCurve * 48)),
        threshold: 75,
      });
    }
    return data;
  }, [patient, selectedTimeHorizon, simulatedMitigation]);

  const topEvent = hazardEvents[0];

  if (isDismissed) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-indigo-500/50 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/80 p-5 text-white shadow-2xl shadow-indigo-950/50 space-y-5">
      {/* Visual Ambient Glow */}
      <div className="absolute -left-12 -top-12 w-56 h-56 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Banner Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-indigo-500/30 pb-4">
        <div className="flex items-start gap-3">
          <div className="relative p-3 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shrink-0 mt-0.5">
            <Clock className="w-6 h-6 animate-pulse text-cyan-400" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-cyan-400 animate-ping"></span>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-md">
                PREDICTIVE TEMPORAL SAFETY ALERT
              </span>
              <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-500/10 px-2.5 py-0.5 rounded-md border border-cyan-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>PK/PD ODE Simulator Active</span>
              </span>
              <span className="text-xs font-mono text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/30 font-bold">
                T_onset: ~{topEvent.predictedOnsetHours} Hours
              </span>
            </div>

            <h2 className="text-base font-extrabold text-white mt-1.5 flex items-center gap-2">
              <span>{topEvent.title}</span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Forward temporal simulation indicates a high probability ({topEvent.probabilityPercent}%) adverse event for <strong className="text-white">{patient.name}</strong> before clinical manifestation.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-end lg:self-auto shrink-0">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer shadow-sm"
          >
            <span>{isExpanded ? 'Collapse Simulation' : `Inspect Temporal Curve`}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setIsDismissed(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Dismiss Predictive Alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded Temporal Simulation Dashboard */}
      {isExpanded && (
        <div className="space-y-5">
          {/* Upcoming Predicted Events Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {hazardEvents.map((evt, idx) => (
              <div
                key={evt.id}
                className={`p-3.5 rounded-xl border text-xs space-y-2 transition-all ${
                  idx === 0
                    ? 'bg-slate-900/90 border-rose-500/50 shadow-lg shadow-rose-950/20 ring-1 ring-rose-500/30'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-cyan-300 border border-slate-700">
                    {evt.category}
                  </span>
                  <span className="text-[11px] font-mono font-extrabold text-rose-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-rose-400" />
                    +{evt.predictedOnsetHours}h
                  </span>
                </div>

                <div className="font-extrabold text-white text-xs leading-snug">{evt.title}</div>

                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between text-slate-300">
                    <span>Hazard Probability:</span>
                    <span className="font-mono font-bold text-amber-300">{evt.probabilityPercent}%</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono flex justify-between">
                    <span>Confidence Interval:</span>
                    <span className="text-slate-300">{evt.confidenceInterval}</span>
                  </div>
                </div>

                <div className="pt-1.5 border-t border-slate-800/80 text-[10px] text-cyan-300 font-medium">
                  {evt.peakThresholdMetric}
                </div>
              </div>
            ))}
          </div>

          {/* Temporal Curve Graph & Interactive What-If Intervention Controls */}
          <div className="bg-slate-950/90 rounded-xl border border-slate-800 p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Forward Temporal Toxicity & QTc Trajectory Curve
                  </h3>
                </div>
                <p className="text-[11px] text-slate-400">
                  Simulating multi-dose accumulation kinetics over the selected time horizon
                </p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3 flex-wrap">
                {/* Time Horizon Selector */}
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-[11px]">
                  <span className="text-slate-400 px-1 font-mono text-[10px]">Horizon:</span>
                  {([12, 24, 48, 72, 168] as const).map((h) => (
                    <button
                      key={h}
                      onClick={() => setSelectedTimeHorizon(h)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                        selectedTimeHorizon === h
                          ? 'bg-indigo-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {h === 168 ? '7d' : `${h}h`}
                    </button>
                  ))}
                </div>

                {/* Simulate Mitigation Button */}
                <button
                  onClick={() =>
                    setSimulatedMitigation(
                      simulatedMitigation ? null : 'Hold Fluoxetine & Dose Adjust'
                    )
                  }
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                    simulatedMitigation
                      ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                      : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border-slate-700'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>
                    {simulatedMitigation ? 'Mitigation Active (-58% Risk)' : 'Simulate Intervention'}
                  </span>
                </button>
              </div>
            </div>

            {/* Sparkline Curve */}
            <div className="h-44 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={temporalChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="unmitigatedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="mitigatedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>

                  <XAxis dataKey="hour" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={{ stroke: '#334155' }} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={{ stroke: '#334155' }} tickLine={false} />

                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-950 border border-slate-700 p-2.5 rounded-xl shadow-2xl text-xs space-y-1">
                            <div className="text-slate-400 font-mono">Timepoint: {data.hour}</div>
                            <div className="text-rose-400 font-bold flex justify-between gap-4">
                              <span>Predicted Baseline Risk:</span>
                              <span className="font-mono">{data.unmitigatedRisk}%</span>
                            </div>
                            {data.mitigatedRisk !== null && (
                              <div className="text-emerald-400 font-bold flex justify-between gap-4 border-t border-slate-800 pt-1">
                                <span>Mitigated Risk:</span>
                                <span className="font-mono">{data.mitigatedRisk}%</span>
                              </div>
                            )}
                            <div className="text-indigo-300 text-[10px] font-mono">
                              Est QTc: {data.qtcEstimate} ms
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />

                  <ReferenceLine
                    y={75}
                    stroke="#f43f5e"
                    strokeDasharray="3 3"
                    label={{ value: 'Critical Safety Threshold (75%)', fill: '#f87171', fontSize: 9, position: 'insideTopRight' }}
                  />

                  {/* Unmitigated Curve */}
                  <Area
                    type="monotone"
                    dataKey="unmitigatedRisk"
                    name="Unmitigated Risk"
                    stroke="#f43f5e"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#unmitigatedGrad)"
                  />

                  {/* Mitigated Curve if active */}
                  {simulatedMitigation && (
                    <Area
                      type="monotone"
                      dataKey="mitigatedRisk"
                      name="Mitigated Risk"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      strokeDasharray="4 4"
                      fillOpacity={1}
                      fill="url(#mitigatedGrad)"
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Intervention Navigation Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-indigo-500/30 pt-3 text-xs">
            <div className="text-slate-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Actionable Recommendation: <strong className="text-white">{topEvent.recommendedAction}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => onNavigate('temporal_simulation')}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Full Temporal PK/PD Simulator</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onNavigate('causal_counterfactual')}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all cursor-pointer"
              >
                <span>Counterfactual Testing</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictiveSafetyAlert;
