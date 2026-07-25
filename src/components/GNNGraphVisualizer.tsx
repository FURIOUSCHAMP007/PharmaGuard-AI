import React, { useState, useMemo, useRef } from 'react';
import { Share2, Sparkles, Filter, Layers, Zap, Eye, Cpu, Activity, Circle, ShieldAlert, ArrowRight, RefreshCw, BarChart2, CheckCircle2, ZoomIn, ZoomOut, Maximize2, Move, RotateCcw } from 'lucide-react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, CartesianGrid, Cell, AreaChart, Area } from 'recharts';

export type GNNNodeType = 'Drug' | 'Target' | 'Enzyme' | 'Pathway' | 'SideEffect';

export interface GNNNodeData {
  id: string;
  label: string;
  type: GNNNodeType;
  x: number; // percentage pos 0-100
  y: number; // percentage pos 0-100
  tsneX: number; // 2D projection
  tsneY: number;
  embeddingDim: number; // 512
  riskContribution: number; // 0-100
  description: string;
  code?: string;
}

export interface GNNEdgeData {
  id: string;
  source: string;
  target: string;
  relation: string;
  attentionWeight: number; // 0.0 to 1.0
  headScores: [number, number, number, number]; // 4 GAT heads
}

interface GNNGraphVisualizerProps {
  title?: string;
  subtitle?: string;
  initialNodes?: GNNNodeData[];
  initialEdges?: GNNEdgeData[];
  patientName?: string;
  compactMode?: boolean;
  onNodeSelect?: (nodeId: string) => void;
}

