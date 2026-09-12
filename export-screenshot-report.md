# Problem: high-quality, silent PNG export of a simulated phone screen

## Context

The app is a "Social UI Simulation Studio" — it renders a fake Instagram DM
conversation inside a fixed-size (430×932 logical px) phone-frame mockup in
the browser (React/Next.js, Tailwind). The user scrolls the conversation to
whatever moment they want, then clicks an "Export PNG" button. The export
must capture **exactly what's currently visible in the phone frame** —
correct scroll position, correct content — as a single high-resolution PNG
they can save and use elsewhere.

The phone chrome includes a frosted-glass header and message-composer bar
that use `backdrop-filter: blur()` + `mask-image` gradients over the
scrolling message content behind them (an iOS-style live blur effect).

## Requirements (in the order we care about them)

1. **Correctness** — captures the real, current scroll position and content.
2. **Quality** — sharp/high-resolution output, and the blur on the header
   and composer bar has to look like genuine frosted glass, not a flat
   dark rectangle.
3. **Invisible to the user** — no visible jump/flash/zoom on screen during
   export, ideally nothing the user notices at all.
4. **No permission prompts** — ideally the export just happens when the
   button is clicked, no browser dialog interrupting the flow.

These four pull against each other, and we haven't found an approach that
satisfies all four at once.

## Approaches tried

### 1. Real screen capture (`getDisplayMedia`) — current implementation

Use the browser's screen/tab capture API to grab a real video frame of the
page, then crop it down to just the phone frame's bounding box.

- Pro: pixel-perfect. Since it's capturing actual rendered/composited
  pixels, `backdrop-filter` and everything else renders exactly as it does
  live. No faking required.
- Con: `getDisplayMedia()` **always** shows a native OS/browser permission
  prompt — every single call, with no way to pre-approve or remember a
  prior grant. This is a hard privacy restriction in the browser spec, not
  something fixable in application code.
- Con: capture resolution is bounded by the *physical* screen/window
  resolution — the phone frame has to actually be rendered at real,
  on-screen device-pixel size to be captured sharply. To get a high-res
  export we scale the phone frame up to a large size right before
  capturing, then scale it back down after ("pin and zoom" trick). This
  causes a **visible jump** on screen for the fraction of a second the
  frame is enlarged.
