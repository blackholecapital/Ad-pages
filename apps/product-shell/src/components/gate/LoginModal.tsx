import type { ReactNode } from "react";

type LoginModalProps = {
  title: string;
  children: ReactNode;
};

export function LoginModal({ title, children }: LoginModalProps) {
  return (
    <section className="card" style={{ maxWidth: 640, margin: "24px auto", display: "grid", gap: 12 }}>
      <h2 className="sectionTitle" style={{ margin: 0 }}>{title}</h2>
      {children}
    </section>
  );
}
