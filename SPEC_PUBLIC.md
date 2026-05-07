# DNA Budgeting App — Public Specification

> A purpose-built, privacy-first household budgeting app for two adults.
> Optimized for **two-person collaboration** and **zero-friction expense logging**.

> **Note on privacy:** This is the public specification. It describes the architecture, data model, and feature set without containing personal data. The household using this app maintains a separate private companion document (gitignored) that holds their real budget defaults, recurring transactions, and financial context. Real seed values for that household live in a gitignored `src/data/defaults.ts`; this repo ships with a generic `src/data/defaults.example.ts`.

---

## 0. How to Use This Document

1. Read sections 1–3 first to understand the design philosophy.
2. Tech Stack (§4) is constraints, not suggestions.
3. Build in the order of §11. Each milestone independently shippable.
4. §5 (Data Model) is contract-grade.
5. §6 = WHAT, §7 = HOW.
6. **When in doubt, optimize for friction reduction in expense logging** (§3.1).
7. Don't add features not in this spec. Propose first.
8. **Never commit personal data.** See `SECURITY.md`.

**Conventions:** 🔴 critical / 🟡 strong preference / 🟢 nice-to-have.

---

## 1. Users (Abstract Model)

The app is designed for **exactly two adult users** sharing a household budget. Referred to in code as `User A` and `User D`. Real names live in `settings.userNames`, never in code or this spec.

**Assumptions:**
- Two adults, both with smartphones (iPhone v1; Android post-v1)
- Both contribute to a shared budget
- One user may earn 1099/self-employment income; the other may have W-2, none, or both
- One or both users may have business vehicles (see §6.12)

**Children, dependents, pets** are budget _categories_, not users.

---

## 2. Design Rationale (No Numbers)

The app is built on these opinions about household budgeting:

**Logging friction is the dominant failure mode.** Most couples abandon budget apps because logging takes too long. Every architectural decision is filtered through "does this make logging faster?"

**Manual categorization is a feature.** Auto-categorization via ML hides errors and removes the user from the budget. Manual entry, made fast via quick-parse and recently-used, keeps users engaged.

**Privacy is non-negotiable.** No bank linking. No third-party servers handling user data. Sync via shared file in users' own cloud.

**Two phones, one budget.** Sync must be eventually consistent without a backend. Model: shared file in iCloud Drive with last-write-wins merge.

**Self-employment is first-class.** If one user earns 1099 income, the app must correctly model: gross revenue, business expenses, tax reserve, vehicle deductions (mileage method), net household take-home.

**Budgeting is collaborative, not adversarial.** Both users see all transactions. Either can comment. No "hide" or "private" mode — that destroys spousal accountability.

**Temporary stances need restoration triggers.** Households make trade-offs ("we'll cut X for now"). The app captures these as Commitments so they don't quietly become permanent.

---

## 3. Product Philosophy

### 3.1 The Prime Directive: Logging Must Be Frictionless 🔴

**Target:** under **5 seconds** from app icon tap to transaction saved.

**Logging paths (priority order):**
1. Quick-parse — natural-language input
2. Recently used categories
3. Tap-to-add from category row
4. Recurring auto-fill
5. Voice input 🟢 (post-v1)
6. Receipt scan 🟢 (post-v1)

### 3.2 What We Are NOT Building

- ❌ Bank account linking / Plaid
- ❌ Investment tracking / net worth aggregation
- ❌ Subscription cancellation negotiation
- ❌ Hidden/private transaction toggle
- ❌ Auto-categorization via ML
- ❌ Tax filing / Schedule C generation (CSVs exported)
- ❌ Logins for non-adults
- ❌ Multi-currency support
- ❌ Backend service handling user data

### 3.3 Sync Philosophy

Two phones, one budget, no servers handling user data.

- **Primary:** iCloud Drive shared `sync.json`. Auto-sync on launch + after each save.
- **Fallback:** manual JSON export/import.
- **Manual "Sync now" button** in Settings.

**Why:** privacy (no third-party server), simplicity (no auth/server), reliability (works offline).

**Drawback:** eventually consistent. v1 last-write-wins by `updatedAt`.

### 3.4 Lessons Stolen From Other Apps

| Feature | Source | Why |
|---|---|---|
| Zero-based budgeting | EveryDollar | Forces conscious allocation |
| Month-end recap with affirmation | EveryDollar | Reinforcement after the month, not in-the-moment |
| "Ready to Assign" pool | YNAB | Forces conscious allocation |
| Category rollover toggle | YNAB | Critical for irregular categories |
| Recently used categories | Expensify | Massive logging speed-up |
| Per-transaction notes/comments | Honeydue / Goodbudget | Couples comment on each other's purchases |
| User attribution | Honeydue, Zeta | Accountability without judgment |
| Sinking funds with annual goals | EveryDollar | Right model for vacations, college, taxes |
| Margin Finder | EveryDollar | Actionable insight |
| Commitments tracking | (original) | Prevents temporary cuts becoming permanent |

### 3.5 Lessons Avoided

