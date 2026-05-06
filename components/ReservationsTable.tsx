import type {
  Reservation,
  ReservationBackup,
  ReservationsData,
} from '@/types';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function formatShortDate(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return iso;
  return `${MONTH_NAMES[parseInt(m[2], 10) - 1]} ${parseInt(m[3], 10)}`;
}

function formatUpdatedUpper(iso: string): string {
  return formatShortDate(iso).toUpperCase();
}

const STYLES = `
.res-section { margin-top: 36px; padding-top: 32px; border-top: 0.5px solid var(--hair); }
.res-section:first-of-type { margin-top: 18px; padding-top: 0; border-top: none; }
.res-section-title { font-size: 11px; text-transform: uppercase; letter-spacing: 0.10em; color: var(--ink-soft); margin: 0 0 14px; font-weight: 500; }

.res-row { padding: 14px 0; border-bottom: 0.5px solid var(--hair); }
.res-row:last-child { border-bottom: none; }
.res-what { font-weight: 500; font-size: 15px; letter-spacing: -0.01em; margin: 0; color: var(--ink); }
.res-meta { font-size: 12px; color: var(--ink-soft); margin: 3px 0 0; line-height: 1.55; }
.res-note { font-size: 13px; color: var(--ink-mid); line-height: 1.45; margin: 5px 0 0; letter-spacing: -0.003em; }
.res-note-contact { font-size: 12px; color: var(--ink-soft); }

.res-row-mobile { display: block; }
.res-row-desktop { display: none; }

@media (min-width: 768px) {
  .res-row { padding: 8px 0; border-bottom: none; }
  .res-section { padding-top: 28px; margin-top: 32px; }
  .res-row-mobile { display: none; }
  .res-row-desktop { display: grid; gap: 18px; align-items: baseline; }
  .res-row-desktop .res-meta { margin-top: 0; }
  .res-row-desktop .res-note { margin-top: 0; }
}
`;

const COL_TEMPLATES: Record<string, string> = {
  locked: '4fr 3fr 5fr',
  inMotion: '3fr 3fr 2fr 4fr',
  toSend: '3fr 3fr 2fr 4fr',
  backup: '5fr 7fr',
};

type Cell = { value: string };

function Row({
  what,
  cells,
  note,
  variant,
}: {
  what: string;
  cells: Cell[];
  note?: React.ReactNode;
  variant: keyof typeof COL_TEMPLATES;
}) {
  const metaJoined = cells.map((c) => c.value).join(' · ');
  return (
    <div className="res-row">
      <div className="res-row-mobile">
        <p className="res-what">{what}</p>
        {metaJoined && <p className="res-meta t-mono">{metaJoined}</p>}
        {note && <p className="res-note">{note}</p>}
      </div>
      <div
        className="res-row-desktop"
        style={{ gridTemplateColumns: COL_TEMPLATES[variant] }}
      >
        <div>
          <p className="res-what">{what}</p>
        </div>
        {cells.map((c, i) => (
          <div key={i}>
            <p className="res-meta t-mono">{c.value}</p>
          </div>
        ))}
        <div>{note ? <p className="res-note">{note}</p> : null}</div>
      </div>
    </div>
  );
}

function NoteWithContact({
  note,
  contact,
}: {
  note?: string | null;
  contact?: string | null;
}) {
  if (!note && !contact) return null;
  return (
    <>
      {note}
      {note && contact && ' '}
      {contact && <span className="t-mono res-note-contact">{contact}</span>}
    </>
  );
}

function LockedRow({ res }: { res: Reservation }) {
  return (
    <Row
      variant="locked"
      what={res.what}
      cells={[{ value: res.tripDate }]}
      note={res.note}
    />
  );
}

function InMotionRow({ res }: { res: Reservation }) {
  const cells: Cell[] = [
    { value: res.tripDate },
    {
      value: res.sentDate
        ? `Sent ${formatShortDate(res.sentDate)}`
        : '—',
    },
  ];
  return (
    <Row
      variant="inMotion"
      what={res.what}
      cells={cells}
      note={<NoteWithContact note={res.note} contact={res.contact} />}
    />
  );
}