- Sub-problem: on a smaller browser window, zooming the frame up by a
  fixed factor pushed part of it past the edge of the visible
  window/screen, and the capture came back with the bottom cut off (since
  `getDisplayMedia` can only capture what's actually on screen — CSS
  `overflow` clipping doesn't apply, but the physical screen edge does).
  **Fixed** by computing the zoom dynamically so the frame's scaled size
  never exceeds `window.innerWidth`/`window.innerHeight`.
- Enhancement: since browser windows are usually landscape (wider than
  tall) and the phone mockup is portrait (taller than wide), we added an
  option to **rotate the frame 90° before capture** so its long edge lines
  up with the window's long edge, allowing a meaningfully higher zoom
  (often ~1.5–1.8× more linear resolution) before hitting an edge. The
  captured image is then rotated back to portrait in canvas afterward. The
  app picks whichever orientation (upright vs. rotated) yields more
  resolution automatically. This part worked well and is still in place.
- Attempted fix for the permission prompt's *visibility*: reordered the
  code to request the permission (`getDisplayMedia`) *before* touching the
  DOM at all, so the dialog appears while the preview still looks normal,
  and the zoom/rotate/capture/revert only happens in the brief instant
  right after the user clicks "Allow" (~2 animation frames, ~30ms) instead
  of sitting zoomed for however long they take to read the dialog. **The
  user rejected this** ("no its ruined") — reverted back to the simpler,
  single-pass version (zoom happens, then permission is requested, then
  capture, then revert).

**Current state**: this is what's live now. Quality is good and
resolution is meaningfully better after the rotation trick. It still has
the permission prompt (unavoidable, confirmed to the user as a hard
browser limitation) and a brief visible zoom flash during export.

### 2. DOM serialization (`html-to-image`) — tried earlier, then abandoned

Instead of capturing real screen pixels, serialize the phone-frame DOM
subtree into an SVG `<foreignObject>` and rasterize that to a canvas/PNG
entirely within the page — no OS involvement at all.

- Pro: completely silent. No permission prompt, no visible on-screen
  change, ever.
- Con (confirmed via testing + reading `html-to-image`'s known issues):
  - `backdrop-filter` **does not serialize** through this pipeline at all
    — it's simply absent in the output (documented upstream issue).
  - `mask-image` is unreliable through the same foreignObject/WebKit
    pipeline — produces visible hard edges / wrong shapes instead of a
    soft gradient.
  - A scrollable container's `scrollTop` is **not preserved** when the DOM
    is cloned for serialization — the clone always resets to scroll
    position 0, silently breaking "export whatever I'm scrolled to."
    (Also a documented upstream issue.)
- Workarounds built for each of these:
  - **Scroll bug**: instead of relying on native `overflow-y: auto` +
    `scrollTop`, bake the current scroll offset into a `transform:
    translateY(-scrollTop)` on the content right before capture — `transform`
    *is* preserved correctly through the clone. Confirmed working.
  - **Blur bug**: pre-render the blur ourselves, entirely outside the
    serialization pipeline. Capture one raw (unblurred) snapshot of the
    scrollable content via `html-to-image`'s `toCanvas()`, then in plain
    Canvas 2D: crop out the region behind the header/composer, apply
    `ctx.filter = 'blur(Npx)'`, and for the header, layer several
    differently-blurred copies masked with linear-gradient alpha stops
    (reproducing the original multi-layer progressive-blur look) via
    `globalCompositeOperation = 'destination-in'`. Convert the result to a
    plain PNG `<img>` and swap it in for the live blurred chrome only
    during the export instant. **The header version of this looked good**
    (user confirmed).
  - **Composer bug**: the composer pill's blurred background looked flat
    and dark/opaque instead of blurred — root cause: the pill sits over a
    band of the scroll content that's mostly blank (reserved bottom
    padding so messages never sit directly under it), and a naive
    crop-then-blur can't pull in color from real content just *outside*
    the tight crop the way a live `backdrop-filter` naturally would
    (backdrop-filter sees the whole page; our crop, by definition, doesn't
    see anything outside its own bounds). **Fix identified and
    implemented**: crop a band padded above/below the pill by the blur
    radius, blur *that* wider band (so real neighboring content bleeds
    into the result), then slice out just the pill-height rows from the
    middle of the blurred padded band. This passed type-check/lint/build,
    but the user asked to abandon this whole approach (pivot to screen
    capture) before it was actually tested/confirmed visually.

**This whole approach was abandoned** in favor of real screen capture, in
order to get genuine live-blur quality instead of an approximated one —
but it's the only approach that's fully permission-free and invisible.

### 3. Ideas considered but not built

- **Reduce the permission prompt to a one-time thing**: not possible —
  `getDisplayMedia()` has no persistent-grant mechanism by design (unlike
  camera/microphone permissions).
- **`html2canvas`** (alternative to `html-to-image`): same category of
  tool, same fundamental limitation — doesn't support `backdrop-filter`
  either.
- **CSS Houdini Paint Worklets**: can't sample the page behind an element
  either, so this doesn't solve the "blur of content behind it" problem —
  same category of dead end as `mask-image`.
- **Browser extension (`chrome.tabCapture`)**: would require the user to
  install a Chrome extension; impractical for a normal web app, and
  extensions have their own permission model anyway.
- **Server-side headless-browser rendering** (e.g. Playwright/Puppeteer
  screenshotting a dedicated "export" route server-side): would give
  pixel-perfect real CSS rendering (real `backdrop-filter`, arbitrary
  resolution via `deviceScaleFactor`, no client-side permission prompt or
  visible DOM manipulation at all, since it never touches the user's
  actual browser). Not implemented — it's a real architecture change
  (needs a Node server able to spawn a headless Chromium process, which is
  heavy and may not fit the eventual hosting target; untested here).

## What we actually want

A way to export a high-resolution PNG of the phone frame that:

1. Captures the exact current scroll position/content.
2. Reproduces the frosted-glass blur (header + composer) convincingly,
   ideally at true `backdrop-filter` quality.
3. Never visibly disrupts the screen during export (no jump/flash/zoom).
4. Never shows a permission prompt.

The two approaches tried each satisfy a different subset of these (screen
capture: #1 #2, at the cost of #3 #4; DOM serialization: #1 #3 #4, at the
cost of #2 being an approximation rather than the real thing — though the
approximation seemed to be landing close after the fixes above). We're
looking for whether there's a genuinely better option, or whether the
DOM-serialization approximation is actually the right tradeoff to accept.