| Anti-feature | Source | Why we skip |
|---|---|---|
| Spreadsheet-style category list | YNAB | Overwhelming on mobile |
| "Approve transaction" queue | YNAB | Adds friction without accuracy |
| Hide/ignore transaction | Monarch, Simplifi | Removes spousal accountability |
| Auto-categorization ML | Monarch, Copilot | Hides errors, removes engagement |
| Bank-link required | Most apps | Privacy + setup friction |
| Forced learning curve | YNAB | Must be usable in <5 min |
| Live in-the-moment affirmation | EveryDollar | Felt gimmicky — moved to month-end recap |

---

## 4. Tech Stack 🔴

### 4.1 Required

- **Frontend:** React + TypeScript + Vite
- **Mobile-first:** SPA, installable as PWA
- **Styling:** Tailwind CSS
- **Storage:** IndexedDB via Dexie.js for transactions; localStorage for settings
- **Routing:** React Router (hash-based)
- **Date handling:** date-fns
- **Sync substrate:** iCloud Drive shared folder
- **No backend.**

### 4.2 PWA + Hosting

- **Hosting:** Public GitHub repo via GitHub Pages
- Installable on iOS Safari via "Add to Home Screen"
- Works offline after first load
- Theme color: dark green (`#1a4d3e`)
- Service worker, cache-first
- Manifest: standalone, portrait
- HTTPS via GitHub Pages

### 4.3 Disallowed

- ❌ Backend handling user data
- ❌ Analytics / telemetry
- ❌ Third-party auth
- ❌ Heavy UI libraries (Material UI, Chakra)
- ❌ Server-rendered framework
- ❌ Committing personal data

### 4.4 Allowed Optional Libraries

`react-hook-form`, `zod`, `recharts` or `visx` (one only), `@use-gesture/react`, `framer-motion`, `ulid` or `nanoid`.

### 4.5 Project Structure

```
dna-budget/
├── public/
├── src/
│   ├── components/
│   ├── views/                       # Dashboard, Activity, Insights, Settings
│   ├── sheets/                      # AddTx, EditBudget, MonthEndRecap, OdometerReading, ...
│   ├── data/
│   │   ├── db.ts
│   │   ├── defaults.example.ts      # Generic seed — committed
│   │   ├── defaults.ts              # Real seed — GITIGNORED
│   │   ├── seed.ts
│   │   └── parse.ts
│   ├── hooks/
│   ├── lib/
│   │   ├── format.ts
│   │   ├── recurring.ts
│   │   ├── merge.ts
│   │   ├── sync.ts
│   │   ├── tax.ts
│   │   ├── recap.ts
│   │   ├── margin.ts
│   │   ├── mileage.ts
│   │   └── commitments.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── tests/
├── .gitignore
├── SECURITY.md
├── SPEC_PUBLIC.md
├── CLAUDE.md
├── README.md
├── vite.config.ts
├── tsconfig.json
└── package.json
```

### 4.6 Sync Infrastructure

- iCloud folder path configured per device (e.g., `iCloud Drive/DNA Budget/sync.json`)
- `sync.last.json` written before each sync write
- Short-lived `sync.lock`; stale (>30s) ignored
- Local-only `conflicts` table for review

---

## 5. Data Model 🔴

### 5.1 Schema Overview

Dexie tables: `transactions`, `categories`, `recurring`, `vehicles`, `odometerReadings`, `commitments`, `conflicts`.

localStorage: `settings`.

### 5.2 Transaction

```ts
type Transaction = {
  id: string;                    // ULID
  type: 'expense' | 'income' | 'tax_payment';
  amount: number;                // Always positive. Dollars.
  categoryId: string;
  date: string;                  // ISO 'YYYY-MM-DD'
  description: string | null;
  user: 'A' | 'D';               // Immutable
  incomeKind?: 'household' | 'business_gross';
  is1099?: boolean;
  mileageData?: {                // Set when categoryId is a mileage-tracking category
    vehicleId: string;
    startMiles: number;
    endMiles: number;
    miles: number;
    rateAtTime: number;
  };
  notes: TxNote[];
  recurringId: string | null;
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
};

type TxNote = {
  id: string;
  user: 'A' | 'D';
  text: string;
  createdAt: number;
  readBy: ('A' | 'D')[];
};
```

`type: 'tax_payment'` — debits tax bucket. Excluded from spending breakdowns.

**Indexes:** primary `id`; compound `[date+type]`, `[categoryId+date]`, `[user+date]`; sync `updatedAt`.

### 5.3 Category

```ts
type Category = {
  id: string;
  name: string;
  icon: string;                     // Single emoji
  group: CategoryGroup;
  subgroup?: string;
  budget: number;
  rollover: boolean;
  rolloverBalance: number;
  priority: number;
  archived: boolean;
  annualTarget?: number;
  isTaxBucket?: boolean;
  isBusinessExpense?: boolean;      // Reduces tax owed when expense logged
  isVehicleCashOnly?: boolean;      // Cash outflow for a business vehicle, but NOT separately
                                    // deductible under mileage method (fuel, insurance, maint)
  vehicleId?: string;
  createdAt: number;
  updatedAt: number;
};

type CategoryGroup =
  | 'fixed'
  | 'family'
  | 'lifestyle'
  | 'savings'
  | 'business'
  | 'income';
```

