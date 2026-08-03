import { Label } from "@/components/ui/label";

export function Field({ id, label, hint, error, required, children }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required ? <span className="ml-1 text-destructive">*</span> : null}
      </Label>
      {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
      {children}
      {error ? (
        <p className="border-l-4 border-destructive bg-secondary px-3 py-2 text-sm font-medium">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function FormError({ message }) {
  if (!message) return null;
  return (
    <p className="border-2 border-destructive bg-destructive/15 px-4 py-3 text-base font-medium">
      {message}
    </p>
  );
}

export function NativeSelect({ id, value, onChange, children, disabled }) {
  return (
    <select
      id={id}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className="flex h-10 w-full rounded-none border-2 border-input bg-card px-3 py-2 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </select>
  );
}