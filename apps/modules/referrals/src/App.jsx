import React, { useEffect, useState } from "react";

// ─── URL helpers ─────────────────────────────────────────────────────────────

function getUrlParam(key) {
  try { return new URLSearchParams(window.location.search).get(key); } catch { return null; }
}

const VALID_TABS = ["dashboard", "referrals", "add"];
const EMBEDDED = getUrlParam("tab") !== null;

// ─── localStorage helpers ─────────────────────────────────────────────────────

const REFERRALS_KEY = "referrals_v1";
const CONFIG_KEY    = "referrals_config_v1";

function loadReferrals() {
  try { return JSON.parse(localStorage.getItem(REFERRALS_KEY) || "[]"); } catch { return []; }
}
function saveReferrals(arr) {
  try { localStorage.setItem(REFERRALS_KEY, JSON.stringify(arr.slice(0, 500))); } catch {}
}
function loadConfig() {
  try { return JSON.parse(localStorage.getItem(CONFIG_KEY) || "{}"); } catch { return {}; }
}
function saveConfig(cfg) {
  try { localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg)); } catch {}
}

// ─── micro styles ─────────────────────────────────────────────────────────────

const tabBtn = (active) => ({
  background: active ? "#2563eb" : "#fff",
  color: active ? "#fff" : "#2563eb",
  border: active ? "none" : "1.5px solid #2563eb",
  fontWeight: 700,
  fontSize: 13,
  padding: "7px 16px",
  borderRadius: 20,
  cursor: "pointer",
  whiteSpace: "nowrap",
  transition: "all .15s",
});

const cardStyle = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 16,
  padding: 24,
  boxShadow: "0 2px 14px rgba(10,37,64,.05)",
};

const inputCss = {
  width: "100%",
  padding: "8px 11px",
  border: "1px solid #d1d5db",
  borderRadius: 8,
  fontSize: 14,
  background: "#f9fafb",
  outline: "none",
  boxSizing: "border-box",
};

const lblCss = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "#374151",
  marginBottom: 5,
};

const primaryBtn = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  fontWeight: 700,
  fontSize: 13,
  padding: "9px 22px",
  borderRadius: 8,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const ghostBtn = {
  background: "transparent",
  color: "#6b7280",
  border: "1px solid #d1d5db",
  fontWeight: 600,
  fontSize: 13,
  padding: "9px 22px",
  borderRadius: 8,
  cursor: "pointer",
};

const TABS = [
  { key: "dashboard", label: "Dashboard" },
  { key: "referrals", label: "My Referrals" },
  { key: "add",       label: "Add Referral" },
];

const STATUSES = ["Pending", "Signed Up", "Converted", "Paid Out"];

// ─── shared ───────────────────────────────────────────────────────────────────

function Field({ label, value, onChange, placeholder, type = "text", multiline }) {
  return (
    <div>
      <label style={lblCss}>{label}</label>
      {multiline ? (
        <textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ ...inputCss, minHeight: 72, resize: "vertical" }}
        />
      ) : (
        <input
          type={type}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={inputCss}
        />
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    "Pending":    { bg: "#fef3c7", color: "#92400e" },
    "Signed Up":  { bg: "#dbeafe", color: "#1d4ed8" },
    "Converted":  { bg: "#d1fae5", color: "#065f46" },
    "Paid Out":   { bg: "#ede9fe", color: "#5b21b6" },
  };
  const c = colors[status] || { bg: "#f3f4f6", color: "#374151" };
  return (
    <span style={{ ...c, fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20 }}>
      {status}
    </span>
  );
}

// ─── Dashboard tab ────────────────────────────────────────────────────────────

