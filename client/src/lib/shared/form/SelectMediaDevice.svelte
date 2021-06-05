<script lang="ts">
  /**
   * Form select component having options with devices of some kind
   */
  import { getDeviceStore } from "../store/media.store";
  import type { DeviceStore } from "../store/media.store";
  import Select from "./Select.svelte";

  export let kind: MediaDeviceKind;
  let waitingDevices = true;

  let options = [];
  const emptyOption = {
    label: "",
    value: "",
  };

  let store: DeviceStore;
  getDeviceStore(kind).then((tmp) => {
    store = tmp;
    waitingDevices = false;
  });

  $: if ($store) {
    options = [
      emptyOption,
      ...$store.map((device) => ({
        label: device.label ? device.label : device.deviceId,
        value: device.deviceId,
      })),
    ];
  }

  $: console.log(options);
</script>

{#if waitingDevices}
  Getting devices...
{:else}
  <Select {options} on:input />
{/if}