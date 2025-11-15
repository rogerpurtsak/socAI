import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.OPENAI_API_KEY;
if (!API_KEY) {
  console.error('OPENAI_API_KEY not found in .env');
  process.exit(1);
}

const prompt = 'A short cinematic clip of golden hour on a beach, slow pan, waves, warm colors, a child running then a gull flying away';
const base = 'https://api.openai.com/v1';

const tries = [
  { url: '/video/generations', body: { model: 'sora-2', prompt, quality: 'hd', duration: 6 } },
  { url: '/responses', body: { model: 'sora-2', input: prompt } },
  { url: '/responses', body: { model: 'sora-2', input: [{ role: 'user', content: prompt }] } },
  { url: '/responses', body: { model: 'sora-2', input: [{ role: 'user', content: [{ type: 'input_text', text: prompt }] }] } },
  { url: '/responses', body: { model: 'sora-2', input: prompt, modalities: ['video'] } },
  { url: '/responses', body: { model: 'sora-2', input: { text: prompt }, modalities: ['video'] } },
];

async function run() {
  for (let i = 0; i < tries.length; i++) {
    const t = tries[i];
    console.log('\n== Try', i + 1, t.url);
    try {
      const resp = await fetch(base + t.url, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(t.body),
      });
      const txt = await resp.text().catch(() => null);
      console.log('STATUS', resp.status);
      try {
        console.log('BODY', JSON.parse(txt));
      } catch (e) {
        console.log('BODY (raw)', txt);
      }
    } catch (err) {
      console.error('Request failed', err?.message || err);
    }
  }
}

run();
