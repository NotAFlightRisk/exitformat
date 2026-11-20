<script lang="ts">
  import Facts from '#lib/components/Facts.svelte';
  import PageHead from '#lib/components/PageHead.svelte';
  import PathBadge from '#lib/components/PathBadge.svelte';
  import Section from '#lib/components/Section.svelte';
  import StateMark, { type State } from '#lib/components/StateMark.svelte';
  import { pathKinds } from '#lib/data/types.ts';
  import { site } from '#lib/site.ts';
  import { formatDate } from '#lib/text.ts';

  let { data } = $props();

  type Row = { state: State; label: string; means: string };

  const facts = $derived([
    { label: 'Services', value: String(data.counts.services) },
    { label: 'File formats', value: String(data.counts.formats) },
    { label: 'Move guides', value: String(data.counts.migrations) },
    { label: 'Last checked', value: formatDate(data.checked) },
    { label: 'Licence', value: 'MIT', href: `${site.repo}/blob/main/LICENSE` }
  ]);

  const checks: Row[] = [
    {
      state: 'included',
      label: 'Documented',
      means: "Written from the service's own docs or its source code."
    },
    {
      state: 'included',
      label: 'Tested',
      means: 'Someone ran the export and the import, and wrote down what happened.'
    },
    {
      state: 'warning',
      label: 'Over a year old',
      means: "Flagged as maybe out of date, until someone's been through it again."
    }
  ];

  const ease: Record<string, string> = {
    direct:
      "The app you're moving to has an importer made for the one you're leaving, so the move gets its own guide.",
    file: 'They share a file format, like Markdown or CSV, so one app exports a file the other can import.',
    convert: "There's no file they both read, but a tool can turn one into the other."
  };

  const carry: Row[] = [
    {
      state: 'included',
      label: 'Carries over',
      means: 'The export has it and the import keeps it.'
    },
    { state: 'excluded', label: 'Lost', means: "One side leaves it out, so it won't make it." },
    {
      state: 'unknown',
      label: 'Not sure',
      means: "Nobody's confirmed it either way, so check before you delete anything."
    }
  ];
</script>

{#snippet key(rows: Row[])}
  <dl class="key">
    {#each rows as row (row)}
      <div>
        <dt><StateMark state={row.state} /> {row.label}</dt>
        <dd>{row.means}</dd>
      </div>
    {/each}
  </dl>
{/snippet}

<PageHead
  title={data.meta.title}
  lede="An open directory of how to get your data out of online services, what comes with it, and where it can go next."
>
  <Facts items={facts} />
</PageHead>

<div class="pair">
  <Section id="what" title="What Exit Format is">
    <div class="prose">
      <p>
        Every service gets a page with each way to get your data out of it: the steps, the files
        you'll get, what's in them and what gets left behind. Those exports are matched against
        every other app's imports, so you can see where your data can actually go, and how much of
        it makes it across. Plus how to delete your account once you're out.
      </p>
      <p>
        The idea is that you know whether you can leave something before you sign up, and what's
        coming with you before you go.
      </p>
    </div>
  </Section>

  <Section id="isnt" title="What it isn't">
    <div class="prose">
      <p>
        It won't move anything for you. There's nothing to sign in to or install, and your data
        never comes anywhere near us.
      </p>
      <p>
        It isn't a review site either. It doesn't score apps or say which one's best, and nothing
        here is sponsored. It just says what comes out of each one and where it can go, and the
        choosing's up to you.
      </p>
    </div>
  </Section>
</div>

<Section id="checked" title="How entries are checked">
  <div class="split">
    {@render key(checks)}
    <div class="prose">
      <p>
        Every export and import links where it came from. That's the service's own help page if
        there is one, or else its source code pinned to a release, its release notes or a staff
        reply. Never a "how to export" blog. Some link a copy saved on the
        <a href="https://web.archive.org" rel="external">Wayback Machine</a> too, so you can see what
        a page said on the day it was checked.
      </p>
      <p>
        Each entry carries the date someone last went through the whole file. The ways to move are
        never written by hand - they're worked out from the exports and imports, so fixing one file
        fixes every move it's part of. And every change gets checked by a script that points at the
        exact line that's wrong.
      </p>
    </div>
  </div>
</Section>

<Section id="marks" title="What the marks mean">
  <div class="split">
    <div class="group">
      <h3>How easy a move is</h3>
      <dl class="key">
        {#each Object.entries(pathKinds) as [id, label] (id)}
          <div>
            <dt><PathBadge kind={{ id, label }} /></dt>
            <dd>{ease[id]}</dd>
          </div>
        {/each}
      </dl>
    </div>
    <div class="group">
      <h3>What makes it across</h3>
      {@render key(carry)}
    </div>
  </div>
  <p class="note">
    An export on a service's page uses the same marks, as Comes with it, Left behind and Not sure.
  </p>
</Section>

<div class="pair">
  <Section id="who" title="Who runs it">
    <div class="prose">
      <p>
        Exit Format is an open project from <a href="https://peng.ly" rel="external">peng.ly</a>,
        and all of it lives on <a href={site.repo} rel="external">GitHub</a>. Anyone can add a
        service or fix a mistake, and <a href="/contribute">here's how</a>.
      </p>
    </div>
  </Section>

  <Section id="licence" title="Licence">
    <div class="prose">
      <p>
        The code and the data are both
        <a href="{site.repo}/blob/main/LICENSE" rel="external">MIT licensed</a>, so take them
        wherever you like. A site about leaving that locked up its own data would be a bit rich. The
        whole directory's in one file at <a href="/api/directory.json">/api/directory.json</a> too.
      </p>
    </div>
  </Section>
</div>

<style>
  .pair,
  .split {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-7) var(--space-6);
    align-items: start;

    @media (width < 60rem) {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  .split {
    row-gap: var(--space-5);
  }

  .prose {
    display: grid;
    gap: var(--space-3);
    max-inline-size: var(--measure);
  }

  .group {
    display: grid;
    gap: var(--space-3);
  }

  h3 {
    font-size: var(--size-md);
  }

  .key {
    display: grid;
    border-block-start: var(--hairline) solid var(--rule);
    font-size: var(--size-sm);

    div {
      display: grid;
      grid-template-columns: 11rem minmax(0, 1fr);
      gap: var(--space-1) var(--space-4);
      padding-block: var(--space-3);
      border-block-end: var(--hairline) solid var(--rule);

      @media (width < 30rem) {
        grid-template-columns: minmax(0, 1fr);
      }
    }

    dt {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-weight: 650;
    }

    dd {
      color: var(--text-muted);
    }
  }

  .note {
    color: var(--text-muted);
    font-size: var(--size-sm);
  }
</style>
