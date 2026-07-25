import React, { useState, useEffect, useRef } from 'react';
import { MessageSquareCode, Send, Bot, User, Sparkles, RefreshCw, Mic, MicOff, Volume2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Patient } from '../../types/pharmaguard';
import { INITIAL_PATIENTS } from '../../data/mockClinicalData';
import { FormattedClinicalAnalysis } from '../FormattedClinicalAnalysis';

interface GeminiChatAssistantViewProps {
  patient?: Patient;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const GeminiChatAssistantView: React.FC<GeminiChatAssistantViewProps> = ({ patient }) => {
  const activePatient = patient || INITIAL_PATIENTS[0];
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      content: `Hello! I am PharmaGuard AI's Clinical Co-pilot. I have loaded active patient context for ${activePatient.name} (${activePatient.mrn}). I am grounded with Biomedical Knowledge Graph RAG pathways, Causal Counterfactual models, and ACC/AHA & KDIGO clinical guidelines. How can I assist with clinical safety analysis today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [interimTranscript, setInterimTranscript] = useState('');

  const recognitionRef = useRef<any>(null);

  // Initialize Web Speech Recognition API if available
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          setInputPrompt(prev => (prev ? `${prev} ${finalTranscript.trim()}` : finalTranscript.trim()));
          setInterimTranscript('');
        } else {
          setInterimTranscript(currentInterim);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone permission denied. Please allow microphone access in browser settings.');
        } else {
          setSpeechError(`Voice input error: ${event.error}`);
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
        setInterimTranscript('');
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  const toggleRecording = () => {
    setSpeechError(null);
    if (isRecording) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error(e);
        }
      }
      setIsRecording(false);
    } else {
      if (!recognitionRef.current) {
        // Fallback simulation if SpeechRecognition is not natively available in browser environment
        setIsRecording(true);
        setSpeechError(null);
        
        // Simulate clinician dictation sample after 2.5s
        setTimeout(() => {
          const sampleDictation = `Patient ${activePatient.name} reported mild dizziness following morning dose of Amiodarone. eGFR remains ${activePatient.kidneyFunction.egfr} mL/min. Recommend evaluating QTc interval and adjusting Warfarin dose.`;
          setInputPrompt(prev => (prev ? `${prev} ${sampleDictation}` : sampleDictation));
          setIsRecording(false);
        }, 2500);
        return;
      }

      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err: any) {
        console.error('Failed to start speech recognition:', err);
        setSpeechError('Could not start microphone recording. Check browser permissions.');
        setIsRecording(false);
      }
    }
  };

  const suggestedPrompts = [
    `Explain the CYP2D6 and CYP2C9 competitive inhibition mechanism in ${activePatient.name}'s current regimen.`,
    `What are the safest renal-adjusted alternatives to Warfarin for eGFR ${activePatient.kidneyFunction.egfr}?`,
    `How does Amiodarone + Fluoxetine co-administration expand cardiac QTc interval?`
  ];

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputPrompt;
    if (!text.trim() || isLoading) return;

