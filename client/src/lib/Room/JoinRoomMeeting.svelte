<script lang="ts">
  /**
   * Join room preparation component
   * - allows to select and preview input video and audio media devices
   */
  import { createEventDispatcher } from "svelte";
  import SelectMediaDevice from "../shared/form/SelectMediaDevice.svelte";
  import Field from "../shared/form/Field.svelte";
  import PrimaryButton from "../shared/PrimaryButton.svelte";

  const dispatch = createEventDispatcher();
  let mediaStream: MediaStream = new MediaStream();
  // element with media stream preview
  let previewElement: HTMLMediaElement;

  let audioInId: string;
  let videoInId: string;
  let loadingDevices = false;

  // updateStream on audion input or videon input device id change
  $: updateStream(audioInId, videoInId);
  // updatePreviewElement on previewElement or mediaStream change
  $: updatePreviewElement(previewElement, mediaStream);

  function updatePreviewElement(
    previewElement: HTMLMediaElement,
    mediaStream: MediaStream
  ) {
    if (previewElement) {
      previewElement.srcObject = mediaStream;
    }
  }

  function updateStream(audioInId, videoInId) {
    loadingDevices = true;
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
        .finally(() => (loadingDevices = false));
    } else {
      mediaStream = new MediaStream();
      loadingDevices = false;
    }
  }

  function joinAction() {
    dispatch("joinAction", mediaStream);
  }

  // find out whether media stream has no tracks on it's change
  $: isEmptyMediaStream = mediaStream.getTracks().length === 0;
</script>

<div class="joinroom">
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

  {#if !loadingDevices}
    <PrimaryButton on:click={joinAction}>Join</PrimaryButton>
  {:else}
    loading device...
  {/if}
</div>

<style>
  .preview {
    margin-bottom: 15px;
  }
</style>
