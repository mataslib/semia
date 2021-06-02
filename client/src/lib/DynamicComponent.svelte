<script lang="ts">
  // Allows create dynamic component from eg. data object,
  // with component class, props and listeners stored in object
  // or another data structure

  export let component: object;
  export let listeners: [string, Function][] = [];
  export let props: object = {};

  let instance;

  
  $: if (instance && listeners) {
    for (let [key, listener] of listeners) {
      instance.$on(key, listener);
    }
  }
</script>

<svelte:component this={component} {...props} bind:this={instance} />