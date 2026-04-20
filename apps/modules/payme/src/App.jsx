import React, { useEffect, useState } from "react";

// ─── URL helpers ─────────────────────────────────────────────────────────────

function getUrlParam(key) {
  try { return new URLSearchParams(window.location.search).get(key); } catch { return null; }
}

const VALID_TABS = ["customers", "add", "history", "invoice"];

// Initial tab comes from ?tab= (set by parent WorkspaceTile via ModuleFrame).
// Falls back to "customers" so the list shows first.
const URL_INITIAL_TAB = (() => {
  const t = getUrlParam("tab");
  return VALID_TABS.includes(t) ? t : "customers";
})();

// When loaded via ?tab=..., the parent controls tab switching via postMessage.
// Hide the internal nav in this case so there's no duplicate button row.
const EMBEDDED = getUrlParam("tab") !== null;

// ─── localStorage helpers ─────────────────────────────────────────────────────

const CUSTOMERS_KEY = "payme_customers_v1";
const INVOICES_KEY  = "payme_invoices_v1";

function loadCustomers() {
  try { return JSON.parse(localStorage.getItem(CUSTOMERS_KEY) || "[]"); } catch { return []; }
}
function saveCustomers(arr) {
  try { localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(arr.slice(0, 500))); } catch {}
}
function loadInvoices() {
  try { return JSON.parse(localStorage.getItem(INVOICES_KEY) || "[]"); } catch { return []; }
}
function appendInvoice(inv) {
  try {
    const arr = loadInvoices();
    arr.unshift({ ...inv, createdAt: Date.now() });
    localStorage.setItem(INVOICES_KEY, JSON.stringify(arr.slice(0, 200)));
  } catch {}
}

// ─── constants ────────────────────────────────────────────────────────────────

const EMPTY_CUSTOMER = {
  id: "", company: "", contact: "", email: "",
  phone: "", address1: "", address2: "",
  city: "", state: "", zip: "", country: "", notes: "",
};

const TABS = [
  { key: "customers", label: "Customers" },
  { key: "add",       label: "Add Customer" },
  { key: "history",   label: "Invoice History" },
  { key: "invoice",   label: "Create Invoice" },
];

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
  ...tabBtn(true),
  borderRadius: 8,
  padding: "9px 22px",
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

const fsBtn = {
  background: "transparent",
  color: "#374151",
  border: "1px solid #d1d5db",
  fontWeight: 600,
  fontSize: 13,
  padding: "8px 16px",
  borderRadius: 8,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
};

// ─── shared primitives ────────────────────────────────────────────────────────

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

// ─── Add Customer tab ──────────────────────────────────────────────────────────

