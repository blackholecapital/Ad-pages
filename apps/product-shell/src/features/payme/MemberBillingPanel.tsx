import { useState } from "react";
import { usePayMeCart } from "../../state/paymeCartState";

const MOCK_INVOICES = [
  { id: "INV-1001", due: "Due Feb 21", amount: "$1.11", amountNum: 1.11 },
  { id: "INV-1002", due: "Due Feb 24", amount: "$1.37", amountNum: 1.37 },
  { id: "INV-1003", due: "Due Feb 28", amount: "$1.88", amountNum: 1.88 },
  { id: "INV-1004", due: "Due Mar 02", amount: "$1.52", amountNum: 1.52 },
];

const REFERRAL_STATS = [
  { label: "Total Referrals", value: "3" },
  { label: "Active", value: "2" },
  { label: "Pending", value: "1" },
];

export function MemberBillingPanel() {
  const [selectedInv, setSelectedInv] = useState("INV-1001");
  const [paidIds, setPaidIds] = useState<Set<string>>(new Set());
  const [ticketTitle, setTicketTitle] = useState("");
  const [ticketDetails, setTicketDetails] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const { addItem } = usePayMeCart();
  const referralCode = "user1-x8k2m";

  function onCopy() {
    navigator.clipboard.writeText(referralCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  }

  function onPay(inv: (typeof MOCK_INVOICES)[number], e: React.MouseEvent) {
    e.stopPropagation();
    setPaidIds((prev) => new Set([...prev, inv.id]));
    addItem({
      id: `invoice-${inv.id}`,
      sku: inv.id,
      name: `Invoice ${inv.id}`,
      description: inv.due,
      setupPrice: inv.amountNum,
      qty: 1,
    });
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr 1fr", gap: 16, alignItems: "start" }}>

      {/* === Invoices === */}
      <div className="adminBlock">
        <div className="adminBlockTitle" style={{ textAlign: "center" }}>Invoices</div>
        <div className="adminBlockBody" style={{ padding: "8px 12px" }}>
          <div style={{ display: "grid", gap: 8 }}>
            {MOCK_INVOICES.map((inv) => {
              const isPaid = paidIds.has(inv.id);
              const isSelected = selectedInv === inv.id;
              return (
                <div
                  key={inv.id}
                  onClick={() => setSelectedInv(inv.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: `1px solid ${isSelected ? "#3B82F6" : "rgba(59,130,246,.14)"}`,
                    background: isSelected ? "rgba(59,130,246,.06)" : "transparent",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 13, color: "#1E293B" }}>{inv.id}</div>
                    <div style={{ fontSize: 11, color: "#64748B" }}>{inv.due}</div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#1E293B", marginRight: 4 }}>{inv.amount}</div>
                  <button
                    type="button"
                    className="primaryBtn"
                    onClick={(e) => onPay(inv, e)}
                    disabled={isPaid}
                    style={{ borderRadius: 8, minWidth: 44 }}
                  >
                    {isPaid ? "✓" : "Pay"}
                  </button>
                </div>
              );
            })}
          </div>
          <div style={{ textAlign: "center", paddingTop: 12 }}>
            <span style={{ fontSize: 12, color: "#3B82F6", fontWeight: 700 }}>Powered by PayMe</span>
          </div>
        </div>
      </div>

      {/* === Support Ticket === */}
      <div className="adminBlock">
        <div className="adminBlockTitle" style={{ textAlign: "center" }}>Open a Support Ticket</div>
        <div className="adminBlockBody" style={{ display: "grid", gap: 12 }}>
          <div>
            <label className="loginLabel" style={{ marginTop: 0 }}>Title</label>
            <input
              className="loginInput"
              placeholder="Billing or access issue"
              value={ticketTitle}
              onChange={(e) => setTicketTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="loginLabel">Details</label>
            <textarea
              className="loginInput"
              placeholder="Enter support ticket details..."
              rows={6}
              value={ticketDetails}
              onChange={(e) => setTicketDetails(e.target.value)}
              style={{ resize: "vertical", fontFamily: "inherit", fontSize: 12, lineHeight: 1.5 }}
            />
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
            <button type="button" className="adminBtn">+ Add File</button>
            <button type="button" className="primaryBtn">Create Support Ticket</button>
          </div>
        </div>
      </div>

      {/* === Right column: Referral Link + Customer Login === */}
      <div style={{ display: "grid", gap: 16 }}>

        {/* Referral Link */}
        <div className="adminBlock">
          <div className="adminBlockTitle" style={{ textAlign: "center" }}>Referral Link</div>
          <div className="adminBlockBody" style={{ display: "grid", gap: 12 }}>
            <div>
              <div className="loginLabel" style={{ marginTop: 0 }}>Your referral link</div>
              <div style={{ display: "flex", gap: 6 }}>
                <input
                  className="loginInput"
                  value={referralCode}
                  readOnly
                  style={{ flex: 1 }}
                />
                <button type="button" className="primaryBtn" onClick={onCopy} style={{ flexShrink: 0 }}>
                  {copied ? "✓" : "Copy"}
                </button>
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 13, color: "#3B82F6", marginBottom: 8 }}>
                Referral Analytics
              </div>
              {REFERRAL_STATS.map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "5px 0",
                    fontSize: 13,
                    color: "#475569",
                    borderBottom: "1px solid rgba(59,130,246,.08)",
                  }}
                >
                  <span>{stat.label}</span>
                  <span style={{ fontWeight: 800, color: "#3B82F6" }}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Customer Login */}
        <div className="adminBlock">
          <div className="adminBlockTitle" style={{ textAlign: "center" }}>Customer Login</div>
          <div className="adminBlockBody" style={{ display: "grid", gap: 10 }}>
            <div>
              <label className="loginLabel" style={{ marginTop: 0 }}>Username</label>
              <input
                className="loginInput"
                placeholder="username or email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="loginLabel">Password</label>
              <input
                className="loginInput"
                type="password"
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
              <button type="button" className="primaryBtn">Submit</button>
              <button type="button" className="adminBtn">Reset Password</button>
              <button type="button" className="adminBtn">Sign Up</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