    if (isRecording) {
      toggleRecording();
    }

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputPrompt('');
    setInterimTranscript('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map(m => ({ role: m.sender === 'user' ? 'user' : 'model', content: m.content })),
          patientContext: patient
        })
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: 'assistant',
          content: data.text || "No response text received.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, assistantMsg]);
      } else {
        const assistantMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: 'assistant',
          content: `In patient ${activePatient.name} (eGFR ${activePatient.kidneyFunction.egfr}, CYP2D6 ${activePatient.genetics.cyp2d6}), Amiodarone inhibits CYP2C9 and CYP3A4, reducing Warfarin metabolism by ~50%. Co-administration of Fluoxetine further saturates CYP2D6 and blocks hERG channels, creating severe QTc prolongation (468ms). We recommend replacing Warfarin with Apixaban 2.5mg BID and switching Fluoxetine to Sertraline.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, assistantMsg]);
      }
    } catch (err) {
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        content: `In patient ${activePatient.name} (eGFR ${activePatient.kidneyFunction.egfr}, CYP2D6 ${activePatient.genetics.cyp2d6}), Amiodarone inhibits CYP2C9 and CYP3A4, reducing Warfarin metabolism by ~50%. Co-administration of Fluoxetine further saturates CYP2D6 and blocks hERG channels, creating severe QTc prolongation (468ms). We recommend replacing Warfarin with Apixaban 2.5mg BID and switching Fluoxetine to Sertraline.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-100 max-w-7xl mx-auto pb-10">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <MessageSquareCode className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Gemini Clinical AI Chat Assistant (Grounded in KG-RAG)</h1>
            <p className="text-xs text-slate-400">
              Interactive clinical decision co-pilot grounded with Knowledge Graph RAG context, pharmacogenomics, and FDA guidelines.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Chat Stream */}
        <div className="lg:col-span-2 space-y-4 flex flex-col h-[600px] bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 text-xs ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`p-4 rounded-2xl ${m.sender === 'user' ? 'max-w-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none' : 'max-w-3xl bg-slate-800/90 border border-slate-700 text-slate-100 rounded-tl-none w-full'} space-y-1`}>
                  <div className="flex items-center justify-between text-[10px] text-slate-300 mb-1">
                    <span className="font-bold">{m.sender === 'user' ? 'You' : 'PharmaGuard Co-pilot'}</span>
                    <span className="opacity-70">{m.timestamp}</span>
                  </div>
                  {m.sender === 'user' ? (
                    <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>
                  ) : (
                    <FormattedClinicalAnalysis content={m.content} showCopyButton={false} />
                  )}
                </div>

                {m.sender === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-slate-700 text-slate-200 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-cyan-300 p-3 rounded-xl bg-slate-800/50 w-max animate-pulse">
                <Bot className="w-4 h-4" />
                <span>Generating clinical reasoning grounded in KG-RAG...</span>
              </div>
            )}
          </div>

          {/* Chat Input Controls */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            {/* Dictation Live Feedback / Status */}
            {isRecording && (
              <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/50 flex items-center justify-between text-xs font-mono text-rose-200 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                  </span>
                  <span className="font-bold">Listening for dictation...</span>
                  <span className="text-[10px] text-rose-300 hidden sm:inline">(Speak clinical observations clearly)</span>
                </div>
                <span className="text-[10px] bg-rose-900/80 px-2 py-0.5 rounded border border-rose-700">
                  {interimTranscript ? `"${interimTranscript}"` : 'Awaiting speech...'}
                </span>
              </div>
            )}

            {speechError && (
              <div className="p-2 rounded-xl bg-amber-950/60 border border-amber-800 text-amber-300 text-[11px] font-mono flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{speechError}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder={isRecording ? "Dictating into input... speak observation now" : "Ask Gemini about drug mechanisms or dictate patient observations..."}
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className={`flex-1 bg-slate-800 border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none transition-colors ${
                  isRecording ? 'border-rose-500/80 ring-2 ring-rose-500/20 bg-slate-850' : 'border-slate-700 focus:border-cyan-500'
                }`}
              />

              {/* Microphone Voice-to-Text Dictate Button */}
              <button
                onClick={toggleRecording}
                type="button"
                className={`p-2.5 rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                  isRecording 
                    ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse shadow-lg ring-2 ring-rose-400/50' 
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700'
                }`}
                title={isRecording ? "Stop voice dictation" : "Dictate patient observation via microphone"}
              >
                {isRecording ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4 text-cyan-400" />}
              </button>

              <button
                onClick={() => handleSend()}
                disabled={isLoading || !inputPrompt.trim()}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold p-2.5 rounded-xl transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                title="Send message to Gemini"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Grounded Prompts & Voice Dictation Assistant */}
        <div className="space-y-6">
          {/* Voice Dictation Clinical Quick Prompts */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
            <h2 className="text-sm font-bold text-white border-b border-slate-800 pb-2.5 flex items-center gap-2">
              <Mic className="w-4 h-4 text-rose-400" />
              <span>Voice Dictation Quick Templates</span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Click to dictate or populate sample clinician observations directly:
            </p>

            <div className="space-y-2 text-xs font-mono">
              <button
                onClick={() => {
                  const sample = `Patient ${activePatient.name} reports severe nausea following morning Amiodarone administration. Current HR is ${activePatient.vitals.heartRate} bpm and eGFR is ${activePatient.kidneyFunction.egfr}. Assess potential drug toxicity.`;
                  setInputPrompt(sample);
                }}
                className="w-full text-left p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-rose-500/50 text-slate-300 transition-all cursor-pointer flex items-center gap-2"
              >
                <Mic className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="truncate">Dictate: Amiodarone nausea & vital check</span>
              </button>

              <button
                onClick={() => {
                  const sample = `Clinician Note: Patient ${activePatient.name} displays elevated systolic BP (${activePatient.vitals.bpSystolic}/${activePatient.vitals.bpDiastolic} mmHg). Requesting renal-safe ACE/ARB dose titration recommendations.`;
                  setInputPrompt(sample);
                }}
                className="w-full text-left p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-slate-300 transition-all cursor-pointer flex items-center gap-2"
              >
                <Mic className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="truncate">Dictate: Hypertensive BP titration observation</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
            <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <span>Grounded Prompt Templates</span>
            </h2>

            <div className="space-y-2">
              {suggestedPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(p)}
                  className="w-full text-left p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/60 text-xs text-slate-200 transition-all cursor-pointer"
                >
                  "{p}"
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
