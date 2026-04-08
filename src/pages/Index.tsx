import { useState, useCallback, useEffect } from 'react';
import { GraphExplorer } from '@/components/graph/GraphExplorer';
import { GraphCanvas } from '@/components/graph/GraphCanvas';
import { InspectorPanel } from '@/components/graph/InspectorPanel';
import { GraphDocument, GraphNode, GraphEdge } from '@/types/graph';
import {
  loadGraphs, saveGraph, deleteGraph as deleteGraphFromStore,
  createNewGraph,
} from '@/store/graph-store';
import { toast } from 'sonner';

const Index = () => {
  const [graphs, setGraphs] = useState<GraphDocument[]>(() => loadGraphs());
  const [activeGraphId, setActiveGraphId] = useState<string | null>('graph-acme');
  const [workingGraph, setWorkingGraph] = useState<GraphDocument | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState<string>('');
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<GraphEdge | null>(null);

  // Load working graph when active changes
  useEffect(() => {
    if (activeGraphId) {
      const g = graphs.find(g => g.id === activeGraphId);
      if (g) {
        setWorkingGraph({ ...g });
        setSavedSnapshot(JSON.stringify(g));
        setSelectedNode(null);
        setSelectedEdge(null);
      }
    } else {
      setWorkingGraph(null);
      setSavedSnapshot('');
    }
  }, [activeGraphId, graphs]);

  const hasUnsavedChanges = workingGraph ? JSON.stringify(workingGraph) !== savedSnapshot : false;

  const handleSelectGraph = useCallback((id: string) => setActiveGraphId(id), []);

  const handleCreateGraph = useCallback(() => {
    const g = createNewGraph('Untitled Graph');
    setGraphs(prev => {
      const next = [...prev, g];
      localStorage.setItem('orggraph_graphs', JSON.stringify(next));
      return next;
    });
    setActiveGraphId(g.id);
    toast.success('Graph created');
  }, []);

  const handleDeleteGraph = useCallback((id: string) => {
    setGraphs(prev => {
      const next = deleteGraphFromStore(id, prev);
      return next;
    });
    if (activeGraphId === id) {
      setActiveGraphId(null);
    }
    toast.success('Graph deleted');
  }, [activeGraphId]);

  const handleSave = useCallback(() => {
    if (!workingGraph) return;
    const next = saveGraph(workingGraph, graphs);
    setGraphs(next);
    setSavedSnapshot(JSON.stringify(workingGraph));
    toast.success('Graph saved');
  }, [workingGraph, graphs]);

  const handleTitleChange = useCallback((title: string) => {
    setWorkingGraph(prev => prev ? { ...prev, title } : null);
  }, []);

  const handleGraphChange = useCallback((nodes: GraphNode[], edges: GraphEdge[]) => {
    setWorkingGraph(prev => prev ? { ...prev, nodes, edges } : null);
  }, []);

  const handleNodeSelect = useCallback((node: GraphNode | null) => setSelectedNode(node), []);
  const handleEdgeSelect = useCallback((edge: GraphEdge | null) => setSelectedEdge(edge), []);

  const handleUpdateNode = useCallback((updated: GraphNode) => {
    setSelectedNode(updated);
    setWorkingGraph(prev => {
      if (!prev) return null;
      return {
        ...prev,
        nodes: prev.nodes.map(n => n.id === updated.id ? updated : n),
      };
    });
  }, []);

  const handleDeleteNode = useCallback((id: string) => {
    setSelectedNode(null);
    setWorkingGraph(prev => {
      if (!prev) return null;
      return {
        ...prev,
        nodes: prev.nodes.filter(n => n.id !== id),
        edges: prev.edges.filter(e => e.source !== id && e.target !== id),
      };
    });
  }, []);

  const handleUpdateEdge = useCallback((updated: GraphEdge) => {
    setSelectedEdge(updated);
    setWorkingGraph(prev => {
      if (!prev) return null;
      return {
        ...prev,
        edges: prev.edges.map(e => e.id === updated.id ? updated : e),
      };
    });
  }, []);

  const handleDeleteEdge = useCallback((id: string) => {
    setSelectedEdge(null);
    setWorkingGraph(prev => {
      if (!prev) return null;
      return { ...prev, edges: prev.edges.filter(e => e.id !== id) };
    });
  }, []);

  return (
    <div className="h-screen w-full flex bg-muted/30">
      <GraphExplorer
        graphs={graphs}
        activeGraphId={activeGraphId}
        onSelectGraph={handleSelectGraph}
        onCreateGraph={handleCreateGraph}
        onDeleteGraph={handleDeleteGraph}
      />
      <GraphCanvas
        graph={workingGraph}
        hasUnsavedChanges={hasUnsavedChanges}
        onGraphChange={handleGraphChange}
        onSave={handleSave}
        onTitleChange={handleTitleChange}
        onNodeSelect={handleNodeSelect}
        onEdgeSelect={handleEdgeSelect}
        selectedNodeId={selectedNode?.id || null}
        selectedEdgeId={selectedEdge?.id || null}
      />
      <InspectorPanel
        selectedNode={selectedNode}
        selectedEdge={selectedEdge}
        nodes={workingGraph?.nodes || []}
        onUpdateNode={handleUpdateNode}
        onDeleteNode={handleDeleteNode}
        onUpdateEdge={handleUpdateEdge}
        onDeleteEdge={handleDeleteEdge}
      />
    </div>
  );
};

export default Index;
