<script lang="ts">
  let { data } = $props();
</script>

<h1>{data.category.name}</h1>
<p>{data.category.description}</p>

<section>
  <h2>Services</h2>
  <ul>
    {#each data.services as service (service.id)}
      <li>
        <a href={service.href}>{service.name}</a>
        <p>{service.description}</p>
        <p>{service.deployment.label}, {service.platforms.map(({ label }) => label).join(', ')}</p>
      </li>
    {/each}
  </ul>
</section>

{#if data.matrix}
  <section>
    <h2>Who can move to whom</h2>
    <table>
      <thead>
        <tr>
          <th scope="col">From</th>
          {#each data.matrix.services as destination (destination.id)}
            <th scope="col">{destination.name}</th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each data.matrix.rows as row, index}
          <tr>
            <th scope="row">{data.matrix.services[index].name}</th>
            {#each row as cell}
              <td>
                {#if cell}
                  <a href={cell.href}>{cell.kind.label}</a>
                {/if}
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </section>
{/if}

<section>
  <h2>Formats in use</h2>
  <ul>
    {#each data.formats as format (format.id)}
      <li>
        <a href={format.href}>{format.name}</a>
        <span>{format.exporters} export, {format.importers} import</span>
      </li>
    {/each}
  </ul>
</section>

<section>
  <h2>What we track</h2>
  <ul>
    {#each data.category.data as item (item.id)}
      <li>{item.label}</li>
    {/each}
  </ul>
</section>
