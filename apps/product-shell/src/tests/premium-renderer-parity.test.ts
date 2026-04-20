/**
 * Deterministic renderer parity test — desktop-premium-v1.
 *
 * Owner artifact for BIZ-PAGES-PROD-DETANGLE-002 Stage S2, Worker B.
 * Target path (per build-sheet §6.7.4.1):
 *   /job_site/repo_mirror/Biz-Pages-FB-frozen-main/apps/product-shell/src/tests/premium-renderer-parity.test.ts
 *
 * What this file proves, deterministically, without a DOM:
 *
 *   (A) Stage-space coordinates round-trip unchanged through the runtime
 *       compiler when shellId = "desktop-premium-v1".
 *   (B) Wallpaper is consumed via the premium shell path (shellConfig.fit =
 *       "cover", "center center", "no-repeat") — not via the legacy
 *       published-overlay path.
 *   (C) Viewport-fit math covers the operator's desktop target envelope
 *       (2550×1140, per build-sheet §6.5.3) without top-left clipping,
 *       and degrades correctly at both smaller and larger viewports.
 *
 * Runner: node:test. Imports are ESM. The `.js` extensions on compiler
 * imports match the actual on-disk filenames in functions/_lib/.
 */

import { test } from "node:test";
import assert from "node:assert/strict";

// runtime-compiler and runtime-schema ship as .js (ESM) under Pages Functions.
// The premium-path branch is the only path this test exercises.
import {
  compileRuntimePage,
  normalizePublishedPage,
} from "../../functions/_lib/runtime-compiler.js";

import SHELL from "../features/desktop-premium/shellConfig";

// ---------------------------------------------------------------------------
// Fixture: a premium page payload with known stage-space coordinates. Every
// field below is a direct input to the premium render path — nothing here
// exists as "default" elsewhere in the runtime.
// ---------------------------------------------------------------------------

const PREMIUM_FIXTURE = {
  shellId: "desktop-premium-v1",
  wallpaper: "w91",
  blocks: [
    { id: "t-top-left",  x: 0,    y: 0,    w: 480, h: 270, kind: "image", image: "c01" },
    { id: "t-center",    x: 1040, y: 585,  w: 480, h: 270, kind: "image", image: "c02" },
    { id: "t-bottom-rt", x: 2080, y: 1170, w: 480, h: 270, kind: "image", image: "c03" },
    { id: "t-header",    x: 300,  y: 20,   w: 1960, h: 80, kind: "text",  image: "",    lines: ["Premium Header"] },
  ],
};

// ---------------------------------------------------------------------------
// (A) Stage-space coordinate preservation
// ---------------------------------------------------------------------------

test("A1. premium compile emits shellId + 2560x1440 stage metadata", () => {
  const out = compileRuntimePage(
    "home",
    PREMIUM_FIXTURE,
    { mode: "published-page", key: "tenants/demo/home.json" },
    { slug: "demo" }
  );

  assert.equal(out.ok, true);
  assert.equal(out.shellId, "desktop-premium-v1");
  assert.deepEqual(out.stage, { w: 2560, h: 1440 });
  // Desktop canvas on premium path is the stage itself (via isPremium branch).
  assert.deepEqual(out.desktop.canvas, { width: 2560, minHeight: 1440 });
});

test("A2. block (x,y,w,h) round-trip unchanged — no re-interpretation", () => {
  const out = compileRuntimePage(
    "home",
    PREMIUM_FIXTURE,
    { mode: "published-page", key: "tenants/demo/home.json" },
    { slug: "demo" }
  );

  const byId: Record<string, { x: number; y: number; w: number; h: number }> = {};
  for (const b of out.desktop.blocks) byId[b.id] = { x: b.x, y: b.y, w: b.w, h: b.h };

  for (const input of PREMIUM_FIXTURE.blocks) {
    assert.deepEqual(
      byId[input.id],
      { x: input.x, y: input.y, w: input.w, h: input.h },
      `block ${input.id} stage-space coords must pass through unchanged`
    );
  }
});

test("A3. normalizePublishedPage preserves shellId flag for premium payloads", () => {
  const normalized = normalizePublishedPage("home", PREMIUM_FIXTURE);
  assert.equal(normalized.shellId, "desktop-premium-v1");
  assert.equal(normalized.wallpaper, "w91");
});

// ---------------------------------------------------------------------------
// (B) Wallpaper uses the premium shell path, not the legacy overlay path
// ---------------------------------------------------------------------------

test("B1. shellConfig wallpaper contract declares cover+center+no-repeat", () => {
  assert.equal(SHELL.wallpaper.fit, "cover");
  assert.equal(SHELL.wallpaper.position, "center center");
  assert.equal(SHELL.wallpaper.repeat, "no-repeat");
});

test("B2. premium compile passes wallpaper asset code through unchanged", () => {
  const out = compileRuntimePage(
    "home",
    PREMIUM_FIXTURE,
    { mode: "published-page", key: "tenants/demo/home.json" },
    { slug: "demo" }
  );
  assert.equal(out.wallpaper, "w91");
});

test("B3. non-premium payloads do NOT emit premium metadata — proves routing split", () => {
  const legacyFixture = {
    // no shellId
    wallpaper: "w92",
    blocks: [{ id: "legacy", x: 0, y: 0, w: 320, h: 180 }],
  };
  const out = compileRuntimePage(
    "home",
    legacyFixture,
    { mode: "published-page", key: "tenants/legacy/home.json" },
    { slug: "legacy" }
  );
  assert.equal(out.shellId, undefined);
  assert.equal(out.stage, undefined);
  assert.deepEqual(out.desktop.canvas, { width: 1280, minHeight: 760 });
});

