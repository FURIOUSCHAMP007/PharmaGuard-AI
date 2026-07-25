import React, { useState, useEffect, useMemo } from 'react';
import { 
  FlaskConical, 
  Sparkles, 
  Network, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  RefreshCw, 
  Info, 
  Copy, 
  Check, 
  ChevronRight, 
  Activity, 
  Heart, 
  Pill, 
  Dna, 
  ShieldAlert, 
  BookOpen, 
  FileText,
  Zap
} from 'lucide-react';
import { Patient } from '../types/pharmaguard';

interface LabResultItem {
  id: string;
  name: string;
  value: string;
  numericValue: number;
  unit: string;
  referenceRange: string;
  status: 'Critical' | 'Abnormal' | 'Borderline' | 'Normal';
  category: 'Renal' | 'Electrolytes' | 'Hepatic' | 'Cardiac / Vitals' | 'Coagulation';
  recordedDate: string;
  kgPath: {
    sourceNode: string;
    sourceType: string;
    relationship: string;
    targetNode: string;
    targetType: string;
    clinicalConsequence: string;
  }[];
  defaultExplanation: string;
}

interface LabResultInsightProps {
  patient: Patient;
  title?: string;
  subtitle?: string;
}

export const LabResultInsight: React.FC<LabResultInsightProps> = ({
  patient,
  title = "Knowledge Graph Lab Result Insights",
  subtitle = "AI-powered plain-language explanations connecting lab anomalies to biomedical ontology pathways"
}) => {
  // Generate patient-specific lab results
  const labResults: LabResultItem[] = useMemo(() => {
    const egfr = patient.kidneyFunction.egfr || 38;
    const creat = patient.kidneyFunction.serumCreatinine || 1.8;
    const qtc = patient.vitals.qtcIntervalMs || 468;
    const cyp2d6 = patient.genetics.cyp2d6 || 'Poor Metabolizer';

    return [
      {
        id: 'lab-egfr',
        name: 'eGFR (Glomerular Filtration Rate)',
        value: `${egfr}`,
        numericValue: egfr,
        unit: 'mL/min/1.73m²',
        referenceRange: '> 60 mL/min',
        status: egfr < 45 ? 'Abnormal' : 'Normal',
        category: 'Renal',
        recordedDate: 'Today, 07:30',
        kgPath: [
          {
            sourceNode: `Lab: eGFR ${egfr} mL/min`,
            sourceType: 'LOINC: 33914-3',
            relationship: 'INDICATES_IMPAIRMENT',
            targetNode: `Kidney: ${patient.kidneyFunction.stage || 'Stage 3b'}`,
            targetType: 'SNOMED CT: 43314009',
            clinicalConsequence: 'Reduced renal clearance of active drug metabolites'
          },
          {
            sourceNode: `Kidney: Stage 3b`,
            sourceType: 'Disease',
            relationship: 'DECREASES_CLEARANCE',
            targetNode: 'Drug: Metformin / Active Metabolites',
            targetType: 'RxNorm: 6918',
            clinicalConsequence: 'Accumulation risk requiring dose adjustment to avoid lactic acidosis'
          }
        ],
        defaultExplanation: `An eGFR of ${egfr} mL/min indicates reduced kidney filtering capacity (Stage 3b Chronic Kidney Disease). In simple terms, the kidneys are working at about ${egfr}% of normal speed, meaning medications cleared by the kidneys remain in the bloodstream longer.`
      },
      {
        id: 'lab-qtc',
        name: 'ECG QTc Interval',
        value: `${qtc}`,
        numericValue: qtc,
        unit: 'ms',
        referenceRange: '< 450 ms (Female)',
        status: qtc > 460 ? 'Critical' : 'Borderline',
        category: 'Cardiac / Vitals',
        recordedDate: 'Today, 08:15',
        kgPath: [
          {
            sourceNode: `Lab: QTc ${qtc} ms`,
            sourceType: 'LOINC: 8639-2',
            relationship: 'INDICATES_DELAYED_REPOLARIZATION',
            targetNode: 'Target: KCNH2 (hERG Potassium Channel)',
            targetType: 'Gene / Protein',
            clinicalConsequence: 'Channel blockade slowing cardiac action potential recovery'
          },
          {
            sourceNode: 'Target: hERG Potassium Channel',
            sourceType: 'Target',
            relationship: 'BLOCKED_BY_COMBINATION',
            targetNode: 'Drugs: Amiodarone + Fluoxetine',
            targetType: 'Polypharmacy Pair',
            clinicalConsequence: 'Additive pharmacological inhibition increasing Torsades de Pointes risk'
          }
        ],
        defaultExplanation: `The heart's electrical recovery time (QTc) is prolonged at ${qtc} ms (normal is under 450 ms). This occurs because Amiodarone and Fluoxetine combined slow down the heart's electrical recharging cycle.`
      },
      {
        id: 'lab-magnesium',
        name: 'Serum Magnesium (Mg²⁺)',
        value: '1.6',
        numericValue: 1.6,
        unit: 'mg/dL',
        referenceRange: '1.7 – 2.2 mg/dL',
        status: 'Borderline',
        category: 'Electrolytes',
        recordedDate: 'Today, 07:30',
        kgPath: [
          {
            sourceNode: 'Lab: Magnesium 1.6 mg/dL',
            sourceType: 'LOINC: 2601-3',
            relationship: 'EXACERBATES_SENSITIVITY',
            targetNode: 'Electrolyte Pathway: Cardiac Membrane Stability',
            targetType: 'Physiological Pathway',
            clinicalConsequence: 'Low magnesium lowers the threshold for drug-induced arrhythmias'
          }
        ],
        defaultExplanation: `Serum magnesium is slightly low at 1.6 mg/dL. Magnesium stabilizes the heart's muscle cells; when low, the heart becomes more sensitive to drug-induced rhythm changes.`
      },
      {
        id: 'lab-potassium',
        name: 'Serum Potassium (K⁺)',
        value: '3.6',
        numericValue: 3.6,
        unit: 'mEq/L',
        referenceRange: '3.5 – 5.0 mEq/L',
        status: 'Normal',
        category: 'Electrolytes',
        recordedDate: 'Today, 07:30',
        kgPath: [
          {
            sourceNode: 'Lab: Potassium 3.6 mEq/L',
            sourceType: 'LOINC: 2823-3',
            relationship: 'MAINTAINS_HOMEOSTASIS',
            targetNode: 'Electrolyte Pathway: Potassium Balance',
            targetType: 'Pathway',
            clinicalConsequence: 'Low-normal range; keep > 4.0 mEq/L for patients on QTc-prolonging agents'
          }
        ],
        defaultExplanation: `Potassium level is within normal range at 3.6 mEq/L, but clinicians prefer keeping it above 4.0 mEq/L when patients are taking antiarrhythmics.`
      },
      {
        id: 'lab-creat',
        name: 'Serum Creatinine',
        value: `${creat}`,
        numericValue: creat,
        unit: 'mg/dL',
        referenceRange: '0.6 – 1.1 mg/dL',
        status: creat > 1.2 ? 'Abnormal' : 'Normal',
        category: 'Renal',
        recordedDate: 'Today, 07:30',
        kgPath: [
          {
            sourceNode: `Lab: Creatinine ${creat} mg/dL`,
            sourceType: 'LOINC: 2160-0',
            relationship: 'CORRELATES_WITH',
            targetNode: `eGFR ${egfr} mL/min`,
            targetType: 'Renal Metric',
            clinicalConsequence: 'Elevated waste byproduct confirming reduced glomerular filtration'
          }
        ],
        defaultExplanation: `Serum creatinine is elevated at ${creat} mg/dL (normal is 0.6–1.1 mg/dL). Creatinine is a waste product filtered by the kidneys; higher levels reflect slower kidney clearance.`
      },
      {
        id: 'lab-inr',
        name: 'Coagulation INR (Prothrombin Time)',
        value: '2.6',
        numericValue: 2.6,
        unit: 'Ratio',
        referenceRange: '2.0 – 3.0 (Therapeutic)',
        status: 'Normal',
        category: 'Coagulation',
        recordedDate: 'Yesterday, 16:00',
        kgPath: [
          {
            sourceNode: 'Lab: INR 2.6',
            sourceType: 'LOINC: 6301-6',
            relationship: 'TARGETS_ANTICOAGULATION',
            targetNode: 'Drug: Warfarin Sodium',
            targetType: 'RxNorm: 11289',
            clinicalConsequence: 'Therapeutic range achieved for stroke prevention in Atrial Fibrillation'
          }
        ],
        defaultExplanation: `INR is in the optimal target range (2.6) for stroke prevention on Warfarin therapy.`
      }
    ];
  }, [patient]);

  const [selectedLabId, setSelectedLabId] = useState<string>(labResults[0]?.id || 'lab-egfr');
  const [insightText, setInsightText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'plain' | 'kg_path'>('plain');

  const selectedLab = useMemo(() => {
    return labResults.find(l => l.id === selectedLabId) || labResults[0];
  }, [labResults, selectedLabId]);

  // Fetch AI Knowledge Graph Explanation for selected lab
  const fetchLabInsight = async (labItem: LabResultItem) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/gemini/lab-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          labName: labItem.name,
          labValue: `${labItem.value} ${labItem.unit}`,
          referenceRange: labItem.referenceRange,
          patient,
          kgNodes: labItem.kgPath
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }

      const data = await response.json();
      setInsightText(data.text || labItem.defaultExplanation);
    } catch (_err) {
      // Fallback text
      setInsightText(
        `**Knowledge Graph Context for ${labItem.name} (${labItem.value} ${labItem.unit})**\n\n**Plain-Language Explanation:**\n${labItem.defaultExplanation}\n\n**Biomedical Knowledge Graph Connection:**\n• ${labItem.kgPath.map(p => `\`[${p.sourceNode}]\` --(${p.relationship})--> \`[${p.targetNode}]\``).join('\n• ')}\n\n**Clinical Impact:**\n${labItem.kgPath[0]?.clinicalConsequence || 'Requires monitoring by care team.'}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedLab) {
      fetchLabInsight(selectedLab);
    }
  }, [selectedLabId, patient.id]);

  const handleCopy = () => {
    navigator.clipboard.writeText(insightText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const getStatusBadge = (status: LabResultItem['status']) => {
    switch (status) {
      case 'Critical':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/50';
      case 'Abnormal':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      case 'Borderline':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50';
      case 'Normal':
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-xl space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-start gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 shrink-0">
            <FlaskConical className="w-6 h-6 animate-pulse text-indigo-400" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-extrabold text-white">{title}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                <Network className="w-3 h-3 text-cyan-400" />
                Knowledge Graph RAG
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
          </div>
        </div>

        {/* View Switcher & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="p-1 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-1 text-xs">
            <button
              onClick={() => setViewMode('plain')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'plain'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Plain Language
            </button>
            <button
              onClick={() => setViewMode('kg_path')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'kg_path'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              KG Graph Nodes
            </button>
          </div>

          <button
            onClick={() => fetchLabInsight(selectedLab)}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
            title="Refresh Knowledge Graph AI Insight"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          <button
            onClick={handleCopy}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
            title="Copy Insight"
          >
            {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Content Layout: Grid with Lab Selection Cards on Left + KG Insight on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Recent Lab Test Cards */}
        <div className="lg:col-span-5 space-y-2.5">
          <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Recent Patient Lab Panel</span>
            </span>
            <span className="text-[10px] text-slate-500">{labResults.length} Tests Recorded</span>
          </div>

          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {labResults.map((lab) => {
              const isSelected = lab.id === selectedLabId;
              const statusClass = getStatusBadge(lab.status);

              return (
                <div
                  key={lab.id}
                  onClick={() => setSelectedLabId(lab.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-slate-950 border-cyan-500/80 ring-2 ring-cyan-500/20 shadow-lg'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950/90'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-extrabold text-sm text-white flex items-center gap-2">
                      <span>{lab.name}</span>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-extrabold border ${statusClass}`}>
                      {lab.status}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between font-mono">
                    <div className="text-base font-extrabold text-cyan-300">
                      {lab.value} <span className="text-xs font-normal text-slate-400">{lab.unit}</span>
                    </div>

                    <div className="text-[10px] text-slate-400">
                      Ref: <span className="text-slate-300">{lab.referenceRange}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono border-t border-slate-900 pt-1.5">
                    <span>Category: {lab.category}</span>
                    <span>{lab.recordedDate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Knowledge Graph Explanation Display Panel */}
        <div className="lg:col-span-7 space-y-4 flex flex-col">
          
          {/* Selected Lab Overview Banner */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                Active Knowledge Graph Target
              </span>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>{selectedLab.name}</span>
                <span className="text-cyan-300 font-mono text-sm">({selectedLab.value} {selectedLab.unit})</span>
              </h3>
            </div>

            <div className="text-right font-mono text-xs">
              <div className="text-slate-400 text-[10px]">Reference Range</div>
              <div className="font-bold text-slate-200">{selectedLab.referenceRange}</div>
            </div>
          </div>

          {/* Knowledge Graph Pathway Visualization Node Flow */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="text-xs font-mono font-bold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Network className="w-4 h-4 text-cyan-400" />
                <span>Knowledge Graph Pathway Nodes & Edges</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">SNOMED / LOINC / RxNorm Linked</span>
            </div>

            <div className="space-y-2">
              {selectedLab.kgPath.map((path, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/90 space-y-2 text-xs">
                  {/* Connected Node Chain */}
                  <div className="flex items-center gap-2 flex-wrap font-mono text-[11px]">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold">
                      {path.sourceNode}
                    </span>

                    <div className="flex items-center gap-1 text-cyan-400 font-bold text-[10px]">
                      <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                      <span>{path.relationship}</span>
                      <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                    </div>

                    <span className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
                      {path.targetNode}
                    </span>
                  </div>

                  {/* Clinical Consequence */}
                  <div className="text-[11px] text-slate-300 flex items-start gap-2 pt-1 border-t border-slate-800/80">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong>Mechanism:</strong> {path.clinicalConsequence}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI LLM Plain-Language Explanation Text Box */}
          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 min-h-[160px]">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>AI Plain-Language Clinical Context</span>
              </span>
              <span className="text-[10px] font-mono text-cyan-400">Gemini 3.6 Flash</span>
            </div>

            {isLoading ? (
              <div className="py-8 flex flex-col items-center justify-center space-y-2 text-cyan-400">
                <RefreshCw className="w-6 h-6 animate-spin" />
                <span className="text-xs font-mono text-slate-400 animate-pulse">
                  Traversing Knowledge Graph ontology & generating plain-language insight...
                </span>
              </div>
            ) : (
              <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line prose prose-invert max-w-none">
                {insightText}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default LabResultInsight;
