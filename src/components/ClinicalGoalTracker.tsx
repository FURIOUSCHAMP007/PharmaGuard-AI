import React, { useState, useMemo } from 'react';
import { 
  Target, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Award, 
  Edit3, 
  Trash2, 
  X, 
  Sparkles, 
  Activity, 
  Heart, 
  Flame, 
  Droplets, 
  Scale, 
  ShieldCheck 
} from 'lucide-react';
import { Patient } from '../types/pharmaguard';

export interface ClinicalGoal {
  id: string;
  category: 'Cardiac Safety' | 'Metabolic / HbA1c' | 'Renal Function' | 'Weight Management' | 'Blood Pressure' | 'Medication Adherence';
  title: string;
  baselineValue: number;
  currentValue: number;
  targetValue: number;
  unit: string;
  targetDate: string;
  status: 'On Track' | 'At Risk' | 'Achieved' | 'Off Track';
  notes?: string;
  isLowerBetter?: boolean; // e.g. HbA1c, QTc, Weight -> lower is better; eGFR -> higher is better
}

interface ClinicalGoalTrackerProps {
  patient: Patient;
  title?: string;
  subtitle?: string;
}

export const ClinicalGoalTracker: React.FC<ClinicalGoalTrackerProps> = ({
  patient,
  title = "Patient Clinical Goal & Therapeutic Target Tracker",
  subtitle = "Set, monitor, and evaluate quantitative patient-specific health milestones and therapeutic outcomes"
}) => {
  // Default goals tailored for each patient
  const initialGoalsByPatient: Record<string, ClinicalGoal[]> = {
    'pat-001': [
      {
        id: 'g-001',
        category: 'Cardiac Safety',
        title: 'Cardiac QTc Interval Stabilization',
        baselineValue: 485,
        currentValue: patient.vitals.qtcIntervalMs || 462,
        targetValue: 440,
        unit: 'ms',
        targetDate: '2026-09-15',
        status: patient.vitals.qtcIntervalMs >= 470 ? 'At Risk' : 'On Track',
        isLowerBetter: true,
        notes: 'Discontinue QTc prolonging antiarrhythmics if QTc > 470ms.'
      },
      {
        id: 'g-002',
        category: 'Blood Pressure',
        title: 'Systolic Blood Pressure Optimization',
        baselineValue: 148,
        currentValue: patient.vitals.bpSystolic || 132,
        targetValue: 125,
        unit: 'mmHg',
        targetDate: '2026-08-30',
        status: 'On Track',
        isLowerBetter: true,
        notes: 'Combine ACE inhibitor with dietary sodium reduction (< 2000mg/day).'
      },
      {
        id: 'g-003',
        category: 'Metabolic / HbA1c',
        title: 'Glycemic Control Target HbA1c',
        baselineValue: 8.4,
        currentValue: 7.2,
        targetValue: 6.8,
        unit: '%',
        targetDate: '2026-10-01',
        status: 'On Track',
        isLowerBetter: true,
        notes: 'GLP-1 agonist co-therapy initiated.'
      },
      {
        id: 'g-004',
        category: 'Renal Function',
        title: 'Preserve Renal eGFR Clearance',
        baselineValue: 48,
        currentValue: patient.kidneyFunction.egfr || 54,
        targetValue: 60,
        unit: 'mL/min',
        targetDate: '2026-11-15',
        status: patient.kidneyFunction.egfr < 45 ? 'At Risk' : 'On Track',
        isLowerBetter: false,
        notes: 'Avoid nephrotoxic NSAIDs; monitor serum creatinine biweekly.'
      }
    ],
    'pat-002': [
      {
        id: 'g-101',
        category: 'Cardiac Safety',
        title: 'Proarrhythmic Risk Score Reduction',
        baselineValue: 88,
        currentValue: patient.riskScorePercent || 78,
        targetValue: 50,
        unit: '%',
        targetDate: '2026-09-01',
        status: 'At Risk',
        isLowerBetter: true,
        notes: 'High polypharmacy interaction risk.'
      },
      {
        id: 'g-102',
        category: 'Weight Management',
        title: 'Target Body Mass Reduction',
        baselineValue: 92,
        currentValue: patient.weightKg || 88,
        targetValue: 82,
        unit: 'kg',
        targetDate: '2026-12-01',
        status: 'On Track',
        isLowerBetter: true,
        notes: 'Supervised cardiovascular physical therapy regimen.'
      }
    ]
  };

  const defaultGoals = initialGoalsByPatient[patient.id] || [
    {
      id: 'g-def-1',
      category: 'Cardiac Safety',
      title: 'Target QTc Interval Reduction',
      baselineValue: 470,
      currentValue: patient.vitals.qtcIntervalMs || 445,
      targetValue: 430,
      unit: 'ms',
      targetDate: '2026-09-30',
      status: 'On Track',
      isLowerBetter: true,
      notes: 'Standard antiarrhythmic protocol monitoring.'
    },
    {
      id: 'g-def-2',
      category: 'Metabolic / HbA1c',
      title: 'Target HbA1c Control',
      baselineValue: 8.0,
      currentValue: 7.1,
      targetValue: 6.5,
      unit: '%',
      targetDate: '2026-10-15',
      status: 'On Track',
      isLowerBetter: true,
      notes: 'Metformin titration phase.'
    }
  ];

  const [goalsMap, setGoalsMap] = useState<Record<string, ClinicalGoal[]>>({});
  const goals = goalsMap[patient.id] || defaultGoals;

  // New Goal Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState<ClinicalGoal['category']>('Metabolic / HbA1c');
  const [newTitle, setNewTitle] = useState('');
  const [newBaseline, setNewBaseline] = useState<string>('');
  const [newCurrent, setNewCurrent] = useState<string>('');
  const [newTarget, setNewTarget] = useState<string>('');
  const [newUnit, setNewUnit] = useState('mg/dL');
  const [newTargetDate, setNewTargetDate] = useState('2026-10-31');
  const [newIsLowerBetter, setNewIsLowerBetter] = useState(true);
  const [newNotes, setNewNotes] = useState('');

  // Category Icon & Color Mapping
  const getCategoryDetails = (cat: ClinicalGoal['category']) => {
    switch (cat) {
      case 'Cardiac Safety':
        return { icon: Heart, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' };
      case 'Metabolic / HbA1c':
        return { icon: Activity, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' };
      case 'Renal Function':
        return { icon: Droplets, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' };
      case 'Weight Management':
        return { icon: Scale, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/30' };
      case 'Blood Pressure':
        return { icon: Flame, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30' };
      case 'Medication Adherence':
      default:
        return { icon: ShieldCheck, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/30' };
    }
  };

  // Status Badge Colors
  const getStatusBadge = (status: ClinicalGoal['status']) => {
    switch (status) {
      case 'Achieved':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
      case 'On Track':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50';
      case 'At Risk':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      case 'Off Track':
      default:
        return 'bg-rose-500/20 text-rose-300 border-rose-500/50';
    }
  };

  // Calculate Progress Percentage (0% - 100%)
  const calculateProgress = (goal: ClinicalGoal) => {
    const { baselineValue, currentValue, targetValue, isLowerBetter = true } = goal;
    const totalSpan = Math.abs(baselineValue - targetValue);
    if (totalSpan === 0) return 100;

    let progress: number;
    if (isLowerBetter) {
      const achievedSpan = baselineValue - currentValue;
      progress = (achievedSpan / totalSpan) * 100;
    } else {
      const achievedSpan = currentValue - baselineValue;
      progress = (achievedSpan / totalSpan) * 100;
    }

    return Math.min(100, Math.max(0, Math.round(progress)));
  };

  // Add New Goal Handler
  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newTarget || !newCurrent) return;

    const baseVal = parseFloat(newBaseline) || parseFloat(newCurrent);
    const currVal = parseFloat(newCurrent);
    const targVal = parseFloat(newTarget);

    const createdGoal: ClinicalGoal = {
      id: `g-custom-${Date.now()}`,
      category: newCategory,
      title: newTitle,
      baselineValue: baseVal,
      currentValue: currVal,
      targetValue: targVal,
      unit: newUnit,
      targetDate: newTargetDate,
      status: currVal === targVal ? 'Achieved' : 'On Track',
      isLowerBetter: newIsLowerBetter,
      notes: newNotes || 'Clinician defined target goal.'
    };

    setGoalsMap(prev => ({
      ...prev,
      [patient.id]: [createdGoal, ...goals]
    }));

    // Reset Form
    setNewTitle('');
    setNewBaseline('');
    setNewCurrent('');
    setNewTarget('');
    setNewNotes('');
    setIsModalOpen(false);
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoalsMap(prev => ({
      ...prev,
      [patient.id]: goals.filter(g => g.id !== goalId)
    }));
  };

  // Summary Metrics
  const achievedCount = goals.filter(g => g.status === 'Achieved').length;
  const onTrackCount = goals.filter(g => g.status === 'On Track').length;
  const atRiskCount = goals.filter(g => g.status === 'At Risk' || g.status === 'Off Track').length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-xl space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-start gap-3">
          <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shrink-0">
            <Target className="w-6 h-6 animate-pulse text-cyan-400" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-extrabold text-white">{title}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Patient Outcome Management
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
          </div>
        </div>

        {/* Action Button: Add Target Goal */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 border border-cyan-400/30 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Define Treatment Goal</span>
        </button>
      </div>

      {/* Goal Summary Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400">Total Active Goals</span>
          <div className="text-lg font-extrabold text-white">{goals.length} Targets</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400">On Track / Progressing</span>
          <div className="text-lg font-extrabold text-cyan-400">{onTrackCount} Goals</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400">At Risk / Review Needed</span>
          <div className="text-lg font-extrabold text-amber-400">{atRiskCount} Goals</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400">Milestones Achieved</span>
          <div className="text-lg font-extrabold text-emerald-400">{achievedCount} Goals</div>
        </div>
      </div>

      {/* Goal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((goal) => {
          const cat = getCategoryDetails(goal.category);
          const CatIcon = cat.icon;
          const progressPct = calculateProgress(goal);

          return (
            <div key={goal.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all space-y-3 relative group">
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl ${cat.bg} ${cat.color} shrink-0`}>
                    <CatIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold block">
                      {goal.category}
                    </span>
                    <h4 className="font-extrabold text-sm text-white leading-tight">
                      {goal.title}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${getStatusBadge(goal.status)}`}>
                    {goal.status}
                  </span>
                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-900 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                    title="Remove Goal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Quantitative Progress Section */}
              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Baseline: <strong className="text-slate-400">{goal.baselineValue} {goal.unit}</strong></span>
                  <span>Current: <strong className="text-cyan-300 text-sm">{goal.currentValue} {goal.unit}</strong></span>
                  <span>Target: <strong className="text-emerald-400">{goal.targetValue} {goal.unit}</strong></span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-900 rounded-full h-2.5 border border-slate-800 overflow-hidden relative">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      progressPct >= 100 ? 'bg-emerald-500' : goal.status === 'At Risk' ? 'bg-amber-500' : 'bg-cyan-500'
                    }`}
                    style={{ width: `${progressPct}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400" /> Target Date: {goal.targetDate}
                  </span>
                  <span className="font-bold text-cyan-300">{progressPct}% Goal Achieved</span>
                </div>
              </div>

              {/* Notes / Clinical Guidance */}
              {goal.notes && (
                <p className="text-[11px] text-slate-400 bg-slate-900 p-2.5 rounded-xl border border-slate-800/80 leading-relaxed font-sans">
                  <strong className="text-slate-300 font-mono">Plan: </strong>{goal.notes}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Define New Goal Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-slate-100 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-cyan-400" />
                <h3 className="font-extrabold text-base text-white">Define Treatment Target Goal</h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddGoal} className="space-y-3.5 text-xs">
              {/* Category */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">Goal Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as ClinicalGoal['category'])}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-cyan-500"
                >
                  <option value="Metabolic / HbA1c">Metabolic / HbA1c</option>
                  <option value="Cardiac Safety">Cardiac Safety (QTc)</option>
                  <option value="Blood Pressure">Blood Pressure</option>
                  <option value="Weight Management">Weight Management</option>
                  <option value="Renal Function">Renal Function (eGFR)</option>
                  <option value="Medication Adherence">Medication Adherence</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">Target Title / Metric</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Target HbA1c Glycemic Control"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Baseline, Current, Target */}
              <div className="grid grid-cols-3 gap-2 font-mono">
                <div>
                  <label className="block text-slate-400 font-bold text-[10px] mb-1">Baseline</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="8.2"
                    value={newBaseline}
                    onChange={(e) => setNewBaseline(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white text-center"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold text-[10px] mb-1">Current</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="7.4"
                    value={newCurrent}
                    onChange={(e) => setNewCurrent(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-cyan-300 text-center font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold text-[10px] mb-1">Target</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="6.5"
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-emerald-400 text-center font-bold"
                  />
                </div>
              </div>

              {/* Unit & Target Date */}
              <div className="grid grid-cols-2 gap-2 font-mono">
                <div>
                  <label className="block text-slate-300 font-bold mb-1 font-sans">Unit</label>
                  <input
                    type="text"
                    required
                    placeholder="%, mmHg, mg/dL, ms"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1 font-sans">Target Date</label>
                  <input
                    type="date"
                    required
                    value={newTargetDate}
                    onChange={(e) => setNewTargetDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">Therapeutic Action Plan / Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g., Titrate metformin dosage; schedule quarterly blood panel."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Submit / Cancel */}
              <div className="flex items-center justify-end gap-2 border-t border-slate-800 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold cursor-pointer shadow-lg shadow-cyan-600/30"
                >
                  Save Treatment Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClinicalGoalTracker;