### 5.4 Recurring Transaction

```ts
type Recurring = {
  id: string;
  type: 'expense' | 'income';
  amount: number;
  categoryId: string;
  description: string;
  user: 'A' | 'D' | 'shared';
  cadence: 'monthly';
  dayOfMonth: number;
  active: boolean;
  incomeKind?: 'household' | 'business_gross';
  is1099?: boolean;
  lastGenerated: string | null;
  createdAt: number;
  updatedAt: number;
};
```

### 5.5 Settings (localStorage)

```ts
type Settings = {
  schemaVersion: 1;
  currentUser: 'A' | 'D';
  userNames: { A: string; D: string };
  expectedMonthlyIncome: number;        // Household basis
  expectedMonthlyBusinessGross: number; // For tax projection
  taxRate: number;                      // Default 30
  startingTaxBucket: number;
  fiscalYearStart: number;              // 1 = Jan
  hasOnboarded: boolean;
  rolloverEnabled: boolean;
  irsMileageRate: number;               // Default 0.70 (per IRS, 2026)
  mileagePromptDayOfMonth: number;      // Default 1
  syncFolder: string | null;
  syncEnabled: boolean;
  lastSync: { autoAt: number; manualAt: number; exportAt: number; importAt: number };
  monthEndRecapShownFor: string | null;     // 'YYYY-MM'
  commitmentReviewShownFor: string | null;  // 'YYYY' — January annual review
};
```

### 5.6 Default Categories (Generic Placeholder)

The committed `defaults.example.ts` ships with placeholder categories — structural only, all `budget: 0`. Real values live in gitignored `defaults.ts`.

