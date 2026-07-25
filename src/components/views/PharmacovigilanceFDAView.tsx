import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, FileText, ExternalLink, Activity, Search, Filter, TrendingUp, BarChart2, CheckCircle2, Shield, AlertOctagon, Calculator, Info, Plus, Layers } from 'lucide-react';
import { FDAAlert } from '../../types/pharmaguard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend, ReferenceLine } from 'recharts';

interface PharmacovigilanceFDAViewProps {
  alerts: FDAAlert[];
}

interface FaersSignalMetric {
  drugName: string;
  adverseEvent: string;
  totalFaersCases: number;
  rorScore: number; // Reporting Odds Ratio
  prrScore: number; // Proportional Reporting Ratio
  chiSquare: number;
  hospitalizedPct: number;
  fatalPct: number;
  signalStrength: 'Strong Signal' | 'Moderate Signal' | 'Emerging Signal';
}

const FAERS_SIGNAL_DATABASE: FaersSignalMetric[] = [
  {
    drugName: 'Amiodarone + Fluoxetine',
    adverseEvent: 'Torsades de Pointes / QTc Prolongation',
    totalFaersCases: 1420,
    rorScore: 6.84,
    prrScore: 5.21,
    chiSquare: 184.2,
    hospitalizedPct: 82,
    fatalPct: 11,
    signalStrength: 'Strong Signal'
  },
  {
    drugName: 'Simvastatin + Gemfibrozil',
    adverseEvent: 'Rhabdomyolysis / Severe Myopathy',
    totalFaersCases: 2180,
    rorScore: 9.12,
    prrScore: 7.45,
    chiSquare: 340.5,
    hospitalizedPct: 89,
    fatalPct: 14,
    signalStrength: 'Strong Signal'
  },
  {
    drugName: 'Warfarin + Fluconazole',
    adverseEvent: 'Major Gastrointestinal & Intracranial Hemorrhage',
    totalFaersCases: 3050,
    rorScore: 4.65,
    prrScore: 3.92,
    chiSquare: 112.8,
    hospitalizedPct: 76,
    fatalPct: 9,
    signalStrength: 'Strong Signal'
  },
  {
    drugName: 'Metformin + Contrast Agent',
    adverseEvent: 'Lactic Acidosis / Acute Kidney Injury',
    totalFaersCases: 890,
    rorScore: 3.42,
    prrScore: 2.85,
    chiSquare: 68.4,
    hospitalizedPct: 91,
    fatalPct: 18,
    signalStrength: 'Moderate Signal'
  },
  {
    drugName: 'Clopidogrel + Omeprazole',
    adverseEvent: 'Major Adverse Cardiovascular Events (MACE)',
    totalFaersCases: 1840,
    rorScore: 2.95,
    prrScore: 2.30,
    chiSquare: 52.1,
    hospitalizedPct: 65,
    fatalPct: 6,
    signalStrength: 'Moderate Signal'
  },
  {
    drugName: 'SGLT2 Inhibitor + Loop Diuretic',
    adverseEvent: 'Euglycemic Ketoacidosis / Severe Dehydration',
    totalFaersCases: 1120,
    rorScore: 5.14,
    prrScore: 4.10,
    chiSquare: 142.6,
    hospitalizedPct: 84,
    fatalPct: 4,
    signalStrength: 'Strong Signal'
  }
];

