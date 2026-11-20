<script lang="ts">
  import PageHead from '#lib/components/PageHead.svelte';

  let { data } = $props();
</script>

<PageHead title={data.meta.title} lede={data.meta.description} />
<p>
  Every entry says what formats you get, what's missing, and where you can take it, with a link to
  the docs it came from and the date someone last checked. The code and the data are both open
  source.
</p>
