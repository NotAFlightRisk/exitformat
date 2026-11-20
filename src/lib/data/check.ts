import { Ajv2020, type ErrorObject } from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { basename } from 'node:path';
import { isStale, type Source } from '#lib/data/load.ts';
import { extension, https, schemas, slug } from '#lib/data/schema.ts';
import { sharedData, type Category, type Format, type Scope } from '#lib/data/types.ts';

export interface Problem {
  file: string;
  line: number;
  path: string;
  message: string;
  warning?: boolean;
}

type Step = string | number;
type Flag = (path: Step[], message: string, warning?: boolean) => void;

interface RawOption {
  id: string;
  formats?: string[];
  from?: string[];
  data?: Partial<Scope>;
  docs?: string;
  sources?: string[];
}

type RawService = Record<'export' | 'import', RawOption[]> & {
  verification: { checked_at: string };
};

interface Known {
  categories: Map<string, Source>;
  formats: Set<string>;
  services: Map<string, Source[]>;
  passed: Set<Source>;
  today: Date;
}

const reserved = [
  'categories',
  'migrate',
  'formats',
  'search',
  'about',
  'changelog',
  'contribute',
  'api',
  'schema',
  'og',
  'icons',
  'feed.xml',
  'sitemap.xml',
  'llms.txt',
  'robots.txt',
  '_app'
];

const ajv = new Ajv2020({ allErrors: true, verbose: true });
addFormats(ajv, ['date', 'uri']);
const validators = {
  category: ajv.compile(schemas.category),
  format: ajv.compile(schemas.format),
  service: ajv.compile(schemas.service)
};

const hints: Record<string, string> = {
  [slug]: 'should be lowercase-with-dashes, like google-drive',
  [https]: 'should be a full https:// link',
  [extension]: 'should be an extension with its dot, like .md'
};
const shapes: Record<string, string> = {
  array: 'a list',
  object: 'a map',
  string: 'some text',
  boolean: 'true or false'
};

function explain({ keyword, instancePath, params, parentSchema, data, message }: ErrorObject) {
  const at: Step[] = instancePath
    .split('/')
    .slice(1)
    .map((step) => (/^\d+$/.test(step) ? Number(step) : step));
  const say = (text: string, where = at) => ({ at: where, message: text });
  switch (keyword) {
    case 'if':
      return undefined;
    case 'required':
      return say(`needs ${params.missingProperty}`);
    case 'additionalProperties': {
      const known = Object.keys(parentSchema?.properties ?? {});
      const key = params.additionalProperty;
      const text = known.length
        ? `"${key}" isn't a field here - use one of ${known.join(', ')}`
        : hints[slug];
      return say(text, [...at, key]);
    }
    case 'enum':
      return say(
        `${JSON.stringify(data)} isn't an option - use one of ${params.allowedValues.join(', ')}`
      );
    case 'type':
      // an unquoted ": " turns a line of text into a map
      return params.type === 'string' && data && typeof data === 'object'
        ? say('should be some text - wrap it in quotes if it has a colon in it')
        : say(`should be ${shapes[params.type] ?? params.type}`);
    case 'minItems':
      return say(params.limit === 1 ? "can't be an empty list" : `needs at least ${params.limit}`);
    case 'maxItems':
      return say(`can have ${params.limit} at most`);
    case 'minLength':
    case 'minProperties':
      return say("can't be empty");
    case 'maxLength':
      return say(`should be ${params.limit} characters or fewer`);
    case 'pattern':
      return say(hints[params.pattern] ?? message ?? 'is the wrong shape');
    case 'format':
      return say(
        params.format === 'date' ? 'should be a real date, like 2026-11-20' : hints[https]
      );
    case 'uniqueItems':
      return say('lists something twice');
    default:
      return say(message ?? 'is the wrong shape');
  }
}

const show = (path: Step[]) =>
  path
    .map((step) => (typeof step === 'number' ? `[${step}]` : `.${step}`))
    .join('')
    .slice(1);

const unknownFormat = (id: string) =>
  `"${id}" isn't a format we know - add data/formats/${id}.yml or use one we have`;

function checkCategory(source: Source, flag: Flag, { passed }: Known) {
  if (reserved.includes(source.id))
    flag([], `can't be called ${source.id}, that's one of our own pages - pick another name`);
  if (passed.has(source) && 'settings' in (source.raw as Category).data)
    flag(['data', 'settings'], 'settings is in every category already, so it can go');
}

