import { NodeType, NODE_TYPES, NODE_TYPE_CONFIG } from '@/types/graph';
import { Building2, Network, Briefcase, User, Key, Eye, EyeOff } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const iconMap: Record<NodeType, React.ElementType> = {
  Organization: Building2, OrgUnit: Network, Position: Briefcase, Person: User, Account: Key,
};

interface FilterBarProps {
  hiddenTypes: Set<NodeType>;
  onToggleType: (type: NodeType) => void;
}

export function FilterBar({ hiddenTypes, onToggleType }: FilterBarProps) {
  return (
    <div className="flex items-center gap-0.5">
      {NODE_TYPES.map(type => {
        const Icon = iconMap[type];
        const hidden = hiddenTypes.has(type);
        return (
          <Tooltip key={type}>
            <TooltipTrigger asChild>
              <button
                onClick={() => onToggleType(type)}
                className={`w-7 h-7 rounded-md flex items-center justify-center transition-all ${
                  hidden ? 'opacity-30 hover:opacity-50' : 'opacity-100 hover:bg-muted'
                }`}
              >
                <Icon size={14} style={{ color: NODE_TYPE_CONFIG[type].color }} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              {hidden ? `Show ${type}` : `Hide ${type}`}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
