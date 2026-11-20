export const exportMethods = {
  file: 'File',
  folder: 'Folder',
  account: 'Data request',
  api: 'API',
  qr: 'QR code',
  copy: 'By hand'
} as const;

export const methods = { ...exportMethods, connect: 'Sign in' } as const;

export const deployments = {
  local: 'On your device',
  cloud: 'Cloud',
  hybrid: 'Device and cloud',
  'self-hosted': 'Self-hosted'
} as const;

export const platforms = {
  android: 'Android',
  ios: 'iOS',
  windows: 'Windows',
  macos: 'macOS',
  linux: 'Linux',
  web: 'Web',
  'browser-extension': 'Browser extension'
} as const;

export const statuses = { documented: 'Documented', tested: 'Tested' } as const;

export const pathKinds = {
  direct: 'Built-in importer',
  file: 'Same file format',
  convert: 'Convert it first'
} as const;

// on top of every category's own data list
export const sharedData = { settings: 'App settings' } as const;

export const staleAfterDays = 365;

export const changeKinds = { added: 'Added', updated: 'Updated', removed: 'Removed' } as const;

// the bits of a service file an update can touch, everything else counts as details
export const changeSections = {
  details: 'Details',
  export: 'Exports',
  import: 'Imports',
  delete: 'Deleting your data',
  verification: 'Verification'
} as const;

export type Method = keyof typeof methods;
export type Deployment = keyof typeof deployments;
export type Platform = keyof typeof platforms;
export type Status = keyof typeof statuses;
export type PathKind = keyof typeof pathKinds;
export type ChangeKind = keyof typeof changeKinds;
export type ChangeSection = keyof typeof changeSections;

export interface Category {
  id: string;
  name: string;
  short?: string;
  description: string;
  data: Record<string, string>;
}

export interface Conversion {
  to: string;
  tool: string;
  url: string;
  steps: string[];
  limitations: string[];
}

export interface Format {
  id: string;
  name: string;
  extensions: string[];
  standard: boolean;
  based_on?: string;
  description: string;
  spec?: string;
  conversions: Conversion[];
}

export interface Scope {
  included: string[];
  excluded: string[];
  unknown: string[];
}

interface Choice {
  id: string;
  name: string;
  method: Method;
  formats: string[];
  requirements: string[];
  steps: string[];
  limitations: string[];
  docs?: string;
  sources: string[];
}

export interface ExportOption extends Choice {
  data: Scope;
}

export interface ImportOption extends Choice {
  from: string[];
  data?: Partial<Scope>;
}

export interface Service {
  id: string;
  category: string;
  name: string;
  website: string;
  description: string;
  deployment: Deployment;
  platforms: Platform[];
  source?: string;
  icon?: string;
  aliases: string[];
  export: ExportOption[];
  import: ImportOption[];
  delete?: { steps: string[]; docs?: string; notes: string[] };
  verification: { status: Status; checked_at: string; stale: boolean };
}

export interface Directory {
  categories: Category[];
  formats: Format[];
  services: Service[];
}

export interface Carry {
  carried: string[];
  lost: string[];
  unknown: string[];
}

export interface Path extends Carry {
  kind: PathKind;
  export?: ExportOption;
  conversion?: Conversion & { from: string };
  import: ImportOption;
  formats: string[];
}

export interface Migration {
  source: Service;
  destination: Service;
  paths: Path[];
}

/** One service's change in one commit, as .github/changelog.json keeps it */
export interface LogEntry {
  date: string;
  commit: string;
  pr?: number;
  id: string;
  category: string;
  name: string;
  kind: ChangeKind;
  sections?: ChangeSection[];
}

export interface Changelog {
  commit: string;
  entries: LogEntry[];
}

// what the pages get, with every id swapped for a name and a link

export interface Term {
  id: string;
  label: string;
}

export interface Link {
  id: string;
  name: string;
  href: string;
}

export interface CategoryLink extends Link {
  short?: string;
}

export interface FormatLink extends Link {
  standard: boolean;
}

export interface ServiceLink extends Link {
  icon: string | null;
  category: CategoryLink;
}

export interface Freshness {
  status: Term;
  checked: string;
  stale: boolean;
}

export interface ServiceCard extends ServiceLink {
  description: string;
  deployment: Term;
  platforms: Term[];
  exports: FormatLink[];
  imports: FormatLink[];
  verification: Freshness;
}

export interface ScopeView {
  included?: Term[];
  excluded: Term[];
  unknown: Term[];
}

export interface OptionView {
  id: string;
  name: string;
  method: Term;
  formats: FormatLink[];
  from: ServiceLink[];
  requirements: string[];
  steps: string[];
  data?: ScopeView;
  limitations: string[];
  docs?: string;
  sources: string[];
}

export interface ServiceView extends ServiceCard {
  website: string;
  source?: string;
  aliases: string[];
  export: OptionView[];
  import: OptionView[];
  delete?: Service['delete'];
  edit: string;
  history: string;
}

export interface ConversionView {
  from: FormatLink;
  to: FormatLink;
  tool: string;
  url: string;
  steps: string[];
  limitations: string[];
}

export interface PathView {
  kind: Term;
  export?: OptionView;
  conversion?: ConversionView;
  import: OptionView;
  formats: FormatLink[];
  carried: Term[];
  lost: Term[];
  unknown: Term[];
}

export interface MigrationCard {
  href: string;
  source: ServiceLink;
  destination: ServiceLink;
  kind: Term;
  carried: number;
  lost: number;
  unknown: number;
}

export interface CategoryCard extends CategoryLink {
  description: string;
  services: number;
  migrations: number;
}

export interface FormatCard extends FormatLink {
  extensions: string[];
  description: string;
  exporters: number;
  importers: number;
}

export interface ChangeView {
  date: string;
  kind: Term;
  sections: Term[];
  name: string;
  service: ServiceLink | null;
  source: { href: string; label: string };
}

export interface Meta {
  title: string;
  description: string;
}

export interface Crumb {
  name: string;
  href: string;
}
