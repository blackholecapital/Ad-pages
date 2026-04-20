# Renderer Change Manifest (S2 / Worker A)

job_id: BIZ-PAGES-PROD-DETANGLE-002
stage: S2
references:
- /job_site/runtime_parity_matrix.md
- /job_site/wallpaper_renderer_fault_report.md
- /job_site/reference_repo_gateway/gateway-integration-main
- /job_site/build-sheet-active.txt

Goal: eliminate the mixed legacy/static + premium overlay render behavior
identified in S1. Dispatch on `shellId`. Consume `stage`, wallpaper and tile
coordinates verbatim. Full-viewport fill with aspect-preserving centering
against an explicit operator desktop target envelope.

All mirror paths below resolve under
`/job_site/repo_mirror/Biz-Pages-FB-frozen-main/` ↔ repo root.

## 1. Files changed

| # | File                                                                 | Change type |
|---|----------------------------------------------------------------------|-------------|
| 1 | `apps/product-shell/src/runtime/types.ts`                            | extended    |
| 2 | `apps/product-shell/src/features/desktop-premium/useStageScale.ts`   | rewrite     |
| 3 | `apps/product-shell/src/features/desktop-premium/DesktopPremiumShell.tsx` | rewrite |
| 4 | `apps/product-shell/src/features/desktop-premium/DesktopPremiumReceiver.tsx` | rewrite |
| 5 | `apps/product-shell/src/components/layout/PageShell.tsx`             | rewrite     |
| 6 | `apps/product-shell/src/styles/published-overlay.css`                | extended    |

No other source files were modified. `StudioPage.tsx`, `DesktopPremiumStudio.tsx`,
`shellConfig.ts` are compatible by widening direction: `shellConfig`'s
`PremiumShellLayout` literal-typed `{ w: 2560; h: 1440 }` is structurally
assignable to the runtime contract's widened `{ w: number; h: number }`.

## 2. Premium dispatch seam

S1 finding (`runtime_parity_matrix.md` §1): `DesktopPremiumReceiver` was only
mounted inside `StudioPage` preview. Every Biz route rendered through
`PageShell` with no awareness of `shellId`.

S2 fix: `PageShell` now has two discriminators — `premiumLayout` (direct
`PremiumShellLayout`) or `runtimePage` (compiled `PublishedRuntimePage`).
When either indicates a premium payload, `PageShell` mounts
`DesktopPremiumReceiver` full-bleed inside `.premiumSurface` and **skips
every legacy wallpaper/content frame element**. This is the single premium
render path.

```
               ┌──────────────────────────────────────────────┐
runtimePage ──▶│ isPremiumRuntimePage → adaptPremiumRuntimePage│─▶ PremiumShellLayout
               └──────────────────────────────────────────────┘            │
                                                                           ▼
                               ┌──────────────────────────────────────────────┐
premiumLayout ────────────────▶│ .premiumSurface > DesktopPremiumReceiver     │
                               └──────────────────────────────────────────────┘
                                         │
                                         ▼
                     ┌──────────────────────────────────────┐
                     │ dpv1Viewport (full-bleed container)  │
                     │   useStageScale(ref, layout.stage)   │
                     │   └─ DesktopPremiumShell             │
                     │        stageDims = layout.stage      │  ← verbatim
                     │        wallpaperUrl = layout.wallpaper│  ← verbatim
                     │        tilesLayer = layout.tiles     │  ← verbatim
                     └──────────────────────────────────────┘
```

No legacy surface is reachable when a premium payload arrives.

## 3. Runtime contract additions (`runtime/types.ts`)

New exports (additive only — pre-existing types untouched):

- `PREMIUM_SHELL_ID` — canonical `"desktop-premium-v1"` constant.
- `PremiumShellId` — `typeof PREMIUM_SHELL_ID`.
- `PremiumStageDims` — `{ w: number; h: number }`.
- `isPremiumRuntimePage(p)` — type guard that narrows
  `PublishedRuntimePage` to one carrying `shellId + stage`.
- `adaptPremiumRuntimePage(page, wallpaperUrl?)` — produces a canonical
  `PremiumShellLayout` from a narrowed page; the caller supplies the
  already-resolved wallpaper URL (since the runtime payload carries a code,
  not a URL — wallpaper URL resolution belongs at the caller boundary, not
  inside the type contract).

