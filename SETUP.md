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

## STEP 5 — Razorpay API keys (for payments)
The Buy Now button uses Razorpay Checkout. Add these in Vercel → Settings →
Environment Variables (same place as the DeepSeek key):

1. **RAZORPAY_KEY_ID**  = your Razorpay Key Id (starts with `rzp_live_...` or `rzp_test_...`)
2. **RAZORPAY_KEY_SECRET** = your Razorpay Key Secret

Get these from: Razorpay Dashboard → Account & Settings → API Keys → Generate Key.

- Use **Test keys** (`rzp_test_...`) first to test without real money.
- Switch to **Live keys** (`rzp_live_...`) when ready to accept real payments.

After adding, **Redeploy** the project.

### Payment flow
1. User clicks "Buy Now ₹199" on the homepage.
2. `/api/create-order` creates a Razorpay order (secret stays hidden).
3. Razorpay Checkout popup opens; user pays.
4. `/api/verify-payment` verifies the signature on the server.
5. If genuine, the user is redirected to `tool.html?key=arecipe_ok_7h2k9` and
   access is saved in the browser (localStorage).

### Access token
- Tool unlock token is `arecipe_ok_7h2k9` (in tool.html and verify-payment.js).
- To change it, update BOTH files to the same value.

---

## Notes
- If the AI backend is unavailable, the tool shows sample fallback recipes
  (so it never looks broken). Once the key is set, real AI recipes appear.
- DeepSeek endpoint used: `https://api.deepseek.com/chat/completions`, model `deepseek-chat`.
