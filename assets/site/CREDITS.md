# Авторы 3D-моделей

- Очки Ray-Ban — Mothrills: https://sketchfab.com/3d-models/rayban-sunglasses-5594893683184664b166db8a28a55bc0
- Ковбойская шляпа — weedlog: https://sketchfab.com/3d-models/leather-cowboy-hat-e72d01dd310a4e3ea7ffbe2e9a74b9d9
- Лицензия: CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/


Анимация текста: Serega Gentle, mishanaer/deslop — https://github.com/mishanaer/deslop/tree/main/serega/serega-gentle. Использован предоставленный WAAPI-адаптер.

Звуки интерфейса: Sound, mishanaer — https://github.com/mishanaer/sound. Процедурный модуль ui-sounds.js сохранён без изменений.
## iPhone 18 Pro — Steam case

Current comparison views use transparent iPhone 18 Pro frames from [Plinth](https://plinthmockups.com/iphone-mockup), scenes iphone-11 (front), iphone-13 and iphone-14 (opposite angles). Plinth permits free commercial use of mockup exports, without attribution or watermarks; blank scenes may not be resold. Assets are cropped frames with screen masks and transformed videos within the portfolio. The earlier Asylab-derived assets below are retained but are no longer the active comparison frames.

The frame and screen mask in `steam-case/iphone-18-pro-*.png` are derived from Asylab's "Freebie iPhone 18 Pro - 02 Mockups Scenes - PSD & FIG", scene 16 (Perspective Style Left), BLACK colour layer. [Asylab freebies](https://www.asylab.com/resources/freebies). The supplied Free License permits modified resources in personal and commercial websites. The source PSD is not distributed with the website. The screen video is Ilya's After Effects export.

## Number Flow

Loader digits use [Number Flow](https://github.com/barvian/number-flow) 0.6.2 by Maxwell Barvian, MIT. Vendored in `number-flow/` with LICENSE.md. In lite.mjs and ssr-DvIINv8w.mjs the esm-env BROWSER import is replaced with `typeof window !== "undefined"` for standalone browser ESM. Portfolio-specific glyph fill styling is added by loader-number.js; Number Flow animation logic is unchanged.

## Meshoptimizer

The portrait models use lossless geometry compression with [meshoptimizer](https://github.com/zeux/meshoptimizer) 1.3.0 by Arseny Kapoulkine, MIT. The browser decoder and its license are in `experiments/head/interactive/vendor/meshopt_decoder.mjs` and `MESHOPT-LICENSE.md`. Vertex values, morph targets and decoded texture pixels are preserved.

