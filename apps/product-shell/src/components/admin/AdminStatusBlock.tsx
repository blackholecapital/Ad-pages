type AdminStatusBlockProps = {
  title: string;
  value: string;
  note?: string;
};

export function AdminStatusBlock({ title, value, note }: AdminStatusBlockProps) {
  return (
    <article className="card" style={{ minWidth: 220 }}>
      <div style={{ fontSize: 12, opacity: 0.72 }}>{title}</div>
      <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>{value}</div>
      {note ? <div style={{ fontSize: 12, opacity: 0.66, marginTop: 6 }}>{note}</div> : null}
    </article>
  );
}
