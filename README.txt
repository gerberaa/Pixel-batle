# Pixel Battle React Component

This project contains a self-contained React component exported from a Hatch canvas, designed for interactive pixel-based applications or games. The component supports persistent state management, works both as a standalone HTML preview and as a reusable React module, and is easy to integrate into any React project. It includes all necessary files for immediate use, development, and deployment.

---

## Files:
- component.jsx: The main React component source code
- component.js: The compiled/executable JavaScript version
- index.html: Ready-to-run HTML file with fallback inline code and data
- storedState.json: Initial state data


## Quick Start:
1. **Immediate Preview**:
   - **File mode**: Double-click `index.html` - works locally with file:// URLs!
   - **Server mode**: Serve from a local web server for cleaner file separation:
     - `python -m http.server 8000`
     - `npx serve .`
     - `php -S localhost:8000`

2. **Development Setup**:

## Usage:
```jsx
import Component from './component';

function App() {
  return <Component />;
}
```

## Hatch Runtime Features:
The exported component includes support for Hatch's `useStoredState` hook:
- `useStoredState(key, defaultValue)` - Persistent state storage using localStorage
- Loads external files when served from a web server
- Falls back to inline data for file:// URLs
- State persists across browser sessions

The `index.html` file provides a complete Hatch-compatible runtime environment that works both when served from a web server (using external files) and when opened directly as file:// URLs (using inline fallbacks).

Generated on: 19.07.2025, 23:21:19
