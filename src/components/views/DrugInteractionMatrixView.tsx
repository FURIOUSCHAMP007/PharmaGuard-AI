import React from 'react';
import { Network, AlertTriangle, ShieldAlert, Cpu, CheckCircle2, ArrowRight } from 'lucide-react';
import { Patient, DrugInteraction } from '../../types/pharmaguard';
import { INITIAL_PATIENTS } from '../../data/mockClinicalData';
import { GNNGraphVisualizer } from '../GNNGraphVisualizer';

interface DrugInteractionMatrixViewProps {
  patient?: Patient;
  interactions?: DrugInteraction[];
}

export const DrugInteractionMatrixView: React.FC<DrugInteractionMatrixViewProps> = ({
  patient,
  interactions = []
}) => {
  const activePatient = patient || INITIAL_PATIENTS[0];
  const meds = activePatient.activeMedications;

  return (
    <div className="space-y-6 text-slate-100 max-w-7xl mx-auto pb-10">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Network className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Multi-Drug Regimen Conflict Matrix</h1>
            <p className="text-xs text-slate-400">
              N × N metabolic cross-interaction matrix evaluating Cytochrome P450 competitive binding, transporter efflux competition, and cardiac channel stacking.
            </p>
          </div>
        </div>
      </div>

      {/* GNN Graph Neural Network Subgraph Visualizer */}
      <GNNGraphVisualizer
        title="GNN Multi-Drug Bipartite Graph & CYP Competitive Inhibition Neural Model"
        subtitle={`Interactive GAT attention network predicting enzymatic saturation and off-target binding for ${activePatient.name}`}
        patientName={activePatient.name}
      />

      {/* Cross-Interaction Matrix Visualizer Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3">
          Pairwise Interaction Grid ({meds.length} × {meds.length} Matrix)
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="p-3">Drug A \ Drug B</th>
                {meds.map((m) => (
                  <th key={m.id} className="p-3 font-bold text-slate-200 text-center">{m.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {meds.map((rowMed) => (
                <tr key={rowMed.id} className="border-b border-slate-800/60 hover:bg-slate-800/40">
                  <td className="p-3 font-bold text-slate-200">{rowMed.name}</td>
                  {meds.map((colMed) => {
                    if (rowMed.id === colMed.id) {
                      return (
                        <td key={colMed.id} className="p-3 text-center bg-slate-800/30 text-slate-600 font-mono">
                          —
                        </td>
                      );
                    }

                    const match = interactions.find(
                      i => (i.drugA === rowMed.name && i.drugB === colMed.name) ||
                           (i.drugB === rowMed.name && i.drugA === colMed.name)
                    );

                    if (match) {
                      return (
                        <td key={colMed.id} className="p-3 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                            match.severity === 'Severe' || match.severity === 'Contraindicated'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}>
                            {match.severity}
                          </span>
                        </td>
                      );
                    }

                    return (
                      <td key={colMed.id} className="p-3 text-center text-emerald-400 font-semibold">
                        Safe
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CYP Enzymatic & Transporter Pathway Visualizer */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <span>Cytochrome P450 & Transporter Competition Map</span>
            </h2>
            <p className="text-xs text-slate-400">Enzymatic bottleneck evaluation based on patient's PGx metabolizer phenotype</p>
          </div>
          <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
            CYP2D6 *4/*4 Poor Metabolizer
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-cyan-300">CYP2D6 Pathway</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                0% Activity
              </span>
            </div>
            <div className="text-[11px] text-slate-300 font-medium">Substrates: Metoprolol, Sertraline</div>
            <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
              <div className="bg-rose-500 h-full w-[10%]" title="Severely Impaired"></div>
            </div>
            <p className="text-[10px] text-rose-300 font-mono">Metoprolol AUC +320% elevated (Toxicity Risk)</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-cyan-300">CYP3A4 Pathway</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                50% Competition
              </span>
            </div>
            <div className="text-[11px] text-slate-300 font-medium">Substrates: Apixaban, Amiodarone</div>
            <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
              <div className="bg-amber-400 h-full w-[50%]" title="Competitive Binding"></div>
            </div>
            <p className="text-[10px] text-amber-300 font-mono">Amiodarone inhibits Apixaban clearance</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-cyan-300">CYP2C9 Pathway</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Normal Extens.
              </span>
            </div>
            <div className="text-[11px] text-slate-300 font-medium">Substrates: Warfarin, Losartan</div>
            <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-400 h-full w-[85%]" title="Normal Metabolism"></div>
            </div>
            <p className="text-[10px] text-emerald-300 font-mono">Normal clearance kinetics</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-cyan-300">P-gp (ABCB1) Efflux</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Inhibited
              </span>
            </div>
            <div className="text-[11px] text-slate-300 font-medium">Substrates: Digoxin, Apixaban</div>
            <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
              <div className="bg-purple-400 h-full w-[35%]" title="Efflux Blockade"></div>
            </div>
            <p className="text-[10px] text-purple-300 font-mono">Increased CNS/plasma bioavailability</p>
          </div>
        </div>
      </div>

      {/* Detailed Mechanistic Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3">
          Mechanistic & Pathway Breakdown
        </h2>

        <div className="space-y-4">
          {interactions.map((int) => (
            <div key={int.id} className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <span className="text-cyan-300">{int.drugA}</span>
                  <span className="text-slate-500">↔</span>
                  <span className="text-cyan-300">{int.drugB}</span>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-rose-500/10 text-rose-300 border border-rose-500/30">
                  {int.severity} Interaction
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <div className="text-slate-400 font-semibold text-[11px]">Metabolic Conflict Pathway</div>
                  <div className="text-amber-300 font-bold">{int.metabolicConflict}</div>
                  <p className="text-slate-300 text-[11px] leading-relaxed pt-1">{int.mechanism}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <div className="text-slate-400 font-semibold text-[11px]">Predicted Clinical Impact</div>
                  <div className="text-rose-300 font-bold">{int.clinicalImpact}</div>
                  <div className="text-[11px] text-slate-400 pt-2 flex items-center justify-between border-t border-slate-800">
                    <span>Evidence: <strong className="text-slate-200">{int.evidenceLevel}</strong></span>
                    <span>Confidence: <strong className="text-emerald-400 font-bold">{(int.confidenceScore * 100).toFixed(0)}%</strong></span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
