<script lang="ts">
  let { data } = $props();
</script>

<h1>Changelog</h1>
<p><a href="/feed.xml">Follow it as an Atom feed</a></p>

{#if data.changes.length}
  <ol>
    {#each data.changes as change (change)}
      <li>
        <time datetime={change.date}>{change.date}</time>
        {#if change.service}
          <a href={change.service.href}>{change.name}</a>
        {:else}
          {change.name}
        {/if}
        {change.kind.label}{#if change.sections.length}: {change.sections
            .map(({ label }) => label)
            .join(', ')}{/if}
        <a href={change.source.href} rel="external">{change.source.label}</a>
      </li>
    {/each}
  </ol>
  {#if data.total > data.changes.length}
    <p>Showing the latest {data.changes.length} of {data.total}.</p>
  {/if}
{:else}
  <p>Nothing's changed yet.</p>
{/if}
