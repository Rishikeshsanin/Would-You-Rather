# Would You Rather?

A no-login, full-screen **red vs blue** choice game. Pick a side first, then reveal the crowd split.

## V1

- Animated red/blue landing screen
- 100 original questions
- Full-screen 50/50 red vs blue layout
- Responsive mobile top/bottom layout
- Results stay hidden until a choice is made
- Animated percentage reveal
- Vote counts and question progress
- Randomized question order per session
- Zero-account experience
- Reduced-motion support

## Vote integrity

The application is designed for real aggregate voting. `config.js` contains the public base URL for an isolated vote API. Until that database is connected, the UI runs in clearly labelled **Preview mode** and stores only real votes made on that browser/device; it never fabricates community percentages.

For the production crowd-vote backend, each question stores two counters (`red`, `blue`). The frontend submits only:

```json
{ "questionId": "q001", "choice": "red" }
```

No name, email, profile, or login is required.

## Run locally

No build step is required:

```bash
python -m http.server 4173
```

Then open `http://localhost:4173`.

## Files

- `index.html` — app shell
- `styles.css` — responsive red/blue UI and animations
- `questions.js` — 100 original V1 prompts
- `app.js` — game loop, voting adapter, result animation
- `config.js` — isolated vote API URL
- `vercel.json` — static hosting/security headers

## Data source policy

The project does **not** copy question banks or pretend generated numbers are historical votes. Community percentages will be calculated from records created by actual players of this game.

## Roadmap

V1 is intentionally basic. Future releases can add categories, streaks, sharing, daily questions, country splits, and richer result analytics.
