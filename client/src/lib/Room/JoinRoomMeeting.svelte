<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import SelectMediaDevice from "../shared/form/SelectMediaDevice.svelte";
  import Field from "../shared/form/Field.svelte";
  import PrimaryButton from "../shared/PrimaryButton.svelte";
import { triggerPermissionPrompt } from "../shared/media";

  const dispatch = createEventDispatcher();
  let mediaStream: MediaStream = new MediaStream();
  let previewElement: HTMLMediaElement;

  let audioInId: string;
  let videoInId: string;
  let loading = false;
  let waitingPermissions = true;

  $: updateStream(audioInId, videoInId);
  $: updatePreviewElement(previewElement, mediaStream);

  triggerPermissionPrompt().finally(() => waitingPermissions = false);


  function updatePreviewElement(
    previewElement: HTMLMediaElement,
    mediaStream: MediaStream
  ) {
    if (previewElement) {
      previewElement.srcObject = mediaStream;
    }
  }

  function updateStream(audioInId, videoInId) {
    loading = true;
    let constraints = {};

    if (audioInId) {
      constraints["audio"] = {
        deviceId: audioInId,
        echoCancellation: true,
      };
    }

    if (videoInId) {
      constraints["video"] = {
        deviceId: videoInId,
        height: { exact: 480 },
        aspectRatio: {
          exact: 4 / 3,
        },
      };
    }

    if (Object.keys(constraints).length) {
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => {
          mediaStream = stream;
        })
        .finally(() => (loading = false));
    } else {
      mediaStream = new MediaStream();
      loading = false;
    }
  }

  function joinAction() {
    dispatch("joinAction", mediaStream);
  }

  $: isEmptyMediaStream = mediaStream.getTracks().length === 0;
</script>

<div class="joinroom">
  {#if waitingPermissions}
    Checking media devices permissions
  {:else}
    <p>
      There are device (camera, microphone) identificators showed in select boxes
      ("random" mixed characters and numbers) until permanent device permission is
      given.<br /><br /> After you permanently allow device, you will see device labels
      (names) next time, or after browser refresh.
    </p>

    <Field
      label="Audio In"
      input={{
        component: {
          component: SelectMediaDevice,
          props: { kind: "audioinput" },
          listeners: [["input", (e) => (audioInId = e.target.value)]],
        },
      }}
    />
    <Field
      label="Camera"
      input={{
        component: {
          component: SelectMediaDevice,
          props: { kind: "videoinput" },
          listeners: [["input", (e) => (videoInId = e.target.value)]],
        },
      }}
    />

    <div class="preview">
      {#if !isEmptyMediaStream}
        {#if videoInId}
          <video bind:this={previewElement} autoplay playsinline controls />
        {:else}
          <audio bind:this={previewElement} autoplay playsinline controls />
        {/if}
      {/if}
    </div>

    {#if !loading}
      <PrimaryButton on:click={joinAction}>Join</PrimaryButton>
    {:else}
      loading device...
    {/if}
  {/if}
</div>

<style>
  .preview {
    margin-bottom: 15px;
  }
</style>
