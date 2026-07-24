import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, 
  User, 
  Activity, 
  Search, 
  Bell, 
  Sparkles, 
  ChevronDown,
  Lock,
  Cpu,
  Mic,
  MicOff,
  Volume2,
  HelpCircle,
  X,
  Check,
  Compass
} from 'lucide-react';
import { UserRole, Patient } from '../types/pharmaguard';

interface HeaderNavbarProps {
  selectedRole?: string;
  setSelectedRole?: (role: string) => void;
  currentRole?: UserRole;
  onSelectRole?: (role: UserRole) => void;
  activePatient?: Patient;
  allPatients?: Patient[];
  onSelectPatientId?: (id: string) => void;
  patients?: Patient[];
  selectedPatient?: Patient;
  onSelectPatient?: (patient: Patient) => void;
  activeViewTitle?: string;
  unreadAlertCount?: number;
  onOpenAlerts?: () => void;
  onNavigate?: (view: string) => void;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  selectedRole,
  setSelectedRole,
  currentRole,
  onSelectRole,
  activePatient,
  allPatients,
  onSelectPatientId,
  patients,
  selectedPatient,
  onSelectPatient,
  activeViewTitle = 'Digital Patient Twin Dashboard',
  unreadAlertCount = 3,
  onOpenAlerts,
  onNavigate
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState<string | null>(null);
  const [showVoiceGuide, setShowVoiceGuide] = useState(false);
  const recognitionRef = useRef<any>(null);

  const roles: string[] = [
    'Cardiologist / Physician',
    'Oncologist',
    'Pharmacist',
    'Nurse Practitioner',
    'Clinical Researcher',
    'Hospital Administrator',
    'System Administrator'
  ];

  const effectiveRole = selectedRole || currentRole || 'Cardiologist / Physician';
  const effectivePatients = allPatients || patients || [];
  const effectiveSelectedPatient = activePatient || selectedPatient || effectivePatients[0];

  const handleRoleChange = (newRole: string) => {
    if (setSelectedRole) setSelectedRole(newRole);
    if (onSelectRole) onSelectRole(newRole as UserRole);
  };

  const handlePatientChange = (patientId: string) => {
    if (onSelectPatientId) onSelectPatientId(patientId);
    const found = effectivePatients.find(p => p.id === patientId);
    if (found && onSelectPatient) onSelectPatient(found);
  };

