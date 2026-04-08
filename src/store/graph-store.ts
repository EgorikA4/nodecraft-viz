import { GraphDocument, GraphNode, GraphEdge, NodeType, RelationType } from '@/types/graph';
import { demoGraphs } from '@/data/demo-graphs';

const STORAGE_KEY = 'orggraph_graphs';

export function loadGraphs(): GraphDocument[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  // First launch: seed demo data
  saveGraphs(demoGraphs);
  return demoGraphs;
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
