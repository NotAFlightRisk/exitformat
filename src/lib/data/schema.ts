import { absolute } from '#lib/site.ts';
import { deployments, exportMethods, methods, platforms, statuses } from '#lib/data/types.ts';

export const slug = '^[a-z0-9]+(-[a-z0-9]+)*$';
export const https = '^https://';
export const extension = '^\\.[a-z0-9]+(\\.[a-z0-9]+)*$';

const list = (items: object, size = {}) => ({ type: 'array', items, uniqueItems: true, ...size });
const strict = (required: string[], properties: Record<string, object>) => ({
  type: 'object',
  additionalProperties: false,
  required,
  properties
});

const text = { type: 'string', minLength: 1 };
const id = { type: 'string', pattern: slug };
const url = { type: 'string', format: 'uri', pattern: https };
const steps = list({ ...text, maxLength: 140 }, { minItems: 2, maxItems: 4 });

const header = (kind: string, title: string) => ({
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: absolute(`/schema/${kind}.json`),
  title
});

const option = (allowed: object, required: string[], properties: Record<string, object>) =>
  strict(['id', 'name', 'method', 'steps', ...required], {
    id,
    name: text,
    method: { enum: Object.keys(allowed) },
    formats: list(id),
    requirements: list(text),
    steps,
    limitations: list(text),
    docs: url,
    sources: list(url),
    ...properties
  });

const exportOption = option(exportMethods, ['formats', 'data'], {
  formats: list(id, { minItems: 1 }),
  data: strict(['included'], {
    included: list(id, { minItems: 1 }),
    excluded: list(id),
    unknown: list(id)
  })
});

// an import that signs in to the other service has no file, so no formats either
const importOption = {
  ...option(methods, [], {
    from: list(id, { minItems: 1 }),
    data: {
      ...strict([], { included: list(id), excluded: list(id), unknown: list(id) }),
      minProperties: 1
    }
  }),
  if: { type: 'object', required: ['method'], properties: { method: { const: 'connect' } } },
  else: {
    type: 'object',
    required: ['formats'],
    properties: { formats: { type: 'array', minItems: 1 } }
  }
};

const category = {
  ...header('category', 'Exit Format category'),
  ...strict(['name', 'description', 'data'], {
    name: text,
    short: text,
    description: text,
    data: {
      type: 'object',
      minProperties: 1,
      patternProperties: { [slug]: text },
      additionalProperties: false
    }
  })
};

const format = {
  ...header('format', 'Exit Format file format'),
  ...strict(['name', 'standard', 'description'], {
    name: text,
    extensions: list({ type: 'string', pattern: extension }, { minItems: 1 }),
    standard: { type: 'boolean' },
    based_on: id,
    description: text,
    spec: url,
    conversions: {
      type: 'array',
      items: strict(['to', 'tool', 'url', 'steps'], {
        to: id,
        tool: text,
        url,
        steps,
        limitations: list(text)
      })
    }
  })
};

const service = {
  ...header('service', 'Exit Format service'),
  ...strict(
    [
      'name',
      'website',
      'description',
      'deployment',
      'platforms',
      'export',
      'import',
      'verification'
    ],
    {
      name: text,
      website: url,
      description: { ...text, maxLength: 160 },
      deployment: { enum: Object.keys(deployments) },
      platforms: list({ enum: Object.keys(platforms) }, { minItems: 1 }),
      source: url,
      icon: url,
      aliases: list(text),
      export: { type: 'array', items: exportOption },
      import: { type: 'array', items: importOption },
      delete: strict(['steps'], { steps, docs: url, notes: list(text) }),
      verification: strict(['status', 'checked_at'], {
        status: { enum: Object.keys(statuses) },
        checked_at: { type: 'string', format: 'date' }
      })
    }
  )
};

export const schemas = { category, format, service };
