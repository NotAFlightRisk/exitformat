<script lang="ts">
  import CategoryList from '#lib/components/CategoryList.svelte';
  import PageHead from '#lib/components/PageHead.svelte';

  let { data } = $props();
</script>

<PageHead title={data.meta.title} lede={data.meta.description} />
<CategoryList categories={data.categories} level={2} />
