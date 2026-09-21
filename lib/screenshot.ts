// High-resolution export via real screen capture: getDisplayMedia gives us
// the tab's actual rendered pixels, so live-only CSS (backdrop-filter,
// mask-image) shows up exactly as it does on screen — unlike DOM-to-image
// serialization, which can't reproduce either. The one unavoidable tradeoff
// is the browser's screen-share permission prompt.
//
// Rotated capture: the phone frame is portrait (tall), but a monitor's
// viewport is wider than it is tall — so scaling the frame up to fit the
// viewport's cramped height leaves most of the width unused. Rotating the
// frame 90° first lets it use the viewport's generous width as its long
// edge instead, reaching a noticeably higher resolution before any edge
// clips. The captured pixels come out landscape; they're rotated -90° back
// afterward to restore the correct portrait image.
//
// The rotate+scale pivots around the viewport's actual center (not a
// corner) — centering the un-rotated element there first, then leaving
// transform-origin at its default (the element's own center), means the
// rotated result stays symmetric and provably fits within the viewport on
// all four sides.
const ROTATED_SCALE_MARGIN = 0.95;

// The captured MediaStream's video frames don't necessarily land within a
// fixed number of requestAnimationFrame ticks after a DOM mutation — screen
// capture has its own compositor/encoder pipeline. requestVideoFrameCallback
// fires once a genuinely new decoded frame is available, which is the
// accurate way to know the video reflects the latest DOM state. It's raced
// against a timeout so a callback that never fires can't hang the export
// forever — it just falls through and captures whatever frame is current.
type VideoWithFrameCallback = HTMLVideoElement & {
  requestVideoFrameCallback?: (callback: () => void) => number;
};

function nextVideoFrame(video: HTMLVideoElement): Promise<void> {
  const videoWithCallback = video as VideoWithFrameCallback;
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      resolve();
    };
    if (videoWithCallback.requestVideoFrameCallback) {
      videoWithCallback.requestVideoFrameCallback(finish);
    } else {
      requestAnimationFrame(() => requestAnimationFrame(finish));
    }
    setTimeout(finish, 500);
  });
}

async function settleVideoFrames(video: HTMLVideoElement, count = 3) {
  for (let i = 0; i < count; i++) {
    await nextVideoFrame(video);
  }
}

// Chrome shows a native "Sharing this tab" bar the moment screen-share
// permission is granted, and that bar pushes the page content down —
// shrinking window.innerHeight. If that happens partway through the
// capture, measurements taken before vs. after stop agreeing with each
// other, which is a very plausible source of the crop misalignment seen
// during testing. Wait for window.innerHeight to stay unchanged for several
// consecutive frames (i.e. the bar has finished appearing and layout has
// settled) before taking any measurements, with a hard timeout so this
// can't hang if nothing ever stabilizes.
function waitForViewportSettle(timeoutMs = 1000): Promise<void> {
  return new Promise((resolve) => {
    let resolved = false;
    let lastHeight = window.innerHeight;
    let lastWidth = window.innerWidth;
    let stableFrames = 0;
    const finish = () => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timeoutId);
      resolve();
    };
    function checkStable() {
      if (resolved) return;
      if (window.innerHeight === lastHeight && window.innerWidth === lastWidth) {
        stableFrames++;
      } else {
        lastHeight = window.innerHeight;
        lastWidth = window.innerWidth;
        stableFrames = 0;
      }
      if (stableFrames >= 6) {
        finish();
        return;
      }
      requestAnimationFrame(checkStable);
    }
    const timeoutId = setTimeout(finish, timeoutMs);
    requestAnimationFrame(checkStable);
  });
}

// Tiled diagonal repeating wordmark rather than a single corner badge —
// a corner mark is trivially cropped out and is a much weaker upgrade
// incentive. Each glyph gets both a dark stroke and a white fill at low
// alpha so it stays legible whether it lands over a dark or light patch
// of the screenshot underneath.
function drawWatermark(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.save();
  ctx.font = "bold 32px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
  ctx.fillStyle = "rgba(255, 255, 255, 0.3)";

  ctx.translate(width / 2, height / 2);
  ctx.rotate(-Math.PI / 6);
  ctx.translate(-width / 2, -height / 2);

  const stepX = 220;
  const stepY = 150;
  // Bounded by the canvas diagonal rather than width/height directly —
  // these phone screenshots are tall and narrow, and a rotated tiling
  // needs to extend well past the shorter axis to still reach that
  // axis's corners after rotation. Using the diagonal on both loops
  // guarantees full coverage regardless of aspect ratio.
  const diagonal = Math.sqrt(width * width + height * height);
  for (let y = height / 2 - diagonal; y < height / 2 + diagonal; y += stepY) {
    for (let x = width / 2 - diagonal; x < width / 2 + diagonal; x += stepX) {
      ctx.strokeText("FICTUS", x, y);
      ctx.fillText("FICTUS", x, y);
    }
  }
  ctx.restore();
}

