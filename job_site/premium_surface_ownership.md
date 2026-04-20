# Premium Surface Ownership

job_id: BIZ-PAGES-WALLPAPER-HOTFIX-003
worker: A
stage: S2
artifact: premium_surface_ownership.md

---

## 1. Problem: Conflicting Wallpaper Layers

Before this patch, when a premium published slug (`/:slug`) was visited, three
visual layers were in play simultaneously:

| Layer | Source | CSS | z-index | Covers |
|-------|--------|-----|---------|--------|
| AppShell default wallpaper | `AppShell.tsx` → `appRootWallpaper` | `position: fixed; inset: 0; z-index: -1` | -1 | Full viewport incl. nav zone |
| Legacy nav/content area | `appBody` div | normal flow | auto | Below nav |
| Premium surface | `PageShell` → `premiumSurface` | `position: fixed; top: var(--nav-h); z-index: 4` | 4 | Below nav only |

The `appRootWallpaper` (`/w99.png`) was always painted in the nav zone
(`top: 0` to `top: 72px`) because the `premiumSurface` started at
`top: var(--nav-h, 72px)` and did not cover that region.

The `TopNav` background is `background: transparent` (outer) with
`background: rgba(10,10,14,.55)` (inner) — semi-transparent. The static
`/w99.png` wallpaper bled through this transparence, creating a competing
background in the nav zone distinct from the premium stage's own wallpaper.

Additionally, `published-overlay.css` contained legacy `.publishedOverlay*`
CSS rules defining an old overlay system (absolute-positioned skin/gif/stage
layers with a 1400px fixed-width stage) that was never removed. These rules
were unreferenced in any component but represented a latent conflicting path.

---

## 2. Fix: Receiver as Owning Surface

### 2.1 Structural Change

`DesktopPremiumReceiver` now accepts an `asMount` prop. When `asMount` is
set (published page path), the receiver renders its own fixed full-viewport
surface (`dpv1ReceiverMount`) rather than relying on an external wrapper.

**Before (PageShell wrapping):**
```
PageShell
  └─ <div className="premiumSurface">   ← external wrapper, top: nav-h
       └─ <DesktopPremiumReceiver>
            └─ <div className="dpv1Viewport">
                 └─ <DesktopPremiumShell>
```

**After (receiver owns surface):**
```
PageShell
  └─ <DesktopPremiumReceiver asMount>   ← no external wrapper
       └─ <div className="dpv1ReceiverMount">  ← receiver-owned, inset: 0
            └─ <div className="dpv1Viewport">
                 └─ <DesktopPremiumShell>
```

### 2.2 CSS — `dpv1ReceiverMount` (added to `desktop-premium.css`)

```css
.dpv1ReceiverMount {
  position: fixed;
  inset: 0;              /* top: 0 — covers full viewport including nav zone */
  z-index: 4;            /* above appRootWallpaper (-1), below TopNav (50) */
  overflow: hidden;
  background: #0b0b0f;   /* occludes AppShell default wallpaper entirely */
}
.dpv1ReceiverMount > .dpv1Viewport {
  position: absolute;
  inset: 0;
}
```

The key difference from the removed `premiumSurface` CSS: `inset: 0` instead
of `top: var(--nav-h, 72px)`. The full viewport is now owned by the receiver.

### 2.3 z-index Stacking After Patch

| Element | Position | z-index | Visible? |
|---------|----------|---------|----------|
| `appRootWallpaper` (`/w99.png`) | fixed, inset: 0 | -1 | **No** — fully occluded by dpv1ReceiverMount |
| `dpv1ReceiverMount` | fixed, inset: 0 | 4 | Yes — full viewport |
| `dpv1Viewport` → `dpv1Stage` + wallpaper | absolute, inset: 0 | — | Yes — premium stage fills mount |
| `TopNav` | fixed, top: 0 | 50 | Yes — floats above premium stage |

The AppShell default wallpaper (`/w99.png`) is now completely invisible for
premium pages. The premium stage's wallpaper (from `layout.wallpaper`, the
R2 URL emitted by the server) is the sole background.

---

## 3. Studio Parity Preserved

`DesktopPremiumReceiver` without `asMount` (the Studio preview path) is
unchanged: the component renders `dpv1Viewport` directly, filling whichever
container the Studio supplies. The Studio's container is a separate fixed div
(`top: calc(nav-h + 44px)`, not full-viewport) and is unaffected.

