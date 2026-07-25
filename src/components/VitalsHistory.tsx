import React, { useState, useMemo } from 'react';
import { 
  Heart, 
  Activity, 
  Thermometer, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  Filter, 
  Calendar,
  Sparkles,
  Sliders,
  ChevronRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ReferenceLine, 
  AreaChart, 
  Area 
} from 'recharts';
import { Patient } from '../types/pharmaguard';

interface VitalsHistoryProps {
  patient: Patient;
  title?: string;
  subtitle?: string;
}

type TimeHorizon = '24h' | '7d' | '30d';
type ActiveTab = 'combined' | 'heartRate' | 'bloodPressure' | 'temperature';

interface VitalDataPoint {
  timestamp: string;
  timeLabel: string;
  heartRate: number;
  bpSystolic: number;
  bpDiastolic: number;
  temperatureF: number;
  temperatureC: number;
  spo2: number;
  isAlert?: boolean;
  alertMsg?: string;
}

export const VitalsHistory: React.FC<VitalsHistoryProps> = ({
  patient,
  title = "Longitudinal Vitals Trend History",
  subtitle = "Real-time & historical trend monitoring for Heart Rate, Blood Pressure, and Body Temperature"
}) => {
  const [timeHorizon, setTimeHorizon] = useState<TimeHorizon>('24h');
  const [activeTab, setActiveTab] = useState<ActiveTab>('combined');
  const [tempUnit, setTempUnit] = useState<'F' | 'C'>('F');

  // Generate deterministic, realistic time-series vitals history data for the patient
  const vitalsHistoryData = useMemo(() => {
    const baseHR = patient.vitals.heartRate || 76;
    const baseSys = patient.vitals.bpSystolic || 128;
    const baseDia = patient.vitals.bpDiastolic || 82;
    const baseTempF = 98.6; // standard °F

    const data: VitalDataPoint[] = [];
    const now = new Date();

    if (timeHorizon === '24h') {
      // 24 points (hourly)
      for (let i = 24; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 3600 * 1000);
        const timeLabel = i === 0 ? 'Now' : d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        
        const hr = Math.round(baseHR + Math.sin(i * 0.4) * 12 + (i === 8 ? 24 : 0));
        const sys = Math.round(baseSys + Math.cos(i * 0.35) * 10 + (i === 8 ? 18 : 0));
        const dia = Math.round(baseDia + Math.cos(i * 0.35) * 6 + (i === 8 ? 10 : 0));
        const tempF = parseFloat((baseTempF + Math.sin(i * 0.2) * 0.8 + (i === 14 ? 2.1 : 0)).toFixed(1));
        const tempC = parseFloat(((tempF - 32) * (5 / 9)).toFixed(1));
        const spo2 = Math.min(100, Math.max(92, Math.round(97 - (i === 8 ? 3 : 0))));

        let isAlert = false;
        let alertMsg = '';
        if (hr > 100) {
          isAlert = true;
          alertMsg = 'Tachycardia Peak (>100 bpm)';
        } else if (sys > 140) {
          isAlert = true;
          alertMsg = 'Hypertensive Spike (>140 mmHg)';
        } else if (tempF >= 100.4) {
          isAlert = true;
          alertMsg = 'Pyrexia / Fever Threshold (>=100.4°F)';
        }

        data.push({
          timestamp: d.toISOString(),
          timeLabel,
          heartRate: hr,
          bpSystolic: sys,
          bpDiastolic: dia,
          temperatureF: tempF,
          temperatureC: tempC,
          spo2,
          isAlert,
          alertMsg
        });
      }
    } else if (timeHorizon === '7d') {
      // 7 daily points
      for (let i = 7; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 3600 * 1000);
        const timeLabel = i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
        
        const hr = Math.round(baseHR + Math.cos(i * 0.8) * 8);
        const sys = Math.round(baseSys + Math.sin(i * 0.7) * 9);
        const dia = Math.round(baseDia + Math.sin(i * 0.7) * 5);
        const tempF = parseFloat((baseTempF + Math.sin(i * 0.5) * 0.6 + (i === 2 ? 1.8 : 0)).toFixed(1));
        const tempC = parseFloat(((tempF - 32) * (5 / 9)).toFixed(1));

        data.push({
          timestamp: d.toISOString(),
          timeLabel,
          heartRate: hr,
          bpSystolic: sys,
          bpDiastolic: dia,
          temperatureF: tempF,
          temperatureC: tempC,
          spo2: 97
        });
      }
    } else {
      // 30 days (every 2 days)
      for (let i = 30; i >= 0; i -= 2) {
        const d = new Date(now.getTime() - i * 24 * 3600 * 1000);
        const timeLabel = i === 0 ? 'Today' : `${d.getMonth() + 1}/${d.getDate()}`;
        
        const hr = Math.round(baseHR + Math.sin(i * 0.3) * 10);
        const sys = Math.round(baseSys + Math.cos(i * 0.25) * 11);
        const dia = Math.round(baseDia + Math.cos(i * 0.25) * 6);
        const tempF = parseFloat((baseTempF + Math.sin(i * 0.2) * 0.5 + (i === 12 ? 1.9 : 0)).toFixed(1));
        const tempC = parseFloat(((tempF - 32) * (5 / 9)).toFixed(1));

        data.push({
          timestamp: d.toISOString(),
          timeLabel,
          heartRate: hr,
          bpSystolic: sys,
          bpDiastolic: dia,
          temperatureF: tempF,
          temperatureC: tempC,
          spo2: 97
        });
      }
    }

    return data;
  }, [patient, timeHorizon]);

  // Current latest readings
  const latestReading = vitalsHistoryData[vitalsHistoryData.length - 1] || {
    heartRate: 76,
    bpSystolic: 128,
    bpDiastolic: 82,
    temperatureF: 98.6,
    temperatureC: 37.0
  };

  // CSV Download Handler
  const handleDownloadCSV = () => {
    const headers = [
      'Timestamp',
      'Patient Name',
      'MRN',
      'Heart Rate (bpm)',
      'Systolic BP (mmHg)',
      'Diastolic BP (mmHg)',
      'Temperature (°F)',
      'Temperature (°C)',
      'SpO2 (%)'
    ];

    const rows = vitalsHistoryData.map(v => [
      v.timeLabel,
      `"${patient.name}"`,
      `"${patient.mrn}"`,
      v.heartRate,
      v.bpSystolic,
      v.bpDiastolic,
      v.temperatureF,
      v.temperatureC,
      v.spo2
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${patient.name.replace(/\s+/g, '_')}_Vitals_History_${timeHorizon}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Status helper functions
  const getHRStatus = (hr: number) => {
    if (hr > 100) return { label: 'Tachycardia', color: 'text-rose-400 bg-rose-500/20 border-rose-500/40' };
    if (hr < 60) return { label: 'Bradycardia', color: 'text-amber-400 bg-amber-500/20 border-amber-500/40' };
    return { label: 'Normal Sinus', color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40' };
  };

  const getBPStatus = (sys: number, dia: number) => {
    if (sys >= 140 || dia >= 90) return { label: 'Stage 2 HTN', color: 'text-rose-400 bg-rose-500/20 border-rose-500/40' };
    if (sys >= 130 || dia >= 80) return { label: 'Stage 1 HTN', color: 'text-amber-400 bg-amber-500/20 border-amber-500/40' };
    return { label: 'Normotensive', color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40' };
  };

  const getTempStatus = (tempF: number) => {
    if (tempF >= 100.4) return { label: 'Fever / Pyrexia', color: 'text-rose-400 bg-rose-500/20 border-rose-500/40' };
    if (tempF >= 99.2) return { label: 'Low-grade Fever', color: 'text-amber-400 bg-amber-500/20 border-amber-500/40' };
    return { label: 'Afebrile', color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40' };
  };

  const hrStatus = getHRStatus(latestReading.heartRate);
  const bpStatus = getBPStatus(latestReading.bpSystolic, latestReading.bpDiastolic);
  const tempStatus = getTempStatus(latestReading.temperatureF);

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 shadow-2xl text-xs text-slate-100 font-mono space-y-2 z-50">
          <div className="font-extrabold text-white border-b border-slate-800 pb-1.5 flex items-center justify-between gap-4">
            <span>Time: {label}</span>
            <span className="text-[10px] text-slate-400 font-sans">{patient.name}</span>
          </div>

          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={`item-${index}`} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                  <span>{entry.name}:</span>
                </span>
                <strong className="font-extrabold" style={{ color: entry.color }}>
                  {entry.value} {entry.unit || ''}
                </strong>
              </div>
            ))}
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
          <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shrink-0">
            <Activity className="w-6 h-6 text-cyan-400 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-extrabold text-white">{title}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Patient: {patient.name} ({patient.mrn})
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
          </div>
        </div>

        {/* Action Controls & Horizon Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Time Horizon Selector */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-400 ml-2" />
            <span className="text-[11px] font-bold text-slate-400 mr-1">Horizon:</span>
            {(['24h', '7d', '30d'] as const).map((horizon) => (
              <button
                key={horizon}
                onClick={() => setTimeHorizon(horizon)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  timeHorizon === horizon
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                {horizon}
              </button>
            ))}
          </div>

          {/* Temperature Unit Switcher */}
          <button
            onClick={() => setTempUnit(prev => prev === 'F' ? 'C' : 'F')}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 font-mono font-bold text-xs transition-all cursor-pointer flex items-center gap-1"
            title="Toggle Temperature Unit (°F / °C)"
          >
            <Thermometer className="w-3.5 h-3.5 text-amber-400" />
            <span>°{tempUnit}</span>
          </button>

          {/* Download CSV Report */}
          <button
            onClick={handleDownloadCSV}
            className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-extrabold text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer"
            title="Export Vitals History to CSV"
          >
            <Download className="w-4 h-4 text-white" />
            <span className="hidden sm:inline">Export Vitals CSV</span>
          </button>
        </div>
      </div>

      {/* Real-time Current Vitals Cards Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
        {/* Heart Rate Metric Box */}
        <div 
          onClick={() => setActiveTab('heartRate')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
            activeTab === 'heartRate'
              ? 'bg-slate-950 border-rose-500/80 ring-2 ring-rose-500/20'
              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-bold text-rose-300">
              <Heart className="w-4 h-4 text-rose-500 animate-pulse" />
              <span>Heart Rate</span>
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${hrStatus.color}`}>
              {hrStatus.label}
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-extrabold text-white">
              {latestReading.heartRate} <span className="text-xs text-slate-400 font-normal">bpm</span>
            </div>
            <span className="text-[10px] text-slate-500">Normal: 60-100</span>
          </div>
        </div>

        {/* Blood Pressure Metric Box */}
        <div 
          onClick={() => setActiveTab('bloodPressure')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
            activeTab === 'bloodPressure'
              ? 'bg-slate-950 border-cyan-500/80 ring-2 ring-cyan-500/20'
              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-bold text-cyan-300">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Blood Pressure</span>
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${bpStatus.color}`}>
              {bpStatus.label}
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-extrabold text-white">
              {latestReading.bpSystolic}/{latestReading.bpDiastolic} <span className="text-xs text-slate-400 font-normal">mmHg</span>
            </div>
            <span className="text-[10px] text-slate-500">Target: &lt;120/80</span>
          </div>
        </div>

        {/* Temperature Metric Box */}
        <div 
          onClick={() => setActiveTab('temperature')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
            activeTab === 'temperature'
              ? 'bg-slate-950 border-amber-500/80 ring-2 ring-amber-500/20'
              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-bold text-amber-300">
              <Thermometer className="w-4 h-4 text-amber-400" />
              <span>Body Temperature</span>
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${tempStatus.color}`}>
              {tempStatus.label}
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-extrabold text-white">
              {tempUnit === 'F' ? `${latestReading.temperatureF}°F` : `${latestReading.temperatureC}°C`}
            </div>
            <span className="text-[10px] text-slate-500">Normal: 97.8 - 99.1°F</span>
          </div>
        </div>
      </div>

      {/* Chart View Mode Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-800 pb-2 text-xs font-mono">
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('combined')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === 'combined'
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Combined Multi-Vitals
          </button>
          <button
            onClick={() => setActiveTab('heartRate')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === 'heartRate'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Heart Rate (bpm)
          </button>
          <button
            onClick={() => setActiveTab('bloodPressure')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === 'bloodPressure'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Blood Pressure (mmHg)
          </button>
          <button
            onClick={() => setActiveTab('temperature')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === 'temperature'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Temperature (°{tempUnit})
          </button>
        </div>

        <span className="text-[10px] text-slate-400">
          Viewing {vitalsHistoryData.length} Readings over {timeHorizon}
        </span>
      </div>

      {/* Recharts Graphical Rendering Canvas */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
        
        {/* COMBINED CHART */}
        {activeTab === 'combined' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-900 pb-2">
              <span className="font-bold text-slate-200">Synchronized Multi-Parameter Vitals Overlay</span>
              <div className="flex items-center gap-4 text-[10px]">
                <span className="flex items-center gap-1 text-rose-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> HR (bpm)
                </span>
                <span className="flex items-center gap-1 text-cyan-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> Sys BP (mmHg)
                </span>
                <span className="flex items-center gap-1 text-amber-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Temp (°F)
                </span>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={vitalsHistoryData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="timeLabel" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} />
                  <YAxis yAxisId="left" stroke="#94a3b8" domain={[50, 180]} tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#fb923c" domain={[96, 104]} tick={{ fill: '#fb923c', fontSize: 11, fontFamily: 'monospace' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'monospace', paddingTop: 10 }} />

                  <Line yAxisId="left" type="monotone" dataKey="heartRate" name="Heart Rate (bpm)" stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 3, fill: '#f43f5e' }} activeDot={{ r: 6 }} />
                  <Line yAxisId="left" type="monotone" dataKey="bpSystolic" name="Systolic BP (mmHg)" stroke="#38bdf8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  <Line yAxisId="left" type="monotone" dataKey="bpDiastolic" name="Diastolic BP (mmHg)" stroke="#818cf8" strokeWidth={1.5} dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey={tempUnit === 'F' ? 'temperatureF' : 'temperatureC'} name={`Temperature (°${tempUnit})`} stroke="#fb923c" strokeWidth={2} dot={{ r: 3, fill: '#fb923c' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* HEART RATE SPECIFIC CHART */}
        {activeTab === 'heartRate' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-900 pb-2">
              <span className="font-bold text-rose-300 flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-500 animate-pulse" />
                <span>Heart Rate Chronological Trend & Normal Reference Zone (60-100 bpm)</span>
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={vitalsHistoryData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="timeLabel" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} />
                  <YAxis domain={[40, 140]} stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={100} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: 'Tachycardia (>100)', fill: '#f87171', fontSize: 10 }} />
                  <ReferenceLine y={60} stroke="#fb923c" strokeDasharray="4 4" label={{ value: 'Bradycardia (<60)', fill: '#fb923c', fontSize: 10 }} />
                  <Area type="monotone" dataKey="heartRate" name="Heart Rate (bpm)" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#hrGrad)" dot={{ r: 4, fill: '#f43f5e' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* BLOOD PRESSURE SPECIFIC CHART */}
        {activeTab === 'bloodPressure' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-900 pb-2">
              <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Systolic vs. Diastolic Blood Pressure Curve (Target &lt; 120/80 mmHg)</span>
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={vitalsHistoryData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="timeLabel" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} />
                  <YAxis domain={[50, 180]} stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'monospace', paddingTop: 10 }} />
                  <ReferenceLine y={140} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Sys HTN (>140)', fill: '#f87171', fontSize: 10 }} />
                  <ReferenceLine y={90} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Dia HTN (>90)', fill: '#fbbf24', fontSize: 10 }} />
                  <Line type="monotone" dataKey="bpSystolic" name="Systolic BP (mmHg)" stroke="#38bdf8" strokeWidth={3} dot={{ r: 4, fill: '#38bdf8' }} />
                  <Line type="monotone" dataKey="bpDiastolic" name="Diastolic BP (mmHg)" stroke="#818cf8" strokeWidth={2.5} dot={{ r: 3, fill: '#818cf8' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* TEMPERATURE SPECIFIC CHART */}
        {activeTab === 'temperature' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-900 pb-2">
              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                <Thermometer className="w-4 h-4 text-amber-400" />
                <span>Body Temperature Trajectory (°{tempUnit}) & Fever Threshold Line</span>
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={vitalsHistoryData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fb923c" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#fb923c" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="timeLabel" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} />
                  <YAxis domain={tempUnit === 'F' ? [96, 103] : [35.5, 39.5]} stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={tempUnit === 'F' ? 100.4 : 38.0} stroke="#ef4444" strokeDasharray="4 4" label={{ value: tempUnit === 'F' ? 'Fever Threshold (100.4°F)' : 'Fever Threshold (38.0°C)', fill: '#f87171', fontSize: 10 }} />
                  <Area type="monotone" dataKey={tempUnit === 'F' ? 'temperatureF' : 'temperatureC'} name={`Temperature (°${tempUnit})`} stroke="#fb923c" strokeWidth={3} fillOpacity={1} fill="url(#tempGrad)" dot={{ r: 4, fill: '#fb923c' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

      </div>

      {/* Clinical Interpretation Context Box */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-cyan-300 font-mono font-bold">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Clinical Telemetry Synthesis</span>
        </div>
        <p className="text-slate-300 leading-relaxed font-sans">
          Patient <strong>{patient.name}</strong> displays a steady hemodynamic profile across the past {timeHorizon}. Current heart rate is <strong>{latestReading.heartRate} bpm</strong> ({hrStatus.label}), blood pressure is <strong>{latestReading.bpSystolic}/{latestReading.bpDiastolic} mmHg</strong> ({bpStatus.label}), and body temperature is <strong>{tempUnit === 'F' ? `${latestReading.temperatureF}°F` : `${latestReading.temperatureC}°C`}</strong> ({tempStatus.label}).
        </p>
      </div>
    </div>
  );
};

export default VitalsHistory;
