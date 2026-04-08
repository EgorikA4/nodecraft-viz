import { useCallback, useMemo, useRef, useState } from 'react';
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
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Save, Plus, GitBranch, Maximize, LayoutDashboard, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { nodeTypes } from './OrgNode';
import { edgeTypes } from './LabeledEdge';
import { GraphDocument, GraphNode, GraphEdge, NODE_TYPES, NodeType, NODE_TYPE_CONFIG, RELATION_TYPES } from '@/types/graph';
import { createNode, createEdge } from '@/store/graph-store';

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
}

function graphNodesToFlow(nodes: GraphNode[]): Node[] {
  return nodes.map(n => ({
    id: n.id,
    type: 'orgNode',
    position: n.position,
    data: { label: n.label, description: n.description, nodeType: n.type },
    selected: false,
  }));
}

function graphEdgesToFlow(edges: GraphEdge[]): Edge[] {
  return edges.map(e => ({
    id: e.id,
    source: e.source,
    target: e.target,
    type: 'labeled',
    data: { relationType: e.relationType },
  }));
}

export function GraphCanvas({
  graph, hasUnsavedChanges, onGraphChange, onSave, onTitleChange,
  onNodeSelect, onEdgeSelect, selectedNodeId, selectedEdgeId,
}: GraphCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(graph ? graphNodesToFlow(graph.nodes) : []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(graph ? graphEdgesToFlow(graph.edges) : []);
  const [editingTitle, setEditingTitle] = useState(false);
  const [addEdgeMode, setAddEdgeMode] = useState(false);
  const graphRef = useRef(graph?.id);

  // Sync when graph changes
  if (graph && graph.id !== graphRef.current) {
    graphRef.current = graph.id;
    setNodes(graphNodesToFlow(graph.nodes));
    setEdges(graphEdgesToFlow(graph.edges));
  }

  // Sync flow changes back to parent
  const syncBack = useCallback(() => {
    if (!graph) return;
    const gNodes: GraphNode[] = nodes.map(n => {
      const original = graph.nodes.find(gn => gn.id === n.id);
      return {
        ...original!,
        position: n.position,
        label: n.data.label as string,
        description: n.data.description as string,
      };
    });
    onGraphChange(gNodes, graph.edges);
  }, [nodes, graph, onGraphChange]);

  const onConnect = useCallback((connection: Connection) => {
    const newEdge = createEdge(connection.source!, connection.target!, 'CUSTOM');
    setEdges(eds => addEdge({
      ...connection,
      id: newEdge.id,
      type: 'labeled',
      data: { relationType: 'CUSTOM' },
    }, eds));
    if (graph) {
      const updatedEdges = [...graph.edges, newEdge];
      onGraphChange(graph.nodes, updatedEdges);
    }
  }, [graph, onGraphChange, setEdges]);

  const handleAddNode = useCallback((type: NodeType) => {
    if (!graph) return;
    const pos = { x: 200 + Math.random() * 300, y: 200 + Math.random() * 200 };
    const newNode = createNode(type, pos);
    const updatedNodes = [...graph.nodes, newNode];
    setNodes(prev => [...prev, {
      id: newNode.id,
      type: 'orgNode',
      position: pos,
      data: { label: newNode.label, description: newNode.description, nodeType: newNode.type },
    }]);
    onGraphChange(updatedNodes, graph.edges);
  }, [graph, onGraphChange, setNodes]);

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

  if (!graph) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-muted/30">
        <LayoutDashboard size={56} className="text-muted-foreground/20 mb-4" />
        <h2 className="text-xl font-semibold text-muted-foreground/60 mb-1">No graph selected</h2>
        <p className="text-sm text-muted-foreground/40">Select or create a graph to begin editing</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Toolbar */}
      <div className="h-12 border-b border-border bg-card flex items-center px-4 gap-2 shrink-0">
        {/* Title */}
        <div className="flex items-center gap-2 mr-4 min-w-0">
          {editingTitle ? (
            <Input
              autoFocus
              defaultValue={graph.title}
              className="h-7 text-sm font-semibold w-48"
              onBlur={e => { onTitleChange(e.target.value); setEditingTitle(false); }}
              onKeyDown={e => { if (e.key === 'Enter') { onTitleChange((e.target as HTMLInputElement).value); setEditingTitle(false); } }}
            />
          ) : (
            <button onClick={() => setEditingTitle(true)} className="text-sm font-semibold text-foreground hover:text-primary transition truncate max-w-[200px]">
              {graph.title}
            </button>
          )}
          {hasUnsavedChanges && (
            <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" title="Unsaved changes" />
          )}
        </div>

        <div className="h-5 w-px bg-border" />

        <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-xs" onClick={onSave}>
          <Save size={14} /> Save
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-xs">
              <Plus size={14} /> Add Node <ChevronDown size={12} />
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

        <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-xs" onClick={() => setAddEdgeMode(!addEdgeMode)}>
          <GitBranch size={14} /> {addEdgeMode ? 'Cancel Edge' : 'Add Edge'}
        </Button>
      </div>

      {/* Canvas */}
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
    </div>
  );
}
