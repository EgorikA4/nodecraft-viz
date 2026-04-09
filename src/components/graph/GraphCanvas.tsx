import { useCallback, useRef, useState, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  BackgroundVariant,
  type Node,
  type Edge,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Save, Plus, GitBranch, LayoutDashboard, ChevronDown, Search,
  Download, Upload, Copy, Undo2, Redo2, BarChart3, Keyboard, Filter,
  CheckCircle2, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { nodeTypes } from './OrgNode';
import { edgeTypes } from './LabeledEdge';
import { GraphDocument, GraphNode, GraphEdge, NODE_TYPES, NodeType, NODE_TYPE_CONFIG } from '@/types/graph';
import { createNode, createEdge } from '@/store/graph-store';
import { NodeSearchDialog } from './NodeSearchDialog';
import { KeyboardShortcutsDialog } from './KeyboardShortcutsDialog';
import { GraphStatsPanel } from './GraphStatsPanel';
import { FilterBar } from './FilterBar';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

interface GraphCanvasProps {
  graph: GraphDocument | null;
  hasUnsavedChanges: boolean;
  onGraphChange: (nodes: GraphNode[], edges: GraphEdge[]) => void;
  onSave: () => void;
  onTitleChange: (title: string) => void;
  onNodeSelect: (node: GraphNode | null) => void;
  onEdgeSelect: (edge: GraphEdge | null) => void;
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  onDuplicateNode: (node: GraphNode) => void;
  onDeleteNode: (id: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onExport: () => void;
  onImport: () => void;
  onDuplicateGraph: () => void;
  saveStatus: 'idle' | 'saving' | 'saved';
  mobile?: boolean;
}

function graphNodesToFlow(nodes: GraphNode[], hiddenTypes: Set<NodeType>): Node[] {
  return nodes
    .filter(n => !hiddenTypes.has(n.type))
    .map(n => ({
      id: n.id,
      type: 'orgNode',
      position: n.position,
      data: { label: n.label, description: n.description, nodeType: n.type },
      selected: false,
    }));
}

function graphEdgesToFlow(edges: GraphEdge[], hiddenNodeIds: Set<string>): Edge[] {
  return edges
    .filter(e => !hiddenNodeIds.has(e.source) && !hiddenNodeIds.has(e.target))
    .map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
      type: 'labeled',
      data: { relationType: e.relationType },
    }));
}

