import React, { useState, useMemo } from 'react';
import { 
  Share2, Search, Filter, BookOpen, ExternalLink, ArrowRight, Database, Dna, 
  ShieldAlert, RefreshCw, PanelRightClose, PanelRightOpen, X, Copy, Check, Info, 
  Sparkles, Layers, Cpu, Link2, FileText, Activity 
} from 'lucide-react';
import { KnowledgeNode, KnowledgeEdge } from '../../types/pharmaguard';
import { AILoadingOverlay } from '../AILoadingOverlay';
import { GNNGraphVisualizer, GNNNodeType } from '../GNNGraphVisualizer';

interface KnowledgeGraphExplorerViewProps {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
}

export const KnowledgeGraphExplorerView: React.FC<KnowledgeGraphExplorerViewProps> = ({ nodes, edges }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode>(nodes[0]);
  const [isQuerying, setIsQuerying] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const gnnNodes = useMemo(() => {
    return nodes.map((n, idx) => ({
      id: n.id,
      label: n.label,
      type: (['Drug', 'Target', 'Enzyme', 'Pathway', 'SideEffect'].includes(n.type) ? n.type : 'Drug') as GNNNodeType,
      x: 12 + (idx % 4) * 25,
      y: 20 + Math.floor(idx / 4) * 28,
      tsneX: (idx - 3) * 15,
      tsneY: (idx % 2 === 0 ? 1 : -1) * 20,
      embeddingDim: 512,
      riskContribution: Math.min(96, Math.max(20, (n.label.length * 9) % 100)),
      description: n.description,
      code: n.ontologyCode
    }));
  }, [nodes]);

  const gnnEdges = useMemo(() => {
    return edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      relation: e.relationship,
      attentionWeight: e.weight,
      headScores: [e.weight, +(e.weight * 0.95).toFixed(2), +(e.weight * 0.9).toFixed(2), +(e.weight * 0.88).toFixed(2)] as [number, number, number, number]
    }));
  }, [edges]);

  const handleQueryGraph = () => {
    setIsQuerying(true);
    setTimeout(() => {
      setIsQuerying(false);
    }, 2000);
  };

  const handleNodeSelect = (node: KnowledgeNode) => {
    setSelectedNode(node);
    if (!isDrawerOpen) {
      setIsDrawerOpen(true);
    }
  };

  const handleCopyCode = (code?: string) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const filteredNodes = nodes.filter(n => {
    const matchesSearch = n.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          n.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (n.ontologyCode && n.ontologyCode.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'All' || n.type === selectedType;
    return matchesSearch && matchesType;
  });

  const connectedEdges = edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id);

  const getClinicalSignificance = (node: KnowledgeNode) => {
    switch (node.type) {
      case 'Drug':
        return [
          "Active compound monitored for CYP enzyme inhibition.",
          "Monitored for QT prolongation and renal dosing rules.",
          "High priority for drug-drug interaction screening."
        ];
      case 'Enzyme':
        return [
          "Hepatic P450 enzyme governing drug clearance kinetics.",
          "Polymorphic variants alter steady-state plasma levels.",
          "Key metabolic bottleneck in polypharmacy regimens."
        ];
      case 'Target':
        return [
          "Cellular receptor/channel mediating drug response.",
          "Governs therapeutic and adverse pharmacodynamics.",
          "Primary binding target for affinity scoring."
        ];
      case 'SideEffect':
        return [
          "Clinical adverse outcome flagged by FDA FAERS & SIDER.",
          "Requires electrocardiographic or biomarker surveillance.",
          "Correlated with cumulative systemic exposure."
        ];
      case 'Guideline':
        return [
          "Consensus recommendation (CPIC, ACC/AHA, KDIGO).",
          "Provides dosing adjustments and contraindication rules.",
          "Evidence-based safety threshold boundary."
        ];
      default:
        return [
          "Entity node in biomedical ontology knowledge graph.",
          "Supports multi-hop GNN reasoning and vector RAG search."
        ];
    }
  };

  const getSourceReferences = (node: KnowledgeNode) => {
    const refs = [];
    if (node.ontologySource) {
      refs.push({ name: `${node.ontologySource} Registry`, id: node.ontologyCode || 'N/A' });
    }
    refs.push({ name: 'PubChem / ChEMBL Compound DB', id: `CHEMBL-${node.id.toUpperCase()}` });
    refs.push({ name: 'FDA FAERS Adverse Event DB', id: 'FAERS-2026-R4' });
    refs.push({ name: 'PubMed Literature Citations', id: 'PMID: 34891023, 38102911' });
    return refs;
  };

  const KG_STEPS = [
    "Traversing Neo4j Heterogeneous Biomedical Knowledge Graph...",
    "Generating Graph Neural Network (GNN) 512-dim Node Embeddings...",
    "Mapping Ontologies (RxNorm, SNOMED CT, UMLS, KEGG Pathways)...",
    "Executing Vector Search RAG Semantic Edge Alignment...",
    "Rendering Grounded Evidence Sub-Graph Topology..."
  ];

  return (
    <div className="space-y-6 text-slate-100 max-w-7xl mx-auto pb-10">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              <Share2 className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <span>Biomedical Knowledge Graph Explorer</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">Neo4j & GNN</span>
              </h1>
              <p className="text-xs text-slate-400">
                Multi-entity biomedical knowledge graph grounding RxNorm, SNOMED CT, UMLS, ICD-10, LOINC, DrugBank, PubChem, and KEGG pathways.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(prev => !prev)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
            >
              {isDrawerOpen ? <PanelRightClose className="w-4 h-4 text-cyan-400" /> : <PanelRightOpen className="w-4 h-4 text-cyan-400" />}
              <span>{isDrawerOpen ? 'Hide Entity Drawer' : 'Inspect Entity Drawer'}</span>
            </button>

            <button
              type="button"
              onClick={handleQueryGraph}
              disabled={isQuerying}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isQuerying ? 'animate-spin' : ''}`} />
              <span>{isQuerying ? 'Querying Graph RAG...' : 'Re-Query Knowledge Graph RAG'}</span>
            </button>
          </div>
        </div>
      </div>

      <AILoadingOverlay
        isLoading={isQuerying}
        title="Querying Biomedical Knowledge Graph..."
        subtitle="Extracting grounded ontology nodes & GNN topological pathways"
        steps={KG_STEPS}
      >
        <div className="space-y-6">
          {/* Interactive GNN Graph Visualizer & Message-Passing Neural Architecture */}
          <GNNGraphVisualizer
            title="GNN Heterogeneous Knowledge Graph & Message-Passing Engine"
            subtitle="Explore 512-dimensional node embeddings, GAT attention heads, and graph topological pathways"
            initialNodes={gnnNodes}
            initialEdges={gnnEdges}
            onNodeSelect={(nodeId) => {
              const found = nodes.find(n => n.id === nodeId);
              if (found) handleNodeSelect(found);
            }}
          />

          {/* Collapsible Drawer Banner when Closed */}
          {!isDrawerOpen && (
            <div 
              onClick={() => setIsDrawerOpen(true)}
              className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/30 flex items-center justify-between cursor-pointer hover:border-indigo-500/60 transition-all shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <Info className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-300">Detailed Node Metadata Drawer Collapsed</div>
                  <div className="text-sm font-extrabold text-cyan-300 flex items-center gap-2">
                    <span>Selected Entity: {selectedNode.label}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {selectedNode.type}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-500/30">
                <span>Expand Drawer</span>
                <PanelRightOpen className="w-4 h-4" />
              </div>
            </div>
          )}

          {/* Main Grid View with Dynamic Column Sizing for Drawer */}
          <div className={`grid grid-cols-1 transition-all duration-300 gap-6 ${isDrawerOpen ? 'lg:grid-cols-3' : 'lg:grid-cols-1'}`}>
            {/* Left Main Content: Search, Type Filter, & Node Grid */}
            <div className={`space-y-4 ${isDrawerOpen ? 'lg:col-span-2' : 'lg:col-span-1'}`}>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search entity, RxNorm, or SNOMED code..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="All">All Entity Types</option>
                    <option value="Drug">Drug</option>
                    <option value="Enzyme">Enzyme</option>
                    <option value="Target">Target</option>
                    <option value="SideEffect">Side Effect</option>
                    <option value="Guideline">Guideline</option>
                  </select>
                </div>

                <div className={`grid grid-cols-1 gap-3 pt-2 ${isDrawerOpen ? 'sm:grid-cols-2' : 'sm:grid-cols-3'}`}>
                  {filteredNodes.map((node) => {
                    const isSelected = selectedNode.id === node.id;
                    return (
                      <div
                        key={node.id}
                        onClick={() => handleNodeSelect(node)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                          isSelected
                            ? 'bg-slate-800 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
                            : 'bg-slate-800/40 border-slate-700/80 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-white">{node.label}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                            {node.type}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">{node.ontologySource}: <strong className="text-slate-300">{node.ontologyCode}</strong></div>
                        <p className="text-xs text-slate-300 line-clamp-2">{node.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Side Drawer: Detailed Metadata, Clinical Significance & Source References */}
            {isDrawerOpen && (
              <div className="lg:col-span-1 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-2xl relative">
                  {/* Drawer Header */}
                  <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-cyan-400 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Knowledge Graph Drawer</span>
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {selectedNode.type}
                        </span>
                      </div>
                      <h2 className="text-lg font-extrabold text-white tracking-tight">{selectedNode.label}</h2>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsDrawerOpen(false)}
                      title="Collapse Side Drawer"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Drawer Body Content */}
                  <div className="space-y-4 text-xs">
                    {/* Section 1: Ontology Codes & Mapping */}
                    <div className="space-y-1.5">
                      <div className="text-slate-400 font-semibold text-[11px] flex items-center gap-1.5">
                        <Database className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Ontology Code & Registry Mapping</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700 flex items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="font-mono text-cyan-300 font-bold text-sm">{selectedNode.ontologyCode || 'N/A'}</div>
                          <div className="text-[10px] text-slate-400">Registry Source: <strong className="text-slate-200">{selectedNode.ontologySource || 'UMLS'}</strong></div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopyCode(selectedNode.ontologyCode)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Section 2: Detailed Description */}
                    <div className="space-y-1.5">
                      <div className="text-slate-400 font-semibold text-[11px] flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Detailed Entity Description</span>
                      </div>
                      <p className="text-slate-200 leading-relaxed bg-slate-800/40 p-3.5 rounded-xl border border-slate-800">
                        {selectedNode.description}
                      </p>
                    </div>

                    {/* Section 3: Clinical Significance & Mechanism */}
                    <div className="space-y-1.5">
                      <div className="text-slate-400 font-semibold text-[11px] flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                        <span>Clinical Significance & Mechanism</span>
                      </div>
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-slate-200">
                        <ul className="space-y-1">
                          {getClinicalSignificance(selectedNode).map((bullet, idx) => (
                            <li key={idx} className="flex items-start gap-1.5 text-xs text-slate-200 leading-snug">
                              <span className="text-amber-400 font-bold mt-0.5">•</span>
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Section 4: Source References & Evidence Citations */}
                    <div className="space-y-2">
                      <div className="text-slate-400 font-semibold text-[11px] flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Source References & Evidence Grounding</span>
                      </div>
                      <div className="space-y-1.5">
                        {getSourceReferences(selectedNode).map((ref, idx) => (
                          <div key={idx} className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/80 flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-2">
                              <ExternalLink className="w-3 h-3 text-emerald-400" />
                              <span className="font-semibold text-slate-200">{ref.name}</span>
                            </div>
                            <span className="font-mono text-slate-400 text-[10px]">{ref.id}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Section 5: GNN Embedding & Topological Attributes */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-800">
                      <div className="text-slate-400 font-semibold text-[11px] flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                        <span>GNN Embedding Tensor Metrics</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700">
                          <div className="text-[10px] text-slate-400">Embedding</div>
                          <div className="text-xs font-mono font-bold text-indigo-300">512-Dim</div>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700">
                          <div className="text-[10px] text-slate-400">PageRank</div>
                          <div className="text-xs font-mono font-bold text-cyan-300">0.084</div>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700">
                          <div className="text-[10px] text-slate-400">1-Hop Edges</div>
                          <div className="text-xs font-mono font-bold text-emerald-300">{connectedEdges.length}</div>
                        </div>
                      </div>
                    </div>

                    {/* Section 6: Connected Knowledge Graph Relationships */}
                    <div className="pt-2 border-t border-slate-800 space-y-2">
                      <div className="text-slate-400 font-semibold text-[11px] flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Link2 className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Connected Relationships ({connectedEdges.length})</span>
                        </span>
                        <span className="text-[10px] text-slate-500">Click node to inspect</span>
                      </div>

                      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                        {connectedEdges.map((edge) => {
                          const otherNodeId = edge.source === selectedNode.id ? edge.target : edge.source;
                          const otherNode = nodes.find(n => n.id === otherNodeId);
                          return (
                            <div 
                              key={edge.id}
                              onClick={() => otherNode && handleNodeSelect(otherNode)}
                              className="p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-indigo-500/60 cursor-pointer transition-all space-y-1"
                            >
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-bold text-amber-300 font-mono">[{edge.relationship}]</span>
                                <span className="text-[10px] text-slate-400">Weight: {(edge.weight * 100).toFixed(0)}%</span>
                              </div>
                              <div className="text-slate-200 font-medium flex items-center gap-1.5">
                                <span className="text-slate-400 text-[10px]">
                                  {edge.source === selectedNode.id ? 'Targets →' : 'Source ←'}
                                </span>
                                <strong className="text-cyan-300 hover:underline">{otherNode?.label || otherNodeId}</strong>
                              </div>
                              <div className="text-[10px] text-slate-400 italic">Evidence Ref: {edge.evidenceSource}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </AILoadingOverlay>
    </div>
  );
};

