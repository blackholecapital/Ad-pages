# Wallpaper Renderer Fault Report

job_id: BIZ-PAGES-PROD-DETANGLE-002
stage: S1 / Worker A
subject: desktop-premium-v1 shell is not rendering the wallpaper fullscreen
at the target desktop envelope on end-user Biz pages.

## 1. Symptom

Biz page (e.g. `/exclusive`, `/:slug/gate/exclusive`) loads. The wallpaper
visible behind the content is **not** the tenant-published R2 wallpaper; it
is the bundled `public/w99.png`, rendered with `background-size: contain`
(inherited through `.wallpaperImage` base rule), so it shows as a smaller,
letterboxed image on non-16:9 viewports. Studio preview (`/studio` →
Receiver Preview) does not exhibit the problem.

## 2. Three parallel wallpaper rendering paths

### 2.1 Root fixed wallpaper (AppShell)
`apps/product-shell/src/app/AppShell.tsx:8,14-18`

```tsx
const DEFAULT_WALLPAPER_URL = "/w99.png";

<div className="appRootWallpaper" aria-hidden>
  <div
    className="wallpaperImage"
    style={{ backgroundImage: `url('${DEFAULT_WALLPAPER_URL}')` }}
  />
</div>
```

CSS:
- `apps/product-shell/src/styles/shell.css:8-11` — `.appRootWallpaper`
  `position: fixed; inset: 0; z-index: -1; background: #0b0b0f`.
- `apps/product-shell/src/styles/shell.css:62-66` — `.wallpaperImage`
  `position: absolute; inset: 0; background-size: contain;
  background-position: center center; background-repeat: no-repeat`.

**Fault A**: `.wallpaperImage` declares `background-size: contain`. That
preserves aspect ratio and letterboxes the image. A 2560×1440 wallpaper on
a 1920×1080 monitor shows black bars top/bottom (or left/right). The build
sheet requirement is fullscreen coverage against the desktop envelope — that
requires `cover`, not `contain`.

**Fault B**: wallpaper URL is hard-coded to `/w99.png` in AppShell;
there is no path by which a tenant R2 wallpaper reaches this layer.

### 2.2 Page-level wallpaper (PageShell)
`apps/product-shell/src/components/layout/PageShell.tsx:9-21`

```tsx
export function PageShell({ children, wallpaperUrl }: PageShellProps) {
  return (
    <div className="pageShell">
      <div className="wallpaperLayer" aria-hidden>
        <div
          className="wallpaperImage"
          style={wallpaperUrl ? { backgroundImage: `url('${wallpaperUrl}')` } : undefined}
        />
      </div>
      <div className="pageShellContent">{children}</div>
    </div>
  );
}
```

CSS:
- `shell.css:55-60` — `.wallpaperLayer { position: absolute; inset: 0;
  z-index: 0; pointer-events: none }`.
- `.wallpaperImage` — same `contain` inheritance (Fault A).

**Fault C**: no caller passes `wallpaperUrl`. Every page file
(`HomePage.tsx`, `MembersPage.tsx`, `ExclusivePage.tsx:110,248`,
`CustomerPage.tsx`, `AdminPage.tsx`, `PayMePage.tsx`, etc.) invokes
`<PageShell>` with **zero props**. Tenant wallpaper code from the API is
never threaded through.

### 2.3 Premium stage wallpaper (DesktopPremiumShell)
`apps/product-shell/src/features/desktop-premium/DesktopPremiumShell.tsx:41-54`

```tsx
<div
  className="dpv1Wallpaper"
  aria-hidden
  style={wallpaperUrl ? {
    backgroundImage: `url('${wallpaperUrl}')`,
    backgroundSize: cfg.wallpaper.fit,      // "cover"
    backgroundPosition: cfg.wallpaper.position,
    backgroundRepeat: cfg.wallpaper.repeat,
  } : undefined}
/>
```

CSS: `apps/product-shell/src/features/desktop-premium/desktop-premium.css:19-26`:
```
.dpv1Wallpaper {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  ...
}
```

This path is **correct** for fullscreen coverage at the premium stage — but
it is only mounted inside `DesktopPremiumReceiver` which is only rendered by
`StudioPage.tsx:87` in preview mode.

