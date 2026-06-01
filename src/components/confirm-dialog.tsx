import { useState } from "react";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
  destructive = true,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-desc"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-card border border-border p-6 shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4 mb-4">
          <div className={`inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${destructive ? "bg-highlight/15" : "bg-accent/15"}`}>
            <AlertTriangle className={`h-5 w-5 ${destructive ? "text-highlight" : "text-accent"}`} />
          </div>
          <div>
            <h3 id="confirm-title" className="font-bold text-base">{title}</h3>
            <p id="confirm-desc" className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="rounded-md glass px-4 py-2 text-sm hover:bg-card"
          >
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(); }}
            className={`rounded-md px-4 py-2 text-sm font-semibold ${
              destructive
                ? "bg-highlight text-white hover:bg-highlight/90"
                : "bg-accent-gradient text-accent-foreground shadow-glow"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Convenience hook for managing confirm dialog state */
export function useConfirm() {
  const [state, setState] = useState<{ open: boolean; title: string; description: string; onConfirm: () => void }>({
    open: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  const confirm = (title: string, description: string, onConfirm: () => void) => {
    setState({ open: true, title, description, onConfirm });
  };

  const close = () => setState((s) => ({ ...s, open: false }));

  return { confirmState: state, confirm, close };
}
