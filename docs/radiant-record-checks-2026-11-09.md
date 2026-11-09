# Radiant record checks

The About visual is a silent, dependency-free WebGL shader with a static SVG fallback. It does not read or play audio.

Verified locally in Chrome:
- Compiled and rendered the shader at desktop width and 390/320 px phone widths.
- Pause stopped draw calls; keyboard Enter resumed them.
- Reduced-motion preference started the component paused and stopped an already-running loop.
- At 320 px, scrolling the canvas fully offscreen stopped the draw-call counter at 426 across separate observations.
- Simulated context loss switched to the SVG and removed the motion control.
- Simulated unavailable WebGL showed the SVG on first render.
- Horizontal content width matched the phone viewport; footer clearance preserved the About links and attribution.

The draw-call meter and failure controls exist only in a temporary local preview, not in site code. The render loop is capped at 30 fps, drawing-buffer dimensions at 900 px, and pixel ratio at 1.5. These are resource limits, not measured guarantees on every device.

All 48 existing tests and the production build passed. Impeccable's source scan found no primary findings.