function ToSendRow({ res }: { res: Reservation }) {
  const cells: Cell[] = [
    { value: res.tripDate },
    { value: res.deadline ? `By ${res.deadline}` : '—' },
  ];
  return (
    <Row
      variant="toSend"
      what={res.what}
      cells={cells}
      note={<NoteWithContact note={res.note} contact={res.contact} />}
    />
  );
}

function BackupRow({ b }: { b: ReservationBackup }) {
  return (
    <div className="res-row">
      <div className="res-row-mobile">
        <p className="res-what">If: {b.ifDeclined}</p>
        <p className="res-note">→ {b.tryInstead}</p>
      </div>
      <div
        className="res-row-desktop"
        style={{ gridTemplateColumns: COL_TEMPLATES.backup }}
      >
        <div>
          <p className="res-what">{b.ifDeclined}</p>
        </div>
        <div>
          <p className="res-note">{b.tryInstead}</p>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="res-section">
      <p className="res-section-title t-mono">{title}</p>
      <div>{children}</div>
    </section>
  );
}

export default function ReservationsTable({
  data,
}: {
  data: ReservationsData;
}) {
  const locked = data.reservations.filter((r) => r.status === 'locked');
  const inMotion = data.reservations.filter((r) => r.status === 'in-motion');
  const toSend = data.reservations.filter((r) => r.status === 'to-send');
  const thisWeek = toSend.filter((r) => r.urgency === 'this-week');
  const twoWeeks = toSend.filter((r) => r.urgency === 'two-weeks');
  const lateMay = toSend.filter((r) => r.urgency === 'late-may');

  const total = data.reservations.length;
  const countsStrip = [
    `${total} TOTAL`,
    `${locked.length} LOCKED`,
    `${inMotion.length} IN MOTION`,
    `${toSend.length} TO SEND`,
    `UPDATED ${formatUpdatedUpper(data.lastUpdated)}`,
  ].join(' · ');

  return (
    <>
      <style>{STYLES}</style>

      {/* Page header */}
      <header
        style={{
          paddingBottom: '20px',
          borderBottom: '0.5px solid var(--hair)',
          marginBottom: '4px',
        }}
      >
        <h1
          className="t-display"
          style={{
            fontSize: '28px',
            letterSpacing: '-0.025em',
            lineHeight: 1.1,
            fontWeight: 500,
            margin: '0 0 8px',
          }}
        >
          {data.title}
        </h1>
        <p
          className="t-mono"
          style={{
            fontSize: '12px',
            color: 'var(--ink-soft)',
            margin: '0 0 16px',
          }}
        >
          {data.subtitle}
        </p>
        <p
          style={{
            fontSize: '14px',
            color: 'var(--ink-mid)',
            lineHeight: 1.55,
            margin: '0 0 18px',
            maxWidth: '60ch',
          }}
        >
          {data.intro}
        </p>
        <p
          className="t-mono"
          style={{
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.10em',
            color: 'var(--ink-soft)',
            margin: 0,
          }}
        >
          {countsStrip}
        </p>
      </header>

      <Section title={`Locked · ${locked.length}`}>
        {locked.map((r) => (
          <LockedRow key={r.id} res={r} />
        ))}
      </Section>

      <Section
        title={`In motion · ${inMotion.length} — sent, awaiting reply`}
      >
        {inMotion.map((r) => (
          <InMotionRow key={r.id} res={r} />
        ))}
      </Section>

      <Section title={`To send · this week · ${thisWeek.length}`}>
        {thisWeek.map((r) => (
          <ToSendRow key={r.id} res={r} />
        ))}
      </Section>

      <Section
        title={`To send · within two weeks · ${twoWeeks.length}`}
      >
        {twoWeeks.map((r) => (
          <ToSendRow key={r.id} res={r} />
        ))}
      </Section>

      <Section
        title={`To send · late May / early June · ${lateMay.length}`}
      >
        {lateMay.map((r) => (
          <ToSendRow key={r.id} res={r} />
        ))}
      </Section>

      <Section title="Backup options · if primary declines">
        {data.backups.map((b, i) => (
          <BackupRow key={i} b={b} />
        ))}
      </Section>
    </>
  );
}
