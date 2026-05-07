// src/data/defaults.example.ts
//
// Generic placeholder seed data — committed to the repo as a template.
// Every budget is 0; recurring transactions, vehicles, and commitments
// are empty arrays by design.
//
// The household running this app maintains a parallel `defaults.ts`
// (gitignored) with real values. See SECURITY.md and SPEC_PUBLIC.md
// §5.6 / §5.7 / §5.8 / §5.10 for the full data-model contract; types
// will be defined in Milestone 2 alongside the Dexie schema.

export const DEFAULT_CATEGORIES = [
  // FIXED ESSENTIALS
  { id: 'mortgage',     name: 'Mortgage / Rent',           icon: '🏠', group: 'fixed',     budget: 0, rollover: false, priority: 1 },
  { id: 'utilities',    name: 'Utilities',                 icon: '💡', group: 'fixed',     budget: 0, rollover: false, priority: 2 },
  { id: 'internet',     name: 'Internet',                  icon: '📡', group: 'fixed',     budget: 0, rollover: false, priority: 3 },
  { id: 'phones',       name: 'Cell Phones',               icon: '📱', group: 'fixed',     budget: 0, rollover: false, priority: 4 },
  { id: 'streaming',    name: 'Streaming',                 icon: '📺', group: 'fixed',     budget: 0, rollover: false, priority: 5 },
  { id: 'auto_pay',     name: 'Auto Payment',              icon: '🚗', group: 'fixed',     budget: 0, rollover: false, priority: 6 },
  { id: 'auto_ins',     name: 'Auto Insurance',            icon: '🛡️', group: 'fixed',     budget: 0, rollover: false, priority: 7 },
  { id: 'auto_maint',   name: 'Auto Maint & Reg',          icon: '🔧', group: 'fixed',     budget: 0, rollover: true,  priority: 8 },
  { id: 'auto_fuel',    name: 'Fuel',                      icon: '⛽', group: 'fixed',     budget: 0, rollover: false, priority: 9 },
  { id: 'health',       name: 'Health Premiums',           icon: '🏥', group: 'fixed',     budget: 0, rollover: false, priority: 10 },
  { id: 'health_oop',   name: 'Health OOP',                icon: '💊', group: 'fixed',     budget: 0, rollover: true,  priority: 11 },
  { id: 'subscriptions',name: 'Subscriptions',             icon: '🔁', group: 'fixed',     budget: 0, rollover: false, priority: 12 },

  // FAMILY & FOOD
  { id: 'groceries',    name: 'Groceries',                 icon: '🛒', group: 'family',    budget: 0, rollover: false, priority: 1 },
  { id: 'dining',       name: 'Dining Out',                icon: '🍽️', group: 'family',    budget: 0, rollover: false, priority: 2 },
  { id: 'pets',         name: 'Pets',                      icon: '🐾', group: 'family',    budget: 0, rollover: true,  priority: 6 },

  // QUALITY OF LIFE
  { id: 'date_night',   name: 'Date Nights',               icon: '💕', group: 'lifestyle', budget: 0, rollover: false, priority: 1 },
  { id: 'hobbies',      name: 'Hobbies',                   icon: '🎨', group: 'lifestyle', budget: 0, rollover: false, priority: 2 },
  { id: 'personal',     name: 'Personal Care & Clothing',  icon: '💇', group: 'lifestyle', budget: 0, rollover: true,  priority: 3 },
  { id: 'household',    name: 'Household',                 icon: '📦', group: 'lifestyle', budget: 0, rollover: false, priority: 4 },
  { id: 'gifts',        name: 'Gifts',                     icon: '🎁', group: 'lifestyle', budget: 0, rollover: true,  priority: 5 },
  { id: 'misc',         name: 'Miscellaneous',             icon: '✨', group: 'lifestyle', budget: 0, rollover: false, priority: 6 },

  // SAVINGS & SINKING FUNDS
  { id: 'retirement',   name: 'Retirement',                icon: '🏦', group: 'savings',   budget: 0, rollover: false, priority: 2 },
  { id: 'roth',         name: 'Roth IRAs',                 icon: '📈', group: 'savings',   budget: 0, rollover: false, priority: 3 },
  { id: 'vacation',     name: 'Vacation Fund',             icon: '✈️', group: 'savings',   budget: 0, rollover: true,  priority: 6 },
  { id: 'emergency',    name: 'Emergency Top-up',          icon: '🚨', group: 'savings',   budget: 0, rollover: true,  priority: 9 },

  // TAX BUCKET (special — tied to net SE income, see §6.6)
  { id: 'taxes',        name: 'Quarterly Taxes',           icon: '🏛️', group: 'savings',   budget: 0, rollover: true, isTaxBucket: true, priority: 99 },

  // BUSINESS EXPENSES (deductible — reduces tax owed)
  { id: 'biz_mileage',  name: 'Business Mileage',          icon: '🛣️', group: 'business',  budget: 0, rollover: false, isBusinessExpense: true, priority: 1 },
  { id: 'biz_software', name: 'Business Software',         icon: '💻', group: 'business',  budget: 0, rollover: true,  isBusinessExpense: true, priority: 2 },
  { id: 'biz_meals',    name: 'Business Meals',            icon: '🥪', group: 'business',  budget: 0, rollover: true,  isBusinessExpense: true, priority: 3 },
  { id: 'biz_equip',    name: 'Business Equipment',        icon: '🧰', group: 'business',  budget: 0, rollover: true,  isBusinessExpense: true, priority: 4 },
  { id: 'biz_office',   name: 'Home Office',               icon: '🏢', group: 'business',  budget: 0, rollover: true,  isBusinessExpense: true, priority: 5 },
  { id: 'biz_other',    name: 'Business Other',            icon: '📁', group: 'business',  budget: 0, rollover: true,  isBusinessExpense: true, priority: 6 },

  // VEHICLE CASH OUTFLOWS (NOT separately deductible under mileage method — see §6.12)
  // Only used if a household has a business vehicle on mileage method
  { id: 'biz_veh_fuel',  name: 'Vehicle Fuel',             icon: '⛽', group: 'business',  budget: 0, rollover: false, isVehicleCashOnly: true, priority: 10 },
  { id: 'biz_veh_ins',   name: 'Vehicle Insurance',        icon: '🛡️', group: 'business',  budget: 0, rollover: false, isVehicleCashOnly: true, priority: 11 },
  { id: 'biz_veh_maint', name: 'Vehicle Maint',            icon: '🔧', group: 'business',  budget: 0, rollover: true,  isVehicleCashOnly: true, priority: 12 },

  // INCOME
  { id: 'inc_1099',     name: '1099 Income',               icon: '💼', group: 'income',    budget: 0, rollover: false, priority: 1 },
  { id: 'inc_w2',       name: 'W-2 Income',                icon: '🏢', group: 'income',    budget: 0, rollover: false, priority: 2 },
  { id: 'inc_other',    name: 'Other Income',              icon: '💵', group: 'income',    budget: 0, rollover: false, priority: 3 },
];

// Households populate the following arrays in their gitignored defaults.ts.
// See DNA_BUDGET_SPEC.md §5.7 / §5.8 / §5.10 for shape.

export const DEFAULT_RECURRING = [];

export const DEFAULT_VEHICLES = [];

export const DEFAULT_COMMITMENTS = [];
