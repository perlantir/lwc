import Link from 'next/link';

interface Crumb {
  label: string;
  href?: string;
}
interface Props {
  eyebrow?: string;
  title: string;
  body?: string;
  crumbs?: Crumb[];
}

export const PageBanner = ({ eyebrow, title, body, crumbs }: Props) => (
  <section className="page-banner">
    <div className="inner">
      {crumbs && crumbs.length > 0 && (
        <nav className="crumbs" aria-label="Breadcrumb">
          {crumbs.map((c, i) => (
            <span key={`${c.label}-${i}`}>
              {c.href ? <Link href={c.href}>{c.label}</Link> : <span>{c.label}</span>}
              {i < crumbs.length - 1 && <span className="sep">/</span>}
            </span>
          ))}
        </nav>
      )}
      {eyebrow && <div className="eyebrow">{eyebrow}</div>}
      <h1>{title}</h1>
      {body && <p>{body}</p>}
    </div>
  </section>
);
