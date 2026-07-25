import React, { useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, ChevronRight, AlertTriangle, ShieldAlert, Sparkles, Code2 } from 'lucide-react';

interface FormattedClinicalAnalysisProps {
  content: string;
  className?: string;
  showCopyButton?: boolean;
}

export const FormattedClinicalAnalysis: React.FC<FormattedClinicalAnalysisProps> = ({
  content,
  className = "",
  showCopyButton = true
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Clean up LaTeX symbol placeholders if present in plain markdown text
  const sanitizeContent = (text: string) => {
    return text
      .replace(/\\rightarrow/g, '→')
      .replace(/\\approx/g, '≈')
      .replace(/\\pm/g, '±')
      .replace(/\\le/g, '≤')
      .replace(/\\ge/g, '≥')
      .replace(/\\times/g, '×');
  };

  return (
    <div className={`relative group/clinical ${className}`}>
      {showCopyButton && (
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 opacity-80 hover:opacity-100 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-lg text-[11px] font-mono flex items-center gap-1.5 transition-all z-10 cursor-pointer shadow-sm"
          title="Copy Analysis Text"
        >
          {isCopied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-bold">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span>Copy</span>
            </>
          )}
        </button>
      )}

      <div className="prose prose-invert max-w-none text-slate-200 text-xs leading-relaxed space-y-3 font-sans">
        <Markdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h1 className="text-lg font-black text-white border-b border-slate-800 pb-2 mt-4 mb-3 flex items-center gap-2 tracking-tight">
                <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
                <span>{children}</span>
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-base font-extrabold text-cyan-300 border-b border-slate-800/80 pb-1.5 mt-4 mb-2 flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{children}</span>
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-sm font-bold text-indigo-300 mt-3 mb-1.5 flex items-center gap-1.5 uppercase tracking-wide font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block"></span>
                <span>{children}</span>
              </h3>
            ),
            h4: ({ children }) => (
              <h4 className="text-xs font-bold text-slate-200 mt-2 mb-1 uppercase tracking-wider font-mono">
                {children}
              </h4>
            ),
            p: ({ children }) => (
              <p className="my-1.5 text-slate-300 leading-relaxed text-xs">
                {children}
              </p>
            ),
            strong: ({ children }) => {
              const str = String(children);
              let badgeColor = "text-white font-bold";
              if (str.includes("High") || str.includes("Critical") || str.includes("Severe") || str.includes("Toxicity") || str.includes("Bleeding")) {
                badgeColor = "text-rose-400 font-extrabold bg-rose-500/10 px-1 py-0.5 rounded border border-rose-500/20";
              } else if (str.includes("CYP") || str.includes("Inhibition") || str.includes("Warfarin") || str.includes("Amiodarone") || str.includes("Fluoxetine") || str.includes("QTc")) {
                badgeColor = "text-amber-300 font-extrabold bg-amber-500/10 px-1 py-0.5 rounded border border-amber-500/20";
              } else if (str.includes("Action") || str.includes("Recommendation") || str.includes("Safe")) {
                badgeColor = "text-cyan-300 font-bold bg-cyan-500/10 px-1 py-0.5 rounded border border-cyan-500/20";
              }
              return <strong className={badgeColor}>{children}</strong>;
            },
            ul: ({ children }) => (
              <ul className="space-y-1.5 my-2 pl-1 text-xs">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="space-y-1.5 my-2 pl-1 text-xs list-decimal list-inside">{children}</ol>
            ),
            li: ({ children }) => (
              <li className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0"></span>
                <div className="flex-1">{children}</div>
              </li>
            ),
            table: ({ children }) => (
              <div className="my-3 overflow-x-auto rounded-xl border border-slate-800 shadow-md bg-slate-950/80">
                <table className="w-full text-left border-collapse text-xs">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-slate-800/90 text-cyan-300 font-bold font-mono text-[11px] uppercase tracking-wider border-b border-slate-700">
                {children}
              </thead>
            ),
            tbody: ({ children }) => (
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {children}
              </tbody>
            ),
            tr: ({ children }) => (
              <tr className="hover:bg-slate-850 transition-colors">
                {children}
              </tr>
            ),
            th: ({ children }) => (
              <th className="px-3.5 py-2.5 font-bold">{children}</th>
            ),
            td: ({ children }) => (
              <td className="px-3.5 py-2.5 align-top">{children}</td>
            ),
            blockquote: ({ children }) => (
              <blockquote className="my-2 p-3 rounded-xl bg-amber-950/20 border-l-4 border-amber-500 text-amber-200 text-xs italic flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 not-italic" />
                <div className="not-italic">{children}</div>
              </blockquote>
            ),
            code: ({ className, children }) => {
              const isInline = !className;
              if (isInline) {
                return (
                  <code className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-[11px] text-cyan-300 border border-slate-700">
                    {children}
                  </code>
                );
              }
              return (
                <div className="my-3 rounded-xl bg-slate-950 border border-slate-800 p-3.5 font-mono text-[11px] leading-relaxed text-slate-300 overflow-x-auto shadow-inner">
                  <pre className="whitespace-pre overflow-x-auto">
                    <code>{children}</code>
                  </pre>
                </div>
              );
            },
            hr: () => <hr className="border-slate-800 my-4" />
          }}
        >
          {sanitizeContent(content)}
        </Markdown>
      </div>
    </div>
  );
};

export default FormattedClinicalAnalysis;