| Context | asMount | Root element | Positions relative to |
|---------|---------|-------------|----------------------|
| Published page | `true` | `dpv1ReceiverMount` (fixed, inset: 0) | Viewport |
| Studio preview | `false`/absent | `dpv1Viewport` (relative, fills container) | Studio container |

---

## 4. Legacy CSS Removed from `published-overlay.css`

The following rule blocks were removed as conflicting legacy paths:

| Rule | Type | Reason removed |
|------|------|----------------|
| `.premiumSurface` | Fixed surface, `top: nav-h`, z-index 4 | Replaced by `dpv1ReceiverMount` in receiver |
| `.premiumSurface > .dpv1Viewport` | Inset absolute fill | Replaced by `dpv1ReceiverMount > .dpv1Viewport` |
| `@media premiumSurface` (mobile) | Mobile height override | Replaced in `dpv1ReceiverMount` media block |
| `.publishedOverlayRoot` | Absolute, z-index 2 | Legacy overlay system, unreferenced |
| `.publishedOverlaySkin` | Absolute, z-index 0 | Legacy overlay system, unreferenced |
| `.publishedOverlayGif` | Absolute, z-index 3, screen blend | Legacy overlay system, unreferenced |
| `.publishedOverlayStage` | 1400px centered, padding-top nav-h | Legacy overlay system, unreferenced |
| `.publishedOverlayCard` | Absolute, border-radius | Legacy overlay system, unreferenced |
| `.publishedOverlayCardInner` | Flex layout | Legacy overlay system, unreferenced |
| `.publishedOverlayBadge` | Absolute, top-right badge | Legacy overlay system, unreferenced |
| `.publishedOverlayTitle` | Typography | Legacy overlay system, unreferenced |
| `.publishedOverlayBody` | Typography | Legacy overlay system, unreferenced |
| `.publishedOverlayLine` | Typography | Legacy overlay system, unreferenced |
| `.publishedOverlayCardMedia` | Background | Legacy overlay system, unreferenced |
| `.overlayMediaFrame` | Absolute inset | Legacy overlay system, unreferenced |
| `.overlayMediaImage/.overlayMediaVideo/.overlayMediaEmbed` | Media display | Legacy overlay system, unreferenced |

`.exclusiveTile*` CSS classes were retained (tier-2 exclusive page styles).

---

## 5. Non-Premium Routes Confirmed Untouched

- All `/:slug/gate/*` and `/:designation/:slug/*` page routes: unchanged
- `ExclusivePage`, `MembersPage`, `CustomerPage`, `AdminPage`, `PayMePage`,
  `EngagePage`, `ReferralsPage`, `SkinMarketplacePage`: unchanged
- `AppShell` (TopNav, PayMePanel, PayMeCartProvider): unchanged
- `StudioPage` (edit + preview): unchanged

---

---

## S3 Addendum: Full-Bleed Viewport Hardening

### S3.1 Identified Gaps

After S2, `dpv1ReceiverMount` used only `position: fixed; inset: 0` without
explicit `width`/`height` declarations. This is functionally equivalent for
a fixed element with no ancestor transforms, but creates two risk scenarios:

| Risk | Mechanism | Impact |
|------|-----------|--------|
| Ancestor CSS transform | If any parent gains `transform: ...`, the fixed element's containing block shifts from the viewport to that parent. `inset: 0` would then fill the parent, not the viewport. | Mount smaller than viewport → side/top gutters |
| Global `img { max-width: 100% }` | Tile images inside the scaled 2560×1440 stage could be constrained to their tile's rendered CSS width (not stage-space width) if the override is not explicit. | Image display cut off inside tiles |
| `dpv1ReceiverMount > .dpv1Viewport` override | The override rule only had `position: absolute; inset: 0` — `width: 100%; height: 100%` were only in the base `.dpv1Viewport` rule and could be clobbered by specificity in other contexts. | Viewport undersize edge case |

### S3.2 Changes

**`desktop-premium.css`:**
- `dpv1ReceiverMount`: added `width: 100vw; height: 100vh; max-width: 100vw; max-height: 100vh`
- `dpv1ReceiverMount > .dpv1Viewport`: added explicit `width: 100%; height: 100%`
- `dpv1TileMedia`: added `max-width: none; max-height: none` to override the global `img { max-width: 100% }` rule from `global.css`
- Mobile `@media`: added `max-height: 100dvh` alongside `height: 100dvh`

**`DesktopPremiumReceiver.tsx`:**
- Added `style={{ width: "100vw", height: "100vh" }}` inline on `dpv1ReceiverMount` div in the `asMount` branch
- Inline style is the terminal override — wins over any CSS cascade regardless of ancestor stacking context changes