function checkFormat(source: Source, flag: Flag, { formats, passed }: Known) {
  if (!passed.has(source)) return;
  const { based_on, conversions = [] } = source.raw as Format;
  if (based_on === source.id) flag(['based_on'], "can't be based on itself");
  else if (based_on && !formats.has(based_on)) flag(['based_on'], unknownFormat(based_on));
  conversions.forEach(({ to }, index) => {
    const at = ['conversions', index, 'to'];
    if (to === source.id) flag(at, 'converts to itself, so it can go');
    else if (!formats.has(to)) flag(at, unknownFormat(to));
  });
}

function checkOption(
  option: RawOption,
  at: (...path: Step[]) => Step[],
  flag: Flag,
  known: Known,
  vocabulary?: string[]
) {
  option.formats?.forEach((id, slot) => {
    if (!known.formats.has(id)) flag(at('formats', slot), unknownFormat(id));
  });
  option.from?.forEach((id, slot) => {
    if (!known.services.has(id))
      flag(at('from', slot), `"${id}" isn't in data/services yet - just name it instead`);
  });

  const { included = [], excluded = [], unknown = [] } = option.data ?? {};
  for (const [key, ids] of Object.entries({ included, excluded, unknown }))
    ids.forEach((id, slot) => {
      if (vocabulary && !vocabulary.includes(id))
        flag(
          at('data', key, slot),
          `"${id}" isn't in this category's data list - use one of ${vocabulary.join(', ')}`
        );
      if (key === 'excluded' && included.includes(id))
        flag(at('data', key, slot), `${id} is in included as well`);
    });

  if (!option.docs && !option.sources?.length)
    flag(at(), 'needs docs, or sources when there are no official docs');
  else if (!option.docs) flag(at(), 'has no official docs, link them if they ever turn up', true);
}

function checkService(source: Source, flag: Flag, known: Known) {
  const home = known.categories.get(source.category);
  if (source.category === '.')
    flag([], 'should be in a category folder, like services/notes/obsidian.yml');
  else if (!home)
    flag([], `is in services/${source.category}, but there's no categories/${source.category}.yml`);

  const twin = known.services.get(source.id)?.find((other) => other !== source);
  if (twin)
    flag(
      [],
      `${source.id} is also in services/${twin.category} - ids are unique across categories`
    );

  if (!known.passed.has(source)) return;
  const raw = source.raw as RawService;
  const vocabulary =
    home && known.passed.has(home)
      ? Object.keys({ ...(home.raw as Category).data, ...sharedData })
      : undefined;

  for (const list of ['export', 'import'] as const) {
    const seen = new Set<string>();
    raw[list].forEach((option, index) => {
      const at = (...path: Step[]) => [list, index, ...path];
      if (seen.has(option.id)) flag(at('id'), `${option.id} is already used by another ${list}`);
      seen.add(option.id);
      checkOption(option, at, flag, known, vocabulary);
    });
  }

  const checked = raw.verification.checked_at;
  const at = ['verification', 'checked_at'];
  if (checked > known.today.toISOString().slice(0, 10))
    flag(at, "is in the future - it's the day you last checked it all");
  else if (isStale(checked, known.today))
    flag(at, "is over a year old, so it's due a re-check", true);
}

const checks = { category: checkCategory, format: checkFormat, service: checkService };

/** Every schema and cross-reference problem in the data, with the line it's on */
export function check(sources: Source[], { today = new Date() } = {}): Problem[] {
  const problems: Problem[] = [];
  const flagger =
    (source: Source): Flag =>
    (path, message, warning = false) =>
      problems.push({
        file: source.file,
        line: source.lineOf(path),
        path: show(path),
        message,
        warning
      });

  const passed = new Set<Source>();
  const parsed = sources.filter((source) => !source.errors.length);
  for (const { file, errors } of sources)
    for (const { line, message } of errors)
      problems.push({
        file,
        line,
        path: '',
        message: `isn't valid YAML: ${message}`,
        warning: false
      });

  for (const source of parsed) {
    const flag = flagger(source);
    if (!/^[a-z0-9]+(-[a-z0-9]+)*\.yml$/.test(basename(source.file)))
      flag([], 'the file name should be lowercase-with-dashes and end .yml, like google-drive.yml');
    const validate = validators[source.kind];
    if (validate(source.raw)) passed.add(source);
    for (const error of validate.errors ?? []) {
      const said = explain(error);
      if (said) flag(said.at, said.message);
    }
  }

  const of = (kind: Source['kind']) => parsed.filter((source) => source.kind === kind);
  const known: Known = {
    categories: new Map(of('category').map((source) => [source.id, source])),
    formats: new Set(of('format').map((source) => source.id)),
    services: Map.groupBy(of('service'), (source) => source.id),
    passed,
    today
  };
  for (const source of parsed) checks[source.kind](source, flagger(source), known);

  const unique = new Map(problems.map((problem) => [JSON.stringify(problem), problem]));
  return [...unique.values()].sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
}
