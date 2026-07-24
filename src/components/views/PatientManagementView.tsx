import React, { useState } from 'react';
import { Users, User, Heart, Activity, Dna, AlertCircle, Plus, Search, ShieldAlert, Check } from 'lucide-react';
import { Patient } from '../../types/pharmaguard';

interface PatientManagementViewProps {
  patients: Patient[];
  selectedPatient?: Patient;
  selectedPatientId?: string;
  onSelectPatient?: (patient: Patient) => void;
  onSelectPatientId?: (id: string) => void;
  onAddPatient?: (patient: Patient) => void;
}

export const PatientManagementView: React.FC<PatientManagementViewProps> = ({
  patients,
  selectedPatient,
  selectedPatientId,
  onSelectPatient,
  onSelectPatientId,
  onAddPatient
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const activeSelectedId = selectedPatientId || selectedPatient?.id || patients[0]?.id;

  // New Patient Form State
  const [newName, setNewName] = useState('');
  const [newMrn, setNewMrn] = useState(`MRN-${Math.floor(1000000 + Math.random() * 9000000)}`);
  const [newAge, setNewAge] = useState('62');
  const [newGender, setNewGender] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [newDiagnosis, setNewDiagnosis] = useState('Atrial Fibrillation & Hypertension');
  const [newEgfr, setNewEgfr] = useState('45');
  const [newCyp2d6, setNewCyp2d6] = useState<'Poor Metabolizer' | 'Intermediate Metabolizer' | 'Normal Metabolizer' | 'Ultra-rapid Metabolizer'>('Intermediate Metabolizer');

  const filtered = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.mrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.primaryDiagnosis.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    const created: Patient = {
      id: `pat-${Date.now()}`,
      mrn: newMrn,
      name: newName,
      age: parseInt(newAge) || 60,
      gender: newGender,
      weightKg: 70,
      heightCm: 168,
      bmi: 24.8,
      primaryDiagnosis: newDiagnosis,
      icd10Code: 'I48.0',
      allergies: ['Penicillin'],
      kidneyFunction: {
        egfr: parseInt(newEgfr) || 45,
        serumCreatinine: 1.5,
        stage: 'Stage 3a (Mild to Moderate)'
      },
      liverFunction: {
        alt: 25,
        ast: 28,
        bilirubin: 0.8,
        childPughScore: 'Class A'
      },
      genetics: {
        cyp2d6: newCyp2d6,
        cyp3a4: 'Normal',
        cyp2c19: 'Normal Metabolizer',
        hlaB5701: 'Negative'
      },
      vitals: {
        bpSystolic: 130,
        bpDiastolic: 80,
        heartRate: 78,
        qtcIntervalMs: 440
      },
      comorbidities: ['Hypertension'],
      riskCategory: 'Moderate',
      riskScorePercent: 62.0,
      activeMedications: [
        {
          id: `med-${Date.now()}-1`,
          rxNormCode: 'RxNorm: 32968',
          name: 'Amiodarone',
          genericName: 'Amiodarone',
          brandName: 'Pacerone',
          doseMg: 200,
          frequency: 'Once Daily',
          route: 'Oral',
          startDate: '2026-01-01',
          indication: 'Atrial Fibrillation',
          category: 'Antiarrhythmic',
          halfLifeHours: 1000,
          cypMetabolism: ['CYP3A4', 'CYP2D6'],
          primaryTarget: 'KCNH2',
          transporters: ['P-gp']
        }
      ]
    };
    if (onAddPatient) onAddPatient(created);
    if (onSelectPatient) onSelectPatient(created);
    if (onSelectPatientId) onSelectPatientId(created.id);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 text-slate-100 max-w-7xl mx-auto pb-10">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Patient Clinical Registry (FHIR R4 Format)</h1>
              <p className="text-xs text-slate-400">
                Manage longitudinal electronic health records, pharmacogenomics, organ parameters, and active prescriptions.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Enroll New Patient Twin</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by Patient Name, MRN, or Diagnosis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Patient Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((patient) => {
          const isSelected = activeSelectedId === patient.id;
          return (
            <div
              key={patient.id}
              onClick={() => {
                if (onSelectPatient) onSelectPatient(patient);
                if (onSelectPatientId) onSelectPatientId(patient.id);
              }}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                isSelected
                  ? 'bg-slate-800/90 border-cyan-500 shadow-xl shadow-cyan-950/30'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-cyan-400" />
                    <span className="font-extrabold text-sm text-white">{patient.name}</span>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                    patient.riskCategory === 'Critical' 
                      ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30' 
                      : patient.riskCategory === 'High'
                      ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {patient.riskCategory} Risk ({patient.riskScorePercent}%)
                  </span>
                </div>

                <div className="text-xs text-slate-400 font-medium">
                  {patient.mrn} • {patient.age} y/o {patient.gender} • BMI {patient.bmi}
                </div>

                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/80 text-xs space-y-1">
                  <div className="text-slate-400 font-semibold text-[11px]">Primary Diagnosis:</div>
                  <div className="text-slate-200 font-medium leading-snug">{patient.primaryDiagnosis}</div>
                </div>

                {/* Lab Vitals & Pharmacogenomics Summary */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Renal eGFR</span>
                    <strong className="text-cyan-300 font-bold">{patient.kidneyFunction.egfr} mL/min</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">CYP2D6 Phenotype</span>
                    <strong className="text-indigo-300 font-bold">{patient.genetics.cyp2d6}</strong>
                  </div>
                </div>

                <div className="text-xs text-slate-400">
                  Active Prescriptions: <span className="text-slate-200 font-bold">{patient.activeMedications.length} Medications</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                {isSelected ? (
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <Check className="w-4 h-4" /> Active Selection
                  </span>
                ) : (
                  <button
                    onClick={() => onSelectPatient(patient)}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Select Active Patient
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-400" />
                <span>Enroll New Digital Patient Twin</span>
              </h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Full Patient Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Samuel Jackson"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Age</label>
                  <input
                    type="number"
                    value={newAge}
                    onChange={(e) => setNewAge(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Gender</label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Primary Clinical Diagnosis</label>
                <input
                  type="text"
                  value={newDiagnosis}
                  onChange={(e) => setNewDiagnosis(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Renal eGFR (mL/min/1.73m2)</label>
                  <input
                    type="number"
                    value={newEgfr}
                    onChange={(e) => setNewEgfr(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">CYP2D6 Genotype</label>
                  <select
                    value={newCyp2d6}
                    onChange={(e) => setNewCyp2d6(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Poor Metabolizer">Poor Metabolizer</option>
                    <option value="Intermediate Metabolizer">Intermediate Metabolizer</option>
                    <option value="Normal Metabolizer">Normal Metabolizer</option>
                    <option value="Ultra-rapid Metabolizer">Ultra-rapid Metabolizer</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 font-bold text-white shadow-md cursor-pointer mt-2"
              >
                Save & Initialize Patient Twin
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
