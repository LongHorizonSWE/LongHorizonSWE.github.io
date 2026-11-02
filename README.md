# Long-Horizon Software Engineering Agents: From Tasks to Projects

Project website: **https://longhorizonswe.github.io/**

Main project repository: **[Awesome-LongHorizonSWE](https://github.com/LongHorizonSWE/Awesome-LongHorizonSWE)**

This repository hosts the project website for the survey. The `longhorizonswe.github.io` repository name provides the organization website's root URL; the main project retains the `Awesome-LongHorizonSWE` name.

## Layout

```text
index.html             page text and structure
site/styles.css        design: paper and ink, light and dark themes
site/scroll.js         the hero painting, an endless blue-and-green landscape handscroll drawn in the browser
site/content.js        plate captions and the open-problems table
site/app.js            plates and lightbox, open problems, chain demonstration, reference library
data/references.json   the 439 cited references, copied from Awesome-LongHorizonSWE
assets/figures/        the 13 manuscript figures (plates), copied from Awesome-LongHorizonSWE
assets/teaser.webp     the survey illustration mounted in the hero
assets/og.png          link preview image
favicon.svg
```

The site is static and has no build step. To preview it, serve the folder with any static server, for example `python -m http.server`, and open http://localhost:8000.

## Website updates

Edit the files above and push to `main`; the GitHub Pages workflow publishes the site. When the manuscript changes, copy `data/references.json` and `assets/figures/` from Awesome-LongHorizonSWE, keep the wording in `index.html` and `site/content.js` in step with `tools/readme-content.mjs` there, and raise the `?v=` number on the stylesheet and scripts in `index.html` so browsers fetch the new files.

The manuscript, Overleaf sources, and PDF are maintained separately.
