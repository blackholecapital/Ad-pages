import { useMemo, useState } from "react";
import { intervalLabel, usePayMeCart } from "../../state/paymeCartState";

function UsdcIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="11" fill="#2775CA" />
      <path
        d="M12 5.5v1.5M12 17v1.5M8.5 9.2c.4-1.6 1.7-2.7 3.5-2.7 2.2 0 3.5 1.3 3.5 2.8 0 1.4-1 2.1-2.8 2.7-1.7.5-2.7 1.3-2.7 2.7 0 1.5 1.3 2.5 3 2.5 1.9 0 3.1-.9 3.5-2.2"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const COUPONS: Record<string, { type: "percent" | "fixed"; value: number; label?: string }> = {
  LAUNCH30: { type: "percent", value: 30, label: "Launch Party — 30% OFF" },
  USDC10: { type: "percent", value: 10, label: "Extra 10% OFF with USDC" },
  SAVE10: { type: "fixed", value: 10, label: "$10 off" },
};

type Method = "apple" | "google" | "card" | "usdc";

export function Basket() {
  const { items, updateQty, removeItem } = usePayMeCart();
  const [couponCode, setCouponCode] = useState("");
  const [applied, setApplied] = useState<{ code: string; amountOff: number } | null>(null);
  const [couponMsg, setCouponMsg] = useState("");
  const [method, setMethod] = useState<Method>("card");
  const [showUsdcHelp, setShowUsdcHelp] = useState(false);
  const [confirmed, setConfirmed] = useState<string | null>(null);

  const totals = useMemo(() => {
    const active = items.filter((i) => i.qty > 0);
    const setupSubtotal = active.reduce((sum, i) => sum + (i.setupPrice ?? 0) * i.qty, 0);
    const monthlyRecurring = active.reduce((sum, i) => sum + (i.monthlyPrice ?? 0) * i.qty, 0);
    const usdcBonus = method === "usdc" ? (setupSubtotal * 10) / 100 : 0;
    const couponDiscount = applied
      ? applied.code === "USDC10" && method !== "usdc"
        ? 0
        : Math.min(applied.amountOff, setupSubtotal)
      : 0;
    const discount = couponDiscount + usdcBonus;
    const totalDue = Math.max(0, setupSubtotal - discount);
    return {
      setupSubtotal,
      monthlyRecurring,
      discount,
      totalDue,
      hasRecurring: monthlyRecurring > 0,
    };
  }, [items, applied, method]);

  function applyCoupon() {
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      setCouponMsg("Enter a code to apply.");
      return;
    }
    const c = COUPONS[code];
    if (!c) {
      setApplied(null);
      setCouponMsg(`Coupon "${code}" not found.`);
      return;
    }
    const amountOff = c.type === "percent" ? (totals.setupSubtotal * c.value) / 100 : c.value;
    setApplied({ code, amountOff });
    setCouponMsg(`Coupon ${code} applied${c.label ? ` — ${c.label}` : ""}.`);
  }

  function pay() {
    if (!items.length) return;
    setConfirmed(`Demo: charged $${totals.totalDue.toFixed(2)} via ${method.toUpperCase()}.`);
    setTimeout(() => setConfirmed(null), 3200);
  }

  const payBtnLabel = items.length ? `Pay $${totals.totalDue.toFixed(2)} securely` : "Basket is empty";

  return (
    <div className="paymeCheckout">
      {/* Review your order */}
      <div className="paymeReviewCard">
        <div className="paymeReviewHead">
          <div className="paymeSectionTitle">Review your order</div>
          <button
            type="button"
            className="paymeUsdcHelp"
            style={{ color: "#111" }}
            onClick={() => setShowUsdcHelp(true)}
          >
            <UsdcIcon size={15} />
            {" "}USDC ?
          </button>
        </div>

        {items.length === 0 ? (
          <div className="paymeReviewEmpty">
            Basket is empty — add exclusive content or pay an invoice to start.
          </div>
        ) : (
          <div className="paymeReviewList">
            {items.map((item) => (
              <div key={item.id} className="paymeReviewItem">
                <div className="paymeReviewTopRow">
                  <div className="paymeReviewItemHead">
                    <span className="paymeReviewItemName">{item.name}</span>
                    <span className="paymeReviewItemSku">SKU {item.sku}</span>
                  </div>
                  <button
                    type="button"
                    className="paymeReviewRemove"
                    onClick={() => removeItem(item.id)}
                    aria-label="Remove"
                  >
                    ×
                  </button>
                </div>
                {item.setupPrice != null && (
                  <div className="paymeReviewRow">
                    <span>{item.monthlyPrice != null ? "Setup (one-time)" : "Price"}</span>
                    <span>
                      ${(item.setupPrice * item.qty).toFixed(2)}
                    </span>
                  </div>
                )}
                {item.monthlyPrice != null && (
                  <div className="paymeReviewRow recurring">
                    <span>Recurring</span>
                    <span>
                      ${(item.monthlyPrice * item.qty).toFixed(2)} {intervalLabel(item.interval)}
                    </span>
                  </div>
                )}
                {item.qty > 1 && (
                  <div className="paymeReviewQty">
                    <button type="button" onClick={() => updateQty(item.id, -1)}>−</button>
                    <span>{item.qty}</span>
                    <button type="button" onClick={() => updateQty(item.id, 1)}>+</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="paymeSummaryCard">
        <div className="paymeSectionTitle">Summary</div>
        <div className="paymeSummaryRow">
          <span>Setup subtotal</span>
          <span>${totals.setupSubtotal.toFixed(2)}</span>
        </div>
        {totals.hasRecurring && (
          <div className="paymeSummaryRow recurring">
            <span>Monthly recurring</span>
            <span>${totals.monthlyRecurring.toFixed(2)} / mo</span>
          </div>
        )}
        <div className="paymeSummaryRow discount">
          <span>Discount</span>
          <span>- ${totals.discount.toFixed(2)}</span>
        </div>
        <div className="paymeSummaryRow grand">
          <span>Total due today</span>
          <span>${totals.totalDue.toFixed(2)}</span>
        </div>
        {totals.hasRecurring && (
          <div className="paymeSummaryThen">
            Then ${totals.monthlyRecurring.toFixed(2)} / month
          </div>
        )}

        {/* Coupon */}
        <div className="paymeCouponRow">
          <input
            type="text"
            placeholder="Enter code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          />
          <button type="button" onClick={applyCoupon}>Apply</button>
        </div>
        {couponMsg && (
          <div className={"paymeCouponMsg" + (applied ? " ok" : "")}>{couponMsg}</div>
        )}

        {/* Promo banner */}
        <div className="paymePromoBanner">
          <div>🚀 <b>Launch Party — 30% OFF</b> (LAUNCH30)</div>
          <div>🔥 Extra 10% OFF with USDC on Everything</div>
        </div>

        {/* Method selector */}
        <div className="paymeMethodsGrid">
          <button
            type="button"
            className={"paymeMethod" + (method === "apple" ? " active" : "")}
            onClick={() => setMethod("apple")}
          >
            <span></span> Apple Pay
          </button>
          <button
            type="button"
            className={"paymeMethod" + (method === "google" ? " active" : "")}
            onClick={() => setMethod("google")}
          >
            <span>G</span> Google Pay
          </button>
          <button
            type="button"
            className={"paymeMethod" + (method === "card" ? " active" : "")}
            onClick={() => setMethod("card")}
          >
            <span>💳</span> Card
          </button>
          <button
            type="button"
            className={"paymeMethod" + (method === "usdc" ? " active" : "")}
            style={{ color: "#111" }}
            onClick={() => setMethod("usdc")}
          >
            <UsdcIcon size={16} />{" "}USDC
          </button>
        </div>

        <button
          type="button"
          className="paymePayBtn"
          disabled={!items.length}
          onClick={pay}
        >
          {payBtnLabel}
        </button>

        {confirmed && <div className="paymeCheckoutConfirmed">{confirmed}</div>}

        <div className="paymePoweredBy">Powered by PayMe</div>
      </div>

      {showUsdcHelp && (
        <div className="paymeUsdcModalBackdrop" onClick={() => setShowUsdcHelp(false)}>
          <div className="paymeUsdcModal" onClick={(e) => e.stopPropagation()}>
            <div className="paymeUsdcModalHead">
              <span className="paymeUsdcDot" style={{ width: 22, height: 22 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#3B82F6">
                  <circle cx="12" cy="12" r="10" fillOpacity=".12" />
                  <path d="M12 7v10M8 10h8M8 14h8" stroke="#3B82F6" strokeWidth="1.5" fill="none" />
                </svg>
              </span>
              <span>USDC payments</span>
              <button type="button" className="paymeUsdcModalClose" onClick={() => setShowUsdcHelp(false)} aria-label="Close">×</button>
            </div>
            <ul className="paymeUsdcList">
              <li>💵 <b>USDC</b> is the premier stablecoin — always worth <b>$1 USD</b>.</li>
              <li>✅ Easy to use once your wallet is connected.</li>
              <li>Select <b>USDC</b> as your payment method.</li>
              <li>Click <b>Pay with USDC</b> to connect your wallet.</li>
              <li>USDC on <b>BASE network only</b>. <span className="muted">(keeps it ez)</span></li>
              <li>The pay button is <b>locked if not on BASE</b>. <span className="muted">(keeps it safe)</span></li>
              <li>📱 Mobile users must use the <b>browser inside your web3 wallet</b>.</li>
              <li>🤚 Mobile web3 wallets will <b>not connect from outside browsers</b>.</li>
            </ul>
            <button type="button" className="paymePayBtn" onClick={() => setShowUsdcHelp(false)}>
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
