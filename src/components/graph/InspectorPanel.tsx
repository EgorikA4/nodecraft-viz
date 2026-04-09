
import { GraphNode, GraphEdge, NODE_TYPE_CONFIG, NODE_TYPE_LABELS_RU, RELATION_TYPES, RELATION_TYPE_LABELS_RU, NodeType } from '@/types/graph';
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
  mobile?: boolean;
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

export function InspectorPanel({
  selectedNode, selectedEdge, nodes,
  onUpdateNode, onDeleteNode, onUpdateEdge, onDeleteEdge, onDuplicateNode, mobile,
}: InspectorPanelProps) {
  if (!selectedNode && !selectedEdge) {
    return (
      <div className={`${mobile ? 'w-full' : 'w-[300px] border-l border-border'} h-full flex flex-col items-center justify-center bg-card shrink-0 p-6`}>
        <Info size={32} className="text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground text-center">Выберите вершину или связь для просмотра её свойств</p>
        <p className="text-xs text-muted-foreground/50 mt-2 text-center">Нажмите на любой элемент на холсте</p>
      </div>
    );
  }

  if (selectedEdge) {
    const sourceNode = nodes.find(n => n.id === selectedEdge.source);
    const targetNode = nodes.find(n => n.id === selectedEdge.target);
    return (
      <div className={`${mobile ? 'w-full' : 'w-[300px] border-l border-border'} h-full flex flex-col bg-card shrink-0`}>
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Описание связи</h3>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            <FieldGroup label="Связанные вершины">
              <div className="text-xs text-muted-foreground space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">Исходящая:</span>
                  {sourceNode && (
                    <Badge variant="outline" className="text-[10px] h-5" style={{ borderColor: NODE_TYPE_CONFIG[sourceNode.type].color }}>
                      {NODE_TYPE_LABELS_RU[sourceNode.type]}
                    </Badge>
                  )}
                  <span>{sourceNode?.label || selectedEdge.source}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">Входящая:</span>
                  {targetNode && (
                    <Badge variant="outline" className="text-[10px] h-5" style={{ borderColor: NODE_TYPE_CONFIG[targetNode.type].color }}>
                      {NODE_TYPE_LABELS_RU[targetNode.type]}
                    </Badge>
                  )}
                  <span>{targetNode?.label || selectedEdge.target}</span>
                </div>
              </div>
            </FieldGroup>
            <Separator />
            <FieldGroup label="Тип соединения">
              <Select
                value={selectedEdge.relationType}
                onValueChange={v => onUpdateEdge({ ...selectedEdge, relationType: v as any })}
              >
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {RELATION_TYPES.map(r => (
                    <SelectItem key={r} value={r}>{RELATION_TYPE_LABELS_RU[r]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldGroup>
            <Button variant="destructive" size="sm" className="w-full gap-1.5" onClick={() => onDeleteEdge(selectedEdge.id)}>
              <Trash2 size={13} /> Удалить связь
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
    <div className={`${mobile ? 'w-full' : 'w-[300px] border-l border-border'} h-full flex flex-col bg-card shrink-0`}>
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Описание вершины</h3>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          <FieldGroup label="Общие свойства">
            <Field label="Название" value={selectedNode.label} onChange={v => onUpdateNode({ ...selectedNode, label: v })} placeholder="Название вершины" />
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Описание</Label>
              <Textarea
                value={selectedNode.description || ''}
                onChange={e => onUpdateNode({ ...selectedNode, description: e.target.value })}
                className="text-sm min-h-[60px] resize-none"
                placeholder="Краткое описание вершины"
              />
            </div>
          </FieldGroup>

          <Separator />

          <FieldGroup label={`Данные ${NODE_TYPE_LABELS_RU[selectedNode.type]}`}>
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

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={() => onDuplicateNode(selectedNode)}>
              <Copy size={13} /> Дублировать
            </Button>
            <Button variant="destructive" size="sm" className="flex-1 gap-1.5" onClick={() => onDeleteNode(selectedNode.id)}>
              <Trash2 size={13} /> Удалить
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
