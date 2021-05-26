<script lang="ts">
  import { onMount } from "svelte";
  export let stream: MediaStream;

  let videoContainerEl: HTMLDivElement;
  let videoEl: HTMLVideoElement;

  let windowResize: () => {};

  onMount(() => {
    let throttle = setTimeout(() => {}, 0);

    windowResize = () => {
      if (videoContainerEl && videoEl) {
        clearTimeout(throttle);
        throttle = setTimeout(() => {
          videoContainerEl.style.width = `${videoEl.offsetWidth}px`;
        }, 25);
      }
    };

    videoEl.srcObject = stream;
    // videoEl.addEventListener("")
    videoEl.addEventListener("loadstart", windowResize);
    videoEl.addEventListener("loadeddata", windowResize);
    videoEl.addEventListener("suspend", windowResize);
    videoEl.addEventListener("resize", windowResize);
  });
</script>

<div bind:this={videoContainerEl} class="meetingitem">
  <video bind:this={videoEl} autoplay playsinline controls />
</div>

<svelte:window on:resize={windowResize} />
