<script lang="ts">
  import { getDeviceStore } from "./media.store";
  import type { DeviceStore } from "./media.store";
  import Select from "./Select.svelte";

  export let kind: MediaDeviceKind;
  let options = [];
  const emptyOption = {
    label: "",
    value: "",
  };

  let store: DeviceStore;
  getDeviceStore(kind).then((tmp) => (store = tmp));

  $: if ($store) {
    options = [
      emptyOption,
      ...$store.map((device) => ({
        label: device.label,
        value: device.deviceId,
      })),
    ];
  }
</script>

<Select {options} on:input />
