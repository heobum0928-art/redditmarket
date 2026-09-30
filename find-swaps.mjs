// 레딧 테스터 교환 게시판의 최신 글을 읽어, 테스트 링크가 있는 글만 골라 candidates.js로 저장한다.
// swap.html이 이 파일을 읽어 "새 품앗이 상대" 목록으로 보여준다. (읽기만 하고 아무것도 올리지 않는다)
import { readFile, writeFile } from 'node:fs/promises';

const SUBS = ['AndroidClosedTesting', 'TestersCommunity', 'androiddevtesters', 'AndroidAppTesters'];
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140 Safari/537.36';
const MAX_AGE_DAYS = 7;

const decode = (s) => s
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
const tag = (xml, name) => (xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`)) || [])[1] || '';

function parse(sub, xml) {
  return xml.split('<entry>').slice(1).map((e) => {
    const html = decode(decode(tag(e, 'content')));
    const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    // 참여 링크: 플레이 테스트 링크 > 구글 그룹 > 스토어 상세 링크 순으로 고른다
    const links = [...html.matchAll(/https?:\/\/(?:play\.google\.com|groups\.google\.com)[^\s"'<>)\]]+/g)].map((m) => m[0]);
    const join = links.find((l) => l.includes('/apps/testing/')) || links.find((l) => l.includes('groups.google')) || links[0];
    return {
      id: tag(e, 'id'),
      sub,
      title: decode(tag(e, 'title')),
      author: tag(tag(e, 'author'), 'name').replace('/u/', ''),
      post: (e.match(/<link href="([^"]+)"/) || [])[1],
      time: tag(e, 'updated') || tag(e, 'published'),
      join,
      links: [...new Set(links)],
      summary: text.slice(0, 220),
    };
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// 레딧은 연속 요청을 429로 막으므로 간격을 두고, 막히면 한 번 더 기다렸다 시도한다
async function get(url) {
  for (let i = 0; i < 3; i++) {
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (res.status !== 429) return res;
    await sleep(8000 * (i + 1));
  }
  return { ok: false, status: 429 };
}

const all = [];
for (const [n, sub] of SUBS.entries()) {
  if (n) await sleep(4000);
  try {
    const res = await get(`https://www.reddit.com/r/${sub}/new/.rss?limit=50`);
    if (!res.ok) { console.log(`r/${sub}: 건너뜀 (${res.status})`); continue; }
    const items = parse(sub, await res.text()).filter((x) => x.join);
    console.log(`r/${sub}: 테스트 링크 있는 글 ${items.length}개`);
    all.push(...items);
  } catch (e) {
    console.log(`r/${sub}: 실패 ${e.message}`);
  }
}

// 레딧이 일부 게시판을 막아도 결과가 줄지 않게 지난번 결과와 합친다
try {
  const prev = await readFile(new URL('./candidates.js', import.meta.url), 'utf8');
  all.push(...JSON.parse(prev.slice(prev.indexOf('=') + 1, prev.indexOf(';window.CANDIDATES_AT'))));
} catch {}

const cutoff = Date.now() - MAX_AGE_DAYS * 864e5;
const seen = new Set();
const fresh = all
  .filter((x) => new Date(x.time).getTime() > cutoff)
  .filter((x) => !seen.has(x.join) && seen.add(x.join))
  .sort((a, b) => new Date(b.time) - new Date(a.time));

await writeFile(new URL('./candidates.js', import.meta.url),
  `window.CANDIDATES=${JSON.stringify(fresh)};window.CANDIDATES_AT=${JSON.stringify(new Date().toISOString())};`);
console.log(`\n최근 ${MAX_AGE_DAYS}일 품앗이 후보 ${fresh.length}개 → candidates.js`);
