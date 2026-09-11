# airecipe.onl — Setup & Deploy Guide

## Files overview
- `index.html` — Landing page (₹199 offer, Buy Now)
- `tool.html` — The AI recipe tool (ingredient selection + results)
- `about-us.html`, `contact-us.html`, `privacy-policy.html`, `terms-and-conditions.html`, `refund-policy.html`, `disclaimer.html` — Info pages
- `pages.css` — Shared styles for info pages
- `api/recipes.js` — DeepSeek AI backend (runs on Vercel, key stays hidden)
- `package.json` — project config for Vercel

---

## STEP 1 — Push to GitHub
Push all these files to your GitHub repo (airecipe199 / or any repo).

## STEP 2 — Deploy on Vercel
1. Go to https://vercel.com/ and "Import" your GitHub repo.
2. Framework Preset: **Other** (it's plain HTML + a serverless function).
3. Click **Deploy**.

## STEP 3 — Add your DeepSeek key (VERY IMPORTANT)
1. In Vercel → your project → **Settings → Environment Variables**.
2. Add a new variable:
   - **Name:**  `DEEPSEEK_API_KEY`
   - **Value:** your DeepSeek key (starts with `sk-...`)
3. Save, then **Redeploy** the project (Deployments → ... → Redeploy).

> The key lives only in Vercel. It never appears in the code or in the browser.

## STEP 4 — Test
- Open your Vercel URL + `/tool.html`
- Select ingredients → "Generate 5 Recipes"
- Real AI recipes (Hinglish) should appear.

## STEP 5 — Razorpay (later)
- In `index.html`, find the Buy Now button (`href="#"`) and replace `#`
  with your Razorpay Payment Link.
- In the Razorpay Payment Link settings, set the "redirect after payment"
  URL to your tool page (secret URL).

---

## Notes
- If the AI backend is unavailable, the tool shows sample fallback recipes
  (so it never looks broken). Once the key is set, real AI recipes appear.
- DeepSeek endpoint used: `https://api.deepseek.com/chat/completions`, model `deepseek-chat`.
