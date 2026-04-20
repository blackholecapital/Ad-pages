import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { PageShell } from "../components/layout/PageShell";
import { WorkspaceTile } from "../components/layout/WorkspaceTile";
import { usePayMeCart } from "../state/paymeCartState";
import { usePublishedExclusiveTiles } from "../hooks/usePublishedExclusiveTiles";

type RouteParams = { designation?: string; slug?: string };

type ContentItem = {
  id: string;
  sku: string;
  price: number;
  label: string;
  locked: boolean;
  imageSrc: string | null;
};

type MembershipOption = {
  id: string;
  sku: string;
  label: string;
  buttonLabel: string;
  amount: number;
  interval: "day30" | "day180" | "year";
  monthlyEquivalent: number;
};

const DEFAULT_CONTENT_ITEMS: ContentItem[] = Array.from({ length: 6 }, (_, i) => {
  const n = i + 1;
  const sku = `EC${n.toString().padStart(6, "0")}`;
  return {
    id: `exclusive-content-${n}`,
    sku,
    price: 0,
    label: `Exclusive Content-${n}`,
    locked: true,
    imageSrc: null,
  };
});

const MEMBERSHIP_OPTIONS: MembershipOption[] = [
  { id: "membership-30", sku: "PM30D01", label: "30 days", buttonLabel: "30-day subscription", amount: 100, interval: "day30", monthlyEquivalent: 100 },
  { id: "membership-180", sku: "PM180D1", label: "180 days", buttonLabel: "180-day subscription", amount: 500, interval: "day180", monthlyEquivalent: 83.33 },
  { id: "membership-365", sku: "PM365D1", label: "1 year", buttonLabel: "1-year subscription", amount: 800, interval: "year", monthlyEquivalent: 66.67 }
];

