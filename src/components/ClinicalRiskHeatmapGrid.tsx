import React, { useState, useMemo } from 'react';
import { Activity, Flame, Calendar, AlertTriangle, ShieldAlert, Heart, Eye, Filter, Sparkles, Clock, ArrowRight, ChevronRight, CheckCircle2, RefreshCw, Zap, Sliders, Info, Pill } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { Patient } from '../types/pharmaguard';

interface ClinicalRiskHeatmapGridProps {
  patient: Patient;
  title?: string;
  subtitle?: string;
}

export interface HeatmapDayData {
  dayOffset: number; // e.g. -29 to 0
  dateLabel: string;
  dateFull: string;
  riskScore: number; // 0-100
  qtcMs: number; // ms
  egfr: number; // mL/min
  serumK: number; // mEq/L
  bpSystolic: number; // mmHg
  polypharmacyCount: number;
  medEvent?: string;
  severityLevel: 0 | 1 | 2 | 3; // 0: Normal, 1: Mild, 2: Moderate, 3: Critical
}

export const ClinicalRiskHeatmapGrid: React.FC<ClinicalRiskHeatmapGridProps> = ({
  patient,
  title = "30-Day Clinical Risk & Vitals Intensity Heatmap Grid",
  subtitle = "High-density matrix tracking daily longitudinal risk progression, organ impairment, and electrolyte fluctuations"
}) => {
  const [selectedDayOffset, setSelectedDayOffset] = useState<number>(0); // Default to today
  const [viewWindow, setViewWindow] = useState<30 | 14 | 7>(30);
  const [activeMetricFilter, setActiveMetricFilter] = useState<string>('All');
  const [highlightCriticalOnly, setHighlightCriticalOnly] = useState<boolean>(false);

  // Generate 30 days of realistic temporal clinical heatmap data anchored to the active patient
  const heatmapData: HeatmapDayData[] = useMemo(() => {
    const list: HeatmapDayData[] = [];
    const today = new Date();
    const baseRisk = patient.riskScorePercent;
    const baseQtc = patient.vitals.qtcIntervalMs;
    const baseEgfr = patient.kidneyFunction.egfr;

    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dayOffset = -i; // -29 to 0

      // Realistic sine wave fluctuation with critical spikes around -21 and -12
      let riskVal = Math.round(baseRisk - 22 + Math.sin(i * 0.45) * 14 + (30 - i) * 0.6);
      if (i === 21) riskVal = Math.min(96, riskVal + 32); // Polypharmacy added spike
      if (i === 12) riskVal = Math.min(94, riskVal + 28); // QTc spike
      if (i === 0) riskVal = baseRisk; // Today's baseline

      riskVal = Math.min(98, Math.max(12, riskVal));

      const qtcVal = Math.min(525, Math.round(baseQtc - 35 + (riskVal * 0.55)));
      const egfrVal = Math.max(22, Math.round(baseEgfr + 12 - (riskVal * 0.22)));
      const serumKVal = parseFloat((4.3 - (riskVal > 70 ? 0.6 : 0.15) + (Math.sin(i) * 0.15)).toFixed(1));
      const bpVal = Math.round(118 + riskVal * 0.25);
      const medsCount = riskVal > 75 ? 5 : riskVal > 50 ? 4 : 3;

      let medEvent: string | undefined = undefined;
      if (i === 21) medEvent = "Amiodarone 200mg initiated (CYP2D6 conflict)";
      else if (i === 15) medEvent = "Fluoxetine 20mg added to daily regimen";
      else if (i === 12) medEvent = "Serum K+ dropped to 3.4 mEq/L (Hypokalemia alert)";
      else if (i === 5) medEvent = "Amiodarone dose reduced: 200mg -> 100mg";
      else if (i === 0) medEvent = "Today: Baseline EHR Sync & AI Risk Assessment";

      let severityLevel: 0 | 1 | 2 | 3 = 0;
      if (riskVal >= 80 || qtcVal >= 480) severityLevel = 3;
      else if (riskVal >= 60 || qtcVal >= 450) severityLevel = 2;
      else if (riskVal >= 40) severityLevel = 1;

      list.push({
        dayOffset,
        dateLabel: i === 0 ? 'Today' : `-${i}d`,
        dateFull: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        riskScore: riskVal,
        qtcMs: qtcVal,
        egfr: egfrVal,
        serumK: serumKVal,
        bpSystolic: bpVal,
        polypharmacyCount: medsCount,
        medEvent,
        severityLevel
      });
    }
    return list;
  }, [patient]);

  // Filtered dataset according to view window
  const visibleData = useMemo(() => {
    return heatmapData.slice(30 - viewWindow);
  }, [heatmapData, viewWindow]);

  const selectedDay = useMemo(() => {
    return heatmapData.find(d => d.dayOffset === selectedDayOffset) || heatmapData[heatmapData.length - 1];
  }, [heatmapData, selectedDayOffset]);

  // Metric row configurations for heatmap rendering
  const metricRows = [
    {
      id: 'riskScore',
      label: 'Proarrhythmic Risk (%)',
      icon: ShieldAlert,
      unit: '%',
      getValue: (d: HeatmapDayData) => d.riskScore,
      getSeverity: (val: number) => val >= 80 ? 3 : val >= 60 ? 2 : val >= 40 ? 1 : 0,
      formatVal: (val: number) => `${val}%`
    },
    {
      id: 'qtcMs',
      label: 'Cardiac QTc Interval (ms)',
      icon: Heart,
      unit: 'ms',
      getValue: (d: HeatmapDayData) => d.qtcMs,
      getSeverity: (val: number) => val >= 480 ? 3 : val >= 450 ? 2 : val >= 420 ? 1 : 0,
      formatVal: (val: number) => `${val}ms`
    },
    {
      id: 'egfr',
      label: 'Renal eGFR (mL/min)',
      icon: Activity,
      unit: 'mL/min',
      getValue: (d: HeatmapDayData) => d.egfr,
      getSeverity: (val: number) => val < 30 ? 3 : val < 45 ? 2 : val < 60 ? 1 : 0,
      formatVal: (val: number) => `${val}`
    },
    {
      id: 'serumK',
      label: 'Serum Potassium K+ (mEq/L)',
      icon: Zap,
      unit: 'mEq/L',
      getValue: (d: HeatmapDayData) => d.serumK,
      getSeverity: (val: number) => val < 3.5 || val > 5.2 ? 3 : val < 3.8 || val > 5.0 ? 2 : 0,
      formatVal: (val: number) => `${val}`
    },
    {
      id: 'bpSystolic',
      label: 'Systolic Blood Pressure',
      icon: Flame,
      unit: 'mmHg',
      getValue: (d: HeatmapDayData) => d.bpSystolic,
      getSeverity: (val: number) => val >= 150 ? 3 : val >= 135 ? 2 : val >= 125 ? 1 : 0,
      formatVal: (val: number) => `${val}`
    },
    {
      id: 'polypharmacyCount',
      label: 'Active Drug Combinations',
      icon: Pill,
      unit: 'drugs',
      getValue: (d: HeatmapDayData) => d.polypharmacyCount,
      getSeverity: (val: number) => val >= 5 ? 3 : val >= 4 ? 2 : 0,
      formatVal: (val: number) => `${val} Rx`
    }
  ];

  const filteredMetricRows = useMemo(() => {
    if (activeMetricFilter === 'All') return metricRows;
    return metricRows.filter(r => r.id === activeMetricFilter);
  }, [activeMetricFilter]);

  // Color generator for heat cells based on severity level
  const getCellBgClass = (severity: 0 | 1 | 2 | 3, isSelected: boolean) => {
    const border = isSelected ? 'ring-2 ring-cyan-400 scale-105 z-10' : 'border-slate-800/80';
    switch (severity) {
      case 3:
        return `bg-rose-950/90 text-rose-300 border-rose-600/60 ${border} shadow-sm shadow-rose-950/50 font-bold`;
      case 2:
        return `bg-amber-950/80 text-amber-300 border-amber-600/50 ${border}`;
      case 1:
        return `bg-sky-950/60 text-sky-300 border-sky-700/40 ${border}`;
      case 0:
      default:
        return `bg-slate-900/90 text-emerald-400 border-slate-800 ${border}`;
    }
  };

  // Summary counts
  const criticalDaysCount = useMemo(() => heatmapData.filter(d => d.severityLevel === 3).length, [heatmapData]);
  const peakDay = useMemo(() => heatmapData.reduce((prev, curr) => curr.riskScore > prev.riskScore ? curr : prev), [heatmapData]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-start gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0">
            <Flame className="w-6 h-6 animate-pulse text-amber-400" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-extrabold text-white">{title}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                30-Day Matrix Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
          </div>
        </div>

        {/* Quick Stats Badges */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
            <span className="text-slate-400">Critical Days:</span>
            <span className="font-mono font-extrabold text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/30">
              {criticalDaysCount} Days
            </span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
            <span className="text-slate-400">Peak Risk:</span>
            <span className="font-mono font-extrabold text-amber-300">
              {peakDay.riskScore}% ({peakDay.dateLabel})
            </span>
          </div>
        </div>
      </div>

      {/* Toolbar Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs">
        {/* Time Window Segment */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            Time Horizon
          </label>
          <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
            {([30, 14, 7] as const).map((win) => (
              <button
                key={win}
                onClick={() => setViewWindow(win)}
                className={`py-1 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                  viewWindow === win ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {win} Days
              </button>
            ))}
          </div>
        </div>

        {/* Metric Focus Selector */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-purple-400" />
            Focus Metric
          </label>
          <select
            value={activeMetricFilter}
            onChange={(e) => setActiveMetricFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="All">All 6 Parameters (Full Matrix)</option>
            <option value="riskScore">Proarrhythmic Risk (%)</option>
            <option value="qtcMs">Cardiac QTc (ms)</option>
            <option value="egfr">Renal eGFR (mL/min)</option>
            <option value="serumK">Serum Potassium K+</option>
            <option value="bpSystolic">Systolic Blood Pressure</option>
            <option value="polypharmacyCount">Active Rx Load</option>
          </select>
        </div>

        {/* Highlight Outliers Toggle */}
        <div className="space-y-1 flex flex-col justify-end">
          <button
            onClick={() => setHighlightCriticalOnly(!highlightCriticalOnly)}
            className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 border cursor-pointer ${
              highlightCriticalOnly
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-sm'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${highlightCriticalOnly ? 'text-rose-400' : 'text-slate-400'}`} />
            <span>{highlightCriticalOnly ? 'Showing Critical Outliers' : 'Highlight Critical Outliers'}</span>
          </button>
        </div>
      </div>

      {/* Heatmap Grid Matrix */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-3 overflow-x-auto">
        <div className="min-w-[720px] space-y-2">
          {/* Days Header Row */}
          <div className="grid grid-cols-[180px_1fr] gap-2 items-center text-[10px] font-mono text-slate-400 border-b border-slate-800/80 pb-2">
            <div className="font-bold text-slate-300">Clinical Parameter</div>
            <div className={`grid gap-1`} style={{ gridTemplateColumns: `repeat(${visibleData.length}, minmax(0, 1fr))` }}>
              {visibleData.map((d) => (
                <button
                  key={d.dayOffset}
                  onClick={() => setSelectedDayOffset(d.dayOffset)}
                  className={`text-center py-1 rounded transition-all cursor-pointer font-bold ${
                    d.dayOffset === selectedDayOffset
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : d.severityLevel === 3
                      ? 'text-rose-400 font-extrabold'
                      : 'hover:text-slate-200'
                  }`}
                >
                  {d.dateLabel}
                </button>
              ))}
            </div>
          </div>

          {/* Metric Rows */}
          {filteredMetricRows.map((row) => {
            const RowIcon = row.icon;
            return (
              <div key={row.id} className="grid grid-cols-[180px_1fr] gap-2 items-center text-xs">
                {/* Row Label */}
                <div className="flex items-center gap-2 font-bold text-slate-300 truncate pr-2">
                  <RowIcon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate">{row.label}</span>
                </div>

                {/* Heatmap Cells */}
                <div className={`grid gap-1`} style={{ gridTemplateColumns: `repeat(${visibleData.length}, minmax(0, 1fr))` }}>
                  {visibleData.map((day) => {
                    const rawVal = row.getValue(day);
                    const severity = row.getSeverity(rawVal);
                    const isSelected = day.dayOffset === selectedDayOffset;
                    const isMuted = highlightCriticalOnly && severity < 2;

                    return (
                      <div
                        key={`${row.id}-${day.dayOffset}`}
                        onClick={() => setSelectedDayOffset(day.dayOffset)}
                        className={`h-9 rounded-md border flex items-center justify-center font-mono text-[10px] cursor-pointer transition-all duration-150 relative group ${
                          isMuted ? 'opacity-20 border-slate-900 bg-slate-950' : getCellBgClass(severity, isSelected)
                        }`}
                        title={`${row.label} on ${day.dateFull}: ${row.formatVal(rawVal)}`}
                      >
                        {/* Event Dot Marker */}
                        {day.medEvent && row.id === 'riskScore' && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 border border-slate-950"></span>
                        )}

                        <span className="truncate px-0.5">{row.formatVal(rawVal)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] font-mono text-slate-400 border-t border-slate-800/80 pt-2.5">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-950 border border-slate-800"></span> Normal/Optimal
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-sky-950 border border-sky-700/40"></span> Low Hazard
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-950 border border-amber-600/50"></span> Moderate Hazard
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-rose-950 border border-rose-600/60"></span> Critical Hazard
            </span>
          </div>

          <div className="flex items-center gap-1 text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span>Blue Dot = Clinical Intervention / Dose Adjustment</span>
          </div>
        </div>
      </div>

      {/* Selected Day Clinical Detail Drawer Panel */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">
              Selected Day Profile: <span className="text-cyan-300">{selectedDay.dateFull}</span> ({selectedDay.dateLabel})
            </h3>
          </div>

          <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold border ${
            selectedDay.severityLevel === 3
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              : selectedDay.severityLevel === 2
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
          }`}>
            Status: {selectedDay.severityLevel === 3 ? 'Critical Risk' : selectedDay.severityLevel === 2 ? 'Elevated Alert' : 'Stable'}
          </span>
        </div>

        {/* Vitals Snapshot Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[10px] text-slate-400 font-mono">Proarrhythmic Risk</div>
            <div className={`font-mono font-extrabold text-sm mt-0.5 ${
              selectedDay.riskScore >= 80 ? 'text-rose-400' : selectedDay.riskScore >= 60 ? 'text-amber-300' : 'text-emerald-400'
            }`}>
              {selectedDay.riskScore}%
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[10px] text-slate-400 font-mono">Cardiac QTc</div>
            <div className={`font-mono font-extrabold text-sm mt-0.5 ${
              selectedDay.qtcMs >= 480 ? 'text-rose-400' : selectedDay.qtcMs >= 450 ? 'text-amber-300' : 'text-cyan-300'
            }`}>
              {selectedDay.qtcMs} ms
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[10px] text-slate-400 font-mono">Renal eGFR</div>
            <div className={`font-mono font-extrabold text-sm mt-0.5 ${
              selectedDay.egfr < 45 ? 'text-amber-300' : 'text-emerald-300'
            }`}>
              {selectedDay.egfr} mL/min
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[10px] text-slate-400 font-mono">Serum K+</div>
            <div className={`font-mono font-extrabold text-sm mt-0.5 ${
              selectedDay.serumK < 3.5 ? 'text-rose-400' : 'text-slate-200'
            }`}>
              {selectedDay.serumK} mEq/L
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[10px] text-slate-400 font-mono">Systolic BP</div>
            <div className="font-mono font-extrabold text-sm text-slate-200 mt-0.5">
              {selectedDay.bpSystolic} mmHg
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[10px] text-slate-400 font-mono">Rx Combinations</div>
            <div className="font-mono font-extrabold text-sm text-purple-300 mt-0.5">
              {selectedDay.polypharmacyCount} Active
            </div>
          </div>
        </div>

        {/* Clinical Event Banner if present */}
        {selectedDay.medEvent ? (
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-200 flex items-center gap-2 font-medium">
            <Pill className="w-4 h-4 text-cyan-400 shrink-0" />
            <span><strong>Regimen Event ({selectedDay.dateLabel}):</strong> {selectedDay.medEvent}</span>
          </div>
        ) : (
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>No specific medication dose adjustments recorded for this date. Regimen maintained.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClinicalRiskHeatmapGrid;
