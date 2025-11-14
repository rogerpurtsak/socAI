import { useToast } from "@/hooks/use-toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="glass glass-hover p-4 rounded-lg min-w-[300px] animate-fade-in"
        >
          <h4 className="font-semibold mb-1">{toast.title}</h4>
          {toast.description && (
            <p className="text-sm text-muted-foreground">{toast.description}</p>
          )}
        </div>
      ))}
    </div>
  );
}