`PublishedRuntimePage` extended with three optional fields:

```ts
shellId?: PremiumShellId;
stage?: PremiumStageDims;
tiles?: PremiumStageTile[];  // stage-space coordinates, no reinterpretation
```

The server-side compiler (`functions/_lib/runtime-compiler.js:75-80`) already
emits `shellId + stage` for premium pages; S2 wires the type-level consumer
for the first time. `tiles` is reserved for the studio-save → runtime flow in
a later stage — the runtime contract is now ready for it.

## 4. Stage scale and target envelope (`useStageScale.ts`)

- New exported constant `DESKTOP_TARGET_ENVELOPE = { w: 2560, h: 1440 }` —
  operator desktop target envelope. Single source of truth for the scale-1
  reference size.
- New exported constant `DEFAULT_PREMIUM_STAGE` — mirrors `shellConfig.stage`
  without duplicating literals for consumers that only need the dims.
- `useStageScale(containerRef, stage?, options?)`:
  - `stage` now accepted as a parameter (defaults to `DEFAULT_PREMIUM_STAGE`).
  - Scale formula unchanged: `min(vw/stage.w, vh/stage.h)`. This preserves
    aspect ratio and fills the full container on the limiting axis, with
    letterboxing (stage-space background) on the non-limiting axis. That
    matches the build-sheet requirement to "fit the full available viewport
    while preserving stage aspect ratio and centering."
  - `StageScaleState` now includes `stageW, stageH` so downstream consumers
    can never drift from the envelope the scale was computed against.
- `makeToStageCoords` unchanged (pointer math still correct with widened
  state shape; no consumer reads `stageW/stageH` for coordinate conversion).

## 5. Shell geometry (`DesktopPremiumShell.tsx`)

- New prop `stageDims: StageDims` (optional — falls back to
  `scaleState.stageW/H` captured in the scale state).
- New prop `targetEnvelope?: StageDims` (defaults to `DESKTOP_TARGET_ENVELOPE`).
- Emits verification attributes on the stage element:
  `data-shell`, `data-stage-w`, `data-stage-h`,
  `data-target-envelope-w`, `data-target-envelope-h`.
- Wallpaper layer unchanged behaviorally (`cover` fit); now documented that
  `wallpaperUrl` is consumed **verbatim** — no code-to-URL resolution inside
  the shell.

## 6. Receiver (`DesktopPremiumReceiver.tsx`)

- Signature unchanged: `{ layout: PremiumShellLayout }`.
- Import of `PremiumShellLayout` / `PremiumStageTile` moved from
  `shellConfig.ts` (literal `2560×1440`) to `runtime/types.ts` (widened
  `number`) — aligning with the runtime contract so server-driven stage
  dims pass through without reinterpretation.
- Receiver viewport now emits `data-shell`, `data-stage-w`, `data-stage-h`,
  `data-target-envelope-w`, `data-target-envelope-h` for audit + test hooks.
- Stage dims passed to `useStageScale(viewportRef, layout.stage)` — no
  default, no constant, the payload is the source of truth.
- Wallpaper URL threaded through unchanged.
- Tile coordinates rendered with `left/top/width/height/zIndex` exactly as
  received (no scaling, no re-anchoring). Stage-space → screen-space
  conversion happens entirely via the `dpv1Stage` CSS transform.

## 7. PageShell (`components/layout/PageShell.tsx`)

- Back-compat preserved for all existing call sites (no new required props).
- Adds two optional props:
  - `premiumLayout?: PremiumShellLayout | null` — direct payload.
  - `runtimePage?: PublishedRuntimePage | null` — narrowed via
    `isPremiumRuntimePage` + adapted via `adaptPremiumRuntimePage`.
- Resolution order: `premiumLayout` wins, else `runtimePage` if premium,
  else legacy.
- When premium, renders **only** `<div class="premiumSurface">
  <DesktopPremiumReceiver layout=… /></div>` — no legacy wallpaper layer,
  no content frame. This eliminates the three-wallpaper problem from
  `wallpaper_renderer_fault_report.md` §2: in the premium path only
  `DesktopPremiumShell`'s `cover`-fit wallpaper paints.

## 8. `.premiumSurface` CSS (`styles/published-overlay.css`)

