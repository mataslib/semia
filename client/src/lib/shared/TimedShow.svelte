<script>
  /**
   * Component that shows content for a given time
   * - Value prop must be binded to work correctly! Otherwise you must call reset manually.
   */
  export let timeout = 3000;
  export let value;

  let doShow = true;

  function startCounter() {
    // important! we set value to undefined, so if prop is assigned once more to the same value
    // change is detected. (undefined !== new value vs old value === new value);
    setTimeout(() => {doShow = false; value = undefined;}, timeout);
  }

  // on value change, we show again and reset timer
  $: if (value) {
    reset();
  }

  // ability to reset from outside, handy when used with slot
  // (slot changed can not be detected)
  export function reset() {
    doShow = true;
    startCounter();
  }
</script>

{#if doShow}
  {#if value}
    {value}
  {:else}
    <slot />
  {/if}
{/if}