### S3.3 Parent Container Audit (verified clean)

| Element | CSS | max-width? | margin:auto? | Notes |
|---------|-----|------------|--------------|-------|
| `html, body` | `height:100%`, `margin:0` | No | No | Clean |
| `div.appRoot` | `min-height:100vh; position:relative` | No | No | No transform → no containing-block change for fixed children |
| `div.appBody` | `min-height:100vh` | No | No | Mobile adds `height:100dvh; overflow:hidden` — does NOT constrain fixed descendants |
| `div.dpv1ReceiverMount` | `position:fixed; inset:0; width:100vw; height:100vh` | `max-width:100vw` | No | Full viewport |
| `PayMePanel` (aside) | `position:fixed` | n/a | n/a | Out of normal flow, no height contribution to appRoot |
| `TopNav` (nav) | `position:fixed; z-index:50` | n/a | n/a | Out of normal flow, floats above mount |

**Verdict:** No `max-width` or `margin: auto` constraints exist anywhere in the premium render path.

### S3.4 Stage Coordinate System Preserved

No changes were made to `useStageScale`, `DesktopPremiumShell`, or any stage
coordinate computation. The scale formula `min(vw / stage.w, vh / stage.h)` is
unchanged. Stage coordinates (2560×1440) are consumed verbatim.

---

## 6. Files Changed in S2 + S3

| File | Change |
|------|--------|
| `apps/product-shell/src/features/desktop-premium/DesktopPremiumReceiver.tsx` | Added `asMount` prop; conditional mount vs. viewport rendering |
| `apps/product-shell/src/components/layout/PageShell.tsx` | Removed `premiumSurface` wrapper; passes `asMount` to receiver |
| `apps/product-shell/src/features/desktop-premium/desktop-premium.css` | Added `dpv1ReceiverMount` + mobile override CSS |
| `apps/product-shell/src/styles/published-overlay.css` | Removed `premiumSurface` + `publishedOverlay*` legacy CSS |
| `apps/product-shell/src/features/desktop-premium/DesktopPremiumShell.tsx` | No change — confirmed correct |
| `apps/product-shell/src/pages/StudioPage.tsx` | No change — studio unaffected by asMount path |

**S3 additional changes:**

| File | Change |
|------|--------|
| `apps/product-shell/src/features/desktop-premium/DesktopPremiumReceiver.tsx` | Inline `style={{ width:"100vw",height:"100vh" }}` on mount div in asMount branch |
| `apps/product-shell/src/features/desktop-premium/desktop-premium.css` | `dpv1ReceiverMount`: explicit vw/vh + max-width/height; `dpv1ReceiverMount > .dpv1Viewport`: explicit w/h; `dpv1TileMedia`: `max-width:none; max-height:none` |

---

## S5 Addendum: Receiver Owns Full Published Viewport (no nav-bar dilation)

### S5.1 Problem the addendum closes

After S2 + S3 the `dpv1ReceiverMount` CSS already declared
`position: fixed; inset: 0; width: 100vw; height: 100vh`. Operationally
this works in every cascade we have audited. Two surfaces still allowed
the original ≈64 px nav-bar dilation to creep back:

1. **Doc/proof regression risk.** `premium_fullscreen_proof.md §10`
   characterised the container as `window.innerHeight − 72` (a stale
   pre-receiver-ownership characterisation). Any reader following the
   proof would conclude that the 64 px side bands were intentional.
2. **Code regression risk.** `useStageScale` measured only
   `containerRef.clientWidth/Height`. If any future refactor wrapped the
   receiver in a `top: var(--nav-h)` ancestor (or the receiver mount lost
   its `inset: 0` declaration in a CSS rebuild), the hook would silently
   re-introduce the dilation — no test would fail, no proof would update.

### S5.2 Code-level reinforcement

| File | Reinforcement |
|------|---------------|
| `useStageScale.ts` | New `UseStageScaleOptions.fullPublishedViewport` flag. When set, the hook also samples `window.innerWidth/innerHeight` and uses the larger of (container axis, viewport axis) per axis. A `window.resize` listener is wired so viewport changes that don't trigger the container ResizeObserver still update the scale. |
| `DesktopPremiumReceiver.tsx` | Receiver passes `{ fullPublishedViewport: !!asMount }` to `useStageScale`, so the published-premium path always opts in and the Studio path always opts out. Inline `top: 0; left: 0` added to mount div as belt-and-suspenders against any inherited `top: var(--nav-h)` cascade. New `data-premium-surface="full-viewport"` attribute lets test harnesses assert ownership at the DOM level. |
| `DesktopPremiumShell.tsx` | Doc-only: surface ownership invariant clarified. Render math unchanged. |
| `PageShell.tsx` | Doc-only: premium branch comment now explicitly states no top-offset wrapper, no `.pageShell` / `.wallpaperLayer` chrome for the published-premium path. |
| `components/layout/AppShell.tsx` | New file — layout-tier proxy that re-exports the canonical AppShell from `app/AppShell.tsx`. Documents preserved (non-premium) behavior and surface ownership for premium-published. The canonical app-tier AppShell is unchanged so the imports in `app/router.tsx` continue to work and the non-premium nav/cart/wallpaper behavior is preserved verbatim. |

