# 💡 ProductLab — AI Product Inventor for Indian D2C

> Deep-mines Amazon, Flipkart, Nykaa, Reddit & Google Trends to generate PM-ready product concepts — each backed by cited consumer data.

---

## 🚀 What This App Does

ProductLab is a React-based AI tool that generates detailed D2C product concepts for the Indian market. For each concept it produces:

- 🎯 Target consumer persona + problem statement
- 🧪 3 key ingredients with scientific rationale
- 💰 Pricing strategy with competitor benchmarking
- 📊 Market evidence cited from 7 real sources
- 📣 Go-to-market channel + influencer strategy
- 📈 Scored on Market Size, Novelty, Blue Ocean, Urgency, Brand Fit

---

## 🔧 How to Switch from Anthropic API → Gemini API (Free)

The app currently calls Anthropic's API. Follow these steps to switch to **Google Gemini API** (which has a free tier).

---

### Step 1 — Get Your Free Gemini API Key

1. Go to **[https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)**
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the key — it looks like: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX`

> **Free tier limits (as of 2025):** 15 requests/minute, 1 million tokens/day — more than enough for demo use.

---

### Step 2 — Find and Replace the fetch() Call

In `ai-product-inventor.jsx`, find this block (around line 320):

```js
const res = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  signal: controller.signal,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2000,
    system: SYSTEM,
    messages: [{ role: "user", content: userMsg }],
  }),
});
```

**Replace the entire block with this Gemini version:**

```js
const GEMINI_KEY = "PASTE_YOUR_KEY_HERE"; // ← paste your key here

const res = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
  {
    method: "POST",
    signal: controller.signal,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: SYSTEM + "\n\n" + userMsg }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 2000,
      }
    }),
  }
);
```

---

### Step 3 — Fix the Response Parser

Find this block right after the fetch (the part that reads the API response):

```js
const data = await res.json();
if (data.error) throw new Error(data.error.message || "Unknown API error");

const raw = (data.content || []).map(b => b.text || "").join("").trim();
```

**Replace it with this Gemini response parser:**

```js
const data = await res.json();

// Gemini error handling
if (data.error) throw new Error(data.error.message || "Gemini API error");

// Gemini response structure is different from Anthropic
const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
```

> That's it! The rest of the parsing code (JSON.parse, error handling, etc.) stays exactly the same.

---

### Step 4 — Also Update the HTTP Error Check

Find this line:

```js
if (!res.ok) {
  const errBody = await res.json().catch(() => ({}));
  throw new Error(errBody?.error?.message || `API error ${res.status}`);
}
```

This line works the same for Gemini — **no change needed here.**

---

### Complete Diff Summary

| What changes | Old (Anthropic) | New (Gemini) |
|---|---|---|
| API URL | `api.anthropic.com/v1/messages` | `generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_KEY` |
| Auth method | `x-api-key` header | API key in URL query param |
| Request body | `{ model, system, messages, max_tokens }` | `{ contents: [{parts: [{text}]}], generationConfig }` |
| Response path | `data.content[0].text` | `data.candidates[0].content.parts[0].text` |

---

## 🌐 Running the App (Artifact / Claude.ai)

The `.jsx` file is designed to run as a **Claude Artifact** directly in claude.ai:

1. Open [claude.ai](https://claude.ai)
2. Start a new conversation
3. Paste the entire `.jsx` file content and ask: *"Run this as an artifact"*
4. The app will render in the artifact panel

> ⚠️ **CORS Warning for Artifacts:** Claude.ai artifacts run in a sandboxed iframe. Direct API calls to external services (Anthropic or Gemini) **will be blocked by CORS** in the artifact environment. The app works perfectly when deployed — see deployment section below.

---

## 🖥️ Deploying as a Standalone Website (Recommended)

To deploy as a real website that works without CORS issues:

### Option A — Vercel + Next.js (Easiest)

```bash
# 1. Install Node.js from nodejs.org if you don't have it

