# PrototypeOS · Innovation Prototyping Studio

A polished, bilingual Thai/English, local-first static web application for **Product Prototyping, Process Prototyping and Business Prototyping**, suitable for innovation courses, startup ideation, research exercises and real preliminary planning.

## Features

- **Workspace dashboard:** total projects, category summary, recent work.
- **Project management:** create, search, filter, duplicate, delete projects and maintain separate working canvases.
- **Product Lab:** target audience, problem, solution and value proposition; editable feature list, RICE scoring, ranked roadmap, MVP readiness score and checklist.
- **Process Lab:** editable and reorderable workflow steps, current versus proposed time/cost, monthly cycle volumes, estimated time reduction and monthly savings.
- **Business Lab:** nine-block Business Model Canvas, price/variable costs/fixed costs/customer assumptions, break-even, projected monthly operating profit and three simple customer-volume scenarios.
- **Validation Lab:** hypothesis, predefined success metric, outcomes, evidence and historical experiments.
- **Data:** automatically saved to browser `localStorage`, JSON backup/export for all or single projects, and three starter examples.
- **Responsive:** optimized for desktop and mobile; no build step and no API key.

## Run

Open `index.html` in a modern browser, or publish the folder as a static site on GitHub Pages. All references to CSS and JS are relative, so GitHub project pages work without configuring a base path.

For this repository, open **Settings → Pages**, select **Deploy from a branch**, choose `main` and `/docs` (if the site is kept in a `docs` folder), then save. Alternatively create a dedicated repository and put these files in its root, selecting `main` and `/(root)`.

## Scope and assumptions

RICE score = Reach × Impact × Confidence (0–100%) ÷ Effort, where Reach is an approximate audience size and Effort is person-months. MVP readiness is a transparent planning heuristic, not empirical validation. Process savings assume the workflow runs sequentially and that per-cycle costs are additive. Business simulation assumes one purchase per customer per month, no tax, no churn or acquisition lag, and only the explicitly entered variable/fixed costs. Scenario selection changes customer volume by ±25%. Results are **illustrative forecasts**, not observed performance or financial advice.

Data stays in **this browser only**. It does **not** sync to GitHub or between devices, and can be erased by clearing browser storage. Use the export button regularly; do not store sensitive personal information in the app. No sign-in, cloud database, file import, or multi-user collaboration is included.

## Structure

- `index.html`: accessible UI and layout.
- `style.css`: responsive visual system.
- `script.js`: state, prototypes, scoring, calculations and storage.

## License

Copyright 2026. All rights reserved unless the repository owner adds a separate license.
