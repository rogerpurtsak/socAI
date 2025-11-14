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

const REGULAR_POST_SYSTEM_PROMPT = `
You are a professional social media copywriter who creates engaging captions for Instagram, Facebook, and other platforms.

Your job is to write a compelling caption based on the image description and tone provided.

RESPONSE FORMAT (IMPORTANT):
Return ONLY a plain text caption, no JSON, no explanation.

RULES:
- Write in the tone specified by the user (friendly, humorous, professional, youth-oriented, etc.)
- Length: 100-250 characters ideal, max 400 characters
- Use emojis sparingly and naturally (2-4 max)
- Include a subtle call-to-action when appropriate
- Make it engaging and authentic
- DO NOT use too many hashtags (max 3, and only if they fit naturally)
- Write in a natural, conversational style
`;

// Add this new system prompt at the top with other prompts
const STORY_TO_POSTS_SYSTEM_PROMPT = `
You are a viral content strategist who converts stories, news, or analysis into multiple engaging social media post ideas.

Your job is to analyze the given text and create 3-5 unique post concepts that would go viral.

RESPONSE FORMAT (IMPORTANT):
Return ONLY a JSON array with no explanation:

[
  {
    "postType": "twitter" | "regular",
    "imagePrompt": "detailed description of image to generate",
    "caption": "the meme text or caption",
    "style": "top-bottom" | "top-only" | "bottom-only",
    "angle": "what makes this funny/engaging"
  }
]

RULES:
- Create diverse post types (mix of memes and regular posts)
- Each post should highlight a different angle or moment from the story
- Image prompts must be detailed, visual, and meme-worthy
- For memes: use relatable humor, current trends, Gen-Z language
- For regular posts: use engaging captions with emojis
- Make each post standalone (doesn't require reading the original story)
- Focus on the most viral/shareable moments
- Keep it brand-safe and PG-13
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
    const { description, postType = "twitter", tone = "sõbralik" } = req.body;

    if (!description) {
      return res.status(400).json({ error: "description on kohustuslik" });
    }

    let caption = "";
    let style = "bottom-only";
    let topText = "";
    let bottomText = "";

    // Handle caption generation based on post type
    if (postType === "twitter") {
      // Twitter/meme style with text overlay
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

      caption =
        [topText, bottomText].filter(Boolean).join(" / ") ||
        bottomText ||
        topText ||
        "no caption";
    } else {
      // Regular social media post
      const toneMap = {
        sõbralik: "friendly and warm",
        humoorikas: "humorous and playful",
        ametlik: "professional and polished",
        noortepärane: "youth-oriented and trendy",
      };

      const regularResp = await grok.chat.completions.create({
        model: "grok-3-mini",
        messages: [
          { role: "system", content: REGULAR_POST_SYSTEM_PROMPT },
          {
            role: "user",
            content:
              `Image description: ${description}\n` +
              `Tone: ${toneMap[tone] || tone}\n` +
              "Write an engaging social media caption for this image.",
          },
        ],
        max_tokens: 200,
      });

      caption = regularResp.choices[0]?.message?.content?.trim() || "Check out this amazing moment! ✨";
    }

    // 2) Generate image with Grok
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

      if (postType === "twitter") {
        // Twitter style: Add text overlay to image
        const canvasWidth = 1024;
        const canvasHeight = 1400;
        const topAreaHeight = 180;
        const bottomAreaHeight = 180;

        const availableImageHeight = canvasHeight - topAreaHeight - bottomAreaHeight;
        const availableImageWidth = canvasWidth;

        const resizedImageBuffer = await sharp(imageBuffer)
          .resize({
            width: availableImageWidth,
            height: availableImageHeight,
            fit: "inside",
            background: { r: 255, g: 255, b: 255, alpha: 1 },
          })
          .toBuffer();

        const meta = await sharp(resizedImageBuffer).metadata();
        const imgW = meta.width || availableImageWidth;
        const imgH = meta.height || availableImageHeight;

        const imageLeft = Math.floor((canvasWidth - imgW) / 2);
        const imageTop =
          topAreaHeight + Math.floor((availableImageHeight - imgH) / 2);

        const canvas = sharp({
          create: {
            width: canvasWidth,
            height: canvasHeight,
            channels: 3,
            background: { r: 255, g: 255, b: 255 },
          },
        });

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
            { input: resizedImageBuffer, top: imageTop, left: imageLeft },
            { input: Buffer.from(svgOverlay), top: 0, left: 0 },
          ])
          .png()
          .toBuffer();

        finalBase64 = finalBuffer.toString("base64");
      } else {
        // Regular post: Just resize the image without text overlay
        const finalBuffer = await sharp(imageBuffer)
          .resize({
            width: 1080,
            height: 1080,
            fit: "cover",
            position: "center",
          })
          .png()
          .toBuffer();

        finalBase64 = finalBuffer.toString("base64");
      }
    } catch (imgErr) {
      console.error("GROK IMAGE/SHARP error:", imgErr?.response?.data || imgErr);
      finalBase64 = null;
    }

    return res.json({
      postType,
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

// Add new endpoint after the existing /api/generate-post
app.post("/api/story-to-posts", async (req, res) => {
  try {
    const { storyText, numberOfPosts = 3, tone = "humoorikas" } = req.body;

    if (!storyText || storyText.trim().length < 20) {
      return res.status(400).json({ 
        error: "Story text is too short. Please provide at least a few sentences." 
      });
    }

    // Step 1: Get AI to generate post ideas from the story
    const ideaResp = await grok.chat.completions.create({
      model: "grok-3-mini",
      messages: [
        { role: "system", content: STORY_TO_POSTS_SYSTEM_PROMPT },
        {
          role: "user",
          content: 
            `Story/Text:\n${storyText}\n\n` +
            `Generate ${numberOfPosts} viral social media post ideas from this. ` +
            `Make them funny, relatable, and shareable. Mix meme posts and regular posts.`,
        },
      ],
      max_tokens: 1000,
    });

    let postIdeas = [];
    try {
      const raw = ideaResp.choices[0]?.message?.content ?? "[]";
      console.log("RAW POST IDEAS:", raw);
      
      const cleaned = raw.replace(/```[a-zA-Z]*\s*|```/g, "").trim();
      postIdeas = JSON.parse(cleaned);
      
      // Limit to requested number
      postIdeas = postIdeas.slice(0, numberOfPosts);
    } catch (e) {
      console.error("Failed to parse post ideas:", e);
      return res.status(500).json({ 
        error: "AI failed to generate post ideas. Please try again." 
      });
    }

    if (!Array.isArray(postIdeas) || postIdeas.length === 0) {
      return res.status(500).json({ 
        error: "No post ideas generated. Please try with different text." 
      });
    }

    // Step 2: Generate each post (image + caption)
    const generatedPosts = [];
    
    for (let i = 0; i < postIdeas.length; i++) {
      const idea = postIdeas[i];
      console.log(`Generating post ${i + 1}/${postIdeas.length}...`);

      try {
        let caption = "";
        let style = idea.style || "bottom-only";
        let topText = "";
        let bottomText = "";

        // Generate appropriate caption based on post type
        if (idea.postType === "twitter") {
          // For meme posts, refine the caption into proper meme format
          const memeResp = await grok.chat.completions.create({
            model: "grok-3-mini",
            messages: [
              { role: "system", content: MEME_SYSTEM_PROMPT },
              {
                role: "user",
                content: 
                  `Image: ${idea.imagePrompt}\n` +
                  `Suggested caption: ${idea.caption}\n` +
                  `Create a meme-style text overlay for this image.`,
              },
            ],
            max_tokens: 150,
          });

          try {
            const raw = memeResp.choices[0]?.message?.content ?? "{}";
            const cleaned = raw.replace(/```[a-zA-Z]*\s*|```/g, "");
            const parsed = JSON.parse(cleaned);

            style = parsed.style || style;
            topText = parsed.top_text || "";
            bottomText = parsed.bottom_text || "";
          } catch (e) {
            // Fallback to idea caption
            bottomText = idea.caption || "viral moment";
          }

          caption = [topText, bottomText].filter(Boolean).join(" / ") || idea.caption;
        } else {
          // Regular post - use the caption directly with some emoji enhancement
          caption = idea.caption || "Check this out! 🔥";
        }

        // Generate image
        let finalBase64 = null;
        
        try {
          const imageResponse = await grok.images.generate({
            model: "grok-2-image",
            prompt: idea.imagePrompt,
            n: 1,
            response_format: "b64_json",
          });

          const b64Image = imageResponse.data[0]?.b64_json;
          if (b64Image) {
            const imageBuffer = Buffer.from(b64Image, "base64");

            if (idea.postType === "twitter") {
              // Twitter meme style with text overlay
              const canvasWidth = 1024;
              const canvasHeight = 1400;
              const topAreaHeight = 180;
              const bottomAreaHeight = 180;

              const availableImageHeight = canvasHeight - topAreaHeight - bottomAreaHeight;
              const availableImageWidth = canvasWidth;

              const resizedImageBuffer = await sharp(imageBuffer)
                .resize({
                  width: availableImageWidth,
                  height: availableImageHeight,
                  fit: "inside",
                  background: { r: 255, g: 255, b: 255, alpha: 1 },
                })
                .toBuffer();

              const meta = await sharp(resizedImageBuffer).metadata();
              const imgW = meta.width || availableImageWidth;
              const imgH = meta.height || availableImageHeight;

              const imageLeft = Math.floor((canvasWidth - imgW) / 2);
              const imageTop = topAreaHeight + Math.floor((availableImageHeight - imgH) / 2);

              const canvas = sharp({
                create: {
                  width: canvasWidth,
                  height: canvasHeight,
                  channels: 3,
                  background: { r: 255, g: 255, b: 255 },
                },
              });

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

              const topLines = style === "top-only" || style === "top-bottom" ? splitLines(topText) : [];
              const bottomLines = style === "bottom-only" || style === "top-bottom" ? splitLines(bottomText) : [];

              const lineHeight = 44;
              const topStartY = 70;
              const bottomStartY = canvasHeight - bottomAreaHeight + 60 - lineHeight * (bottomLines.length - 1 || 0);

              let textSvgParts = [];

              topLines.forEach((line, idx) => {
                const y = topStartY + idx * lineHeight;
                textSvgParts.push(`<text x="${canvasWidth / 2}" y="${y}" class="caption">${line}</text>`);
              });

              bottomLines.forEach((line, idx) => {
                const y = bottomStartY + idx * lineHeight;
                textSvgParts.push(`<text x="${canvasWidth / 2}" y="${y}" class="caption">${line}</text>`);
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
                  { input: resizedImageBuffer, top: imageTop, left: imageLeft },
                  { input: Buffer.from(svgOverlay), top: 0, left: 0 },
                ])
                .png()
                .toBuffer();

              finalBase64 = finalBuffer.toString("base64");
            } else {
              // Regular post - clean image
              const finalBuffer = await sharp(imageBuffer)
                .resize({ width: 1080, height: 1080, fit: "cover", position: "center" })
                .png()
                .toBuffer();

              finalBase64 = finalBuffer.toString("base64");
            }
          }
        } catch (imgErr) {
          console.error(`Image generation failed for post ${i + 1}:`, imgErr);
        }

        generatedPosts.push({
          id: Date.now() + i,
          postType: idea.postType,
          caption,
          imageBase64: finalBase64,
          angle: idea.angle,
          style,
          topText,
          bottomText,
        });

        // Small delay to avoid rate limits
        if (i < postIdeas.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (postErr) {
        console.error(`Failed to generate post ${i + 1}:`, postErr);
        // Continue with next post even if one fails
      }
    }

    return res.json({
      success: true,
      totalGenerated: generatedPosts.length,
      posts: generatedPosts,
    });

  } catch (err) {
    console.error("Story-to-posts error:", err?.response?.data || err);
    return res.status(500).json({ error: "Failed to generate posts from story" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server kuulab pordil ${PORT} (Grok memes)`);
});