export const GNNGraphVisualizer: React.FC<GNNGraphVisualizerProps> = ({
  title = "Graph Neural Network (GNN) Message-Passing & Attention Architecture",
  subtitle = "Real-time GAT (Graph Attention Network) node-level aggregation, 512-dim embedding projections, and multi-head edge attributions",
  patientName = "Selected Patient",
  compactMode = false,
  initialNodes,
  initialEdges,
  onNodeSelect
}) => {
  const [selectedModel, setSelectedModel] = useState<'GAT' | 'GCN' | 'RGCN'>('GAT');
  const [activeLayer, setActiveLayer] = useState<number>(2); // Layer 0, 1, 2
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('All');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('d1');
  const [minAttentionThreshold, setMinAttentionThreshold] = useState<number>(0.15);
  const [activeTab, setActiveTab] = useState<'graph' | 'tsne' | 'attention' | 'convergence'>('graph');

  // Movable / Pannable / Zoomable Graph State
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({});
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const [isPanningCanvas, setIsPanningCanvas] = useState<boolean>(false);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);

  const dragStartRef = useRef<{
    mouseX: number;
    mouseY: number;
    initialPan: { x: number; y: number };
    initialNodePos?: { x: number; y: number };
  }>({
    mouseX: 0,
    mouseY: 0,
    initialPan: { x: 0, y: 0 }
  });

  const svgContainerRef = useRef<HTMLDivElement | null>(null);

  const getNodePos = (node: GNNNodeData) => {
    return nodePositions[node.id] || { x: node.x, y: node.y };
  };

  const handleResetNodePositions = () => {
    setNodePositions({});
  };

  const handleResetView = () => {
    setPan({ x: 0, y: 0 });
    setZoom(1.0);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(2.5, +(prev + 0.15).toFixed(2)));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(0.5, +(prev - 0.15).toFixed(2)));
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setZoom(prev => {
      const next = prev * zoomFactor;
      return Math.min(2.5, Math.max(0.5, +next.toFixed(2)));
    });
  };

  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).tagName === 'BUTTON' || (e.target as HTMLElement).tagName === 'INPUT') return;

    setIsPanningCanvas(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      initialPan: { ...pan }
    };
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch (err) {
      // safe fallback
    }
  };

  const handleNodePointerDown = (e: React.PointerEvent<SVGGElement>, nodeId: string) => {
    e.stopPropagation();
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    const currentPos = getNodePos(node);
    setDraggedNodeId(nodeId);
    setSelectedNodeId(nodeId);
    onNodeSelect?.(nodeId);

    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      initialPan: { ...pan },
      initialNodePos: { ...currentPos }
    };

    try {
      (e.currentTarget as unknown as HTMLElement).setPointerCapture(e.pointerId);
    } catch (err) {
      // safe fallback
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const dx = e.clientX - dragStartRef.current.mouseX;
    const dy = e.clientY - dragStartRef.current.mouseY;

    if (draggedNodeId) {
      const rect = svgContainerRef.current?.getBoundingClientRect();
      if (!rect || rect.width === 0 || rect.height === 0) return;

      const initialPos = dragStartRef.current.initialNodePos;
      if (!initialPos) return;

      const deltaXPercent = (dx / (rect.width * zoom)) * 100;
      const deltaYPercent = (dy / (rect.height * zoom)) * 100;

      const newX = Math.min(95, Math.max(5, +(initialPos.x + deltaXPercent).toFixed(1)));
      const newY = Math.min(95, Math.max(5, +(initialPos.y + deltaYPercent).toFixed(1)));

      setNodePositions(prev => ({
        ...prev,
        [draggedNodeId]: { x: newX, y: newY }
      }));
    } else if (isPanningCanvas) {
      const initialPan = dragStartRef.current.initialPan;
      setPan({
        x: initialPan.x + dx,
        y: initialPan.y + dy
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsPanningCanvas(false);
    setDraggedNodeId(null);
    try {
      if ((e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      }
    } catch (err) {
      // safe fallback
    }
  };

  // Default rich biomedical GNN node set
  const defaultNodes: GNNNodeData[] = useMemo(() => [
    { id: 'd1', label: 'Amiodarone', type: 'Drug', x: 25, y: 30, tsneX: -45, tsneY: 35, embeddingDim: 512, riskContribution: 88, description: 'Class III antiarrhythmic, potent hERG channel blocker & CYP2C9/2D6 inhibitor', code: 'RxNorm: 703' },
    { id: 'd2', label: 'Fluoxetine', type: 'Drug', x: 22, y: 70, tsneX: -55, tsneY: -20, embeddingDim: 512, riskContribution: 64, description: 'SSRI antidepressant, strong CYP2D6 inhibitor & secondary QTc prolonging agent', code: 'RxNorm: 4493' },
    { id: 'd3', label: 'Warfarin', type: 'Drug', x: 75, y: 25, tsneX: 40, tsneY: 50, embeddingDim: 512, riskContribution: 79, description: 'Vitamin K antagonist, narrow therapeutic index CYP2C9 substrate', code: 'RxNorm: 11289' },
    { id: 'e1', label: 'CYP2C9', type: 'Enzyme', x: 50, y: 20, tsneX: -10, tsneY: 42, embeddingDim: 512, riskContribution: 82, description: 'Hepatic cytochrome P450 2C9 enzyme responsible for Warfarin clearance', code: 'HGNC: 2623' },
    { id: 'e2', label: 'CYP2D6', type: 'Enzyme', x: 45, y: 65, tsneX: -20, tsneY: -10, embeddingDim: 512, riskContribution: 71, description: 'Hepatic enzyme metabolizing ~25% of clinical drugs, subject to genetic polymorphism', code: 'HGNC: 2625' },
    { id: 't1', label: 'hERG (KCNH2)', type: 'Target', x: 30, y: 50, tsneX: -38, tsneY: 8, embeddingDim: 512, riskContribution: 94, description: 'Voltage-gated potassium channel subunit responsible for cardiac Ikr repolarization', code: 'ChEMBL: 240' },
    { id: 't2', label: 'VKORC1', type: 'Target', x: 82, y: 48, tsneX: 62, tsneY: 30, embeddingDim: 512, riskContribution: 55, description: 'Vitamin K epoxide reductase complex subunit 1', code: 'ChEMBL: 5550' },
    { id: 'pw1', label: 'Ventricular Repolarization', type: 'Pathway', x: 55, y: 85, tsneX: 15, tsneY: -45, embeddingDim: 512, riskContribution: 89, description: 'KEGG Pathway hsa04261: Cardiac muscle contraction & electrophysiology', code: 'KEGG: hsa04261' },
    { id: 'se1', label: 'Torsades de Pointes', type: 'SideEffect', x: 12, y: 45, tsneX: -75, tsneY: 20, embeddingDim: 512, riskContribution: 96, description: 'Lethal polymorphic ventricular tachycardia triggered by prolonged QTc', code: 'UMLS: C0040479' },
    { id: 'se2', label: 'Major Bleeding Risk', type: 'SideEffect', x: 88, y: 75, tsneX: 78, tsneY: -35, embeddingDim: 512, riskContribution: 84, description: 'Supratherapeutic INR hemorrhage due to CYP2C9 Warfarin metabolic inhibition', code: 'UMLS: C0019080' }
  ], []);

  // Default GNN edge set with GAT multi-head attention weights
  const defaultEdges: GNNEdgeData[] = useMemo(() => [
    { id: 'e_d1_e1', source: 'd1', target: 'e1', relation: 'INHIBITS_CYP', attentionWeight: 0.92, headScores: [0.94, 0.91, 0.89, 0.95] },
    { id: 'e_d1_t1', source: 'd1', target: 't1', relation: 'BLOCKS_ION_CHANNEL', attentionWeight: 0.96, headScores: [0.98, 0.95, 0.97, 0.94] },
    { id: 'e_d2_e2', source: 'd2', target: 'e2', relation: 'POTENT_INHIBITOR', attentionWeight: 0.87, headScores: [0.85, 0.89, 0.88, 0.86] },
    { id: 'e_d2_t1', source: 'd2', target: 't1', relation: 'OFF_TARGET_BINDING', attentionWeight: 0.62, headScores: [0.60, 0.65, 0.61, 0.63] },
    { id: 'e_d3_e1', source: 'd3', target: 'e1', relation: 'METABOLIZED_BY', attentionWeight: 0.89, headScores: [0.91, 0.88, 0.87, 0.90] },
    { id: 'e_d3_t2', source: 'd3', target: 't2', relation: 'TARGET_BINDING', attentionWeight: 0.82, headScores: [0.84, 0.80, 0.83, 0.81] },
    { id: 'e_t1_se1', source: 't1', target: 'se1', relation: 'TRIGGERS_ADR', attentionWeight: 0.98, headScores: [0.99, 0.97, 0.98, 0.98] },
    { id: 'e_t1_pw1', source: 't1', target: 'pw1', relation: 'DISRUPTS_PATHWAY', attentionWeight: 0.91, headScores: [0.92, 0.90, 0.91, 0.92] },
    { id: 'e_e1_se2', source: 'e1', target: 'se2', relation: 'ELEVATES_TOXICITY', attentionWeight: 0.85, headScores: [0.87, 0.84, 0.86, 0.83] },
    { id: 'e_e2_pw1', source: 'e2', target: 'pw1', relation: 'MODULATES_SIGNAL', attentionWeight: 0.54, headScores: [0.52, 0.56, 0.53, 0.55] }
  ], []);

  const nodes = useMemo(() => (initialNodes && initialNodes.length > 0 ? initialNodes : defaultNodes), [initialNodes, defaultNodes]);
  const edges = useMemo(() => (initialEdges && initialEdges.length > 0 ? initialEdges : defaultEdges), [initialEdges, defaultEdges]);

  const selectedNode = useMemo(() => nodes.find(n => n.id === selectedNodeId) || nodes[0], [nodes, selectedNodeId]);

  // Filtered nodes by type
  const filteredNodes = useMemo(() => {
    if (selectedTypeFilter === 'All') return nodes;
    return nodes.filter(n => n.type === selectedTypeFilter);
  }, [nodes, selectedTypeFilter]);

  const filteredNodeIds = useMemo(() => new Set(filteredNodes.map(n => n.id)), [filteredNodes]);

  // Filtered edges by attention threshold & node visibility
  const filteredEdges = useMemo(() => {
    return edges.filter(e =>
      e.attentionWeight >= minAttentionThreshold &&
      filteredNodeIds.has(e.source) &&
      filteredNodeIds.has(e.target)
    );
  }, [edges, minAttentionThreshold, filteredNodeIds]);

  // Node helper getters
  const getNodeColor = (type: GNNNodeType) => {
    switch (type) {
      case 'Drug': return '#38bdf8'; // Cyan/Sky
      case 'Enzyme': return '#a855f7'; // Purple
      case 'Target': return '#f43f5e'; // Rose
      case 'Pathway': return '#10b981'; // Emerald
      case 'SideEffect': return '#f59e0b'; // Amber
    }
  };

  const getNodeBg = (type: GNNNodeType) => {
    switch (type) {
      case 'Drug': return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
      case 'Enzyme': return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'Target': return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'Pathway': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'SideEffect': return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    }
  };

  // Recharts Radar data for Multi-Head Attention of selected node edges
  const radarData = useMemo(() => {
    const connected = edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id);
    if (connected.length === 0) return [];

    return [
      { aspect: 'Head 1 (Structural)', score: Math.round((connected.reduce((acc, e) => acc + e.headScores[0], 0) / connected.length) * 100) },
      { aspect: 'Head 2 (Enzymatic)', score: Math.round((connected.reduce((acc, e) => acc + e.headScores[1], 0) / connected.length) * 100) },
      { aspect: 'Head 3 (Ion Channel)', score: Math.round((connected.reduce((acc, e) => acc + e.headScores[2], 0) / connected.length) * 100) },
      { aspect: 'Head 4 (Toxicity)', score: Math.round((connected.reduce((acc, e) => acc + e.headScores[3], 0) / connected.length) * 100) }
    ];
  }, [edges, selectedNode]);

  // GNN Convergence across layers $L_0, L_1, L_2, L_3$
  const convergenceData = useMemo(() => [
    { layer: 'Layer 0 (Raw Features)', variance: 94, classificationAccuracy: 58, messageEntropy: 0.95 },
    { layer: 'Layer 1 (1-Hop Conv)', variance: 52, classificationAccuracy: 79, messageEntropy: 0.62 },
    { layer: 'Layer 2 (2-Hop GAT)', variance: 24, classificationAccuracy: 93, messageEntropy: 0.31 },
    { layer: 'Layer 3 (Graph Readout)', variance: 11, classificationAccuracy: 98.4, messageEntropy: 0.12 }
  ], []);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-start md:items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 shrink-0">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-extrabold text-white">{title}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                GNN v4.2 PyG Subgraph
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
          </div>
        </div>

        {/* View Switching Navigation */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
          <button
            onClick={() => setActiveTab('graph')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'graph' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Node Network</span>
          </button>

          <button
            onClick={() => setActiveTab('tsne')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'tsne' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>t-SNE Embeddings</span>
          </button>

          <button
            onClick={() => setActiveTab('attention')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'attention' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Multi-Head Attention</span>
          </button>

          <button
            onClick={() => setActiveTab('convergence')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'convergence' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Convergence Stats</span>
          </button>
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 text-xs">
        {/* Model Architecture */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            GNN Layer Model
          </label>
          <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
            {(['GAT', 'GCN', 'RGCN'] as const).map((model) => (
              <button
                key={model}
                onClick={() => setSelectedModel(model)}
                className={`py-1 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                  selectedModel === model ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {model}
              </button>
            ))}
          </div>
        </div>

        {/* Message Passing Layer Depth */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 flex items-center justify-between">
            <span>Aggregation Depth (Layer L)</span>
            <span className="text-cyan-400 font-mono">Layer {activeLayer}</span>
          </label>
          <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
            {[0, 1, 2].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setActiveLayer(lvl)}
                className={`py-1 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                  activeLayer === lvl ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                L{lvl} {lvl === 0 ? 'Raw' : lvl === 1 ? '1-Hop' : '2-Hop'}
              </button>
            ))}
          </div>
        </div>

        {/* Entity Filter */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-purple-400" />
            Filter Entity Type
          </label>
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="All">All Entities (10)</option>
            <option value="Drug">Drugs (3)</option>
            <option value="Enzyme">CYP Enzymes (2)</option>
            <option value="Target">Receptor Targets (2)</option>
            <option value="Pathway">KEGG Pathways (1)</option>
            <option value="SideEffect">Adverse Reactions (2)</option>
          </select>
        </div>

        {/* Attention Threshold Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-bold text-slate-400">
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Min Attention (&alpha; weight)
            </span>
            <span className="text-amber-400 font-mono">{(minAttentionThreshold * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="0.9"
            step="0.05"
            value={minAttentionThreshold}
            onChange={(e) => setMinAttentionThreshold(parseFloat(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer mt-1"
          />
        </div>
      </div>

      {/* TAB 1: SVG Interactive Node Network */}
      {activeTab === 'graph' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* SVG Canvas Area */}
          <div className="lg:col-span-2 bg-slate-950 rounded-2xl border border-slate-800 p-4 relative min-h-[420px] flex flex-col justify-between overflow-hidden">
            {/* Background Grid Accent */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:2rem_2rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>

            <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="font-mono text-white font-bold">Interactive GNN Subgraph Engine</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-mono">
                <span>Active Nodes: <strong className="text-cyan-300">{filteredNodes.length}</strong></span>
                <span>Active Edges: <strong className="text-amber-300">{filteredEdges.length}</strong></span>
              </div>
            </div>

            {/* SVG Visual Canvas */}
            <div 
              ref={svgContainerRef}
              className={`relative w-full h-[380px] my-2 overflow-hidden rounded-xl bg-slate-950/90 border border-slate-800/80 touch-none select-none ${
                isPanningCanvas ? 'cursor-grabbing' : 'cursor-grab'
              }`}
              onWheel={handleWheel}
              onPointerDown={handleCanvasPointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              {/* Zoom & Pan Overlay Toolbar */}
              <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur border border-slate-700/80 p-1.5 rounded-xl shadow-lg">
                <button
                  type="button"
                  onClick={handleZoomIn}
                  title="Zoom In"
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono font-bold text-cyan-300 px-1 min-w-[36px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={handleZoomOut}
                  title="Zoom Out"
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <div className="w-px h-4 bg-slate-700/80 my-auto mx-0.5"></div>
                <button
                  type="button"
                  onClick={handleResetView}
                  title="Recenter Canvas View"
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors flex items-center gap-1 cursor-pointer text-[10px] font-bold px-2"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Center</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetNodePositions}
                  title="Reset Node Locations to Default"
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors flex items-center gap-1 cursor-pointer text-[10px] font-bold px-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Nodes</span>
                </button>
              </div>

              {/* Pan/Drag Status Hint */}
              <div className="absolute top-3 left-3 z-30 pointer-events-none hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur border border-slate-800 text-[10px] font-mono text-slate-300">
                <Move className="w-3 h-3 text-cyan-400 animate-pulse" />
                <span>Drag canvas to scroll • Drag nodes to move • Scroll wheel to zoom</span>
              </div>

              <svg className="w-full h-full overflow-visible">
                <g 
                  transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
                  style={{ transformOrigin: 'center center' }}
                >
                  {/* Render Edges */}
                  {filteredEdges.map((edge) => {
                    const sourceNode = nodes.find((n) => n.id === edge.source);
                    const targetNode = nodes.find((n) => n.id === edge.target);

                    if (!sourceNode || !targetNode) return null;

                    const sourcePos = getNodePos(sourceNode);
                    const targetPos = getNodePos(targetNode);

                    const isConnectedToSelected =
                      edge.source === selectedNode.id || edge.target === selectedNode.id;
                    const isHovered =
                      edge.source === hoveredNodeId || edge.target === hoveredNodeId;

                    const strokeWidth = Math.max(1.5, edge.attentionWeight * 4.5);
                    const opacity = isConnectedToSelected ? 1.0 : isHovered ? 0.9 : 0.45;

                    const color = edge.attentionWeight > 0.9 ? '#f43f5e' : edge.attentionWeight > 0.75 ? '#f59e0b' : '#38bdf8';

                    return (
                      <g key={edge.id}>
                        <line
                          x1={`${sourcePos.x}%`}
                          y1={`${sourcePos.y}%`}
                          x2={`${targetPos.x}%`}
                          y2={`${targetPos.y}%`}
                          stroke={color}
                          strokeWidth={strokeWidth}
                          strokeOpacity={opacity}
                          strokeDasharray={selectedModel === 'GAT' ? 'none' : '4 4'}
                        />
                        {/* Edge Attention Label */}
                        <text
                          x={`${(sourcePos.x + targetPos.x) / 2}%`}
                          y={`${(sourcePos.y + targetPos.y) / 2}%`}
                          fill="#f1f5f9"
                          stroke="#0f172a"
                          strokeWidth="3"
                          strokeLinejoin="round"
                          style={{ paintOrder: 'stroke fill' }}
                          fontSize="10"
                          fontFamily="monospace"
                          fontWeight="bold"
                          textAnchor="middle"
                          className="pointer-events-none select-none"
                        >
                          &alpha;={edge.attentionWeight.toFixed(2)}
                        </text>
                      </g>
                    );
                  })}

                  {/* Render Nodes */}
                  {filteredNodes.map((node) => {
                    const isSelected = node.id === selectedNode.id;
                    const isHovered = node.id === hoveredNodeId;
                    const isBeingDragged = node.id === draggedNodeId;
                    const nodeColor = getNodeColor(node.type);
                    const pos = getNodePos(node);

                    return (
                      <g
                        key={node.id}
                        className="cursor-move transition-transform duration-75"
                        onPointerDown={(e) => handleNodePointerDown(e, node.id)}
                        onClick={() => setSelectedNodeId(node.id)}
                        onMouseEnter={() => setHoveredNodeId(node.id)}
                        onMouseLeave={() => setHoveredNodeId(null)}
                      >
                        {/* Halo Pulse for Selected or Dragged Node */}
                        {(isSelected || isBeingDragged) && (
                          <circle
                            cx={`${pos.x}%`}
                            cy={`${pos.y}%`}
                            r="28"
                            fill={nodeColor}
                            fillOpacity={isBeingDragged ? "0.4" : "0.25"}
                            className={isBeingDragged ? "animate-pulse" : "animate-ping"}
                          />
                        )}

                        {/* Main Node Circle */}
                        <circle
                          cx={`${pos.x}%`}
                          cy={`${pos.y}%`}
                          r={isSelected || isBeingDragged ? 18 : isHovered ? 16 : 14}
                          fill="#0f172a"
                          stroke={nodeColor}
                          strokeWidth={isSelected || isBeingDragged ? 3.5 : 2}
                          className="transition-all"
                        />

                        {/* Inner Core Indicator */}
                        <circle
                          cx={`${pos.x}%`}
                          cy={`${pos.y}%`}
                          r={isSelected || isBeingDragged ? 6 : 4}
                          fill={nodeColor}
                        />

                        {/* Label Text */}
                        <text
                          x={`${pos.x}%`}
                          y={`${pos.y + 7.5}%`}
                          fill="#ffffff"
                          stroke="#020617"
                          strokeWidth="4"
                          strokeLinejoin="round"
                          style={{ paintOrder: 'stroke fill' }}
                          fontSize="12"
                          fontWeight="800"
                          textAnchor="middle"
                          className="pointer-events-none select-none tracking-tight"
                        >
                          {node.label}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </svg>
            </div>

            {/* Legend Footer */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 text-[10px] border-t border-slate-800/80 pt-2 text-slate-400 font-mono">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span> Drug</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span> Enzyme</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span> Receptor Target</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Pathway</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Adverse Event</span>
              </div>
              <span>Click node to view GNN embedding & 1-hop attributions</span>
            </div>
          </div>

          {/* Right Column: Selected Node Intelligence Card */}
          <div className="space-y-4">
            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold border ${getNodeBg(selectedNode.type)}`}>
                  {selectedNode.type} Node
                </span>
                <span className="text-[10px] font-mono text-slate-400">{selectedNode.code}</span>
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-white">{selectedNode.label}</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{selectedNode.description}</p>
              </div>

              {/* Embedding & Risk Stats */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400">512-Dim Vector Norm</div>
                  <div className="text-cyan-400 font-mono font-bold text-sm mt-0.5">||h_i|| = 1.482</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Risk Contribution Score</div>
                  <div className={`font-mono font-bold text-sm mt-0.5 ${
                    selectedNode.riskContribution > 80 ? 'text-rose-400' : 'text-amber-400'
                  }`}>
                    {selectedNode.riskContribution}%
                  </div>
                </div>
              </div>

              {/* 1-Hop Connected Edges */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Direct Message-Passing Neighbors</span>
                  <span className="text-cyan-400 font-mono text-[10px]">
                    {edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id).length} Connected
                  </span>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {edges
                    .filter(e => e.source === selectedNode.id || e.target === selectedNode.id)
                    .map(e => {
                      const otherId = e.source === selectedNode.id ? e.target : e.source;
                      const otherNode = nodes.find(n => n.id === otherId);
                      if (!otherNode) return null;

                      return (
                        <div
                          key={e.id}
                          onClick={() => setSelectedNodeId(otherNode.id)}
                          className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs flex items-center justify-between cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full`} style={{ backgroundColor: getNodeColor(otherNode.type) }}></span>
                            <span className="font-bold text-white">{otherNode.label}</span>
                            <span className="text-[10px] text-slate-400">({e.relation})</span>
                          </div>
                          <span className="text-amber-400 font-mono font-bold text-[11px]">&alpha;={e.attentionWeight}</span>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: t-SNE / UMAP 2D Node Embedding Space */}
      {activeTab === 'tsne' && (
        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>2D t-SNE / UMAP Projection of 512-Dimensional GNN Node Embeddings</span>
              </h3>
              <p className="text-xs text-slate-400">
                Nodes with similar topological neighborhood signatures cluster closely together in latent embedding space.
              </p>
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" dataKey="tsneX" name="t-SNE Dimension 1" stroke="#64748b" fontSize={11} domain={[-100, 100]} />
                <YAxis type="number" dataKey="tsneY" name="t-SNE Dimension 2" stroke="#64748b" fontSize={11} domain={[-100, 100]} />
                <ZAxis type="number" dataKey="riskContribution" range={[100, 400]} name="Risk Contribution" />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as GNNNodeData;
                      return (
                        <div className="bg-slate-950 border border-slate-700 p-3 rounded-xl shadow-xl text-xs space-y-1">
                          <div className="font-extrabold text-white">{data.label}</div>
                          <div className="text-slate-400 font-mono">Type: {data.type}</div>
                          <div className="text-cyan-400 font-mono">
                            Coords: ({data.tsneX}, {data.tsneY})
                          </div>
                          <div className="text-amber-400 font-bold">
                            Risk Index: {data.riskContribution}%
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="GNN Node Cluster" data={nodes} fill="#8884d8">
                  {nodes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getNodeColor(entry.type)} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* TAB 3: Multi-Head Attention Distribution */}
      {activeTab === 'attention' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
              GAT Multi-Head Attention Radar for {selectedNode.label}
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="aspect" stroke="#cbd5e1" fontSize={11} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#64748b" fontSize={10} />
                  <Radar name="Attention Head Score" dataKey="score" stroke="#818cf8" fill="#6366f1" fillOpacity={0.5} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-3 text-xs text-slate-300">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
              Attention Head Mechanism Analysis
            </h3>
            <p className="leading-relaxed">
              The Graph Attention Network (GAT) computes self-attention coefficients (&alpha;<sub>ij</sub>) using 4 independent heads to model multi-factorial polypharmacy risks:
            </p>
            <ul className="space-y-2 list-disc list-inside text-slate-300 font-mono text-[11px]">
              <li><strong className="text-cyan-300">Head 1 (Structural):</strong> Captures RxNorm 2D/3D chemical ring alignment & MW similarity.</li>
              <li><strong className="text-purple-300">Head 2 (Enzymatic):</strong> Isolates CYP2C9 / CYP2D6 competitive active site inhibition.</li>
              <li><strong className="text-rose-300">Head 3 (Ion Channel):</strong> Measures voltage-gated hERG potassium channel stacking affinity.</li>
              <li><strong className="text-amber-300">Head 4 (Toxicity):</strong> Predicts severe ADR downstream clinical phenotypes (e.g. TdP).</li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB 4: Convergence & Layer-wise Statistics */}
      {activeTab === 'convergence' && (
        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">
            Layer-wise Feature Vector Convergence & Classification Accuracy
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={convergenceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="layer" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                <Bar dataKey="classificationAccuracy" name="GNN Accuracy (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="variance" name="Embedding Variance" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default GNNGraphVisualizer;
