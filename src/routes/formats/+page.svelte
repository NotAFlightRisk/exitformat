<script lang="ts">
  let { data } = $props();

  const groups = $derived([
    { title: 'Open standards', formats: data.formats.filter(({ standard }) => standard) },
    { title: "One app's own", formats: data.formats.filter(({ standard }) => !standard) }
  ]);
</script>

<h1>File formats</h1>

{#each groups as group (group.title)}
  <section>
    <h2>{group.title}</h2>
    <ul>
      {#each group.formats as format (format.id)}
        <li>
          <a href={format.href}>{format.name}</a>
          <span>{format.extensions.join(', ')}</span>
          <p>{format.description}</p>
          <p>{format.exporters} export it, {format.importers} import it</p>
        </li>
      {/each}
    </ul>
  </section>
{/each}
