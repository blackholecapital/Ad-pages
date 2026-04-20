form_id: premium_route_contract
job_id: BIZ-PAGES-WALLPAPER-HOTFIX-003
stage: S1
produced_by: derived from direct code analysis (Worker A document; Worker A did not run before Worker B)
source_files:
  - apps/product-shell/src/components/layout/PageShell.tsx
  - apps/product-shell/src/runtime/types.ts
  - apps/product-shell/src/features/desktop-premium/DesktopPremiumReceiver.tsx
  - apps/product-shell/src/styles/published-overlay.css

# Premium Route Contract

## 1. Decision Rule

Premium slug ownership is determined at the `PageShell` component boundary
(`apps/product-shell/src/components/layout/PageShell.tsx`).

When the compiled runtime payload satisfies the following guard the page mounts
the canonical `DesktopPremiumReceiver` instead of the legacy wallpaper+content
frame:

```
isPremiumRuntimePage(runtimePage) === true
```

`isPremiumRuntimePage` is defined in
`apps/product-shell/src/runtime/types.ts:117-130`:

```ts
return (
  !!p &&
  p.shellId === PREMIUM_SHELL_ID &&           // "desktop-premium-v1"
  !!p.stage &&
  typeof p.stage.w === "number" &&
  typeof p.stage.h === "number"
);
```

**Exact decision rule (plain language):**
> A published runtime page is premium if and only if its compiled payload
> carries `shellId === "desktop-premium-v1"` and a `stage` object with
> numeric `w` and `h` fields. Any payload missing `shellId`, carrying a
> different `shellId` value, or missing valid `stage` dims is treated as
> non-premium and rendered through the legacy path.

## 2. Dispatch Priority (no overlap)

PageShell evaluates dispatch in this order
(`apps/product-shell/src/components/layout/PageShell.tsx:53-70`):

1. **`premiumLayout` prop supplied** — render `DesktopPremiumReceiver` directly.
2. **`runtimePage` supplied AND `isPremiumRuntimePage(runtimePage)` is true** —
   adapt via `adaptPremiumRuntimePage(runtimePage, wallpaperUrl)` and render
   `DesktopPremiumReceiver`.
3. **Otherwise** — render legacy `.wallpaperLayer` + `.pageShellContent` frame.

## 3. Exclusive Mount Block

When the premium path is taken, `PageShell` returns immediately:

```tsx
<div
  className="premiumSurface"
  data-shell={PREMIUM_SHELL_ID}
  data-premium-stage-w={resolvedPremium.stage.w}
  data-premium-stage-h={resolvedPremium.stage.h}
>
  <DesktopPremiumReceiver layout={resolvedPremium} />
</div>
```

The legacy wallpaper+content block is **not rendered** in this branch. There is
no code path that combines the legacy layer with the premium receiver. The `if
(resolvedPremium) { return …; }` guard at PageShell.tsx:59 is the single gate.

## 4. CSS Surface

`.premiumSurface` declared in
`apps/product-shell/src/styles/published-overlay.css:9-25`:

```css
.premiumSurface {
  position: fixed;
  left: 0; right: 0;
  top: var(--nav-h, 72px);
  bottom: 0;
  z-index: 4;          /* above appRootWallpaper (-1) and appBody (3) */
  overflow: hidden;
  background: #0b0b0f;
}
.premiumSurface > .dpv1Viewport {
  position: absolute;
  inset: 0;
  width: 100%; height: 100%;
}
```

This surface fills the full viewport below the top nav and provides the
container for the `DesktopPremiumReceiver`'s `useStageScale` scaling loop.

## 5. Receiver Scaling Contract

`DesktopPremiumReceiver` (`apps/product-shell/src/features/desktop-premium/DesktopPremiumReceiver.tsx`)
calls `useStageScale(viewportRef, layout.stage)`.

`useStageScale` formula (`useStageScale.ts:77-80`):
```
scale    = min(containerW / stage.w, containerH / stage.h)
offsetX  = (containerW - stage.w * scale) / 2
offsetY  = (containerH - stage.h * scale) / 2
```

Desktop target envelope constant: `DESKTOP_TARGET_ENVELOPE = { w: 2560, h: 1440 }`.
Stage dims are consumed verbatim from the runtime payload — no re-interpretation.

## 6. Pre-Patch State (Legacy Shell Ownership)

Before S2 of BIZ-PAGES-PROD-DETANGLE-002, `PageShell` had no premium dispatch:
- No import of `DesktopPremiumReceiver` or `isPremiumRuntimePage`.
- All published slug routes rendered through `.wallpaperLayer` + children regardless
  of `shellId` or `stage` fields in the payload.
- `DesktopPremiumReceiver` was only mounted by `StudioPage.tsx:87` in preview mode.

## 7. Post-Patch Verification

| Check | File:Line | Result |
|-------|-----------|--------|
| PageShell imports DesktopPremiumReceiver | PageShell.tsx:3 | PASS |
| PageShell imports isPremiumRuntimePage | PageShell.tsx:10-12 | PASS |
| isPremiumRuntimePage guard gates premium branch | PageShell.tsx:53-57 | PASS |
| Legacy block unreachable when premium fires | PageShell.tsx:59 (return) | PASS |
| Premium receiver mounts with full-bleed CSS | published-overlay.css:9 | PASS |
| StudioPage preview still uses receiver directly | StudioPage.tsx:87 | PASS (unchanged) |

## 8. First-Paint Ownership Rule (Published Slug Routes)

For slug-bearing Home routes (`/:slug`, `/:slug/gate`, `/:designation/:slug`,
`/:designation/:slug/gate`), `HomePage` now defers `PageShell` mounting until
runtime resolution completes.

Gate conditions in `HomePage.tsx`:
- `isSlugRoute === true`
- `runtimeResolved === false`
- `runtimePage === null`

When all conditions hold, Home returns a neutral pending node and **does not
render**:
- legacy `homeHero`
- legacy `PageShell` wallpaper/content frame

This blocks first-paint fallback to legacy chrome on premium-intended slugs
while preserving non-slug Home behavior.
