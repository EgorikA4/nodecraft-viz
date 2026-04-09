import { GraphEdge, GraphNode } from '@/types/graph';

const X_START = 220;
const Y_START = 80;
const X_STEP = 320;
const Y_STEP = 180;

function hasValidPosition(node: GraphNode): boolean {
  return Number.isFinite(node.position?.x) && Number.isFinite(node.position?.y);
}

export function buildPositionsFromEdges(nodes: GraphNode[], edges: GraphEdge[]): Map<string, { x: number; y: number }> {
  const nodeIds = new Set(nodes.map((node) => node.id));
  const indegree = new Map<string, number>();
  const outgoing = new Map<string, string[]>();

  for (const node of nodes) {
    indegree.set(node.id, 0);
    outgoing.set(node.id, []);
  }

  for (const edge of edges) {
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) continue;
    indegree.set(edge.target, (indegree.get(edge.target) ?? 0) + 1);
    outgoing.get(edge.source)?.push(edge.target);
  }

  const roots = nodes.filter((node) => (indegree.get(node.id) ?? 0) === 0).map((node) => node.id);
  const queue = roots.length > 0 ? [...roots] : nodes.slice(0, 1).map((node) => node.id);
  const depth = new Map<string, number>();

  for (const rootId of queue) depth.set(rootId, 0);

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const currentDepth = depth.get(currentId) ?? 0;

    for (const childId of outgoing.get(currentId) ?? []) {
      if (depth.has(childId)) continue;
      depth.set(childId, currentDepth + 1);
      queue.push(childId);
    }
  }

  for (const node of nodes) {
    if (!depth.has(node.id)) depth.set(node.id, 0);
  }

  const byDepth = new Map<number, GraphNode[]>();
  for (const node of nodes) {
    const d = depth.get(node.id) ?? 0;
    const bucket = byDepth.get(d) ?? [];
    bucket.push(node);
    byDepth.set(d, bucket);
  }

  const positions = new Map<string, { x: number; y: number }>();
  const layers = [...byDepth.keys()].sort((a, b) => a - b);

  for (const layer of layers) {
    const layerNodes = (byDepth.get(layer) ?? []).slice().sort((a, b) => a.label.localeCompare(b.label));
    layerNodes.forEach((node, index) => {
      positions.set(node.id, {
        x: X_START + layer * X_STEP,
        y: Y_START + index * Y_STEP,
      });
    });
  }

  return positions;
}

export function needsAutoLayout(nodes: GraphNode[]): boolean {
  return nodes.some((node) => !hasValidPosition(node));
}
