<script lang="ts">
  import PageHead from '#lib/components/PageHead.svelte';
  import { site } from '#lib/site.ts';

  let { data } = $props();
</script>

<PageHead title={data.meta.title} lede={data.meta.description} />
<p>
  The <a href="{site.repo}/blob/main/.github/CONTRIBUTING.md">contributing guide</a> has the
  details.
</p>
