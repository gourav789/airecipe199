// =====================================================
// airecipe.onl — DeepSeek Recipe Generator (Vercel Serverless Function)
//
// This runs ONLY on the server. The DeepSeek API key stays hidden in
// Vercel Environment Variables (DEEPSEEK_API_KEY) and never reaches the browser.
//
// Frontend (tool.html) sends:  { ingredients, diet, equipment, lang, count }
// This returns:                { recipes: [ ... ] }
// =====================================================

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server not configured. Missing API key." });
  }

  try {
    // ---- Read the request body ----
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const ingredients = Array.isArray(body.ingredients) ? body.ingredients : [];
    const diet = body.diet || "veg";
    const equipment = Array.isArray(body.equipment) ? body.equipment : [];
    const count = Math.min(Math.max(parseInt(body.count) || 5, 1), 5);

    if (!ingredients.length) {
      return res.status(400).json({ error: "No ingredients provided." });
    }

    // ---- Build the prompt for DeepSeek ----
    const dietText =
      diet === "nonveg" ? "non-vegetarian" :
      diet === "both" ? "both veg and non-veg" : "vegetarian";

    const systemPrompt = `You are an expert Indian home chef. You create simple, tasty, homestyle Indian recipes using ONLY the ingredients the user has at home (plus basic pantry staples like salt, water, oil and common spices if reasonable). 

IMPORTANT RULES:
- Write ALL text (titles, descriptions, steps, tips) in HINGLISH — Hindi written in English letters, the way normal Indian people speak. Example: "Pyaaz ko golden hone tak bhuno." Do NOT write in pure English and do NOT use Devanagari script.
- Only use the ingredients provided (you may assume salt, water, oil, and basic everyday spices are available).
- Respect the diet preference and the available cooking equipment.
- Give realistic quantities (matra) for 2 servings by default.
- Keep steps clear, numbered logically, and beginner-friendly (6-9 steps).
- Return STRICT JSON only. No markdown, no extra text.`;

    const userPrompt = `Create exactly ${count} different ${dietText} homestyle Indian recipes.

Ingredients available at home: ${ingredients.join(", ")}.
Available equipment: ${equipment.join(", ") || "gas stove"}.

Return ONLY valid JSON in EXACTLY this shape:
{
  "recipes": [
    {
      "emoji": "single food emoji",
      "title": "recipe name in Hinglish",
      "prep": "e.g. 10 min",
      "cook": "e.g. 15 min",
      "time": "total e.g. 25 min",
      "servings": 2,
      "difficulty": "Aasaan / Thoda mehnat",
      "calories": "e.g. ~220 kcal / plate",
      "type": "veg" or "nonveg",
      "desc": "1-2 line description in Hinglish",
      "ingredients": [
        { "emoji": "emoji", "name": "English name", "nameHi": "Hinglish name", "qty": "quantity like 2 tbsp / 1 cup" }
      ],
      "steps": [ "step 1 in Hinglish", "step 2 in Hinglish" ],
      "serveWith": "serving suggestion in Hinglish",
      "tip": "a helpful tip in Hinglish"
    }
  ]
}`;

    // ---- Call DeepSeek ----
    const dsRes = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 1.1,
        response_format: { type: "json_object" }
      })
    });

    if (!dsRes.ok) {
      const errText = await dsRes.text();
      console.error("DeepSeek error:", dsRes.status, errText);
      return res.status(502).json({ error: "AI service error. Please try again." });
    }

    const dsData = await dsRes.json();
    const content = dsData?.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(502).json({ error: "Empty response from AI." });
    }

    // ---- Parse the JSON the model returned ----
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      // Try to extract JSON if the model wrapped it in anything
      const match = content.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : null;
    }

    if (!parsed || !Array.isArray(parsed.recipes) || !parsed.recipes.length) {
      return res.status(502).json({ error: "Could not parse AI recipes." });
    }

    // ---- Success ----
    return res.status(200).json({ recipes: parsed.recipes.slice(0, count) });

  } catch (err) {
    console.error("Handler error:", err);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}
