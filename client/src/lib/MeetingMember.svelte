<script lang="ts">
  import { onMount, onDestroy, tick } from "svelte";
  export let stream: MediaStream;
  // since stream's addtrack and removetrack event listener not working as expected
  // we can not watch track changes here and must rely that semone outside knows
  export let streamHasTracks: boolean = true;

  let videoContainerEl: HTMLDivElement;
  let videoEl: HTMLVideoElement;
  let handleWeirdVideoSizingBehaviorFn: any;

  function videoRendered() {
    (async () => {
      await tick();
      videoEl.srcObject = stream;
      handleWeirdVideoSizingBehavior();
    })();

    return "";
  }

  // video container is bigger than video when height 100% used on video tag
  // (container mainstains original width, not shrinking to shrinked video size)
  // so we set width manually on window resize, change, ...
  function handleWeirdVideoSizingBehavior() {
    let throttle = setTimeout(() => {}, 0);
    handleWeirdVideoSizingBehaviorFn = () => {
      if (videoContainerEl) {
        clearTimeout(throttle);
        throttle = setTimeout(() => {
          videoContainerEl.style.width = `${videoEl?.offsetWidth ?? 0}px`;
        }, 25);
      }
    };

    if (videoEl) {
      videoEl.removeEventListener(
        "loadstart",
        handleWeirdVideoSizingBehaviorFn
      );
      videoEl.removeEventListener(
        "loadeddata",
        handleWeirdVideoSizingBehaviorFn
      );
      videoEl.removeEventListener("suspend", handleWeirdVideoSizingBehaviorFn);
      videoEl.removeEventListener("resize", handleWeirdVideoSizingBehaviorFn);
      videoEl.addEventListener("loadstart", handleWeirdVideoSizingBehaviorFn);
      videoEl.addEventListener("loadeddata", handleWeirdVideoSizingBehaviorFn);
      // videoEl.addEventListener("suspend", handleWeirdVideoSizingBehaviorFn);
      videoEl.addEventListener("resize", handleWeirdVideoSizingBehaviorFn);
    }
  }
</script>

<div bind:this={videoContainerEl} class="meetingitem">
  {#if streamHasTracks}
    <video bind:this={videoEl} autoplay playsinline controls />
    {videoRendered()}
  {/if}
</div>

<svelte:window on:resize={handleWeirdVideoSizingBehaviorFn} />
