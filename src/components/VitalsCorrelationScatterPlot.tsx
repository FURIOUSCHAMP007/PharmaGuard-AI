import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  Clock, 
  Filter, 
  Sparkles, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  Info, 
  ScatterChart as ScatterIcon, 
  Sliders, 
  Target, 
  Zap,
  Maximize2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis, 
  CartesianGrid, 
  Tooltip, 
  Cell, 
  ReferenceLine 
} from 'recharts';
import { Patient } from '../types/pharmaguard';

interface VitalsCorrelationScatterPlotProps {
  patient: Patient;
  title?: string;
  subtitle?: string;
}

type VitalMetricKey = 'heartRate' | 'bpSystolic' | 'bpDiastolic' | 'spo2' | 'qtcMs';

interface MetricOption {
  key: VitalMetricKey;
  label: string;
  unit: string;
  minDomain: number;
  maxDomain: number;
  normalMin: number;
  normalMax: number;
  color: string;
}

const METRIC_OPTIONS: Record<VitalMetricKey, MetricOption> = {
  heartRate: {
    key: 'heartRate',
    label: 'Heart Rate',
    unit: 'bpm',
    minDomain: 50,
    maxDomain: 135,
    normalMin: 60,
    normalMax: 100,
    color: '#38bdf8' // Cyan
  },
  bpSystolic: {
    key: 'bpSystolic',
    label: 'Systolic BP',
    unit: 'mmHg',
    minDomain: 90,
    maxDomain: 180,
    normalMin: 90,
    normalMax: 130,
    color: '#f43f5e' // Rose
  },
  bpDiastolic: {
    key: 'bpDiastolic',
    label: 'Diastolic BP',
    unit: 'mmHg',
    minDomain: 50,
    maxDomain: 110,
    normalMin: 60,
    normalMax: 85,
    color: '#fb923c' // Orange
  },
  spo2: {
    key: 'spo2',
    label: 'Oxygen Saturation (SpO₂)',
    unit: '%',
    minDomain: 88,
    maxDomain: 100,
    normalMin: 95,
    normalMax: 100,
    color: '#10b981' // Emerald
  },
  qtcMs: {
    key: 'qtcMs',
    label: 'ECG QTc Interval',
    unit: 'ms',
    minDomain: 380,
    maxDomain: 520,
    normalMin: 380,
    normalMax: 450,
    color: '#a855f7' // Purple
  }
};

interface ScatterPoint {
  id: string;
  timestamp: string;
  hourAgo: number;
  xValue: number;
  yValue: number;
  heartRate: number;
  bpSystolic: number;
  bpDiastolic: number;
  spo2: number;
  qtcMs: number;
  isOutlier: boolean;
  outlierReason?: string;
  notes?: string;
}

