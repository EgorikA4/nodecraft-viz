import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const shortcuts = [
  { keys: ['⌘', 'K'], description: 'Search nodes' },
  { keys: ['⌘', 'S'], description: 'Save graph' },
  { keys: ['⌘', 'Z'], description: 'Undo' },
  { keys: ['⌘', '⇧', 'Z'], description: 'Redo' },
  { keys: ['⌘', 'E'], description: 'Export graph' },
  { keys: ['⌘', 'I'], description: 'Import graph' },
  { keys: ['Del'], description: 'Delete selected' },
  { keys: ['Esc'], description: 'Deselect' },
  { keys: ['?'], description: 'Show shortcuts' },
];

export function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-1 mt-2">
          {shortcuts.map((s, i) => (
            <div key={i} className="flex items-center justify-between py-1.5 px-1">
              <span className="text-sm text-foreground">{s.description}</span>
              <div className="flex items-center gap-1">
                {s.keys.map((k, j) => (
                  <kbd key={j} className="min-w-[24px] h-6 flex items-center justify-center rounded-md border bg-muted text-[11px] font-medium text-muted-foreground px-1.5">
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
