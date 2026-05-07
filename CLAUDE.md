# CLAUDE.md

This file gives Claude Code persistent context about the DNA Budgeting App project. Claude Code reads this on every session.

## Project at a glance

A privacy-first, two-person household budget app. PWA, no backend, IndexedDB storage, iCloud Drive shared file for sync (with manual JSON export/import as fallback).

**Two specification documents:**

- `SPEC_PUBLIC.md` — committed to this repo. The architectural contract: data model, features, build order, calculations. Contains no personal data.
- A private companion spec lives outside the repo (gitignored) for the household using this app. It contains real seed values, real recurring transactions, and household-specific context. **Never commit it.**

**Read `SPEC_PUBLIC.md` in full before starting work.** That document is the contract. This file is just guardrails for how to work _within_ that contract.

If the user's working session has the private companion spec available, read it second — it provides personal financial context that informs design decisions but never appears in code or commits.

## How to work in this repo

### Before writing code

1. Re-read the relevant section of `SPEC_PUBLIC.md`
2. Check the build order in §11 — don't get ahead of the current milestone
3. If something seems missing or ambiguous, ASK the user. Do not invent features.

### Critical privacy rule 🔴

Personal data must NEVER be committed. This includes:
- Real user names (use placeholders or `userNames` from settings)
- Real budget amounts in seed files (real values live in gitignored `src/data/defaults.ts`)
- Real recurring transactions
- Real income figures, tax info, account names, or financial situations
- Real children's names, ages, or related details

If you need real values for testing, use the gitignored `defaults.ts`. The committed `defaults.example.ts` ships with placeholder structure only.

See `SECURITY.md` for the full privacy model.

### Coding conventions

- **TypeScript strict mode** — no `any`, no `@ts-ignore` without a comment explaining why
- **Functional React** — hooks only, no class components
- **Named exports preferred** over default exports
- **One component per file** — file name matches component name
- **Props interfaces** — always declared, always named `<ComponentName>Props`
- **No barrel files** (`index.ts` re-exports) until the project gets large
- **Tailwind utility classes inline** — no `@apply`, no separate CSS files except `index.css` for globals
- **CSS variables** for the color palette only

### File naming

- Components: `PascalCase.tsx` (e.g. `BudgetRow.tsx`)
- Hooks: `useThing.ts`
- Pure logic: `camelCase.ts` (e.g. `parse.ts`, `merge.ts`)
- Tests: `<source>.test.ts` co-located with the file or in `tests/`

### State management

- **Local component state** for UI-only concerns
- **Dexie + custom hooks** for persisted data — no Redux, no Zustand, no Context for app data
- **localStorage** for settings only

### Performance

- Virtualize the Activity list if it ever exceeds ~200 items in view
- Memoize Dashboard category rows (they re-render often as transactions are logged)
- Avoid recalculating monthly totals on every render — `useMemo` keyed on month + tx count

### Don'ts

- ❌ Don't add features not in the spec
- ❌ Don't introduce a backend, even "just for sync"
- ❌ Don't add bank linking / Plaid
- ❌ Don't add ML-based auto-categorization (manual rules in `parse.ts` only)
- ❌ Don't use `localStorage` for transaction data (use Dexie/IndexedDB)
- ❌ Don't pixel-push the design without user approval — the design language is locked
- ❌ Don't auto-format with Prettier defaults if they conflict with existing style
- ❌ **Don't commit personal data** (see privacy rule above)

### Design language reminders

- **No rounded corners.** `border-radius: 0` everywhere.
- **Hard shadows only.** `2px 2px 0 var(--ink)` style, no blur.
- **Borders 1.5px solid `--ink`** on cards and interactive elements.
- **Three fonts only:** Fraunces (serif), Inter Tight (sans), JetBrains Mono (mono).
- **Color is never the only signal.** Always pair color with icon or text.

## Common commands

```bash
# Dev
npm run dev

# Type-check
npm run typecheck

# Test
npm run test
npm run test:watch

# Build
npm run build

# Preview production build (test PWA install locally)
npm run preview

# Deploy to GitHub Pages (after build)
npm run deploy
```

## Testing expectations

When implementing or modifying:

- **Pure functions** (`parse.ts`, `merge.ts`, `tax.ts`, `recurring.ts`, `recap.ts`, `margin.ts`) — write or update tests in the same commit
- **UI components** — verify manually on mobile viewport (375px wide minimum) before committing
- **Cross-device flows** (sync) — test on two browsers/devices before considering done

## When you're stuck

If you hit ambiguity in the spec or need a decision:

1. Don't guess. Ask the user.
2. When you ask, reference the spec section: *"§6.4 says X but doesn't cover Y — should it..."*
3. After resolution, update `SPEC_PUBLIC.md` (or the private companion spec, depending on whether the answer is generic or household-specific) so the answer is captured.
4. Decisions should also be appended to the Decisions Log in the private spec.

## Communication style

The user is a financial-planning thinker, not a software engineer. When discussing tradeoffs:

- Explain in plain English first, code/jargon second
- Show consequences ("if we do X, then later Y will be harder")
- Default to concrete examples over abstract terms

## Definition of "done" for any task

A task is done when:
- ✅ Code matches the spec (cite sections in commit message)
- ✅ Type-check passes (`npm run typecheck`)
- ✅ All relevant tests pass
- ✅ Manually tested on mobile viewport (375×812 minimum, iPhone SE size)
- ✅ Works offline (test by toggling network in DevTools)
- ✅ No console errors or warnings
- ✅ No personal data committed (review diff before push)
- ✅ User has reviewed the change (don't merge ahead of approval)
