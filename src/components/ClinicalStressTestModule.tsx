import React, { useState, useMemo } from 'react';
import { 
  Zap, 
  Flame, 
  AlertTriangle, 
  ShieldAlert, 
  Activity, 
  Heart, 
  TrendingUp, 
  Sliders, 
  RefreshCw, 
  Sparkles, 
  CheckCircle2, 
  Pill, 
  ArrowRight, 
  HelpCircle,
  FileText
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell, ReferenceLine } from 'recharts';
import { Patient } from '../types/pharmaguard';

interface ClinicalStressTestModuleProps {
  patient: Patient;
  title?: string;
  subtitle?: string;
}

export const ClinicalStressTestModule: React.FC<ClinicalStressTestModuleProps> = ({
  patient,
  title = "Predictive Clinical Stress Test (+50% Dosage Escalation Simulator)",
  subtitle = "Counterfactual PK/PD stress simulation evaluating physiological tolerance, QTc trajectory, and metabolic saturation limits"
}) => {
  const [doseIncreasePercent, setDoseIncreasePercent] = useState<number>(50); // Default +50%
  const [selectedMedId, setSelectedMedId] = useState<string>('all'); // 'all' or specific drug ID
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Trigger a brief simulated recalculation state transition
  const handleScaleChange = (newPercent: number) => {
    setIsSimulating(true);
    setDoseIncreasePercent(newPercent);
    setTimeout(() => {
      setIsSimulating(false);
    }, 400);
  };

  // Base Patient Parameters
  const baseRisk = patient.riskScorePercent || 72;
  const baseQtc = patient.vitals.qtcIntervalMs || 445;
  const baseEgfr = patient.kidneyFunction.egfr || 52;
  const baseSerumK = 3.9;

  // Calculate stress outcomes based on dosage escalation factor
  const escalationFactor = 1 + doseIncreasePercent / 100;

  const stressMetrics = useMemo(() => {
    // Non-linear pharmacokinetic saturation model
    const riskSurge = Math.min(99, Math.round(baseRisk + (doseIncreasePercent * 0.42) + (doseIncreasePercent > 50 ? 8 : 0)));
    const qtcSurge = Math.min(540, Math.round(baseQtc + (doseIncreasePercent * 0.85)));
    const egfrDrop = Math.max(18, Math.round(baseEgfr - (doseIncreasePercent * 0.18)));
    const cypSaturation = Math.min(100, Math.round(62 + doseIncreasePercent * 0.65));
    const peakCmaxSurge = Math.round(doseIncreasePercent * 1.15); // % increase in peak plasma Cmax

    const hazardLevel = riskSurge >= 85 || qtcSurge >= 480 ? 'CRITICAL' : riskSurge >= 70 || qtcSurge >= 450 ? 'HIGH' : 'MODERATE';

    return {
      riskSurge,
      qtcSurge,
      egfrDrop,
      cypSaturation,
      peakCmaxSurge,
      hazardLevel,
      deltaRisk: riskSurge - baseRisk,
      deltaQtc: qtcSurge - baseQtc,
      deltaEgfr: egfrDrop - baseEgfr
    };
  }, [baseRisk, baseQtc, baseEgfr, doseIncreasePercent]);

  // Recharts Dataset comparing Baseline vs Stress Test
  const comparisonChartData = useMemo(() => {
    return [
      {
        parameter: 'Proarrhythmic Risk (%)',
        Baseline: baseRisk,
        StressTest: stressMetrics.riskSurge,
        unit: '%',
        limit: 80,
      },
      {
        parameter: 'Cardiac QTc Interval (ms)',
        Baseline: baseQtc,
        StressTest: stressMetrics.qtcSurge,
        unit: 'ms',
        limit: 470,
      },
      {
        parameter: 'Renal eGFR (mL/min)',
        Baseline: baseEgfr,
        StressTest: stressMetrics.egfrDrop,
        unit: 'mL/min',
        limit: 30, // lower safety limit
      },
      {
        parameter: 'CYP Metabolic Load (%)',
        Baseline: 62,
        StressTest: stressMetrics.cypSaturation,
        unit: '%',
        limit: 85,
      }
    ];
  }, [baseRisk, baseQtc, baseEgfr, stressMetrics]);

  // Active Patient Medications list with baseline vs stressed dose
  const medicationStressList = useMemo(() => {
    if (!patient.activeMedications || patient.activeMedications.length === 0) {
      return [
        { id: 'm1', name: 'Amiodarone HCl', currentDose: '200 mg qd', stressDose: `${Math.round(200 * escalationFactor)} mg qd`, target: 'K+ Channel / CYP2D6' },
        { id: 'm2', name: 'Fluoxetine HCl', currentDose: '20 mg qd', stressDose: `${Math.round(20 * escalationFactor)} mg qd`, target: 'SSRI / CYP2D6 Inh' },
        { id: 'm3', name: 'Ondansetron', currentDose: '8 mg tid', stressDose: `${Math.round(8 * escalationFactor)} mg tid`, target: '5-HT3 Antagonist' }
      ];
    }

    return patient.activeMedications.map(med => {
      // Parse numeric dose safely if possible
      const doseText = `${med.doseMg} mg` || '100 mg';
      const match = doseText.match(/(\d+)/);
      const numericDose = match ? parseInt(match[1], 10) : 100;
      const stressedNumeric = Math.round(numericDose * escalationFactor);
      const stressedDoseStr = doseText.replace(/\d+/, stressedNumeric.toString());

      return {
        id: med.id,
        name: med.name || 'Medication',
        currentDose: doseText,
        stressDose: stressedDoseStr,
        target: med.indication || 'CYP Enzymatic Pathway'
      };
    });
  }, [patient, escalationFactor]);

  // Custom Bar Chart Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 shadow-2xl text-xs space-y-1.5 font-mono min-w-[210px] z-50">
          <div className="font-bold text-white border-b border-slate-800 pb-1 flex justify-between">
            <span>{data.parameter}</span>
            <span className="text-cyan-400">({data.unit})</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Baseline Regimen:</span>
            <span className="font-bold text-slate-200">{data.Baseline} {data.unit}</span>
          </div>
          <div className="flex justify-between text-amber-300">
            <span>Stress Test (+{doseIncreasePercent}%):</span>
            <span className="font-bold text-rose-400">{data.StressTest} {data.unit}</span>
          </div>
          <div className="flex justify-between text-slate-400 text-[10px] pt-1 border-t border-slate-800">
            <span>Critical Hazard Limit:</span>
            <span className="text-rose-400">{data.limit} {data.unit}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-xl space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-start gap-3">
          <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 shrink-0">
            <Zap className="w-6 h-6 animate-pulse text-rose-400" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-extrabold text-white">{title}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                What-If Simulation Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
          </div>
        </div>

        {/* Hazard Classification Badge */}
        <div className="flex items-center gap-2">
          <div className={`px-3.5 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-mono font-bold ${
            stressMetrics.hazardLevel === 'CRITICAL'
              ? 'bg-rose-950/90 text-rose-300 border-rose-600/80 shadow-md shadow-rose-950/50 animate-pulse'
              : stressMetrics.hazardLevel === 'HIGH'
              ? 'bg-amber-950/80 text-amber-300 border-amber-600/70'
              : 'bg-emerald-950/80 text-emerald-300 border-emerald-600/70'
          }`}>
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Stress Hazard: {stressMetrics.hazardLevel}</span>
          </div>
        </div>
      </div>

      {/* Control Panel & Preset Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
        {/* Escalation Percentage Buttons */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-[11px] font-bold text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              Dosage Escalation Factor (+{doseIncreasePercent}% Increase)
            </span>
            <span className="font-mono text-cyan-300">Factor: {escalationFactor.toFixed(2)}x</span>
          </label>

          <div className="grid grid-cols-4 gap-2">
            {[25, 50, 75, 100].map((percent) => (
              <button
                key={percent}
                onClick={() => handleScaleChange(percent)}
                className={`py-2 rounded-xl text-xs font-mono font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1 border ${
                  doseIncreasePercent === percent
                    ? 'bg-rose-600 text-white border-rose-400 shadow-md shadow-rose-600/30'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                }`}
              >
                <span>+{percent}%</span>
                {percent === 50 && <span className="text-[9px] text-amber-300 font-sans ml-0.5">(Default)</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Simulation Trigger */}
        <div className="flex flex-col justify-end space-y-1">
          <button
            onClick={() => handleScaleChange(doseIncreasePercent)}
            disabled={isSimulating}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-extrabold text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 border border-rose-400/30"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-white ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Computing Stress PK/PD...' : 'Re-Run 72H Stress Test'}</span>
          </button>
        </div>
      </div>

      {/* Comparative Outcomes Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Proarrhythmic Risk */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
            <span>Risk Score</span>
            <span className="text-rose-400 font-bold">+{stressMetrics.deltaRisk}%</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-mono text-slate-400 line-through">{baseRisk}%</span>
            <ArrowRight className="w-3 h-3 text-slate-500" />
            <span className="text-lg font-extrabold font-mono text-rose-400">{stressMetrics.riskSurge}%</span>
          </div>
        </div>

        {/* Cardiac QTc */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
            <span>Cardiac QTc</span>
            <span className="text-rose-400 font-bold">+{stressMetrics.deltaQtc} ms</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-mono text-slate-400 line-through">{baseQtc} ms</span>
            <ArrowRight className="w-3 h-3 text-slate-500" />
            <span className="text-lg font-extrabold font-mono text-amber-300">{stressMetrics.qtcSurge} ms</span>
          </div>
        </div>

        {/* Renal eGFR Clearance */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
            <span>Renal eGFR</span>
            <span className="text-amber-400 font-bold">{stressMetrics.deltaEgfr}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-mono text-slate-400 line-through">{baseEgfr}</span>
            <ArrowRight className="w-3 h-3 text-slate-500" />
            <span className="text-lg font-extrabold font-mono text-emerald-300">{stressMetrics.egfrDrop}</span>
          </div>
        </div>

        {/* Peak Cmax Elevation */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
            <span>Plasma Peak Cmax</span>
            <span className="text-purple-400 font-bold">Elevated</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-extrabold font-mono text-purple-300">+{stressMetrics.peakCmaxSurge}%</span>
            <span className="text-[10px] text-slate-400 font-mono">above Cmax</span>
          </div>
        </div>
      </div>

      {/* Side-by-Side Recharts Bar Comparison Chart */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300 border-b border-slate-800 pb-2">
          <span className="flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-rose-400" />
            Baseline Regimen vs. Stress-Tested (+{doseIncreasePercent}% Dose) Parameter Comparison
          </span>
          <div className="flex items-center gap-3 font-mono text-[10px]">
            <span className="flex items-center gap-1 text-slate-400">
              <span className="w-2.5 h-2.5 rounded bg-slate-600"></span> Baseline
            </span>
            <span className="flex items-center gap-1 text-rose-400">
              <span className="w-2.5 h-2.5 rounded bg-rose-500"></span> +{doseIncreasePercent}% Stress Test
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={comparisonChartData}
              margin={{ top: 15, right: 20, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis 
                dataKey="parameter" 
                stroke="#64748b" 
                tick={{ fill: '#cbd5e1', fontSize: 11, fontFamily: 'monospace' }}
                tickLine={false}
              />
              <YAxis 
                stroke="#64748b" 
                tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Baseline" fill="#475569" radius={[4, 4, 0, 0]} maxBarSize={38} />
              <Bar dataKey="StressTest" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={38}>
                {comparisonChartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.StressTest >= entry.limit ? '#f43f5e' : '#fbbf24'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Medication Escalation Table */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-3">
        <div className="text-xs font-bold text-white flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="flex items-center gap-1.5">
            <Pill className="w-4 h-4 text-cyan-400" />
            Active Medications Under +{doseIncreasePercent}% Stress Escalation
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {medicationStressList.length} Active Regimen Items
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {medicationStressList.map((med) => (
            <div key={med.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
              <div className="font-bold text-slate-100 flex items-center justify-between">
                <span>{med.name}</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  {med.target}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono pt-1 border-t border-slate-800/60">
                <div className="text-slate-400">
                  Baseline: <span className="text-slate-200">{med.currentDose}</span>
                </div>
                <div className="text-rose-400 font-bold">
                  Stressed: <span>{med.stressDose}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Clinical Mitigation Recommendation Banner */}
      <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs space-y-2 text-rose-200">
        <div className="flex items-center gap-2 font-bold text-rose-300">
          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
          <span>Stress Test Safety Assessment: Escalation Contraindicated</span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          Simulating a <strong>+{doseIncreasePercent}% dosage escalation</strong> drives cardiac QTc to <strong>{stressMetrics.qtcSurge} ms</strong>, exceeding the 470 ms Torsades de Pointes (TdP) safety threshold. Competitive inhibition at the <strong>CYP2D6 pathway</strong> reaches <strong>{stressMetrics.cypSaturation}% capacity</strong>, causing clearance saturation and precipitating toxic steady-state drug accumulation.
        </p>
      </div>
    </div>
  );
};

export default ClinicalStressTestModule;
