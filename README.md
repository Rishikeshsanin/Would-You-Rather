# Would You Rather?

A zero-login, full-screen **red vs blue** choice game. Pick one side first, then reveal how a historical crowd voted on the same dilemma.

## V1

- Animated red/blue landing screen
- 100 curated historical Would You Rather polls
- Real per-option vote counts bundled with every question
- Percentages calculated directly from those stored counts
- Full-screen 50/50 red vs blue desktop layout
- Responsive top/bottom mobile layout
- Results hidden until the player chooses
- Animated percentage reveal
- Randomized question order per session
- No login, account, profile, cookies, or vote submission
- No runtime database or API dependency
- Reduced-motion support

## Data integrity

V1 is **display-only**. A player's click is not submitted, stored, or added to the historical totals.

Every question in `questions.js` includes:

```js
{
  id: "q001",
  red: "Choice A",
  redVotes: 462554,
  blue: "Choice B",
  blueVotes: 1121946
}
```

The UI computes percentages only from `redVotes + blueVotes`. It never generates or fabricates a crowd split.

The historical counts were curated from a public CSV mirror of an Either.io question archive:

https://github.com/DaRealTurtyWurty/TurtyAPI/blob/b6e209dfb2d5a2d934cc6c48c27c039086b0fa85/src/main/resources/wyr/would_you_rathers.csv

Question wording in this project is lightly normalized for spelling/readability while preserving the original choice meaning. The vote counts remain the historical snapshot attached to those choices.

## Architecture

V1 is intentionally static:

- `index.html` — app shell
- `styles.css` — responsive red/blue UI and animations
- `questions.js` — 100 curated polls + historical counts
- `app.js` — session shuffle, choice reveal, percentage calculation
- `vercel.json` — static hosting/security headers
- `tools/check.mjs` — data and source-integrity validation

No Supabase schema is required for this release. If a future release needs persistent app data, it should follow the existing shared Project Hub isolation model rather than creating a dedicated Supabase project.

## Run locally

No dependencies or build step are required.

```bash
python -m http.server 4173
```

Open `http://localhost:4173`.

Validation:

```bash
npm run check
```

## Roadmap

V1 stays deliberately basic. Future releases can add categories, streaks, sharing, daily questions, filters, or refreshed historical datasets without changing the core two-choice experience.
