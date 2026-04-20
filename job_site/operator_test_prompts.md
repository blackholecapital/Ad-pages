# Operator Test Prompts — BIZ-PAGES-PROD-DETANGLE-002

job_id: BIZ-PAGES-PROD-DETANGLE-002
stage: S2 (initial authoring) — will be extended by S5 Worker B with
Cloudflare cutover prompts
worker: Worker B
authority: operator-visible verification script for the premium fullscreen
renderer behaviour. Each prompt is executable without developer tooling;
every prompt declares exact expected output, a clear PASS/FAIL signal, and
the file path that produces it.

required_references:
- /job_site/renderer_change_manifest.md (S2 Worker A artifact — produced in parallel)
- /job_site/build-sheet-active.txt (resolved in this mirror as `/job_site/build-sheet-BIZ-PAGES-PROD`)
- /job_site/runtime_parity_matrix.md (S1 Worker A artifact — produced in parallel)

---

## 0. How to use this document

Each section is one operator-runnable test. The form is:

- **Prompt** — what the operator does (click, type, resize).
- **Expected result** — what must be true.
- **PASS signal** — observable confirmation.
- **FAIL signal** — what indicates a regression.
- **Evidence file** — where this behaviour is produced in repo.

No prompt requires terminal access, build tooling, or the Cloudflare
dashboard. Stage S5 adds dashboard prompts separately.

---

## 1. Premium route routes through the premium receiver

**Prompt.** Navigate to a published premium slug (use the known test
vector declared in `/job_site/known_slug_test_vector.json` when S3 produces
it; until then, use any tenant slug whose `site.json` declares
`"shellId": "desktop-premium-v1"`). Open the page at `/:slug/gate` (or the
designated tenant URL).

**Expected result.**

- The page renders a single container whose DOM class is `dpv1Viewport`
  (from `/apps/product-shell/src/features/desktop-premium/DesktopPremiumReceiver.tsx:60`).
- Inside `dpv1Viewport` a single `dpv1Stage` div exists whose inline
  `width = 2560` and `height = 1440` (stage-space pixels), with a CSS
  `transform: scale(...)` that is computed from the viewport, not hard-coded.

**PASS signal.** DevTools element picker on the wallpaper shows the class
`dpv1Wallpaper` inside `dpv1Stage` inside `dpv1Viewport`.

**FAIL signal.** The wallpaper element is inside `.wallpaperLayer`
(published-overlay / PageShell legacy path at
`/apps/product-shell/src/components/layout/PageShell.tsx:11`) — that
indicates the premium payload was not routed to the premium receiver.

**Evidence file.**
`/apps/product-shell/src/features/desktop-premium/DesktopPremiumReceiver.tsx`.

---

## 2. Stage coordinates are stage-space, not viewport-space

**Prompt.** With the premium page open, open DevTools and inspect the
first tile (the topmost `.dpv1Tile` inside `.dpv1TilesLayer`).

**Expected result.**

- Inline style contains `left`, `top`, `width`, `height` values expressed
  in **unscaled stage pixels** (values match the stage-space coordinates
  declared in the page JSON — e.g. a tile declared as `x=1040, y=585,
  w=480, h=270` must show those exact integers).
- The visual position on screen changes with viewport size because the
  parent `.dpv1Stage` carries the CSS scale — but the tile's inline style
  must NOT change.

**PASS signal.** Resizing the browser window updates `dpv1Stage`'s
`transform: scale(...)` but leaves every tile's inline `left/top/width/height`
unchanged.

**FAIL signal.** A tile's `left` or `top` value changes as the window is
resized — indicates stage-space coordinates are being re-interpreted at
render time.

**Evidence file.**
`/apps/product-shell/src/features/desktop-premium/DesktopPremiumReceiver.tsx`
(tile loop inside `ReceiverTiles`).

---

## 3. Wallpaper uses the premium shell contract

**Prompt.** Inspect the wallpaper element (`.dpv1Wallpaper`) inside
`.dpv1Stage`.

**Expected result.** The inline style is exactly:

- `background-image: url('<wallpaper asset url>')`
- `background-size: cover`
- `background-position: center center`
- `background-repeat: no-repeat`

The asset URL pattern is determined by the resolver contract (S3 output).
For this S2 prompt, the check is on the CSS contract only.

**PASS signal.** The four style properties match exactly, and the wallpaper
image fills the entire 2560×1440 stage with no repeat and no top-left
anchoring.

**FAIL signal.** `background-size` is `contain`, `auto`, or a pixel value —
indicates the wallpaper is being served through the legacy overlay path.

**Evidence file.**
`/apps/product-shell/src/features/desktop-premium/shellConfig.ts:14`
(canonical wallpaper contract).

---

## 4. No legacy `PageShell` wrapper on premium pages

**Prompt.** On a premium slug, use DevTools "Find in DOM" to search for the
class name `pageShell`.

**Expected result.** Zero matches inside `dpv1Viewport`. The premium path
bypasses `/apps/product-shell/src/components/layout/PageShell.tsx` entirely.

