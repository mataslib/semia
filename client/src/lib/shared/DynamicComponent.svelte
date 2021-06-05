<script lang="ts">
  // This component helps to create dynamic component from eg. data object,
  // with component class, props and listeners passed as props

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