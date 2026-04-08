import { type EdgeProps, getBezierPath, EdgeLabelRenderer, BaseEdge } from '@xyflow/react';
import type { RelationType } from '@/types/graph';

const RELATION_COLORS: Record<string, string> = {
  HAS_UNIT: '#0ea5e9',
  PARENT_OF: '#6366f1',
  HAS_POSITION: '#8b5cf6',
  OCCUPIED_BY: '#f59e0b',
  HAS_ACCOUNT: '#64748b',
  REPORTS_TO: '#ef4444',
  MEMBER_OF: '#10b981',
  OWNS: '#3b82f6',
  MANAGES: '#f97316',
  CUSTOM: '#6b7280',
};

export function LabeledEdge({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition, data, selected, style,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition,
  });
  const relationType = (data?.relationType as RelationType) || 'CUSTOM';
  const color = RELATION_COLORS[relationType] || '#6b7280';

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          ...style,
          stroke: color,
          strokeWidth: selected ? 2.5 : 1.5,
          opacity: selected ? 1 : 0.6,
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
         className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md border bg-card ${
            selected ? 'shadow-md ring-1' : 'shadow-sm'
          }`}
        >
          <span style={{ color }}>{relationType.replace(/_/g, ' ')}</span>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export const edgeTypes = { labeled: LabeledEdge };
