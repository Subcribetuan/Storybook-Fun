# 🌙 Christopher & Benjamin's Storybook

A bedtime storybook PWA for two brave brothers. 11 stories about sleeping brave, learning to swim, breathing through fear, and midnight monster truck races with the Paw Patrol.

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:5173` on your phone (same wifi) to test.

## Build & Deploy

```bash
npm run build
```

The `dist/` folder is your deployable PWA. Drop it on:
- **Netlify**: drag `dist/` folder to app.netlify.com
- **Vercel**: `npx vercel dist/`
- **Any static host**: upload the `dist/` folder

## Add to Phone

1. Deploy to any URL (or run locally)
2. Open URL in Chrome/Safari on your phone
3. Tap "Add to Home Screen"
4. App works offline from that point on

## Project Structure

```
src/
  components/
    StarField.jsx       # Animated background stars
    HomeView.jsx        # Story grid with category filters
    StoryCard.jsx       # Individual story card
    FilterBar.jsx       # Category filter pills
    ReadingView.jsx     # Page-by-page story reader
    InstallBanner.jsx   # PWA install prompt
  data/
    stories.js          # ALL story content (add new stories here)
  hooks/
    useStore.js         # Zustand state (view, filters, progress, favorites)
    useSwipe.js         # Touch swipe detection
  styles/
    global.css          # CSS variables, animations, resets
  App.jsx               # Root component
  main.jsx              # Entry point
```

## Adding a New Story

Edit `src/data/stories.js` and add an object to the array:

```js
{
  id: 12,
  title: "Your New Story",
  category: "bedtime",    // bedtime | adventure | swimming | breathing
  readTime: "3 min",
  emoji: "🌟",
  color: "#6366f1",       // accent color (hex)
  pages: [
    { text: `Page one text.\n\nSecond paragraph.\n\n"Dialogue," said someone.` },
    { text: `Page two text.\n\nBOOM! (caps = sound effects, auto-styled)` }
  ]
}
```

## Tech

React 18 · Vite 6 · Zustand · React Router · vite-plugin-pwa · Framer Motion (available, not yet wired in)
