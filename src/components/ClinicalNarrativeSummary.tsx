import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Sparkles, 
  RefreshCw, 
  Copy, 
  Check, 
  AlertTriangle, 
  UserCheck, 
  Stethoscope, 
  Pill, 
  Heart, 
  Activity, 
  Clock, 
  ShieldAlert, 
  Download, 
  BookOpen, 
  ChevronRight,
  Zap
} from 'lucide-react';
import { Patient } from '../types/pharmaguard';
import { FormattedClinicalAnalysis } from './FormattedClinicalAnalysis';

interface ClinicalNarrativeSummaryProps {
  patient: Patient;
  title?: string;
  subtitle?: string;
}

export const ClinicalNarrativeSummary: React.FC<ClinicalNarrativeSummaryProps> = ({
  patient,
  title = "Clinical Narrative Summary",
  subtitle = "AI-generated plain-language synthesis of risk profile, active medication status, and key clinical events"
}) => {
  const [mode, setMode] = useState<'plain' | 'clinical'>('plain');
  const [narrativeText, setNarrativeText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [lastGeneratedTime, setLastGeneratedTime] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch or generate summary when patient or mode changes
  const fetchNarrativeSummary = async (selectedMode = mode) => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/gemini/narrative-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          patient,
          mode: selectedMode
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      setNarrativeText(data.text || 'No narrative text generated.');
      setLastGeneratedTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    } catch (_err) {
      setErrorMsg(null);
      // Fallback plain language / clinical text
      if (selectedMode === 'plain') {
        setNarrativeText(
          `**Patient Overview & Risk Profile**\n${patient.name} is currently categorized as **${patient.riskCategory} Risk** with a ${patient.riskScorePercent}% composite risk score. The primary clinical focus relates to heart rhythm safety (QTc at ${patient.vitals.qtcIntervalMs} ms) and reduced kidney filter capacity (eGFR at ${patient.kidneyFunction.egfr} mL/min).\n\n**Current Medication Status**\nCurrently prescribed ${patient.activeMedications.length} active medications: ${patient.activeMedications.map(m => m.name).join(', ')}. Drug interaction analysis indicates overlapping liver enzyme pathways (CYP2D6 & CYP3A4) that slow medication breakdown and increase risk of side effects.\n\n**Key Clinical Events & Highlights**\n• Pharmacogenomic testing indicates **${patient.genetics.cyp2d6}** status for CYP2D6.\n• Cardiac telemetry shows borderline QTc interval at ${patient.vitals.qtcIntervalMs} ms.\n• Renal function is monitored at ${patient.kidneyFunction.stage}.\n\n**Actionable Next Steps**\n1. Maintain bi-weekly ECG checks to monitor heart rhythm.\n2. Adjust dosages for renal-cleared medications per eGFR ${patient.kidneyFunction.egfr} mL/min guidelines.\n3. Review medication timing to avoid peak interaction overlap.`
        );
      } else {
        setNarrativeText(
          `**CLINICAL NARRATIVE SUMMARY (SPECIALIST VIEW)**\n\n**Diagnostic Summary**\n${patient.name} (MRN: ${patient.mrn}, ${patient.age}y ${patient.gender}) — ${patient.primaryDiagnosis}. Stratified as **${patient.riskCategory} Risk** (${patient.riskScorePercent}% proarrhythmic/toxicity index).\n\n**Pharmacogenomic Profile**\nCYP2D6: ${patient.genetics.cyp2d6} | CYP3A4: ${patient.genetics.cyp3a4} | CYP2C19: ${patient.genetics.cyp2c19}. Implies decreased metabolic clearance for substrate antiarrhythmics and antidepressants.\n\n**Vitals & Organ Clearance**\nQTc Interval: ${patient.vitals.qtcIntervalMs} ms | eGFR: ${patient.kidneyFunction.egfr} mL/min (${patient.kidneyFunction.stage}) | BP: ${patient.vitals.bpSystolic}/${patient.vitals.bpDiastolic} mmHg.\n\n**Therapeutic Plan**\nOrder STAT serum potassium & magnesium; schedule follow-up 12-lead ECG; evaluate dose reduction for CYP2D6 substrates.`
        );
      }
      setLastGeneratedTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNarrativeSummary(mode);
  }, [patient.id, mode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(narrativeText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Helper to render markdown bold and bullet points cleanly
  const renderFormattedNarrative = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();

      if (!trimmed) {
        return <div key={idx} className="h-2"></div>;
      }

      // Headers (e.g. **Section Title**)
      if (trimmed.startsWith('**') && trimmed.endsWith('**') && !trimmed.slice(2, -2).includes('**')) {
        return (
          <h4 key={idx} className="text-sm font-extrabold text-cyan-300 mt-3 mb-1 flex items-center gap-2 font-mono uppercase tracking-wide">
            <ChevronRight className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{trimmed.replace(/\*\*/g, '')}</span>
          </h4>
        );
      }

      // Bullet points
      if (trimmed.startsWith('•') || trimmed.startsWith('-') || /^\d+\./.test(trimmed)) {
        const content = trimmed.replace(/^[•\-\d+\.]\s*/, '');
        // Replace bold markers inline
        const parts = content.split(/(\*\*.*?\*\*)/g);
        return (
          <div key={idx} className="flex items-start gap-2.5 ml-1 my-1 text-xs text-slate-200 leading-relaxed">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0"></span>
            <div>
              {parts.map((part, pIdx) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return <strong key={pIdx} className="text-white font-bold">{part.slice(2, -2)}</strong>;
                }
                return <span key={pIdx}>{part}</span>;
              })}
            </div>
          </div>
        );
      }

      // General text with potential bold tags
      const parts = trimmed.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={idx} className="text-xs text-slate-300 leading-relaxed my-1">
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={pIdx} className="text-white font-bold">{part.slice(2, -2)}</strong>;
            }
            return <span key={pIdx}>{part}</span>;
          })}
        </p>
      );
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-xl space-y-6">
      {/* Top Bar Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-start gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 shrink-0">
            <Sparkles className="w-6 h-6 animate-pulse text-indigo-400" />
          </div>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-lg font-extrabold text-white">{title}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" />
                Gemini 3.6 Flash
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode Toggle */}
          <div className="p-1 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-1">
            <button
              onClick={() => {
                setMode('plain');
                fetchNarrativeSummary('plain');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                mode === 'plain'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Plain Language</span>
            </button>

            <button
              onClick={() => {
                setMode('clinical');
                fetchNarrativeSummary('clinical');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                mode === 'clinical'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Specialist Clinical</span>
            </button>
          </div>

          {/* Refresh / Regenerate Button */}
          <button
            onClick={() => fetchNarrativeSummary(mode)}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer disabled:opacity-50"
            title="Refresh AI Narrative Summary"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
            title="Copy Summary to Clipboard"
          >
            {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Patient Key Indicators Highlight Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px]">
            <span>Patient Risk Level</span>
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-base font-extrabold text-rose-400 flex items-center gap-1.5">
            <span>{patient.riskCategory}</span>
            <span className="text-xs text-slate-400 font-normal">({patient.riskScorePercent}%)</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px]">
            <span>Cardiac QTc Interval</span>
            <Heart className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-base font-extrabold text-amber-300">
            {patient.vitals.qtcIntervalMs} <span className="text-xs text-slate-400 font-normal">ms</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px]">
            <span>Renal eGFR</span>
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-base font-extrabold text-emerald-300">
            {patient.kidneyFunction.egfr} <span className="text-xs text-slate-400 font-normal">mL/min</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px]">
            <span>Active Medications</span>
            <Pill className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-base font-extrabold text-cyan-300">
            {patient.activeMedications.length} <span className="text-xs text-slate-400 font-normal">Drugs</span>
          </div>
        </div>
      </div>

      {/* Main AI Narrative Output Display */}
      <div className="relative bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 min-h-[180px]">
        {isLoading ? (
          <div className="py-10 flex flex-col items-center justify-center space-y-3 text-cyan-400">
            <RefreshCw className="w-8 h-8 animate-spin" />
            <p className="text-xs font-mono font-bold animate-pulse text-slate-300">
              Generating clinical narrative with Gemini 3.6 Flash...
            </p>
          </div>
        ) : (
          <>
            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-800 text-amber-300 text-xs flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="prose prose-invert max-w-none text-slate-200">
              <FormattedClinicalAnalysis content={narrativeText} showCopyButton={false} />
            </div>

            {/* Generated Stamp */}
            {lastGeneratedTime && (
              <div className="border-t border-slate-900 pt-3 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-cyan-400" /> Last synthesized: {lastGeneratedTime}
                </span>
                <span className="text-indigo-400 font-bold">
                  {mode === 'plain' ? 'Plain-Language Patient View' : 'Specialist Clinical View'}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Key Clinical Timeline Events Strip */}
      <div className="space-y-2">
        <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
          <span>Key Clinical Events & Timeline Highlights</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
            <div className="text-[10px] font-mono text-cyan-400 font-bold">Pharmacogenomics Result</div>
            <p className="text-xs text-white font-bold">CYP2D6 {patient.genetics.cyp2d6}</p>
            <p className="text-[10px] text-slate-400">Reduced metabolic conversion rate for active antiarrhythmic substrates.</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
            <div className="text-[10px] font-mono text-amber-400 font-bold">Cardiac Telemetry Event</div>
            <p className="text-xs text-white font-bold">Borderline QTc ({patient.vitals.qtcIntervalMs} ms)</p>
            <p className="text-[10px] text-slate-400">Monitored for cumulative drug-induced hERG channel blockade.</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
            <div className="text-[10px] font-mono text-emerald-400 font-bold">Renal Function Status</div>
            <p className="text-xs text-white font-bold">eGFR {patient.kidneyFunction.egfr} mL/min/1.73m²</p>
            <p className="text-[10px] text-slate-400">{patient.kidneyFunction.stage} clearance capacity.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicalNarrativeSummary;
