<script lang="ts">
  import Checked from '#lib/components/Checked.svelte';
  import FormatChips from '#lib/components/FormatChips.svelte';
  import ServiceLink from '#lib/components/ServiceLink.svelte';
  import type { ServiceCard } from '#lib/data/types.ts';

  let { services, category = false }: { services: ServiceCard[]; category?: boolean } = $props();
</script>

<div class="frame">
  <ul class="rows">
    <li class="labels" aria-hidden="true">
      <span>Service</span>
      <span>Exports as</span>
      <span>Runs on</span>
      <span>Checked</span>
    </li>
    {#each services as service (service)}
      <li>
        <div class="who">
          <h3><ServiceLink {service} size="md" {category} /></h3>
          <p>{service.description}</p>
        </div>
        <div class="exports">
          {#if service.exports.length}
            <FormatChips formats={service.exports} />
          {:else}
            <p class="none">No way out that we know of</p>
          {/if}
        </div>
        <p class="runs">
          {service.deployment.label}
          <span>{service.platforms.map(({ label }) => label).join(', ')}</span>
        </p>
        <div class="checked"><Checked verification={service.verification} /></div>
      </li>
    {/each}
  </ul>
</div>

<style>
  .frame {
    container-type: inline-size;
  }

  .rows {
    display: grid;
    list-style: none;
    border-block-start: var(--hairline) solid var(--rule-strong);
  }

  li {
    display: grid;
    gap: var(--space-3);
    padding-block: var(--space-4);
    border-block-end: var(--hairline) solid var(--rule);
  }

  .labels {
    display: none;
  }

  .who {
    display: grid;
    gap: var(--space-2);

    h3 {
      font-size: var(--size-md);
    }

    p {
      max-inline-size: 60ch;
      color: var(--text-muted);
      font-size: var(--size-sm);
    }
  }

  .runs {
    display: grid;
    font-size: var(--size-sm);
    font-weight: 650;

    span {
      color: var(--text-muted);
      font-weight: 400;
    }
  }

  .none {
    color: var(--text-muted);
    font-size: var(--size-sm);
  }

  @container (width >= 56rem) {
    .rows {
      grid-template-columns: minmax(0, 5fr) minmax(0, 4fr) minmax(0, 2fr) auto;
      column-gap: var(--space-5);
    }

    li {
      grid-column: 1 / -1;
      grid-template-columns: subgrid;
      align-items: start;
    }

    .labels {
      display: grid;
      padding-block: var(--space-2);
      color: var(--text-muted);
      font-size: var(--size-xs);
    }
  }
</style>
