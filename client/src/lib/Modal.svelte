<script>
  export let isOpen = false;
</script>

<div class="modal-container" class:isOpen>
  <div class="modal-padding">
    <div class="modal">
      <slot />
    </div>
  </div>
</div>

<style>
  .modal-container {
    display: none;
    width: 100vw;
    height: 100vh;
    position: fixed;
    left: 0;
    top: 0;
    pointer-events: none;
  }
  .modal-container.isOpen {
    display: block;
  }

  .modal-padding {
    width: 100%;
    height: 100%;
    display: flex;
    padding: 20vh 0;
    align-items: flex-start;
  }

  .modal {
    pointer-events: all;
    border-radius: 4px;
    /* border: 2px solid black; */
    box-shadow: 0px 0px 20px black;
    background-color: #3b4252;

    align-self: auto;
    margin: 0 auto;
    max-height: 100%;
    overflow: auto;
  }
</style>