```ts
const DEFAULT_CATEGORIES: Category[] = [
  // FIXED ESSENTIALS
  { id: 'mortgage',     name: 'Mortgage / Rent',     icon: '🏠', group: 'fixed',     budget: 0, rollover: false, priority: 1 },
  { id: 'utilities',    name: 'Utilities',           icon: '💡', group: 'fixed',     budget: 0, rollover: false, priority: 2 },
  { id: 'internet',     name: 'Internet',            icon: '📡', group: 'fixed',     budget: 0, rollover: false, priority: 3 },
  { id: 'phones',       name: 'Cell Phones',         icon: '📱', group: 'fixed',     budget: 0, rollover: false, priority: 4 },
  { id: 'streaming',    name: 'Streaming',           icon: '📺', group: 'fixed',     budget: 0, rollover: false, priority: 5 },
  { id: 'auto_pay',     name: 'Auto Payment',        icon: '🚗', group: 'fixed',     budget: 0, rollover: false, priority: 6 },
  { id: 'auto_ins',     name: 'Auto Insurance',      icon: '🛡️', group: 'fixed',     budget: 0, rollover: false, priority: 7 },
  { id: 'auto_maint',   name: 'Auto Maint & Reg',    icon: '🔧', group: 'fixed',     budget: 0, rollover: true,  priority: 8 },
  { id: 'auto_fuel',    name: 'Fuel',                icon: '⛽', group: 'fixed',     budget: 0, rollover: false, priority: 9 },
  { id: 'health',       name: 'Health Premiums',     icon: '🏥', group: 'fixed',     budget: 0, rollover: false, priority: 10 },
  { id: 'health_oop',   name: 'Health OOP',          icon: '💊', group: 'fixed',     budget: 0, rollover: true,  priority: 11 },
  { id: 'subscriptions',name: 'Subscriptions',       icon: '🔁', group: 'fixed',     budget: 0, rollover: false, priority: 12 },

  // FAMILY & FOOD
  { id: 'groceries',    name: 'Groceries',           icon: '🛒', group: 'family', budget: 0, rollover: false, priority: 1 },
  { id: 'dining',       name: 'Dining Out',          icon: '🍽️', group: 'family', budget: 0, rollover: false, priority: 2 },
  { id: 'pets',         name: 'Pets',                icon: '🐾', group: 'family', budget: 0, rollover: true,  priority: 6 },

  // QUALITY OF LIFE
  { id: 'date_night',   name: 'Date Nights',         icon: '💕', group: 'lifestyle', budget: 0, rollover: false, priority: 1 },
  { id: 'hobbies',      name: 'Hobbies',             icon: '🎨', group: 'lifestyle', budget: 0, rollover: false, priority: 2 },
  { id: 'personal',     name: 'Personal Care & Clothing', icon: '💇', group: 'lifestyle', budget: 0, rollover: true, priority: 3 },
  { id: 'household',    name: 'Household',           icon: '📦', group: 'lifestyle', budget: 0, rollover: false, priority: 4 },
  { id: 'gifts',        name: 'Gifts',               icon: '🎁', group: 'lifestyle', budget: 0, rollover: true,  priority: 5 },
  { id: 'misc',         name: 'Miscellaneous',       icon: '✨', group: 'lifestyle', budget: 0, rollover: false, priority: 6 },

  // SAVINGS & SINKING FUNDS
  { id: 'retirement',   name: 'Retirement',          icon: '🏦', group: 'savings', budget: 0, rollover: false, priority: 2 },
  { id: 'roth',         name: 'Roth IRAs',           icon: '📈', group: 'savings', budget: 0, rollover: false, priority: 3 },
  { id: 'vacation',     name: 'Vacation Fund',       icon: '✈️', group: 'savings', budget: 0, rollover: true,  priority: 6 },
  { id: 'emergency',    name: 'Emergency Top-up',    icon: '🚨', group: 'savings', budget: 0, rollover: true,  priority: 9 },

  // TAX BUCKET (special)
  { id: 'taxes',        name: 'Quarterly Taxes',     icon: '🏛️', group: 'savings', budget: 0, rollover: true, isTaxBucket: true, priority: 99 },

  // BUSINESS EXPENSES (deductible)
  { id: 'biz_mileage',  name: 'Business Mileage',    icon: '🛣️', group: 'business', budget: 0, rollover: false, isBusinessExpense: true, priority: 1 },
  { id: 'biz_software', name: 'Business Software',   icon: '💻', group: 'business', budget: 0, rollover: true, isBusinessExpense: true, priority: 2 },
  { id: 'biz_meals',    name: 'Business Meals',      icon: '🥪', group: 'business', budget: 0, rollover: true, isBusinessExpense: true, priority: 3 },
  { id: 'biz_equip',    name: 'Business Equipment',  icon: '🧰', group: 'business', budget: 0, rollover: true, isBusinessExpense: true, priority: 4 },
  { id: 'biz_office',   name: 'Home Office',         icon: '🏢', group: 'business', budget: 0, rollover: true, isBusinessExpense: true, priority: 5 },
  { id: 'biz_other',    name: 'Business Other',      icon: '📁', group: 'business', budget: 0, rollover: true, isBusinessExpense: true, priority: 6 },

  // VEHICLE CASH OUTFLOWS (NOT separately deductible under mileage method — see §6.12)
  // Only used if a household has a business vehicle on mileage method
  { id: 'biz_veh_fuel',  name: 'Vehicle Fuel',       icon: '⛽', group: 'business', budget: 0, rollover: false, isVehicleCashOnly: true, priority: 10 },
  { id: 'biz_veh_ins',   name: 'Vehicle Insurance',  icon: '🛡️', group: 'business', budget: 0, rollover: false, isVehicleCashOnly: true, priority: 11 },
  { id: 'biz_veh_maint', name: 'Vehicle Maint',      icon: '🔧', group: 'business', budget: 0, rollover: true,  isVehicleCashOnly: true, priority: 12 },

  // INCOME
  { id: 'inc_1099',     name: '1099 Income',         icon: '💼', group: 'income', budget: 0, rollover: false, priority: 1 },
  { id: 'inc_w2',       name: 'W-2 Income',          icon: '🏢', group: 'income', budget: 0, rollover: false, priority: 2 },
  { id: 'inc_other',    name: 'Other Income',        icon: '💵', group: 'income', budget: 0, rollover: false, priority: 3 },
];
```

> Households fork to gitignored `defaults.ts` and fill in real budget amounts and any household-specific categories.

### 5.7 Default Recurring Transactions

Empty array in `defaults.example.ts`. Households populate in `defaults.ts`.

### 5.8 Vehicle

```ts
type Vehicle = {
  id: string;                       // e.g., 'civic', 'odyssey'
  name: string;
  businessUsePercent: number;       // 0–100; 100 for fully-business vehicles
  active: boolean;
  promptForOdometer: boolean;       // Whether monthly odometer prompt fires
  createdAt: number;
  updatedAt: number;
};
```

Empty array in `defaults.example.ts`. Households configure their own vehicles during onboarding.

### 5.9 OdometerReading

```ts
type OdometerReading = {
  id: string;
  vehicleId: string;
  date: string;                     // ISO 'YYYY-MM-DD'
  miles: number;                    // Cumulative odometer reading
  user: 'A' | 'D';
  notes?: string;
  generatedTxId: string | null;     // ID of the mileage transaction created
  createdAt: number;
  updatedAt: number;
};
```

### 5.10 Commitment

```ts
type Commitment = {
  id: string;
  title: string;                    // "Restore X to Y"
  description: string;
  currentStance: string;            // "Currently: $X/mo"
  triggers: string[];               // ["When income reaches $X", "By age N"]
  reviewCadence: 'monthly' | 'quarterly' | 'annual';
  reviewMonth?: number;             // 1-12; for annual
  active: boolean;
  resolvedAt: number | null;
  resolution?: string;
  createdAt: number;
  updatedAt: number;
};
```

Empty array in `defaults.example.ts`. Households populate as needed.

---

## 6. Features

### 6.1 Onboarding (First Run) 🔴

5-step flow, first launch only (or after Settings → Reset):