const LOCK_SVG_RED = (
  <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 7H4a1 1 0 00-1 1v5a1 1 0 001 1h8a1 1 0 001-1V8a1 1 0 00-1-1z" fill="#e53e3e" opacity=".95"/>
    <path d="M5.5 7V5a2.5 2.5 0 015 0v2" stroke="#e53e3e" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const LOCK_SVG_GREEN = (
  <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 7H4a1 1 0 00-1 1v5a1 1 0 001 1h8a1 1 0 001-1V8a1 1 0 00-1-1z" fill="#38a169" opacity=".95"/>
    <path d="M5.5 7V5a2.5 2.5 0 015 0v2" stroke="#38a169" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export function ExclusivePage() {
  const { slug } = useParams<RouteParams>();
  const { addItem } = usePayMeCart();
  const publishedTiles = usePublishedExclusiveTiles(slug);

  const contentItems: ContentItem[] = useMemo(() => {
    if (!publishedTiles.length) return DEFAULT_CONTENT_ITEMS;
    return publishedTiles.map((tile, i) => {
      const n = i + 1;
      return {
        id: `exclusive-content-${n}`,
        sku: `EC${n.toString().padStart(6, "0")}`,
        price: tile.price ? parseFloat(tile.price.replace(/[^0-9.]/g, "")) || 0 : 0,
        label: tile.label,
        locked: tile.locked,
        imageSrc: tile.resolvedImageSrc,
      };
    });
  }, [publishedTiles]);

  const [membershipIndex, setMembershipIndex] = useState(0);
  const [expandedTileId, setExpandedTileId] = useState<string | null>(null);

  const membership = MEMBERSHIP_OPTIONS[membershipIndex];

  function addContentToBasket(item: ContentItem) {
    addItem({
      id: item.id,
      sku: item.sku,
      name: item.label,
      setupPrice: item.price > 0 ? item.price : 29,
      qty: 1,
    });
  }

  function addMembershipToBasket(m: MembershipOption) {
    addItem({
      id: m.id,
      sku: m.sku,
      name: `${m.buttonLabel}`,
      description: `Renews every ${m.label}`,
      monthlyPrice: m.amount,
      interval: m.interval,
      qty: 1,
    });
  }

  return (
    <PageShell>
      <WorkspaceTile title="Exclusive Content">
        <div style={{ display: "grid", gap: 16 }}>
          <div className="cardGlow" style={{ border: "1px solid rgba(59,130,246,.18)", borderRadius: 16, padding: 20, background: "rgba(255,255,255,.97)", width: "100%", textAlign: "center" }}>
            <div style={{ fontWeight: 900, fontSize: 20, color: "#3B82F6" }}>Biz Pages provides a built-in monetization layer.</div>
            <div style={{ marginTop: 6, fontSize: 15, color: "#1E293B" }}>Sell goods, services, memberships, content, and more.</div>
            <div style={{ marginTop: 6, fontSize: 13, color: "#64748B" }}>
              PayMe USDC payments. Get paid faster with lower fees.
            </div>
            <div style={{ marginTop: 4, fontSize: 13, color: "#64748B" }}>
              1% fee. Instantaneous settlement.
            </div>
          </div>

          <div className="cardGlow" style={{ border: "1px solid rgba(59,130,246,.18)", borderRadius: 16, padding: 16, background: "rgba(255,255,255,.97)", width: "100%" }}>
            <div style={{ fontWeight: 900, marginBottom: 12, textAlign: "center", color: "#3B82F6" }}>Purchase monthly memberships, recurring billing and subscriptions.</div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
              <select
                className="adminTextInput"
                style={{ WebkitAppearance: "none", MozAppearance: "none", appearance: "none", width: 180, flex: "0 0 auto" } as React.CSSProperties}
                value={membershipIndex}
                onChange={(e) => setMembershipIndex(Number(e.target.value))}
              >
                {MEMBERSHIP_OPTIONS.map((option, index) => (
                  <option value={index} key={option.id}>{`${option.label} — $${option.amount}`}</option>
                ))}
              </select>
              <button
                className="usdcPayBtn primary"
                type="button"
                onClick={() => addMembershipToBasket(membership)}
              >
                Pay
              </button>
              <button
                className="usdcPayBtn"
                type="button"
                style={{ color: "#1E293B" }}
                onClick={() => addMembershipToBasket(membership)}
              >
                {membership.buttonLabel}
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12, width: "100%" }}>
            {contentItems.map((item) => {
              const isFree = !item.locked;
              const isLocked = !isFree;
              const isExpanded = expandedTileId === item.id;

              if (isExpanded) {
                return (
                  <div
                    key={item.id}
                    style={{ position: "fixed", inset: 0, zIndex: 100, display: "grid", placeItems: "center", background: "rgba(0,0,0,.75)", cursor: "pointer" }}
                    onClick={() => setExpandedTileId(null)}
                  >
                    <div
                      style={{ position: "relative", width: "min(90vw, 900px)", maxHeight: "85vh", borderRadius: 18, overflow: "hidden", background: "rgba(10,16,26,.95)", border: "1px solid rgba(255,255,255,.18)" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {item.imageSrc ? (
                        <img src={item.imageSrc} alt={item.label} style={{ width: "100%", maxHeight: "80vh", objectFit: "contain", display: "block" }} />
                      ) : (
                        <div style={{ padding: 40, textAlign: "center", fontSize: 16, opacity: 0.6 }}>No content available</div>
                      )}
                      <div style={{ padding: "12px 16px", fontWeight: 800, fontSize: 15 }}>{item.label}</div>
                      <button
                        type="button"
                        onClick={() => setExpandedTileId(null)}
                        style={{ position: "absolute", top: 10, right: 10, width: 32, height: 32, borderRadius: 999, border: "1px solid rgba(255,255,255,.25)", background: "rgba(0,0,0,.6)", color: "#fff", fontSize: 18, cursor: "pointer", display: "grid", placeItems: "center" }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={item.id}
                  style={{ position: "relative", border: "1px solid rgba(255,255,255,.14)", borderRadius: 14, minHeight: 180, background: "rgba(10,16,26,.81)", overflow: "hidden", cursor: "pointer" }}
                  onClick={
                    isFree
                      ? () => setExpandedTileId(item.id)
                      : () => addContentToBasket(item)
                  }
                >
                  {item.imageSrc ? (
                    <img
                      src={item.imageSrc}
                      alt={item.label}
                      style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }}
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                  ) : null}

                  {isLocked && (
                    <div style={{ position: "absolute", inset: 0, background: "rgba(180, 30, 30, .18)", zIndex: 1 }} />
                  )}

                  <div style={{ position: "absolute", top: 8, left: 10, fontWeight: 700, fontSize: 12, color: "rgba(255,255,255,.85)", zIndex: 2, textShadow: "0 1px 4px rgba(0,0,0,.7)" }}>
                    {item.label}
                  </div>
                  <div style={{ position: "absolute", top: 8, right: 10, fontWeight: 700, fontSize: 10, color: "rgba(255,255,255,.65)", zIndex: 2, letterSpacing: ".08em" }}>
                    SKU {item.sku}
                  </div>

                  <div style={{ position: "absolute", bottom: 10, left: 10, zIndex: 2, display: "flex", alignItems: "flex-end", gap: 10 }}>
                    {isLocked ? (
                      <>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                          {LOCK_SVG_RED}
                          <span style={{ fontSize: 10, fontWeight: 800, color: "#e53e3e", textTransform: "uppercase" }}>Paid</span>
                        </div>
                        {item.price > 0 && (
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1 }}>
                            <span style={{ fontSize: 14, fontWeight: 900, color: "#fff", textShadow: "0 1px 4px rgba(0,0,0,.8)" }}>
                              ${item.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <span style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,.7)", textTransform: "uppercase" }}>Purchase Price</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                        {LOCK_SVG_GREEN}
                        <span style={{ fontSize: 10, fontWeight: 800, color: "#38a169", textTransform: "uppercase" }}>Free</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </WorkspaceTile>
    </PageShell>
  );
}