export const VitalsCorrelationScatterPlot: React.FC<VitalsCorrelationScatterPlotProps> = ({
  patient,
  title = "Physiological Vitals Correlation & Outlier Matrix",
  subtitle = "Multi-parameter scatter analysis evaluating synchronized telemetry trends, linear dependence, and clinical outliers"
}) => {
  const [xMetricKey, setXMetricKey] = useState<VitalMetricKey>('heartRate');
  const [yMetricKey, setYMetricKey] = useState<VitalMetricKey>('bpSystolic');
  const [timeWindow, setTimeWindow] = useState<24 | 12 | 6>(24);
  const [selectedPoint, setSelectedPoint] = useState<ScatterPoint | null>(null);

  const xOption = METRIC_OPTIONS[xMetricKey];
  const yOption = METRIC_OPTIONS[yMetricKey];

  // Generate 24-hour telemetry data points for patient
  const allTelemetryPoints: ScatterPoint[] = useMemo(() => {
    const baseHR = patient.vitals.heartRate || 76;
    const baseSys = patient.vitals.bpSystolic || 128;
    const baseDia = patient.vitals.bpDiastolic || 82;
    const baseSpo2 = 97;
    const baseQtc = patient.vitals.qtcIntervalMs || 448;

    const points: ScatterPoint[] = [];
    const now = new Date();

    for (let i = 24; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 3600 * 1000);
      const timeStr = i === 0 ? 'Now (14:30)' : d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
      
      // Introduce realistic physiological coupling with slight stochastic variation
      const hr = Math.round(baseHR + Math.sin(i * 0.4) * 14 + (i === 10 ? 28 : (i === 18 ? -18 : (Math.random() * 4 - 2))));
      // Systolic BP often correlates positively with HR during stress/exertion
      const sys = Math.round(baseSys + (hr - baseHR) * 0.6 + Math.cos(i * 0.35) * 8 + (i === 10 ? 24 : (Math.random() * 4 - 2)));
      const dia = Math.round(baseDia + (sys - baseSys) * 0.4 + (Math.random() * 3 - 1.5));
      const spo2Val = Math.min(100, Math.max(90, Math.round(baseSpo2 - (i === 10 ? 4 : (Math.random() * 1.5)))));
      const qtcVal = Math.min(520, Math.max(380, Math.round(baseQtc + (hr > 95 ? -15 : 20) + (i <= 14 && i >= 6 ? 25 : 0) + (i === 3 ? 35 : 0))));

      // Outlier criteria: exceeds normal thresholds for either X or Y
      let isOutlier = false;
      let outlierReason = '';

      if (hr > 100) {
        isOutlier = true;
        outlierReason += 'Sinus Tachycardia (HR > 100); ';
      } else if (hr < 60) {
        isOutlier = true;
        outlierReason += 'Sinus Bradycardia (HR < 60); ';
      }

      if (sys > 140) {
        isOutlier = true;
        outlierReason += 'Stage 2 Hypertension (Sys > 140); ';
      }

      if (qtcVal > 460) {
        isOutlier = true;
        outlierReason += 'Critical QTc Prolongation (> 460ms); ';
      }

      if (spo2Val < 94) {
        isOutlier = true;
        outlierReason += 'Mild Hypoxia (SpO2 < 94%); ';
      }

      points.push({
        id: `pt-${24 - i}`,
        timestamp: timeStr,
        hourAgo: i,
        xValue: 0, // Assigned dynamically below
        yValue: 0, // Assigned dynamically below
        heartRate: hr,
        bpSystolic: sys,
        bpDiastolic: dia,
        spo2: spo2Val,
        qtcMs: qtcVal,
        isOutlier,
        outlierReason: outlierReason ? outlierReason.trim() : undefined,
        notes: i === 10 ? 'Post-medication administration surge & exertion' : (i === 3 ? 'Evening QTc peak during infusion' : undefined)
      });
    }

    return points;
  }, [patient]);

  // Filtered dataset according to time window
  const activePoints = useMemo(() => {
    return allTelemetryPoints
      .filter(p => p.hourAgo <= timeWindow)
      .map(p => ({
        ...p,
        xValue: p[xMetricKey],
        yValue: p[yMetricKey]
      }));
  }, [allTelemetryPoints, timeWindow, xMetricKey, yMetricKey]);

  // Calculate Pearson's Correlation Coefficient (r)
  const correlationAnalysis = useMemo(() => {
    const n = activePoints.length;
    if (n < 2) return { r: 0, interpretation: 'Insufficient Data', strength: 'None' };

    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;

    activePoints.forEach(p => {
      sumX += p.xValue;
      sumY += p.yValue;
      sumXY += p.xValue * p.yValue;
      sumX2 += p.xValue * p.xValue;
      sumY2 += p.yValue * p.yValue;
    });

    const numerator = (n * sumXY) - (sumX * sumY);
    const denominator = Math.sqrt(((n * sumX2) - (sumX * sumX)) * ((n * sumY2) - (sumY * sumY)));

    const r = denominator === 0 ? 0 : numerator / denominator;
    const roundedR = parseFloat(r.toFixed(2));

    let strength = 'No Linear Correlation';
    let dir = roundedR > 0 ? 'Positive' : 'Negative';

    const absR = Math.abs(roundedR);
    if (absR >= 0.7) strength = `Strong ${dir}`;
    else if (absR >= 0.4) strength = `Moderate ${dir}`;
    else if (absR >= 0.2) strength = `Weak ${dir}`;

    let physiologicalMeaning = '';
    if (xMetricKey === 'heartRate' && yMetricKey === 'bpSystolic') {
      physiologicalMeaning = roundedR > 0.4 
        ? 'Preserved sympathetic reflex coupling: higher heart rate directly drives increased systolic pressure.'
        : 'Decoupled hemodynamics: blood pressure changes independently of heart rate variations.';
    } else if (xMetricKey === 'heartRate' && yMetricKey === 'qtcMs') {
      physiologicalMeaning = roundedR < -0.3
        ? 'Expected physiological rate adaptation: QTc interval shortens as heart rate increases.'
        : 'Paradoxical QTc response: QTc fails to adapt appropriately to heart rate changes.';
    } else {
      physiologicalMeaning = `Statistical association between ${xOption.label} and ${yOption.label} across the selected ${timeWindow}-hour telemetry window.`;
    }

    return {
      r: roundedR,
      strength,
      physiologicalMeaning
    };
  }, [activePoints, xMetricKey, yMetricKey, xOption.label, yOption.label, timeWindow]);

  // Outliers Count
  const outlierCount = activePoints.filter(p => p.isOutlier).length;

  // Custom Recharts Tooltip
  const CustomScatterTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: ScatterPoint = payload[0].payload;
      return (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 shadow-2xl text-xs text-slate-100 font-mono space-y-2 z-50 max-w-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-extrabold text-white flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{data.timestamp}</span>
            </span>
            {data.isOutlier && (
              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                Outlier
              </span>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">{xOption.label}:</span>
              <strong style={{ color: xOption.color }}>{data.xValue} {xOption.unit}</strong>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">{yOption.label}:</span>
              <strong style={{ color: yOption.color }}>{data.yValue} {yOption.unit}</strong>
            </div>

            <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-900">
              <span>Full Vitals:</span>
              <span>HR {data.heartRate} | BP {data.bpSystolic}/{data.bpDiastolic}</span>
            </div>
          </div>

          {data.outlierReason && (
            <div className="p-2 rounded-xl bg-rose-950/40 border border-rose-800/60 text-[10px] text-rose-300 font-sans">
              <strong>Alert:</strong> {data.outlierReason}
            </div>
          )}

          {data.notes && (
            <div className="p-2 rounded-xl bg-indigo-950/40 border border-indigo-800/60 text-[10px] text-indigo-200 font-sans">
              <strong>Note:</strong> {data.notes}
            </div>
          )}
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
          <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 shrink-0">
            <ScatterIcon className="w-6 h-6 text-indigo-400" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-extrabold text-white">{title}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                2D Telemetry Scatter
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
          </div>
        </div>

        {/* Time Window Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <Clock className="w-3.5 h-3.5 text-slate-400 ml-2" />
            <span className="text-[11px] font-bold text-slate-400 mr-1">Timeframe:</span>
            {([24, 12, 6] as const).map((win) => (
              <button
                key={win}
                onClick={() => setTimeWindow(win)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  timeWindow === win
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                {win}h
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Axis Selector Control Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs font-mono">
        {/* X-Axis Metric Picker */}
        <div className="space-y-1.5">
          <label className="block text-slate-400 font-bold flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-indigo-300">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span>X-Axis Vital Variable:</span>
            </span>
            <span style={{ color: xOption.color }} className="font-extrabold">
              {xOption.label} ({xOption.unit})
            </span>
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
            {(Object.keys(METRIC_OPTIONS) as VitalMetricKey[]).map((key) => (
              <button
                key={`x-${key}`}
                onClick={() => setXMetricKey(key)}
                className={`px-2 py-1.5 rounded-lg text-[11px] font-extrabold truncate transition-all cursor-pointer ${
                  xMetricKey === key
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {METRIC_OPTIONS[key].label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Y-Axis Metric Picker */}
        <div className="space-y-1.5">
          <label className="block text-slate-400 font-bold flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-cyan-300">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Y-Axis Vital Variable:</span>
            </span>
            <span style={{ color: yOption.color }} className="font-extrabold">
              {yOption.label} ({yOption.unit})
            </span>
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
            {(Object.keys(METRIC_OPTIONS) as VitalMetricKey[]).map((key) => (
              <button
                key={`y-${key}`}
                onClick={() => setYMetricKey(key)}
                className={`px-2 py-1.5 rounded-lg text-[11px] font-extrabold truncate transition-all cursor-pointer ${
                  yMetricKey === key
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {METRIC_OPTIONS[key].label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Analytical Summary Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400">Pearson Correlation (r)</span>
          <div className="text-xl font-extrabold text-cyan-300 flex items-center gap-2">
            <span>{correlationAnalysis.r}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-200 border border-cyan-500/30">
              {correlationAnalysis.strength}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400">Sample Data Points</span>
          <div className="text-xl font-extrabold text-emerald-400">
            {activePoints.length} <span className="text-xs font-normal text-slate-400">Readings ({timeWindow}h)</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400">Outlier Telemetry Points</span>
          <div className="text-xl font-extrabold text-rose-400 flex items-center gap-2">
            <span>{outlierCount} Outliers</span>
            <span className="text-xs font-normal text-slate-400">({Math.round((outlierCount / activePoints.length) * 100)}%)</span>
          </div>
        </div>
      </div>

      {/* Main Scatter Chart Canvas */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-900 pb-2">
          <span className="flex items-center gap-1.5 font-bold text-slate-200">
            <Target className="w-4 h-4 text-indigo-400" />
            <span>{yOption.label} vs. {xOption.label} Telemetry Matrix</span>
          </span>

          <div className="flex items-center gap-4 text-[10px]">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Normal Parameter
            </span>
            <span className="flex items-center gap-1 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span> Anomaly / Outlier
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              
              <XAxis 
                type="number" 
                dataKey="xValue" 
                name={xOption.label} 
                unit={` ${xOption.unit}`}
                domain={[xOption.minDomain, xOption.maxDomain]}
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
              />

              <YAxis 
                type="number" 
                dataKey="yValue" 
                name={yOption.label} 
                unit={` ${yOption.unit}`}
                domain={[yOption.minDomain, yOption.maxDomain]}
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
              />

              <ZAxis type="number" range={[60, 200]} />

              <Tooltip content={<CustomScatterTooltip />} />

              {/* Reference Lines for Normal Threshold Ranges */}
              <ReferenceLine y={yOption.normalMax} stroke="#ef4444" strokeDasharray="4 4" opacity={0.7} label={{ value: `Max Normal Y (${yOption.normalMax})`, fill: '#f87171', fontSize: 9 }} />
              <ReferenceLine x={xOption.normalMax} stroke="#ef4444" strokeDasharray="4 4" opacity={0.7} label={{ value: `Max Normal X (${xOption.normalMax})`, fill: '#f87171', fontSize: 9 }} />

              <Scatter 
                name="Vitals Correlation" 
                data={activePoints} 
                onClick={(pt: any) => setSelectedPoint(pt && pt.payload ? (pt.payload as ScatterPoint) : (pt as ScatterPoint))}
                cursor="pointer"
              >
                {activePoints.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.isOutlier ? '#f43f5e' : (selectedPoint?.id === entry.id ? '#38bdf8' : '#10b981')} 
                    stroke={entry.isOutlier ? '#ffe4e6' : '#0284c7'}
                    strokeWidth={entry.isOutlier ? 2 : 1}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Physiological Context Explanation */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-indigo-300 font-mono font-bold">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Clinical Interpretation & Correlation Context</span>
        </div>
        <p className="text-slate-300 leading-relaxed font-sans">
          {correlationAnalysis.physiologicalMeaning}
        </p>
      </div>

      {/* Selected Outlier Detail Box */}
      {selectedPoint && (
        <div className="p-4 rounded-2xl bg-slate-950 border border-indigo-500/40 text-xs font-mono space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-extrabold text-white flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Selected Telemetry Point: {selectedPoint.timestamp}</span>
            </span>
            <button 
              onClick={() => setSelectedPoint(null)}
              className="text-slate-400 hover:text-white text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800"
            >
              Close Detail
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div>HR: <strong className="text-cyan-300">{selectedPoint.heartRate} bpm</strong></div>
            <div>Blood Pressure: <strong className="text-rose-300">{selectedPoint.bpSystolic}/{selectedPoint.bpDiastolic} mmHg</strong></div>
            <div>SpO₂: <strong className="text-emerald-300">{selectedPoint.spo2}%</strong></div>
            <div>QTc: <strong className="text-purple-300">{selectedPoint.qtcMs} ms</strong></div>
          </div>

          {selectedPoint.outlierReason && (
            <div className="text-rose-300 bg-rose-950/40 p-2.5 rounded-xl border border-rose-800/60 font-sans">
              <strong>Clinical Outlier Flag:</strong> {selectedPoint.outlierReason}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VitalsCorrelationScatterPlot;
