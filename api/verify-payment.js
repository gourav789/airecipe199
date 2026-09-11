// =====================================================
// airecipe.onl — Verify Razorpay Payment (Vercel Serverless Function)
//
// After the user pays, Razorpay returns:
//   razorpay_order_id, razorpay_payment_id, razorpay_signature
// We verify the signature on the SERVER using the secret key.
// If valid, we return the access token that unlocks the tool.
// This is secure: a fake payment cannot produce a valid signature.
// =====================================================

import crypto from "crypto";

// The token that unlocks tool.html (must match ACCESS_TOKEN in tool.html)
const ACCESS_TOKEN = "arecipe_ok_7h2k9";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return res.status(500).json({ error: "Payment not configured." });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing payment details." });
    }

    // Recreate the signature and compare
    const expected = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expected === razorpay_signature) {
      // Payment is genuine — grant access
      return res.status(200).json({ verified: true, token: ACCESS_TOKEN });
    } else {
      return res.status(400).json({ verified: false, error: "Invalid signature." });
    }

  } catch (err) {
    console.error("verify-payment error:", err);
    return res.status(500).json({ error: "Verification failed." });
  }
}
