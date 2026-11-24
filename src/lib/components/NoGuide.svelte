<script lang="ts">
  import { afterNavigate } from '$app/navigation';
  import FormatChips from '#lib/components/FormatChips.svelte';
  import Section from '#lib/components/Section.svelte';
  import type { FormatLink, Link } from '#lib/data/types.ts';
  import { markFor } from '#lib/format-icons.ts';
  import { sharedFormats } from '#lib/search.ts';
  import { searchIndex } from '#lib/search-index.ts';
  import { href } from '#lib/site.ts';

  let move = $state<{ from: Link; to: Link; formats: FormatLink[] }>();

  // a move page that's gone, or never was, still knows both apps by their ids
  afterNavigate(async () => {
    move = undefined;
    const [, source, destination] =
      location.pathname.match(/^\/migrate\/([^/]+)\/([^/]+)\/?$/) ?? [];
    if (!source) return;
    const index = await searchIndex().catch(() => undefined);
    const [from, to] = [source, destination].map((id) =>
      index?.services.find((service) => service.id === id)
    );
    if (!index || !from || !to) return;
    const link = ({ id, name, category }: typeof from) => ({
      id,
      name,
      href: href.service(category, id)
    });
    move = {
      from: link(from),
      to: link(to),
      // the index doesn't say whose a format is, so an app's own one goes without its icon
      formats: sharedFormats(index, from, to).map((format) => ({
        ...format,
        href: href.format(format.id),
        mark: format.standard ? markFor(format.extensions) : null,
        icon: null
      }))
    };
  });
</script>

{#if move}
  {@const { from, to, formats } = move}
  <Section id="no-guide" title="Move from {from.name} to {to.name}">
    <div class="note">
      <p>
        There's no step-by-step guide for this one.
        {#if formats.length}
          They do share a format though, so you can export a file from {from.name} and import it into
          {to.name}.
        {/if}
      </p>
      {#if formats.length}<FormatChips {formats} />{/if}
      <p class="actions">
        <a href="{from.href}#export">{from.name} export options</a>
        <a href="{to.href}#import">Import into {to.name}</a>
      </p>
    </div>
  </Section>
{/if}

<style>
  .note {
    display: grid;
    gap: var(--space-3);
    padding: var(--space-4) var(--space-5);
    border: var(--hairline) solid var(--rule);
    background: var(--surface-raised);

    p {
      max-inline-size: var(--measure);
    }
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2) var(--space-5);
    font-weight: 650;
  }
</style>
