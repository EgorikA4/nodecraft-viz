import { useState } from 'react';
import { Search, Plus, Trash2, LayoutGrid, Copy } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GraphDocument } from '@/types/graph';
import { formatDistanceToNow } from 'date-fns';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface GraphExplorerProps {
  graphs: GraphDocument[];
  activeGraphId: string | null;
  onSelectGraph: (id: string) => void;
  onCreateGraph: () => void;
  onDeleteGraph: (id: string) => void;
}

export function GraphExplorer({ graphs, activeGraphId, onSelectGraph, onCreateGraph, onDeleteGraph }: GraphExplorerProps) {
  const [search, setSearch] = useState('');
  const filtered = graphs.filter(g => g.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="w-[280px] h-full flex flex-col border-r border-border bg-card shrink-0">
      {/* Header */}
      <div className="p-4 pb-3 border-b border-border">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <LayoutGrid size={16} className="text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground tracking-tight">OrgGraph</span>
        </div>
        <div className="relative mb-3">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search graphs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm bg-muted/50 border-0"
          />
        </div>
        <Button onClick={onCreateGraph} size="sm" className="w-full gap-1.5 h-8">
          <Plus size={14} />
          New Graph
        </Button>
      </div>

      {/* Graph list */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filtered.length === 0 && (
            <div className="text-center py-8 px-4">
              <LayoutGrid size={32} className="mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">
                {search ? 'No matching graphs' : 'No graphs yet'}
              </p>
              <p className="text-xs text-muted-foreground/60">
                {search ? 'Try a different search term' : 'Create one to get started'}
              </p>
            </div>
          )}
          {filtered.map(g => (
            <button
              key={g.id}
              onClick={() => onSelectGraph(g.id)}
              className={`w-full text-left rounded-lg p-3 transition-all group relative ${
                activeGraphId === g.id
                  ? 'bg-accent border border-primary/20 shadow-sm'
                  : 'hover:bg-muted/60 border border-transparent'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{g.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-medium text-muted-foreground bg-muted rounded px-1.5 py-0.5">
                      v{g.version}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(g.updatedAt), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] text-muted-foreground/60">
                      {g.nodes.length} nodes · {g.edges.length} edges
                    </span>
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                  <button
                    onClick={e => { e.stopPropagation(); onDeleteGraph(g.id); }}
                    className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>

      {/* Footer hint */}
      <div className="p-3 border-t border-border">
        <p className="text-[10px] text-muted-foreground/50 text-center">
          Press <kbd className="px-1 py-0.5 rounded border bg-muted text-[9px]">?</kbd> for shortcuts
        </p>
      </div>
    </div>
  );
}
