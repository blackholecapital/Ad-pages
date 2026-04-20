# Premium Stage Scaling Spec — BIZ-PAGES-WALLPAPER-HOTFIX-003 S5

job_id: BIZ-PAGES-WALLPAPER-HOTFIX-003
stage: S5
worker: Worker A
authority: defines the deterministic scaling model that the published
premium receiver applies to the 2560×1440 stage and the surface ownership
contract that supplies the scale container.

required_references:
- /job_site/build-sheet-active.txt
- /job_site/premium_route_contract.md
- /job_site/premium_surface_ownership.md
- /job_site/preserved_functionality_matrix.md

---

## 1. Goal

Eliminate the nav-bar-induced aspect-ratio dilation that produced ≈64 px
dark side bands on standard 16:9 displays for published premium pages.
The premium receiver must own the FULL viewport (100vw × 100vh); the
scale container must NOT be reduced by `--nav-h` (72 px) or any other
fixed-header chrome. Contain semantics (`Math.min(...)`) are preserved —
no switch to `Math.max(...)`.

---

## 2. Scale Formula (unchanged)

`apps/product-shell/src/features/desktop-premium/useStageScale.ts:73-100`

```
scale    = Math.min(containerW / stage.w, containerH / stage.h)
offsetX  = (containerW - stage.w * scale) / 2
offsetY  = (containerH - stage.h * scale) / 2
```

The formula is the same as before this hotfix. **What changed is the
container.** The container is now always the full viewport for the
published-premium path; previously the proof characterised it as
`window.innerHeight - 72`.

---

## 3. Surface Ownership Contract

| Path | Scale container source | Container WxH on a 1366×768 display |
|------|------------------------|-------------------------------------|
| Published premium (asMount=true) | `dpv1ReceiverMount` (fixed; inset:0; 100vw × 100vh) | 1366 × 768 |
| Studio preview (asMount=false / undefined) | Caller-supplied container (Studio sets `top: calc(var(--nav-h)+44px)`) | Studio container box |

The published-premium path drops the AppShell/HomePage wallpaper layering
entirely. The scale container is the receiver's own owning surface.

### 3.1 Code citations

- `apps/product-shell/src/components/layout/PageShell.tsx:61-69` —
  premium branch returns `<DesktopPremiumReceiver ... asMount />` with no
  external wrapper, no `.pageShell`, no `.wallpaperLayer`.
- `apps/product-shell/src/features/desktop-premium/DesktopPremiumReceiver.tsx:96-122` —
  `asMount` branch renders the `dpv1ReceiverMount` div with inline
  `width: 100vw; height: 100vh; top: 0; left: 0`.
- `apps/product-shell/src/features/desktop-premium/desktop-premium.css:314-324` —
  `.dpv1ReceiverMount { position: fixed; inset: 0; width: 100vw;
  height: 100vh; max-width: 100vw; max-height: 100vh; z-index: 4; }`.

### 3.2 Defense-in-depth: useStageScale `fullPublishedViewport` flag

`apps/product-shell/src/features/desktop-premium/useStageScale.ts:60-104`

When the receiver mounts with `asMount`, it passes
`{ fullPublishedViewport: true }` to `useStageScale`. The hook then samples
`window.innerWidth` and `window.innerHeight` and uses the larger of
(container axis, viewport axis) per axis. This guards against any future
regression where an intermediate ancestor reports a clientWidth/Height
smaller than the viewport (e.g. an inadvertent re-introduction of
`top: var(--nav-h)`). The Studio path leaves the flag unset and continues
to measure its own preview box exactly.

A `window.resize` listener is also wired alongside the existing
`ResizeObserver` so the scale tracks viewport changes that don't trigger
the observer (URL-bar collapse, fullscreen toggles).

---

## 4. Worked Example — 1366×768 Display (post-fix)

Before this hotfix:

| Param | Value |
|-------|-------|
| containerW | 1366 |
| containerH | 768 − 72 = 696 |
| containerAR | 1.963 (wider-than-16:9) |
| scale | min(1366/2560, 696/1440) = 0.4833 (height-bound) |
| offsetX | (1366 − 1237) / 2 ≈ 64.5 px (DARK SIDE BANDS) |
| offsetY | 0 |

After this hotfix:

| Param | Value |
|-------|-------|
| containerW | 1366 |
| containerH | 768 |
| containerAR | 1.7786 (≈16:9) |
| scale | min(1366/2560, 768/1440) = min(0.5336, 0.5333) = 0.5333 (height-bound — by 0.06%) |
| offsetX | (1366 − 1365.33) / 2 ≈ 0.33 px (visually no bands) |
| offsetY | 0 |

The container aspect ratio now matches the stage's 16:9 to within 0.06%.
The horizontal letterbox collapses from ≈64 px each side to ≈0.33 px each
side — visually indistinguishable from a perfect fit.

---

## 5. Worked Example — Other Standard 16:9 Displays

| Display | Container WxH (post-fix) | Container AR | Scale | offsetX | offsetY |
|---------|--------------------------|--------------|-------|---------|---------|
| 1366×768 | 1366×768 | 1.7786 | 0.5333 | 0.33 px | 0 |
| 1920×1080 | 1920×1080 | 1.7778 | 0.7500 | 0 | 0 |
| 2560×1440 | 2560×1440 | 1.7778 | 1.0000 | 0 | 0 |
| 3840×2160 | 3840×2160 | 1.7778 | 1.5000 | 0 | 0 |

