<script lang="ts">
  let { data } = $props();
</script>

<h1>Move your data from one app to another</h1>

{#each data.groups as group (group.category.id)}
  <section>
    <h2><a href={group.category.href}>{group.category.name}</a></h2>
    <ul>
      {#each group.migrations as move (move.href)}
        <li>
          <a href={move.href}>{move.source.name} to {move.destination.name}</a>
          <span>{move.kind.label}, {move.carried} carried, {move.lost} lost</span>
        </li>
      {/each}
    </ul>
  </section>
{/each}
