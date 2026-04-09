import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Building2, Network, Briefcase, User, Key } from 'lucide-react';
import { NODE_TYPE_CONFIG, NODE_TYPE_LABELS_RU, type NodeType } from '@/types/graph';

const iconMap: Record<NodeType, React.ElementType> = {
  Organization: Building2,
  OrgUnit: Network,
  Position: Briefcase,
  Person: User,
  Account: Key,
};

const sizeMap: Record<NodeType, string> = {
  Organization: 'min-w-[220px] px-5 py-4',
  OrgUnit: 'min-w-[180px] px-4 py-3',
  Position: 'min-w-[170px] px-4 py-3',
  Person: 'min-w-[160px] px-3 py-2.5',
  Account: 'min-w-[150px] px-3 py-2',
};

function OrgNodeComponent({ data, selected }: NodeProps) {
  const nodeType = (data.nodeType as NodeType) || 'Organization';
  const config = NODE_TYPE_CONFIG[nodeType];
  const Icon = iconMap[nodeType];
  const size = sizeMap[nodeType];

  return (
    <div
      className={`rounded-xl border-2 bg-white shadow-sm transition-all ${size} ${
        selected ? 'ring-2 ring-offset-2 shadow-md' : ''
      }`}
      style={{
        borderColor: selected ? config.color : `${config.color}66`,
        ...(selected ? { '--tw-ring-color': config.color } as React.CSSProperties : {}),
      }}
    >
      <Handle type="target" position={Position.Top} className="!w-2.5 !h-2.5 !border-2 !border-white" style={{ background: config.color }} />
      <div className="flex items-start gap-2.5">
        <div
          className="flex items-center justify-center rounded-lg shrink-0"
          style={{
            background: `${config.color}15`,
            width: nodeType === 'Organization' ? 40 : nodeType === 'Account' ? 28 : 32,
            height: nodeType === 'Organization' ? 40 : nodeType === 'Account' ? 28 : 32,
          }}
        >
          <Icon
            size={nodeType === 'Organization' ? 22 : nodeType === 'Account' ? 14 : 16}
            style={{ color: config.color }}
          />
        </div>
        <div className="flex flex-col min-w-0">
          <span
            className="text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: config.color }}
          >
            {NODE_TYPE_LABELS_RU[nodeType]}
          </span>
          <span className="text-sm font-semibold text-foreground truncate">
            {data.label as string}
          </span>
          {data.description && (
            <span className="text-xs text-muted-foreground truncate mt-0.5">
              {data.description as string}
            </span>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!w-2.5 !h-2.5 !border-2 !border-white" style={{ background: config.color }} />
    </div>
  );
}

export const OrgNode = memo(OrgNodeComponent);
export const nodeTypes = { orgNode: OrgNode };
