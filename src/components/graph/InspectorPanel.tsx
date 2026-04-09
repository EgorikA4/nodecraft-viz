import { useState } from 'react';
import { GraphNode, GraphEdge, NODE_TYPE_CONFIG, RELATION_TYPES, NodeType, NODE_TYPES } from '@/types/graph';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Info, Copy, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface InspectorPanelProps {
  selectedNode: GraphNode | null;
  selectedEdge: GraphEdge | null;
  nodes: GraphNode[];
  onUpdateNode: (node: GraphNode) => void;
  onDeleteNode: (id: string) => void;
  onUpdateEdge: (edge: GraphEdge) => void;
  onDeleteEdge: (id: string) => void;
  onDuplicateNode: (node: GraphNode) => void;
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</h4>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input value={value} onChange={e => onChange(e.target.value)} className="h-8 text-sm" type={type} placeholder={placeholder || `Enter ${label.toLowerCase()}...`} />
    </div>
  );
}

const TYPE_FIELDS: Record<NodeType, { key: string; label: string; placeholder?: string }[]> = {
  Organization: [
    { key: 'name', label: 'Name', placeholder: 'e.g. Acme Corporation' },
    { key: 'inn', label: 'INN', placeholder: '10 or 12 digits' },
    { key: 'kpp', label: 'KPP', placeholder: '9 digits' },
    { key: 'ogrn', label: 'OGRN', placeholder: '13 digits' },
    { key: 'address', label: 'Address', placeholder: 'Legal address' },
  ],
  OrgUnit: [
    { key: 'name', label: 'Name', placeholder: 'e.g. Engineering Department' },
    { key: 'code', label: 'Code', placeholder: 'e.g. ENG-01' },
    { key: 'type', label: 'Type', placeholder: 'e.g. Department, Division' },
  ],
  Position: [
    { key: 'name', label: 'Name', placeholder: 'e.g. Senior Software Engineer' },
    { key: 'grade', label: 'Grade', placeholder: 'e.g. Senior, Manager' },
  ],
  Person: [
    { key: 'first_name', label: 'First Name', placeholder: 'e.g. John' },
    { key: 'last_name', label: 'Last Name', placeholder: 'e.g. Doe' },
    { key: 'middle_name', label: 'Middle Name', placeholder: 'Optional' },
    { key: 'birthday', label: 'Birthday', placeholder: 'YYYY-MM-DD' },
    { key: 'gender', label: 'Gender', placeholder: 'e.g. Male, Female' },
    { key: 'citizenship', label: 'Citizenship', placeholder: 'e.g. US, RU' },
    { key: 'inn', label: 'INN', placeholder: '12 digits' },
    { key: 'snils', label: 'SNILS', placeholder: 'XXX-XXX-XXX XX' },
  ],
  Account: [
    { key: 'provider', label: 'Provider', placeholder: 'e.g. LDAP, AD, OAuth' },
    { key: 'identifier', label: 'Identifier', placeholder: 'e.g. user@domain' },
  ],
};

function NodeBreadcrumb({ node, nodes }: { node: GraphNode; nodes: GraphNode[] }) {
  const path: GraphNode[] = [];
  let current: GraphNode | undefined = node;
  const visited = new Set<string>();
  while (current && !visited.has(current.id)) {
    visited.add(current.id);
    path.unshift(current);
    current = current.parentId ? nodes.find(n => n.id === current!.parentId) : undefined;
  }
  if (path.length <= 1) return null;
  return (
    <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground flex-wrap px-4 py-1.5 bg-muted/30 border-b border-border">
      {path.map((n, i) => (
        <span key={n.id} className="flex items-center gap-0.5">
          {i > 0 && <ChevronRight size={10} />}
          <span className={n.id === node.id ? 'font-semibold text-foreground' : ''}>{n.label}</span>
        </span>
      ))}
    </div>
  );
}

