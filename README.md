# Live Hub

One static site combining three standalone apps behind a single home screen:

- **Live Radio** (`/radio`) — internet radio by country
- **Live Score** (`/scores`) — live scores, schedules & results
- **Live TV** (`/tv`) — free-to-air channel streaming

## How it's put together

- `index.html`, `shell.css`, `shell.js` — the hub shell: the home screen grid
  and the app-switcher chrome (top bar + Back to Home button).
- Each original app is untouched and lives in its own folder (`/radio`,
  `/scores`, `/tv`) exactly as it worked standalone — same files, same
  behavior, no code merged or renamed.
- Selecting a card on the home screen loads that app's `index.html` into a
  full-screen `<iframe>`, so each app keeps running independently with no
  risk of one app's CSS/JS colliding with another's (they were built
  separately and never expected to share a page).
- The **Home** button in the top bar returns to the grid; the browser's own
  Back/Forward buttons and reload also work as expected (routing uses the
  URL hash: `#radio`, `#scores`, `#tv`).

## Run locally

No build step. From this folder:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

(Opening `index.html` directly via `file://` mostly works too, but some
browsers restrict `fetch()` from `file://`, which the Radio and TV apps use
to load their station/channel lists — a local server avoids that.)

## Deploy to GitHub Pages

Push this whole folder to a repo and enable Pages on it (root or `/docs`),
exactly as each original app's own README describes — nothing extra is
needed for the combined version.

## Favorites sync (Google Drive `user.db`)

Both **Live Radio** and **Live TV** can sync their favorites lists to the
same shared file on Google Drive:
<https://drive.google.com/file/d/1LVoOzPspMPz_BL9Q6u06VhzhZH6Vf3jO/view>

- The file holds one small JSON object with two top-level keys —
  `"radio"` and `"tv"` — one per app. Each app only ever reads/writes its
  own key, so running both against the same file never overwrites the
  other's favorites.
- **Radio**: open Live Radio from the home screen, then click the cloud
  icon in the Hub's top bar (next to the reload button) → **Sign in with
  Google**.
- **TV**: open Live TV, then click the same cloud icon in the Hub's top
  bar → **Sign in**. (This icon only appears for Radio and TV — Live
  Score has no favorites to sync.)
- On sign-in, each app pulls whatever's already in the file, merges it
  with what's saved locally (Drive's copy wins per-favorite on overlap),
  saves that merge locally, then writes the merge back — so the very
  first sync on a second device/browser won't wipe out favorites either
  side already had. After that, every favorite/unfavorite while signed in
  is pushed automatically (debounced ~1.5s).
- This uses the broad `https://www.googleapis.com/auth/drive` OAuth
  scope, not the narrower `drive.file`/`drive.appdata` scopes — those can
  only reach files an app created itself or that came through Drive's
  file picker, and this points at a specific file you already own, so it
  needs full read/write access to reach it directly by ID. The Google
  OAuth consent screen will reflect that (an unverified personal app will
  show a "Google hasn't verified this app" warning — that's expected for
  a self-hosted OAuth client that hasn't gone through Google's app
  verification review, not a sign anything's wrong).
- Both apps share one hardcoded OAuth Client ID (already embedded in the
  code) and file ID. To point at a different Drive file or a different
  Google Cloud OAuth client, edit `DRIVE_FILE_ID` / `DRIVE_CLIENT_ID`
  in `radio/app.js`, and `DRIVE_FILE_ID` / `MY_GOOGLE_CLIENT_ID` in
  `tv/index.html` — both are called out in comments right above where
  the Drive sync code starts.
- If the file isn't shared with whichever Google account you sign in
  with, sync will fail with an explicit "file not found" message rather
  than silently doing nothing.
- Signing out only drops the local session token — it doesn't revoke the
  app's Drive access grant. Revoke that from your Google Account's
  connected-apps page if you want to fully disconnect.

## Notes

- Each app's own `README.md` (with details on relays, HTTP-stream handling,
  ESPN endpoints, etc.) wasn't duplicated here to avoid confusion with this
  top-level one — see the original three source repos for that detail if
  you need it.
- `/tv` still ships its optional relay helper scripts
  (`cloudflare-worker-proxy.js`, `home-relay-proxy.js`, `ffmpeg-relay.js`,
  `mediamtx-setup/`) — none of them are required for the site to run; they're
  only for the optional self-hosted relay setups described in
  `tv/HOME-RELAY-README.md`.
