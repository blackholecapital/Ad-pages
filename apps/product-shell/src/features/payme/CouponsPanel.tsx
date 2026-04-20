import { useState } from "react";

type Coupon = {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  active: boolean;
  expiry?: string;
  maxUses?: number;
  usageCount: number;
};

const SEED: Coupon[] = [
  { id: "c1", code: "LAUNCH30", type: "percent", value: 30, active: true, expiry: "2026-06-30", maxUses: 500, usageCount: 142 },
  { id: "c2", code: "SAVE10", type: "fixed", value: 10, active: true, usageCount: 37 },
  { id: "c3", code: "BLACKFRI24", type: "percent", value: 25, active: false, expiry: "2024-12-01", maxUses: 1000, usageCount: 812 },
];

export function CouponsPanel() {
  const [coupons, setCoupons] = useState<Coupon[]>(SEED);
  const [form, setForm] = useState({ code: "", type: "percent" as "percent" | "fixed", value: "10", active: true, expiry: "", maxUses: "" });

  function save() {
    if (!form.code.trim()) return;
    const next: Coupon = {
      id: `c${Date.now()}`,
      code: form.code.toUpperCase(),
      type: form.type,
      value: Number(form.value) || 0,
      active: form.active,
      expiry: form.expiry || undefined,
      maxUses: form.maxUses ? Number(form.maxUses) : undefined,
      usageCount: 0,
    };
    setCoupons((prev) => [next, ...prev]);
    setForm({ code: "", type: "percent", value: "10", active: true, expiry: "", maxUses: "" });
  }

  function remove(id: string) {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
  }

  function toggleActive(id: string) {
    setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c)));
  }

  return (
    <div className="paymeSubGrid">
      <div className="adminBlock">
        <div className="adminBlockTitle">Create Coupon</div>
        <div className="adminBlockBody">
          <div className="paymeFormGrid">
            <label>
              <span className="paymeLabel">Code</span>
              <input className="adminTextInput" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="LAUNCH30" />
            </label>
            <label>
              <span className="paymeLabel">Type</span>
              <select className="adminTextInput" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as "percent" | "fixed" })}>
                <option value="percent">Percent</option>
                <option value="fixed">Fixed</option>
              </select>
            </label>
            <label>
              <span className="paymeLabel">Value</span>
              <input className="adminTextInput" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
            </label>
            <label>
              <span className="paymeLabel">Expiry</span>
              <input className="adminTextInput" type="date" value={form.expiry} onChange={(e) => setForm({ ...form, expiry: e.target.value })} />
            </label>
            <label>
              <span className="paymeLabel">Max uses</span>
              <input className="adminTextInput" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} placeholder="∞" />
            </label>
            <label className="paymeCheckbox">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
              <span>Active</span>
            </label>
          </div>
          <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
            <button type="button" className="adminBtn primary" onClick={save}>Save coupon</button>
          </div>
        </div>
      </div>

      <div className="adminBlock">
        <div className="adminBlockTitle">Active Coupons</div>
        <div className="adminBlockBody">
          <div className="paymeCouponList">
            {coupons.length === 0 && <div style={{ color: "#64748B" }}>No coupons yet.</div>}
            {coupons.map((c) => (
              <div key={c.id} className={"paymeCouponRow" + (c.active ? "" : " inactive")}>
                <div>
                  <div className="paymeCouponCode">{c.code}</div>
                  <div className="paymeCouponMeta">
                    {c.type === "percent" ? `${c.value}% off` : `$${c.value.toFixed(2)} off`}
                    {c.expiry ? ` · expires ${c.expiry}` : ""}
                    {` · used ${c.usageCount}${c.maxUses ? `/${c.maxUses}` : ""}`}
                  </div>
                </div>
                <div className="paymeCouponActions">
                  <button type="button" className="adminBtn" onClick={() => toggleActive(c.id)}>
                    {c.active ? "Disable" : "Enable"}
                  </button>
                  <button type="button" className="adminBtn danger" onClick={() => remove(c.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
