# Christopher & Benjamine's Storybook

Personal bedtime story app for two real children: Christopher (big brother, ~5) and Benjamine (little brother, ~3). Text-only — no illustrations. A parent reads aloud. Words must do ALL the work.

## Skills

- **`/write-story`** — Full story-writing pipeline. Asks intake questions, writes against the complete master spec, runs quality checks, adds to app. **Use this for all new stories.**
- **`/audit-stories`** — Deep quality audit of all stories against research-backed standards.

## The Family

- **Christopher:** Big brother. Strong, brave, explorer. Carries the weight of being "the brave one." Practises emotional intelligence outward (toward Benjamine) before learning to turn it inward. His arc: learning to apply to himself the care he gives his brother.
- **Benjamine** (with an e): Little brother. Curious, silly, blunt. Linguistically and emotionally advanced because he has Christopher as a model. His bravery comes from not stopping to think about it.
- **Mommy and Daddy:** Safety anchors. ALWAYS safe, ALWAYS coming later to sleep in the same bed. Never active characters — presence felt, not shown.
- The brothers share a bed. Togetherness at bedtime is the emotional core.
- **The family lives in Australia.**

## Core Rules (all interactions)

- Character name is **Benjamine** (with an e)
- NEVER dismiss fear — not even as a joke
- Kids must be the ones who ACT — grown-ups support but never solve it FOR them
- Bravery = scared AND doing it anyway, never "not being scared"
- Mommy and Daddy never in danger, never absent, never a worry
- Write for the EAR, not the eye — no illustrations, words must paint every picture
- The Mouth Test: every sentence must feel good to say aloud
- Onomatopoeia is the primary illustration tool
- Sensory stacking: smell, touch, sound, taste, temperature — not visual description
- Travel stories: sensory-first, geography-never. Culture through action, not explanation.

## Story Data

Stories live in `client/src/lib/stories.ts`. Two sources: hardcoded + Supabase custom (ids offset +10000).

```ts
interface Story {
  id: number; title: string; category: string;
  readTime: string; ageRange?: string;
  emoji: string; color: string; pages: { text: string }[];
  dateAdded?: string; isCustom?: boolean; dbId?: number;
}
```

Categories: bedtime, adventure, travel, feelings

## Frameworks (from research)

Stories are built on proven frameworks from master children's authors:
- **Home-Away-Home (Circular)** — Sendak, Jeffers. Primary structure for travel stories.
- **Three Encounters** — Donaldson. Rule of Three with pattern-then-break.
- **Call-and-Response Journey** — Rosen. Repeating obstacle pattern with sound words.
- **Repetition Engine** — Frame + Variable + Sound + Escalation.
- **Dual-Age Writing** — Refrain at Benjamine's level (age 3), narrative at Christopher's level (age 5).
- **Bedtime Deceleration** — Energy: Low → Rise → Peak → Descend → Lowest.

Full spec: `.claude/skills/write-story/story-spec.md`

## Tech Notes

- React 19 + TypeScript + Vite + Tailwind v4 + Framer Motion
- PWA with service worker at `client/public/sw.js` — bump cache version on deploy
- Auto-deploys via Vercel on push to main
