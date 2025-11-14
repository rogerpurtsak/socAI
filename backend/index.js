import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import sharp from "sharp";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const MEME_SYSTEM_PROMPT = `
You are a viral social media meme copywriter for Gen-Z and young adults.

Your job is to create SHORT, FUNNY, VIRAL meme-style text for posts with:
- white background
- black text
- an image below or between the text blocks

RESPONSE FORMAT (IMPORTANT):
Return ONLY the following JSON object, with no explanation or extra text:

{
  "style": "top-bottom" | "top-only" | "bottom-only",
  "top_text": "",
  "bottom_text": ""
}

RULES:
- Write in NATURAL, FLUENT, TRENDY English used by Gen-Z.
- Humor style: relatable, chaotic, deadpan, sarcastic, ironic, cringe, or wholesome — based on the image vibe.
- Max length per text block: ~70 characters.
- Keep wording PG-13 and brand-safe.
- DO NOT use emojis, hashtags, or extra symbols.
- If "style" = "top-only", "bottom_text" must be "".
- If "style" = "bottom-only", "top_text" must be "".
- If "style" = "top-bottom", both must be filled.
- DO NOT wrap the JSON in backticks.
- DO NOT add ANY explanation — ONLY return the JSON object.
`;

// xAI Grok klient
const grok = new OpenAI({
  apiKey: process.env.GROK_API_KEY,
  baseURL: "https://api.x.ai/v1",
});

// Test-endpoint
app.get("/", (req, res) => {
  res.json({ ok: true, message: "Backend töötab (Grok memes)" });
});

// Põhi: meme-tekst + Grok pilt + layout
app.post("/api/generate-post", async (req, res) => {
  try {
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({ error: "description on kohustuslik" });
    }

    // 1) Meme-tekst Grokiga (JSON: style, top_text, bottom_text)
    const memeResp = await grok.chat.completions.create({
      model: "grok-3-mini",
      messages: [
        { role: "system", content: MEME_SYSTEM_PROMPT },
        {
          role: "user",
          content:
            `Image description: ${description}\n` +
            "Write a meme-style caption that fits the vibe. " +
            "Audience: Gen-Z and young adults. Tone: funny, relatable, modern.",
        },
      ],
      max_tokens: 200,
    });

    let style = "bottom-only";
    let topText = "";
    let bottomText = "";

    try {
      const raw = memeResp.choices[0]?.message?.content ?? "{}";
      console.log("RAW MEME:", raw);

      const cleaned = raw.replace(/```[a-zA-Z]*\s*|```/g, "");
      const parsed = JSON.parse(cleaned);

      style = parsed.style || "bottom-only";
      topText = parsed.top_text || "";
      bottomText = parsed.bottom_text || "";
    } catch (e) {
      console.error("Failed to parse meme JSON:", e);
      style = "bottom-only";
      topText = "";
      bottomText = "when the AI forgets how to meme";
    }

    const caption =
      [topText, bottomText].filter(Boolean).join(" / ") ||
      bottomText ||
      topText ||
      "no caption";

    // 2) Pilt Grok image-mudeliga + valge canvas + tekst üleval/all
    let finalBase64 = null;

    try {
      const imageResponse = await grok.images.generate({
        model: "grok-2-image",
        prompt: description,
        n: 1,
        response_format: "b64_json",
      });

      const b64Image = imageResponse.data[0].b64_json;
      if (!b64Image) {
        throw new Error("Grok ei tagastanud b64 pilti");
      }

      const imageBuffer = Buffer.from(b64Image, "base64");

      // --- mõõdud kogu meme jaoks ---
      const canvasWidth = 1024;
      const canvasHeight = 1400;
      const topAreaHeight = 180;
      const bottomAreaHeight = 180;

      const availableImageHeight = canvasHeight - topAreaHeight - bottomAreaHeight;
      const availableImageWidth = canvasWidth;

      // 1) Resize ilma croppimata – kogu pilt jääb alles
      const resizedImageBuffer = await sharp(imageBuffer)
        .resize({
          width: availableImageWidth,
          height: availableImageHeight,
          fit: "inside", // ← EI lõika midagi maha
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        })
        .toBuffer();

      // 2) Leia tegelik resized pildi suurus, et panna see keskele
      const meta = await sharp(resizedImageBuffer).metadata();
      const imgW = meta.width || availableImageWidth;
      const imgH = meta.height || availableImageHeight;

      const imageLeft = Math.floor((canvasWidth - imgW) / 2);
      const imageTop =
        topAreaHeight + Math.floor((availableImageHeight - imgH) / 2);

      // 3) Loo valge canvas
      const canvas = sharp({
        create: {
          width: canvasWidth,
          height: canvasHeight,
          channels: 3,
          background: { r: 255, g: 255, b: 255 },
        },
      });

      // --- Teksti ettevalmistus ---
      const escape = (txt) =>
        (txt || "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");

      const splitLines = (txt, maxChars = 32) => {
        const safe = escape(txt);
        const words = safe.split(" ");
        const lines = [];
        let current = "";

        for (const w of words) {
          if (!w) continue;
          if ((current + " " + w).trim().length > maxChars) {
            if (current.trim()) lines.push(current.trim());
            current = w;
          } else {
            current += (current ? " " : "") + w;
          }
        }
        if (current.trim()) lines.push(current.trim());
        return lines;
      };

      const topLines =
        style === "top-only" || style === "top-bottom"
          ? splitLines(topText)
          : [];
      const bottomLines =
        style === "bottom-only" || style === "top-bottom"
          ? splitLines(bottomText)
          : [];

      const lineHeight = 44;
      const topStartY = 70;
      const bottomStartY =
        canvasHeight -
        bottomAreaHeight +
        60 -
        lineHeight * (bottomLines.length - 1 || 0);

      let textSvgParts = [];

      topLines.forEach((line, idx) => {
        const y = topStartY + idx * lineHeight;
        textSvgParts.push(
          `<text x="${canvasWidth / 2}" y="${y}" class="caption">${line}</text>`
        );
      });

      bottomLines.forEach((line, idx) => {
        const y = bottomStartY + idx * lineHeight;
        textSvgParts.push(
          `<text x="${canvasWidth / 2}" y="${y}" class="caption">${line}</text>`
        );
      });

      const svgOverlay = `
        <svg width="${canvasWidth}" height="${canvasHeight}">
          <style>
            .caption { 
              fill: #000000; 
              font-size: 34px; 
              font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
              text-anchor: middle;
            }
          </style>
          ${textSvgParts.join("\n")}
        </svg>
      `;

      const finalBuffer = await canvas
        .composite([
          { input: resizedImageBuffer, top: imageTop, left: imageLeft }, // pilt keskel
          { input: Buffer.from(svgOverlay), top: 0, left: 0 },           // tekst üleval/all
        ])
        .png()
        .toBuffer();

      finalBase64 = finalBuffer.toString("base64");
    } catch (imgErr) {
      console.error("GROK IMAGE/SHARP error:", imgErr?.response?.data || imgErr);
      finalBase64 = null;
    }

    return res.json({
      style,
      topText,
      bottomText,
      caption,
      imageBase64: finalBase64,
    });
  } catch (err) {
    console.error("AI TOTAL error:", err?.response?.data || err);
    return res.status(500).json({ error: "AI generation failed" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server kuulab pordil ${PORT} (Grok memes)`);
});