## 3. API-side wallpaper lifecycle

`apps/product-shell/functions/_lib/runtime-schema.js:189`:
```js
const wallpaper = validateAssetCode(spec.wallpaper || spec.wallpaperCode, ["w","m"]);
if (wallpaper) result.wallpaper = wallpaper;
```

`apps/product-shell/functions/_lib/runtime-compiler.js:109`:
```js
if (normalized.wallpaper) result.wallpaper = normalized.wallpaper;
```

Payload shape (`apps/product-shell/src/runtime/types.ts:59`):
```ts
export type PublishedRuntimePage = {
  ...
  wallpaper?: string;  // an asset code like "w91", not a URL
};
```

**Fault D**: server emits a bare asset code. No client code converts that
code to a URL. There is no `/assets/w91.png` mapping, no R2 wallpaper-serve
Worker, no asset manifest resolution. `apps/product-shell/src/utils/assetCodeResolver.ts`
returns the sanitized code, not a URL:

```ts
export function resolveAssetCode(input?: string | null, fallback = "default") {
  if (!input) return fallback;
  const normalized = normalizeAssetCode(input);
  return normalized || fallback;
}
```

## 4. Root-cause map

| Fault | Location | Effect |
|-------|----------|--------|
| A: `contain` fit on `.wallpaperImage` | `apps/product-shell/src/styles/shell.css:62-66` | Letterboxing; wallpaper never reaches viewport edges for legacy/PageShell pages. |
| B: hard-coded `/w99.png` in AppShell | `apps/product-shell/src/app/AppShell.tsx:8,17` | Tenant wallpaper cannot override default. |
| C: `PageShell` never receives `wallpaperUrl` | `apps/product-shell/src/pages/*.tsx` (all 10 pages) | Runtime payload `wallpaper` field is dropped before render. |
| D: asset code never resolved to URL | `apps/product-shell/src/utils/assetCodeResolver.ts:1-11` and absence of a wallpaper-URL mapping service | Even if C were fixed, the code `"w91"` cannot be loaded by the browser. |
| E: premium receiver dispatch never invoked for Biz pages | `apps/product-shell/src/app/router.tsx:35-95` and `apps/product-shell/src/pages/*.tsx` | End users never see the canonical 2560×1440 stage; Studio does. |
| F: fixed `z-index:-1` on root wallpaper + separate `z-index:0` on PageShell wallpaper | `shell.css:8-11` and `:55-60` | Layering dependent on z-index stacking of different wrappers; tenant override cannot simply replace AppShell default. |

## 5. Minimal fix sketch (informational — execution in later stage)

1. Route dispatch on payload `shellId`: when `PublishedRuntimePage.shellId === "desktop-premium-v1"`, render `<DesktopPremiumReceiver layout={...}/>` instead of `<PageShell>…</PageShell>`. Thread wallpaper URL into `layout.wallpaper`.
2. Resolver: add `resolveWallpaperUrl(code, slug)` that maps `"w91"` → R2 served URL (e.g. `/assets/wallpapers/w91.png` or a Worker-fronted bucket path). Stop using `resolveAssetCode` for URLs.
3. `AppShell`: move the default wallpaper into a path that can be overridden by payload URL; change `.wallpaperImage` `background-size` to `cover` so the legacy/static fallback also fills the viewport.
4. Remove dual wallpaper layers (root fixed + PageShell absolute) — one owned layer, one fit rule.
5. Remove static `/w99.png` fallback once R2-backed defaults are in place.

## 6. Reproduction path (operator test)

1. Open `/` or `/<slug>` on production Biz Pages.
2. Observe background: `/w99.png` rendered `contain`, letterboxed on 1920×1080.
3. Open DevTools → Network → filter `/api/published-page`. If the endpoint
   returns `wallpaper: "w91"`, the payload arrives — but nothing paints it.
4. Open `/studio`, add a wallpaper, switch to Receiver Preview. The preview
   renders the uploaded wallpaper `cover`-fit, fullscreen. This confirms the
   divergence is in the dispatch / resolver / CSS layer, not in the Studio
   authoring surface.