function AddCustomerTab({ draft, onChange, onSave, onClear, message, fsHandle, onConnectFs }) {
  return (
    <div style={cardStyle}>
      <p style={{ margin: "0 0 18px", fontSize: 13, color: "#6b7280" }}>
        Enter customer details
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field label="Company"       value={draft.company}  onChange={(v) => onChange({ ...draft, company: v })}  placeholder="Company name" />
        <Field label="Contact"       value={draft.contact}  onChange={(v) => onChange({ ...draft, contact: v })}  placeholder="Contact name" />
        <Field label="Email"         value={draft.email}    onChange={(v) => onChange({ ...draft, email: v })}    placeholder="email@example.com" type="email" />
        <Field label="Phone"         value={draft.phone}    onChange={(v) => onChange({ ...draft, phone: v })}    placeholder="+1 (555) 000-0000" />
        <div style={{ gridColumn: "1 / -1" }}>
          <Field label="Address Line 1" value={draft.address1} onChange={(v) => onChange({ ...draft, address1: v })} placeholder="Street address" />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <Field label="Address Line 2" value={draft.address2} onChange={(v) => onChange({ ...draft, address2: v })} placeholder="Suite, unit, etc." />
        </div>
        <Field label="City"    value={draft.city}    onChange={(v) => onChange({ ...draft, city: v })}    placeholder="City" />
        <Field label="State"   value={draft.state}   onChange={(v) => onChange({ ...draft, state: v })}   placeholder="State" />
        <Field label="ZIP"     value={draft.zip}     onChange={(v) => onChange({ ...draft, zip: v })}     placeholder="ZIP" />
        <Field label="Country" value={draft.country} onChange={(v) => onChange({ ...draft, country: v })} placeholder="Country" />
        <div style={{ gridColumn: "1 / -1" }}>
          <Field label="Notes" value={draft.notes} onChange={(v) => onChange({ ...draft, notes: v })} placeholder="Optional notes…" multiline />
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 20, justifyContent: "space-between", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button type="button" style={primaryBtn} onClick={onSave}>Save Client</button>
          <button type="button" style={ghostBtn}   onClick={onClear}>Clear</button>
          {message && (
            <span style={{ fontSize: 12, fontWeight: 600, color: message.startsWith("Error") ? "#dc2626" : "#16a34a" }}>
              {message}
            </span>
          )}
        </div>
        <p style={{ margin: 0, fontSize: 11, color: "#9ca3af", textAlign: "right", maxWidth: 240 }}>
          PayMe USDC payments. 1% fee, instantaneous settlement.<br />
          Get paid faster, lower fees with PayMe.
        </p>
      </div>

      {/* Local filesystem connector */}
      <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #f1f5f9", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <button type="button" style={fsBtn} onClick={onConnectFs}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          {fsHandle ? fsHandle.name : "Connect to local filesystem"}
        </button>
        {fsHandle && (
          <span style={{ fontSize: 12, color: "#16a34a", fontWeight: 600 }}>
            ✓ Customers will be written to {fsHandle.name}/payme_customers.json
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Customers list tab ───────────────────────────────────────────────────────

function CustomersTab({ customers, onEdit, onDelete }) {
  if (!customers.length) {
    return (
      <div style={{ ...cardStyle, textAlign: "center", padding: 48, color: "#9ca3af" }}>
        No customers yet. Use <strong>Add Customer</strong> to save your first record.
      </div>
    );
  }
  return (
    <div style={cardStyle}>
      <h3 style={{ color: "#2563eb", margin: "0 0 16px", fontSize: 18, fontWeight: 800 }}>Customers</h3>
      <div style={{ display: "grid", gap: 10 }}>
        {customers.map((c) => (
          <div
            key={c.id}
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
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>
                {c.company || c.contact || "(No name)"}
              </div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>
                {c.email || ""}
                {c.phone ? ` · ${c.phone}` : ""}
              </div>
              {c.city || c.state ? (
                <div style={{ fontSize: 11, color: "#9ca3af" }}>
                  {[c.city, c.state, c.country].filter(Boolean).join(", ")}
                </div>
              ) : null}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" onClick={() => onEdit(c)} style={{ ...tabBtn(false), borderRadius: 8, fontSize: 12 }}>
                Edit
              </button>
              <button
                type="button"
                onClick={() => onDelete(c.id)}
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

// ─── Invoice History tab ──────────────────────────────────────────────────────

function InvoiceHistoryTab({ invoices }) {
  if (!invoices.length) {
    return (
      <div style={{ ...cardStyle, textAlign: "center", padding: 48, color: "#9ca3af" }}>
        No invoices yet. Use <strong>Create Invoice</strong> to generate your first invoice.
      </div>
    );
  }
  return (
    <div style={cardStyle}>
      <h3 style={{ color: "#2563eb", margin: "0 0 16px", fontSize: 18, fontWeight: 800 }}>Invoice History</h3>
      <div style={{ display: "grid", gap: 8 }}>
        {invoices.map((inv, i) => (
          <div
            key={i}
            style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, padding: "12px 16px", border: "1px solid #e5e7eb", borderRadius: 10, background: "#f9fafb", alignItems: "center" }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>
                {inv.invoiceNumber || "—"}
                {inv.subject ? ` · ${inv.subject}` : ""}
              </div>
              {inv.customer && <div style={{ fontSize: 12, color: "#6b7280" }}>{inv.customer}</div>}
              <div style={{ fontSize: 11, color: "#9ca3af" }}>
                {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : ""}
              </div>
            </div>
            <span style={{ fontWeight: 800, fontSize: 15, color: "#2563eb" }}>
              {inv.amount ? `$${Number(inv.amount).toFixed(2)}` : ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Create Invoice tab ───────────────────────────────────────────────────────

function nextInvNumber(invoices) {
  const nums = invoices
    .map((inv) => { const m = String(inv.invoiceNumber || "").match(/\d+$/); return m ? parseInt(m[0], 10) : 0; })
    .filter((n) => !isNaN(n));
  const max = nums.length ? Math.max(...nums) : 0;
  return `INV-${String(max + 1).padStart(4, "0")}`;
}

function CreateInvoiceTab({ customers, onCreated }) {
  const existingInvoices = loadInvoices();
  const [invoiceNumber, setInvoiceNumber] = useState(() => nextInvNumber(existingInvoices));
  const [subject, setSubject]     = useState("Invoice for services");
  const [customerId, setCustomerId] = useState("");
  const [amount, setAmount]       = useState("");
  const [notes, setNotes]         = useState("");
  const [msg, setMsg]             = useState("");

  function handleCreate() {
    if (!invoiceNumber.trim()) { setMsg("Error: Invoice number required"); setTimeout(() => setMsg(""), 2500); return; }
    const customer = customers.find((c) => c.id === customerId);
    const inv = { invoiceNumber: invoiceNumber.trim(), subject: subject.trim(), customer: customer ? (customer.company || customer.contact || customer.email || "") : "", customerId, amount: amount ? Number(amount).toFixed(2) : "", notes: notes.trim() };
    appendInvoice(inv);
    if (onCreated) onCreated();
    setMsg(`Invoice ${inv.invoiceNumber} saved`);
    setInvoiceNumber(nextInvNumber(loadInvoices()));
    setSubject("Invoice for services");
    setAmount("");
    setNotes("");
    setTimeout(() => setMsg(""), 2500);
  }

  return (
    <div style={cardStyle}>
      <h3 style={{ color: "#2563eb", margin: "0 0 4px", fontSize: 18, fontWeight: 800 }}>Create Invoice</h3>
      <p style={{ margin: "0 0 18px", fontSize: 13, color: "#6b7280" }}>Generate an invoice and save it to history.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field label="Invoice #"    value={invoiceNumber} onChange={setInvoiceNumber} placeholder="INV-0001" />
        <Field label="Amount (USD)" value={amount}        onChange={setAmount}        placeholder="0.00" type="number" />
        <div style={{ gridColumn: "1 / -1" }}>
          <Field label="Subject" value={subject} onChange={setSubject} placeholder="Invoice for services" />
        </div>
        {customers.length > 0 && (
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={lblCss}>Customer</label>
            <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} style={inputCss}>
              <option value="">Select customer…</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.company || c.contact || c.email || c.id}</option>
              ))}
            </select>
          </div>
        )}
        <div style={{ gridColumn: "1 / -1" }}>
          <Field label="Notes" value={notes} onChange={setNotes} placeholder="Additional notes…" multiline />
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 20 }}>
        <button type="button" style={primaryBtn} onClick={handleCreate}>Create Invoice</button>
        {msg && <span style={{ fontSize: 12, fontWeight: 600, color: msg.startsWith("Error") ? "#dc2626" : "#16a34a" }}>{msg}</span>}
      </div>
    </div>
  );
}

// ─── Root app ─────────────────────────────────────────────────────────────────

export function PaymeModuleApp() {
  const [activeTab, setActiveTab] = useState(URL_INITIAL_TAB);
  const [customers, setCustomers] = useState(() => loadCustomers());
  const [invoices,  setInvoices]  = useState(() => loadInvoices());
  const [draft,     setDraft]     = useState(EMPTY_CUSTOMER);
  const [editingId, setEditingId] = useState(null);
  const [saveMsg,   setSaveMsg]   = useState("");
  const [fsHandle,  setFsHandle]  = useState(null);

  // Listen for tab-switch commands from the parent WorkspaceTile.
  useEffect(() => {
    function onMessage(e) {
      if (e.data?.type === "PAYME_SWITCH_TAB" && VALID_TABS.includes(e.data.tab)) {
        setActiveTab(e.data.tab);
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  async function handleConnectFs() {
    if (!window.showDirectoryPicker) {
      alert("File System Access API is not available in this browser.");
      return;
    }
    try {
      const handle = await window.showDirectoryPicker({ mode: "readwrite" });
      setFsHandle(handle);
    } catch (err) {
      if (err.name !== "AbortError") console.warn("[payme] fs picker error", err);
    }
  }

  async function writeToFs(filename, data) {
    if (!fsHandle) return;
    try {
      const fileHandle = await fsHandle.getFileHandle(filename, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(data, null, 2));
      await writable.close();
    } catch (err) {
      console.warn("[payme] fs write error", err);
    }
  }

  async function handleSave() {
    const { company, contact, email } = draft;
    if (!company.trim() && !contact.trim() && !email.trim()) {
      setSaveMsg("Error: Company, Contact, or Email required");
      setTimeout(() => setSaveMsg(""), 2500);
      return;
    }
    const id = editingId || `c_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const record = { ...draft, id };
    const existing = loadCustomers();
    const idx = existing.findIndex((c) => c.id === id);
    if (idx >= 0) existing[idx] = record;
    else existing.unshift(record);
    saveCustomers(existing);
    setCustomers([...existing]);
    await writeToFs("payme_customers.json", existing);
    setDraft(EMPTY_CUSTOMER);
    setEditingId(null);
    setSaveMsg(editingId ? "Client updated" : "Client saved");
    setTimeout(() => setSaveMsg(""), 2500);
  }

  function handleClear() {
    setDraft(EMPTY_CUSTOMER);
    setEditingId(null);
    setSaveMsg("");
  }

  function handleEdit(c) {
    setDraft(c);
    setEditingId(c.id);
    setActiveTab("add");
  }

  function handleDelete(id) {
    const next = loadCustomers().filter((c) => c.id !== id);
    saveCustomers(next);
    setCustomers(next);
  }

  function handleInvoiceCreated() {
    setInvoices(loadInvoices());
  }

  return (
    <div style={{ padding: "20px 20px 40px", fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: "#f8fafc", minHeight: "100vh" }}>
      {/* Internal nav — only shown when the module is loaded standalone (no ?tab= param). */}
      {!EMBEDDED && (
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
          <h2 style={{ color: "#60a5fa", margin: 0, fontSize: 26, fontWeight: 900, letterSpacing: "-0.5px" }}>
            PayMe
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

      {activeTab === "add" && (
        <AddCustomerTab
          draft={draft}
          onChange={setDraft}
          onSave={handleSave}
          onClear={handleClear}
          message={saveMsg}
          fsHandle={fsHandle}
          onConnectFs={handleConnectFs}
        />
      )}
      {activeTab === "customers" && (
        <CustomersTab customers={customers} onEdit={handleEdit} onDelete={handleDelete} />
      )}
      {activeTab === "history" && (
        <InvoiceHistoryTab invoices={invoices} />
      )}
      {activeTab === "invoice" && (
        <CreateInvoiceTab customers={customers} onCreated={handleInvoiceCreated} />
      )}
    </div>
  );
}

export default PaymeModuleApp;
