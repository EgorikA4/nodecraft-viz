import { useState, useCallback, useEffect, useRef } from 'react';
import { GraphExplorer } from '@/components/graph/GraphExplorer';
import { GraphCanvas } from '@/components/graph/GraphCanvas';
import { InspectorPanel } from '@/components/graph/InspectorPanel';
import { ConfirmDialog } from '@/components/graph/ConfirmDialog';
import { GraphDocument, GraphNode, GraphEdge } from '@/types/graph';
import {
  loadGraphs, saveGraph, saveGraphs, deleteGraph as deleteGraphFromStore,
  createNewGraph, createNode,
} from '@/store/graph-store';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { PanelLeft, PanelRight } from 'lucide-react';

const Index = () => {
  const isMobile = useIsMobile();
  const [graphs, setGraphs] = useState<GraphDocument[]>(() => loadGraphs());
  const [activeGraphId, setActiveGraphId] = useState<string | null>('graph-acme');
  const [workingGraph, setWorkingGraph] = useState<GraphDocument | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState<string>('');
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<GraphEdge | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Mobile drawer states
  const [explorerOpen, setExplorerOpen] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);

  // Undo/redo
  const [history, setHistory] = useState<string[]>([]);
  const [future, setFuture] = useState<string[]>([]);
  const skipHistoryRef = useRef(false);

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'graph' | 'node' | 'edge'; id: string; label: string } | null>(null);

  // Autosave
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Load working graph when active changes
  useEffect(() => {
    if (activeGraphId) {
      const g = graphs.find(g => g.id === activeGraphId);
      if (g) {
        setWorkingGraph({ ...g });
        setSavedSnapshot(JSON.stringify(g));
        setSelectedNode(null);
        setSelectedEdge(null);
        setHistory([]);
        setFuture([]);
      }
    } else {
      setWorkingGraph(null);
      setSavedSnapshot('');
    }
  }, [activeGraphId, graphs]);

  const hasUnsavedChanges = workingGraph ? JSON.stringify(workingGraph) !== savedSnapshot : false;

  // Autosave - 30s after last change
  useEffect(() => {
    if (!hasUnsavedChanges || !workingGraph) return;
    autosaveTimerRef.current = setTimeout(() => {
      handleSaveInternal();
    }, 30000);
    return () => clearTimeout(autosaveTimerRef.current);
  }, [hasUnsavedChanges, workingGraph]);

  const pushHistory = useCallback((snapshot: string) => {
    setHistory(prev => [...prev.slice(-49), snapshot]);
    setFuture([]);
  }, []);

  const handleSelectGraph = useCallback((id: string) => {
    setActiveGraphId(id);
    setExplorerOpen(false);
  }, []);

  const handleCreateGraph = useCallback(() => {
    const g = createNewGraph('Untitled Graph');
    setGraphs(prev => {
      const next = [...prev, g];
      saveGraphs(next);
      return next;
    });
    setActiveGraphId(g.id);
    setExplorerOpen(false);
    toast.success('Graph created');
  }, []);

  const handleDeleteGraph = useCallback((id: string) => {
    const g = graphs.find(g => g.id === id);
    setDeleteConfirm({ type: 'graph', id, label: g?.title || 'this graph' });
  }, [graphs]);

  const confirmDelete = useCallback(() => {
    if (!deleteConfirm) return;
    const { type, id } = deleteConfirm;
    if (type === 'graph') {
      setGraphs(prev => deleteGraphFromStore(id, prev));
      if (activeGraphId === id) setActiveGraphId(null);
      toast.success('Graph deleted');
    } else if (type === 'node') {
      setSelectedNode(null);
      setWorkingGraph(prev => {
        if (!prev) return null;
        pushHistory(JSON.stringify(prev));
        return {
          ...prev,
          nodes: prev.nodes.filter(n => n.id !== id),
          edges: prev.edges.filter(e => e.source !== id && e.target !== id),
        };
      });
      toast.success('Node deleted');
    } else if (type === 'edge') {
      setSelectedEdge(null);
      setWorkingGraph(prev => {
        if (!prev) return null;
        pushHistory(JSON.stringify(prev));
        return { ...prev, edges: prev.edges.filter(e => e.id !== id) };
      });
      toast.success('Edge deleted');
    }
    setDeleteConfirm(null);
  }, [deleteConfirm, activeGraphId, pushHistory]);

  const handleSaveInternal = useCallback(() => {
    if (!workingGraph) return;
    setSaveStatus('saving');
    const next = saveGraph(workingGraph, graphs);
    setGraphs(next);
    setSavedSnapshot(JSON.stringify(workingGraph));
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 300);
  }, [workingGraph, graphs]);

  const handleSave = useCallback(() => {
    handleSaveInternal();
    toast.success('Graph saved');
  }, [handleSaveInternal]);

  const handleTitleChange = useCallback((title: string) => {
    setWorkingGraph(prev => {
      if (!prev) return null;
      pushHistory(JSON.stringify(prev));
      return { ...prev, title };
    });
  }, [pushHistory]);

  const handleGraphChange = useCallback((nodes: GraphNode[], edges: GraphEdge[]) => {
    setWorkingGraph(prev => {
      if (!prev) return null;
      if (!skipHistoryRef.current) pushHistory(JSON.stringify(prev));
      skipHistoryRef.current = false;
      return { ...prev, nodes, edges };
    });
  }, [pushHistory]);

  const handleNodeSelect = useCallback((node: GraphNode | null) => {
    setSelectedNode(node);
    if (node && isMobile) setInspectorOpen(true);
  }, [isMobile]);

  const handleEdgeSelect = useCallback((edge: GraphEdge | null) => {
    setSelectedEdge(edge);
    if (edge && isMobile) setInspectorOpen(true);
  }, [isMobile]);

  const handleUpdateNode = useCallback((updated: GraphNode) => {
    setSelectedNode(updated);
    setWorkingGraph(prev => {
      if (!prev) return null;
      pushHistory(JSON.stringify(prev));
      return { ...prev, nodes: prev.nodes.map(n => n.id === updated.id ? updated : n) };
    });
  }, [pushHistory]);

  const handleDeleteNode = useCallback((id: string) => {
    const node = workingGraph?.nodes.find(n => n.id === id);
    setDeleteConfirm({ type: 'node', id, label: node?.label || 'this node' });
  }, [workingGraph]);

  const handleUpdateEdge = useCallback((updated: GraphEdge) => {
    setSelectedEdge(updated);
    setWorkingGraph(prev => {
      if (!prev) return null;
      pushHistory(JSON.stringify(prev));
      return { ...prev, edges: prev.edges.map(e => e.id === updated.id ? updated : e) };
    });
  }, [pushHistory]);

  const handleDeleteEdge = useCallback((id: string) => {
    setDeleteConfirm({ type: 'edge', id, label: 'this edge' });
  }, []);

  const handleDuplicateNode = useCallback((node: GraphNode) => {
    if (!workingGraph) return;
    const newNode = {
      ...node,
      id: `node-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      label: `${node.label} (copy)`,
      position: { x: node.position.x + 50, y: node.position.y + 50 },
    };
    pushHistory(JSON.stringify(workingGraph));
    setWorkingGraph(prev => prev ? { ...prev, nodes: [...prev.nodes, newNode] } : null);
    setSelectedNode(newNode);
    toast.success('Node duplicated');
  }, [workingGraph, pushHistory]);

  const handleDuplicateGraph = useCallback(() => {
    if (!workingGraph) return;
    const dup: GraphDocument = {
      ...workingGraph,
      id: `graph-${Date.now()}`,
      title: `${workingGraph.title} (copy)`,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setGraphs(prev => {
      const next = [...prev, dup];
      saveGraphs(next);
      return next;
    });
    setActiveGraphId(dup.id);
    toast.success('Graph duplicated');
  }, [workingGraph]);

  const handleUndo = useCallback(() => {
    if (history.length === 0 || !workingGraph) return;
    const prev = history[history.length - 1];
    setFuture(f => [JSON.stringify(workingGraph), ...f]);
    setHistory(h => h.slice(0, -1));
    const restored = JSON.parse(prev) as GraphDocument;
    skipHistoryRef.current = true;
    setWorkingGraph(restored);
    setSelectedNode(null);
    setSelectedEdge(null);
  }, [history, workingGraph]);

  const handleRedo = useCallback(() => {
    if (future.length === 0 || !workingGraph) return;
    const next = future[0];
    setHistory(h => [...h, JSON.stringify(workingGraph)]);
    setFuture(f => f.slice(1));
    const restored = JSON.parse(next) as GraphDocument;
    skipHistoryRef.current = true;
    setWorkingGraph(restored);
    setSelectedNode(null);
    setSelectedEdge(null);
  }, [future, workingGraph]);

  const handleExport = useCallback(() => {
    if (!workingGraph) return;
    const blob = new Blob([JSON.stringify(workingGraph, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workingGraph.title.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Graph exported');
  }, [workingGraph]);

  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result as string) as GraphDocument;
          if (!data.nodes || !data.edges || !data.title) throw new Error('Invalid');
          const imported: GraphDocument = {
            ...data,
            id: `graph-${Date.now()}`,
            updatedAt: new Date().toISOString(),
          };
          setGraphs(prev => {
            const next = [...prev, imported];
            saveGraphs(next);
            return next;
          });
          setActiveGraphId(imported.id);
          toast.success(`Imported "${imported.title}"`);
        } catch {
          toast.error('Invalid graph file');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, []);

  const explorerContent = (
    <GraphExplorer
      graphs={graphs}
      activeGraphId={activeGraphId}
      onSelectGraph={handleSelectGraph}
      onCreateGraph={handleCreateGraph}
      onDeleteGraph={handleDeleteGraph}
      mobile={isMobile}
    />
  );

  const inspectorContent = (
    <InspectorPanel
      selectedNode={selectedNode}
      selectedEdge={selectedEdge}
      nodes={workingGraph?.nodes || []}
      onUpdateNode={handleUpdateNode}
      onDeleteNode={handleDeleteNode}
      onUpdateEdge={handleUpdateEdge}
      onDeleteEdge={handleDeleteEdge}
      onDuplicateNode={handleDuplicateNode}
      mobile={isMobile}
    />
  );

  return (
    <div className="h-screen w-full flex bg-muted/30">
      {/* Desktop: inline sidebars */}
      {!isMobile && explorerContent}

      {/* Mobile: floating toggle buttons */}
      {isMobile && (
        <div className="fixed top-2 left-2 z-50 flex gap-1.5">
          <Button
            variant="secondary"
            size="icon"
            className="h-9 w-9 rounded-lg shadow-md bg-card border border-border"
            onClick={() => setExplorerOpen(true)}
          >
            <PanelLeft size={16} />
          </Button>
          {(selectedNode || selectedEdge) && (
            <Button
              variant="secondary"
              size="icon"
              className="h-9 w-9 rounded-lg shadow-md bg-card border border-border"
              onClick={() => setInspectorOpen(true)}
            >
              <PanelRight size={16} />
            </Button>
          )}
        </div>
      )}

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
        onDuplicateNode={handleDuplicateNode}
        onDeleteNode={handleDeleteNode}
        canUndo={history.length > 0}
        canRedo={future.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onExport={handleExport}
        onImport={handleImport}
        onDuplicateGraph={handleDuplicateGraph}
        saveStatus={saveStatus}
        mobile={isMobile}
      />

      {/* Desktop: inline inspector */}
      {!isMobile && inspectorContent}

      {/* Mobile: Explorer as left sheet */}
      {isMobile && (
        <Sheet open={explorerOpen} onOpenChange={setExplorerOpen}>
          <SheetContent side="left" className="w-[300px] p-0">
            {explorerContent}
          </SheetContent>
        </Sheet>
      )}

      {/* Mobile: Inspector as bottom sheet */}
      {isMobile && (
        <Sheet open={inspectorOpen} onOpenChange={setInspectorOpen}>
          <SheetContent side="bottom" className="h-[70vh] p-0 rounded-t-2xl">
            {inspectorContent}
          </SheetContent>
        </Sheet>
      )}

      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        title={`Delete ${deleteConfirm?.type || ''}?`}
        description={`Are you sure you want to delete "${deleteConfirm?.label}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
        destructive
      />
    </div>
  );
};

export default Index;
