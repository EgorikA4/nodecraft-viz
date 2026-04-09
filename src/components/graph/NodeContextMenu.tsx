import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Copy, Trash2, Focus, Link, Info } from 'lucide-react';

interface NodeContextMenuProps {
  children: React.ReactNode;
  onDuplicate: () => void;
  onDelete: () => void;
  onFocus: () => void;
  onInspect: () => void;
  onAddEdgeFrom: () => void;
}

export function NodeContextMenu({ children, onDuplicate, onDelete, onFocus, onInspect, onAddEdgeFrom }: NodeContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={onInspect} className="gap-2">
          <Info size={14} /> Просмотреть вершину
        </ContextMenuItem>
        <ContextMenuItem onClick={onFocus} className="gap-2">
          <Focus size={14} /> Центрировать на вершине
        </ContextMenuItem>
        <ContextMenuItem onClick={onAddEdgeFrom} className="gap-2">
          <Link size={14} /> Добавить связь из вершины
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onDuplicate} className="gap-2">
          <Copy size={14} /> Дублировать вершину
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onDelete} className="gap-2 text-destructive focus:text-destructive">
          <Trash2 size={14} /> Удалить вершину
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
