import React, { useState } from 'react';
import { Share2, Search, Filter, BookOpen, ExternalLink, ArrowRight, Database, Dna, ShieldAlert, RefreshCw } from 'lucide-react';
import { KnowledgeNode, KnowledgeEdge } from '../../types/pharmaguard';
import { AILoadingOverlay } from '../AILoadingOverlay';
import { GNNGraphVisualizer } from '../GNNGraphVisualizer';

interface KnowledgeGraphExplorerViewProps {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
}

export const KnowledgeGraphExplorerView: React.FC<KnowledgeGraphExplorerViewProps> = ({ nodes, edges }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode>(nodes[0]);
  const [isQuerying, setIsQuerying] = useState(false);

  const handleQueryGraph = () => {
    setIsQuerying(true);
    setTimeout(() => {
      setIsQuerying(false);
    }, 2000);
  };

  const filteredNodes = nodes.filter(n => {
    const matchesSearch = n.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          n.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (n.ontologyCode && n.ontologyCode.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'All' || n.type === selectedType;
    return matchesSearch && matchesType;
  });

  const connectedEdges = edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id);

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
              <h1 className="text-xl font-bold text-white">Biomedical Knowledge Graph Explorer (Neo4j & GNN Embeddings)</h1>
              <p className="text-xs text-slate-400">
                Multi-entity biomedical knowledge graph grounding RxNorm, SNOMED CT, UMLS, ICD-10, LOINC, DrugBank, PubChem, and KEGG pathways.
              </p>
            </div>
          </div>

          <button
            onClick={handleQueryGraph}
            disabled={isQuerying}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isQuerying ? 'animate-spin' : ''}`} />
            <span>{isQuerying ? 'Querying Graph RAG...' : 'Re-Query Knowledge Graph RAG'}</span>
          </button>
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
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Search, Type Filter, & Node List */}
        <div className="lg:col-span-2 space-y-4">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {filteredNodes.map((node) => {
                const isSelected = selectedNode.id === node.id;
                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                      isSelected
                        ? 'bg-slate-800 border-indigo-500 shadow-md'
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

        {/* Right Col: Node Inspector & Connected Relationships */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
              <span>Entity Inspector</span>
              <span className="text-xs text-indigo-300 font-bold">{selectedNode.type}</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <div className="text-slate-400 font-semibold text-[11px]">Primary Entity Label</div>
                <div className="text-base font-extrabold text-cyan-300">{selectedNode.label}</div>
              </div>

              <div>
                <div className="text-slate-400 font-semibold text-[11px]">Ontology Mapping</div>
                <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                  <span className="text-slate-300 font-mono">{selectedNode.ontologyCode}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                    {selectedNode.ontologySource}
                  </span>
                </div>
              </div>

              <div>
                <div className="text-slate-400 font-semibold text-[11px]">Medical Description</div>
                <p className="text-slate-300 leading-relaxed bg-slate-800/40 p-3 rounded-lg border border-slate-800">
                  {selectedNode.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <div className="text-slate-400 font-semibold text-[11px] mb-2">Connected Knowledge Graph Edges ({connectedEdges.length})</div>
                <div className="space-y-2">
                  {connectedEdges.map((edge) => {
                    const otherNodeId = edge.source === selectedNode.id ? edge.target : edge.source;
                    const otherNode = nodes.find(n => n.id === otherNodeId);
                    return (
                      <div key={edge.id} className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-amber-300">[{edge.relationship}]</span>
                          <span className="text-slate-400">Weight: {(edge.weight * 100).toFixed(0)}%</span>
                        </div>
                        <div className="text-slate-200 font-medium">
                          {edge.source === selectedNode.id ? 'Target → ' : 'Source ← '}
                          <strong className="text-cyan-300">{otherNode?.label || otherNodeId}</strong>
                        </div>
                        <div className="text-[10px] text-slate-400 italic">Ref: {edge.evidenceSource}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
      </AILoadingOverlay>
    </div>
  );
};