  // Auto-dismiss voice feedback after 4 seconds
  useEffect(() => {
    if (voiceFeedback) {
      const timer = setTimeout(() => {
        setVoiceFeedback(null);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [voiceFeedback]);

  // Execute Voice Command Intent Matching
  const processVoiceCommand = (rawText: string) => {
    const text = rawText.toLowerCase().trim();
    setSearchQuery(rawText);

    if (!text) return;

    // 1. Navigation View Matching
    const viewMappings: { keywords: string[]; viewId: string; name: string }[] = [
      { keywords: ['dashboard', 'main console', 'overview', 'clinical safety'], viewId: 'dashboard', name: 'Clinical Safety Dashboard' },
      { keywords: ['digital twin', 'twin', 'patient twin'], viewId: 'digital_twin', name: 'Digital Patient Twin' },
      { keywords: ['patient list', 'patients', 'registry', 'patient management'], viewId: 'patients', name: 'Patient Registry' },
      { keywords: ['prescription', 'prescribe', 'prescriptions', 'drug management'], viewId: 'drug_prescribe', name: 'Drug & Prescription Mgmt' },
      { keywords: ['interaction', 'interactions', 'matrix', 'interaction matrix'], viewId: 'interaction_matrix', name: 'Drug Interaction Matrix' },
      { keywords: ['causal', 'counterfactual', 'counterfactuals', 'scm'], viewId: 'causal_counterfactual', name: 'Causal & Counterfactual Analysis' },
      { keywords: ['temporal', 'pk pd', 'pk/pd', 'simulation', 'temporal risk'], viewId: 'temporal_simulation', name: 'Temporal Risk & PK/PD Simulator' },
      { keywords: ['knowledge graph', 'graph', 'kg explorer'], viewId: 'kg_explorer', name: 'Knowledge Graph Explorer' },
      { keywords: ['agent', 'agents', 'multi agent', 'agent console'], viewId: 'multi_agent', name: 'Multi-Agent AI Console' },
      { keywords: ['gemini', 'assistant', 'chat', 'ai chat'], viewId: 'ai_chat', name: 'Gemini AI Assistant' },
      { keywords: ['alternative', 'substitute', 'recommendation'], viewId: 'alt_recommend', name: 'Alternative Drug Engine' },
      { keywords: ['guidelines', 'clinical guidelines'], viewId: 'guidelines', name: 'Clinical Guidelines Viewer' },
      { keywords: ['xai', 'explainable', 'shap'], viewId: 'xai_dashboard', name: 'Explainable AI Dashboard' },
      { keywords: ['uncertainty', 'confidence', 'ece'], viewId: 'uncertainty', name: 'Uncertainty Analytics' },
      { keywords: ['fda', 'pharmacovigilance', 'alerts', 'safety alerts'], viewId: 'pharmacovigilance', name: 'FDA Pharmacovigilance' },
      { keywords: ['reports', 'pdf', 'export'], viewId: 'reports_pdf', name: 'Reports & PDF Export' },
      { keywords: ['approval', 'doctor review', 'review', 'hitl'], viewId: 'doctor_review', name: 'Doctor Review & Approval' },
      { keywords: ['research', 'ieee', 'architecture'], viewId: 'research_hub', name: 'IEEE Research Architecture' },
      { keywords: ['admin', 'monitoring', 'logs'], viewId: 'admin_monitoring', name: 'Admin & System Logs' },
      { keywords: ['home', 'landing'], viewId: 'landing', name: 'Home & Overview' }
    ];

    let matchedView = false;
    for (const mapping of viewMappings) {
      if (mapping.keywords.some(k => text.includes(k))) {
        if (onNavigate) {
          onNavigate(mapping.viewId);
          setVoiceFeedback(`Navigated to "${mapping.name}"`);
          matchedView = true;
          break;
        }
      }
    }

    // 2. Patient Switch Matching
    let matchedPatient = false;
    if (effectivePatients.length > 0) {
      for (const p of effectivePatients) {
        const full = p.name.toLowerCase();
        const parts = full.split(' ');
        if (text.includes(full) || parts.some(part => part.length > 2 && text.includes(part)) || text.includes(p.id.toLowerCase())) {
          handlePatientChange(p.id);
          setVoiceFeedback(`Selected Patient: "${p.name}"`);
          matchedPatient = true;
          break;
        }
      }
    }

    if (!matchedView && !matchedPatient) {
      setVoiceFeedback(`Voice Search Query Set: "${rawText}"`);
    }
  };

  // Toggle Microphone / Web Speech API
  const toggleVoiceRecognition = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Prompt quick simulated selection if SpeechRecognition not supported in environment
      simulateVoiceDemo("Go to Digital Twin");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceFeedback('Listening... Speak a patient name or view (e.g., "Go to Digital Twin")');
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');

        setSearchQuery(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        setVoiceFeedback(`Voice input: ${event.error === 'no-speech' ? 'No speech detected' : event.error}`);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (searchQuery.trim()) {
          processVoiceCommand(searchQuery);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to initialize speech recognition:', err);
      simulateVoiceDemo("Go to Digital Twin");
    }
  };

  const simulateVoiceDemo = (commandText: string) => {
    setIsListening(true);
    setVoiceFeedback(`Simulating Voice Input: "${commandText}"`);
    setTimeout(() => {
      setIsListening(false);
      processVoiceCommand(commandText);
    }, 1200);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-40 text-slate-900 shadow-2xs relative">
      {/* Title & System Status */}
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">{activeViewTitle}</h2>
        <div className="h-4 w-[1px] bg-slate-300 hidden sm:block"></div>
        <div className="hidden sm:flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">System Status: Optimal</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Voice-Enabled Search Bar */}
        <div className="relative hidden md:flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patients, drugs or views..."
            className={`w-56 md:w-64 pl-8 pr-16 py-1.5 bg-slate-100 border text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all ${
              isListening ? 'border-rose-500 ring-2 ring-rose-400/30 bg-rose-50/50' : 'border-slate-200 rounded-lg'
            }`}
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />

          {/* Microphone Voice Toggle Button */}
          <div className="absolute right-1.5 flex items-center gap-1">
            <button
              onClick={toggleVoiceRecognition}
              className={`p-1.5 rounded-md transition-all flex items-center gap-1 text-xs cursor-pointer ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200/60'
              }`}
              title={isListening ? 'Listening... Click to stop' : 'Voice-to-Text Input (Click to speak)'}
            >
              {isListening ? (
                <Mic className="w-3.5 h-3.5 text-white animate-bounce" />
              ) : (
                <Mic className="w-3.5 h-3.5 text-indigo-600" />
              )}
            </button>

            {/* Voice Guide Popup Toggle */}
            <button
              onClick={() => setShowVoiceGuide(!showVoiceGuide)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
              title="Voice Commands Guide"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Patient Selector */}
        {effectivePatients.length > 0 && effectiveSelectedPatient && (
          <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800">
            <User className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span className="text-slate-400 font-medium hidden md:inline">Patient:</span>
            <select
              value={effectiveSelectedPatient.id}
              onChange={(e) => handlePatientChange(e.target.value)}
              className="bg-transparent font-semibold text-slate-900 focus:outline-none cursor-pointer max-w-[160px] md:max-w-[200px] truncate"
            >
              {effectivePatients.map(p => (
                <option key={p.id} value={p.id} className="bg-white text-slate-900">
                  {p.name} ({p.riskCategory})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
          </div>
        )}

        {/* Role Selector */}
        <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800">
          <Lock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span className="text-slate-400 hidden xl:inline">Role:</span>
          <select
            value={effectiveRole}
            onChange={(e) => handleRoleChange(e.target.value)}
            className="bg-transparent font-medium text-slate-900 focus:outline-none cursor-pointer max-w-[140px] truncate"
          >
            {roles.map(r => (
              <option key={r} value={r} className="bg-white text-slate-900">
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Notifications Bell */}
        <button
          onClick={onOpenAlerts}
          className="relative p-2 text-slate-500 hover:text-indigo-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
          title="Notifications & Safety Alerts"
        >
          <Bell className="w-4 h-4 text-slate-600" />
          {unreadAlertCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
          )}
        </button>
      </div>

      {/* Voice Feedback Toast Overlay */}
      {voiceFeedback && (
        <div className="absolute left-1/2 -translate-x-1/2 top-20 bg-slate-950 text-white px-4 py-2 rounded-xl border border-indigo-500/50 shadow-2xl z-50 flex items-center gap-2 text-xs font-mono animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
          <span>{voiceFeedback}</span>
          <button onClick={() => setVoiceFeedback(null)} className="text-slate-400 hover:text-white ml-2">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Voice Commands Guide Popover */}
      {showVoiceGuide && (
        <div className="absolute right-24 top-16 w-80 bg-slate-950 text-white p-4 rounded-2xl border border-slate-800 shadow-2xl z-50 text-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-1.5 font-bold text-indigo-300">
              <Mic className="w-4 h-4 text-indigo-400" />
              <span>Voice Navigation Commands</span>
            </div>
            <button onClick={() => setShowVoiceGuide(false)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-slate-300">
            Click the microphone button and speak a command to switch views or select a patient:
          </p>

          <div className="space-y-1.5">
            <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-bold">Quick Demo Commands:</div>
            <div className="space-y-1 text-[11px] font-mono">
              <button
                onClick={() => { simulateVoiceDemo("Go to Digital Twin"); setShowVoiceGuide(false); }}
                className="w-full text-left p-1.5 rounded bg-slate-900 hover:bg-indigo-900/50 border border-slate-800 text-indigo-200 transition-colors flex items-center justify-between"
              >
                <span>"Go to Digital Twin"</span>
                <Compass className="w-3 h-3 text-indigo-400" />
              </button>
              <button
                onClick={() => { simulateVoiceDemo(`Select ${effectivePatients[0]?.name || 'Patient'}`); setShowVoiceGuide(false); }}
                className="w-full text-left p-1.5 rounded bg-slate-900 hover:bg-indigo-900/50 border border-slate-800 text-cyan-200 transition-colors flex items-center justify-between"
              >
                <span>"Select {effectivePatients[0]?.name?.split(' ')[0] || 'Eleanor'}"</span>
                <User className="w-3 h-3 text-cyan-400" />
              </button>
              <button
                onClick={() => { simulateVoiceDemo("Open FDA Alerts"); setShowVoiceGuide(false); }}
                className="w-full text-left p-1.5 rounded bg-slate-900 hover:bg-indigo-900/50 border border-slate-800 text-rose-200 transition-colors flex items-center justify-between"
              >
                <span>"Open FDA Alerts"</span>
                <ShieldAlert className="w-3 h-3 text-rose-400" />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default HeaderNavbar;
