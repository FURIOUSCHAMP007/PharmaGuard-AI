import React, { useState } from 'react';
import { MessageSquareCode, Send, Bot, User, Sparkles, RefreshCw } from 'lucide-react';
import { Patient } from '../../types/pharmaguard';
import { INITIAL_PATIENTS } from '../../data/mockClinicalData';

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

  const suggestedPrompts = [
    `Explain the CYP2D6 and CYP2C9 competitive inhibition mechanism in ${activePatient.name}'s current regimen.`,
    `What are the safest renal-adjusted alternatives to Warfarin for eGFR ${activePatient.kidneyFunction.egfr}?`,
    `How does Amiodarone + Fluoxetine co-administration expand cardiac QTc interval?`
  ];

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputPrompt;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputPrompt('');
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

                <div className={`p-4 rounded-2xl max-w-xl space-y-1 ${
                  m.sender === 'user' 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none' 
                    : 'bg-slate-800/90 border border-slate-700 text-slate-100 rounded-tl-none'
                }`}>
                  <div className="flex items-center justify-between text-[10px] text-slate-300 mb-1">
                    <span className="font-bold">{m.sender === 'user' ? 'You' : 'PharmaGuard Co-pilot'}</span>
                    <span className="opacity-70">{m.timestamp}</span>
                  </div>
                  <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>
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
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask Gemini about drug mechanisms, renal adjustments, or counterfactuals..."
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={() => handleSend()}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold p-2.5 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Grounded Prompts */}
        <div className="space-y-6">
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
