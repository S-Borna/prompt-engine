# PRAXIS Chrome Extension

**Enhance your AI prompts in ChatGPT, Claude, and Gemini — with one click.**

## Installation (Developer Mode)

1. Open Chrome → `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `chrome-extension/` folder from this project
5. Pin the PRAXIS extension to your toolbar

## How It Works

### Popup (click extension icon)

- **Sign in** with your PRAXIS account credentials
- **Paste or type** any prompt in the text area
- **Select** the target platform (ChatGPT, Claude, Gemini, etc.)
- **Click Enhance** → get an improved prompt instantly
- **Copy** the result to clipboard

### In-Page Button (automatic)

- When you visit ChatGPT, Claude, or Gemini, a small purple **"Enhance"** button appears near the text input
- Type your prompt, click Enhance → the prompt is replaced with the enhanced version in-place
- Send immediately — no copy-paste needed

## Supported Platforms

- [chatgpt.com](https://chatgpt.com) / [chat.openai.com](https://chat.openai.com)
- [claude.ai](https://claude.ai)
- [gemini.google.com](https://gemini.google.com)

## File Structure

```
chrome-extension/
├── manifest.json          # Extension configuration (Manifest V3)
├── background.js          # Service worker (auth token management, API relay)
├── popup/
│   ├── popup.html         # Popup UI (login + enhance views)
│   ├── popup.css          # Popup styling (dark theme)
│   └── popup.js           # Popup logic (auth, enhance, copy)
├── content/
│   ├── content.js         # Injected into ChatGPT/Claude/Gemini pages
│   └── content.css        # Styles for injected "Enhance" button
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## Server-Side Endpoints

The extension uses dedicated API endpoints (not the session-based `/api/ai/enhance`):

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/api/extension/auth` | POST | email/password | Returns Bearer token |
| `/api/extension/enhance` | POST | Bearer token | Enhances prompt via AI |

## Publishing to Chrome Web Store

1. Zip the `chrome-extension/` folder
2. Go to [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole)
3. Pay $5 one-time developer fee
4. Upload the zip
5. Fill in listing details (screenshots, description)
6. Submit for review (1-3 days)
