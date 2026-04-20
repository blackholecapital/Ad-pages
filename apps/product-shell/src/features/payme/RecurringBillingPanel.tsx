import { useState } from "react";

type PlanInterval = "day30" | "day180" | "year" | "month";

type Plan = {
  id: string;
  sku: string;
  name: string;
  interval: PlanInterval;
  price: number;
  active: boolean;
  subscribers: number;
  mrr: number;
};

type Subscription = {
  id: string;
  customer: string;
  plan: string;
  status: "active" | "past_due" | "canceled";
  nextRenewal: string;
  amount: number;
};

const SEED_PLANS: Plan[] = [
  { id: "p-30", sku: "PM30D01", name: "30-day subscription", interval: "day30", price: 100, active: true, subscribers: 214, mrr: 21400 },
  { id: "p-180", sku: "PM180D1", name: "180-day subscription", interval: "day180", price: 500, active: true, subscribers: 78, mrr: 6500 },
  { id: "p-365", sku: "PM365D1", name: "1-year subscription", interval: "year", price: 800, active: true, subscribers: 52, mrr: 3467 },
];

const SEED_SUBS: Subscription[] = [
  { id: "s1", customer: "Acme Corp", plan: "30-day subscription", status: "active", nextRenewal: "2026-05-02", amount: 100 },
  { id: "s2", customer: "Mercer & Sons", plan: "1-year subscription", status: "active", nextRenewal: "2026-11-14", amount: 800 },
  { id: "s3", customer: "Liu Freelance", plan: "30-day subscription", status: "past_due", nextRenewal: "2026-04-10", amount: 100 },
  { id: "s4", customer: "Plume Studio", plan: "180-day subscription", status: "canceled", nextRenewal: "—", amount: 0 },
];

function intervalDisplay(i: PlanInterval): string {
  switch (i) {
    case "day30": return "Every 30 days";
    case "day180": return "Every 180 days";
    case "year": return "Yearly";
    case "month": return "Monthly";
  }
}

export function RecurringBillingPanel() {
  const [plans, setPlans] = useState<Plan[]>(SEED_PLANS);
  const [subs] = useState<Subscription[]>(SEED_SUBS);
  const [form, setForm] = useState({ name: "", interval: "day30" as PlanInterval, price: "", sku: "" });

  function addPlan() {
    if (!form.name.trim() || !form.price) return;
    setPlans((prev) => [
      ...prev,
      {
        id: `p${Date.now()}`,
        sku: form.sku.trim() || `PM${Date.now().toString().slice(-6)}`,
        name: form.name.trim(),
        interval: form.interval,
        price: Number(form.price) || 0,
        active: true,
        subscribers: 0,
        mrr: 0,
      },
    ]);
    setForm({ name: "", interval: "day30", price: "", sku: "" });
  }

  function toggleActive(id: string) {
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p)));
  }

  const totalMrr = plans.reduce((sum, p) => sum + p.mrr, 0);
  const totalSubs = plans.reduce((sum, p) => sum + p.subscribers, 0);

  return (
    <div className="paymeSubGrid">
      <div className="adminBlock">
        <div className="adminBlockTitle">PayMe Pro · Overview</div>
        <div className="adminBlockBody">
          <div className="paymeStats">
            <div className="paymeStat">
              <div className="paymeStatValue">${totalMrr.toLocaleString()}</div>
              <div className="paymeStatLabel">Monthly-equivalent revenue</div>
            </div>
            <div className="paymeStat">
              <div className="paymeStatValue">{totalSubs}</div>
              <div className="paymeStatLabel">Active subscribers</div>
            </div>
            <div className="paymeStat">
              <div className="paymeStatValue">{plans.filter((p) => p.active).length}</div>
              <div className="paymeStatLabel">Live plans</div>
            </div>
          </div>
        </div>
      </div>

      <div className="adminBlock">
        <div className="adminBlockTitle">Create Plan</div>
        <div className="adminBlockBody">
          <div className="paymeFormGrid">
            <label>
              <span className="paymeLabel">Plan name</span>
              <input className="adminTextInput" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="30-day subscription" />
            </label>
            <label>
              <span className="paymeLabel">Interval</span>
              <select className="adminTextInput" value={form.interval} onChange={(e) => setForm({ ...form, interval: e.target.value as PlanInterval })}>
                <option value="day30">Every 30 days</option>
                <option value="day180">Every 180 days</option>
                <option value="year">Yearly</option>
                <option value="month">Monthly</option>
              </select>
            </label>
            <label>
              <span className="paymeLabel">Price (USD)</span>
              <input className="adminTextInput" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="100" />
            </label>
            <label>
              <span className="paymeLabel">SKU</span>
              <input className="adminTextInput" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="PM30D01" />
            </label>
          </div>
          <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
            <button type="button" className="adminBtn primary" onClick={addPlan}>Create plan</button>
          </div>
        </div>
      </div>

      <div className="adminBlock" style={{ gridColumn: "1 / -1" }}>
        <div className="adminBlockTitle">Plans</div>
        <div className="adminBlockBody">
          <table className="paymeTable">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Name</th>
                <th>Interval</th>
                <th>Price</th>
                <th>Subscribers</th>
                <th>MRR</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontFamily: "ui-monospace, Menlo, monospace", fontSize: 12 }}>{p.sku}</td>
                  <td>{p.name}</td>
                  <td>{intervalDisplay(p.interval)}</td>
                  <td>${p.price.toFixed(2)}</td>
                  <td>{p.subscribers}</td>
                  <td>${p.mrr.toLocaleString()}</td>
                  <td>
                    <span className={"paymePill" + (p.active ? " on" : " off")}>
                      {p.active ? "Active" : "Paused"}
                    </span>
                  </td>
                  <td>
                    <button className="adminBtn" onClick={() => toggleActive(p.id)}>
                      {p.active ? "Pause" : "Resume"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="adminBlock" style={{ gridColumn: "1 / -1" }}>
        <div className="adminBlockTitle">Recent Subscriptions</div>
        <div className="adminBlockBody">
          <table className="paymeTable">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Next renewal</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s) => (
                <tr key={s.id}>
                  <td>{s.customer}</td>
                  <td>{s.plan}</td>
                  <td>
                    <span className={"paymePill status-" + s.status}>{s.status.replace("_", " ")}</span>
                  </td>
                  <td>{s.nextRenewal}</td>
                  <td>${s.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
