<script lang="ts">
  import type { OptionView, Term } from '#lib/data/types.ts';

  let { data } = $props();
  const labels = (terms: Term[]) => terms.map(({ label }) => label).join(', ');
</script>

{#snippet stage(title: string, choice: OptionView)}
  <h3>{title}: {choice.name}</h3>
  <ol>
    {#each choice.steps as step}
      <li>{step}</li>
    {/each}
  </ol>
  <ul>
    {#each choice.limitations as limitation}
      <li>{limitation}</li>
    {/each}
  </ul>
  {#if choice.docs}
    <a href={choice.docs} rel="external">Official docs</a>
  {/if}
{/snippet}

<h1>Move from {data.source.name} to {data.destination.name}</h1>

{#each data.paths as path, index}
  <section>
    <h2>{index ? 'Another way' : 'Best way'}: {path.kind.label}</h2>
    {#if path.export}
      {@render stage(`Out of ${data.source.name}`, path.export)}
    {/if}
    {#if path.conversion}
      <h3>Convert {path.conversion.from.name} to {path.conversion.to.name}</h3>
      <a href={path.conversion.url} rel="external">{path.conversion.tool}</a>
      <ol>
        {#each path.conversion.steps as step}
          <li>{step}</li>
        {/each}
      </ol>
    {/if}
    {@render stage(`Into ${data.destination.name}`, path.import)}
    <dl>
      <dt>Carried</dt>
      <dd>{labels(path.carried)}</dd>
      <dt>Lost</dt>
      <dd>{labels(path.lost)}</dd>
      <dt>Not sure</dt>
      <dd>{labels(path.unknown)}</dd>
    </dl>
  </section>
{/each}

{#if data.reverse}
  <a href={data.reverse.href}>Going the other way?</a>
{/if}

<section>
  <h2>Other places {data.source.name} can go</h2>
  <ul>
    {#each data.moreFrom as move (move.href)}
      <li><a href={move.href}>{move.destination.name}</a></li>
    {/each}
  </ul>
</section>

<section>
  <h2>Other ways into {data.destination.name}</h2>
  <ul>
    {#each data.moreTo as move (move.href)}
      <li><a href={move.href}>{move.source.name}</a></li>
    {/each}
  </ul>
</section>