For every standard 16:9 monitor, the post-fix scale produces zero (or
sub-pixel) side bands. The premium stage now visually fills the full
viewport on the canonical desktop displays.

---

## 6. Operator Target Envelope (2550×1140) — unchanged

The operator's reference desktop envelope (build-sheet §6.5.3) is
2550×1140. This envelope is **wider-than-16:9** (1140/2550 → 16:8.94),
so a horizontal letterbox of ≈261.67 px each side is mathematically
required regardless of which container we use — the stage simply does not
fit the envelope's aspect ratio. This pre-existing letterbox behavior is
preserved verbatim and is exercised by tests `C1`, `C2`, `C3`, `C7` in
`apps/product-shell/src/tests/premium-renderer-parity.test.ts`.

---

## 7. Contain Semantics Preserved

`Math.min(containerW / stage.w, containerH / stage.h)` is **contain**
semantics. We did NOT switch to `Math.max(...)` (cover semantics) because
cover would clip stage-edge tiles on any non-16:9 viewport (e.g. the
operator's 2550×1140 envelope, ultra-wide displays, portrait mobile).
The hotfix preserves the no-clip guarantee proved by tests `C1`–`C7`.

---

## 8. Files Changed in S5

| File | Change |
|------|--------|
| `apps/product-shell/src/features/desktop-premium/useStageScale.ts` | Added `UseStageScaleOptions.fullPublishedViewport`. When set, uses the larger of (container axis, viewport axis) per axis; adds a `window.resize` listener. |
| `apps/product-shell/src/features/desktop-premium/DesktopPremiumReceiver.tsx` | Pass `{ fullPublishedViewport: !!asMount }` to `useStageScale`. Inline `top: 0; left: 0` added to mount div as belt-and-suspenders against any inherited `top: var(--nav-h)` cascade. New `data-premium-surface="full-viewport"` attribute. |
| `apps/product-shell/src/features/desktop-premium/DesktopPremiumShell.tsx` | Doc-only: surface ownership invariant clarified in the docblock. No render math change. |
| `apps/product-shell/src/components/layout/PageShell.tsx` | Doc-only: premium branch comment now explicitly states no top-offset wrapper, no `.pageShell` / `.wallpaperLayer` chrome for the published-premium path. |
| `apps/product-shell/src/components/layout/AppShell.tsx` | New file — layout-tier proxy that re-exports the canonical AppShell from `app/AppShell.tsx`. Documents preserved (non-premium) behavior and premium-published surface ownership. |

---

## 9. Files NOT Changed (preserved surfaces)

| File | Why preserved |
|------|---------------|
| `apps/product-shell/src/app/AppShell.tsx` | Non-premium nav, side cart, default `/w99.png` wallpaper layer all unchanged. The default wallpaper remains the base layer for every non-premium route. |
| `apps/product-shell/src/components/nav/TopNav.tsx` | TopNav floats above the premium receiver mount via z-index 50; no behavior change. |
| `apps/product-shell/src/components/layout/PayMePanel.tsx` | Side cart unchanged for all routes. |
| `apps/product-shell/src/styles/shell.css` | `.appRootWallpaper`, `.pageShell`, `.wallpaperLayer`, `.pageShellContent`, `.contentFrame` rules unchanged. The legacy non-premium path is intact. |
| `apps/product-shell/src/styles/published-overlay.css` | Tier-2 `.exclusiveTile*` classes unchanged. |
| `apps/product-shell/src/features/desktop-premium/desktop-premium.css` | `.dpv1ReceiverMount` already declared `position: fixed; inset: 0; width: 100vw; height: 100vh` from S2/S3. No CSS change required in S5. |
| `apps/product-shell/src/pages/StudioPage.tsx` | Studio mounts the receiver without `asMount`; `fullPublishedViewport` flag stays false; Studio preview path is unchanged. |
| `apps/product-shell/functions/_lib/runtime-compiler.js` | Premium compile branch unchanged; tile coordinates round-trip verbatim. |
| `apps/product-shell/src/runtime/types.ts` | `isPremiumRuntimePage` and `adaptPremiumRuntimePage` unchanged. |

---

## 10. Pass Conditions (S5)

| Condition | Evidence | Status |
|-----------|----------|--------|
| Premium published pages use only the premium stage scaling model | `PageShell.tsx:61-69` early return; `DesktopPremiumReceiver.tsx:96-122` asMount branch | PASS |
| Legacy 1400 px overlay sizing bypassed for the published-premium path | No `.publishedOverlayStage` or `top: var(--nav-h)` wrapper in the premium branch | PASS |
| Premium stage scales as a single fullscreen-controlled surface | `dpv1ReceiverMount` fixed inset:0 100vw×100vh + `fullPublishedViewport` defense | PASS |
| No top-left clipping at the operator target envelope (2550×1140) | tests `C1`, `C2`, `C3`, `C7` | PASS |
| Side bands on standard 16:9 displays disappear | §4 worked example: ≈64 px → ≈0.33 px on 1366×768; 0 px on 1920×1080 / 2560×1440 / 3840×2160 | PASS |
| Contain semantics preserved (no Math.max switch) | `useStageScale.ts:80` — `Math.min(...)` retained | PASS |
| Non-premium navigation behavior preserved | `app/AppShell.tsx` unchanged; `components/layout/AppShell.tsx` is a re-export proxy | PASS |
