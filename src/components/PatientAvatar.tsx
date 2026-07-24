import React, { useState } from 'react';
import { 
  User, 
  Activity, 
  ShieldAlert, 
  Heart, 
  Zap, 
  Sparkles, 
  ChevronRight, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';
import { Patient } from '../types/pharmaguard';

interface PatientAvatarProps {
  patient: Patient;
  size?: 'sm' | 'md' | 'lg';
  showDetailsPopover?: boolean;
  onNavigate?: (view: string) => void;
  className?: string;
}

export const PatientAvatar: React.FC<PatientAvatarProps> = ({
  patient,
  size = 'md',
  showDetailsPopover = true,
  onNavigate,
  className = ''
}) => {
  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Derive default high-resolution clinical portrait avatar if avatarUrl not explicit
  const defaultAvatars: Record<string, string> = {
    'pat-001': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200', // Senior Female
    'pat-002': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200', // Senior Male
    'pat-003': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200', // Female Adult
    'pat-004': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200&h=200', // Male Adult
  };

  const avatarSrc = patient.avatarUrl || defaultAvatars[patient.id] || (
    patient.gender === 'Female'
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200'
      : 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200&h=200'
  );

  // Extract initials (e.g., "Eleanor Vance" -> "EV")
  const initials = patient.name
    .split(' ')
    .map(n => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // Size styling mapping
  const sizeMap = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm'
  };

  // Ring styling according to Risk Category
  const getRingColor = (category: string) => {
    switch (category) {
      case 'Critical':
        return 'ring-2 ring-rose-500 shadow-sm shadow-rose-500/40 animate-pulse';
      case 'High':
        return 'ring-2 ring-amber-500 shadow-sm shadow-amber-500/30';
      case 'Moderate':
        return 'ring-2 ring-sky-500';
      case 'Low':
      default:
        return 'ring-2 ring-emerald-500';
    }
  };

  const getBadgeColor = (category: string) => {
    switch (category) {
      case 'Critical':
        return 'bg-rose-500 text-white';
      case 'High':
        return 'bg-amber-500 text-white';
      case 'Moderate':
        return 'bg-sky-500 text-white';
      case 'Low':
      default:
        return 'bg-emerald-500 text-white';
    }
  };

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar Container */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative rounded-full transition-all cursor-pointer flex items-center justify-center overflow-hidden bg-slate-100 ${sizeMap[size]} ${getRingColor(patient.riskCategory)}`}
        title={`Patient Twin: ${patient.name} (${patient.riskCategory} Risk)`}
      >
        {!imgError ? (
          <img
            src={avatarSrc}
            alt={patient.name}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover rounded-full"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-extrabold flex items-center justify-center rounded-full">
            {initials || <User className="w-4 h-4" />}
          </div>
        )}

        {/* Live Digital Twin Heartbeat Indicator */}
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-400 animate-pulse"></span>
      </button>

      {/* Popover / Tooltip Overlay Details */}
      {showDetailsPopover && (isHovered || isOpen) && (
        <div 
          className="absolute right-0 top-11 w-72 bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Popover Header */}
          <div className="flex items-start justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-full overflow-hidden shrink-0 border-2 ${getRingColor(patient.riskCategory)}`}>
                {!imgError ? (
                  <img
                    src={avatarSrc}
                    alt={patient.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-extrabold flex items-center justify-center text-sm">
                    {initials}
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-extrabold text-sm text-white leading-snug flex items-center gap-1.5">
                  <span>{patient.name}</span>
                </h4>
                <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2 mt-0.5">
                  <span>{patient.mrn}</span>
                  <span>•</span>
                  <span>{patient.age}y / {patient.gender}</span>
                </div>
              </div>
            </div>

            <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-extrabold uppercase ${getBadgeColor(patient.riskCategory)}`}>
              {patient.riskCategory}
            </span>
          </div>

          {/* Diagnosis & Proarrhythmic Risk */}
          <div className="space-y-1.5 text-xs">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">Primary Diagnosis:</div>
            <p className="text-slate-200 text-[11px] leading-relaxed bg-slate-900 p-2 rounded-xl border border-slate-800">
              {patient.primaryDiagnosis}
            </p>
          </div>

          {/* Key Vitals Grid */}
          <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex flex-col">
              <span className="text-[9px] text-slate-400">Proarrhythmic Risk</span>
              <span className={`font-extrabold text-sm ${patient.riskScorePercent > 70 ? 'text-rose-400' : 'text-amber-300'}`}>
                {patient.riskScorePercent}%
              </span>
            </div>

            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex flex-col">
              <span className="text-[9px] text-slate-400">QTc Interval</span>
              <span className={`font-extrabold text-sm ${patient.vitals.qtcIntervalMs >= 450 ? 'text-rose-400' : 'text-cyan-300'}`}>
                {patient.vitals.qtcIntervalMs} ms
              </span>
            </div>

            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex flex-col">
              <span className="text-[9px] text-slate-400">Renal eGFR</span>
              <span className="font-extrabold text-sm text-emerald-300">
                {patient.kidneyFunction.egfr} mL/min
              </span>
            </div>

            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex flex-col">
              <span className="text-[9px] text-slate-400">CYP2D6 Profile</span>
              <span className="font-extrabold text-[10px] text-purple-300 truncate">
                {patient.genetics.cyp2d6}
              </span>
            </div>
          </div>

          {/* Quick Navigation Action */}
          {onNavigate && (
            <button
              onClick={() => {
                onNavigate('digital_twin');
                setIsOpen(false);
              }}
              className="w-full py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer mt-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>Inspect Digital Patient Twin</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PatientAvatar;
