import { notFound } from 'next/navigation';
import Link from 'next/link';
import fs from 'node:fs/promises';
import path from 'node:path';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';
import tripIndex from '@/data/trips/_index.json';
import type { TripIndex } from '@/types';
import TripViewSwitcher from '@/components/TripViewSwitcher';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function formatMtime(d: Date): string {
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

const components: Components = {
  h1: ({ children }) => (
    <h1
      className="t-display"
      style={{
        fontSize: '28px',
        letterSpacing: '-0.025em',
        lineHeight: 1.1,
        fontWeight: 500,
        margin: '0 0 24px',
      }}
    >
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2
      className="t-display"
      style={{
        fontSize: '22px',
        letterSpacing: '-0.02em',
        lineHeight: 1.25,
        fontWeight: 500,
        margin: '32px 0 14px',
        paddingTop: '32px',
        borderTop: '0.5px solid var(--hair)',
      }}
    >
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3
      className="t-display"
      style={{
        fontSize: '17px',
        letterSpacing: '-0.015em',
        lineHeight: 1.3,
        fontWeight: 500,
        margin: '20px 0 8px',
      }}
    >
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p
      style={{
        fontSize: '16px',
        lineHeight: 1.55,
        margin: '0 0 16px',
        color: 'var(--ink)',
        letterSpacing: '-0.003em',
      }}
    >
      {children}
    </p>
  ),
  code: ({ children }) => (
    <code
      className="t-mono"
      style={{
        fontSize: '14px',
        background: 'transparent',
        border: 'none',
        padding: 0,
        color: 'inherit',
      }}
    >
      {children}
    </code>
  ),
  strong: ({ children }) => (
    <strong style={{ fontWeight: 500, fontStyle: 'normal' }}>{children}</strong>
  ),
  em: ({ children }) => <em style={{ fontStyle: 'italic' }}>{children}</em>,
  a: ({ href, children }) => (
    <a
      href={href}
      className="no-underline hover:underline"
      style={{ color: 'var(--ink)' }}
    >
      {children}
    </a>
  ),
  table: ({ children }) => (
    <div style={{ overflowX: 'auto', margin: '12px 0 20px' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: '0.5px solid var(--hair)',
        }}
      >
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => <thead>{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr>{children}</tr>,
  th: ({ children }) => (
    <th
      className="t-mono"
      style={{
        fontSize: '11px',
        textTransform: 'uppercase',
        letterSpacing: '0.10em',
        textAlign: 'left',
        padding: '8px 12px',
        borderBottom: '0.5px solid var(--hair)',
        background: 'var(--cream-soft)',
        color: 'var(--ink-soft)',
        fontWeight: 500,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td
      className="t-mono"
      style={{
        fontSize: '13px',
        padding: '8px 12px',
        borderBottom: '0.5px solid var(--hair)',
        verticalAlign: 'top',
        color: 'var(--ink)',
      }}
    >
      {children}
    </td>
  ),
  ul: ({ children }) => (
    <ul
      style={{
        paddingLeft: '16px',
        margin: '0 0 16px',
        lineHeight: 1.55,
        fontSize: '16px',
        color: 'var(--ink)',
      }}
    >
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol
      style={{
        paddingLeft: '20px',
        margin: '0 0 16px',
        lineHeight: 1.55,
        fontSize: '16px',
        color: 'var(--ink)',
      }}
    >
      {children}
    </ol>
  ),
  li: ({ children }) => <li style={{ marginBottom: '4px' }}>{children}</li>,
  hr: () => (
    <hr
      style={{
        border: 'none',
        borderTop: '0.5px solid var(--hair)',
        margin: '32px 0',
      }}
    />
  ),
};

export default async function OutlinePage({
  params,
}: {
  params: { slug: string };
}) {
  const slug = params.slug;
  const index = tripIndex as TripIndex;
  const entry = index.trips.find((t) => t.slug === slug);

  if (!entry || entry.view !== 'outline' || !entry.outlineMarkdown) {
    notFound();
  }

  const filePath = path.join(process.cwd(), 'data/trips', entry.outlineMarkdown);
  let markdown: string;
  let mtime: Date;
  try {
    markdown = await fs.readFile(filePath, 'utf8');
    const stat = await fs.stat(filePath);
    mtime = stat.mtime;
  } catch {
    notFound();
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--cream)',
      }}
    >
      <div
        style={{
          maxWidth: '640px',
          margin: '0 auto',
          padding: '24px 24px 60px',
        }}
      >
        <Link
          href="/"
          className="t-mono"
          style={{
            fontSize: '11px',
            color: 'var(--ink)',
            textTransform: 'uppercase',
            letterSpacing: '0.10em',
            textDecoration: 'none',
            display: 'inline-block',
            marginBottom: '12px',
          }}
        >
          ← All trips
        </Link>

        <TripViewSwitcher tripSlug={slug} currentView="outline" />

        <article>
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
            {markdown}
          </ReactMarkdown>
        </article>

        {entry.secondaryViews?.includes('reservations') && (
          <p
            style={{
              marginTop: '24px',
              marginBottom: '0',
            }}
          >
            <Link
              href={`/trips/${slug}/reservations`}
              className="t-mono no-underline hover:underline"
              style={{
                fontSize: '11px',
                color: 'var(--ink-soft)',
                textTransform: 'uppercase',
                letterSpacing: '0.10em',
              }}
            >
              → Live reservations status
            </Link>
          </p>
        )}

        <p
          className="t-mono"
          style={{
            fontSize: '10px',
            color: 'var(--ink-soft)',
            textTransform: 'uppercase',
            letterSpacing: '0.10em',
            marginTop: '48px',
            paddingTop: '20px',
            borderTop: '0.5px solid var(--hair)',
          }}
        >
          Last edited · {formatMtime(mtime)}
        </p>
      </div>
    </main>
  );
}
