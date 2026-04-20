export type PayMeAdminCardProps = {
  title: string;
  value: string;
  helper?: string;
};

export function PayMeAdminCard({ title, value, helper }: PayMeAdminCardProps) {
  return (
    <article className="card" style={{ minWidth: 220 }}>
      <p style={{ margin: 0, opacity: 0.7, fontSize: 12 }}>{title}</p>
      <p style={{ margin: "6px 0 0", fontSize: 20, fontWeight: 700 }}>{value}</p>
      {helper ? <p style={{ margin: "6px 0 0", opacity: 0.65, fontSize: 12 }}>{helper}</p> : null}
    </article>
  );
}
