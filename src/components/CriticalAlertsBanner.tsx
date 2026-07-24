import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, ArrowRight, X, ChevronDown, ChevronUp, AlertCircle, FileWarning, Sparkles } from 'lucide-react';
import { Patient, DrugInteraction, FDAAlert } from '../types/pharmaguard';
import { ViewId } from './Sidebar';

interface CriticalAlertsBannerProps {
  patient: Patient;
  interactions: DrugInteraction[];
  fdaAlerts: FDAAlert[];
  onNavigate: (view: ViewId) => void;
  thresholdPercent?: number;
}

export const CriticalAlertsBanner: React.FC<CriticalAlertsBannerProps> = ({
  patient,
  interactions = [],
  fdaAlerts = [],
  onNavigate,
  thresholdPercent = 45
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // Filter high severity interactions & relevant FDA alerts
  const criticalInteractions = interactions.filter(
    (i) => i.severity === 'Contraindicated' || i.severity === 'Severe'
  );

  const relevantFdaAlerts = fdaAlerts.filter((alert) =>
    patient.activeMedications.some(
      (med) => med.name.toLowerCase().includes(alert.drugName.toLowerCase()) ||
               alert.drugName.toLowerCase().includes(med.name.toLowerCase())
    )
  );

  const isExceedingThreshold = patient.riskScorePercent >= thresholdPercent;
  const hasCriticalItems = criticalInteractions.length > 0 || relevantFdaAlerts.length > 0;

  // Only show banner if risk score exceeds threshold OR there are critical items
  if (isDismissed || (!isExceedingThreshold && !hasCriticalItems)) {
    return null;
  }

  const criticalCount = criticalInteractions.length + relevantFdaAlerts.length;

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-rose-500/60 bg-gradient-to-r from-rose-950/90 via-slate-900 to-amber-950/80 p-5 text-white shadow-2xl shadow-rose-950/50 space-y-4">
      {/* Background visual accent */}
      <div className="absolute -right-12 -top-12 w-48 h-48 bg-rose-500/10 rounded-full blur-2xl pointer-events-none"></div>

      {/* Main Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-rose-500/30 pb-3">
        <div className="flex items-start md:items-center gap-3">
          <div className="relative p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 shrink-0">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 animate-ping"></span>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-500 text-white shadow-sm">
                CRITICAL CLINICAL ALERT
              </span>
              <span className="text-xs font-mono font-bold text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/30">
                Risk Score: {patient.riskScorePercent}% (Threshold: &ge;{thresholdPercent}%)
              </span>
            </div>
            <h2 className="text-base font-extrabold text-white mt-1">
              High-Risk Medication Hazards Detected for {patient.name}
            </h2>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-1 border border-slate-700 transition-colors cursor-pointer"
          >
            <span>{isExpanded ? 'Hide Details' : `Show (${criticalCount} Alerts)`}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setIsDismissed(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
            title="Dismiss Alert Banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded Alert Details */}
      {isExpanded && (
        <div className="space-y-4 pt-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Critical Interactions Column */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-rose-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  Severe & Contraindicated Interactions ({criticalInteractions.length})
                </span>
              </div>

              {criticalInteractions.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {criticalInteractions.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-slate-900/90 border border-rose-500/30 text-xs space-y-1 hover:border-rose-500/60 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-white">
                          {item.drugA} + {item.drugB}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.severity === 'Contraindicated'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {item.severity}
                        </span>
                      </div>
                      <p className="text-slate-300 text-[11px] font-medium">{item.clinicalImpact}</p>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Mechanism: {item.mechanism} ({item.metabolicConflict})
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-xs text-slate-400">
                  No contraindications flagged in active database.
                </div>
              )}
            </div>

            {/* FDA Black Box & Safety Warnings Column */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-amber-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FileWarning className="w-3.5 h-3.5 text-amber-400" />
                  Active FDA Black Box & Recalls ({relevantFdaAlerts.length})
                </span>
              </div>

              {relevantFdaAlerts.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {relevantFdaAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-3 rounded-xl bg-slate-900/90 border border-amber-500/30 text-xs space-y-1 hover:border-amber-500/60 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-amber-200">{alert.drugName}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          {alert.alertType}
                        </span>
                      </div>
                      <p className="text-slate-300 text-[11px]">{alert.summary}</p>
                      <div className="text-[10px] text-rose-300 font-semibold">
                        Action Required: {alert.actionRequired}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-xs text-slate-400">
                  No active FDA recalls for prescribed regimen.
                </div>
              )}
            </div>
          </div>

          {/* Quick Action Navigation Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-rose-500/30 pt-3">
            <div className="text-xs text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>PharmaGuard AI recommends immediate regimen optimization or counterfactual testing.</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => onNavigate('causal_counterfactual')}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Causal Counterfactuals</span>
                <ArrowRight className="w-3 h-3" />
              </button>

              <button
                onClick={() => onNavigate('alternatives')}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Optimize Regimen</span>
                <ArrowRight className="w-3 h-3" />
              </button>

              <button
                onClick={() => onNavigate('drug_matrix')}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Interaction Matrix</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CriticalAlertsBanner;
