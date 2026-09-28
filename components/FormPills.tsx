import type { FormResult } from '@/lib/rankings';

export function FormPills({ form }: { form: FormResult[] }) {
  if (!form.length) return <span className="muted">—</span>;
  return (
    <span className="form-pills">
      {form.map((r, i) => (
        <span key={i} className={`form-pill form-${r}`}>
          {r}
        </span>
      ))}
    </span>
  );
}
