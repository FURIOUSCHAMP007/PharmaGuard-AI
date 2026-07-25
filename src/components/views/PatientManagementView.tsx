import React, { useState } from 'react';
import { Users, User, Heart, Activity, Dna, AlertCircle, Plus, Search, ShieldAlert, Check, CheckSquare, Square, Download, BarChart2, FileText, X, FileSpreadsheet, Sparkles, Layers, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { Patient } from '../../types/pharmaguard';
import { VitalsHistory } from '../VitalsHistory';

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
  const [selectedForBulk, setSelectedForBulk] = useState<string[]>([]);
  const [showBatchRiskModal, setShowBatchRiskModal] = useState(false);
  const [analysisTab, setAnalysisTab] = useState<'overview' | 'comparison'>('overview');
  const [bulkExportToast, setBulkExportToast] = useState<string | null>(null);

  const activeSelectedId = selectedPatientId || selectedPatient?.id || patients[0]?.id;
  const activePatient = patients.find(p => p.id === activeSelectedId) || patients[0];

  // New Patient Form State
  const [newName, setNewName] = useState('');
  const [newMrn, setNewMrn] = useState(`MRN-${Math.floor(1000000 + Math.random() * 9000000)}`);
  const [newAge, setNewAge] = useState('62');
  const [newGender, setNewGender] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [newDiagnosis, setNewDiagnosis] = useState('Atrial Fibrillation & Hypertension');
  const [newEgfr, setNewEgfr] = useState('45');
  const [newCreatinine, setNewCreatinine] = useState('1.5');
  const [newQtc, setNewQtc] = useState('450');
  const [newPotassium, setNewPotassium] = useState('4.2');
  const [newMeds, setNewMeds] = useState('Amiodarone 200mg QD, Metformin 500mg BID');
  const [newCyp2d6, setNewCyp2d6] = useState<'Poor Metabolizer' | 'Intermediate Metabolizer' | 'Normal Metabolizer' | 'Ultra-rapid Metabolizer'>('Intermediate Metabolizer');

  const filtered = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.mrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.primaryDiagnosis.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelectPatient = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedForBulk(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedForBulk.length === filtered.length) {
      setSelectedForBulk([]);
    } else {
      setSelectedForBulk(filtered.map(p => p.id));
    }
  };

  const handleBulkExportJSON = () => {
    const selectedPatientsData = patients.filter(p => selectedForBulk.includes(p.id));
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(selectedPatientsData, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `pharmaguard_cohort_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setBulkExportToast(`Exported ${selectedPatientsData.length} patient records as FHIR JSON.`);
    setTimeout(() => setBulkExportToast(null), 4000);
  };

  const handleBulkExportCSV = () => {
    const selectedPatientsData = patients.filter(p => selectedForBulk.includes(p.id));
    const headers = ['MRN', 'Name', 'Age', 'Gender', 'Diagnosis', 'RiskCategory', 'RiskScore', 'eGFR', 'CYP2D6', 'ActiveMedsCount'];
    const rows = selectedPatientsData.map(p => [
      p.mrn,
      `"${p.name}"`,
      p.age,
      p.gender,
      `"${p.primaryDiagnosis}"`,
      p.riskCategory,
      p.riskScorePercent,
      p.kidneyFunction.egfr,
      p.genetics.cyp2d6,
      p.activeMedications.length
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pharmaguard_patients_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    setBulkExportToast(`Exported ${selectedPatientsData.length} patient records as CSV.`);
    setTimeout(() => setBulkExportToast(null), 4000);
  };

  const selectedPatientsList = patients.filter(p => selectedForBulk.includes(p.id));

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    const parsedEgfr = parseInt(newEgfr) || 45;
    const parsedQtc = parseInt(newQtc) || 440;
    const parsedCr = parseFloat(newCreatinine) || 1.5;

    // Parse meds from comma list
    const medNames = newMeds.split(',').map(m => m.trim()).filter(Boolean);
    const parsedMedications = medNames.map((mName, i) => ({
      id: `med-${Date.now()}-${i}`,
      rxNormCode: `RxNorm: ${30000 + i * 142}`,
      name: mName.split(' ')[0] || 'Medication',
      genericName: mName.split(' ')[0] || 'Medication',
      brandName: mName.split(' ')[0] || 'Medication',
      doseMg: parseInt(mName.match(/\d+/)?.[0] || '100'),
      frequency: mName.toLowerCase().includes('bid') ? 'Twice Daily' : 'Once Daily',
      route: 'Oral' as const,
      startDate: '2026-01-01',
      indication: newDiagnosis,
      category: 'Therapeutic Agent',
      halfLifeHours: 24,
      cypMetabolism: ['CYP3A4', 'CYP2D6'],
      primaryTarget: 'Enzyme',
      transporters: ['P-gp']
    }));

    const calculatedRiskScore = Math.min(
      98,
      Math.max(
        15,
        (parsedEgfr < 45 ? 35 : 15) +
        (parsedQtc > 470 ? 35 : 15) +
        (newCyp2d6 === 'Poor Metabolizer' ? 20 : 5)
      )
    );

    const created: Patient = {
      id: `pat-${Date.now()}`,
      mrn: newMrn,
      name: newName,
      age: parseInt(newAge) || 60,
      gender: newGender,
      weightKg: 72,
      heightCm: 170,
      bmi: 24.9,
      primaryDiagnosis: newDiagnosis,
      icd10Code: 'I48.0',
      allergies: ['Penicillin'],
      kidneyFunction: {
        egfr: parsedEgfr,
        serumCreatinine: parsedCr,
        stage: parsedEgfr < 30 ? 'Stage 4 (Severe)' : parsedEgfr < 60 ? 'Stage 3a/3b' : 'Stage 1/2'
      },
      liverFunction: {
        alt: 28,
        ast: 24,
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
        bpSystolic: 128,
        bpDiastolic: 82,
        heartRate: 74,
        qtcIntervalMs: parsedQtc
      },
      comorbidities: [newDiagnosis],
      riskCategory: calculatedRiskScore > 75 ? 'Critical' : calculatedRiskScore > 45 ? 'High' : 'Moderate',
      riskScorePercent: parseFloat(calculatedRiskScore.toFixed(1)),
      activeMedications: parsedMedications.length > 0 ? parsedMedications : [
        {
          id: `med-${Date.now()}-default`,
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

        {/* Search Bar & Multi-Select Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by Patient Name, MRN, or Diagnosis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            onClick={handleSelectAll}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            {selectedForBulk.length === filtered.length && filtered.length > 0 ? (
              <CheckSquare className="w-4 h-4 text-cyan-400" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
            <span>{selectedForBulk.length === filtered.length && filtered.length > 0 ? 'Deselect All' : 'Select All'}</span>
          </button>
        </div>

        {/* Bulk Action Bar (Visible when patients are selected) */}
        {selectedForBulk.length > 0 && (
          <div className="sticky top-4 z-20 p-3 bg-slate-900/95 backdrop-blur-md border border-cyan-500/50 rounded-xl flex flex-wrap items-center justify-between gap-3 animate-fadeIn shadow-xl shadow-cyan-950/30">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
              <CheckSquare className="w-4 h-4 text-cyan-400" />
              <span>{selectedForBulk.length} Patient{selectedForBulk.length > 1 ? 's' : ''} Selected</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleBulkExportJSON}
                className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>Export FHIR JSON</span>
              </button>

              <button
                onClick={handleBulkExportCSV}
                className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={() => setShowBatchRiskModal(true)}
                className="bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all shadow-md"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>Batch Risk Assessment</span>
              </button>

              <button
                onClick={() => setSelectedForBulk([])}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
                title="Clear Selection"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {bulkExportToast && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-bold rounded-xl flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{bulkExportToast}</span>
          </div>
        )}
      </div>

      {/* Patient Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((patient) => {
          const isSelected = activeSelectedId === patient.id;
          const isBulkChecked = selectedForBulk.includes(patient.id);

          return (
            <div
              key={patient.id}
              onClick={() => {
                if (onSelectPatient) onSelectPatient(patient);
                if (onSelectPatientId) onSelectPatientId(patient.id);
              }}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 relative ${
                isBulkChecked
                  ? 'bg-slate-800/95 border-cyan-400 shadow-xl shadow-cyan-950/40 ring-1 ring-cyan-500/50'
                  : isSelected
                  ? 'bg-slate-800/90 border-indigo-500 shadow-xl shadow-indigo-950/30'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => toggleSelectPatient(patient.id, e)}
                      className="p-1 rounded hover:bg-slate-700/80 transition-colors text-slate-400 cursor-pointer"
                      title={isBulkChecked ? "Deselect for bulk action" : "Select for bulk action"}
                    >
                      {isBulkChecked ? (
                        <CheckSquare className="w-5 h-5 text-cyan-400" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-500 hover:text-slate-300" />
                      )}
                    </button>
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

      {/* Selected Patient Vitals Trend & Historical Charting */}
      {activePatient && (
        <VitalsHistory patient={activePatient} />
      )}

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-xl w-full space-y-4 my-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-400" />
                <span>Custom Patient Twin Builder</span>
              </h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-400 mb-1">Full Patient Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Samuel Jackson"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">MRN Number</label>
                  <input
                    type="text"
                    value={newMrn}
                    onChange={(e) => setNewMrn(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
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
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
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

              {/* Organ Lab Parameters */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="text-cyan-300 font-bold text-[11px]">Organ Function & Vital Signs</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1">eGFR (mL/min)</label>
                    <input
                      type="number"
                      value={newEgfr}
                      onChange={(e) => setNewEgfr(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-white font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1">Creatinine (mg/dL)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newCreatinine}
                      onChange={(e) => setNewCreatinine(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-white font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1">Cardiac QTc (ms)</label>
                    <input
                      type="number"
                      value={newQtc}
                      onChange={(e) => setNewQtc(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-white font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1">Potassium K+ (mmol/L)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newPotassium}
                      onChange={(e) => setNewPotassium(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-white font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>

              {/* Genotype & Active Prescriptions */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">CYP2D6 Phenotype</label>
                  <select
                    value={newCyp2d6}
                    onChange={(e) => setNewCyp2d6(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="Poor Metabolizer">Poor Metabolizer</option>
                    <option value="Intermediate Metabolizer">Intermediate Metabolizer</option>
                    <option value="Normal Metabolizer">Normal Metabolizer</option>
                    <option value="Ultra-rapid Metabolizer">Ultra-rapid Metabolizer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Active Prescriptions (Comma-separated)</label>
                  <input
                    type="text"
                    placeholder="Amiodarone 200mg, Metformin 500mg"
                    value={newMeds}
                    onChange={(e) => setNewMeds(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 font-bold text-white shadow-md cursor-pointer mt-2 transition-all"
              >
                Initialize Custom Patient Twin
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Batch Risk Assessment Analysis Modal */}
      {showBatchRiskModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl w-full space-y-5 text-slate-100 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Cohort Batch Risk Assessment Analysis</h2>
                  <p className="text-xs text-slate-400">
                    Cross-sectional population evaluation across {selectedPatientsList.length} selected patient twin{selectedPatientsList.length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowBatchRiskModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Cohort Batch Risk Assessment & Comparative Analysis</h2>
                  <p className="text-xs text-slate-400">
                    Cross-sectional population evaluation across {selectedPatientsList.length} selected patient twin{selectedPatientsList.length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowBatchRiskModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Analysis Mode Tabs */}
            <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
              <button
                onClick={() => setAnalysisTab('overview')}
                className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  analysisTab === 'overview'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Cohort Overview</span>
              </button>
              <button
                onClick={() => setAnalysisTab('comparison')}
                className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  analysisTab === 'comparison'
                    ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5 text-cyan-300" />
                <span>Comparative Risk Analysis</span>
              </button>
            </div>

            {analysisTab === 'overview' ? (
              <>
                {/* Summary Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-800/80 border border-slate-700/80 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cohort Size</span>
                    <span className="text-xl font-extrabold text-white">{selectedPatientsList.length} Twins</span>
                  </div>

                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-rose-300 uppercase tracking-wider block">High/Critical Risk</span>
                    <span className="text-xl font-extrabold text-rose-400">
                      {selectedPatientsList.filter(p => p.riskCategory === 'Critical' || p.riskCategory === 'High').length}
                    </span>
                  </div>

                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">Avg Risk Score</span>
                    <span className="text-xl font-extrabold text-amber-400">
                      {(selectedPatientsList.reduce((acc, p) => acc + p.riskScorePercent, 0) / (selectedPatientsList.length || 1)).toFixed(1)}%
                    </span>
                  </div>

                  <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block">Mean eGFR</span>
                    <span className="text-xl font-extrabold text-indigo-300">
                      {(selectedPatientsList.reduce((acc, p) => acc + p.kidneyFunction.egfr, 0) / (selectedPatientsList.length || 1)).toFixed(0)} mL/min
                    </span>
                  </div>
                </div>

                {/* Patient Breakdown Table */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Cohort Patient Breakdown & High-Hazard Markers</h3>
                  <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                    {selectedPatientsList.map(patient => (
                      <div key={patient.id} className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl flex items-center justify-between gap-3 text-xs">
                        <div className="space-y-0.5">
                          <div className="font-bold text-white flex items-center gap-2">
                            <span>{patient.name}</span>
                            <span className="text-[10px] font-normal text-slate-400">({patient.mrn})</span>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {patient.primaryDiagnosis} • eGFR {patient.kidneyFunction.egfr} • CYP2D6 {patient.genetics.cyp2d6}
                          </div>
                        </div>

                        <div className="text-right">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold ${
                            patient.riskCategory === 'Critical'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : patient.riskCategory === 'High'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          }`}>
                            {patient.riskCategory} ({patient.riskScorePercent}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cohort Clinical Recommendations */}
                <div className="p-4 bg-slate-800/80 border border-cyan-500/30 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold">
                    <ShieldAlert className="w-4 h-4 text-cyan-400" />
                    <span>PharmaGuard Cohort Risk Protocol Summary</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
                    <li>
                      <strong className="text-white">{selectedPatientsList.filter(p => p.genetics.cyp2d6.includes('Poor')).length} patient(s)</strong> exhibit CYP2D6 Poor Metabolizer phenotype — recommend dose reductions for proarrhythmic antiarrhythmics.
                    </li>
                    <li>
                      <strong className="text-white">{selectedPatientsList.filter(p => p.kidneyFunction.egfr < 45).length} patient(s)</strong> have impaired renal clearance (eGFR &lt; 45 mL/min) requiring dose adjustments for renally cleared agents.
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                {/* Comparative Chart */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">Comparative Risk Score (%) vs. Renal eGFR (mL/min)</span>
                    <span className="text-[10px] text-slate-400">Bar height = Risk Score %, Line/Point = eGFR</span>
                  </div>

                  <div className="h-52 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={selectedPatientsList.map(p => ({
                        name: p.name.split(' ')[0],
                        riskScore: p.riskScorePercent,
                        egfr: p.kidneyFunction.egfr,
                        medsCount: p.activeMedications.length,
                        qtc: p.vitals.qtcIntervalMs || 440
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                        <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', color: '#f8fafc' }}
                        />
                        <Bar dataKey="riskScore" name="Risk Score %" radius={[4, 4, 0, 0]}>
                          {selectedPatientsList.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={
                                entry.riskCategory === 'Critical' ? '#f43f5e' :
                                entry.riskCategory === 'High' ? '#f59e0b' : '#10b981'
                              } 
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Comparative Feature Matrix */}
                <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-800 text-cyan-300 font-bold font-mono text-[11px]">
                      <tr>
                        <th className="p-2.5">Patient Name</th>
                        <th className="p-2.5">Risk Score</th>
                        <th className="p-2.5">eGFR</th>
                        <th className="p-2.5">CYP2D6 Phenotype</th>
                        <th className="p-2.5">Active Meds</th>
                        <th className="p-2.5">QTc Interval</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 text-slate-200 text-[11px]">
                      {selectedPatientsList.map(p => (
                        <tr key={p.id} className="hover:bg-slate-900/80 transition-colors">
                          <td className="p-2.5 font-bold text-white">{p.name}</td>
                          <td className="p-2.5">
                            <span className={`px-2 py-0.5 rounded font-extrabold text-[10px] ${
                              p.riskCategory === 'Critical' ? 'bg-rose-500/20 text-rose-300' :
                              p.riskCategory === 'High' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                            }`}>
                              {p.riskScorePercent}% ({p.riskCategory})
                            </span>
                          </td>
                          <td className="p-2.5 font-mono text-cyan-300 font-bold">{p.kidneyFunction.egfr} mL/min</td>
                          <td className="p-2.5 font-mono text-indigo-300">{p.genetics.cyp2d6}</td>
                          <td className="p-2.5 font-bold">{p.activeMedications.length} Rx</td>
                          <td className="p-2.5 font-mono text-amber-300">{p.vitals.qtcIntervalMs || 440} ms</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Modal Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
              <button
                onClick={handleBulkExportCSV}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Download Report CSV</span>
              </button>

              <button
                onClick={() => setShowBatchRiskModal(false)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2 rounded-xl transition-all cursor-pointer shadow-md"
              >
                Close Cohort Analysis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
