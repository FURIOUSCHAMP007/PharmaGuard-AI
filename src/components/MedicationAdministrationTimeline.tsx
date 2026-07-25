import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Pill, 
  ShieldCheck, 
  User, 
  Calendar, 
  Filter, 
  ChevronRight, 
  AlertCircle, 
  Info, 
  Sparkles,
  Check,
  Send,
  X
} from 'lucide-react';
import { Patient, PrescribedDrug } from '../types/pharmaguard';

interface MedicationAdministrationTimelineProps {
  patient: Patient;
  title?: string;
  subtitle?: string;
}

export interface MedicationDoseEvent {
  id: string;
  drugId: string;
  drugName: string;
  dose: string;
  route: string;
  scheduledHour: number; // 0 to 23
  scheduledTimeStr: string; // e.g. "08:00"
  status: 'Administered' | 'Delayed' | 'Due Soon' | 'Missed' | 'Upcoming';
  administeredTimeStr?: string; // e.g. "08:04"
  administeredBy?: string; // e.g. "Nurse M. Davis, RN"
  delayMinutes?: number;
  notes?: string;
}

export const MedicationAdministrationTimeline: React.FC<MedicationAdministrationTimelineProps> = ({
  patient,
  title = "24-Hour Medication Administration Schedule (eMAR Timeline)",
  subtitle = "Real-time verification tracking scheduled vs. actual dose administration, delay latencies, and bedside sign-offs"
}) => {
  const [statusFilter, setStatusFilter] = useState<'All' | 'Administered' | 'Delayed' | 'Due Soon' | 'Overdue/Missed'>('All');
  const [selectedDose, setSelectedDose] = useState<MedicationDoseEvent | null>(null);
  const [nurseId, setNurseId] = useState<string>('RN-8842');
  const [signOffNote, setSignOffNote] = useState<string>('');
  const [isSuccessToast, setIsSuccessToast] = useState<string | null>(null);

  // Current Simulated Time: 14:30 (2:30 PM)
  const currentHour = 14.5; // 14:30

  // Generate dose events for patient medications
  const initialDoses: MedicationDoseEvent[] = useMemo(() => {
    const activeMeds = patient.activeMedications.length > 0 ? patient.activeMedications : [
      { id: 'm1', name: 'Amiodarone HCl', dosage: '200 mg qd', route: 'PO' } as any,
      { id: 'm2', name: 'Fluoxetine HCl', dosage: '20 mg qd', route: 'PO' } as any,
      { id: 'm3', name: 'Ondansetron', dosage: '8 mg tid', route: 'IV' } as any,
      { id: 'm4', name: 'Lisinopril', dosage: '10 mg qd', route: 'PO' } as any,
    ];

    const list: MedicationDoseEvent[] = [];

    activeMeds.forEach((med, idx) => {
      // Create representative 24-hour schedule slots (e.g. 06:00, 08:00, 12:00, 14:00, 18:00, 22:00)
      if (idx === 0) {
        // Amiodarone 200mg qd -> 08:00
        list.push({
          id: `dose-${med.id}-1`,
          drugId: med.id,
          drugName: med.name,
          dose: med.dosage || '200 mg',
          route: med.route || 'PO',
          scheduledHour: 8,
          scheduledTimeStr: '08:00',
          status: 'Administered',
          administeredTimeStr: '08:06',
          administeredBy: 'Nurse S. Jenkins, RN',
          delayMinutes: 6,
          notes: 'Given with morning meal. Vitals verified (HR 74 bpm).'
        });
        list.push({
          id: `dose-${med.id}-2`,
          drugId: med.id,
          drugName: med.name,
          dose: med.dosage || '200 mg',
          route: med.route || 'PO',
          scheduledHour: 20,
          scheduledTimeStr: '20:00',
          status: 'Upcoming',
          notes: 'Evening dose scheduled.'
        });
      } else if (idx === 1) {
        // Fluoxetine 20mg qd -> 09:00
        list.push({
          id: `dose-${med.id}-1`,
          drugId: med.id,
          drugName: med.name,
          dose: med.dosage || '20 mg',
          route: med.route || 'PO',
          scheduledHour: 9,
          scheduledTimeStr: '09:00',
          status: 'Administered',
          administeredTimeStr: '09:02',
          administeredBy: 'Nurse S. Jenkins, RN',
          delayMinutes: 2,
          notes: 'Administered on time.'
        });
      } else if (idx === 2) {
        // Ondansetron 8mg tid -> 06:00, 12:00, 18:00
        list.push({
          id: `dose-${med.id}-1`,
          drugId: med.id,
          drugName: med.name,
          dose: med.dosage || '8 mg',
          route: med.route || 'IV Push',
          scheduledHour: 6,
          scheduledTimeStr: '06:00',
          status: 'Administered',
          administeredTimeStr: '06:00',
          administeredBy: 'Nurse R. Miller, RN',
          delayMinutes: 0,
          notes: 'Pre-chemo antiemetic prophylactic.'
        });
        list.push({
          id: `dose-${med.id}-2`,
          drugId: med.id,
          drugName: med.name,
          dose: med.dosage || '8 mg',
          route: med.route || 'IV Push',
          scheduledHour: 12,
          scheduledTimeStr: '12:00',
          status: 'Delayed',
          administeredTimeStr: '13:25',
          administeredBy: 'Nurse M. Davis, RN',
          delayMinutes: 85,
          notes: 'Delayed due to patient undergoing CT scan.'
        });
        list.push({
          id: `dose-${med.id}-3`,
          drugId: med.id,
          drugName: med.name,
          dose: med.dosage || '8 mg',
          route: med.route || 'IV Push',
          scheduledHour: 15,
          scheduledTimeStr: '15:00',
          status: 'Due Soon',
          notes: 'Due in 30 minutes.'
        });
        list.push({
          id: `dose-${med.id}-4`,
          drugId: med.id,
          drugName: med.name,
          dose: med.dosage || '8 mg',
          route: med.route || 'IV Push',
          scheduledHour: 21,
          scheduledTimeStr: '21:00',
          status: 'Upcoming'
        });
      } else {
        // Lisinopril 10mg -> 10:00 (Missed)
        list.push({
          id: `dose-${med.id}-1`,
          drugId: med.id,
          drugName: med.name,
          dose: med.dosage || '10 mg',
          route: med.route || 'PO',
          scheduledHour: 10,
          scheduledTimeStr: '10:00',
          status: 'Missed',
          notes: 'NPO hold for procedure; requiring clinician re-authorization.'
        });
        list.push({
          id: `dose-${med.id}-2`,
          drugId: med.id,
          drugName: med.name,
          dose: med.dosage || '10 mg',
          route: med.route || 'PO',
          scheduledHour: 22,
          scheduledTimeStr: '22:00',
          status: 'Upcoming'
        });
      }
    });

    return list;
  }, [patient]);

  const [doses, setDoses] = useState<MedicationDoseEvent[]>(initialDoses);

  // Filtered Doses
  const filteredDoses = useMemo(() => {
    if (statusFilter === 'All') return doses;
    if (statusFilter === 'Administered') return doses.filter(d => d.status === 'Administered');
    if (statusFilter === 'Delayed') return doses.filter(d => d.status === 'Delayed');
    if (statusFilter === 'Due Soon') return doses.filter(d => d.status === 'Due Soon');
    if (statusFilter === 'Overdue/Missed') return doses.filter(d => d.status === 'Missed');
    return doses;
  }, [doses, statusFilter]);

  // Group Doses by Drug Name
  const drugsGrouped = useMemo(() => {
    const map = new Map<string, { drugName: string; route: string; dose: string; events: MedicationDoseEvent[] }>();
    filteredDoses.forEach(d => {
      if (!map.has(d.drugName)) {
        map.set(d.drugName, {
          drugName: d.drugName,
          route: d.route,
          dose: d.dose,
          events: []
        });
      }
      map.get(d.drugName)!.events.push(d);
    });
    return Array.from(map.values());
  }, [filteredDoses]);

  // Handle Dose Sign-Off Submission
  const handleSignOff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDose) return;

    const nowStr = '14:32';
    setDoses(prev => prev.map(d => {
      if (d.id === selectedDose.id) {
        return {
          ...d,
          status: 'Administered',
          administeredTimeStr: nowStr,
          administeredBy: `Nurse (${nurseId})`,
          notes: signOffNote || 'Administered and verified via eMAR scanning.'
        };
      }
      return d;
    }));

    setIsSuccessToast(`CONFIRMED: ${selectedDose.drugName} (${selectedDose.dose}) signed off at ${nowStr}`);
    setSelectedDose(null);
    setSignOffNote('');
    setTimeout(() => setIsSuccessToast(null), 4000);
  };

  // Metrics
  const totalDosesCount = doses.length;
  const administeredCount = doses.filter(d => d.status === 'Administered').length;
  const delayedCount = doses.filter(d => d.status === 'Delayed').length;
  const missedCount = doses.filter(d => d.status === 'Missed').length;
  const dueSoonCount = doses.filter(d => d.status === 'Due Soon').length;

  const compliancePct = Math.round(((administeredCount + delayedCount) / Math.max(1, administeredCount + delayedCount + missedCount)) * 100);

  // Hours ticks for 24-hour horizontal axis (00:00 to 23:00)
  const hourTicks = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];

  // Helper for Status Badge Color
  const getStatusStyle = (status: MedicationDoseEvent['status']) => {
    switch (status) {
      case 'Administered':
        return {
          bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
          dot: 'bg-emerald-400',
          icon: CheckCircle2
        };
      case 'Delayed':
        return {
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
          dot: 'bg-amber-400',
          icon: Clock
        };
      case 'Due Soon':
        return {
          bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 animate-pulse',
          dot: 'bg-cyan-400',
          icon: Clock
        };
      case 'Missed':
        return {
          bg: 'bg-rose-500/20 text-rose-300 border-rose-500/50',
          dot: 'bg-rose-500',
          icon: AlertTriangle
        };
      case 'Upcoming':
      default:
        return {
          bg: 'bg-slate-800 text-slate-400 border-slate-700',
          dot: 'bg-slate-500',
          icon: Calendar
        };
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-xl space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-start gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 shrink-0">
            <Clock className="w-6 h-6 animate-pulse text-indigo-400" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-extrabold text-white">{title}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                24H eMAR Telemetry
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
          </div>
        </div>

        {/* Current Simulated Time Badge */}
        <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 font-mono text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="text-slate-400">Current Time:</span>
          <span className="font-extrabold text-cyan-300">14:30 EST</span>
        </div>
      </div>

      {/* Summary Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-mono">
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400">24H Compliance</span>
          <div className="text-lg font-extrabold text-emerald-400">{compliancePct}%</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400">Administered</span>
          <div className="text-lg font-extrabold text-emerald-300">{administeredCount} Doses</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400">Delayed</span>
          <div className="text-lg font-extrabold text-amber-300">{delayedCount} Doses</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400">Due Soon</span>
          <div className="text-lg font-extrabold text-cyan-300">{dueSoonCount} Doses</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400">Missed / Overdue</span>
          <div className="text-lg font-extrabold text-rose-400">{missedCount} Doses</div>
        </div>
      </div>

      {/* Status Filter Chips */}
      <div className="flex items-center justify-between gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400 font-bold ml-1">
          <Filter className="w-3.5 h-3.5 text-indigo-400" />
          <span>Filter Status:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {(['All', 'Administered', 'Delayed', 'Due Soon', 'Overdue/Missed'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                statusFilter === filter
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* 24-Hour Swimlane Horizontal Timeline Graph */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-4 overflow-x-auto">
        {/* Time Scale Axis Header */}
        <div className="min-w-[700px]">
          <div className="grid grid-cols-12 text-[10px] font-mono text-slate-400 border-b border-slate-800 pb-2 ml-48">
            {hourTicks.map((hour) => (
              <div key={hour} className="text-center font-bold">
                {hour.toString().padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {/* Current Time Red Vertical Line Indicator */}
          <div className="relative my-2">
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-10 pointer-events-none shadow-glow"
              style={{ left: `calc(12rem + ${(currentHour / 24) * 100}% - 12rem)` }}
            >
              <span className="absolute -top-3 -left-6 bg-rose-600 text-white text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded shadow">
                NOW 14:30
              </span>
            </div>

            {/* Swimlane Rows */}
            <div className="space-y-4 pt-4">
              {drugsGrouped.map((drug, dIdx) => (
                <div key={dIdx} className="flex items-center border-b border-slate-800/60 pb-3 text-xs">
                  {/* Drug Info Column */}
                  <div className="w-48 shrink-0 pr-3 space-y-0.5">
                    <div className="font-extrabold text-white text-xs truncate flex items-center gap-1.5">
                      <Pill className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate">{drug.drugName}</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2">
                      <span>{drug.dose}</span>
                      <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-bold border border-slate-700">
                        {drug.route}
                      </span>
                    </div>
                  </div>

                  {/* 24H Horizontal Track */}
                  <div className="flex-1 relative h-10 bg-slate-900/60 rounded-xl border border-slate-800/80 flex items-center">
                    {/* Background Grid Lines */}
                    <div className="absolute inset-0 grid grid-cols-12 pointer-events-none">
                      {hourTicks.map((_, i) => (
                        <div key={i} className="border-r border-slate-800/40 h-full"></div>
                      ))}
                    </div>

                    {/* Dose Event Markers */}
                    {drug.events.map((event) => {
                      const leftPercent = (event.scheduledHour / 24) * 100;
                      const style = getStatusStyle(event.status);

                      return (
                        <div
                          key={event.id}
                          onClick={() => setSelectedDose(event)}
                          style={{ left: `${leftPercent}%` }}
                          className={`absolute -translate-x-1/2 p-2 rounded-xl border cursor-pointer transition-all hover:scale-110 z-20 flex items-center gap-1.5 shadow-md ${style.bg}`}
                          title={`${event.drugName} scheduled for ${event.scheduledTimeStr} (${event.status})`}
                        >
                          <span className={`w-2 h-2 rounded-full ${style.dot}`}></span>
                          <span className="font-mono font-extrabold text-[11px] whitespace-nowrap">
                            {event.scheduledTimeStr}
                          </span>
                          {event.status === 'Administered' && (
                            <Check className="w-3 h-3 text-emerald-400" />
                          )}
                          {event.status === 'Delayed' && (
                            <Clock className="w-3 h-3 text-amber-400" />
                          )}
                          {event.status === 'Due Soon' && (
                            <span className="text-[9px] font-mono bg-cyan-500 text-slate-950 font-extrabold px-1 rounded">
                              DUE
                            </span>
                          )}
                          {event.status === 'Missed' && (
                            <AlertTriangle className="w-3 h-3 text-rose-400" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80 pt-3 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Click any schedule node to view bedside administration details or execute nurse sign-off</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Administered
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Delayed
            </span>
            <span className="flex items-center gap-1 text-cyan-300">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> Due Soon
            </span>
            <span className="flex items-center gap-1 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Missed/Overdue
            </span>
          </div>
        </div>
      </div>

      {/* Bedside Sign-Off / Details Modal */}
      {selectedDose && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-slate-100 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="font-extrabold text-base text-white">{selectedDose.drugName}</h3>
                  <p className="text-xs font-mono text-slate-400">{selectedDose.dose} • {selectedDose.route}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedDose(null)} 
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Scheduled Time:</span>
                  <span className="font-bold text-white">{selectedDose.scheduledTimeStr} EST</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Current Status:</span>
                  <span className={`font-bold ${
                    selectedDose.status === 'Administered' ? 'text-emerald-400' :
                    selectedDose.status === 'Delayed' ? 'text-amber-300' :
                    selectedDose.status === 'Due Soon' ? 'text-cyan-300' : 'text-rose-400'
                  }`}>
                    {selectedDose.status}
                  </span>
                </div>

                {selectedDose.administeredTimeStr && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Administered Time:</span>
                    <span className="font-bold text-emerald-300">{selectedDose.administeredTimeStr} EST</span>
                  </div>
                )}

                {selectedDose.administeredBy && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Signed Off By:</span>
                    <span className="font-bold text-cyan-300">{selectedDose.administeredBy}</span>
                  </div>
                )}

                {selectedDose.notes && (
                  <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-300 font-sans">
                    <strong>Notes:</strong> {selectedDose.notes}
                  </div>
                )}
              </div>

              {/* Sign-Off Action Form for Due/Overdue Doses */}
              {selectedDose.status !== 'Administered' && (
                <form onSubmit={handleSignOff} className="space-y-3 pt-2">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Nurse Badge / Provider ID</label>
                    <input
                      type="text"
                      required
                      value={nurseId}
                      onChange={(e) => setNurseId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Bedside Verification Notes</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Patient identity and vitals verified at bedside."
                      value={signOffNote}
                      onChange={(e) => setSignOffNote(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 border-t border-slate-800 pt-3">
                    <button
                      type="button"
                      onClick={() => setSelectedDose(null)}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold cursor-pointer"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold cursor-pointer shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>Sign Off Administration</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {isSuccessToast && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-950 text-emerald-100 border-2 border-emerald-500 px-4 py-3 rounded-2xl shadow-2xl text-xs font-mono font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 animate-bounce" />
          <span>{isSuccessToast}</span>
          <button onClick={() => setIsSuccessToast(null)} className="text-emerald-400 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default MedicationAdministrationTimeline;
