<script lang="ts">
  export let component: object;
  export let listeners: [string, Function][] = [];
  export let props: object = {};

  let instance;


  $: if (instance && listeners) {
    for (let [key, listener] of listeners) {
      instance.$on(key, listener);
    }
    console.log('ahoj');
  }
</script>

<svelte:component this={component} {...props} bind:this={instance} />