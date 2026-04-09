import { GraphDocument, NODE_TYPE_CONFIG, NodeType, RelationType } from '@/types/graph';
import { Building2, Network, Briefcase, User, Key, AlertTriangle, BarChart3 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const iconMap: Record<NodeType, React.ElementType> = {
  Organization: Building2, OrgUnit: Network, Position: Briefcase, Person: User, Account: Key,
};

interface GraphStatsPanelProps {
  graph: GraphDocument;
}

interface ValidationWarning {
  nodeId: string;
  label: string;
  message: string;
}

function getValidationWarnings(graph: GraphDocument): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];
  graph.nodes.forEach(n => {
    if (!n.label || n.label.startsWith('New ')) {
      warnings.push({ nodeId: n.id, label: n.label || n.id, message: 'Missing or default label' });
    }
    if (n.type === 'Person') {
      const d = n.data as any;
      if (!d.first_name && !d.last_name) {
        warnings.push({ nodeId: n.id, label: n.label, message: 'Missing name fields' });
      }
    }
    if (n.type === 'Organization') {
      const d = n.data as any;
      if (!d.name) {
        warnings.push({ nodeId: n.id, label: n.label, message: 'Missing organization name' });
      }
    }
  });
  // orphan nodes
  const connected = new Set<string>();
  graph.edges.forEach(e => { connected.add(e.source); connected.add(e.target); });
  graph.nodes.forEach(n => {
    if (!connected.has(n.id) && graph.nodes.length > 1) {
      warnings.push({ nodeId: n.id, label: n.label, message: 'Disconnected node' });
    }
  });
  return warnings;
}

export function GraphStatsPanel({ graph }: GraphStatsPanelProps) {
  const typeCounts: Record<NodeType, number> = {
    Organization: 0, OrgUnit: 0, Position: 0, Person: 0, Account: 0,
  };
  graph.nodes.forEach(n => typeCounts[n.type]++);

  const edgeCounts: Record<string, number> = {};
  graph.edges.forEach(e => {
    edgeCounts[e.relationType] = (edgeCounts[e.relationType] || 0) + 1;
  });

  const warnings = getValidationWarnings(graph);

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 size={14} className="text-muted-foreground" />
          <h3 className="text-sm font-semibold">Graph Statistics</h3>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-muted/50 p-2.5 text-center">
            <p className="text-lg font-bold text-foreground">{graph.nodes.length}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Nodes</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-2.5 text-center">
            <p className="text-lg font-bold text-foreground">{graph.edges.length}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Edges</p>
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">By Type</h4>
          <div className="space-y-1.5">
            {(Object.entries(typeCounts) as [NodeType, number][]).map(([type, count]) => {
              const Icon = iconMap[type];
              return (
                <div key={type} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Icon size={12} style={{ color: NODE_TYPE_CONFIG[type].color }} />
                    <span className="text-foreground">{type}</span>
                  </div>
                  <span className="text-muted-foreground font-mono text-xs">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {Object.keys(edgeCounts).length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Relations</h4>
              <div className="space-y-1.5">
                {Object.entries(edgeCounts).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between text-sm">
                    <span className="text-foreground text-xs">{type.replace(/_/g, ' ')}</span>
                    <span className="text-muted-foreground font-mono text-xs">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {warnings.length > 0 && (
          <>
            <Separator />
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <AlertTriangle size={12} className="text-amber-500" />
                <h4 className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
                  Warnings ({warnings.length})
                </h4>
              </div>
              <div className="space-y-1.5">
                {warnings.map((w, i) => (
                  <div key={i} className="rounded-md bg-amber-50 border border-amber-200 p-2">
                    <p className="text-xs font-medium text-amber-800">{w.label}</p>
                    <p className="text-[10px] text-amber-600">{w.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <Separator />
        <div className="text-[10px] text-muted-foreground space-y-0.5">
          <p>Version: {graph.version}</p>
          <p>Created: {new Date(graph.createdAt).toLocaleDateString()}</p>
          <p>Updated: {new Date(graph.updatedAt).toLocaleDateString()}</p>
        </div>
      </div>
    </ScrollArea>
  );
}
