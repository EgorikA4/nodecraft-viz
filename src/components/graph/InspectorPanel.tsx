import { useState } from 'react';
import { GraphNode, GraphEdge, NODE_TYPE_CONFIG, RELATION_TYPES, NodeType } from '@/types/graph';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Info } from 'lucide-react';

interface InspectorPanelProps {
  selectedNode: GraphNode | null;
  selectedEdge: GraphEdge | null;
  nodes: GraphNode[];
  onUpdateNode: (node: GraphNode) => void;
  onDeleteNode: (id: string) => void;
  onUpdateEdge: (edge: GraphEdge) => void;
  onDeleteEdge: (id: string) => void;
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</h4>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input value={value} onChange={e => onChange(e.target.value)} className="h-8 text-sm" type={type} />
    </div>
  );
}

const TYPE_FIELDS: Record<NodeType, { key: string; label: string }[]> = {
  Organization: [
    { key: 'name', label: 'Name' }, { key: 'inn', label: 'INN' }, { key: 'kpp', label: 'KPP' },
    { key: 'ogrn', label: 'OGRN' }, { key: 'address', label: 'Address' },
  ],
  OrgUnit: [
    { key: 'name', label: 'Name' }, { key: 'code', label: 'Code' }, { key: 'type', label: 'Type' },
  ],
  Position: [
    { key: 'name', label: 'Name' }, { key: 'grade', label: 'Grade' },
  ],
  Person: [
    { key: 'first_name', label: 'First Name' }, { key: 'last_name', label: 'Last Name' },
    { key: 'middle_name', label: 'Middle Name' }, { key: 'birthday', label: 'Birthday' },
    { key: 'gender', label: 'Gender' }, { key: 'citizenship', label: 'Citizenship' },
    { key: 'inn', label: 'INN' }, { key: 'snils', label: 'SNILS' },
  ],
  Account: [
    { key: 'provider', label: 'Provider' }, { key: 'identifier', label: 'Identifier' },
  ],
};

export function InspectorPanel({
  selectedNode, selectedEdge, nodes,
  onUpdateNode, onDeleteNode, onUpdateEdge, onDeleteEdge,
}: InspectorPanelProps) {
  if (!selectedNode && !selectedEdge) {
    return (
      <div className="w-[300px] h-full flex flex-col items-center justify-center border-l border-border bg-card shrink-0 p-6">
        <Info size={32} className="text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground text-center">Select a node or edge to inspect its properties</p>
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
              <div className="text-xs text-muted-foreground space-y-1">
                <p><span className="font-medium text-foreground">Source:</span> {sourceNode?.label || selectedEdge.source}</p>
                <p><span className="font-medium text-foreground">Target:</span> {targetNode?.label || selectedEdge.target}</p>
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
              <p>ID: {selectedEdge.id}</p>
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
          <h3 className="text-sm font-semibold text-foreground truncate">{selectedNode.label}</h3>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          <FieldGroup label="Common Properties">
            <Field label="Label" value={selectedNode.label} onChange={v => onUpdateNode({ ...selectedNode, label: v })} />
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Description</Label>
              <Textarea
                value={selectedNode.description || ''}
                onChange={e => onUpdateNode({ ...selectedNode, description: e.target.value })}
                className="text-sm min-h-[60px] resize-none"
              />
            </div>
            <Field label="External ID" value={selectedNode.externalId || ''} onChange={v => onUpdateNode({ ...selectedNode, externalId: v })} />
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
              />
            ))}
          </FieldGroup>

          <Separator />

          <FieldGroup label="Metadata">
            <div className="text-xs text-muted-foreground space-y-1">
              <p>ID: <span className="font-mono">{selectedNode.id}</span></p>
            </div>
          </FieldGroup>

          <Button variant="destructive" size="sm" className="w-full gap-1.5" onClick={() => onDeleteNode(selectedNode.id)}>
            <Trash2 size={13} /> Delete Node
          </Button>
        </div>
      </ScrollArea>
    </div>
  );
}
