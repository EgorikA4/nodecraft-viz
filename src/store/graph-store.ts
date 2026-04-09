import { GraphDocument, GraphNode, GraphEdge, NodeType, RelationType } from '@/types/graph';
import { demoGraphs } from '@/data/demo-graphs';
import { buildPositionsFromEdges, needsAutoLayout } from '@/utils/graph-layout';

const STORAGE_KEY = 'orggraph_graphs';

function isValidEdge(edge: GraphEdge, nodeIds: Set<string>): boolean {
  return !!edge.id && !!edge.source && !!edge.target && nodeIds.has(edge.source) && nodeIds.has(edge.target);
}

export function normalizeGraphDocument(graph: GraphDocument): GraphDocument {
  const nodeIds = new Set(graph.nodes.map((node) => node.id));
  const edges = graph.edges.filter((edge) => isValidEdge(edge, nodeIds));

  if (!needsAutoLayout(graph.nodes)) {
    return { ...graph, edges };
  }

  const positions = buildPositionsFromEdges(graph.nodes, edges);
  const nodes = graph.nodes.map((node) => ({
    ...node,
    position: Number.isFinite(node.position?.x) && Number.isFinite(node.position?.y)
      ? node.position
      : positions.get(node.id) ?? { x: 100, y: 100 },
  }));

  return {
    ...graph,
    nodes,
    edges,
  };
}

export function loadGraphs(): GraphDocument[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as GraphDocument[];
      return parsed.map(normalizeGraphDocument);
    }
  } catch {}
  // First launch: seed demo data
  const seeded = demoGraphs.map(normalizeGraphDocument);
  saveGraphs(seeded);
  return seeded;
}

export function saveGraphs(graphs: GraphDocument[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(graphs));
}

export function saveGraph(graph: GraphDocument, allGraphs: GraphDocument[]): GraphDocument[] {
  const updated = { ...graph, updatedAt: new Date().toISOString(), version: graph.version + 1 };
  const idx = allGraphs.findIndex(g => g.id === graph.id);
  const next = idx >= 0
    ? allGraphs.map(g => g.id === graph.id ? updated : g)
    : [...allGraphs, updated];
  saveGraphs(next);
  return next;
}

export function deleteGraph(id: string, allGraphs: GraphDocument[]): GraphDocument[] {
  const next = allGraphs.filter(g => g.id !== id);
  saveGraphs(next);
  return next;
}

export function createNewGraph(title: string): GraphDocument {
  return {
    id: `graph-${Date.now()}`,
    title,
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    nodes: [],
    edges: [],
  };
}

export function createNode(type: NodeType, position: { x: number; y: number }): GraphNode {
  const id = `node-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const defaults: Record<NodeType, any> = {
    Organization: { name: '' },
    OrgUnit: { name: '', code: '', type: '' },
    Position: { name: '', grade: '' },
    Person: { first_name: '', last_name: '' },
    Account: { provider: '', identifier: '' },
  };
  return { id, type, label: `New ${type}`, description: '', data: defaults[type], position };
}

export function createEdge(source: string, target: string, relationType: RelationType): GraphEdge {
  return {
    id: `edge-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    source,
    target,
    relationType,
  };
}