- New rule block added above existing `.publishedOverlayRoot`:
  ```
  .premiumSurface {
    position: fixed;
    left: 0; right: 0; top: var(--nav-h, 72px); bottom: 0;
    z-index: 4;          /* above appRootWallpaper (-1), below nav */
    overflow: hidden;
    background: #0b0b0f;
    pointer-events: auto;
  }
  .premiumSurface > .dpv1Viewport { position: absolute; inset: 0; width:100%; height:100%; }
  @media (max-width: 900px) { .premiumSurface { height: calc(100dvh - var(--nav-h, 72px)); bottom: auto; } }
  ```
- Position rationale: fixed so iframe/modal stacking can't collapse it;
  `top: var(--nav-h)` keeps the `TopNav` visible (canonical navigation
  surface remains); bottom: 0 fills remaining viewport height; z-index 4 sits
  above the AppShell root wallpaper (`z-index: -1`) and the legacy content
  frame (`z-index: 3`) so any stray legacy paint is fully covered.
- Mobile branch uses `100dvh` to survive URL-bar collapse, matching the
  existing `.pageShell` mobile treatment in `shell.css`.

## 9. Non-changes (explicit)

- `apps/product-shell/src/app/AppShell.tsx` — unchanged. The static
  `/w99.png` default wallpaper remains for legacy-path pages. The premium
  surface covers it whenever a premium payload dispatches.
- `apps/product-shell/src/styles/shell.css` — `.wallpaperImage`
  `background-size: contain` remains (legacy path only). The premium
  surface no longer passes through `.wallpaperImage`; it renders the
  `cover`-fit `.dpv1Wallpaper` inside `DesktopPremiumShell`. The legacy
  cosmetic is deferred to a later stage.
- `apps/product-shell/functions/**` — no server-side changes in S2; the
  server already emits `shellId + stage` correctly. Tile emission in the
  `tiles` field is a future stage.
- Page files (`ExclusivePage.tsx`, `HomePage.tsx`, etc.) — unchanged in S2.
  They can opt into the premium path by passing `runtimePage` or
  `premiumLayout` to `PageShell`; rollout is left to the next stage so the
  dispatch seam can be verified without touching every caller at once.

## 10. Verification hooks

DOM attributes for audit / visual-regression tooling:

| Element                | Attribute                   | Value                  |
|------------------------|------------------------------|------------------------|
| `.premiumSurface`      | `data-shell`                 | `desktop-premium-v1`   |
| `.premiumSurface`      | `data-premium-stage-w`       | `2560` (from payload)  |
| `.premiumSurface`      | `data-premium-stage-h`       | `1440` (from payload)  |
| `.dpv1Viewport`        | `data-shell`                 | `desktop-premium-v1`   |
| `.dpv1Viewport`        | `data-stage-w` / `-h`        | payload stage dims     |
| `.dpv1Viewport`        | `data-target-envelope-w/h`   | `2560 / 1440`          |
| `.dpv1Stage`           | `data-stage-w` / `-h`        | payload stage dims     |
| `.dpv1Stage`           | `data-target-envelope-w/h`   | `2560 / 1440`          |

## 11. Backward compatibility

- `<PageShell>` with no props → legacy render (default black body + nav).
- `<PageShell wallpaperUrl="…">` → legacy render with URL wallpaper.
- `<PageShell premiumLayout={…}>` → premium full-bleed receiver.
- `<PageShell runtimePage={page}>` where `page.shellId === "desktop-premium-v1"`
  → premium full-bleed receiver (wallpaper URL comes from the optional
  `wallpaperUrl` prop on the same render).
- Studio path (`StudioPage → DesktopPremiumReceiver`) continues to work
  because literal-typed shellConfig `PremiumShellLayout` is assignable to
  the widened runtime-type `PremiumShellLayout`.

## 12. Out of scope for S2

- Wallpaper code → URL resolver (`resolveWallpaperUrl(code, slug)`). S2
  still consumes whatever URL the caller supplies; code resolution is a
  separate concern and will be added where `PageShell` / Exclusive+friends
  are wired up to runtime fetch.
- Page-level dispatch: pointing `ExclusivePage`, `HomePage`, etc. at the new
  `runtimePage` prop. The dispatch seam is in place; the migration is
  explicitly staged.
- Cloudflare deploy-surface changes (covered by Worker B).
- Wallet-connect consolidation (future stage).
