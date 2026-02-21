# Tool Research — Frontend Engineer
**Owner:** Theo Park
**Sprint:** Prototype / 1-hour research

---

## Framework

**Next.js 14 (free, MIT)**

Best fit for this project:
- Native SSE support via route handlers (no library needed)
- PWA support via `next-pwa` (free)
- Easy Railway deployment (Dockerfile or Nixpacks auto-detect)
- React ecosystem — widest component/library access
- App Router gives clean layout/page structure for the 8 screens

**Considered:**
- SvelteKit: smaller bundle, but smaller ecosystem. Rejected — React ecosystem is more important for prototype speed.
- Vite + React: no SSR, simpler, but Railway deployment is less turnkey.
- Remix: good for forms/actions but adds complexity without benefit here.

**Decision: Next.js 14 (App Router).**

---

## Styling

**Tailwind CSS (free, MIT)**

Systematic spacing and typography utilities match the "sacred minimalism" constraint — it discourages ad-hoc decoration. Works with Next.js out of the box.

`tailwind-merge` + `clsx` for conditional class logic.

Custom Tailwind config to enforce the three-value color system Suki defined.

**Decision: Tailwind CSS.**

---

## Voice Recording

**Native MediaRecorder API — no library.**

Reason: Third-party recording libraries add abstraction that makes cross-browser behavior harder to debug. For the prototype, native MediaRecorder is simpler and more controllable.

**Browser format handling:**
- Chrome/Android: `audio/webm;codecs=opus` (preferred)
- Safari/iOS: `audio/mp4` (fallback — MediaRecorder on iOS 14.3+)
- Firefox: `audio/ogg;codecs=opus`

Detection pattern:
```javascript
const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
  ? 'audio/webm;codecs=opus'
  : MediaRecorder.isTypeSupported('audio/mp4')
  ? 'audio/mp4'
  : 'audio/ogg';
```

Whisper API accepts all three formats. No client-side transcoding needed.

**Waveform:** Simple canvas-drawn waveform from `AnalyserNode` (Web Audio API, native). Draw amplitude bars at ~30fps. No library needed — 30 lines of code.

**Decision: Native MediaRecorder + Web Audio API for waveform.**

---

## SSE Client

**Native `EventSource` (built into browsers)**

The two-step pattern agreed in the kickoff (POST audio → receive session_id → connect SSE stream) is clean for EventSource. `GET /api/sessions/:id/stream` as an EventSource endpoint.

**One issue:** EventSource doesn't support custom headers (no auth token). For the prototype (device token in localStorage), use a query param: `GET /api/sessions/:id/stream?token=xxx`. Not ideal for production but fine for prototype with no real auth.

**Alternative considered:** `fetch` with streaming (`ReadableStream`). More complex for the same result. Rejected.

**Decision: Native EventSource.**

---

## Animation

**CSS keyframes only for the processing ritual ring.** No library.

The breathing ring Suki specified (4s expand, 4s contract, infinite loop) is a single `@keyframes scale()`. Framer Motion would be overkill.

State label transitions: `opacity` CSS transition (200ms ease). No movement — only fade.

**Framer Motion** would add ~30kb for no benefit at this scope. Skip for prototype.

**Decision: CSS animations only.**

---

## Icons

**Lucide React (free, ISC license)**

Clean, minimal, consistent. Works with Next.js. Import only the icons you use (tree-shakeable).

The prototype needs very few icons: record button, stop button, play, replay, maybe a chevron. Lucide covers all of these.

**Decision: Lucide React.**

---

## PWA

**`next-pwa` (free, MIT)**

Simple wrapper around Workbox for Next.js. Adds a service worker and manifest. Required for iOS "Add to Home Screen" behavior and offline shell caching.

Config: cache the shell (layout, fonts, static assets). Do not cache API responses.

**Decision: `next-pwa`.**

---

## Deployment on Railway

Next.js deploys to Railway via Nixpacks (auto-detected) or a Dockerfile. Railway's free tier has limits; Ngozi's existing project may already have a service slot.

Build command: `next build`. Start command: `next start`.

Set `NEXT_PUBLIC_API_URL` environment variable pointing to the backend service on Railway.

---

## Dependency Summary

```json
{
  "dependencies": {
    "next": "14.x",
    "react": "18.x",
    "react-dom": "18.x",
    "lucide-react": "latest",
    "clsx": "latest",
    "tailwind-merge": "latest",
    "next-pwa": "latest"
  },
  "devDependencies": {
    "typescript": "5.x",
    "tailwindcss": "3.x",
    "autoprefixer": "latest",
    "postcss": "latest"
  }
}
```

Total added dependencies: minimal. No large libraries.
