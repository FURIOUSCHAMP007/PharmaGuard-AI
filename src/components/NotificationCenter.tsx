import React, { useState, useMemo } from 'react';
import { 
  Bell, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Siren, 
  Clock, 
  Check, 
  Filter, 
  Sparkles, 
  ChevronRight, 
  ExternalLink, 
  ShieldAlert, 
  UserCheck, 
  Activity, 
  FileCheck, 
  Zap, 
  Trash2,
  ListFilter
} from 'lucide-react';
import { Patient } from '../types/pharmaguard';

export interface ClinicalNotification {
  id: string;
  category: 'Critical Safety' | 'Pending Action' | 'System Alert' | 'FDA Notice' | 'eMAR Delayed';
  title: string;
  description: string;
  patientName?: string;
  patientId?: string;
  timestamp: string;
  urgency: 'STAT / Critical' | 'High' | 'Routine' | 'Info';
  isRead: boolean;
  actionViewId?: string;
  actionLabel?: string;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  activePatient?: Patient;
  onNavigate?: (view: string) => void;
  onSelectPatientId?: (id: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  activePatient,
  onNavigate,
  onSelectPatientId
}) => {
  const [filterCategory, setFilterCategory] = useState<'All' | 'Critical Safety' | 'Pending Action' | 'System Alert' | 'FDA Notice'>('All');
  const [showUnreadOnly, setShowUnreadOnly] = useState<boolean>(false);

  // Initial Mock Notifications
  const [notifications, setNotifications] = useState<ClinicalNotification[]>([
    {
      id: 'notif-101',
      category: 'Critical Safety',
      title: 'QTc Prolongation Threshold Exceeded (> 468ms)',
      description: 'Patient Eleanor Vance QTc interval flagged at 468ms with co-prescribed Amiodarone and Fluoxetine.',
      patientName: 'Eleanor Vance',
      patientId: 'pat-001',
      timestamp: '10 min ago',
      urgency: 'STAT / Critical',
      isRead: false,
      actionViewId: 'dashboard',
      actionLabel: 'Review QTc Trend'
    },
    {
      id: 'notif-102',
      category: 'Pending Action',
      title: 'Doctor Sign-Off Required for Causal Drug Replacement',
      description: 'Alternative non-QTc prolonging drug recommendation (Sotalol 80mg) awaiting attending physician approval.',
      patientName: 'Eleanor Vance',
      patientId: 'pat-001',
      timestamp: '25 min ago',
      urgency: 'High',
      isRead: false,
      actionViewId: 'doctor_review',
      actionLabel: 'Approve Order'
    },
    {
      id: 'notif-103',
      category: 'eMAR Delayed',
      title: 'Medication Administration Latency (> 85 min)',
      description: 'Ondansetron 8mg IV push dose scheduled at 12:00 was delayed due to radiology scan.',
      patientName: 'Eleanor Vance',
      patientId: 'pat-001',
      timestamp: '1 hour ago',
      urgency: 'High',
      isRead: false,
      actionViewId: 'dashboard',
      actionLabel: 'Verify eMAR'
    },
    {
      id: 'notif-104',
      category: 'FDA Notice',
      title: 'FDA Class I Recall: CYP3A4 Substrate Interaction Warning',
      description: 'Updated black-box warning issued for simultaneous macrolide antibiotic administration.',
      timestamp: '2 hours ago',
      urgency: 'Routine',
      isRead: true,
      actionViewId: 'pharmacovigilance',
      actionLabel: 'View FDA Notice'
    },
    {
      id: 'notif-105',
      category: 'System Alert',
      title: 'GNN Graph Inference Engine Sync Completed',
      description: 'Graph Neural Network polypharmacy subgraph updated across 1,240 node edges.',
      timestamp: '3 hours ago',
      urgency: 'Info',
      isRead: true,
      actionViewId: 'kg_explorer',
      actionLabel: 'Explore Graph'
    }
  ]);

  // Toast confirmation state
  const [actionToast, setActionToast] = useState<string | null>(null);

  // Unread Count
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Filtered Notifications
  const filteredNotifs = useMemo(() => {
    return notifications.filter(n => {
      if (showUnreadOnly && n.isRead) return false;
      if (filterCategory === 'All') return true;
      return n.category === filterCategory;
    });
  }, [notifications, filterCategory, showUnreadOnly]);

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setActionToast('All notifications marked as read');
    setTimeout(() => setActionToast(null), 3000);
  };

  const handleDismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleExecuteAction = (notif: ClinicalNotification) => {
    handleMarkAsRead(notif.id);
    if (notif.patientId && onSelectPatientId) {
      onSelectPatientId(notif.patientId);
    }
    if (notif.actionViewId && onNavigate) {
      onNavigate(notif.actionViewId);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      {/* Slide-over Panel */}
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full shadow-2xl flex flex-col text-slate-100 animate-in slide-in-from-right duration-300">
        
        {/* Panel Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 relative">
              <Bell className="w-5 h-5 text-indigo-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 text-[9px] font-mono font-extrabold bg-rose-500 text-white rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <span>Clinical Notification Center</span>
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                {unreadCount} unread system alerts & pending clinical actions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-slate-800 hover:bg-slate-700 text-indigo-300 transition-colors"
                title="Mark all as read"
              >
                Mark All Read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="p-3 border-b border-slate-800 bg-slate-950/40 space-y-2 shrink-0 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold">
              <ListFilter className="w-3.5 h-3.5 text-indigo-400" />
              <span>Category Filter:</span>
            </div>

            <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-mono text-indigo-300">
              <input
                type="checkbox"
                checked={showUnreadOnly}
                onChange={(e) => setShowUnreadOnly(e.target.checked)}
                className="rounded border-slate-700 text-indigo-600 focus:ring-0 bg-slate-900"
              />
              <span>Unread Only</span>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-1">
            {(['All', 'Critical Safety', 'Pending Action', 'System Alert', 'FDA Notice'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                  filterCategory === cat
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Toast confirmation */}
        {actionToast && (
          <div className="p-2 bg-emerald-950/80 border-b border-emerald-800 text-emerald-300 text-[11px] font-mono font-bold flex items-center gap-2 px-4 animate-in fade-in">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>{actionToast}</span>
          </div>
        )}

        {/* Notification List Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {filteredNotifs.length === 0 ? (
            <div className="py-16 text-center space-y-2 text-slate-500">
              <CheckCircle2 className="w-10 h-10 text-slate-700 mx-auto stroke-1" />
              <p className="text-xs font-mono">No notifications found in this filter view</p>
            </div>
          ) : (
            filteredNotifs.map((notif) => (
              <div
                key={notif.id}
                className={`p-3.5 rounded-2xl border transition-all space-y-2 relative group ${
                  !notif.isRead
                    ? 'bg-slate-950 border-indigo-500/40 ring-1 ring-indigo-500/20'
                    : 'bg-slate-950/50 border-slate-800/80 opacity-80'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${
                      notif.urgency === 'STAT / Critical' ? 'bg-rose-500 animate-ping' :
                      notif.urgency === 'High' ? 'bg-amber-400' : 'bg-cyan-400'
                    }`}></span>

                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${
                      notif.urgency === 'STAT / Critical' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                      notif.urgency === 'High' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                      'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                    }`}>
                      {notif.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{notif.timestamp}</span>
                    <button
                      onClick={() => handleDismiss(notif.id)}
                      className="p-1 rounded hover:text-rose-400 hover:bg-slate-900 transition-colors ml-1"
                      title="Dismiss"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h4 className="font-extrabold text-xs text-white leading-snug">
                    {notif.title}
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed mt-1">
                    {notif.description}
                  </p>
                </div>

                {/* Patient Tag */}
                {notif.patientName && (
                  <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-cyan-400" />
                    <span>Patient: <strong className="text-white">{notif.patientName}</strong></span>
                  </div>
                )}

                {/* Action Row */}
                <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-xs">
                  {!notif.isRead ? (
                    <button
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="text-[10px] font-mono text-slate-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
                    >
                      <Check className="w-3 h-3 text-emerald-400" /> Mark Read
                    </button>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-600">Read</span>
                  )}

                  {notif.actionLabel && (
                    <button
                      onClick={() => handleExecuteAction(notif)}
                      className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[10px] font-mono shadow-md transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>{notif.actionLabel}</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Panel Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 text-[10px] font-mono text-slate-400 flex items-center justify-between shrink-0">
          <span className="flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
            Real-time Clinical Safety Stream
          </span>
          <button
            onClick={() => {
              if (onNavigate) onNavigate('admin_monitoring');
              onClose();
            }}
            className="text-indigo-300 hover:underline"
          >
            System Logs →
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
