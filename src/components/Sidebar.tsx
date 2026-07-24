import React from 'react';
import { 
  Home, 
  Shield, 
  LayoutDashboard, 
  Users, 
  Activity, 
  Pill, 
  Network, 
  GitBranch, 
  Clock, 
  Share2, 
  Bot, 
  MessageSquareCode, 
  Sparkles, 
  BookOpen, 
  Eye, 
  BarChart3, 
  AlertTriangle, 
  FileText, 
  CheckCircle2, 
  BookMarked, 
  Sliders
} from 'lucide-react';

export type ViewId = 
  | 'landing'
  | 'auth_role'
  | 'dashboard'
  | 'patients'
  | 'digital_twin'
  | 'drug_prescribe'
  | 'interaction_matrix'
  | 'causal_counterfactual'
  | 'temporal_simulation'
  | 'kg_explorer'
  | 'multi_agent'
  | 'ai_chat'
  | 'alt_recommend'
  | 'guidelines'
  | 'xai_dashboard'
  | 'uncertainty'
  | 'pharmacovigilance'
  | 'reports_pdf'
  | 'doctor_review'
  | 'research_hub'
  | 'admin_monitoring';

interface SidebarProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  activeView?: ViewId;
  onSelectView?: (view: ViewId) => void;
  collapsed?: boolean;
}

interface NavGroup {
  label: string;
  items: {
    id: ViewId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  activeView, 
  onSelectView 
}) => {
  const currentActive = (activeTab || activeView || 'landing') as ViewId;
  const handleSelect = (view: ViewId) => {
    if (setActiveTab) setActiveTab(view);
    if (onSelectView) onSelectView(view);
  };

  const navGroups: NavGroup[] = [
    {
      label: 'Main Console',
      items: [
        { id: 'landing', label: 'Home & System Overview', icon: Home },
        { id: 'auth_role', label: 'Auth & Role Access Matrix', icon: Shield },
        { id: 'dashboard', label: 'Clinical Safety Dashboard', icon: LayoutDashboard, badge: 'Live' }
      ]
    },
    {
      label: 'Patient Twin Mgmt',
      items: [
        { id: 'patients', label: 'Patient Registry', icon: Users },
        { id: 'digital_twin', label: 'Digital Patient Twin', icon: Activity, badge: 'Twin' },
        { id: 'drug_prescribe', label: 'Drug & Prescription Mgmt', icon: Pill },
        { id: 'interaction_matrix', label: 'Drug Interaction Matrix', icon: Network, badge: 'Matrix' }
      ]
    },
    {
      label: 'Causal Analytics',
      items: [
        { id: 'causal_counterfactual', label: 'Causal & Counterfactuals', icon: GitBranch, badge: 'SCM' },
        { id: 'temporal_simulation', label: 'Temporal Risk & PK/PD', icon: Clock, badge: 'PK/PD' }
      ]
    },
    {
      label: 'Knowledge Engine',
      items: [
        { id: 'kg_explorer', label: 'Knowledge Graph Explorer', icon: Share2, badge: 'KG' },
        { id: 'multi_agent', label: 'Multi-Agent AI Console', icon: Bot, badge: '8 Agents' },
        { id: 'ai_chat', label: 'Gemini AI Assistant', icon: MessageSquareCode, badge: 'AI' }
      ]
    },
    {
      label: 'Safety & Evidence',
      items: [
        { id: 'alt_recommend', label: 'Alternative Drug Engine', icon: Sparkles },
        { id: 'guidelines', label: 'Clinical Guidelines', icon: BookOpen },
        { id: 'xai_dashboard', label: 'Explainable AI (XAI)', icon: Eye, badge: 'SHAP' },
        { id: 'uncertainty', label: 'Uncertainty & Confidence', icon: BarChart3, badge: 'ECE' },
        { id: 'pharmacovigilance', label: 'FDA Safety Alerts', icon: AlertTriangle, badge: 'FDA' }
      ]
    },
    {
      label: 'Governance & Research',
      items: [
        { id: 'reports_pdf', label: 'Reports & PDF Export', icon: FileText },
        { id: 'doctor_review', label: 'Doctor Review & Approval', icon: CheckCircle2, badge: 'HITL' },
        { id: 'research_hub', label: 'IEEE Research Architecture', icon: BookMarked, badge: 'IEEE' },
        { id: 'admin_monitoring', label: 'Admin & System Logs', icon: Sliders }
      ]
    }
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 h-[calc(100vh-64px)] flex flex-col shrink-0 text-slate-300 select-none">
      {/* Brand Header */}
      <div className="p-4 flex items-center gap-3 border-b border-slate-800">
        <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center text-white font-bold shrink-0 shadow-sm">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="text-white font-bold tracking-tight text-base block leading-tight">PharmaGuard AI</span>
          <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Causal Precision</span>
        </div>
      </div>

      {/* Nav Items Scrollable */}
      <nav className="flex-1 py-4 px-3 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
        {navGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            <h3 className="text-slate-500 text-[10px] uppercase font-bold px-3 py-1 tracking-widest">
              {group.label}
            </h3>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentActive === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold shrink-0 ml-1 ${
                        isActive 
                          ? 'bg-indigo-500/30 text-indigo-100 border border-indigo-400/40' 
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Profile Footer */}
      <div className="p-4 border-t border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-200 border-2 border-indigo-500 flex items-center justify-center text-indigo-800 font-bold text-xs shrink-0">
            SC
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">Dr. Sarah Chen</p>
            <p className="text-xs text-slate-500 truncate">Chief Oncologist</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
