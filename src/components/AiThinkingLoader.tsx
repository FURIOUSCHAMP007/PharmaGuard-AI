import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Sparkles, CheckCircle2, ShieldAlert, Database, Network, Binary, Zap } from 'lucide-react';

export interface AiThinkingLoaderProps {
  isLoading: boolean;
  title?: string;
  subtitle?: string;
  steps?: string[];
  onComplete?: () => void;
  children?: React.ReactNode;
}

const DEFAULT_STEPS = [
  "Initializing Biomedical Knowledge Graph RAG Nodes...",
  "Running Causal Counterfactual Structural Equation Model...",
  "Modeling Pharmacogenomic CYP450 Enzyme Saturation...",
  "Evaluating ACC/AHA & KDIGO Safety Guidelines...",
  "Generating Neural Risk Explanations & Confidence Bounds..."
];

export const AiThinkingLoader: React.FC<AiThinkingLoaderProps> = ({
  isLoading,
  title = "PharmaGuard AI Engine Thinking...",
  subtitle = "Synthesizing clinical knowledge graph & causal DAG simulations",
  steps = DEFAULT_STEPS,
  onComplete,
  children
}) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setActiveStepIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setActiveStepIndex((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          if (onComplete) onComplete();
          return prev;
        }
      });
    }, 450);

    return () => clearInterval(interval);
  }, [isLoading, steps.length, onComplete]);

  return (
    <div className="relative w-full">
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 border border-indigo-500/30 overflow-hidden shadow-2xl min-h-[380px]"
          >
            {/* Ambient Background Glow Effect */}
            <div className="absolute -top-20 -left-20 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
            <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />

            {/* Central Animated AI Core */}
            <div className="relative mb-6 flex items-center justify-center">
              {/* Rotating outer ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                className="w-24 h-24 rounded-full border-2 border-dashed border-cyan-400/50 absolute"
              />

              {/* Counter-rotating inner ring */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
                className="w-18 h-18 rounded-full border-2 border-indigo-500/60 border-t-transparent absolute"
              />

              {/* Pulsing Core icon */}
              <motion.div
                animate={{ scale: [0.95, 1.1, 0.95] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 p-0.5 shadow-lg shadow-cyan-500/30 flex items-center justify-center relative z-10"
              >
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                  <Cpu className="w-7 h-7 text-cyan-400 animate-pulse" />
                </div>
              </motion.div>
            </div>

            {/* Header Text */}
            <div className="text-center max-w-md space-y-1 mb-6 z-10">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
                <h3 className="text-lg font-extrabold text-white tracking-wide bg-gradient-to-r from-cyan-300 via-indigo-200 to-purple-300 bg-clip-text text-transparent">
                  {title}
                </h3>
              </div>
              <p className="text-xs text-slate-400 font-medium">{subtitle}</p>
            </div>

            {/* Step sequence progress list */}
            <div className="w-full max-w-lg space-y-2 mb-6 z-10">
              {steps.map((step, idx) => {
                const isDone = idx < activeStepIndex;
                const isCurrent = idx === activeStepIndex;

                return (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs transition-all border ${
                      isCurrent
                        ? 'bg-indigo-950/70 border-indigo-500/60 text-cyan-200 shadow-md shadow-indigo-950/50'
                        : isDone
                        ? 'bg-slate-900/50 border-emerald-500/30 text-emerald-300'
                        : 'bg-slate-900/20 border-slate-800 text-slate-500'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : isCurrent ? (
                      <motion.div
                        animate={{ scale: [0.8, 1.2, 0.8] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin shrink-0"
                      />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0 flex items-center justify-center text-[10px] text-slate-600">
                        {idx + 1}
                      </div>
                    )}
                    <span className="font-mono text-[11px] truncate">{step}</span>
                  </motion.div>
                );
              })}
            </div>

            {/* Skeleton visual placeholder wireframe */}
            <div className="w-full max-w-lg grid grid-cols-3 gap-3 z-10">
              <div className="h-12 rounded-xl bg-slate-800/40 border border-slate-800 animate-pulse p-2 space-y-1">
                <div className="h-2 w-12 bg-slate-700/60 rounded" />
                <div className="h-3 w-16 bg-cyan-500/20 rounded" />
              </div>
              <div className="h-12 rounded-xl bg-slate-800/40 border border-slate-800 animate-pulse p-2 space-y-1">
                <div className="h-2 w-14 bg-slate-700/60 rounded" />
                <div className="h-3 w-10 bg-indigo-500/20 rounded" />
              </div>
              <div className="h-12 rounded-xl bg-slate-800/40 border border-slate-800 animate-pulse p-2 space-y-1">
                <div className="h-2 w-10 bg-slate-700/60 rounded" />
                <div className="h-3 w-20 bg-emerald-500/20 rounded" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Embedded content underneath */}
      <div className={isLoading ? "opacity-25 pointer-events-none filter blur-[1px] transition-all duration-300" : "transition-all duration-300"}>
        {children}
      </div>
    </div>
  );
};

export default AiThinkingLoader;
