/** Small form primitives shared by the admin dashboard screens. */

export function Text({ label, value, onChange, placeholder, className = "" }: { label?: string; value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  return (
    <label className={`block ${className}`}>
      {label && <span className="eyebrow mb-1.5 block">{label}</span>}
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-border/60 bg-transparent px-3 py-2.5 text-sm text-cream placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none" />
    </label>
  );
}

export function TextArea({ label, value, onChange, rows = 4, placeholder, className = "" }: { label?: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string; className?: string }) {
  return (
    <label className={`block ${className}`}>
      {label && <span className="eyebrow mb-1.5 block">{label}</span>}
      <textarea value={value} rows={rows} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-border/60 bg-transparent px-3 py-2.5 text-sm leading-relaxed text-cream placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none" />
    </label>
  );
}

export function Num({ label, value, onChange, placeholder }: { label?: string; value: number | null; onChange: (v: number | null) => void; placeholder?: string }) {
  return (
    <label className="block">
      {label && <span className="eyebrow mb-1.5 block">{label}</span>}
      <input type="number" min={0} value={value ?? ""} placeholder={placeholder} onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))} className="w-full rounded-xl border border-border/60 bg-transparent px-3 py-2.5 text-sm text-cream focus:border-primary focus:outline-none" />
    </label>
  );
}

export function Select({ label, value, onChange, options }: { label?: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <label className="block">
      {label && <span className="eyebrow mb-1.5 block">{label}</span>}
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-border/60 bg-card px-3 py-2.5 text-sm text-cream focus:border-primary focus:outline-none">
        {options.map(([v, l]) => (
          <option key={v} value={v} className="bg-card">{l}</option>
        ))}
      </select>
    </label>
  );
}

export function DateTime({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="eyebrow mb-1.5 block">{label}</span>
      <input type="datetime-local" value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-border/60 bg-transparent px-3 py-2.5 text-sm text-cream focus:border-primary focus:outline-none" />
    </label>
  );
}

export function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-cream/85">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-primary" />
      {label}
    </label>
  );
}
