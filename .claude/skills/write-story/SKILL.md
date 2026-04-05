---
name: write-story
description: Write a new bedtime story for Christopher & Benjamine using the full master spec. Asks intake questions, writes the story, runs quality checks, and adds it to stories.ts.
allowed-tools: Read, Grep, Glob, Edit, Write, Bash, AskUserQuestion, TodoWrite
---

# Write a New Story

You are writing a bedtime story for two real children: Christopher (big brother, ~5) and Benjamine (little brother, ~3). These are personal, emotionally grounded stories built on a shared universe. Every story must feel like it was written by someone who knows and loves THESE two specific boys.

Read the full spec at [story-spec.md](story-spec.md) before doing anything else.

## Step 1: Intake Questions

Ask the user these questions (use AskUserQuestion for choices, but question 4 MUST be open-ended):

1. **What's this story about?** What category? Any specific fear, milestone, or situation?
2. **Which characters should appear?** (Paw Patrol pups, Oliver, Tumble, Finley & Gus, or someone new?)
3. **Short or long?** Short = 2 min / 3-4 pages (ages 3-4). Standard = 3-5 min / 5-7 pages (ages 4-7). Long = 5 min / 7-9 pages (ages 5-7).
4. **What did you notice Christopher or Benjamine do this week?** One specific physical action — not a feeling, not a theme. Something they did with their body or mouth. (Example: "Christopher always grabs the corner of the pillowcase with two fingers" or "Benjamine pronounces 'spaghetti' as 'pasketti' and refuses to be corrected")

If the user doesn't have an answer for #4, offer to skip it but note in the story comments that the Observed Moment requirement was not met.

## Step 2: Read Current State

Before writing:

1. Read `client/src/lib/stories.ts` to know:
   - The current highest story ID
   - What stories already exist (avoid duplicate themes)
   - Character arcs — where are the boys NOW in their development?
2. Read the full spec in [story-spec.md](story-spec.md) for all writing rules.

## Step 3: Write the Story

Write the story following ALL rules in the spec. Output each page labeled PAGE 1, PAGE 2, etc.

The story MUST include:
- **Observed Moment** — the specific physical action from Step 1 Q4, placed exactly once, quietly
- **Purposeless True Detail** — something true about one of the boys with no plot function (early, first 2 pages)
- **Slow Moment** — at least 2 sentences where something difficult sits before anyone responds
- **Heat Before Cooling** — fear held for a full page before comfort begins
- **Performance Note** — one line telling the parent where to whisper or slow down
- **"Me too" moment** — with specific physical detail
- **At least ONE callback** to a previous story
- **Body Test** passing — every important moment happens in a body first

### Age-Specific Rules

**Ages 3-4:** 3-5 pages, 150-300 words. 5-8 word sentences. ONE feeling. Simple repetition. Benjamine leads, Christopher anchors.

**Ages 4-7:** 5-7 pages, 400-700 words. Full emotional arc, humor, callbacks. Both brothers active.

**Ages 5-7:** 7-9 pages, 800-1200 words MAX. Complex emotions. Christopher leads emotionally.

## Step 4: Quality Checks

Run EVERY check from the spec. Present results to the user:

| Check | Pass/Fail | Notes |
|---|---|---|
| 3-Year-Old Test | | Would they still be listening on page 4? |
| Body Test | | Every important moment in a body? |
| Whisper Test | | Can you whisper-read the last page? |
| "Again" Test | | One quotable line? One memorable moment? One recognized feeling? |
| Callback Test | | At least one reference to previous story? |
| Human Test | | Observed Moment? Purposeless True Detail? Slow Moment? Performance Note? |
| Parent Test | | Would the parent laugh? Feel something? Want to re-read? |
| Discovery Test | | Did anything surprise you while writing? |
| Heat Before Cooling | | Fear held for a full page before comfort? |

If any check fails, fix it before presenting the final story.

## Step 5: Present to User

Show the complete story with:
- All pages labeled
- The Performance Note highlighted
- The quality check table
- A note on which callbacks were used

Ask: "Does this feel right? Any changes before I add it to the app?"

## Step 6: Add to App

Once approved:

1. Read `client/src/lib/stories.ts` to get current state
2. Add the new story object with the next available ID
3. Use appropriate metadata:
   - `category`: bedtime | breathing | swimming | adventure | paw-patrol | feelings
   - `readTime`: "2 min" | "3 min" | "5 min"
   - `ageRange`: "3-4" | "3-5" | "3-7" | "4-7" | "5-7"
   - `emoji`: 3 relevant emojis
   - `color`: Tailwind gradient (from-X-NNN to-Y-NNN)
   - `dateAdded`: today's date (YYYY-MM-DD)
4. Run `npx vite build` to verify
5. Bump SW cache version in `client/public/sw.js`
6. Commit with descriptive message
7. Push to deploy

## Important Notes

- Character name is **Benjamine** (with an e) — confirmed by parent
- Stories come from TWO sources: hardcoded in stories.ts + Supabase custom stories
- The app auto-deploys via Vercel when pushed to main
- NEVER dismiss fear in these stories. Not even as a joke.
- The kids must be the ones who ACT — adults/pups support but never solve it FOR them
- Mommy and Daddy are ALWAYS safe, ALWAYS coming later
