// 앱 항목 아이콘을 같은 스타일로 한꺼번에 만든다 → app/assets/items/<key>.png
// 사용법: node gen-item-icons.mjs         (이미 있는 그림은 건너뜀)
//         node gen-item-icons.mjs gas door  (특정 항목만 다시 만들기)
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const KEY = process.env.KIE_API_KEY || (await readFile(new URL('./kie-key.txt', import.meta.url), 'utf8').catch(() => '')).trim();
if (!KEY) { console.error('kie-key.txt에 API 키가 필요해요'); process.exit(1); }
const API = 'https://api.kie.ai/api/v1/jobs';
const headers = { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const OUT = new URL('../app/assets/items/', import.meta.url);

// presets.ts에서 key와 설명을 그대로 읽어 온다 (목록을 한 곳에서만 관리)
const src = await readFile(new URL('../app/src/presets.ts', import.meta.url), 'utf8');
const items = [...src.matchAll(/key: '([^']+)'[^}]*en: '([^']+)'/g)].map((m) => ({ key: m[1], en: m[2] }));
const only = process.argv.slice(2);
const todo = items.filter((i) => (only.length ? only.includes(i.key) : !existsSync(new URL(`${i.key}.png`, OUT))));

// 모든 아이콘이 한 세트처럼 보이도록 스타일 문장을 고정한다
const STYLE = 'Minimal flat line illustration icon of SUBJECT, thin clean black outline, soft green accent fills, warm cream off-white background filling the whole square, centered with generous margin, friendly and calm, consistent icon set style, no text, no border, no frame, no shadow';

async function make(item) {
  const c = await (await fetch(`${API}/createTask`, {
    method: 'POST', headers,
    body: JSON.stringify({ model: 'google/nano-banana', input: { prompt: STYLE.replace('SUBJECT', item.en), output_format: 'png', aspect_ratio: '1:1' } }),
  })).json();
  if (c.code !== 200) throw new Error(JSON.stringify(c));
  for (let i = 0; i < 60; i++) {
    await sleep(5000);
    const d = (await (await fetch(`${API}/recordInfo?taskId=${c.data.taskId}`, { headers })).json()).data ?? {};
    if (d.state === 'fail') throw new Error(d.failMsg ?? 'fail');
    if (d.state === 'success') {
      const url = JSON.parse(d.resultJson).resultUrls[0];
      await writeFile(new URL(`${item.key}.raw`, OUT), Buffer.from(await (await fetch(url)).arrayBuffer()));
      return;
    }
  }
  throw new Error('timeout');
}

await mkdir(OUT, { recursive: true });
console.log(`만들 아이콘 ${todo.length}개`);
// 한 번에 6개씩 동시에 요청한다
const failed = [];
for (let i = 0; i < todo.length; i += 6) {
  await Promise.all(todo.slice(i, i + 6).map(async (it) => {
    try { await make(it); console.log(`✅ ${it.key}`); } catch (e) { failed.push(it.key); console.log(`❌ ${it.key} ${e.message}`); }
  }));
}
console.log(failed.length ? `\n실패: ${failed.join(' ')}  → node gen-item-icons.mjs ${failed.join(' ')}` : '\n모두 완료. .raw 파일을 PNG로 줄이는 단계가 남았어요.');