1. **Welcome** — App name + one-line description.
2. **User identity** — "Which phone is this?" Stores `currentUser`.
3. **iCloud sync setup** — File picker. [Skip] allowed.
4. **Vehicle setup** — Optional. Add any vehicles, set business-use percent. [Skip] if none.
5. **Optional import** — [Skip] [Import Backup]

After: seed defaults from §5.6, §5.7, §5.10.

### 6.2 Dashboard View 🔴

Top to bottom:

1. **🟡 Recurring Auto-Fill Banner** — Shows pending recurring transactions AND pending odometer readings.
2. **🔴 Hero Card (Household Status)** — No live affirmation (moved to §6.13).
3. **Summary Strip** — Income | Spent | Saved (this month). Excludes business gross.
4. **Spending Categories** — Grouped: Fixed → Family → Lifestyle. Tap → AddTx pre-filled. Subgroup support.
5. **Savings & Sinking Funds** — Gold progress bars.
6. **Business Quick Card** — collapsed by default. Includes vehicle/mileage summary.

### 6.3 Add Transaction Flow 🔴

Entry: FAB, tap budget row, quick-action notification (post-v1).

Sheet: type toggle → quick-parse → big amount → recently used → category grid → date → description → (income only) household/business radio → save.

Toasts: standard / over-budget amber / business-expense (with tax reduction) / vehicle-cash-only (with note that it's not deductible) / business-gross (with reserve message).

### 6.4 Quick-Parse Engine 🔴

Pure function with merchant alias map. See full rules in private companion spec; common categories include: dining (chick-fil-a, starbucks, etc.), groceries (costco, trader joes, etc.), fuel (shell, chevron — defaults to vehicle fuel category if available), streaming (netflix, hulu, etc.), pets (vet, petsmart, chewy).

Confidence scoring: 1.0 (clear merchant), 0.7 (partial keyword), 0.3 (amount only), 0.0 (nothing).

### 6.5 Activity View 🔴

Reverse-chronological for current month. Each row: avatar + description + date·category·tags + amount + 💬 indicator. Filters: All / User A / User D / This week / Recurring only / Business only.

Edit sheet includes Notes thread. Opening clears unread badge for current user.

### 6.6 Tax Bucket System 🔴

```
ytd_business_gross    = sum income WHERE incomeKind='business_gross'
ytd_business_expenses = sum expenses WHERE category.isBusinessExpense=true
ytd_net_se_income     = max(0, ytd_business_gross − ytd_business_expenses)
ytd_tax_owed          = ytd_net_se_income × (settings.taxRate / 100)

ytd_tax_set_aside = settings.startingTaxBucket
                    + sum expenses WHERE category.isTaxBucket=true
                    − sum transactions WHERE type='tax_payment'

tax_status = ytd_tax_set_aside − ytd_tax_owed
```

**Important under mileage method:** `biz_mileage` is `isBusinessExpense: true`. Vehicle cash-only categories (`isVehicleCashOnly: true`) are tracked but do NOT reduce tax owed.

Default `taxRate` = 30%. The `taxes` category cannot be deleted.

### 6.7 Insights View 🔴

Cards in actionability order:

1. Household savings rate
2. Tax bucket status
3. Business summary
4. Vehicle / Mileage summary (if vehicles configured)
5. Spending by group
6. Annual goals progress
7. Three-month averages
8. 🔴 Margin Finder
9. 🔴 Commitments (active stances)
10. 🟢 12-month chart (post-MVP)

### 6.8 Settings View 🔴

Edit Budget · Manage Recurring · Expected Monthly Income · Tax Bucket · Business Settings · **Vehicles** · **Mileage Settings** · **Commitments** · Categories · User Names · Switch Identity (buried, double-confirm) · Sync · Export Data · Import Data · Reset App · About.

### 6.9 Recurring Transactions 🔴

Auto-generation on launch and month change. Day 31 in short months fires on the last day.

User confirms manually (preserves zero-based principle). Editing template doesn't affect already-logged transactions.

### 6.10 Sync (iCloud Drive Primary + Manual Fallback) 🔴

Auto-sync on launch and after each transaction save. Lock + last-known-good copy for safety. Manual "Sync now" button.

**Export (JSON):** schemaVersion, exportedAt, exportedBy, userNames, transactions, categories, recurring, vehicles, odometerReadings, commitments, settings (excluding currentUser, syncFolder).

**Export (CSV) modes:** Full / Business-only (Schedule C) / **Mileage log**.

**Merge:** by `id` for transactions, categories, recurring, vehicles, odometer readings, commitments. Settings field-by-field with most-recent preference. NEVER overwrite `currentUser` or `syncFolder`.

After merge: silent on auto, summary toast on manual.

### 6.11 Business Module 🔴

Lightweight self-employment tracking.

**Logging:**
- **Business gross income:** Add Income with "Business gross (1099)" radio. Does NOT count toward household income on Dashboard.
- **Business expense (deductible):** Category in `business` group with `isBusinessExpense: true`. Reduces tax owed.
- **Vehicle cash outflow:** Category with `isVehicleCashOnly: true`. Tracked for cash flow; does NOT reduce tax owed (see §6.12).
- **Mileage (deductible):** Logged via odometer flow (§6.12).
- **Household take-home:** Implicit. No transfer transaction in v1.

**Insights:** Business summary card + Vehicle/Mileage card.

**Schedule C export:** business-only CSV + mileage log CSV.

### 6.12 Mileage & Odometer Tracking 🔴

#### Concept

For households with a business vehicle, the IRS standard mileage method is typically the better deduction (covers fuel + depreciation + maintenance + insurance in one cents-per-mile rate, often producing a much larger deduction than tracking actual costs).

**Critical accounting note:** Under mileage method, the following are **NOT separately deductible** — the rate already includes them:
- Vehicle fuel
- Vehicle maintenance & repairs
- Vehicle insurance

In the app, these are tracked as `isVehicleCashOnly: true` cash outflows for cash-flow visibility, but only `biz_mileage` reduces tax owed.

If a household switches to actual-expense method later, set `isBusinessExpense: true` on those categories and disable `biz_mileage`. **Discuss with accountant before switching.**

#### Monthly Odometer Prompt

On `settings.mileagePromptDayOfMonth` (default 1), the Recurring Auto-Fill Banner includes a vehicle reading entry for each active vehicle with `promptForOdometer: true`:

```
🚗 Vehicle odometer reading needed
Last reading: <date, mileage>
[Confirm All]
```

After "Confirm All," an odometer mini-sheet asks for the new reading.

#### Calculation on Save

```
miles_driven    = newReading.miles - lastReading.miles
business_miles  = miles_driven × (vehicle.businessUsePercent / 100)
deduction_value = business_miles × settings.irsMileageRate
```

The app:
1. Inserts a new `OdometerReading`
2. Creates a `biz_mileage` expense:
   - `amount`: deduction_value
   - `date`: last day of the closing month
   - `description`: e.g., "April: 2,150 mi (47,250 → 49,400)"
   - `mileageData`: structured object with vehicleId, startMiles, endMiles, miles, rateAtTime
3. Links via `generatedTxId`
4. Toast: deduction value + estimated tax savings

#### Edge Cases

- **First reading:** Store baseline only; no transaction.
- **Skipped month:** Single transaction covering full span; warn user.
- **Reading less than previous:** Reject with confirmation prompt for vehicle replacement.
- **IRS rate change mid-year:** New readings use new rate; old readings retain `rateAtTime`.
- **User edits old reading:** Regenerate linked transaction.
- **Vehicle archived:** Prompts stop, history preserved.

#### Schedule C Export

CSV columns: Date | Vehicle | Start Miles | End Miles | Miles | Rate | Deduction. YTD totals at bottom.

#### Insights Card

YTD miles per vehicle, YTD deduction value, annualized projection, estimated tax savings at current rate.

### 6.13 Month-End Recap Popup 🔴

First app open of new calendar month. Calculation: §8.8.

UI: month name, rolled-into amounts, overspends, net carryforward. If perfectly zeroed (within $1), celebratory header *"It's a DNA Budget!"*

[See details] navigates to filtered Activity. [Got it] dismisses.

Re-accessible from Activity tab as "Last month's recap."

### 6.14 Notification Badges 🔴

Local-only. No push in v1.

Sources: unread notes, pending recurring, pending odometer readings.

Locations: Activity tab icon, transaction row, Dashboard banner.

Clears: opening transaction edit (notes), Confirm All / dismiss (recurring + odometer).

### 6.15 Rollover Logic 🟡

```
At month-end:
  leftover = budget - spent_this_month
  category.rolloverBalance += leftover

Effective budget = max(0, category.budget + category.rolloverBalance)
```

UI caption: *"+$45 from last month"* or *"−$30 from last month"*.

### 6.16 Commitments Module 🔴

Tracks temporary stances and restoration triggers. Surfaces in January nudge.

**Insights card:** Lists each active commitment with current stance, triggers, and review cadence.

**January nudge:** First app open in January (via `commitmentReviewShownFor`) appends a "Commitments review" section to month-end recap.

**Resolution:** Mark resolved → prompts for resolution text → moves to history.

**🟢 v9 enhancement:** Auto-detect when triggers met (e.g., 3-mo income average, age milestones) and surface higher-priority nudge.

---

## 7. UX Specifications

### 7.1 Visual Design Language

**Color palette:**
```css
--ink:       #0f1d1a;
--paper:     #f5f1e8;
--paper-2:   #ebe5d4;
--paper-3:   #fdfaf2;
--accent:    #1a4d3e;
--accent-2:  #c9892f;
--rust:      #a14e2a;
--muted:     #6b6960;
--user-a:    #1a4d3e;
--user-d:    #a14e2a;
--badge:     #c43c2a;
--mileage:   #2e5a8a;
```

**Typography:**
- Headings/numbers: Fraunces (variable serif)
- Body/UI: Inter Tight
- Mono/labels: JetBrains Mono

**Borders & shadows:** 1.5px solid `--ink` borders, hard `2px 2px 0` shadows (no blur), no rounded corners.

### 7.2 Mobile Constraints 🔴

- Min input font-size: 16px
- Tap targets: 44×44px min
- Bottom nav clears safe area
- FAB clears bottom nav and safe area
- Sheets bottom-up, swipe-down to dismiss
- Pull-to-refresh disabled
- No hover states

### 7.3 Animations

≤ 250ms (350ms for month-end recap). No bouncing, no spring.

### 7.4 Empty States

Activity, Insights, Recurring, Margin Finder, Vehicles, Commitments — all have thoughtful empty states with actionable next steps.

### 7.5 Accessibility

`aria-label` on all interactive elements, focus rings, color never the only signal, WCAG AA contrast.

---

## 8. Calculation Reference 🔴

### 8.1 "Left to Spend"

```
income_basis = totalHouseholdIncomeThisMonth || settings.expectedMonthlyIncome
total_outflow = sum expenses this month WHERE group != 'business' AND !isTaxBucket
left_to_spend = income_basis - total_outflow
```

### 8.2 "Ready to Assign"

If actual income > total household budget, show "Ready to Assign." Else show "Left to Spend."

### 8.3 Household Savings Rate

```
savings_rate = (sum expenses in 'savings' group, EXCLUDING tax bucket) / household_income
```

### 8.4 Tax Bucket Status

See §6.6 formula.

### 8.5 Annual Goal Progress

```
For each category with annualTarget:
  current_year_savings = sum expenses to category WHERE year(date) = currentYear
  progress_pct = current_year_savings / annualTarget
```

### 8.6 Rollover

See §6.15 formula.

### 8.7 Margin Finder

```
For each non-savings, non-business, non-income category:
  Count overspent months in last 3 completed months
  if count >= 2:
    avg_monthly_overage = total_overage / 3
    annual_impact = avg × 12

Sort by annual_impact DESC, take top 3.
```

### 8.8 Month-End Recap

```
For previous calendar month, for each category:
  leftover or overspend → bucket appropriately
  Rollover-enabled categories carry leftover; non-rollover overspends still count
total_rolled - total_over = net_carried
was_zeroed = (outflow == income) within $1
```

### 8.9 Mileage Deduction

```
miles_driven      = newReading.miles - lastReading.miles
business_miles    = miles_driven × (vehicle.businessUsePercent / 100)
deduction_value   = business_miles × settings.irsMileageRate
estimated_tax_savings = deduction_value × (settings.taxRate / 100)
```

YTD aggregations sum across all OdometerReading-generated transactions for the calendar year. Annualized projection extrapolates from YTD by elapsed-fraction-of-year.

---

## 9. Edge Cases & Error Handling

- Importing newer schemaVersion → error, link to update
- Importing corrupt JSON → catch, user-friendly message
- iCloud sync.json corrupt → fall back to sync.last.json
- iCloud unavailable → silent skip, indicator in Settings
- Same-tx edit on two devices → last `updatedAt` wins, log conflict
- Delete category with transactions → soft-archive
- Negative amounts → reject
- Future-dated transactions → allow, warn if >30 days
- Day 29/30/31 recurring → fire last day of short months
- Empty backup import → noop
- Storage quota → warn 80%, error 100%
- Browser storage cleared → return to onboarding
- Recap shown twice → guard via `monthEndRecapShownFor`

**Mileage/vehicle:**
- Reading less than previous → reject with replacement-confirm
- Skipped month → multi-month span, warn
- Vehicle archived → prompts stop, history preserved
- IRS rate change mid-year → new readings use new rate
- First reading → baseline only, no tx
- User edits old reading → regenerate linked tx

**Commitments:**
- Trigger met → higher-priority nudge in next recap
- Multiple commitments → all listed in January review
- Accidentally marked resolved → editable history

---

## 10. Testing Requirements

Vitest unit. Playwright E2E optional.

**Required:**
- 🔴 `parse.ts` — 30+ cases
- 🔴 `merge.ts` — sync merge incl. vehicles/odometer/commitments
- 🔴 `tax.ts` — tax bucket: business expense reductions, mileage deductions, tax_payment debits
- 🔴 `recurring.ts` — auto-gen, day-of-month edge cases
- 🔴 `recap.ts` — month-end recap
- 🔴 `margin.ts` — Margin Finder
- 🔴 `mileage.ts` — odometer math, multi-month, rate changes, business use percent
- 🔴 `commitments.ts` — trigger checks, January nudge
- 🟡 Component tests for AddTxSheet, MonthEndRecapSheet, OdometerReadingSheet

**Manual checklist:** see private companion spec for full list. Key flows:
1. Two-device onboarding + iCloud auto-sync
2. Quick-parse cases
3. Recurring auto-fill (incl. day 31 → Feb)
4. Cross-month boundary (rollover + recap)
5. Mileage flow: first reading → next month → verify tx + Insights
6. Mileage skip-month behavior
7. Tax bucket: 1099 income + business expense → verify reduction
8. Tax payment: record IRS payment → verify bucket debit
9. Vehicle cash-only: log fuel/insurance → verify NO tax reduction
10. Notes + unread badges across devices
11. Delete propagation via iCloud
12. Offline → online sync recovery
13. January Commitments review

---

## 11. Build Order 🔴

### Milestone 0 — Hosting + Repo Setup (½ day)
Public repo, Vite + React + TS + Tailwind, GitHub Pages, `.gitignore`, `SECURITY.md`, `SPEC_PUBLIC.md`, `CLAUDE.md`, `defaults.example.ts` committed; `defaults.ts` gitignored.

### Milestone 1 — Skeleton (1–2 days)
Routing, nav, PWA manifest + service worker, visual style, onboarding (5 steps).

### Milestone 2 — Core CRUD (2–3 days)
Dexie, seed defaults, Add Transaction sheet, Activity view, edit/delete, Dashboard category rendering, Kids subgroup.

### Milestone 3 — Quick-Parse + Polish (1–2 days)
parse.ts, recently-used row, tap-from-row, toasts.

### Milestone 4 — Recurring + Notes + Badges (2 days)
Recurring CRUD, auto-fill banner, last-day-of-short-month, notes, unread badges.

### Milestone 5 — Insights + Tax Bucket + Business + Mileage (4 days)
Business categories + flags. Vehicle + OdometerReading data model. Odometer flow integrated into recurring auto-fill banner. Savings rate. Tax bucket math (net SE income). Record IRS payment. Annual goals. 3-month averages. Spending by group. Business summary. Vehicle/mileage summary. Margin Finder.

### Milestone 6 — Sync (3 days)
iCloud folder picker, sync.json read/write with lock + last-known-good, auto-sync, manual button, merge logic incl. vehicles/odometer/commitments, conflict log, JSON + CSV export (full + business-only + mileage modes), import.

### Milestone 7 — Rollover + Recap + Settings Polish (2 days)
Rollover, month-end recap popup, Edit Budget sheet, Manage Recurring, Vehicles sheet, Mileage Settings, all other Settings sub-views.

### Milestone 8 — Hardening + Edge Cases (1–2 days)
All §9 cases, empty states, error boundaries, storage quota warnings, reset flow, performance pass.

### Milestone 9 — Optional Polish (open-ended)
- 🔴 Commitments Module (build if M5–8 are smooth)
- 🟢 Voice input
- 🟢 Receipt scan
- 🟢 12-month chart
- 🟢 Custom merchant alias editor
- 🟢 Auto-prorate skipped-month odometer readings
- 🟢 Auto-detect commitment trigger conditions
- 🟢 Questionnaire-style onboarding (so households other than the primary one can fill in their own values without inheriting seeded defaults)

---

## 12. Glossary

- **Sinking fund** — Category accumulating over months toward future expense.
- **Zero-based budget** — Every dollar assigned. Income − Allocations = $0.
- **Ready to Assign** — Income received but not allocated.
- **Rollover** — Carrying unspent (or overspent) budget month-to-month.
- **Recurring** — Template auto-generating pending transactions.
- **Tax bucket** — Special savings for quarterly taxes. Calculated against net SE income.
- **Net SE income** — Self-employment income minus business expenses.
- **Business gross income** — Pre-expense, pre-tax 1099 revenue.
- **Household take-home** — Implied monthly draw to household.
- **Quick-parse** — Natural-language input.
- **User attribution** — `A` or `D` tag.
- **Sync folder / sync.json / sync.last.json** — iCloud Drive shared state.
- **Tax payment transaction** — Debits bucket.
- **Margin Finder** — Chronic-overspend insight card.
- **Month-end recap** — First-of-month popup.
- **Unread-notes badge** — Local red dot.
- **Mileage method** — IRS standard mileage deduction. Cents-per-mile rate covers fuel + depreciation + maintenance + insurance.
- **Actual expense method** — Alternative; deducts actual operating costs. Not used in v1.
- **Odometer reading** — Cumulative vehicle mileage at a point in time.
- **Vehicle cash outflow** — Cash spent on a business vehicle that is NOT separately deductible under mileage method. Tracked for cash flow only.
- **Commitment** — A temporary stance with a written restoration trigger.
- **Hard cap** — Maximum monthly outflow ceiling that must not be exceeded.

---

## 13. Success Criteria

After 30 days of use:

1. ✅ Both users log transactions independently
2. ✅ Average time-to-log under 8 seconds
3. ✅ At least 80% of recurring logged via auto-fill
4. ✅ iCloud auto-sync consistent within 5 minutes
5. ✅ Hero card checked at least 3x/week
6. ✅ At least one note conversation
7. ✅ Tax bucket reviewed before each quarterly payment
8. ✅ At least one quarterly tax payment recorded
9. ✅ At least one month-end recap read by both users
10. ✅ Household stayed at-or-under cap in at least 10 of 12 months (if cap configured)
11. ✅ Monthly odometer readings logged at least 80% of months (if vehicles configured)

If these aren't true, the app failed its prime directive (§3.1) and needs UX revision, not new features.

---

*End of public specification.*
