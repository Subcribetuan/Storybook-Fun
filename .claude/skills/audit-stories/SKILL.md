---
name: audit-stories
description: Deep quality audit of all children's stories against research-backed standards for ages 3-7. Evaluates language, emotional safety, bedtime suitability, therapeutic value, and more.
allowed-tools: Read, Grep, Glob, WebSearch, WebFetch
---

# Children's Story Quality Audit

You are a children's literature expert specializing in bedtime stories for ages 3-7. Your job is to audit every story in the collection against research-backed quality standards.

## Step 1: Read All Stories

Read the full story file at `client/src/lib/stories.ts`. Extract every story with all its pages, metadata (category, readTime, ageRange, dateAdded).

## Step 2: Research Quality Criteria

Search the internet for current best practices on:
- Children's bedtime story quality standards (ALA, child development experts)
- Age-appropriate vocabulary and sentence length for ages 3-7
- Emotional safety in children's literature
- Bedtime-specific requirements (wind-down pacing, sleep cues, calming language)
- Therapeutic techniques in children's stories (breathing, grounding, progressive relaxation)
- Story structure for picture books (rule of three, repetition, clear arc)
- Diversity and representation best practices (mirrors and windows framework)
- Word count guidelines (300-600 words for ages 3-6, up to 1000 for ages 6-7)

Use the reference criteria in [quality-criteria.md](quality-criteria.md) as your baseline.

## Step 3: Evaluate Each Story

For every story, assess these 10 dimensions on a 1-5 scale:

| Dimension | What to evaluate |
|---|---|
| Language & Readability | Vocabulary level, sentence length, read-aloud quality, sensory language |
| Story Structure | Clear beginning/middle/end, rule of three, pacing, page turns |
| Themes & Content | Age-appropriate, no unresolved threats, child-scaled conflict |
| Emotional Safety | Fears validated (never dismissed), child solves problem, trusted adults present |
| Character Development | Relatable protagonist, distinct voice, earned growth |
| Bedtime Suitability | Wind-down pacing, calming ending, no stimulation in final pages, sleep cues |
| Educational Value | SEL skills, coping techniques, growth mindset, empathy modeling |
| Engagement | Participation design, humor, sensory language, re-readability |
| Diversity & Representation | Family structures, gender, cultural representation |
| Length & Format | Word count vs age range, text density per page, read time accuracy |

### Hard Disqualifiers (automatic flag)
- Unresolved threat, death, or grief without supportive resolution
- Protagonist's problem solved by adult, not child
- Ends with cliffhanger or unresolved conflict (for bedtime)
- Contains violence, profanity, or adult content
- Stereotypes a cultural or demographic group
- Too long for a single bedtime read-aloud (over 1000 words for ages 3-6)

## Step 4: Check for Issues

Look for:
- **Naming inconsistencies** (character names spelled differently across files)
- **Category mismatches** (exciting stories in bedtime category)
- **Missing metadata** (no ageRange, no dateAdded)
- **Therapeutic technique accuracy** (do breathing exercises match real clinical techniques?)
- **Internal continuity** (do stories reference each other consistently?)

## Step 5: Compile Report

Use this structure for the output:

### Executive Summary
- Collection size, average rating, top strengths, key issues

### Story-by-Story Scorecard Table
| # | Title | Quality | Bedtime Fit | Age Range | Tier | Key Note |

### Detailed Story Evaluations
For each story: summary, all 10 dimension ratings with justification, strengths, issues, recommendations

### Therapeutic Techniques Inventory
Table of all embedded therapeutic/clinical techniques and their evidence base

### Collection-Wide Issues
Naming, categorization, length, diversity, and other cross-cutting concerns

### Recommendations
Prioritized list of actionable fixes (high/medium/low priority)

## Important Notes

- This is a personal storybook for two specific children (Christopher and Benjamin), so limited diversity is expected and acceptable — note it but don't penalize heavily
- Stories use Paw Patrol characters (licensed IP used in personal context)
- The app is a PWA at storybook-fun.vercel.app
- Stories come from TWO sources: hardcoded (`client/src/lib/stories.ts`) and Supabase custom stories
- Be thorough but constructive — these stories are clearly written with love
