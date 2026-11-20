<script lang="ts">
  import PageHead from '#lib/components/PageHead.svelte';
  import Section from '#lib/components/Section.svelte';
  import Steps from '#lib/components/Steps.svelte';
  import { site } from '#lib/site.ts';

  let { data } = $props();

  const guide = `${site.repo}/blob/main/.github/CONTRIBUTING.md`;
  const form = (template: string) => `${site.repo}/issues/new?template=${template}`;

  const example = `name: Obsidian
website: https://obsidian.md/
# 160 characters at most
description: A notes app that keeps everything as Markdown files on your own device.
deployment: local # local, cloud, hybrid or self-hosted
platforms: [windows, macos, linux, android, ios]

export:
  - id: vault
    name: Copy your vault folder
    method: folder
    formats: [markdown, markdown-frontmatter]
    steps:
      - Right-click a note and choose Show in system explorer.
      - Go up to the top folder of your vault and copy the whole thing somewhere safe.
    data:
      included: [text, attachments, links, tags]
      excluded: [history]
      unknown: [dates]
    limitations:
      - Wikilinks are Obsidian's own syntax, so other apps may show them as plain text.
    docs: https://help.obsidian.md/data-storage

import: [] # same shape as export

verification:
  status: documented
  checked_at: 2026-11-20`;
</script>

<PageHead title={data.meta.title} lede={data.meta.description} />

<Section id="report" title="Report a mistake or a missing service">
  <div class="chart ways">
    <div>
      <h3>Something's wrong</h3>
      <p>
        Every service page ends with a Suggest an edit link, which opens the form with the page
        already filled in. Or <a href={form('fix-entry.yml')} rel="external">fix an entry</a> from here.
        A link to the service's own docs, or what happened when you tried it, is all the proof it needs.
      </p>
    </div>
    <div>
      <h3>Something's missing</h3>
      <p>
        <a href={form('add-service.yml')} rel="external">Suggest a service</a> with its website and anything
        you've found on how its export works. Fancy writing it up yourself? Read on.
      </p>
    </div>
  </div>
</Section>

{#snippet copy()}
  Copy a service from the same category as yours in <code>data/services</code>. Notion and Aegis are
  the fullest, so they're the best to start from.
{/snippet}

{#snippet name()}
  Name the file after the service, lowercase with dashes. It's the id and the address, so
  <code>notes/obsidian.yml</code> is <code>/notes/obsidian</code>.
{/snippet}

{#snippet fill()}
  Fill it in from the service's own docs, then run <code>npm run validate</code>, which points at
  any line that's wrong.
{/snippet}

{#snippet open()}
  Open a pull request titled like <code>feat(data): add Logseq</code>, or
  <code>fix(data): refresh Notion</code> for a re-check.
{/snippet}

<Section id="add" title="Add a service yourself">
  <div class="add"><Steps steps={[copy, name, fill, open]} /></div>
</Section>

<Section id="file" title="What goes in a service file">
  {#snippet aside()}<a href="/schema/service.json">The JSON Schema</a>{/snippet}
  <div class="split">
    <figure class="example">
      <figcaption>data/services/notes/obsidian.yml</figcaption>
      <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
      <pre tabindex="0"><code>{example}</code></pre>
    </figure>
    <div class="prose">
      <p>
        <code>export</code> and <code>import</code> are lists, one item for each way out or in.
        <code>data</code> says what comes with it, using the ids in the category's list, and
        <code>unknown</code> is a perfectly good answer. Nobody writes the moves between apps -
        they're worked out from both sides, so getting <code>formats</code> and <code>data</code>
        right is what gets them right.
      </p>
      <p>
        Point an editor that speaks JSON Schema at
        <a href="/schema/service.json">/schema/service.json</a> (VS Code with the YAML extension,
        say) and it'll suggest every field as you type. There's
        <a href="/schema/format.json">one for formats</a> and
        <a href="/schema/category.json">one for categories</a> too.
      </p>
      <p>
        The <a href={guide} rel="external">contributing guide</a> explains each field, plus formats, categories
        and working on the site itself.
      </p>
    </div>
  </div>
</Section>

<style>
  .ways {
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), 1fr));

    > div {
      display: grid;
      align-content: start;
      gap: var(--space-2);
      padding: var(--space-4) var(--space-5);
    }

    p {
      max-inline-size: var(--measure);
    }
  }

  h3 {
    font-size: var(--size-md);
  }

  .split {
    display: grid;
    grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
    gap: var(--space-5) var(--space-6);
    align-items: start;

    @media (width < 60rem) {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  .example {
    display: grid;
    border: var(--hairline) solid var(--rule);
    background: var(--surface-raised);

    figcaption {
      padding: var(--space-2) var(--space-4);
      border-block-end: var(--hairline) solid var(--rule);
      color: var(--text-muted);
      font-size: var(--size-sm);
    }

    pre {
      margin: 0;
      padding: var(--space-4);
      overflow-x: auto;
      font-size: 0.8125rem;
      line-height: 1.6;
    }
  }

  code {
    font-family: var(--font-data);
  }

  .prose,
  .add {
    code {
      font-size: 0.875em;
    }
  }

  .prose {
    display: grid;
    gap: var(--space-3);
    max-inline-size: var(--measure);
  }
</style>
