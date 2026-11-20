<script lang="ts">
  let { data } = $props();
</script>

<h1>Every category</h1>
<ul>
  {#each data.categories as category (category.id)}
    <li>
      <a href={category.href}>{category.name}</a>
      <p>{category.description}</p>
      <p>{category.services} services, {category.migrations} ways to move</p>
    </li>
  {/each}
</ul>
