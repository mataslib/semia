<script>
  /**
   * Wrapper component of html form select
   */
  export let options = [];

  options = options.map(option => {
    if (typeof option === 'string') {
      return {
        label: option,
        value: option,
      }
    }
    return option;
  });
</script>

<select {...$$restProps} on:input on:blur>
  {#each options as option}
    <option value={option.value}>{option.label}</option>
  {/each}
</select>