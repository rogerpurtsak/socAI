import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import sharp from "sharp";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Lihtne test-endpoint
app.get("/", (req, res) => {
  res.json({ ok: true, message: "Backend töötab" });
});

// PÕHIASI: genereeri sotsiaalmeedia postitus (caption + pilt, millel on tekst peal)
app.post("/api/generate-post", async (req, res) => {
  try {
    const { description, tone } = req.body;

    if (!description) {
      return res.status(400).json({ error: "description on kohustuslik" });
    }

    // --- CHAT (caption) ---
    const languageInstruction = "Kirjuta postitus eesti keeles.";
    const toneInstruction = tone
      ? `Toon olgu: ${tone}.`
      : "Toon olgu sõbralik ja lihtne.";

    const promptForCaption =
      `${languageInstruction}\n${toneInstruction}\n` +
      "Genereeri lühike sotsiaalmeedia postitus (max 2 lauset) järgmise pildikirjelduse kohta:\n" +
      description;

    const chatResponse = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "Sa oled turundaja, kes kirjutab lühikesi, löövaid eesti keelseid sotsiaalmeedia postitusi.",
        },
        { role: "user", content: promptForCaption },
      ],
      max_tokens: 120,
    });

    const caption =
      chatResponse.choices[0]?.message?.content?.trim() ??
      "AI ei suutnud seekord teksti luua.";

    // --- IMAGE + SHARP TRY/CATCH ERALDI ---
    let finalBase64 = null;

    try {
      const imageResponse = await openai.images.generate({
        model: "gpt-image-1",
        prompt: description,
        size: "1024x1024",
        n: 1,
      });

      const b64Image = imageResponse.data[0].b64_json;
      const imageBuffer = Buffer.from(b64Image, "base64");


      const safeCaption = caption
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      const svgOverlay = `
        <svg width="1024" height="1024">
          <style>
            .caption { 
              fill: white; 
              font-size: 32px; 
              font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            }
          </style>
          <rect x="0" y="824" width="1024" height="200" fill="black" fill-opacity="0.55"/>
          <text x="40" y="880" class="caption">
            ${safeCaption}
          </text>
        </svg>
      `;

      const finalBuffer = await sharp(imageBuffer)
        .composite([{ input: Buffer.from(svgOverlay), top: 0, left: 0 }])
        .png()
        .toBuffer();

      finalBase64 = finalBuffer.toString("base64");
    } catch (imgErr) {
      console.error("IMAGE/SHARP error:", imgErr?.response?.data || imgErr);
      // fallback: vähemalt caption tagasi, pilt null
      finalBase64 = null;
    }

    return res.json({
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
  console.log(`Server kuulab pordil ${PORT}`);
});
