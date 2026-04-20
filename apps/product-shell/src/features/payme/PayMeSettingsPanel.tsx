import { useState } from "react";

type PaymentMethod = { id: string; label: string; enabled: boolean; description: string };

const SEED_METHODS: PaymentMethod[] = [
  { id: "card", label: "Card (Stripe)", enabled: true, description: "Visa, Mastercard, Amex via Stripe" },
  { id: "usdc", label: "USDC on Base", enabled: true, description: "On-chain USDC settlement, 1% fee" },
  { id: "apple_pay", label: "Apple Pay", enabled: true, description: "Express checkout on supported devices" },
  { id: "google_pay", label: "Google Pay", enabled: false, description: "Express checkout on supported devices" },
];

export function PayMeSettingsPanel() {
  const [receivingAddress, setReceivingAddress] = useState(() =>
    (typeof localStorage !== "undefined" ? localStorage.getItem("gateway_usdc_receiving_address") ?? "" : "")
  );
  const [methods, setMethods] = useState<PaymentMethod[]>(SEED_METHODS);
  const [brandColor, setBrandColor] = useState("#3B82F6");
  const [brandLogo, setBrandLogo] = useState("");
  const [emailReceipt, setEmailReceipt] = useState(true);
  const [dunning, setDunning] = useState(true);
  const [saved, setSaved] = useState(false);

  function toggleMethod(id: string) {
    setMethods((prev) => prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m)));
  }

  function save() {
    try {
      localStorage.setItem("gateway_usdc_receiving_address", receivingAddress);
    } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  return (
    <div className="paymeSubGrid">
      <div className="adminBlock">
        <div className="adminBlockTitle">USDC Receiving</div>
        <div className="adminBlockBody">
          <div className="paymeLabel">Base-network USDC address</div>
          <input
            className="adminTextInput"
            value={receivingAddress}
            onChange={(e) => setReceivingAddress(e.target.value)}
            placeholder="0x…"
          />
          <div className="paymeLabel" style={{ marginTop: 12 }}>Stripe account</div>
          <input
            className="adminTextInput"
            placeholder="acct_live_… (configure in env)"
            defaultValue=""
            readOnly
          />
          <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
            <button type="button" className="adminBtn primary" onClick={save}>
              {saved ? "Saved!" : "Save payout settings"}
            </button>
          </div>
        </div>
      </div>

      <div className="adminBlock">
        <div className="adminBlockTitle">Branding</div>
        <div className="adminBlockBody">
          <div className="paymeFormGrid">
            <label>
              <span className="paymeLabel">Brand color</span>
              <input className="adminTextInput" type="color" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} />
            </label>
            <label style={{ gridColumn: "span 2" }}>
              <span className="paymeLabel">Logo URL</span>
              <input className="adminTextInput" value={brandLogo} onChange={(e) => setBrandLogo(e.target.value)} placeholder="https://…" />
            </label>
          </div>
        </div>
      </div>

      <div className="adminBlock">
        <div className="adminBlockTitle">Payment Methods</div>
        <div className="adminBlockBody">
          <div className="paymeMethodsList">
            {methods.map((m) => (
              <div key={m.id} className="paymeMethodRow">
                <div>
                  <div style={{ fontWeight: 800 }}>{m.label}</div>
                  <div style={{ fontSize: 12, color: "#64748B" }}>{m.description}</div>
                </div>
                <label className="paymeSwitch">
                  <input type="checkbox" checked={m.enabled} onChange={() => toggleMethod(m.id)} />
                  <span>{m.enabled ? "On" : "Off"}</span>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="adminBlock">
        <div className="adminBlockTitle">Notifications &amp; Dunning</div>
        <div className="adminBlockBody">
          <label className="paymeCheckbox">
            <input type="checkbox" checked={emailReceipt} onChange={(e) => setEmailReceipt(e.target.checked)} />
            <span>Email a receipt after every successful charge</span>
          </label>
          <label className="paymeCheckbox" style={{ marginTop: 8 }}>
            <input type="checkbox" checked={dunning} onChange={(e) => setDunning(e.target.checked)} />
            <span>Auto-retry failed recurring charges (dunning)</span>
          </label>
        </div>
      </div>
    </div>
  );
}
