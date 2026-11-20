<script lang="ts">
  import type { OptionView, Term } from '#lib/data/types.ts';

  let { data } = $props();
  let service = $derived(data.service);
  const labels = (terms: Term[]) => terms.map(({ label }) => label).join(', ');
</script>

{#snippet option(choice: OptionView)}
  <article>
    <h3>{choice.name}</h3>
    <p>{choice.method.label}</p>
    <ul>
      {#each choice.formats as format (format.id)}
        <li><a href={format.href}>{format.name}</a></li>
      {/each}
    </ul>
    {#if choice.from.length}
      <p>Built for</p>
      <ul>
        {#each choice.from as from (from.id)}
          <li><a href={from.href}>{from.name}</a></li>
        {/each}
      </ul>
    {/if}
    {#if choice.requirements.length}
      <p>Needs {choice.requirements.join(', ')}</p>
    {/if}
    <ol>
      {#each choice.steps as step}
        <li>{step}</li>
      {/each}
    </ol>
    {#if choice.data}
      <dl>
        {#if choice.data.included}
          <dt>Included</dt>
          <dd>{labels(choice.data.included)}</dd>
        {/if}
        <dt>Missing</dt>
        <dd>{labels(choice.data.excluded)}</dd>
        <dt>Not sure</dt>
        <dd>{labels(choice.data.unknown)}</dd>
      </dl>
    {/if}
    <ul>
      {#each choice.limitations as limitation}
        <li>{limitation}</li>
      {/each}
    </ul>
    {#if choice.docs}
      <a href={choice.docs} rel="external">Official docs</a>
    {/if}
    {#each choice.sources as source}
      <a href={source} rel="external">Source</a>
    {/each}
  </article>
{/snippet}

<h1>Export your data from {service.name}</h1>
<p>{service.description}</p>
<p>{service.deployment.label}, {labels(service.platforms)}</p>
<a href={service.website} rel="external">Website</a>
{#if service.source}
  <a href={service.source} rel="external">Source code</a>
{/if}

<section>
  <h2>Getting it out</h2>
  {#each service.export as choice (choice.id)}
    {@render option(choice)}
  {/each}
</section>

<section>
  <h2>Bringing it in</h2>
  {#each service.import as choice (choice.id)}
    {@render option(choice)}
  {/each}
</section>

<section>
  <h2>Move to</h2>
  <ul>
    {#each data.moveTo as move (move.href)}
      <li><a href={move.href}>{move.destination.name}</a> {move.kind.label}</li>
    {/each}
  </ul>
</section>

<section>
  <h2>Bring in from</h2>
  <ul>
    {#each data.bringFrom as move (move.href)}
      <li><a href={move.href}>{move.source.name}</a> {move.kind.label}</li>
    {/each}
  </ul>
</section>

{#if service.delete}
  <section>
    <h2>Delete your data</h2>
    <ol>
      {#each service.delete.steps as step}
        <li>{step}</li>
      {/each}
    </ol>
    {#each service.delete.notes as note}
      <p>{note}</p>
    {/each}
    {#if service.delete.docs}
      <a href={service.delete.docs} rel="external">Official docs</a>
    {/if}
  </section>
{/if}

<footer>
  <p>
    {service.verification.status.label}, last checked
    <time datetime={service.verification.checked}>{service.verification.checked}</time>
  </p>
  <a href={service.edit} rel="external">Edit on GitHub</a>
  <a href={service.history} rel="external">History</a>
</footer>
