import React from 'react';
import { Shield, Lock, CheckCircle2, XCircle, UserCheck, Key, Server, AlertCircle } from 'lucide-react';
import { UserRole } from '../../types/pharmaguard';

interface AuthRoleViewProps {
  currentRole?: UserRole | string;
  selectedRole?: string;
  onSelectRole?: (role: UserRole) => void;
  setSelectedRole?: (role: string) => void;
}

export const AuthRoleView: React.FC<AuthRoleViewProps> = ({
  currentRole,
  selectedRole,
  onSelectRole,
  setSelectedRole
}) => {
  const activeRole = currentRole || selectedRole || 'Doctor';

  const handleSelectRole = (role: UserRole) => {
    if (onSelectRole) {
      onSelectRole(role);
    } else if (setSelectedRole) {
      setSelectedRole(role);
    }
  };
  const rolesInfo: { role: UserRole; title: string; desc: string; permissions: string[] }[] = [
    {
      role: 'Doctor',
      title: 'Attending Physician & Clinical Reviewer',
      desc: 'Full clinical decision authority, counterfactual intervention approval, prescription modification, and human-in-the-loop learning feedback.',
      permissions: ['View Patient Twin', 'Approve/Override AI Recommendations', 'Sign Clinical Safety Reports', 'Modify Active Prescriptions']
    },
    {
      role: 'Pharmacist',
      title: 'Clinical Pharmacologist & Regimen Specialist',
      desc: 'Expert review of CYP450 metabolism pathways, PK/PD concentration curves, alternative drug substitution, and renal dosing guidelines.',
      permissions: ['Access Drug Interaction Matrix', 'Run Alternative Drug Engine', 'Inspect PK/PD Curves', 'Verify FDA Safety Alerts']
    },
    {
      role: 'Nurse',
      title: 'Clinical Care Nurse & Vitals Manager',
      desc: 'Real-time patient administration monitoring, QTc interval tracking, side-effect reporting, and bed-side alert management.',
      permissions: ['Update Patient Vitals & Labs', 'View Administration Timeline', 'Acknowledge Safety Alerts', 'Log Adverse Events']
    },
    {
      role: 'Hospital Administrator',
      title: 'Hospital Quality & Risk Director',
      desc: 'Overview of department-wide adverse drug event risk distributions, clinical compliance metrics, and hospital safety audits.',
      permissions: ['Executive Safety Analytics', 'Quality Metric Reporting', 'Department Risk Distribution', 'Audit Trail Monitoring']
    },
    {
      role: 'Researcher',
      title: 'Biomedical Informatics & Graph AI Researcher',
      desc: 'Full access to Knowledge Graph embeddings (GraphSAGE, Node2Vec), Causal DAG structural parameters, and Bayesian uncertainty models.',
      permissions: ['Explore Knowledge Graph RAG', 'Tune Causal SCM Parameters', 'Inspect SHAP & GNN Explanations', 'View IEEE Research Architecture']
    },
    {
      role: 'Patient',
      title: 'Patient Portal Access',
      desc: 'Simplified, patient-friendly explanation of prescribed medications, clear side-effect warning signs, and timing reminders.',
      permissions: ['View Patient-Friendly Med Guide', 'Check Daily Schedule', 'Read Layman Interaction Explanations', 'Report Symptoms']
    },
    {
      role: 'System Administrator',
      title: 'System & Security Administrator',
      desc: 'RBAC management, Gemini API key telemetry, server health monitoring, node security rules, and audit logging.',
      permissions: ['Manage User Roles & RBAC', 'Monitor Server & Gemini Tokens', 'Configure Database Connections', 'Full System Audit Logs']
    }
  ];

  return (
    <div className="space-y-6 text-slate-100 max-w-7xl mx-auto pb-10">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Role-Based Access Control (RBAC) & Authentication Matrix</h1>
            <p className="text-xs text-slate-400">
              PharmaGuard AI enforces HIPAA-compliant, fine-grained RBAC across clinical, research, and administrative workflows.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
          <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Currently Authenticated as: <strong className="text-cyan-300 font-bold">{activeRole}</strong></span>
        </div>
      </div>

      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rolesInfo.map((item) => {
          const isSelected = activeRole === item.role || activeRole === item.title;
          return (
            <div
              key={item.role}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                isSelected 
                  ? 'bg-slate-800/90 border-cyan-500 shadow-lg shadow-cyan-950/30' 
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-800 text-cyan-300 border border-slate-700">
                    {item.role}
                  </span>
                  {isSelected ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Active Role
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSelectRole(item.role)}
                      className="text-xs font-bold px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer"
                    >
                      Switch to Role
                    </button>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-sm text-white">{item.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Granted Capabilities</div>
                  {item.permissions.map((perm, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>{perm}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
