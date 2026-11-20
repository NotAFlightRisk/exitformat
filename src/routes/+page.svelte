<script lang="ts">
  let { data } = $props();
</script>

<h1>Your data has an exit</h1>
<dl>
  <dt>Services</dt>
  <dd>{data.counts.services}</dd>
  <dt>Categories</dt>
  <dd>{data.counts.categories}</dd>
  <dt>Formats</dt>
  <dd>{data.counts.formats}</dd>
  <dt>Ways to move</dt>
  <dd>{data.counts.migrations}</dd>
</dl>

<section>
  <h2>Categories</h2>
  <ul>
    {#each data.categories as category (category.id)}
      <li>
        <a href={category.href}>{category.name}</a>
        <p>{category.description}</p>
        <p>{category.services} services, {category.migrations} ways to move</p>
      </li>
    {/each}
  </ul>
</section>

<section>
  <h2>Moves that work well</h2>
  <ul>
    {#each data.featured as move (move.href)}
      <li>
        <a href={move.href}>{move.source.name} to {move.destination.name}</a>
        <span>{move.kind.label}</span>
      </li>
    {/each}
  </ul>
</section>

<section>
  <h2>Recently checked</h2>
  <ul>
    {#each data.recent as service (service.id)}
      <li>
        <a href={service.href}>{service.name}</a>
        <time datetime={service.verification.checked}>{service.verification.checked}</time>
      </li>
    {/each}
  </ul>
</section>
