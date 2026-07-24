import React, { useState } from 'react';
import { Pill, Plus, Trash2, AlertTriangle, ShieldCheck, Search, Info } from 'lucide-react';
import { Patient, PrescribedDrug } from '../../types/pharmaguard';
import { INITIAL_PATIENTS } from '../../data/mockClinicalData';

interface DrugPrescriptionViewProps {
  patient?: Patient;
  onUpdatePatient?: (updated: Patient) => void;
}

export const DrugPrescriptionView: React.FC<DrugPrescriptionViewProps> = ({ patient, onUpdatePatient }) => {
  const activePatient = patient || INITIAL_PATIENTS[0];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDrugToAdd, setSelectedDrugToAdd] = useState<string>('Apixaban');
  const [doseMg, setDoseMg] = useState<number>(2.5);
  const [frequency, setFrequency] = useState<string>('Twice Daily');

  const catalog: { name: string; rxNorm: string; category: string; cyp: string[]; target: string; defaultDose: number; warning?: string }[] = [
    { name: 'Apixaban', rxNorm: 'RxNorm: 1364430', category: 'Factor Xa Inhibitor DOAC', cyp: ['CYP3A4', 'P-gp'], target: 'Factor Xa', defaultDose: 2.5, warning: 'Reduce dose to 2.5mg BID if Cr >= 1.5 or Age >= 80.' },
    { name: 'Sertraline', rxNorm: 'RxNorm: 36437', category: 'SSRI Antidepressant', cyp: ['CYP2C19', 'CYP3A4'], target: 'SLC6A4', defaultDose: 50, warning: 'Lower CYP2D6 inhibition compared to Fluoxetine.' },
    { name: 'Pantoprazole', rxNorm: 'RxNorm: 13612', category: 'Proton Pump Inhibitor', cyp: ['CYP2C19'], target: 'H+/K+ ATPase', defaultDose: 40, warning: 'Safe PPI alternative with minimal CYP2C19 inhibition of Clopidogrel.' },
    { name: 'Digoxin', rxNorm: 'RxNorm: 3407', category: 'Cardiac Glycoside', cyp: ['P-gp Renal Clearance'], target: 'Na+/K+ ATPase', defaultDose: 0.125, warning: 'High toxicity risk in CKD; Amiodarone increases digoxin levels by 70%.' },
    { name: 'Spironolactone', rxNorm: 'RxNorm: 9997', category: 'Aldosterone Antagonist', cyp: ['Hepatic Clearance'], target: 'Mineralocorticoid Receptor', defaultDose: 25, warning: 'Risk of hyperkalemia when combined with ACEi/ARBs in CKD.' }
  ];

  const handleAddDrug = () => {
    const drugInfo = catalog.find(c => c.name === selectedDrugToAdd);
    if (!drugInfo) return;

    const newMed: PrescribedDrug = {
      id: `med-${Date.now()}`,
      rxNormCode: drugInfo.rxNorm,
      name: drugInfo.name,
      genericName: drugInfo.name,
      brandName: drugInfo.name,
      doseMg: doseMg,
      frequency: frequency,
      route: 'Oral',
      startDate: new Date().toISOString().split('T')[0],
      indication: 'Clinical Prescription',
      category: drugInfo.category,
      halfLifeHours: 12,
      cypMetabolism: drugInfo.cyp,
      primaryTarget: drugInfo.target,
      transporters: ['P-gp']
    };

    const updatedMedications = [...activePatient.activeMedications, newMed];
    if (onUpdatePatient) {
      onUpdatePatient({
        ...activePatient,
        activeMedications: updatedMedications
      });
    }
  };

  const handleRemoveDrug = (id: string) => {
    const updatedMedications = activePatient.activeMedications.filter(m => m.id !== id);
    if (onUpdatePatient) {
      onUpdatePatient({
        ...activePatient,
        activeMedications: updatedMedications
      });
    }
  };

  return (
    <div className="space-y-6 text-slate-100 max-w-7xl mx-auto pb-10">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Drug & Prescription Regimen Management</h1>
            <p className="text-xs text-slate-400">
              RxNorm-standardized prescription builder with real-time renal dosing guidance and pharmacogenomic contraindication warnings.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Medications List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center justify-between border-b border-slate-800 pb-3">
              <span>Active Regimen for {activePatient.name} ({activePatient.activeMedications.length} Drugs)</span>
              <span className="text-xs text-cyan-300 font-semibold">eGFR: {activePatient.kidneyFunction.egfr} mL/min</span>
            </h2>

            <div className="space-y-3">
              {activePatient.activeMedications.map((med) => (
                <div key={med.id} className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-white">{med.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-cyan-300 font-bold">{med.doseMg}mg</span>
                      <span className="text-xs text-slate-400">({med.frequency})</span>
                    </div>
                    <div className="text-xs text-slate-300">{med.category} • <span className="text-slate-400 font-mono">{med.rxNormCode}</span></div>
                    <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-2 pt-1">
                      <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
                        Target: {med.primaryTarget}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">
                        Metabolism: {med.cypMetabolism.join(', ')}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                        P-gp Transporter
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveDrug(med.id)}
                    className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors cursor-pointer"
                    title="Remove Medication"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Add New Prescription Catalog Form */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Plus className="w-5 h-5 text-cyan-400" />
              <span>Add RxNorm Medication</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Select Candidate Drug</label>
                <select
                  value={selectedDrugToAdd}
                  onChange={(e) => {
                    const found = catalog.find(c => c.name === e.target.value);
                    setSelectedDrugToAdd(e.target.value);
                    if (found) setDoseMg(found.defaultDose);
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  {catalog.map(c => (
                    <option key={c.name} value={c.name}>{c.name} ({c.category})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Dose (mg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={doseMg}
                    onChange={(e) => setDoseMg(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="Once Daily">Once Daily</option>
                    <option value="Twice Daily">Twice Daily</option>
                    <option value="Three Times Daily">Three Times Daily</option>
                    <option value="Once Weekly">Once Weekly</option>
                  </select>
                </div>
              </div>

              {/* Safety Warning Guidance Banner */}
              {catalog.find(c => c.name === selectedDrugToAdd)?.warning && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] leading-relaxed flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{catalog.find(c => c.name === selectedDrugToAdd)?.warning}</span>
                </div>
              )}

              <button
                onClick={handleAddDrug}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md cursor-pointer transition-all mt-2"
              >
                Add Prescription & Run Interaction Audit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
