# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UUR ("Unified University Resources") is a student learning web app combining Notion (note-taking), Obsidian (knowledge graph), and Anki (spaced repetition) into a single workspace. The full Russian-language spec is in the `project description` file. Visual/UX guidelines are in `DESIGN_GUIDELINES.md` (written in Czech).

## Commands

```bash
npm run dev       # Start Vite dev server with HMR
npm run build     # Production build to dist/
npm run preview   # Preview production build locally
npm run lint      # Run ESLint
```

No test runner is configured.

## Architecture

**Build system**: Vite 7 + React 19, JSX only (no TypeScript). Entry: `index.html` → `src/main.jsx`.

**Routing** (`src/main.jsx`): React Router v7 with three routes:
- `/` — Home screen to pick a dashboard (`Home` component defined inline in `main.jsx`)
- `/1` — "Lapis" dark dashboard (`src/App.jsx`)
- `/2` — "StudyFlow" dashboard (`src/pages/StudyFlow.jsx`)

**Theme** (`src/theme.jsx`): Exports `darkTheme` (MUI `createTheme`) and `GlobalStyleConfig` (MUI `GlobalStyles`). Both are applied in `main.jsx`. Primary `#9055FF`, secondary `#13E2DA`, background `#0F1117`. MuiPaper globally has `backdropFilter: blur(16px)` and glassmorphism border. Fonts: DM Sans (body), Clash Display / Cabinet Grotesk (headings).

**CSS variables** (defined in `GlobalStyleConfig`):
- `--bg-primary/secondary/tertiary/elevated`, `--accent`, `--text-secondary/muted`
- `--glass-bg`, `--glass-border`

**Global utility classes** (defined in `GlobalStyleConfig`):
- `.no-scrollbar` — hides scrollbars cross-browser
- `.bg-noise` — fixed noise overlay (z-index 9999, pointer-events none)
- `.spotlight-btn` — mouse-tracking gradient border effect on hover

**Shared style object**: `App.jsx` defines a `GLASS` const for the glassmorphism pattern; reuse it rather than repeating the values.

**Installed dependencies** (all core packages are already installed):
- `@mui/material` + `@mui/icons-material` + `@emotion/react/styled` — component library
- `@mui/x-tree-view` — hierarchical tree panel
- `@mui/x-data-grid` — card management table
- `@tiptap/react` + `@tiptap/starter-kit` + `@tiptap/extension-link` + `@tiptap/extension-highlight` + `@tiptap/extension-table-{cell,header,row}` + `mui-tiptap` — rich text editor
- `react-force-graph` — knowledge graph visualization
- `recharts` — charts/statistics
- `lucide-react` — icons
- `clsx` + `tailwind-merge` — className utilities (Tailwind CSS itself is NOT installed)

**Legacy prototypes**: `1.html.bak` and `2.html.bak` are the original standalone CDN-based HTML files kept for reference. The active app is the Vite project.

## Key Features to Implement

1. **Tree View** — left-side hierarchy panel with right-click context menu, card count badges
2. **Study Mode** — TipTap rich-text editor, optionally split with YouTube player
3. **Card Wizard** — step-by-step creator for flashcard (Q/A) and quiz (ABCD) cards; validates correct answer is marked
4. **Zen Mode** — distraction-free full-screen card review with flip animation and session results
5. **Statistics View** — table + chart of cards reviewed, success rate, due cards
6. **Knowledge Graph** — `[[Topic Name]]` wiki-links auto-create graph edges; clicking navigates to topic
7. **SM-2 Algorithm** — spaced repetition scheduling for card review intervals

## Data Model

All data lives in `localStorage`. Core entities:

- **Course** → contains Topics
- **Topic** → contains Notes and Cards
- **Card** — type: `flashcard` (Q/A) or `quiz` (ABCD); fields: `lastReviewed`, `nextReview`, `successRate`
- **Link** — connection between topics (from `[[...]]` syntax or manual creation)

## Code Style Rules (MANDATORY)

**Primary: MUI components + `sx` prop. Tailwind allowed sparingly.**

**Use MUI `sx` for:**
- Colors, gradients, shadows, borders, animations
- Theme tokens, component variants, responsive breakpoints
- Anything tied to the design system

**Use Tailwind `className` (moderately, only where MUI sx is verbose) for:**
- Simple layout utilities: `flex items-center gap-2 truncate overflow-hidden`
- Text overflow: `truncate`, `whitespace-nowrap`, `line-clamp-2`
- `className` + `sx` can coexist on the same element

**Always:**
- NO inline `style={{...}}` objects — use MUI `sx` prop
- NO raw HTML elements:
  - `<div>` → `<Box>` or `<Stack>` or `<Paper>`
  - `<span>`, `<p>`, `<h1>`-`<h6>` → `<Typography>`
  - `<button>` → `<Button>` or `<IconButton>`
  - `<input>` → `<TextField>`
  - `<ul>/<li>` → `<List>/<ListItem>`
- NO Portal+div modals → use MUI `<Dialog>` (has built-in portal)
- Allowed: `keyframes` from `@emotion/react`, `sx` prop on MUI components

> **Known debt**: The `Home` component in `src/main.jsx` uses raw `<div>`/`<button>` with inline styles — this violates the above rules and should be refactored when touched.

## ESLint Notes

Config: `eslint.config.js` (flat config, ESLint 9). `no-unused-vars` ignores names matching `/^[A-Z_]/` — uppercase constants are allowed unused.