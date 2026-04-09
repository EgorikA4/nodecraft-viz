import { useState, useEffect, useMemo } from 'react';
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Building2, Network, Briefcase, User, Key } from 'lucide-react';
import { GraphNode, NodeType, NODE_TYPE_CONFIG } from '@/types/graph';

const iconMap: Record<NodeType, React.ElementType> = {
  Organization: Building2, OrgUnit: Network, Position: Briefcase, Person: User, Account: Key,
};

interface NodeSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodes: GraphNode[];
  onSelectNode: (node: GraphNode) => void;
}

export function NodeSearchDialog({ open, onOpenChange, nodes, onSelectNode }: NodeSearchDialogProps) {
  const grouped = useMemo(() => {
    const groups: Record<NodeType, GraphNode[]> = {
      Organization: [], OrgUnit: [], Position: [], Person: [], Account: [],
    };
    nodes.forEach(n => groups[n.type]?.push(n));
    return groups;
  }, [nodes]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search nodes by label, type, or data..." />
      <CommandList>
        <CommandEmpty>No nodes found.</CommandEmpty>
        {(Object.entries(grouped) as [NodeType, GraphNode[]][]).map(([type, items]) => {
          if (items.length === 0) return null;
          const Icon = iconMap[type];
          return (
            <CommandGroup key={type} heading={type}>
              {items.map(node => (
                <CommandItem
                  key={node.id}
                  value={`${node.label} ${node.type} ${node.externalId || ''} ${JSON.stringify(node.data)}`}
                  onSelect={() => { onSelectNode(node); onOpenChange(false); }}
                >
                  <div className="flex items-center gap-2 w-full">
                    <div className="w-5 h-5 rounded flex items-center justify-center shrink-0"
                      style={{ background: `${NODE_TYPE_CONFIG[type].color}15` }}>
                      <Icon size={12} style={{ color: NODE_TYPE_CONFIG[type].color }} />
                    </div>
                    <span className="text-sm font-medium truncate">{node.label}</span>
                    {node.externalId && (
                      <span className="text-[10px] text-muted-foreground ml-auto font-mono">{node.externalId}</span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          );
        })}
      </CommandList>
    </CommandDialog>
  );
}