**PASS signal.** `.pageShell` is absent from the page.

**FAIL signal.** `.pageShell` is present anywhere inside the document for
a premium slug — indicates mixed-overlay fallback is still in place.

**Evidence file.** (Absence. Negative check — the premium receiver must
not render `PageShell`.)

---

## 5. Desktop target envelope — no top-left clipping at 2550×1140

**Prompt.** Open the premium page, then use DevTools "Responsive Mode" or
a manual window-resize to set the viewport to **2550×1140** pixels (the
operator's desktop target envelope per build-sheet §6.5.3).

**Expected result.**

- The 2560×1440 stage is visible in full. No tile is clipped at the top
  edge or the left edge.
- A horizontal letterbox of roughly 262px on the left and 262px on the
  right is visible (because the scale locks to height: 1140/1440 ≈ 0.7917;
  stage width becomes 2026.67px; margin = (2550 − 2026.67) / 2 ≈ 261.67px
  on each side).
- No vertical letterbox — the stage top edge sits at viewport y = 0 and
  the stage bottom edge sits at viewport y = 1140.

**PASS signal.**

- The four corner tiles of the stage are all visible at once.
- Inspecting the stage's bounding box in DevTools shows
  `width ≈ 2027px, height = 1140px, left ≈ 262px, top = 0px`.

**FAIL signal.**

- The top-left tile is clipped off the top or off the left side of the
  viewport.
- The stage fills width but overflows vertically (vertical scrollbar
  appears) — indicates the fit uses width-bound instead of the
  `min(vw/2560, vh/1440)` formula.
- The stage is anchored to `(0,0)` with no horizontal letterbox — indicates
  centering offsets are not applied.

**Evidence file.**
`/apps/product-shell/src/features/desktop-premium/useStageScale.ts:19–45`.

---

## 6. Resize stability — no flash, no snap, no zoom

**Prompt.** With the premium page open, slowly drag the browser window
from 1280×720 up to 3840×2160 and back down.

**Expected result.**

- The stage continuously scales with the window.
- At any intermediate size the stage aspect ratio (16:9 derived from
  2560:1440) is preserved.
- At 3840×2160 the stage fills the viewport exactly, no letterbox.
- At 1280×720 the stage fills the viewport exactly, no letterbox.
- Between those sizes, the letterbox flips between horizontal (envelope
  taller than 16:9) and vertical (envelope wider than 16:9) without
  ever clipping.

**PASS signal.** Smooth scale. No content clipped at any intermediate
size.

**FAIL signal.**

- Content "snaps" to a fixed size (indicates the stage is not responsive).
- Zoomed wallpaper (wallpaper exceeds 2560×1440 at its native resolution)
  — indicates the wallpaper is being rendered outside the `dpv1Stage`
  container.

**Evidence file.**
`/apps/product-shell/src/features/desktop-premium/useStageScale.ts`
(ResizeObserver loop).

---

## 7. Mobile / non-premium routes still use the legacy path

**Prompt.** Navigate to a non-premium slug (one whose `site.json` does NOT
declare `shellId: "desktop-premium-v1"`).

**Expected result.**

- The DOM contains `.pageShell` and `.wallpaperLayer` (legacy overlay
  path).
- The DOM does NOT contain `.dpv1Viewport` or `.dpv1Stage`.
- Layout stays on the legacy 1280×760 canvas.

**PASS signal.** Legacy pages are untouched by the premium patch —
confirms the premium receiver is gated on `shellId` and does not hijack
non-premium payloads.

**FAIL signal.** A non-premium slug suddenly renders inside
`.dpv1Viewport` — indicates the routing gate at
`/apps/product-shell/functions/_lib/runtime-compiler.js:67` is leaky.

**Evidence file.**
`/apps/product-shell/functions/_lib/runtime-compiler.js:67` (`isPremium`
branch predicate).

---

## 8. Renderer parity test — deterministic proof artifact

**Prompt.** From a terminal, run the deterministic renderer parity test
file once it is wired into a TS-capable runner. Even without running it,
the file serves as written proof of the stage math.

**Expected result.** All assertions pass:

- A1–A3: stage-space coordinate preservation.
- B1–B3: wallpaper premium-path contract.
- C1–C7: viewport-fit coverage including the 2550×1140 envelope.

**PASS signal.** All tests green.

**FAIL signal.** Any test red.

**Evidence file.**
`/apps/product-shell/src/tests/premium-renderer-parity.test.ts`.

---

## 9. What this document does NOT test (scope limit for S2)

This document covers **renderer behaviour only**. The following prompts
are explicitly deferred:

- Cloudflare binding verification, R2 slug fetch, Worker-route sanity —
  added by S5 Worker B.
- Resolver contract coverage (wallpaper asset URL format, sticker tile
  URL format) — added by S3.
- End-to-end regression of a known premium slug from Studio save → object
  write → publish → render — added by S6 Worker A.
