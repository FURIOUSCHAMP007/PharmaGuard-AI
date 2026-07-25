import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Pill, 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  Info, 
  RefreshCw, 
  Plus, 
  Activity, 
  Check, 
  AlertCircle,
  FileSpreadsheet,
  Award
} from 'lucide-react';
import { Patient } from '../types/pharmaguard';

interface MedicationAdherenceScoreProps {
  patient: Patient;
  title?: string;
  subtitle?: string;
}

export interface DrugAdherenceDetail {
  id: string;
  name: string;
  dosage: string;
  route: string;
  totalScheduled: number;
  onTimeCount: number;
  delayedCount: number;
  missedCount: number;
  lastTakenTime: string;
  riskFactor?: string;
}

export const MedicationAdherenceScore: React.FC<MedicationAdherenceScoreProps> = ({
  patient,
  title = "Medication Adherence Score & PDC Analytics",
  subtitle = "Proportion of Days Covered (PDC) and real-time eMAR compliance gauge calculated across active drug regimens"
}) => {
  // Initial Drug-level adherence records based on active medications
  const [drugRecords, setDrugRecords] = useState<DrugAdherenceDetail[]>(() => {
    const meds = patient.activeMedications.length > 0 ? patient.activeMedications : [
      { id: 'm1', name: 'Amiodarone HCl', dosage: '200 mg qd', route: 'PO' } as any,
      { id: 'm2', name: 'Fluoxetine HCl', dosage: '20 mg qd', route: 'PO' } as any,
      { id: 'm3', name: 'Ondansetron', dosage: '8 mg tid', route: 'IV' } as any,
      { id: 'm4', name: 'Lisinopril', dosage: '10 mg qd', route: 'PO' } as any,
    ];

    return meds.map((med, idx) => {
      // Mock realistic 30-day/7-day dose counts
      const total = 28; // 28 doses
      let onTime = 25;
      let delayed = 2;
      let missed = 1;

      if (idx === 1) { // Fluoxetine
        onTime = 22;
        delayed = 4;
        missed = 2;
      } else if (idx === 2) { // Ondansetron
        onTime = 26;
        delayed = 2;
        missed = 0;
      } else if (idx === 3) { // Lisinopril
        onTime = 20;
        delayed = 5;
        missed = 3;
      }

      return {
        id: med.id,
        name: med.name,
        dosage: med.dosage || 'Standard Dose',
        route: med.route || 'PO',
        totalScheduled: total,
        onTimeCount: onTime,
        delayedCount: delayed,
        missedCount: missed,
        lastTakenTime: idx === 2 ? '12:45 PM (Delayed 85m)' : '08:06 AM (On Time)',
        riskFactor: missed > 2 ? 'Sub-optimal compliance raises therapeutic fail risk' : undefined
      };
    });
  });

  const [timePeriod, setTimePeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Compute Overall Patient Adherence Score
  const adherenceStats = useMemo(() => {
    let grandTotal = 0;
    let grandOnTime = 0;
    let grandDelayed = 0;
    let grandMissed = 0;

    drugRecords.forEach(d => {
      grandTotal += d.totalScheduled;
      grandOnTime += d.onTimeCount;
      grandDelayed += d.delayedCount;
      grandMissed += d.missedCount;
    });

    if (grandTotal === 0) return { score: 100, status: 'Optimal', color: '#10b981' };

    // Standard Clinical Adherence Weighting:
    // On-Time = 100% (1.0), Delayed = 75% (0.75), Missed = 0%
    const weightedScore = Math.round(
      ((grandOnTime * 1.0 + grandDelayed * 0.75 + grandMissed * 0.0) / grandTotal) * 100
    );

    let status = 'Optimal Adherence';
    let badgeClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    let gaugeColor = '#10b981'; // Emerald
    let recommendation = 'Patient maintains high adherence compliance (> 90%). Continue standard eMAR automated reminders.';

    if (weightedScore < 75) {
      status = 'Critical Non-Adherence';
      badgeClass = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      gaugeColor = '#f43f5e'; // Rose
      recommendation = 'Adherence below 75% threshold! High risk for therapeutic breakthrough or disease exacerbation. Schedule pharmacy consult.';
    } else if (weightedScore < 88) {
      status = 'Moderate / Fair Compliance';
      badgeClass = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      gaugeColor = '#f59e0b'; // Amber
      recommendation = 'Multiple doses delayed or missed in past 7 days. Enable bedside smart-pillbox alerts or caregiver notifications.';
    }

    return {
      score: weightedScore,
      grandTotal,
      grandOnTime,
      grandDelayed,
      grandMissed,
      status,
      badgeClass,
      gaugeColor,
      recommendation
    };
  }, [drugRecords]);

  // Handler to simulate real-time dose logging
  const handleLogDose = (drugId: string, outcome: 'onTime' | 'delayed' | 'missed') => {
    setDrugRecords(prev => prev.map(d => {
      if (d.id === drugId) {
        const newTotal = d.totalScheduled + 1;
        const newOnTime = outcome === 'onTime' ? d.onTimeCount + 1 : d.onTimeCount;
        const newDelayed = outcome === 'delayed' ? d.delayedCount + 1 : d.delayedCount;
        const newMissed = outcome === 'missed' ? d.missedCount + 1 : d.missedCount;

        const outcomeText = outcome === 'onTime' ? 'On-Time' : (outcome === 'delayed' ? 'Delayed' : 'Missed');
        setToastMessage(`Logged ${outcomeText} dose for ${d.name}. Recalculating score...`);
        setTimeout(() => setToastMessage(null), 3000);

        return {
          ...d,
          totalScheduled: newTotal,
          onTimeCount: newOnTime,
          delayedCount: newDelayed,
          missedCount: newMissed,
          lastTakenTime: `Just Now (${outcomeText})`
        };
      }
      return d;
    }));
  };

  // SVG Gauge Calculations
  const radius = 70;
  const strokeWidth = 12;
  const normalizedRadius = radius - strokeWidth * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  // Semi-circle gauge (180 degree arc)
  const strokeDashoffset = circumference - (adherenceStats.score / 100) * (circumference / 2);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-start gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 shrink-0">
            <Award className="w-6 h-6 text-indigo-400" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-extrabold text-white">{title}</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${adherenceStats.badgeClass}`}>
                {adherenceStats.status} ({adherenceStats.score}%)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
          </div>
        </div>

        {/* Time Period Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-400 ml-2" />
            <span className="text-[11px] font-bold text-slate-400 mr-1">Period:</span>
            {(['7d', '30d', '90d'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setTimePeriod(p)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  timePeriod === p
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                {p.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-2.5 bg-indigo-950/80 border border-indigo-800 text-indigo-200 text-xs font-mono font-bold flex items-center gap-2 px-4 rounded-xl animate-in fade-in">
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Grid: Gauge Left + Analytics & Individual Med Breakdown Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Left: Semi-Circle Gauge Card */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-center text-center space-y-4 shadow-inner">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Overall PDC Adherence Index</span>
          </span>

          {/* SVG Radial Semi-Circle Gauge */}
          <div className="relative w-48 h-28 flex items-end justify-center">
            <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
              {/* Background Arc */}
              <circle
                stroke="#1e293b"
                fill="transparent"
                strokeWidth={strokeWidth}
                strokeDasharray={`${circumference / 2} ${circumference}`}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
              {/* Animated Value Arc */}
              <circle
                stroke={adherenceStats.gaugeColor}
                fill="transparent"
                strokeWidth={strokeWidth}
                strokeDasharray={`${circumference / 2} ${circumference}`}
                style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.8s ease-in-out' }}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
            </svg>

            {/* Central Score Label Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
              <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
                {adherenceStats.score}%
              </span>
              <span className="text-[10px] font-mono text-slate-400 uppercase">
                Adherence Rate
              </span>
            </div>
          </div>

          {/* Gauge Summary Stats Bar */}
          <div className="grid grid-cols-3 gap-2 w-full pt-2 border-t border-slate-900 text-xs font-mono">
            <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">On-Time</span>
              <strong className="text-emerald-400 font-extrabold text-sm">{adherenceStats.grandOnTime}</strong>
            </div>

            <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Delayed</span>
              <strong className="text-amber-400 font-extrabold text-sm">{adherenceStats.grandDelayed}</strong>
            </div>

            <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Missed</span>
              <strong className="text-rose-400 font-extrabold text-sm">{adherenceStats.grandMissed}</strong>
            </div>
          </div>
        </div>

        {/* Right: Per-Drug Adherence Breakdown Table */}
        <div className="lg:col-span-7 space-y-3">
          <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-indigo-400" />
              <span>Regimen Drug-Level Compliance</span>
            </span>
            <span className="text-[10px] text-slate-500">Log Real-time eMAR Dose</span>
          </div>

          <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
            {drugRecords.map((drug) => {
              const drugScore = Math.round(
                ((drug.onTimeCount * 1.0 + drug.delayedCount * 0.75 + drug.missedCount * 0.0) / drug.totalScheduled) * 100
              );

              return (
                <div 
                  key={drug.id}
                  className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 transition-all hover:border-slate-700"
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div>
                      <h4 className="font-extrabold text-white">{drug.name}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {drug.dosage} ({drug.route}) • Last: <span className="text-slate-300">{drug.lastTakenTime}</span>
                      </p>
                    </div>

                    <div className="text-right font-mono">
                      <span className={`text-xs font-extrabold px-2 py-0.5 rounded border ${
                        drugScore >= 90 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                        drugScore >= 75 ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                        'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      }`}>
                        {drugScore}% Adherent
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar for Drug Adherence */}
                  <div className="space-y-1">
                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          drugScore >= 90 ? 'bg-emerald-400' :
                          drugScore >= 75 ? 'bg-amber-400' : 'bg-rose-500'
                        }`}
                        style={{ width: `${drugScore}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Quick Action Simulation Buttons */}
                  <div className="flex items-center justify-between text-[10px] font-mono pt-1 border-t border-slate-900">
                    <span className="text-slate-400">Log eMAR Dose:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleLogDose(drug.id, 'onTime')}
                        className="px-2 py-0.5 rounded bg-emerald-950 hover:bg-emerald-800 text-emerald-300 border border-emerald-800 transition-colors cursor-pointer"
                        title="Mark dose as given on time"
                      >
                        + On-Time
                      </button>
                      <button
                        onClick={() => handleLogDose(drug.id, 'delayed')}
                        className="px-2 py-0.5 rounded bg-amber-950 hover:bg-amber-800 text-amber-300 border border-amber-800 transition-colors cursor-pointer"
                        title="Mark dose as given late"
                      >
                        + Delayed
                      </button>
                      <button
                        onClick={() => handleLogDose(drug.id, 'missed')}
                        className="px-2 py-0.5 rounded bg-rose-950 hover:bg-rose-800 text-rose-300 border border-rose-800 transition-colors cursor-pointer"
                        title="Mark dose as omitted / missed"
                      >
                        + Missed
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI Intervention Recommendation Box */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-3 text-xs">
        <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
        <div className="space-y-1">
          <span className="font-mono font-bold text-amber-300 uppercase tracking-wider text-[10px]">
            Clinical Decision Support & Adherence Intervention
          </span>
          <p className="text-slate-300 leading-relaxed font-sans">
            {adherenceStats.recommendation}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MedicationAdherenceScore;
