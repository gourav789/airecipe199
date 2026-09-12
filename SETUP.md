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

---

## STEP 6 — Firebase (Login + Paid access)

The site now uses Firebase for signup/login and to remember who has paid.

### 6a. Firebase project (already done)
- Project: `airecipe-c9fb1`
- Authentication → Email/Password: **Enabled**
- Firestore Database: **Created** (production mode)
- Web config is in `firebase-config.js` (these keys are public — safe).

### 6b. Firestore security rules
1. Firebase console → Firestore → **Rules** tab.
2. Paste the contents of `firestore.rules` (in this project).
3. **Publish**.

This makes it so users can read only their own record and can NEVER set
themselves as paid from the browser. Only the server can mark `paid = true`.

### 6c. Service account (lets the server mark users paid)
1. Firebase console → ⚙️ **Project settings → Service accounts**.
2. Click **Generate new private key** → downloads a JSON file.
3. Open that JSON. You need 3 values from it:
   - `project_id`
   - `client_email`
   - `private_key`  (a long block starting with `-----BEGIN PRIVATE KEY-----`)

### 6d. Add these to Vercel → Environment Variables
| Name | Value |
|------|-------|
| `FIREBASE_PROJECT_ID`   | the `project_id` from the JSON |
| `FIREBASE_CLIENT_EMAIL` | the `client_email` from the JSON |
| `FIREBASE_PRIVATE_KEY`  | the full `private_key` (paste exactly, including the BEGIN/END lines) |

> Tip: When pasting the private key in Vercel, paste it exactly as-is
> (with its line breaks). The code also handles keys stored with `\n`.

Then **Redeploy**.

### The full flow now
1. Visitor clicks Buy Now → if not logged in, sent to `login.html`.
2. Signs up / logs in (Firebase). A `users/{uid}` doc is created with `paid:false`.
3. Pays ₹199 via Razorpay.
4. `verify-payment.js` checks the Razorpay signature + Firebase ID token,
   then sets `paid:true` in Firestore (server-side, secure).
5. User is sent to `tool.html`, which checks login + `paid` and unlocks.
6. On any device, logging in unlocks the tool (no re-payment).

### Env vars checklist (all in Vercel)
- `DEEPSEEK_API_KEY`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
