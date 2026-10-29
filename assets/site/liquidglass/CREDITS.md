# LiquidGlass 1.0.3

Source: https://github.com/ybouane/liquidglass
Package: @ybouane/liquidglass 1.0.3
License: MIT (as declared by upstream package and README).
The distributed ES module bundles html-to-image 1.11.11 (MIT).
Downloaded from https://cdn.jsdelivr.net/npm/@ybouane/liquidglass@1.0.3/dist/index.js

Local patch: the empty compositing-scene fill is #111111 instead of white, matching this dark portfolio during asynchronous captures and resize.

Performance patch: data-glass-group marks layout-only wrappers. These are traversed in paint order and only intersecting leaves are rasterised; groups are excluded from startup prewarming. During a disclosure animation only its summary is considered. Fully offscreen glass panels skip rendering. This avoids repeated snapshots of the full case while its height changes.

Animation refinement: while a disclosure animates, glass is redrawn each frame from cached leaf captures at their current positions. Disclosure content is clipped to its animated bounds and composited with its current opacity; it is no longer omitted until the animation ends. The renderer returns to idle afterwards.
