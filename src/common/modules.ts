export const DEFAULT_OMNIPOS_MODULES = {
  /** Fast Food POS Counter View */
  fastfood: true,
  /** Omnimart Retail Supermarket POS */
  omnimart: true,
  /** Kitchen Display System (KDS) */
  kitchen: true,
  /** Products, Menu Items & Categories Catalog */
  catalog: true,
  /** Inventory, Stock Movements & Thresholds */
  inventory: true,
  /** Customer Khata & Udhaar Ledger Book */
  khata: true,
  /** Cash Out, Expenses & Petty Cash Tracking */
  expenses: true,
  /** Sales Analytics, Profit & Loss Reports */
  reports: true,
  /** Web Store & Online Customer Portal */
  webStore: false,
  /** Administrative Controls & Store Settings */
  admin: true,
} as const;

export type OmniposModuleFlags = Record<keyof typeof DEFAULT_OMNIPOS_MODULES, boolean>;

export function normalizeModules(modules?: Partial<OmniposModuleFlags> | null): OmniposModuleFlags {
  const src = modules && typeof modules === 'object' ? modules : {};
  const out = { ...DEFAULT_OMNIPOS_MODULES } as OmniposModuleFlags;

  for (const key of Object.keys(DEFAULT_OMNIPOS_MODULES) as (keyof typeof DEFAULT_OMNIPOS_MODULES)[]) {
    if (typeof src[key] === 'boolean') {
      out[key] = src[key] as boolean;
    }
  }

  return out;
}
