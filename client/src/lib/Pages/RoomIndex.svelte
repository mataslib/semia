<script lang="ts">
  import { token } from "../shared/store/store";
  import { setContext } from "svelte";
  import { useParams } from "svelte-navigator";
  import Chat from "../Room/Chat.svelte";
  import { io } from "socket.io-client";
  import PrimaryButton from "../shared/PrimaryButton.svelte";
  import Modal from "../shared/Modal.svelte";
  import JoinRoomMeeting from "../Room/JoinRoomMeeting.svelte";
  import RoomMeeting from "../Room/RoomMeeting.svelte";
  import RoomMembers from "../Room/RoomMembers.svelte";
  import { server } from "../shared/globals";

  const params = useParams();
  const { id: roomId } = $params;

  let showJoinMeeting = false;
  let showMembers = false;
  let meetingInProgress = false;
  let socketState: "connecting" | "connected" | "error" | "timeout" =
    "connecting";
  let error: string;

  const roomSocket = io(`ws://${server}/room-${roomId}`, {
    timeout: 5000,
    transports: ["websocket"],
    auth: {
      token: $token,
    },
  });
  setContext("roomSocket", roomSocket);
  roomSocket.on("connect", () => (socketState = "connected"));
  roomSocket.on("connect_error", (err) => {
    socketState = "error";
    error = err.message;
  });
  roomSocket.on("connect_timeout ", () => (socketState = "timeout"));

  let mediaStream: MediaStream;
  function joinMeeting(tmpMediaStream) {
    mediaStream = tmpMediaStream;
    meetingInProgress = true;
    showJoinMeeting = false;
  }

  function leaveMeeting() {
    meetingInProgress = false;
    mediaStream.getTracks().forEach((track) => track.stop());
    mediaStream = undefined;
  }

  function meetingError(e) {
    meetingInProgress = false;
    alert(`Error: ${e.detail}`);
  }

  function toggleShowJoin() {
    showJoinMeeting = !showJoinMeeting;
  }

  function toggleShowMembers() {
    showMembers = !showMembers;
  }

  $: showModal = !meetingInProgress && showJoinMeeting;
</script>

{#if socketState === "connecting"}
  Connecting...
{:else if socketState === "connected"}
  <div class="actions">
    {#if !meetingInProgress}
      <PrimaryButton on:click={toggleShowJoin}>Join Meeting</PrimaryButton>
    {:else}
      <PrimaryButton on:click={leaveMeeting}>Leave</PrimaryButton>
    {/if}
    &nbsp;<a href="" on:click|preventDefault={toggleShowMembers}>Members</a>
  </div>

  <div class="layout" class:layout--meeting={meetingInProgress}>
    {#if meetingInProgress}
      <div class="meeting">
        <RoomMeeting {mediaStream} on:error={meetingError} />
      </div>
    {/if}
    <div class="chatcontainer">
      <Chat />
    </div>
  </div>

  {#if showModal}
    <Modal isOpen={true}>
      <div class="modalcontent">
        <JoinRoomMeeting on:joinAction={(e) => joinMeeting(e.detail)} />
      </div>
    </Modal>
  {/if}

  {#if showMembers}
    <Modal isOpen={true}>
      <div class="modalcontent">
        <RoomMembers />
      </div>
    </Modal>
  {/if}
{:else if socketState === "timeout"}
  Connecting timeout.
{:else if socketState === "error"}
  Error. ({error})
{/if}

<style>
  .meeting :global(video) {
    height: 100%;
  }

  .modalcontent {
    padding: 15px;
  }

  .layout {
    display: grid;
    height: 100vh;
    grid-template-areas: "chat";
    grid-template-rows: minmax(360px, auto);
  }
  .layout--meeting {
    grid-template-areas:
      "videos"
      "chat";
    grid-template-rows: minmax(360px, 480px) minmax(360px, auto);
  }

  .chatcontainer {
    grid-area: chat;
    display: grid;
    grid-auto-rows: 1fr auto;
  }

  .meeting {
    display: grid;
    overflow: auto;
    max-width: 100%;
    grid-auto-flow: column;
    grid-auto-rows: minmax(0, 1fr);
    grid-auto-columns: min-content;
    overflow-y: hidden;
    overflow-x: auto;
  }

  .actions {
    position: fixed;
    left: 50%;
    top: 15px;
    transform: translate3d(-50%, 0, 0);
    z-index: 9;
  }
</style>
