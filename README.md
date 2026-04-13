# DSAI Web App (React) - Local Setup

Short: React front-end workspace (Vite-like) used for porting project_sample.html → React.

## Prerequisites

- Node.js (LTS) installed (recommended >= 16). Check with:
  pwsh.exe> node -v
- npm (bundled with Node) or yarn
- Optional: VS Code for editing

## Install

1. Open a PowerShell terminal in the repository root (c:\Users\EE933SP\vscode-workspace-olympiad-poc-2\dsai-web-app)
2. Install dependencies:
   pwsh.exe> npm install
   (or: pwsh.exe> yarn)

## Run (development)

- Start dev server (hot reload):
  pwsh.exe> npm run dev

## Build (production)

- Create optimized build:
  pwsh.exe> npm run build
- Preview production build locally:
  pwsh.exe> npm run preview

## Features

- **React 19.2.4** with Vite for fast development
- **Gemini AI Integration** - Complete text completion, chat, and streaming capabilities
- **Legacy Project Porting** - DSAI onboarding system integration
- **Component Architecture** - Modular page-based structure

## Gemini AI Integration

This app includes a comprehensive Gemini AI integration. See [GEMINI-INTEGRATION.md](./GEMINI-INTEGRATION.md) for complete documentation.

**Quick Start:**
```javascript
import { geminiComplete, useGemini } from './src/gemini';

// Direct usage
const response = await geminiComplete('Hello AI');

// React hook with state management
const { complete, loading, error } = useGemini();
```

## Notes

- Entry page for the ported legacy sample: src/pages/ProjectSample.jsx
  - DSAI onboarding (inline + modal) implemented here.
  - Local persistence prototype uses localStorage key: "dsaiOnboard".
  - The app shows a floating workspace toast (bottom-right) when the Clear action is used; the global helper is wired in src/App.jsx.
- Projects grid component: src/pages/Projects.jsx — clicking a tile now calls the parent with the project id/object so the app can open the correct project view.

## Common Issues

- If the dev server still shows old code after source edits, stop and restart the dev server to fully reload Vite's transform cache.
- If a toast/notification does not appear, ensure you start the app from App.jsx (root render) so the global toast container is mounted.

## Contributing

- Use the existing component style (inline styles) when making small UI edits in the port.
- Preserve legacy DOM ids used by scripts when modifying DSAI controls (ids such as `tab-dsai`, `panel-dsai`, `submitDsai`, `btnAddPhaseTop`, `btnAddResourceTop`).

## Questions

- If anything behaves unexpectedly (redirects, missing toasts, parse errors), copy the Vite terminal output and open an issue or message with the exact error.

## License

- Prototype code — no license specified.