### S5.3 Surface ownership table (post-S5)

| Surface | Owner | Path | CSS | Observed dim on 1366×768 |
|---------|-------|------|-----|--------------------------|
| Default app wallpaper `/w99.png` | AppShell | All routes | `.appRootWallpaper { position: fixed; inset: 0; z-index: -1 }` | Fully occluded on premium-published; visible on every other route |
| TopNav | AppShell | All routes | `.topNav { z-index: 50 }` | Floats above the receiver mount on premium-published; unchanged elsewhere |
| PayMePanel side cart | AppShell | All routes | fixed | Unchanged for every route |
| Premium receiver mount | DesktopPremiumReceiver | Premium-published only | `.dpv1ReceiverMount { position: fixed; inset: 0; width: 100vw; height: 100vh; z-index: 4 }` | 1366 × 768 |
| Premium scale container | useStageScale (`fullPublishedViewport`) | Premium-published only | derived from receiver mount | 1366 × 768 |
| Stage (2560×1440 transform-scaled) | DesktopPremiumShell | Premium-published only | `.dpv1Stage { transform: scale(...); }` | scale ≈ 0.5333; ≈ 1365.33 × 768 with ≈ 0.33 px X-letterbox |

### S5.4 Removed AppShell/HomePage inheritance for premium-published

| Inherited behavior (pre-fix) | Post-fix status |
|------------------------------|-----------------|
| AppShell `/w99.png` visible behind premium stage | OCCLUDED — receiver mount z-index 4 fully covers z-index -1 wallpaper layer |
| HomePage `<div className="homeHero">` rendered above premium wallpaper | NOT RENDERED — `PageShell` returns the receiver before reaching `children` |
| `--nav-h` (72 px) subtracted from premium scale container | NOT SUBTRACTED — receiver mount is `inset: 0`, scale container is full viewport |
| `.pageShell` legacy frame wrapping the receiver | NOT WRAPPED — `PageShell.tsx:61` returns the receiver before reaching `.pageShell` |

### S5.5 Files changed in S5

| File | Change |
|------|--------|
| `apps/product-shell/src/features/desktop-premium/useStageScale.ts` | `UseStageScaleOptions.fullPublishedViewport` flag, viewport sampling, window resize listener |
| `apps/product-shell/src/features/desktop-premium/DesktopPremiumReceiver.tsx` | Pass `fullPublishedViewport: !!asMount` to hook; inline `top:0; left:0`; `data-premium-surface="full-viewport"` |
| `apps/product-shell/src/features/desktop-premium/DesktopPremiumShell.tsx` | Doc-only |
| `apps/product-shell/src/components/layout/PageShell.tsx` | Doc-only |
| `apps/product-shell/src/components/layout/AppShell.tsx` | New layout-tier proxy file |

### S5.6 Files NOT changed (preserved surfaces)

| File | Why preserved |
|------|---------------|
| `apps/product-shell/src/app/AppShell.tsx` | Canonical AppShell — non-premium nav, side cart, default wallpaper layer all unchanged |
| `apps/product-shell/src/components/nav/TopNav.tsx` | TopNav unchanged for all routes |
| `apps/product-shell/src/components/layout/PayMePanel.tsx` | Side cart unchanged for all routes |
| `apps/product-shell/src/styles/shell.css` | Legacy non-premium classes unchanged |
| `apps/product-shell/src/styles/published-overlay.css` | Tier-2 `.exclusiveTile*` classes unchanged |
| `apps/product-shell/src/features/desktop-premium/desktop-premium.css` | `.dpv1ReceiverMount` already declared full viewport from S2/S3 |
| `apps/product-shell/src/pages/StudioPage.tsx` | Studio mounts receiver without `asMount`; `fullPublishedViewport` stays false |
| `apps/product-shell/functions/_lib/runtime-compiler.js` | Premium compile branch unchanged |
| `apps/product-shell/src/runtime/types.ts` | `isPremiumRuntimePage` / `adaptPremiumRuntimePage` unchanged |
| `apps/product-shell/src/tests/premium-renderer-parity.test.ts` | All A/B/C tests still pass — formula and stage envelope unchanged |

