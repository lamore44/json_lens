# JSON Lens

A simple AI-powered JSON formatter, validator, and explainer for developers.

## Features

| Feature                   | Description                                               |
| ------------------------- | --------------------------------------------------------- |
| **Format**                | Pretty-prints JSON with 2-space indentation               |
| **Validate**              | Checks JSON syntax and reports the error position         |
| **Minify**                | Strips all whitespace from valid JSON                     |
| **Copy**                  | Copies the editor content to the clipboard                |
| **Load Example**          | Loads sample JSON to try the tool                         |
| **Explain with AI**       | Asks an AI to describe the JSON structure                 |
| **Explain Error with AI** | Asks an AI why the JSON failed to parse and how to fix it |

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

Open `.env` and add your [OpenAI API key](https://platform.openai.com/api-keys):

```
VITE_AI_API_KEY=sk-...
```

> **No key?** The app runs in **mock mode** automatically.  
> All features except AI explanations work without any key.  
> Mock AI responses are clearly labelled so you always know what is simulated.

### 3. Start the development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

When Astra is configured, the Vite dev server proxies requests through `/astra` so browser calls stay same-origin and avoid CORS failures.

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
│   └── ai.ts               # AI service — real OpenAI + mock fallback
├── utils/
│   └── json.ts             # JSON format / validate / minify utilities
├── App.tsx                  # Root component — state + handlers
└── main.tsx                 # Entry point
```

## AI Provider

The default implementation calls the **OpenAI Chat Completions API** using the
`gpt-4o-mini` model. To switch to a different provider:

1. Open [`src/services/ai.ts`](src/services/ai.ts).
2. Replace `callOpenAI()` with your provider's HTTP call.
3. Update the `VITE_AI_API_KEY` variable name in `.env` if needed.

The rest of the application is untouched — `explainJson` and `explainJsonError`
are the only public functions the UI depends on.

## Security Notes

- The API key is read from an environment variable (`VITE_AI_API_KEY`) and is
  never hard-coded in source.
- Do **not** commit your `.env` file to version control.
- AI responses are rendered as plain text — no `dangerouslySetInnerHTML`.
- JSON is only sent to the configured AI provider when you click an AI button.
