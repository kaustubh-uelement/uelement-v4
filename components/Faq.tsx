import { Icon } from './Icon';

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="faq">
      {items.map((f) => (
        <details className="paper-card" key={f.q}>
          <summary>
            {f.q}
            <Icon name="plus" />
          </summary>
          <p className="faq__a">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