// ---------------------------------------------------------------------------
// (C) Viewport-fit coverage — operator's desktop target envelope 2550×1140
// ---------------------------------------------------------------------------
//
// useStageScale formula (mirrored here as pure math — no DOM):
//   scale   = min(vw / 2560, vh / 1440)
//   offsetX = (vw - 2560*scale) / 2
//   offsetY = (vh - 1440*scale) / 2
//
// A tile at stage-space (sx, sy) lands at viewport pixel
//   (offsetX + sx*scale, offsetY + sy*scale).
// A tile is "not clipped top-left" iff its mapped pixel is >= (0, 0) and
// its bottom-right mapped pixel is <= (vw, vh).

type ScaleState = { scale: number; offsetX: number; offsetY: number };

function fitStage(vw: number, vh: number): ScaleState {
  const scale = Math.min(vw / SHELL.stage.w, vh / SHELL.stage.h);
  return {
    scale,
    offsetX: (vw - SHELL.stage.w * scale) / 2,
    offsetY: (vh - SHELL.stage.h * scale) / 2,
  };
}

function stageToViewport(
  s: ScaleState,
  x: number,
  y: number
): { px: number; py: number } {
  return { px: s.offsetX + x * s.scale, py: s.offsetY + y * s.scale };
}

test("C1. target envelope 2550x1140 — scale locks to height, stage is letterboxed horizontally", () => {
  const s = fitStage(2550, 1140);
  // height-bound: scale = 1140/1440 = 0.791666...
  assert.ok(Math.abs(s.scale - 1140 / 1440) < 1e-9);
  // stage width at scale = 2560 * 0.7917 = 2026.666..., letterbox = (2550 - 2026.67)/2 ≈ 261.67
  assert.ok(s.offsetX > 0, `offsetX should be positive (letterbox), got ${s.offsetX}`);
  assert.ok(Math.abs(s.offsetY) < 1e-9, `offsetY must be 0 at height-bound fit, got ${s.offsetY}`);
});

test("C2. stage-space (0,0) maps inside the viewport — NO top-left clipping", () => {
  const s = fitStage(2550, 1140);
  const { px, py } = stageToViewport(s, 0, 0);
  assert.ok(px >= 0, `top-left px must be >= 0, got ${px}`);
  assert.ok(py >= 0, `top-left py must be >= 0, got ${py}`);
});

test("C3. stage-space (2560,1440) maps inside the viewport — NO bottom-right overflow", () => {
  const vw = 2550, vh = 1140;
  const s = fitStage(vw, vh);
  const { px, py } = stageToViewport(s, SHELL.stage.w, SHELL.stage.h);
  // Allow 1e-9 for float
  assert.ok(px <= vw + 1e-9, `bottom-right px must be <= vw, got ${px}`);
  assert.ok(py <= vh + 1e-9, `bottom-right py must be <= vh, got ${py}`);
});

test("C4. smaller viewport (1280x720) — width-bound or height-bound, stage centered", () => {
  const s = fitStage(1280, 720);
  // min(1280/2560=0.5, 720/1440=0.5) = 0.5 — both equal, perfect fit, no letterbox.
  assert.equal(s.scale, 0.5);
  assert.ok(Math.abs(s.offsetX) < 1e-9);
  assert.ok(Math.abs(s.offsetY) < 1e-9);

  const tl = stageToViewport(s, 0, 0);
  const br = stageToViewport(s, SHELL.stage.w, SHELL.stage.h);
  assert.ok(tl.px >= 0 && tl.py >= 0);
  assert.ok(br.px <= 1280 + 1e-9 && br.py <= 720 + 1e-9);
});

test("C5. larger viewport (3840x2160) — scale = 1.5, stage fills viewport", () => {
  const s = fitStage(3840, 2160);
  assert.equal(s.scale, 1.5);
  assert.ok(Math.abs(s.offsetX) < 1e-9);
  assert.ok(Math.abs(s.offsetY) < 1e-9);
});

test("C6. portrait viewport (1080x1920) — width-bound, vertical letterbox, no clipping", () => {
  const vw = 1080, vh = 1920;
  const s = fitStage(vw, vh);
  // min(1080/2560=0.42188, 1920/1440=1.333) = 0.42188 (width-bound)
  assert.ok(Math.abs(s.scale - 1080 / 2560) < 1e-9);
  assert.ok(Math.abs(s.offsetX) < 1e-9);
  assert.ok(s.offsetY > 0, `vertical letterbox expected, offsetY=${s.offsetY}`);

  const tl = stageToViewport(s, 0, 0);
  const br = stageToViewport(s, SHELL.stage.w, SHELL.stage.h);
  assert.ok(tl.px >= 0 && tl.py >= 0, `no top-left clipping, got (${tl.px},${tl.py})`);
  assert.ok(br.px <= vw + 1e-9 && br.py <= vh + 1e-9, `no bottom-right overflow, got (${br.px},${br.py})`);
});

test("C7. fixture tiles — every declared tile lands inside the 2550x1140 envelope", () => {
  const s = fitStage(2550, 1140);
  for (const b of PREMIUM_FIXTURE.blocks) {
    const tl = stageToViewport(s, b.x, b.y);
    const br = stageToViewport(s, b.x + b.w, b.y + b.h);
    assert.ok(tl.px >= 0 && tl.py >= 0, `tile ${b.id} clips top-left at (${tl.px},${tl.py})`);
    assert.ok(
      br.px <= 2550 + 1e-9 && br.py <= 1140 + 1e-9,
      `tile ${b.id} overflows bottom-right at (${br.px},${br.py})`
    );
  }
});
