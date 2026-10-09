'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { company } from '@/lib/site';
import { forms, type FormKind } from '@/lib/forms';

// Posts to company.formEndpoint when it is set. Until then it opens the visitor's
// email app with the message written out, addressed to company.email.
export function ContactForm({ kind, context }: { kind: FormKind; context?: string }) {
  const cfg = forms[kind];
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'mailto' | 'error'>('idle');

  // Prefill from ?product= or ?service= in the link that brought the visitor here.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const f = formRef.current;
    if (!f) return;
    for (const key of ['product', 'service', 'type', 'topic']) {
      const v = q.get(key);
      const el = f.elements.namedItem(key) as HTMLSelectElement | null;
      if (v && el && el.tagName === 'SELECT') {
        const match = Array.from(el.options).find((o) => o.value.toLowerCase().startsWith(v.toLowerCase()));
        if (match) el.value = match.value;
      }
    }
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const subject = `${cfg.subject}${context ? `: ${context}` : ''} from ${data.get('name') || 'website visitor'}`;
    if (company.formEndpoint) {
      setState('sending');
      try {
        data.append('_subject', subject);
        const res = await fetch(company.formEndpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
        setState(res.ok ? 'sent' : 'error');
      } catch {
        setState('error');
      }
      return;
    }
    const body = cfg.fields
      .map((f) => {
        const v = String(data.get(f.name) || '').trim();
        return v ? `${f.label}: ${f.type === 'textarea' ? '\n' + v : v}` : '';
      })
      .filter(Boolean)
      .join('\n\n');
    window.location.href = `mailto:${company.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setState('mailto');
  }

  if (state === 'sent') {
    return (
      <div className="form__done" role="status">
        <h3 className="h3">Message sent</h3>
        <p className="muted">Thank you. Someone from UElement will reply to the email address you gave.</p>
      </div>
    );
  }

  return (
    <form ref={formRef} className="form" onSubmit={onSubmit} noValidate={false}>
      <div className="form__row">
        {cfg.fields.map((f) => {
          const id = `${uid}-${f.name}`;
          const hintId = f.hint ? `${id}-hint` : undefined;
          return (
            <div className="field" key={f.name} style={f.wide || f.type === 'textarea' ? { gridColumn: '1 / -1' } : undefined}>
              <label htmlFor={id}>
                {f.label}
                {f.required ? <span aria-hidden="true" className="gold"> *</span> : null}
              </label>
              {f.type === 'textarea' ? (
                <textarea id={id} name={f.name} className="input" required={f.required} aria-describedby={hintId} />
              ) : f.type === 'select' ? (
                <select id={id} name={f.name} className="input" required={f.required} aria-describedby={hintId} defaultValue="">
                  <option value="" disabled>
                    Choose one
                  </option>
                  {f.options?.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ) : (
                <input id={id} name={f.name} type={f.type} className="input" required={f.required} autoComplete={f.autoComplete} aria-describedby={hintId} />
              )}
              {f.hint ? (
                <span id={hintId} className="hint">
                  {f.hint}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
      <div className="actions" style={{ justifyContent: 'space-between', marginTop: 4 }}>
        <p className="form__note">
          {state === 'mailto'
            ? 'Your email app should now be open with the message written out. Send it from there.'
            : state === 'error'
              ? `The message did not send. Try again, or write to ${company.email}.`
              : `Fields marked * are required. We use your details only to reply.`}
        </p>
        <button className="btn btn--ink" type="submit" disabled={state === 'sending'}>
          {state === 'sending' ? 'Sending' : cfg.submit}
        </button>
      </div>
    </form>
  );
}
