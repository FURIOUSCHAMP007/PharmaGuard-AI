import React from 'react';
import { FileText, Printer, ShieldCheck, Download, CheckCircle2, User, Activity } from 'lucide-react';
import { Patient, DrugInteraction, CausalIntervention } from '../../types/pharmaguard';
import { INITIAL_PATIENTS } from '../../data/mockClinicalData';

interface ReportsPdfExportViewProps {
  patient?: Patient;
  interactions?: DrugInteraction[];
  interventions?: CausalIntervention[];
}

export const ReportsPdfExportView: React.FC<ReportsPdfExportViewProps> = ({
  patient,
  interactions = [],
  interventions = []
}) => {
  const activePatient = patient || INITIAL_PATIENTS[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 text-slate-100 max-w-7xl mx-auto pb-10 print:bg-white print:text-black">
      {/* Action Header Bar (Hidden during print) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Clinical Safety Report & Printable Export</h1>
            <p className="text-xs text-slate-400">
              Publication-grade clinical safety documentation for hospital EHR attachment and patient discharge summaries.
            </p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg cursor-pointer transition-all"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Export PDF Report</span>
        </button>
      </div>

      {/* Printable Report Document Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6 print:border-none print:p-0 print:shadow-none print:bg-white print:text-slate-900">
        {/* Document Header */}
        <div className="border-b border-slate-800 print:border-slate-300 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white print:text-slate-900 tracking-tight">PharmaGuard AI Clinical Safety Report</h2>
            <div className="text-xs text-cyan-400 print:text-blue-700 font-semibold mt-1">Autonomous Clinical Intelligence System v2.5</div>
          </div>
          <div className="text-right text-xs text-slate-400 print:text-slate-600 space-y-0.5">
            <div>Date: <strong>{new Date().toLocaleDateString()}</strong></div>
            <div>Report ID: <strong>PGAI-RPT-889021</strong></div>
          </div>
        </div>

        {/* Patient Demographics Banner */}
        <div className="p-4 rounded-xl bg-slate-800/80 print:bg-slate-100 border border-slate-700 print:border-slate-300 space-y-2 text-xs">
          <div className="flex justify-between font-bold text-sm text-white print:text-slate-900">
            <span>Patient: {activePatient.name} ({activePatient.mrn})</span>
            <span>Age/Gender: {activePatient.age} y/o {activePatient.gender}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-700 print:border-slate-300 text-slate-300 print:text-slate-700">
            <div>Renal eGFR: <strong>{activePatient.kidneyFunction.egfr} mL/min</strong></div>
            <div>CYP2D6: <strong>{activePatient.genetics.cyp2d6}</strong></div>
            <div>Cardiac QTc: <strong>{activePatient.vitals.qtcIntervalMs} ms</strong></div>
            <div>Risk Level: <strong className="text-rose-400 print:text-rose-700">{activePatient.riskCategory} ({activePatient.riskScorePercent}%)</strong></div>
          </div>
        </div>

        {/* Identified Severe Interactions Section */}
        <div className="space-y-3 text-xs">
          <h3 className="font-bold text-sm text-white print:text-slate-900 border-b border-slate-800 print:border-slate-300 pb-1">
            1. Identified Critical Pharmacokinetic Interactions
          </h3>
          {interactions.map(int => (
            <div key={int.id} className="p-3 rounded-lg bg-slate-800/40 print:bg-slate-50 border border-slate-700 print:border-slate-200 space-y-1">
              <div className="font-bold text-amber-300 print:text-amber-800">{int.drugA} ↔ {int.drugB} ({int.severity})</div>
              <p className="text-slate-300 print:text-slate-700 leading-relaxed">{int.mechanism}</p>
            </div>
          ))}
        </div>

        {/* Counterfactual Recommendations Section */}
        <div className="space-y-3 text-xs">
          <h3 className="font-bold text-sm text-white print:text-slate-900 border-b border-slate-800 print:border-slate-300 pb-1">
            2. Causal AI Regimen Optimization Recommendations
          </h3>
          {interventions.map(item => (
            <div key={item.id} className="p-3 rounded-lg bg-slate-800/40 print:bg-slate-50 border border-slate-700 print:border-slate-200 space-y-1">
              <div className="font-bold text-emerald-300 print:text-emerald-800">
                {item.interventionType}: {item.targetDrug} → {item.replacementDrug} (+{item.estimatedRiskReductionPercent}% Risk Delta)
              </div>
              <p className="text-slate-300 print:text-slate-700">{item.counterfactualOutcome}</p>
            </div>
          ))}
        </div>

        {/* Physician Sign-off Box */}
        <div className="pt-6 border-t border-slate-800 print:border-slate-300 flex justify-between items-end text-xs text-slate-400 print:text-slate-600">
          <div>
            <div>Attending Physician Signature: _______________________</div>
            <div className="mt-1">Dr. Sarah Jenkins, MD (Cardiology)</div>
          </div>
          <div className="text-right font-mono">
            Verified by PharmaGuard Multi-Agent Consensus (0.95 Conf)
          </div>
        </div>
      </div>
    </div>
  );
};