export async function captureElementViaScreen(
  el: HTMLElement,
  options?: { watermark?: boolean },
): Promise<string> {
  const constraints: DisplayMediaStreamOptions & { preferCurrentTab?: boolean } = {
    // `cursor: "never"` keeps the mouse pointer out of the captured frame.
    // In practice Chrome doesn't reliably honor this for preferCurrentTab
    // self-capture, so it's backed up by forcing `cursor: none` on the page
    // itself below — for tab capture the cursor shown is the browser's own
    // CSS-controlled pointer (not a separate OS compositor layer like
    // full-screen capture), so hiding it via CSS keeps it out of the
    // tab's actual rendered pixels.
    video: { displaySurface: "browser", cursor: "never" } as MediaTrackConstraints,
    preferCurrentTab: true,
  };
  // Captured immediately, before anything else touches the DOM or awaits
  // a permission prompt — this is the scroll position the user actually
  // left the conversation at, and the whole point of the export. It's
  // re-asserted right before capture below as a guard: whatever the exact
  // mechanism is that disturbs it in between (a re-render elsewhere in the
  // app landing during the getDisplayMedia/reparent/rotate sequence, which
  // takes long enough — permission prompt included — for that to happen),
  // the captured frame should reflect this value, not wherever scrollTop
  // happened to end up.
  const scrollEl = el.querySelector<HTMLElement>("[data-export-scroll]");
  const capturedScrollTop = scrollEl?.scrollTop ?? null;

  const stream = await navigator.mediaDevices.getDisplayMedia(constraints);
  await waitForViewportSettle();

  const originalCursor = document.documentElement.style.cursor;
  document.documentElement.style.cursor = "none";

  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.srcObject = stream;
  video.style.position = "fixed";
  video.style.top = "-9999px";
  document.body.appendChild(video);

  const originalInlineStyle = el.getAttribute("style");
  // Measured *before* touching the DOM at all — `el` still has its class's
  // `absolute inset-0`, which resolves correctly against its real
  // positioned ancestor right now. Once reparented below it'd have no such
  // ancestor and inset-0 would instead stretch it to fill <body>/the
  // viewport — inflating this measurement and throwing off every
  // downstream size/scale calculation (the "everything is wide screen"
  // bug caused by measuring after the move instead of before it).
  const originalRect = el.getBoundingClientRect();
  const elWidth = originalRect.width;
  const elHeight = originalRect.height;

  const originalParent = el.parentNode;
  const originalNextSibling = el.nextSibling;

  try {
    // `position: fixed` is normally relative to the viewport — but an
    // ancestor with `backdrop-filter` (or `filter`/`transform`) makes
    // itself the containing block for fixed descendants instead, per spec.
    // The app wraps the preview frame in a `backdrop-blur-*` panel, so
    // without this reparent the "fixed" rotated frame below gets
    // positioned/clipped against that panel rather than the real viewport
    // — the cause of the half-cropped export. Moving `el` to be a direct
    // child of <body> during capture guarantees no such ancestor can trap
    // it.
    document.body.appendChild(el);

    const maxScale =
      Math.min(window.innerWidth / elHeight, window.innerHeight / elWidth) *
      ROTATED_SCALE_MARGIN;

    // Applied synchronously, in the same tick as the reparent above — so
    // the browser never has a chance to paint (or this code to measure)
    // `el` in its unstyled, body-stretched state before it's pinned back
    // to its real size and rotated into place.
    el.style.width = `${elWidth}px`;
    el.style.height = `${elHeight}px`;
    el.style.position = "fixed";
    el.style.left = `${(window.innerWidth - elWidth) / 2}px`;
    el.style.top = `${(window.innerHeight - elHeight) / 2}px`;
    // The element's own class sets inset-0 (top/right/bottom/left all 0) —
    // explicitly clear right/bottom so they can't compete with the left/top
    // + width/height we just set above.
    el.style.right = "auto";
    el.style.bottom = "auto";
    el.style.margin = "0";
    el.style.transformOrigin = "center center";
    el.style.zIndex = "99999";
    el.style.transform = `rotate(90deg) scale(${maxScale})`;

    // Re-assert the scroll position right before waiting on the video to
    // settle — settleVideoFrames below waits for fresh frames *after*
    // this point, so whatever it captures reflects this value rather
    // than whatever scrollTop drifted to during the reparent/reposition
    // above or the permission prompt before it.
    if (scrollEl && capturedScrollTop !== null) {
      scrollEl.scrollTop = capturedScrollTop;
    }

    await video.play();
    await new Promise<void>((resolve) => {
      if (video.videoWidth > 0) {
        resolve();
        return;
      }
      video.onloadedmetadata = () => resolve();
    });
    await settleVideoFrames(video);

    const scaleX = video.videoWidth / window.innerWidth;
    const scaleY = video.videoHeight / window.innerHeight;

    const rotatedRect = el.getBoundingClientRect();

    // Temporary diagnostics — remove once the crop math is confirmed
    // correct. If the exported image is still misaligned, check these
    // numbers: scaleX/scaleY should be very close to each other and to
    // window.devicePixelRatio; rotatedRect should be roughly centered in
    // the window with elWidth/elHeight swapped and multiplied by maxScale.
    const diagnostics = {
      devicePixelRatio: window.devicePixelRatio,
      windowInnerWidth: window.innerWidth,
      windowInnerHeight: window.innerHeight,
      videoWidth: video.videoWidth,
      videoHeight: video.videoHeight,
      scaleX,
      scaleY,
      elWidth,
      elHeight,
      maxScale,
      rotatedRect: {
        left: rotatedRect.left,
        top: rotatedRect.top,
        right: rotatedRect.right,
        bottom: rotatedRect.bottom,
        width: rotatedRect.width,
        height: rotatedRect.height,
      },
    };
    console.log("[export diagnostics]", diagnostics);

    // An inward inset guards against any mismatch between the CSS-pixel
    // rect and the video's actual pixel grid (rounding, or the capture
    // resolution not lining up exactly with window.innerWidth/innerHeight)
    // — at this capture scale, even a small gap can land as a visible
    // sliver of page background at the edge. Kept small so it doesn't eat
    // into real content near the frame's edges; the diagnostics logged
    // above are the real fix once we know the actual scale mismatch.
    const EDGE_INSET = 4;
    const cropLeft = rotatedRect.left + EDGE_INSET;
    const cropTop = rotatedRect.top + EDGE_INSET;
    const cropWidth = rotatedRect.width - EDGE_INSET * 2;
    const cropHeight = rotatedRect.height - EDGE_INSET * 2;

    const captureWidth = Math.round(cropWidth * scaleX);
    const captureHeight = Math.round(cropHeight * scaleY);
    if (captureWidth <= 0 || captureHeight <= 0) {
      throw new Error(
        `Rotated capture element had zero size (${captureWidth}x${captureHeight}) — layout likely collapsed after repositioning`,
      );
    }

    const captured = document.createElement("canvas");
    captured.width = captureWidth;
    captured.height = captureHeight;
    const capturedCtx = captured.getContext("2d");
    if (!capturedCtx) throw new Error("Canvas 2D context unavailable");
    capturedCtx.drawImage(
      video,
      cropLeft * scaleX,
      cropTop * scaleY,
      captureWidth,
      captureHeight,
      0,
      0,
      captureWidth,
      captureHeight,
    );

    // Undo the rotation on the captured pixels — the frame was rotated
    // clockwise (rotate(90deg)) before capture, so rotate the image back
    // counter-clockwise to restore portrait orientation.
    const output = document.createElement("canvas");
    output.width = captureHeight;
    output.height = captureWidth;
    const outputCtx = output.getContext("2d");
    if (!outputCtx) throw new Error("Canvas 2D context unavailable");
    outputCtx.translate(output.width / 2, output.height / 2);
    outputCtx.rotate(-Math.PI / 2);
    outputCtx.drawImage(captured, -captureWidth / 2, -captureHeight / 2);

    if (options?.watermark) {
      // Reset the transform first — it's still carrying the rotate+
      // translate used to draw the portrait-restored image above, and
      // drawWatermark expects to work in plain output.width/height space.
      outputCtx.setTransform(1, 0, 0, 1, 0, 0);
      drawWatermark(outputCtx, output.width, output.height);
    }

    return output.toDataURL("image/png");
  } finally {
    if (originalInlineStyle === null) {
      el.removeAttribute("style");
    } else {
      el.setAttribute("style", originalInlineStyle);
    }
    if (originalParent) {
      originalParent.insertBefore(el, originalNextSibling);
    }
    // Same guard as before capture, applied on the way back: whatever
    // disturbs scrollTop during this whole sequence apparently isn't
    // limited to the lead-up to capture — it was still visible in the
    // live preview after export finished, so reassert it here too, once
    // `el` is back in its normal (scaled-down) position.
    if (scrollEl && capturedScrollTop !== null) {
      scrollEl.scrollTop = capturedScrollTop;
    }
    document.documentElement.style.cursor = originalCursor;
    stream.getTracks().forEach((track) => track.stop());
    video.remove();
  }
}
