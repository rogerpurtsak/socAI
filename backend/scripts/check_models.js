import fs from 'fs';

(async () => {
  try {
    const env = fs.readFileSync('.env','utf8');
    const keyLine = env.split(/\r?\n/).find(l => l.startsWith('OPENAI_API_KEY'));
    if (!keyLine) { console.error('No OPENAI_API_KEY in .env'); process.exit(1); }
    const key = keyLine.split('=')[1].replace(/^"|"$/g,'');

    const res = await fetch('https://api.openai.com/v1/models', {
      headers: { 'Authorization': `Bearer ${key}` }
    });
    const text = await res.text();
    console.log('STATUS', res.status);
    console.log('BODY', text);
  } catch (e) {
    console.error('ERR', e);
    process.exit(1);
  }
})();