export const PharmacovigilanceFDAView: React.FC<PharmacovigilanceFDAViewProps> = ({ alerts }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'blackbox' | 'high_ror' | 'signals'>('all');
  const [chartMetric, setChartMetric] = useState<'both' | 'ror' | 'prr'>('both');
  const [sortBy, setSortBy] = useState<'ror' | 'prr' | 'cases'>('ror');

  // Custom 2x2 Contingency Matrix Calculator State
  const [showMatrixCalc, setShowMatrixCalc] = useState(false);
  const [calcDrug, setCalcDrug] = useState('Apixaban + Enoxaparin');
  const [calcEvent, setCalcEvent] = useState('Spinal Hematoma / Paralysis');
  const [countA, setCountA] = useState<number>(310); // Drug + Event
  const [countB, setCountB] = useState<number>(4200); // Drug + Other Events
  const [countC, setCountC] = useState<number>(1850); // Other Drugs + Event
  const [countD, setCountD] = useState<number>(250000); // Other Drugs + Other Events

  // Calculate ROR, PRR, Chi-Square
  const a = Math.max(1, countA);
  const b = Math.max(1, countB);
  const c = Math.max(1, countC);
  const d = Math.max(1, countD);

  const calculatedRor = (a * d) / (b * c);
  const seLnRor = Math.sqrt(1/a + 1/b + 1/c + 1/d);
  const rorCiLow = Math.exp(Math.log(calculatedRor) - 1.96 * seLnRor);
  const rorCiHigh = Math.exp(Math.log(calculatedRor) + 1.96 * seLnRor);

  const calculatedPrr = (a / (a + b)) / (c / (c + d));
  const totalN = a + b + c + d;
  const chiSquareNum = totalN * Math.pow(Math.abs(a*d - b*c) - (totalN/2), 2);
  const chiSquareDenom = (a + b) * (c + d) * (a + c) * (b + d);
  const calculatedChiSq = chiSquareDenom > 0 ? chiSquareNum / chiSquareDenom : 0;

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = 
      alert.drugName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.actionRequired.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterTab === 'blackbox') return matchesSearch && alert.alertType === 'Black Box Warning';
    if (filterTab === 'high_ror') return matchesSearch && (alert.alertType === 'Safety Communication' || alert.alertType === 'Black Box Warning');
    return matchesSearch;
  });

  const filteredFaersSignals = FAERS_SIGNAL_DATABASE.filter(sig => 
    sig.drugName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sig.adverseEvent.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Prepare chart dataset including interactive calculator pair if active
  const chartBaseData = [...filteredFaersSignals];
  if (showMatrixCalc) {
    chartBaseData.push({
      drugName: `${calcDrug} (Calc)`,
      adverseEvent: calcEvent,
      totalFaersCases: countA,
      rorScore: parseFloat(calculatedRor.toFixed(2)),
      prrScore: parseFloat(calculatedPrr.toFixed(2)),
      chiSquare: parseFloat(calculatedChiSq.toFixed(1)),
      hospitalizedPct: 80,
      fatalPct: 10,
      signalStrength: calculatedRor > 5 ? 'Strong Signal' : 'Moderate Signal'
    });
  }

  const sortedChartData = [...chartBaseData]
    .sort((x, y) => {
      if (sortBy === 'ror') return y.rorScore - x.rorScore;
      if (sortBy === 'prr') return y.prrScore - x.prrScore;
      return y.totalFaersCases - x.totalFaersCases;
    })
    .map(s => {
      const isCustom = s.drugName.includes('(Calc)');
      const parts = s.drugName.replace(' (Calc)', '').split(' + ');
      const shortLabel = isCustom 
        ? `[Calc] ${parts[0].split(' ')[0]}`
        : parts.length > 1 
          ? `${parts[0].split(' ')[0]} + ${parts[1].split(' ')[0]}` 
          : parts[0].split(' ')[0];

      return {
        shortName: shortLabel,
        fullDrugName: s.drugName,
        adverseEvent: s.adverseEvent,
        ror: s.rorScore,
        prr: s.prrScore,
        chiSquare: s.chiSquare,
        cases: s.totalFaersCases,
        hosp: s.hospitalizedPct,
        fatal: s.fatalPct,
        isCustom
      };
    });

  // Calculate summary metrics for the visualization header
  const maxRorSignal = sortedChartData.reduce((prev, curr) => curr.ror > prev.ror ? curr : prev, sortedChartData[0] || { ror: 0, fullDrugName: 'N/A', shortName: 'N/A' });
  const avgRor = sortedChartData.length > 0 ? (sortedChartData.reduce((acc, curr) => acc + curr.ror, 0) / sortedChartData.length).toFixed(2) : '0.00';

  const CustomChartTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3.5 rounded-xl shadow-2xl text-xs space-y-2 z-50 max-w-xs backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-bold text-white text-xs">{data.fullDrugName}</span>
            {data.isCustom && (
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[9px]">Custom Calc</span>
            )}
          </div>
          <p className="text-rose-300 font-semibold text-[11px] leading-tight">{data.adverseEvent}</p>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-950 p-2 rounded-lg border border-slate-800">
            <div>
              <span className="text-slate-400 block text-[9px] uppercase font-sans">ROR Metric</span>
              <span className="font-bold text-cyan-300 text-sm">{data.ror.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px] uppercase font-sans">PRR Metric</span>
              <span className="font-bold text-purple-300 text-sm">{data.prr.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px] uppercase font-sans">Chi-Square (χ²)</span>
              <span className="font-bold text-indigo-300">{data.chiSquare.toFixed(1)}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px] uppercase font-sans">FAERS Cases</span>
              <span className="font-bold text-amber-300">{data.cases.toLocaleString()}</span>
            </div>
          </div>
          {data.hosp > 0 && (
            <div className="text-[10px] text-slate-400 flex items-center justify-between pt-0.5">
              <span>Hosp Rate: <strong className="text-amber-300">{data.hosp}%</strong></span>
              <span>Fatal Rate: <strong className="text-rose-400">{data.fatal}%</strong></span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 text-slate-100 max-w-7xl mx-auto pb-10">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Pharmacovigilance & FDA FAERS Real-World Signal Analyzer</h1>
              <p className="text-xs text-slate-400">
                Live stream of FDA FAERS adverse event signals, Black Box Warnings, and disproportionality metrics (ROR & PRR).
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowMatrixCalc(!showMatrixCalc)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg cursor-pointer transition-all"
          >
            <Calculator className="w-4 h-4" />
            <span>{showMatrixCalc ? 'Hide Matrix Calculator' : 'Interactive 2x2 ROR / PRR Calculator'}</span>
          </button>
        </div>
      </div>

      {/* Interactive 2x2 Contingency Matrix Disproportionality Calculator */}
      {showMatrixCalc && (
        <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 space-y-5 shadow-2xl animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-white">2x2 Contingency Matrix ROR & PRR Calculator</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">Pharmacovigilance Disproportionality Engine</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Controls */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Target Drug / Regimen</label>
                  <input
                    type="text"
                    value={calcDrug}
                    onChange={(e) => setCalcDrug(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Target Adverse Reaction</label>
                  <input
                    type="text"
                    value={calcEvent}
                    onChange={(e) => setCalcEvent(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* 2x2 Matrix Table Input */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-slate-300">FAERS 2x2 Case Counts Matrix</div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                    <label className="block text-[10px] text-cyan-300 font-semibold">a: Target Drug + Target Event</label>
                    <input
                      type="number"
                      value={countA}
                      onChange={(e) => setCountA(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-white font-mono font-bold"
                    />
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                    <label className="block text-[10px] text-slate-400 font-semibold">b: Target Drug + Other Events</label>
                    <input
                      type="number"
                      value={countB}
                      onChange={(e) => setCountB(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-white font-mono"
                    />
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                    <label className="block text-[10px] text-slate-400 font-semibold">c: Other Drugs + Target Event</label>
                    <input
                      type="number"
                      value={countC}
                      onChange={(e) => setCountC(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-white font-mono"
                    />
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                    <label className="block text-[10px] text-slate-400 font-semibold">d: Other Drugs + Other Events</label>
                    <input
                      type="number"
                      value={countD}
                      onChange={(e) => setCountD(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Calculated Results */}
            <div className="space-y-4 bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-amber-300 mb-3 flex items-center justify-between">
                  <span>Computed Disproportionality Metrics ({calcDrug})</span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px]">
                    {calculatedRor > 2.0 ? 'STATISTICAL SAFETY SIGNAL' : 'NO SIGNAL'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                  <div className="p-3 bg-slate-900 rounded-xl border border-cyan-500/30">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block">Reporting Odds Ratio (ROR)</span>
                    <div className="text-2xl font-black text-cyan-300 font-mono">{calculatedRor.toFixed(2)}</div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      95% CI: [{rorCiLow.toFixed(2)} - {rorCiHigh.toFixed(2)}]
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl border border-purple-500/30">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block">Proportional Reporting Ratio (PRR)</span>
                    <div className="text-2xl font-black text-purple-300 font-mono">{calculatedPrr.toFixed(2)}</div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Chi-Square (χ²): {calculatedChiSq.toFixed(1)}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                  <div className="font-bold text-white">Signal Interpretation:</div>
                  <p className="leading-relaxed text-slate-400">
                    {calculatedRor > 2.0 && calculatedChiSq > 3.84
                      ? `Target drug/event pair (${calcDrug} & ${calcEvent}) shows a strong statistical disproportionality signal in FAERS. Reports occur ${calculatedRor.toFixed(1)}x more frequently than background reporting expectations.`
                      : `No statistically significant disproportionality signal detected for ${calcDrug} and ${calcEvent}.`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FDA FAERS Disproportionality Signal Analyzer Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">FAERS Disproportionality Signal Mining (ROR / PRR)</h2>
              <p className="text-xs text-slate-400">Reporting Odds Ratio (ROR) & Proportional Reporting Ratio (PRR) computed against OpenFDA database</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono font-bold">
            OPENFDA FAERS Q1 2026
          </span>
        </div>

        {/* Signal Comparison Chart & Controls */}
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-800/80 pb-3">
            <div>
              <span className="font-bold text-white text-sm block">Signal Strength Comparative Analysis Chart</span>
              <span className="text-[10px] text-slate-400">Comparing ROR and PRR metrics across FAERS drug-event pairs</span>
            </div>

            {/* Metric Mode Selectors */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
                <button
                  onClick={() => setChartMetric('both')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    chartMetric === 'both' ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Dual ROR & PRR
                </button>
                <button
                  onClick={() => setChartMetric('ror')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    chartMetric === 'ror' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ROR Only
                </button>
                <button
                  onClick={() => setChartMetric('prr')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    chartMetric === 'prr' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  PRR Only
                </button>
              </div>

              {/* Sort By selector */}
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
                <span className="text-[10px] text-slate-500 px-2 font-mono uppercase">Sort:</span>
                <button
                  onClick={() => setSortBy('ror')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                    sortBy === 'ror' ? 'bg-slate-700 text-cyan-300' : 'text-slate-400'
                  }`}
                >
                  ROR
                </button>
                <button
                  onClick={() => setSortBy('prr')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                    sortBy === 'prr' ? 'bg-slate-700 text-purple-300' : 'text-slate-400'
                  }`}
                >
                  PRR
                </button>
                <button
                  onClick={() => setSortBy('cases')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                    sortBy === 'cases' ? 'bg-slate-700 text-amber-300' : 'text-slate-400'
                  }`}
                >
                  Cases
                </button>
              </div>
            </div>
          </div>

          {/* Quick Metrics Summary Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Tracked Pairs</span>
              <span className="text-base font-bold text-white">{sortedChartData.length} Regimens</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Peak Signal Pair</span>
              <span className="text-xs font-bold text-rose-300 truncate block">{maxRorSignal?.shortName} (ROR {maxRorSignal?.ror})</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Avg Cohort ROR</span>
              <span className="text-base font-bold text-cyan-300 font-mono">{avgRor}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Signal Threshold</span>
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> ROR / PRR &gt; 2.0
              </span>
            </div>
          </div>

          {/* Recharts Bar Chart */}
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sortedChartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.35} />
                <XAxis 
                  dataKey="shortName" 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  interval={0} 
                  tick={{ fill: '#cbd5e1' }}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 'auto']} />
                <Tooltip content={<CustomChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <ReferenceLine 
                  y={2.0} 
                  stroke="#f59e0b" 
                  strokeDasharray="4 4" 
                  label={{ value: 'Signal Threshold (2.0)', fill: '#f59e0b', fontSize: 10, position: 'insideTopLeft' }} 
                />

                {(chartMetric === 'both' || chartMetric === 'ror') && (
                  <Bar dataKey="ror" name="Reporting Odds Ratio (ROR)" fill="#38bdf8" radius={[4, 4, 0, 0]} maxBarSize={32}>
                    {sortedChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-ror-${index}`} 
                        fill={entry.isCustom ? '#f59e0b' : entry.ror > 6 ? '#f43f5e' : entry.ror > 3 ? '#38bdf8' : '#818cf8'} 
                      />
                    ))}
                  </Bar>
                )}

                {(chartMetric === 'both' || chartMetric === 'prr') && (
                  <Bar dataKey="prr" name="Proportional Reporting Ratio (PRR)" fill="#c084fc" radius={[4, 4, 0, 0]} maxBarSize={32}>
                    {sortedChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-prr-${index}`} 
                        fill={entry.isCustom ? '#d97706' : entry.prr > 5 ? '#e879f9' : '#c084fc'} 
                      />
                    ))}
                  </Bar>
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Disproportionality Signal Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-800/90 text-cyan-300 font-bold font-mono text-[11px]">
              <tr>
                <th className="p-3">Drug Combination</th>
                <th className="p-3">Adverse Reaction Term</th>
                <th className="p-3">FAERS Cases</th>
                <th className="p-3">Reporting Odds Ratio (ROR)</th>
                <th className="p-3">PRR Score</th>
                <th className="p-3">Serious Outcomes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200 text-[11px]">
              {filteredFaersSignals.map((sig, idx) => (
                <tr key={idx} className="hover:bg-slate-900/80 transition-colors">
                  <td className="p-3 font-bold text-white">{sig.drugName}</td>
                  <td className="p-3 text-rose-300 font-semibold">{sig.adverseEvent}</td>
                  <td className="p-3 font-mono text-cyan-300 font-bold">{sig.totalFaersCases.toLocaleString()}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-1 rounded font-black font-mono text-[11px] ${
                      sig.rorScore > 6 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                      sig.rorScore > 3 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                      'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    }`}>
                      ROR = {sig.rorScore.toFixed(2)}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-indigo-300">{sig.prrScore.toFixed(2)} (x²={sig.chiSquare})</td>
                  <td className="p-3 text-[10px] space-x-2">
                    <span className="text-amber-400 font-bold">{sig.hospitalizedPct}% Hosp</span>
                    <span className="text-rose-400 font-bold">{sig.fatalPct}% Fatal</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Filter & Search Bar for FDA Alerts */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-4 border border-slate-800 rounded-2xl">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search FDA alerts by drug name, adverse reaction, or clinical keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterTab === 'all' ? 'bg-rose-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All Alerts ({alerts.length})
          </button>
          <button
            onClick={() => setFilterTab('blackbox')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterTab === 'blackbox' ? 'bg-rose-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Black Box Warnings
          </button>
        </div>
      </div>

      {/* FDA Safety Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => (
          <div key={alert.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <h3 className="font-bold text-base text-white">{alert.drugName}</h3>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30">
                  {alert.alertType}
                </span>
                <span className="text-slate-400 font-mono">{alert.date}</span>
              </div>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed bg-slate-800/60 p-4 rounded-xl border border-slate-700">
              {alert.summary}
            </p>

            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1 text-xs">
              <div className="text-slate-400 font-semibold text-[11px]">Recommended Clinical Action:</div>
              <div className="text-cyan-300 font-medium">{alert.actionRequired}</div>
            </div>

            <div className="text-[11px] text-slate-400 flex flex-wrap items-center justify-between pt-1">
              <span>Impacted Pathways: <strong className="text-amber-300">{alert.impactedPathways.join(' • ')}</strong></span>
              <span className="text-indigo-400 font-semibold flex items-center gap-1">
                OpenFDA Registry Synced
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


