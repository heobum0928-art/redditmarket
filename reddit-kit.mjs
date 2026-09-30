// 레딧 품앗이 글을 서브레딧별로 만들어, 제목·본문이 채워진 작성 페이지를 브라우저로 연다.
// 로그인한 본인이 내용을 확인하고 "Post"만 누르면 된다. (자동 게시는 레딧 규칙 위반이라 하지 않는다)
// 사용법: node reddit-kit.mjs <테스터 참여 링크>
import { exec } from 'node:child_process';

const link = process.argv[2] ?? '<구글 플레이 테스트 참여 링크>';

const POSTS = [
  {
    sub: 'AndroidClosedTesting',
    title: '[Tester exchange] "Did I turn it off?" – reminds you to check the stove/door when you leave home',
    text: `Hi! I need testers for Google Play's 14-day closed test. Happy to test yours back — just comment your link and I'll join within 24h.

**What it does:** when you leave home, your phone asks "Did you turn off the stove?" You tap once (optionally snap a photo), and later when anxiety hits on the bus you open the app and see "Checked at 08:12".

- No account, no server — location never leaves your phone
- Add your own items (meds, pet water, charger...)

Join: ${link}

Please keep it installed for 14 days 🙏 I'll do the same for you.`,
  },
  {
    sub: 'TestersCommunity',
    title: 'Test for test: tiny app that asks "stove off?" when you leave home',
    text: `Looking for testers (12 needed for 14 days). I'll test your app in return — drop your link below.

Join: ${link}

Feedback on the leave-home notification timing is super welcome!`,
  },
];

const open = (url) => exec(process.platform === 'win32' ? `start "" "${url}"` : `open "${url}"`);

for (const p of POSTS) {
  const url = `https://www.reddit.com/r/${p.sub}/submit?type=TEXT&title=${encodeURIComponent(p.title)}&text=${encodeURIComponent(p.text)}`;
  console.log(`r/${p.sub} → 브라우저에서 내용 확인 후 Post를 누르세요`);
  open(url);
}
