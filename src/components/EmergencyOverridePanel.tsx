import React, { useState } from 'react';
import { 
  Siren, 
  ShieldAlert, 
  Zap, 
  AlertOctagon, 
  PhoneCall, 
  CheckCircle2, 
  X, 
  ChevronUp, 
  ChevronDown, 
  Activity, 
  Heart, 
  Clock, 
  FileCheck, 
  Send,
  Sparkles,
  Radio,
  Flame
} from 'lucide-react';
import { Patient } from '../types/pharmaguard';

interface EmergencyOverridePanelProps {
  patient: Patient;
  onNavigate?: (view: string) => void;
}

export interface EmergencyProtocol {
  id: string;
  code: string;
  title: string;
  category: 'Cardiac' | 'Anaphylaxis' | 'Renal/Metabolic' | 'Toxicity' | 'Opioid';
  description: string;
  actions: string[];
  statMedication?: string;
  urgency: 'STAT 1 Min' | 'STAT 5 Min' | 'Urgent 15 Min';
}

export const EmergencyOverridePanel: React.FC<EmergencyOverridePanelProps> = ({
  patient,
  onNavigate
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [activeModalProtocol, setActiveModalProtocol] = useState<EmergencyProtocol | null>(null);
  const [executedLogs, setExecutedLogs] = useState<Array<{ protocolId: string; title: string; timestamp: string }>>([]);
  const [isSuccessToast, setIsSuccessToast] = useState<string | null>(null);

  // Risk determines if emergency mode is active by default
  const isCriticalRisk = patient.riskCategory === 'Critical' || (patient.riskScorePercent && patient.riskScorePercent >= 80);

  const protocols: EmergencyProtocol[] = [
    {
      id: 'code-blue-qtc',
      code: 'PROTOCOL-991-BLUE',
      title: 'Code Blue / TdP QTc Prolongation Protocol',
      category: 'Cardiac',
      description: 'Immediate resuscitation protocol for severe ventricular arrhythmia, Torsades de Pointes (TdP), or QTc > 500ms.',
      statMedication: 'IV Magnesium Sulfate 2g over 10 min + Stop all QTc prolonging drugs',
      urgency: 'STAT 1 Min',
      actions: [
        'Dispatch STAT ICU Rapid Response Team to Bedside',
        'Administer Magnesium Sulfate 2g IV piggyback',
        'Halt Amiodarone, Fluoxetine, & Ondansetron infusions immediately',
        'Prepare Defibrillator / Transcutaneous Pacing'
      ]
    },
    {
      id: 'severe-allergy',
      code: 'PROTOCOL-112-ALLERGY',
      title: 'Anaphylaxis & Severe Hypersensitivity Protocol',
      category: 'Anaphylaxis',
      description: 'Acute hypersensitivity response, airway compromise, or refractory bronchospasm.',
      statMedication: 'Epinephrine 0.3mg IM (1:1000) outer thigh + Diphenhydramine 50mg IV',
      urgency: 'STAT 1 Min',
      actions: [
        'Administer Epinephrine 0.3mg IM immediately',
        'Establish 100% High-Flow O2 Non-Rebreather Mask',
        'Infuse Normal Saline 1000mL IV bolus for hypotension',
        'Notify STAT Anesthesiology Airway Team'
      ]
    },
    {
      id: 'renal-hyperkalemia',
      code: 'PROTOCOL-404-RENAL',
      title: 'Acute Hyperkalemic Cardiac Protection Protocol',
      category: 'Renal/Metabolic',
      description: 'Serum Potassium >= 6.2 mEq/L with eGFR < 30 mL/min and ECG peaking.',
      statMedication: 'Calcium Gluconate 10% IV 10mL + Regular Insulin 10 units in D50W',
      urgency: 'STAT 5 Min',
      actions: [
        'Administer Calcium Gluconate 1g IV over 5 min for cardiac membrane stabilization',
        'Administer Regular Insulin 10U IV with 50mL D50W',
        'Initiate Sodium Zirconium Cyclosilicate 10g PO',
        'Stat Nephrology Hemodialysis Consult'
      ]
    },
    {
      id: 'stat-drug-washout',
      code: 'PROTOCOL-707-WASHOUT',
      title: 'STAT Multi-Drug Toxicity Washout & Antidote',
      category: 'Toxicity',
      description: 'Competitive CYP450 saturation leading to toxic steady-state drug accumulation.',
      statMedication: 'STAT Activated Charcoal 50g PO / Hemoperfusion',
      urgency: 'Urgent 15 Min',
      actions: [
        'Execute immediate EHR order freeze on all interacting antiarrhythmics & psychotropics',
        'Initiate IV Fluid Force Diuresis (Normal Saline at 175 mL/hr)',
        'Order STAT Emergency Serum Toxicology Panel & Free Drug Levels',
        'Notify Clinical Pharmacologist on Call'
      ]
    }
  ];

  const handleExecuteProtocol = (protocol: EmergencyProtocol) => {
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setExecutedLogs(prev => [
      { protocolId: protocol.id, title: protocol.title, timestamp: time },
      ...prev
    ]);
    setActiveModalProtocol(null);
    setIsSuccessToast(`EXECUTED: ${protocol.title} (${protocol.code}) dispatched at ${time}`);
    setTimeout(() => {
      setIsSuccessToast(null);
    }, 5000);
  };

  // Render compact pill if minimized
  if (!isExpanded) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsExpanded(true)}
          className={`px-4 py-2.5 rounded-full text-white font-extrabold text-xs shadow-2xl transition-all cursor-pointer flex items-center gap-2 border shadow-rose-900/50 ${
            isCriticalRisk 
              ? 'bg-rose-600 hover:bg-rose-500 border-rose-400 animate-pulse' 
              : 'bg-slate-900 hover:bg-slate-800 border-slate-700'
          }`}
        >
          <Siren className="w-4 h-4 text-rose-400" />
          <span>STAT Emergency Override</span>
          {isCriticalRisk && (
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
          )}
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Floating Emergency Override Panel */}
      <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 max-w-lg w-full ${
        isExpanded ? 'scale-100 opacity-100' : 'scale-95 opacity-90'
      }`}>
        <div className={`rounded-2xl border-2 shadow-2xl backdrop-blur-xl transition-all ${
          isCriticalRisk
            ? 'bg-slate-950/95 border-rose-600 shadow-rose-900/50 ring-4 ring-rose-500/20'
            : 'bg-slate-950/95 border-amber-500 shadow-amber-950/40'
        }`}>
          {/* Header Bar */}
          <div className={`p-3.5 rounded-t-2xl flex items-center justify-between border-b ${
            isCriticalRisk
              ? 'bg-rose-600/20 border-rose-600/60 text-white'
              : 'bg-amber-500/20 border-amber-500/40 text-amber-200'
          }`}>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-600 text-white shadow-md animate-pulse">
                <Siren className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm text-white tracking-wide uppercase font-mono">
                    STAT Emergency Override
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-extrabold bg-rose-600 text-white animate-pulse">
                    CRITICAL RISK PROTOCOLS
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 font-mono">
                  Patient: <span className="text-white font-bold">{patient.name}</span> ({patient.mrn}) • QTc: <span className="text-rose-400 font-bold">{patient.vitals.qtcIntervalMs}ms</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                title={isExpanded ? 'Minimize Panel' : 'Expand Panel'}
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Body Content */}
          {isExpanded && (
            <div className="p-4 space-y-3.5 text-xs text-slate-200 max-h-[420px] overflow-y-auto">
              <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-[11px] text-rose-200 flex items-start gap-2">
                <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>
                  <strong>CRITICAL PATIENT OVERRIDE ACTIVE:</strong> Instant one-click dispatch sends priority STAT orders directly to ICU Nursing, Pharmacy, and Code Response.
                </span>
              </div>

              {/* Protocol Action Buttons Grid */}
              <div className="grid grid-cols-1 gap-2">
                {protocols.map((protocol) => (
                  <button
                    key={protocol.id}
                    onClick={() => setActiveModalProtocol(protocol)}
                    className="w-full text-left p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-rose-500/60 transition-all cursor-pointer group flex items-start justify-between gap-3 shadow-md"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-white group-hover:text-rose-300 transition-colors">
                          {protocol.title}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          {protocol.urgency}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-1">
                        {protocol.description}
                      </p>
                      {protocol.statMedication && (
                        <div className="text-[10px] font-mono text-cyan-300 flex items-center gap-1 font-semibold">
                          <Zap className="w-3 h-3 text-amber-400" />
                          <span>STAT: {protocol.statMedication}</span>
                        </div>
                      )}
                    </div>

                    <span className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-[11px] shrink-0 self-center shadow-md transition-all group-hover:scale-105">
                      EXECUTE
                    </span>
                  </button>
                ))}
              </div>

              {/* Executed Protocol History Stamp */}
              {executedLogs.length > 0 && (
                <div className="border-t border-slate-800 pt-2.5 space-y-1.5">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-400" />
                    <span>Dispatched Emergency Audit Log ({executedLogs.length})</span>
                  </div>
                  <div className="space-y-1 max-h-20 overflow-y-auto">
                    {executedLogs.map((log, idx) => (
                      <div key={idx} className="p-1.5 rounded bg-emerald-950/40 border border-emerald-800/60 text-[10px] font-mono text-emerald-300 flex items-center justify-between">
                        <span className="truncate">{log.title}</span>
                        <span className="font-bold text-slate-300 shrink-0 ml-2">{log.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal overlay for Executing Protocol */}
      {activeModalProtocol && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-rose-600 rounded-3xl p-6 max-w-lg w-full text-slate-100 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-rose-600 text-white shadow-lg animate-pulse">
                  <Siren className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">{activeModalProtocol.title}</h3>
                  <p className="text-xs font-mono text-rose-400 font-bold">{activeModalProtocol.code} • {activeModalProtocol.urgency}</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveModalProtocol(null)} 
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
              {activeModalProtocol.description}
            </p>

            {/* Checklist of STAT Actions */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Mandatory Immediate Actions Dispatched:
              </div>
              <div className="space-y-1.5">
                {activeModalProtocol.actions.map((act, i) => (
                  <div key={i} className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{act}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* STAT Medication Highlight */}
            {activeModalProtocol.statMedication && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 font-mono font-bold flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span>STAT Medication: {activeModalProtocol.statMedication}</span>
              </div>
            )}

            {/* Confirm / Cancel Buttons */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
              <button
                onClick={() => setActiveModalProtocol(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleExecuteProtocol(activeModalProtocol)}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-lg shadow-rose-600/40 cursor-pointer transition-all flex items-center gap-2"
              >
                <Radio className="w-4 h-4 text-white animate-spin" />
                <span>CONFIRM & DISPATCH CODE PROTOCOL</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dispatched Toast Notification */}
      {isSuccessToast && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-950 text-emerald-100 border-2 border-emerald-500 px-4 py-3 rounded-2xl shadow-2xl text-xs font-mono font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 animate-bounce" />
          <span>{isSuccessToast}</span>
          <button onClick={() => setIsSuccessToast(null)} className="text-emerald-400 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
};

export default EmergencyOverridePanel;
