# Security & Privacy Model

This document explains how the DNA Budgeting App protects personal financial data.

## TL;DR

- The **app code** is open source and lives in a public GitHub repository.
- The **financial data** never touches this repository, GitHub's servers, or any third-party server we don't control.
- Sync between two phones happens via a shared file in the household's own iCloud Drive folder.
- No analytics, no telemetry, no bank linking, no auth.

## What lives in this repository

✅ React/TypeScript source code
✅ Tailwind styles and assets
✅ Generic placeholder seed data (`src/data/defaults.example.ts`)
✅ Public specification (`SPEC_PUBLIC.md`)
✅ This security document and the project README
✅ Build configuration (Vite, Tailwind, TypeScript)

## What does NOT live in this repository

❌ Real names, ages, or biographical details of the household
❌ Real income figures, budget amounts, savings targets, or financial goals
❌ Real housing situation, vehicle details, or geographic location beyond what's strictly required
❌ Real recurring transactions
❌ Any transaction history
❌ Any tax data, account names, or institution names
❌ The private companion specification document
❌ The household's actual seed values (`src/data/defaults.ts` — gitignored)

The `.gitignore` file enforces these exclusions. **Do not modify the "Personal data" section of `.gitignore` without explicit owner approval.**

## How data flows when the app runs

```
┌───────────────┐                      ┌───────────────┐
│  Phone A      │                      │  Phone D      │
│  (iPhone)     │                      │  (iPhone)     │
│               │                      │               │
│  IndexedDB    │                      │  IndexedDB    │
│  localStorage │                      │  localStorage │
└───────┬───────┘                      └───────┬───────┘
        │                                      │
        │   read/write sync.json               │
        │   (Apple's iCloud — household's      │
        │    own iCloud account, not ours)     │
        │                                      │
        └──────────► iCloud Drive ◄────────────┘
                     "DNA Budget" folder
                     (private to the household)
```

- **All transaction data lives in IndexedDB on each phone.** Browser-local storage. Never sent over the network by this app.
- **Settings and identity** live in localStorage on each phone. Never sent over the network.
- **Sync** happens through a single JSON file (`sync.json`) in the household's iCloud Drive folder. Apple's iCloud syncs that file between the household's own devices using their existing Apple IDs. We are not in the loop.
- **Github Pages serves only static assets** (HTML/CSS/JS bundle). No user data is sent to GitHub when the app runs. The service worker caches the bundle for offline use after first load.

## What GitHub can see

When a user installs the app, their browser fetches the static bundle from GitHub Pages. GitHub can see:

- The user's IP address at the time of installation
- The fact that someone fetched the assets

GitHub **cannot** see any transaction data, names, budget amounts, or any other financial information, because none of that ever leaves the user's phone or their iCloud.

## What Apple can see

If a user enables iCloud sync (optional but recommended), Apple's iCloud syncs the `sync.json` file across the household's devices. Apple can technically see the contents of that file as it transits their service. This is the same privacy posture as any document stored in iCloud Drive (Pages files, Notes, etc.).

If this is unacceptable, the user can disable iCloud sync and use manual JSON export/import instead, in which case data only moves between phones via files the user transfers themselves.

## What we (the developers) can see

**Nothing.** We have no servers, no analytics, no telemetry, no error reporting, no crash reporting. We do not receive any data from running instances of this app.

If you find a bug, the only way we can help is if you describe it in words.

## Contributing

If you submit a pull request:

- ✅ Do submit code, tests, documentation improvements
- ❌ Do NOT include real seed values, real budget numbers, or real personal data in any file
- ❌ Do NOT relax the `.gitignore` rules without owner approval
- ❌ Do NOT add analytics, telemetry, or "phone home" features

Reviewers should diff every PR against the personal-data exclusions before merging.

## If personal data is accidentally committed

If real personal data ever lands in the repository (including in commit messages, branch names, or PR descriptions):

1. **Do not assume** that deleting the file in a new commit removes the data — git history retains it.
2. The history must be rewritten (e.g., `git filter-repo`) to remove the data, force-pushed to overwrite the public history, and any forks must be coordinated to drop the bad history.
3. Treat any data that was public for any duration as compromised; rotate any related sensitive identifiers if applicable.
4. Update this document to note what happened and what mitigations were applied.

## Reporting privacy issues

If you discover a way that personal data could leak through this app's design or code, please open an issue marked `privacy` in this repository, or contact the repository owner directly.

---

*Last updated: at project initialization.*
