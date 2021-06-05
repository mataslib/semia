<script>
  /**
   * Styled button component
  */
</script>

<button on:click>
  <slot/>
</button>

<style>
  button {
    background-color: #A3BE8C;
    /* color: black; */
    border-radius: 20px;
    border: none;
    padding: 8px 12px;
    box-shadow: 0 0 8px 0px #a3be8c;
    color: #2E3440;
    transition: 0.33s box-shadow;
    /* border: 4px solid black; */
  }

  button:hover {
    box-shadow: 0 0 2px 0px #a3be8c;
  }
</style>