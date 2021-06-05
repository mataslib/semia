<script lang="ts">
  /**
   * Meeting member component
   * - shows member's media stream and handles video resizing on viewport dimensions change
   */
  import { tick } from "svelte";
  export let stream: MediaStream;
  // since stream's addtrack and removetrack event listener not working as expected
  // we can't watch track changes here
  // and therefore we must rely on some stream managment outside
  // which knows and passes this information here as prop
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

  // video container is for unknown reason wider than video
  // when video height is 100%, used on video tag
  // (container mainstains original video width, not shrinking to shrinked video size)
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
      videoEl.addEventListener("loadstart", handleWeirdVideoSizingBehaviorFn);
      videoEl.addEventListener("loadeddata", handleWeirdVideoSizingBehaviorFn);
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
