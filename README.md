# reddit-tester-swap 🤝

**Google Play "12 testers × 14 days" helper.** Automatically finds recent tester-exchange posts on Reddit and lets you swap with one click — then tracks your 14 days in a single local page.

구글 플레이 신규 개인 개발자 계정의 **"테스터 12명 × 14일"** 조건을 채우기 위한 품앗이 도우미예요. 레딧에서 테스터를 구하는 최신 글을 자동으로 찾아오고, 클릭 한 번으로 품앗이를 시작하고, 14일 진행 상황을 한 화면에서 관리해요.

## Features / 기능
- 🔎 **Auto search** — reads the newest posts from r/AndroidClosedTesting, r/TestersCommunity, r/androiddevtesters, r/AndroidAppTesters via public RSS and keeps only posts with a Play testing link (last 7 days, results accumulate between runs)
- 🤝 **One-click swap** — opens their opt-in page + their Reddit post, and copies a reply containing your link. Just paste and post.
- ✍️ **Recruit post** — opens Reddit's submit page pre-filled with your title/text
- 📅 **Daily tracker** — "open all apps I haven't opened today", 14-day progress per partner, who is testing your app back, feedback notes

## Usage / 사용법 (Windows)
1. Install [Node.js](https://nodejs.org) 18+
2. Double-click **`품앗이.bat`** (or run `node find-swaps.mjs` then open `swap.html`)
3. Fill in your test link and a 2–3 line pitch once, then press 🤝 on posts you like

## What it does NOT do / 하지 않는 것
It never posts, comments or votes for you. Reddit bans automated posting, and Google filters testers who install but never open the app — so the tool prepares everything and **you** make the final click and actually use each app for a minute a day.

자동 게시·댓글·추천은 하지 않아요. 레딧은 자동 게시 계정을 정지하고, 구글은 설치만 하고 안 쓰는 테스터를 걸러내기 때문이에요.

## Files
| file | |
|---|---|
| `find-swaps.mjs` | Reddit RSS → `candidates.js` |
| `swap.html` | local dashboard (data stays in your browser) |
| `품앗이.bat` | run search + open dashboard |
| `reddit-kit.mjs` | open pre-filled recruit posts from the CLI |

Made while launching **"그거 껐나? / Did I turn it off?"** — an app that asks "stove off?" the moment you leave home.
