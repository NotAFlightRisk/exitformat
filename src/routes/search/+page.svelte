<script lang="ts">
  import PageHead from '#lib/components/PageHead.svelte';
  import SearchBox from '#lib/components/SearchBox.svelte';

  let { data } = $props();
</script>

<PageHead title={data.meta.title} lede={data.meta.description} />
<SearchBox size="large" />
<p>Or browse <a href="/categories">by category</a>.</p>