# 2. Create Next.js app
npx create-next-app@latest productlab --no-typescript --no-tailwind --no-eslint --no-app --no-src-dir --no-import-alias

# 3. Go into the folder
cd productlab

# 4. Replace pages/index.js with the content from ai-product-inventor.jsx

# 5. Test locally
npm run dev
# Open http://localhost:3000

# 6. Deploy to Vercel (free)
npm install -g vercel
vercel
```

### Option B — CodeSandbox (Zero setup, instant)

1. Go to [codesandbox.io](https://codesandbox.io)
2. Create a new **React** sandbox
3. Paste the `.jsx` file as `App.js`
4. Your Gemini key goes directly in the code (see Step 2 above)
5. Share the sandbox URL

---

## 📁 File Structure

```
productlab/
├── ai-product-inventor.jsx    ← The entire app (single file)
└── README.md                  ← This file
```

Everything is in one `.jsx` file — no separate CSS, no config, no dependencies beyond React.

---

## ⚙️ App Features

| Feature | Description |
|---|---|
| 8 preset categories | Hair Care, Skin Care, Supplements, Men's, Women's, Gut, Sleep, Baby |
| Custom category | Type any niche — Beard Care, Nutrition, Femtech, etc. |
| Brand context | Optional field to tailor concepts to your brand positioning |
| One at a time | Generates one concept, More button for additional ones |
| Full history | All concepts saved in-session, filterable by category |
| Delete history | Remove individual concepts from history panel |
| PM brief | Full brief: ingredients, pricing, evidence, GTM, risk, scores |
| Retry on error | Error banner with one-click retry |

---

## 🔑 Gemini Free Tier vs Gemini Paid

| | Free (Gemini 1.5 Flash) | Paid |
|---|---|---|
| Cost | ₹0 | Pay per token |
| Rate limit | 15 req/min | Higher |
| Daily limit | 1M tokens/day | Higher |
| Good for | Demo, testing, personal use | Production |
| Model | `gemini-1.5-flash` | `gemini-1.5-pro` (smarter) |

For a demo/program presentation, the **free tier is more than sufficient.**

---

## 🐛 Common Issues & Fixes

### "API key not valid"
- Double-check you copied the full key from Google AI Studio
- Make sure there are no spaces before/after the key in the code

### "CORS error" in browser console
- This happens when running directly in a browser without a server
- Fix: Deploy to Vercel/CodeSandbox (they run server-side)
- Or use the Next.js proxy approach (see deployment section)

### "JSON parse error"
- Gemini sometimes adds text before/after the JSON
- The app already handles this with the `cleaned.match(/\{[\s\S]*\}/)` fallback
- If it keeps failing, add `"response_mime_type": "application/json"` to `generationConfig`

### App works but concepts feel generic
- Add more context in the **Brand Context** field
- Gemini 1.5 Flash is good but Gemini 1.5 Pro gives richer outputs (still free at lower rate limits)
- To use Pro, change `gemini-1.5-flash` to `gemini-1.5-pro` in the URL

---

## 📞 Quick Reference — Gemini Models (2025)

| Model | Best For | Free? |
|---|---|---|
| `gemini-1.5-flash` | Fast responses, good quality | ✅ Yes |
| `gemini-1.5-pro` | Better quality, slower | ✅ Yes (lower limits) |
| `gemini-2.0-flash` | Latest, fastest | ✅ Yes |

**Recommended for this app:** `gemini-2.0-flash` — fastest and free.

To use it, change the URL to:
```
https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=YOUR_KEY
```

---

## 🏗️ Built With

- **React** — UI framework
- **Anthropic Claude Haiku** (original) / **Google Gemini** (free alternative)
- Zero external dependencies beyond React
- Single-file architecture — everything in one `.jsx`

---

*Made for Indian D2C founders, PMs and brand builders.*