function DashboardTab({ referrals, config, onConfigChange }) {
  const [copied, setCopied] = useState(false);

  const total     = referrals.length;
  const signedUp  = referrals.filter((r) => r.status === "Signed Up" || r.status === "Converted" || r.status === "Paid Out").length;
  const converted = referrals.filter((r) => r.status === "Converted" || r.status === "Paid Out").length;
  const paidOut   = referrals.filter((r) => r.status === "Paid Out").length;

  const refLink = config.refLink || "";

  function handleCopy() {
    if (!refLink) return;
    navigator.clipboard.writeText(refLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {[
          { label: "Total Referred",  value: total,     color: "#2563eb" },
          { label: "Signed Up",       value: signedUp,  color: "#0891b2" },
          { label: "Converted",       value: converted, color: "#16a34a" },
          { label: "Paid Out",        value: paidOut,   color: "#7c3aed" },
        ].map((s) => (
          <div key={s.label} style={{ ...cardStyle, padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2, fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Referral link card */}
      <div style={cardStyle}>
        <h3 style={{ color: "#2563eb", margin: "0 0 4px", fontSize: 16, fontWeight: 800 }}>Your Referral Link</h3>
        <p style={{ margin: "0 0 14px", fontSize: 13, color: "#6b7280" }}>Share this link to earn rewards when new members join.</p>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <input
            type="text"
            value={refLink}
            onChange={(e) => { const c = { ...config, refLink: e.target.value }; saveConfig(c); onConfigChange(c); }}
            placeholder="https://your-referral-link.com/?ref=yourcode"
            style={{ ...inputCss, flex: "1 1 280px" }}
          />
          <button type="button" style={primaryBtn} onClick={handleCopy} disabled={!refLink}>
            {copied ? "Copied!" : "Copy Link"}
          </button>
        </div>
      </div>

      {/* Reward config */}
      <div style={cardStyle}>
        <h3 style={{ color: "#2563eb", margin: "0 0 14px", fontSize: 16, fontWeight: 800 }}>Reward Settings</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Field
            label="Reward per Conversion"
            value={config.rewardPerConversion || ""}
            onChange={(v) => { const c = { ...config, rewardPerConversion: v }; saveConfig(c); onConfigChange(c); }}
            placeholder="e.g. $10 USDC"
          />
          <Field
            label="Payout Threshold"
            value={config.payoutThreshold || ""}
            onChange={(v) => { const c = { ...config, payoutThreshold: v }; saveConfig(c); onConfigChange(c); }}
            placeholder="e.g. $50"
          />
          <div style={{ gridColumn: "1 / -1" }}>
            <Field
              label="Notes / Program Details"
              value={config.programNotes || ""}
              onChange={(v) => { const c = { ...config, programNotes: v }; saveConfig(c); onConfigChange(c); }}
              placeholder="Describe the referral program terms…"
              multiline
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Referrals list tab ────────────────────────────────────────────────────────

function ReferralsTab({ referrals, onEdit, onDelete, onStatusChange }) {
  if (!referrals.length) {
    return (
      <div style={{ ...cardStyle, textAlign: "center", padding: 48, color: "#9ca3af" }}>
        No referrals yet. Use <strong>Add Referral</strong> to track your first referral.
      </div>
    );
  }
  return (
    <div style={cardStyle}>
      <h3 style={{ color: "#2563eb", margin: "0 0 16px", fontSize: 18, fontWeight: 800 }}>My Referrals</h3>
      <div style={{ display: "grid", gap: 10 }}>
        {referrals.map((r) => (
          <div
            key={r.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              background: "#f9fafb",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>
                {r.name || r.email || "(No name)"}
              </div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>
                {r.email || ""}
                {r.phone ? ` · ${r.phone}` : ""}
              </div>
              {r.referredAt && (
                <div style={{ fontSize: 11, color: "#9ca3af" }}>
                  Referred {new Date(r.referredAt).toLocaleDateString()}
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <select
                value={r.status || "Pending"}
                onChange={(e) => onStatusChange(r.id, e.target.value)}
                style={{ ...inputCss, width: "auto", padding: "5px 8px", fontSize: 12 }}
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <StatusBadge status={r.status || "Pending"} />
              <button type="button" onClick={() => onEdit(r)} style={{ ...tabBtn(false), borderRadius: 8, fontSize: 12 }}>
                Edit
              </button>
              <button
                type="button"
                onClick={() => onDelete(r.id)}
                style={{ background: "transparent", color: "#ef4444", border: "1px solid #fca5a5", fontWeight: 600, fontSize: 12, padding: "5px 12px", borderRadius: 8, cursor: "pointer" }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Add Referral tab ─────────────────────────────────────────────────────────

const EMPTY_REF = { name: "", email: "", phone: "", notes: "", status: "Pending" };

function AddReferralTab({ draft, onChange, onSave, onClear, message, editingId }) {
  return (
    <div style={cardStyle}>
      <h3 style={{ color: "#2563eb", margin: "0 0 4px", fontSize: 18, fontWeight: 800 }}>
        {editingId ? "Edit Referral" : "Add Referral"}
      </h3>
      <p style={{ margin: "0 0 18px", fontSize: 13, color: "#6b7280" }}>
        Enter details for the person you referred.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field label="Name"  value={draft.name}  onChange={(v) => onChange({ ...draft, name: v })}  placeholder="Full name" />
        <Field label="Email" value={draft.email} onChange={(v) => onChange({ ...draft, email: v })} placeholder="email@example.com" type="email" />
        <Field label="Phone" value={draft.phone} onChange={(v) => onChange({ ...draft, phone: v })} placeholder="+1 (555) 000-0000" />
        <div>
          <label style={lblCss}>Status</label>
          <select
            value={draft.status || "Pending"}
            onChange={(e) => onChange({ ...draft, status: e.target.value })}
            style={inputCss}
          >
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <Field label="Notes" value={draft.notes} onChange={(v) => onChange({ ...draft, notes: v })} placeholder="Optional notes…" multiline />
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 20, flexWrap: "wrap" }}>
        <button type="button" style={primaryBtn} onClick={onSave}>
          {editingId ? "Update Referral" : "Save Referral"}
        </button>
        <button type="button" style={ghostBtn} onClick={onClear}>Clear</button>
        {message && (
          <span style={{ fontSize: 12, fontWeight: 600, color: message.startsWith("Error") ? "#dc2626" : "#16a34a" }}>
            {message}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Root app ─────────────────────────────────────────────────────────────────

export default function ReferralsApp() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [referrals, setReferrals] = useState(() => loadReferrals());
  const [config,    setConfig]    = useState(() => loadConfig());
  const [draft,     setDraft]     = useState(EMPTY_REF);
  const [editingId, setEditingId] = useState(null);
  const [saveMsg,   setSaveMsg]   = useState("");

  useEffect(() => {
    function onMessage(e) {
      if (e.data?.type === "REFERRALS_SWITCH_TAB" && VALID_TABS.includes(e.data.tab)) {
        setActiveTab(e.data.tab);
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  function handleSave() {
    if (!draft.name.trim() && !draft.email.trim()) {
      setSaveMsg("Error: Name or Email required");
      setTimeout(() => setSaveMsg(""), 2500);
      return;
    }
    const id = editingId || `r_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const record = { ...draft, id, referredAt: editingId ? (referrals.find((r) => r.id === id)?.referredAt || Date.now()) : Date.now() };
    const existing = loadReferrals();
    const idx = existing.findIndex((r) => r.id === id);
    if (idx >= 0) existing[idx] = record;
    else existing.unshift(record);
    saveReferrals(existing);
    setReferrals([...existing]);
    setDraft(EMPTY_REF);
    setEditingId(null);
    setSaveMsg(editingId ? "Referral updated" : "Referral saved");
    setTimeout(() => setSaveMsg(""), 2500);
  }

  function handleClear() {
    setDraft(EMPTY_REF);
    setEditingId(null);
    setSaveMsg("");
  }

  function handleEdit(r) {
    setDraft(r);
    setEditingId(r.id);
    setActiveTab("add");
  }

  function handleDelete(id) {
    const next = loadReferrals().filter((r) => r.id !== id);
    saveReferrals(next);
    setReferrals(next);
  }

  function handleStatusChange(id, status) {
    const existing = loadReferrals();
    const idx = existing.findIndex((r) => r.id === id);
    if (idx >= 0) { existing[idx] = { ...existing[idx], status }; saveReferrals(existing); setReferrals([...existing]); }
  }

  return (
    <div style={{ padding: "20px 20px 40px", fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: "#f8fafc", minHeight: "100vh" }}>
      {!EMBEDDED && (
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
          <h2 style={{ color: "#60a5fa", margin: 0, fontSize: 26, fontWeight: 900, letterSpacing: "-0.5px" }}>
            Referrals
          </h2>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {TABS.map((tab) => (
              <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)} style={tabBtn(activeTab === tab.key)}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === "dashboard" && (
        <DashboardTab referrals={referrals} config={config} onConfigChange={setConfig} />
      )}
      {activeTab === "referrals" && (
        <ReferralsTab referrals={referrals} onEdit={handleEdit} onDelete={handleDelete} onStatusChange={handleStatusChange} />
      )}
      {activeTab === "add" && (
        <AddReferralTab draft={draft} onChange={setDraft} onSave={handleSave} onClear={handleClear} message={saveMsg} editingId={editingId} />
      )}
    </div>
  );
}
