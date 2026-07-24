import React from 'react';
import { AlertTriangle, ShieldAlert, FileText, ExternalLink, Activity } from 'lucide-react';
import { FDAAlert } from '../../types/pharmaguard';

interface PharmacovigilanceFDAViewProps {
  alerts: FDAAlert[];
}

export const PharmacovigilanceFDAView: React.FC<PharmacovigilanceFDAViewProps> = ({ alerts }) => {
  return (
    <div className="space-y-6 text-slate-100 max-w-7xl mx-auto pb-10">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Pharmacovigilance & FDA Safety Alert Center</h1>
            <p className="text-xs text-slate-400">
              Live stream of FDA FAERS adverse event reports, Black Box Warnings, and real-time drug safety recalls.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {alerts.map((alert) => (
          <div key={alert.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <h3 className="font-bold text-base text-white">{alert.drugName}</h3>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30">
                  {alert.alertType}
                </span>
                <span className="text-slate-400 font-mono">{alert.date}</span>
              </div>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed bg-slate-800/60 p-4 rounded-xl border border-slate-700">
              {alert.summary}
            </p>

            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1 text-xs">
              <div className="text-slate-400 font-semibold text-[11px]">Recommended Clinical Action:</div>
              <div className="text-cyan-300 font-medium">{alert.actionRequired}</div>
            </div>

            <div className="text-[11px] text-slate-400 flex flex-wrap items-center justify-between pt-1">
              <span>Impacted Pathways: <strong className="text-amber-300">{alert.impactedPathways.join(' • ')}</strong></span>
              <span className="text-indigo-400 font-semibold flex items-center gap-1">
                OpenFDA Registry Synced
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