export function InspectorPanel({
  selectedNode, selectedEdge, nodes,
  onUpdateNode, onDeleteNode, onUpdateEdge, onDeleteEdge, onDuplicateNode,
}: InspectorPanelProps) {
  if (!selectedNode && !selectedEdge) {
    return (
      <div className="w-[300px] h-full flex flex-col items-center justify-center border-l border-border bg-card shrink-0 p-6">
        <Info size={32} className="text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground text-center">Select a node or edge to inspect its properties</p>
        <p className="text-xs text-muted-foreground/50 mt-2 text-center">Click any element on the canvas, or use <kbd className="px-1 py-0.5 rounded border bg-muted text-[10px]">⌘K</kbd> to search</p>
      </div>
    );
  }

  if (selectedEdge) {
    const sourceNode = nodes.find(n => n.id === selectedEdge.source);
    const targetNode = nodes.find(n => n.id === selectedEdge.target);
    return (
      <div className="w-[300px] h-full flex flex-col border-l border-border bg-card shrink-0">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Edge Inspector</h3>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            <FieldGroup label="Connection">
              <div className="text-xs text-muted-foreground space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">Source:</span>
                  {sourceNode && (
                    <Badge variant="outline" className="text-[10px] h-5" style={{ borderColor: NODE_TYPE_CONFIG[sourceNode.type].color }}>
                      {sourceNode.type}
                    </Badge>
                  )}
                  <span>{sourceNode?.label || selectedEdge.source}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">Target:</span>
                  {targetNode && (
                    <Badge variant="outline" className="text-[10px] h-5" style={{ borderColor: NODE_TYPE_CONFIG[targetNode.type].color }}>
                      {targetNode.type}
                    </Badge>
                  )}
                  <span>{targetNode?.label || selectedEdge.target}</span>
                </div>
              </div>
            </FieldGroup>
            <Separator />
            <FieldGroup label="Relation Type">
              <Select
                value={selectedEdge.relationType}
                onValueChange={v => onUpdateEdge({ ...selectedEdge, relationType: v as any })}
              >
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {RELATION_TYPES.map(r => (
                    <SelectItem key={r} value={r}>{r.replace(/_/g, ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldGroup>
            <Separator />
            <div className="text-xs text-muted-foreground">
              <p className="font-mono">ID: {selectedEdge.id}</p>
            </div>
            <Button variant="destructive" size="sm" className="w-full gap-1.5" onClick={() => onDeleteEdge(selectedEdge.id)}>
              <Trash2 size={13} /> Delete Edge
            </Button>
          </div>
        </ScrollArea>
      </div>
    );
  }

  if (!selectedNode) return null;

  const config = NODE_TYPE_CONFIG[selectedNode.type];
  const fields = TYPE_FIELDS[selectedNode.type] || [];

  const updateData = (key: string, value: string) => {
    onUpdateNode({ ...selectedNode, data: { ...selectedNode.data, [key]: value } });
  };

  return (
    <div className="w-[300px] h-full flex flex-col border-l border-border bg-card shrink-0">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
            style={{ background: `${config.color}15`, color: config.color }}
          >
            {selectedNode.type}
          </span>
          <h3 className="text-sm font-semibold text-foreground truncate flex-1">{selectedNode.label}</h3>
        </div>
      </div>
      <NodeBreadcrumb node={selectedNode} nodes={nodes} />
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          <FieldGroup label="Common Properties">
            <Field label="Label" value={selectedNode.label} onChange={v => onUpdateNode({ ...selectedNode, label: v })} placeholder="Node display name" />
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Description</Label>
              <Textarea
                value={selectedNode.description || ''}
                onChange={e => onUpdateNode({ ...selectedNode, description: e.target.value })}
                className="text-sm min-h-[60px] resize-none"
                placeholder="Brief description of this node..."
              />
            </div>
            <Field label="External ID" value={selectedNode.externalId || ''} onChange={v => onUpdateNode({ ...selectedNode, externalId: v })} placeholder="e.g. ERP-12345" />
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Parent</Label>
              <Select
                value={selectedNode.parentId || '__none__'}
                onValueChange={v => onUpdateNode({ ...selectedNode, parentId: v === '__none__' ? undefined : v })}
              >
                <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  {nodes.filter(n => n.id !== selectedNode.id).map(n => (
                    <SelectItem key={n.id} value={n.id}>{n.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </FieldGroup>

          <Separator />

          <FieldGroup label={`${selectedNode.type} Fields`}>
            {fields.map(f => (
              <Field
                key={f.key}
                label={f.label}
                value={(selectedNode.data as any)[f.key] || ''}
                onChange={v => updateData(f.key, v)}
                placeholder={f.placeholder}
              />
            ))}
          </FieldGroup>

          <Separator />

          <FieldGroup label="Metadata">
            <div className="text-xs text-muted-foreground space-y-1">
              <p>ID: <span className="font-mono">{selectedNode.id}</span></p>
            </div>
          </FieldGroup>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={() => onDuplicateNode(selectedNode)}>
              <Copy size={13} /> Duplicate
            </Button>
            <Button variant="destructive" size="sm" className="flex-1 gap-1.5" onClick={() => onDeleteNode(selectedNode.id)}>
              <Trash2 size={13} /> Delete
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
