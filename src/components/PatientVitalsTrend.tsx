import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  Heart, 
  Flame, 
  Zap, 
  Clock, 
  Filter, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  Sparkles, 
  Info,
  Droplet,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend, 
  ReferenceLine 
} from 'recharts';
import { Patient } from '../types/pharmaguard';

interface PatientVitalsTrendProps {
  patient: Patient;
  title?: string;
  subtitle?: string;
}

export interface HourlyVitalPoint {
  timeLabel: string; // e.g. "08:00", "-16h"
  hourOffset: number; // -24 to 0
  heartRate: number; // bpm
  bpSystolic: number; // mmHg
  bpDiastolic: number; // mmHg
  spo2: number; // %
  qtcMs: number; // ms
  isAlert?: boolean;
  alertMsg?: string;
}

export const PatientVitalsTrend: React.FC<PatientVitalsTrendProps> = ({
  patient,
  title = "24-Hour Continuous Vital Signs Trend",
  subtitle = "Real-time telemetry tracking heart rate, blood pressure dynamics, oxygen saturation, and cardiac QTc trajectory"
}) => {
  const [timeWindow, setTimeWindow] = useState<24 | 12 | 6>(24);
  const [visibleLines, setVisibleLines] = useState<{
    heartRate: boolean;
    bpSystolic: boolean;
    bpDiastolic: boolean;
    spo2: boolean;
    qtcMs: boolean;
  }>({
    heartRate: true,
    bpSystolic: true,
    bpDiastolic: true,
    spo2: true,
    qtcMs: true,
  });

  // Generate realistic 24-hour hourly trend data anchored to active patient vitals
  const vitals24hData: HourlyVitalPoint[] = useMemo(() => {
    const list: HourlyVitalPoint[] = [];
    const baseHR = patient.vitals.heartRate || 74;
    const baseSys = patient.vitals.bpSystolic || 128;
    const baseDia = patient.vitals.bpDiastolic || 82;
    const baseSpo2 = 97;
    const baseQtc = patient.vitals.qtcIntervalMs || 440;

    const now = new Date();

    for (let i = 24; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 3600 * 1000);
      const hourStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
      
      // Circadian & drug interaction fluctuations
      // Spike at -14h (medication dose intake) and -6h
      const spikeFactor = (i === 14 ? 1.25 : i === 6 ? 1.15 : 1.0) + (Math.sin(i * 0.5) * 0.08);
      
      const hr = Math.min(130, Math.max(55, Math.round(baseHR * (0.9 + Math.sin(i * 0.4) * 0.12 * spikeFactor))));
      const sys = Math.min(170, Math.max(95, Math.round(baseSys * (0.92 + Math.cos(i * 0.35) * 0.1 * spikeFactor))));
      const dia = Math.min(105, Math.max(60, Math.round(baseDia * (0.92 + Math.cos(i * 0.35) * 0.08))));
      
      // SpO2 drops slightly during peak HR/QTc spikes
      const spo2Val = Math.min(100, Math.max(90, Math.round(baseSpo2 - (i === 14 ? 3 : i === 6 ? 2 : Math.floor(Math.sin(i) * 1.5)))));
      
      // QTc interval prolongation peak matching the medication administration at -14h
      const qtcVal = Math.min(520, Math.max(390, Math.round(baseQtc - 20 + (i <= 14 && i >= 4 ? 35 * Math.exp(-(14 - i) / 5) : 0) + (Math.sin(i) * 8))));

      let isAlert = false;
      let alertMsg: string | undefined = undefined;

      if (qtcVal >= 470) {
        isAlert = true;
        alertMsg = `Critical QTc Prolongation (${qtcVal} ms)`;
      } else if (spo2Val < 94) {
        isAlert = true;
        alertMsg = `Desaturation Event (SpO2 ${spo2Val}%)`;
      } else if (sys >= 145) {
        isAlert = true;
        alertMsg = `Systolic Spike (${sys} mmHg)`;
      }

      list.push({
        timeLabel: i === 0 ? 'Now' : hourStr,
        hourOffset: -i,
        heartRate: hr,
        bpSystolic: sys,
        bpDiastolic: dia,
        spo2: spo2Val,
        qtcMs: qtcVal,
        isAlert,
        alertMsg
      });
    }

    return list;
  }, [patient]);

  // Filter dataset by selected time window (24h, 12h, 6h)
  const filteredData = useMemo(() => {
    return vitals24hData.slice(vitals24hData.length - timeWindow - 1);
  }, [vitals24hData, timeWindow]);

  // Latest Vital Readings
  const latest = vitals24hData[vitals24hData.length - 1];

  // CSV Export Handler
  const handleDownloadVitalsCSV = () => {
    const headers = [
      'Timestamp',
      'Patient Name',
      'MRN',
      'Heart Rate (bpm)',
      'Systolic BP (mmHg)',
      'Diastolic BP (mmHg)',
      'SpO2 (%)',
      'QTc Interval (ms)',
      'Alert Status'
    ];

    const rows = filteredData.map(v => [
      v.timeLabel,
      `"${patient.name}"`,
      `"${patient.mrn}"`,
      v.heartRate,
      v.bpSystolic,
      v.bpDiastolic,
      v.spo2,
      v.qtcMs,
      v.isAlert ? `"${v.alertMsg}"` : 'Normal'
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${patient.name.replace(/\s+/g, '_')}_Vitals_Telemetry_${timeWindow}h.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleLine = (key: keyof typeof visibleLines) => {
    setVisibleLines(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint: HourlyVitalPoint = payload[0].payload;
      return (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 shadow-2xl text-xs space-y-2 min-w-[200px] z-50">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-mono font-bold text-cyan-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              Time: {dataPoint.timeLabel}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              ({dataPoint.hourOffset === 0 ? 'Current' : `${dataPoint.hourOffset}h ago`})
            </span>
          </div>

          <div className="space-y-1.5 font-mono text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-rose-400 flex items-center gap-1">
                <Heart className="w-3 h-3" /> Heart Rate:
              </span>
              <span className="font-bold text-white">{dataPoint.heartRate} bpm</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-amber-400 flex items-center gap-1">
                <Flame className="w-3 h-3" /> Blood Pressure:
              </span>
              <span className="font-bold text-white">{dataPoint.bpSystolic} / {dataPoint.bpDiastolic} mmHg</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-emerald-400 flex items-center gap-1">
                <Droplet className="w-3 h-3" /> Oxygen SpO2:
              </span>
              <span className="font-bold text-white">{dataPoint.spo2}%</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-purple-400 flex items-center gap-1">
                <Zap className="w-3 h-3" /> Cardiac QTc:
              </span>
              <span className="font-bold text-white">{dataPoint.qtcMs} ms</span>
            </div>
          </div>

          {dataPoint.isAlert && (
            <div className="p-2 rounded-lg bg-rose-500/20 border border-rose-500/40 text-[10px] text-rose-300 flex items-center gap-1.5 font-sans font-bold">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>{dataPoint.alertMsg}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-start gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 shrink-0">
            <Activity className="w-6 h-6 text-indigo-400 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-extrabold text-white">{title}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                24H Continuous Telemetry
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Time Horizon Selector */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <Clock className="w-3.5 h-3.5 text-slate-400 ml-2" />
            <span className="text-[11px] font-bold text-slate-400 mr-1">Window:</span>
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

          {/* Download Vitals CSV Button */}
          <button
            onClick={handleDownloadVitalsCSV}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-extrabold text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer"
            title="Export 24H Vitals Telemetry (HR, BP, SpO2, QTc) to CSV"
          >
            <Download className="w-4 h-4 text-white" />
            <span>Download Vitals CSV</span>
          </button>
        </div>
      </div>

      {/* Vital Metric Summary Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Heart Rate */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1 text-rose-400 font-bold">
              <Heart className="w-3.5 h-3.5" /> Heart Rate
            </span>
            <span className="text-[10px] bg-rose-500/10 text-rose-300 px-1.5 py-0.5 rounded border border-rose-500/20">
              bpm
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-extrabold font-mono text-white">{latest.heartRate}</span>
            <span className="text-[11px] text-slate-400 font-mono">
              (Avg: {Math.round(vitals24hData.reduce((a, b) => a + b.heartRate, 0) / 25)})
            </span>
          </div>
        </div>

        {/* Blood Pressure */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1 text-amber-400 font-bold">
              <Flame className="w-3.5 h-3.5" /> Systolic / Dia
            </span>
            <span className="text-[10px] bg-amber-500/10 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/20">
              mmHg
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-extrabold font-mono text-white">
              {latest.bpSystolic}/{latest.bpDiastolic}
            </span>
          </div>
        </div>

        {/* SpO2 */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <Droplet className="w-3.5 h-3.5" /> Oxygen SpO2
            </span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/20">
              %
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-xl font-extrabold font-mono ${latest.spo2 < 95 ? 'text-amber-300' : 'text-emerald-400'}`}>
              {latest.spo2}%
            </span>
            <span className="text-[10px] text-slate-400">Target ≥95%</span>
          </div>
        </div>

        {/* Cardiac QTc */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1 text-purple-400 font-bold">
              <Zap className="w-3.5 h-3.5" /> QTc Interval
            </span>
            <span className="text-[10px] bg-purple-500/10 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/20">
              ms
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-xl font-extrabold font-mono ${latest.qtcMs >= 470 ? 'text-rose-400' : 'text-purple-300'}`}>
              {latest.qtcMs} ms
            </span>
            <span className="text-[10px] text-slate-400">TdP Limit &gt;470</span>
          </div>
        </div>
      </div>

      {/* Interactive Parameter Visibility Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400 font-bold">
          <Filter className="w-3.5 h-3.5 text-indigo-400" />
          <span>Telemetry Streams:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Heart Rate Toggle */}
          <button
            onClick={() => toggleLine('heartRate')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
              visibleLines.heartRate
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-sm'
                : 'bg-slate-900 text-slate-500 border-slate-800 opacity-60'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            Heart Rate (bpm)
          </button>

          {/* Systolic BP Toggle */}
          <button
            onClick={() => toggleLine('bpSystolic')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
              visibleLines.bpSystolic
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                : 'bg-slate-900 text-slate-500 border-slate-800 opacity-60'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            Systolic BP (mmHg)
          </button>

          {/* Diastolic BP Toggle */}
          <button
            onClick={() => toggleLine('bpDiastolic')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
              visibleLines.bpDiastolic
                ? 'bg-orange-500/20 text-orange-300 border-orange-500/50 shadow-sm'
                : 'bg-slate-900 text-slate-500 border-slate-800 opacity-60'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-orange-400"></span>
            Diastolic BP
          </button>

          {/* SpO2 Toggle */}
          <button
            onClick={() => toggleLine('spo2')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
              visibleLines.spo2
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
                : 'bg-slate-900 text-slate-500 border-slate-800 opacity-60'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            SpO2 (%)
          </button>

          {/* QTc Interval Toggle */}
          <button
            onClick={() => toggleLine('qtcMs')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
              visibleLines.qtcMs
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-sm'
                : 'bg-slate-900 text-slate-500 border-slate-800 opacity-60'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            QTc Interval (ms)
          </button>
        </div>
      </div>

      {/* Multi-Line Recharts Telemetry Graph */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={filteredData}
              margin={{ top: 15, right: 20, left: -15, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              
              <XAxis 
                dataKey="timeLabel" 
                stroke="#64748b" 
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                tickLine={false}
              />
              
              <YAxis 
                yAxisId="vitals"
                domain={[50, 180]} 
                stroke="#64748b" 
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                tickLine={false}
              />

              <YAxis 
                yAxisId="qtc"
                orientation="right"
                domain={[350, 520]} 
                stroke="#a855f7" 
                tick={{ fill: '#c084fc', fontSize: 10, fontFamily: 'monospace' }}
                tickLine={false}
                hide={!visibleLines.qtcMs}
              />

              <Tooltip content={<CustomTooltip />} />

              {/* Threshold Lines */}
              {visibleLines.qtcMs && (
                <ReferenceLine yAxisId="qtc" y={470} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: 'QTc Hazard (470ms)', fill: '#f43f5e', fontSize: 10, position: 'top' }} />
              )}
              {visibleLines.bpSystolic && (
                <ReferenceLine yAxisId="vitals" y={140} stroke="#fbbf24" strokeDasharray="3 3" label={{ value: 'BP Systolic High (140)', fill: '#fbbf24', fontSize: 9, position: 'insideTopLeft' }} />
              )}

              {/* Lines */}
              {visibleLines.heartRate && (
                <Line
                  yAxisId="vitals"
                  type="monotone"
                  dataKey="heartRate"
                  name="Heart Rate (bpm)"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#f43f5e' }}
                  activeDot={{ r: 6, stroke: '#fda4af', strokeWidth: 2 }}
                />
              )}

              {visibleLines.bpSystolic && (
                <Line
                  yAxisId="vitals"
                  type="monotone"
                  dataKey="bpSystolic"
                  name="Systolic BP (mmHg)"
                  stroke="#fbbf24"
                  strokeWidth={2}
                  dot={{ r: 2.5, fill: '#fbbf24' }}
                  activeDot={{ r: 5, stroke: '#fde047', strokeWidth: 2 }}
                />
              )}

              {visibleLines.bpDiastolic && (
                <Line
                  yAxisId="vitals"
                  type="monotone"
                  dataKey="bpDiastolic"
                  name="Diastolic BP (mmHg)"
                  stroke="#fb923c"
                  strokeWidth={1.8}
                  strokeDasharray="4 2"
                  dot={{ r: 2, fill: '#fb923c' }}
                />
              )}

              {visibleLines.spo2 && (
                <Line
                  yAxisId="vitals"
                  type="monotone"
                  dataKey="spo2"
                  name="SpO2 (%)"
                  stroke="#34d399"
                  strokeWidth={2}
                  dot={{ r: 2.5, fill: '#34d399' }}
                />
              )}

              {visibleLines.qtcMs && (
                <Line
                  yAxisId="qtc"
                  type="monotone"
                  dataKey="qtcMs"
                  name="Cardiac QTc (ms)"
                  stroke="#c084fc"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#c084fc' }}
                  activeDot={{ r: 6, stroke: '#e9d5ff', strokeWidth: 2 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Telemetry Legend & Note */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 pt-3 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-1 text-slate-300">
            <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Continuous EHR ICU Bedside Monitor Feed • Sync Interval: 1 hr</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span> HR
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span> BP Sys
            </span>
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span> SpO2
            </span>
            <span className="flex items-center gap-1 text-purple-400">
              <span className="w-2 h-2 rounded-full bg-purple-400"></span> QTc
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientVitalsTrend;