function InnerCanvas({
  graph, hasUnsavedChanges, onGraphChange, onSave, onTitleChange,
  onNodeSelect, onEdgeSelect,
  canUndo, canRedo, onUndo, onRedo,
  onExport, onImport, onDuplicateGraph, saveStatus, mobile,
}: GraphCanvasProps) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [hiddenTypes, setHiddenTypes] = useState<Set<NodeType>>(new Set());
  const graphRef = useRef(graph?.id);
  const reactFlowInstance = useReactFlow();

  const hiddenNodeIds = useMemo(() => {
    if (!graph) return new Set<string>();
    return new Set(graph.nodes.filter(n => hiddenTypes.has(n.type)).map(n => n.id));
  }, [graph, hiddenTypes]);

  const [nodes, setNodes, onNodesChange] = useNodesState(graph ? graphNodesToFlow(graph.nodes, hiddenTypes) : []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(graph ? graphEdgesToFlow(graph.edges, hiddenNodeIds) : []);

  if (graph && graph.id !== graphRef.current) {
    graphRef.current = graph.id;
    setHiddenTypes(new Set());
    setNodes(graphNodesToFlow(graph.nodes, new Set()));
    setEdges(graphEdgesToFlow(graph.edges, new Set()));
  }

  useEffect(() => {
    if (!graph) return;
    setNodes(graphNodesToFlow(graph.nodes, hiddenTypes));
    setEdges(graphEdgesToFlow(graph.edges, hiddenNodeIds));
  }, [hiddenTypes, hiddenNodeIds]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key === 's') { e.preventDefault(); onSave(); }
      if (meta && !e.shiftKey && e.key === 'z') { e.preventDefault(); onUndo(); }
      if (meta && !e.shiftKey && e.key === 'y') { e.preventDefault(); onRedo(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onSave, onUndo, onRedo]);

  const onConnect = useCallback((connection: Connection) => {
    const newEdge = createEdge(connection.source!, connection.target!, 'CUSTOM');
    setEdges(eds => addEdge({
      ...connection, id: newEdge.id, type: 'labeled', data: { relationType: 'CUSTOM' },
    }, eds));
    if (graph) {
      onGraphChange(graph.nodes, [...graph.edges, newEdge]);
    }
  }, [graph, onGraphChange, setEdges]);

  const handleAddNode = useCallback((type: NodeType) => {
    if (!graph) return;
    const viewport = reactFlowInstance.getViewport();
    const pos = { x: (-viewport.x + 400) / viewport.zoom, y: (-viewport.y + 300) / viewport.zoom };
    const newNode = createNode(type, pos);
    const updatedNodes = [...graph.nodes, newNode];
    setNodes(prev => [...prev, {
      id: newNode.id, type: 'orgNode', position: pos,
      data: { label: newNode.label, description: newNode.description, nodeType: newNode.type },
    }]);
    onGraphChange(updatedNodes, graph.edges);
  }, [graph, onGraphChange, setNodes, reactFlowInstance]);

  const onNodeClick = useCallback((_: any, node: Node) => {
    if (!graph) return;
    const gNode = graph.nodes.find(n => n.id === node.id);
    onNodeSelect(gNode || null);
    onEdgeSelect(null);
  }, [graph, onNodeSelect, onEdgeSelect]);

  const onEdgeClick = useCallback((_: any, edge: Edge) => {
    if (!graph) return;
    const gEdge = graph.edges.find(e => e.id === edge.id);
    onEdgeSelect(gEdge || null);
    onNodeSelect(null);
  }, [graph, onEdgeSelect, onNodeSelect]);

  const onPaneClick = useCallback(() => {
    onNodeSelect(null);
    onEdgeSelect(null);
  }, [onNodeSelect, onEdgeSelect]);

  const onNodeDragStop = useCallback((_: any, node: Node) => {
    if (!graph) return;
    const updatedNodes = graph.nodes.map(n =>
      n.id === node.id ? { ...n, position: node.position } : n
    );
    onGraphChange(updatedNodes, graph.edges);
  }, [graph, onGraphChange]);

  const handleToggleType = useCallback((type: NodeType) => {
    setHiddenTypes(prev => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }, []);

  const handleSearchSelect = useCallback((node: GraphNode) => {
    onNodeSelect(node);
    onEdgeSelect(null);
    reactFlowInstance.setCenter(node.position.x, node.position.y, { zoom: 1.2, duration: 400 });
  }, [reactFlowInstance, onNodeSelect, onEdgeSelect]);

  const handleFitView = useCallback(() => {
    reactFlowInstance.fitView({ duration: 400, padding: 0.2 });
  }, [reactFlowInstance]);

  if (!graph) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-muted/30 px-6">
        <LayoutDashboard size={56} className="text-muted-foreground/20 mb-4" />
        <h2 className="text-xl font-semibold text-muted-foreground/60 mb-1">Граф не выбран</h2>
        <p className="text-sm text-muted-foreground/40 mb-4">Выберите или создайте граф для начала редактирования</p>
      </div>
    );
  }

  // Desktop toolbar
  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="h-12 border-b border-border bg-card flex items-center px-3 gap-1 shrink-0 overflow-x-auto">
        <div className="flex items-center gap-2 mr-2 min-w-0">
          {editingTitle ? (
            <Input autoFocus defaultValue={graph.title}
              className="h-7 text-sm font-semibold w-48"
              onBlur={e => { onTitleChange(e.target.value); setEditingTitle(false); }}
              onKeyDown={e => { if (e.key === 'Enter') { onTitleChange((e.target as HTMLInputElement).value); setEditingTitle(false); } }}
            />
          ) : (
            <button onClick={() => setEditingTitle(true)} className="text-sm font-semibold text-foreground hover:text-primary transition truncate max-w-[180px]">
              {graph.title}
            </button>
          )}
          {hasUnsavedChanges && <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" title="Unsaved changes" />}
          {saveStatus === 'saving' && <Loader2 size={12} className="animate-spin text-muted-foreground" />}
          {saveStatus === 'saved' && <CheckCircle2 size={12} className="text-emerald-500" />}
        </div>

        <div className="h-5 w-px bg-border" />

        <Tooltip><TooltipTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-xs" onClick={onSave}>
            <Save size={14} /> Сохранить
          </Button>
        </TooltipTrigger><TooltipContent side="bottom" className="text-xs">Ctrl+S</TooltipContent></Tooltip>

        <Tooltip><TooltipTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onUndo} disabled={!canUndo}>
            <Undo2 size={14} />
          </Button>
        </TooltipTrigger><TooltipContent side="bottom" className="text-xs">Отменить</TooltipContent></Tooltip>

        <Tooltip><TooltipTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onRedo} disabled={!canRedo}>
            <Redo2 size={14} />
          </Button>
        </TooltipTrigger><TooltipContent side="bottom" className="text-xs">Вернуть</TooltipContent></Tooltip>

        <div className="h-5 w-px bg-border" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-xs">
              <Plus size={14} /> Добавить вершину <ChevronDown size={12} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {NODE_TYPES.map(t => (
              <DropdownMenuItem key={t} onClick={() => handleAddNode(t)}>
                <span className="w-2 h-2 rounded-full mr-2" style={{ background: NODE_TYPE_CONFIG[t].color }} />
                {t}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-5 w-px bg-border" />

        <Tooltip><TooltipTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleFitView}>
            <LayoutDashboard size={14} />
          </Button>
        </TooltipTrigger><TooltipContent side="bottom" className="text-xs">Фит</TooltipContent></Tooltip>

        <div className="ml-auto flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5">
                <ChevronDown size={12} /> Ещё
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onExport} className="gap-2">
                <Download size={14} /> Экспорт JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onImport} className="gap-2">
                <Upload size={14} /> Импорт JSON
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDuplicateGraph} className="gap-2">
                <Copy size={14} /> Дублировать граф
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          onPaneClick={onPaneClick}
          onNodeDragStop={onNodeDragStop}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          proOptions={{ hideAttribution: true }}
          className="bg-muted/20"
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} className="opacity-40" />
          <Controls className="!rounded-lg !border !border-border !shadow-sm" />
          <MiniMap
            className="!rounded-lg !border !border-border !shadow-sm"
            maskColor="hsl(0 0% 0% / 0.05)"
            nodeColor={n => {
              const nodeType = (n.data?.nodeType as NodeType) || 'Organization';
              return NODE_TYPE_CONFIG[nodeType]?.color || '#6b7280';
            }}
          />
        </ReactFlow>
      </div>

      {/* Dialogs */}
      <NodeSearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        nodes={graph.nodes}
        onSelectNode={handleSearchSelect}
      />
      <KeyboardShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />

      {/* Stats Sheet */}
      <Sheet open={statsOpen} onOpenChange={setStatsOpen}>
        <SheetContent side="right" className="w-[320px] p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="text-sm">Graph Overview</SheetTitle>
          </SheetHeader>
          <GraphStatsPanel graph={graph} />
        </SheetContent>
      </Sheet>
    </div>
  );
}

export function GraphCanvas(props: GraphCanvasProps) {
  return (
    <ReactFlowProvider>
      <InnerCanvas {...props} />
    </ReactFlowProvider>
  );
}
