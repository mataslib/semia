<script lang="ts">
  /**
   * General form field component:
   * - generates random id for input and label[for] (clickable label)
   * - renders various components based on type and given props
   * - renders errors
   * - gives default design
   */
  import { v4 as uuid } from "uuid";
  import DynamicComponent from "../DynamicComponent.svelte";
  import Input from "./Input.svelte";
  export let label = undefined;
  export let error = undefined;
  export let touched = false;
  export let submitted = false;
  export let id = undefined;
  export let input: Input = {};

  let type = $$restProps["type"];
  id = id ?? uuid();

  interface Input {
    component?: {
      component: object;
      props: object;
      listeners: [string, Function][];
    };
  }
</script>

<div class="formfield">
  {#if label}
    <label for={id}>
      {label}
    </label><br />
  {/if}

  {#if type === "select"}
    <Select {id} {...$$restProps} on:input on:blur />
  {:else if input.component}
    <DynamicComponent
      component={input.component.component}
      props={input.component?.props ?? {}}
      listeners={input.component?.listeners ?? []}
    />
  {:else}
    <Input {id} {...$$restProps} on:input on:blur />
  {/if}

  {#if error && (submitted || touched)}
    <div>
      {error}
    </div>
  {/if}
</div>

<style>
  .formfield {
    margin-bottom: 2ch;
  }
</style>
