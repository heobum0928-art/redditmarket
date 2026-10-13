// 앱 아이콘 후보를 여러 개 만든다 (테두리 없이 꽉 채운 정사각형, 안드로이드 적응형 아이콘용)
// 사용법: node gen-icons.mjs  → images/icon-a.png, icon-b.png, icon-c.png
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const KEY = process.env.KIE_API_KEY || (await readFile(new URL('./kie-key.txt', import.meta.url), 'utf8').catch(() => '')).trim();
if (!KEY) { console.error('kie-key.txt에 API 키가 필요해요'); process.exit(1); }
const API = 'https://api.kie.ai/api/v1/jobs';
const headers = { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const BASE = 'Premium mobile app icon, full-bleed square canvas, background color fills the entire image edge to edge, NO border, NO frame, NO rounded corners, NO outer shape, NO text, single centered symbol occupying the middle 55% only, generous empty margin, flat vector, crisp, modern, Apple design award quality';
const JOBS = [
  { file: 'icon-a.png', prompt: `${BASE}. Deep emerald green solid background. A minimal white house outline whose doorway contains a bold white check mark.` },
  { file: 'icon-b.png', prompt: `${BASE}. Solid charcoal black background. A single soft green gas-flame shape with a small white check mark cut out of it, subtle gradient on the flame.` },
  { file: 'icon-c.png', prompt: `${BASE}. Warm cream solid background. A thick rounded black door key shape combined with a green check mark, playful but clean.` },
];

await mkdir(new URL('./images/', import.meta.url), { recursive: true });
await Promise.all(JOBS.map(async (job) => {
  const c = await (await fetch(`${API}/createTask`, { method: 'POST', headers, body: JSON.stringify({ model: 'google/nano-banana', input: { prompt: job.prompt, output_format: 'png', aspect_ratio: '1:1' } }) })).json();
  if (c.code !== 200) return console.error(`❌ ${job.file}`, JSON.stringify(c));
  for (let i = 0; i < 60; i++) {
    await sleep(5000);
    const d = (await (await fetch(`${API}/recordInfo?taskId=${c.data.taskId}`, { headers })).json()).data ?? {};
    if (d.state === 'fail') return console.error(`❌ ${job.file} ${d.failMsg ?? ''}`);
    if (d.state === 'success') {
      const url = JSON.parse(d.resultJson).resultUrls[0];
      await writeFile(new URL(`./images/${job.file}`, import.meta.url), Buffer.from(await (await fetch(url)).arrayBuffer()));
      return console.log(`✅ images/${job.file}`);
    }
  }
}));