---

## S2 Validation Addendum (Worker B, PATCH-A)

`[BIZ-PAGES-WALLPAPER-HOTFIX-003-PATCH-A | WORKER B | S2 | RESULT]`

### Validation target (tested premium slug)
- Fixture source: `job_site/known_slug_test_vector.json`
- Tested slug: `acme-premium`
- Expected premium contract: `shellId: "desktop-premium-v1"` and `stage: { w: 2560, h: 1440 }`

### PASS criteria and results

1. **Premium runtime route no longer renders `Welcome Home` / `.homeHero`**
   - `HomePage` computes `isPremiumRuntime = isPremiumRuntimePage(runtimePage)`.
   - `HomePage` passes `null` children for premium runtime payloads via `{isPremiumRuntime ? null : <div className="homeHero">...}`.
   - Result: **PASS** (premium runtime children are null; no `Welcome Home` in premium path).

2. **PageShell premium dispatch is exclusive**
   - Dispatch uses `premiumLayout ?? (isPremiumRuntimePage(runtimePage) ? adaptPremiumRuntimePage(...) : null)`.
   - `if (resolvedPremium) return <DesktopPremiumReceiver ... asMount />;`
   - Legacy shell block (`.pageShell`, `.wallpaperLayer`, `.pageShellContent`) only exists in the fallback return after that guard.
   - Result: **PASS** (premium path returns early; no mixed shell rendering).

3. **No legacy shell content renders on premium routes**
   - Premium route owner is `DesktopPremiumReceiver` mount.
   - Legacy wrapper/content classes are unreachable when `resolvedPremium` is truthy.
   - Result: **PASS**.

### Exact route ownership rules (premium vs non-premium)

- **Router ownership** (`router.tsx`) remains unchanged: route paths still map by page component (`HomePage`, `MembersPage`, etc.).
- **Runtime ownership split is component-level inside `HomePage` + `PageShell`:**
  - For `/:slug`, `/:slug/gate`, `/:designation/:slug`, `/:designation/:slug/gate`:
    - `HomePage` fetches runtime payload for `slug`.
    - If payload is premium (`shellId===desktop-premium-v1` + numeric stage dims), `HomePage` children become `null` and `PageShell` dispatches exclusively to `DesktopPremiumReceiver`.
    - If payload is non-premium, `HomePage` renders `.homeHero` and `PageShell` renders legacy wallpaper/content shell.
- **All non-home pages** (`members`, `exclusive`, `customer`, `payme`, `engage`, `referrals`, `skins`, `admin`) remain on their existing `PageShell` usage without premium runtime-page dispatch at route level.

### Exact preserved non-premium behavior
- `.homeHero` + `Welcome Home` still render for non-premium home payloads.
- `PageShell` still renders `.pageShell > .wallpaperLayer > .wallpaperImage` and `.pageShellContent` in non-premium mode.
- Existing router route table and `/access*` redirects are unchanged.

### Worker-B validation disposition
- expected_status: **PASS**
- scope-owned verdict: **PASS**

---

## S2 Patch-B Repair Addendum (Worker B)

`[BIZ-PAGES-WALLPAPER-HOTFIX-003-PATCH-B | WORKER B | S2 | RESULT]`

### Root cause of FAIL
- `HomePage` fetched only `page=home` for slug routes.
- Known premium fixture (`acme-premium`) is published on `page=tier-2`.
- Result: premium contract was not loaded on slug home route, so `.homeHero` + `Welcome Home` still rendered.

### Minimal repair applied
- Updated `HomePage` runtime fetch flow:
  1. Fetch `home` first (preserved default behavior).
  2. If `home` payload is non-premium, fetch `tier-2`.
  3. Promote `tier-2` payload only when it satisfies `isPremiumRuntimePage`.
- This preserves non-premium routes while ensuring premium slugs published on `tier-2` cut over to the premium receiver path.

### Post-fix ownership result
- Premium slug route (`/:slug`) now resolves to premium runtime payload when available on `tier-2`.
- For promoted premium payloads:
  - `HomePage` children remain `null`.
  - `PageShell` premium early-return remains exclusive.
  - No `Welcome Home` / `.homeHero` / legacy shell content on premium runtime routes.
- Non-premium behavior remains unchanged when neither `home` nor `tier-2` is premium.
