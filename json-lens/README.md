# JSON Lens

A simple AI-powered JSON formatter, validator, and explainer for developers.

## Features

| Feature                   | Description                                                |
| ------------------------- | ---------------------------------------------------------- |
| **Format**                | Pretty-prints JSON with 2-space indentation                |
| **Validate**              | Checks JSON syntax and reports the error position          |
| **Minify**                | Strips all whitespace from valid JSON                      |
| **Copy**                  | Copies the editor content to the clipboard                 |
| **Load Example**          | Loads sample JSON to try the tool                          |
| **Explain with AI**       | Asks Gemini to describe the JSON structure                 |
| **Explain Error with AI** | Asks Gemini why the JSON failed to parse and how to fix it |
| **History & Snippets**    | Saves reusable JSON data to Astra DB when configured       |

## Tech Stack

- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)

## Getting Started

### 1. Install dependencies

```bash
cd json-lens
npm install
```

### 2. Configure the AI API key (optional)

Copy the example environment file:

```bash
cp .env.example .env
```

Open `.env` and add your [Google Gemini API key](https://aistudio.google.com/apikey):

```
VITE_AI_API_KEY=...
```

> **No key?** The app runs in **mock mode** automatically.  
> AI explanations will use mock responses, but the rest of the app still works.

### 3. Configure Astra DB (optional)

If you want History and Snippets to persist, add these values to `.env`:

```bash
VITE_ASTRA_ENDPOINT=https://<database-id>-<region>.apps.astra.datastax.com
VITE_ASTRA_TOKEN=AstraCS:...
VITE_ASTRA_KEYSPACE=Json_Lens
```

When Astra is configured, the Vite dev server proxies requests through `/astra` so browser calls stay same-origin and avoid CORS failures.

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Production Build

```bash
npm run build
```

The output goes to `dist/`. Serve it with any static file server:

```bash
npx serve dist
```

## Project Structure

```
src/
├── components/
│   ├── JsonEditor.tsx       # Textarea-based JSON input
│   ├── Toolbar.tsx          # Action buttons (Format, Validate, …)
│   ├── ExplanationPanel.tsx # Right-hand results panel
│   └── StatusMessage.tsx    # Coloured success/error/info banner
├── services/
│   ├── ai.ts               # AI service — Gemini + mock fallback
│   └── astra.ts            # Astra DB history/snippet persistence
├── utils/
│   └── json.ts             # JSON format / validate / minify utilities
├── App.tsx                  # Root component — state + handlers
└── main.tsx                 # Entry point
```

## AI Provider

The default implementation calls the **Google Gemini API** using the
`gemini-3.5-flash-lite` model. To switch to a different provider:

1. Open [`src/services/ai.ts`](src/services/ai.ts).
2. Replace `callGemini()` with your provider's HTTP call.
3. Keep `VITE_AI_API_KEY` in `.env`, or rename it if your provider needs a different key.

The rest of the application is untouched — `explainJson` and `explainJsonError`
are the only public functions the UI depends on.

## Astra DB

History and snippet persistence live in [`src/services/astra.ts`](src/services/astra.ts).
Set `VITE_ASTRA_ENDPOINT`, `VITE_ASTRA_TOKEN`, and `VITE_ASTRA_KEYSPACE` to enable them.
If any of those values are missing, the app disables the Astra-backed features.

## Security Notes

- The API key is read from an environment variable (`VITE_AI_API_KEY`) and is
  never hard-coded in source.
- Astra credentials are also read from environment variables and should stay
  in `.env`, not in source control.
- Do **not** commit your `.env` file to version control.
- AI responses are rendered as plain text — no `dangerouslySetInnerHTML`.
- JSON is only sent to the configured AI provider when you click an AI button.
