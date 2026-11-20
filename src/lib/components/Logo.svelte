<script lang="ts">
  let { wordmark = true }: { wordmark?: boolean } = $props();
</script>

<span class="logo">
  <svg viewBox="0 0 32 32" aria-hidden="true">
    <path class="frame" d="M1 13h8v4H5v10h10v-4h4v8H1zm30 6h-8v-4h4V5H17v4h-4V1h18z" />
    <path class="block" d="M12 12h8v8h-8z" />
  </svg>
  {#if wordmark}<span class="name">Exit Format</span>{/if}
</span>

<style>
  .logo {
    display: inline-flex;
    align-items: center;
    gap: 0.625rem;
  }

  svg {
    inline-size: 1.75rem;
    block-size: 1.75rem;
  }

  .frame {
    fill: currentColor;
  }

  .block {
    fill: var(--accent);
  }

  .name {
    font-size: 1.1875rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    white-space: nowrap;
  }
</style>
