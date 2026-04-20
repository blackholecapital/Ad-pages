type GateStatusPillProps = {
  connected: boolean;
  signed: boolean;
  bypassEnabled: boolean;
};

export function GateStatusPill({ connected, signed, bypassEnabled }: GateStatusPillProps) {
  const label = bypassEnabled
    ? "Demo bypass enabled"
    : signed
      ? "Access verified"
      : connected
        ? "Wallet connected"
        : "Wallet required";

  return (
    <span className="card" style={{ display: "inline-flex", alignItems: "center", padding: "6px 10px" }}>
      {label}
    </span>
  );
}
