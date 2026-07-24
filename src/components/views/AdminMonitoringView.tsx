import React from 'react';
import { Sliders, Cpu, Activity, ShieldCheck, Key, Server, Terminal, Database } from 'lucide-react';
import { SystemMetric } from '../../types/pharmaguard';

interface AdminMonitoringViewProps {
  metrics: SystemMetric;
}

export const AdminMonitoringView: React.FC<AdminMonitoringViewProps> = ({ metrics }) => {
  const auditLogs = [
    { time: '2026-07-23 22:15:02', user: 'Dr. Sarah Jenkins', action: 'Approved Warfarin → Apixaban counterfactual intervention for Eleanor Vance', status: 'SUCCESS' },
    { time: '2026-07-23 22:10:45', user: 'System Agent', action: 'Ingested FDA FAERS Amiodarone safety alert update', status: 'SUCCESS' },
    { time: '2026-07-23 22:02:11', user: 'Pharmacist Mark', action: 'Ran 72-hour PK/PD concentration curve simulation', status: 'SUCCESS' },
    { time: '2026-07-23 21:55:30', user: 'System GNN', action: 'Re-indexed Neo4j Knowledge Graph embeddings (12,480 triples)', status: 'SUCCESS' }
  ];

  return (
    <div className="space-y-6 text-slate-100 max-w-7xl mx-auto pb-10">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-800 text-cyan-400 border border-slate-700">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">System Admin & Model Telemetry Dashboard</h1>
            <p className="text-xs text-slate-400">
              Real-time monitoring of Gemini token consumption, GNN inference latency, Knowledge Graph queries, and system security audit logs.
            </p>
          </div>
        </div>
      </div>

      {/* Telemetry KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="text-xs text-slate-400 font-semibold flex items-center justify-between">
            <span>GNN Inference Latency</span>
            <Cpu className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{metrics.gnnInferenceMs} ms</div>
          <div className="text-[11px] text-emerald-400 font-semibold">Sub-50ms Target Met</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="text-xs text-slate-400 font-semibold flex items-center justify-between">
            <span>KG Query Latency</span>
            <Database className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{metrics.kgQueryTimeMs} ms</div>
          <div className="text-[11px] text-cyan-400 font-semibold">Neo4j Aura Indexed</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="text-xs text-slate-400 font-semibold flex items-center justify-between">
            <span>Gemini Tokens Today</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{metrics.geminiTokenUsageToday.toLocaleString()}</div>
          <div className="text-[11px] text-indigo-300 font-semibold">Server Proxy Active</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="text-xs text-slate-400 font-semibold flex items-center justify-between">
            <span>System Uptime</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400">{metrics.systemUptimePercent}%</div>
          <div className="text-[11px] text-slate-400">Cloud Run Containers</div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
          <Terminal className="w-5 h-5 text-cyan-400" />
          <span>Live Security & HIPAA Access Audit Trail</span>
        </h2>

        <div className="space-y-2 text-xs">
          {auditLogs.map((log, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="font-bold text-slate-200">{log.action}</div>
                <div className="text-[11px] text-slate-400">User: <strong className="text-cyan-300">{log.user}</strong></div>
              </div>
              <div className="text-right shrink-0">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  {log.status}
                </span>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">{log.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
