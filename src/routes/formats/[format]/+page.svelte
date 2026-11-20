<script lang="ts">
  import type { ConversionView, FormatLink, ServiceLink } from '#lib/data/types.ts';

  let { data } = $props();
  let format = $derived(data.format);
</script>

{#snippet links(title: string, list: (ServiceLink | FormatLink)[])}
  <section>
    <h2>{title}</h2>
    <ul>
      {#each list as link (link.id)}
        <li><a href={link.href}>{link.name}</a></li>
      {/each}
    </ul>
  </section>
{/snippet}

{#snippet conversions(title: string, list: ConversionView[])}
  <section>
    <h2>{title}</h2>
    {#each list as conversion}
      <article>
        <h3>{conversion.from.name} to {conversion.to.name} with {conversion.tool}</h3>
        <a href={conversion.url} rel="external">{conversion.tool}</a>
        <ol>
          {#each conversion.steps as step}
            <li>{step}</li>
          {/each}
        </ol>
      </article>
    {/each}
  </section>
{/snippet}

<h1>{format.name}</h1>
<p>{format.description}</p>
<p>{format.standard ? 'Open standard' : "One app's own format"} {format.extensions.join(', ')}</p>
{#if format.basedOn}
  <p>Built on <a href={format.basedOn.href}>{format.basedOn.name}</a></p>
{/if}
{#if format.spec}
  <a href={format.spec} rel="external">Spec</a>
{/if}

{@render links('Who exports it', data.exporters)}
{@render links('Who imports it', data.importers)}
{@render conversions('Turning it into something else', format.conversions)}
{@render conversions('Turning something else into it', data.convertsFrom)}
{@render links('Built on top of it', data.variants)}
