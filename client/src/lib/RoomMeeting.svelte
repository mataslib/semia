<script lang="ts">
  import { getContext, createEventDispatcher, onDestroy } from "svelte";
  import type * as types from "semiatypes";
  import type { Socket } from "socket.io-client";
  import { v4 as uuid } from "uuid";
  import MeetingMember from "./MeetingMember.svelte";
  import { initPeerConnection } from "./webrtc";

  export let mediaStream: MediaStream;

  let localVideoTrack: MediaStreamTrack | undefined;
  let localAudioTrack: MediaStreamTrack | undefined;
  localAudioTrack = mediaStream.getAudioTracks()[0];
  localVideoTrack = mediaStream.getVideoTracks()[0];

  let isScreenSharing = false;
  let isVideo = localVideoTrack !== undefined;
  let isAudio = localAudioTrack !== undefined;

  const roomSocket: Socket = getContext("roomSocket");
  const dispatch = createEventDispatcher();

  let remoteStreams = [];
  let peerConnections = {};
  $: console.log("PEERCONNECTIONS CHANGE!", peerConnections);

  async function joinMeeting() {
    const joinMeetingMessage: types.RoomJoinMeetingMessage = {};
    roomSocket.emit(
      "room:joinMeeting",
      joinMeetingMessage,
      (response: types.RoomJoinMeetingResponse) => {
        if ("error" in response) {
          dispatch("error", response.error.message);
        }
        console.log("response ", response);
      }
    );

    const configuration = {};
    roomSocket.on("wrtc:send-offer", async (message) => {
      console.log("send offer", message);

      const peerConnectionId = uuid();
      const signaler = {
        send: (sendMessage) => {
          console.log("emitsignal");
          roomSocket.emit("wrtc:signal", {
            ...sendMessage,
            to: message.to,
            peerConnectionId,
          });
        },
      };
      const onTrack = ({ track, streams }) => {
        console.debug("TRACK!");
        peerConnections[peerConnectionId].stream = streams[0];
      };
      const peerConnection = initPeerConnection({
        signaler,
        onTrack,
        polite: false,
      });
      peerConnections[peerConnectionId] = {
        peerConnection,
      };
      if (localAudioTrack) {
        peerConnections[peerConnectionId].audioSender = peerConnection.addTrack(
          localAudioTrack,
          mediaStream
        );
      }
      if (localVideoTrack) {
        peerConnections[peerConnectionId].videoSender = peerConnection.addTrack(
          localVideoTrack,
          mediaStream
        );
      }
      // aby se navazalo spojeni i kdyz neni zadny media track k poslani
      peerConnection.pc.createDataChannel("dummy");
    });

    // Accept Offers
    roomSocket.on("wrtc:signal", async (message) => {
      console.log("handleSignal", message);

      // bud poslu na vsechny peer connection
      // a oni si ifem rozhodnou, zda je pro ne (dle peerConnectionId)
      const { from, peerConnectionId } = message;

      let peerConnection = peerConnections[peerConnectionId]?.peerConnection;
      if (!peerConnection) {
        const onTrack = ({ track, streams }) => {
          console.debug("TRACK!");
          peerConnections[peerConnectionId].stream = streams[0];
        };
        const signaler = {
          send: (sendMessage) => {
            console.log("emitsignal");
            roomSocket.emit("wrtc:signal", {
              ...sendMessage,
              to: from,
              peerConnectionId,
            });
          },
        };
        peerConnection = initPeerConnection({
          signaler,
          onTrack,
          polite: true,
        });
        peerConnections[peerConnectionId] = {
          peerConnection,
        };
        if (localAudioTrack) {
          peerConnections[peerConnectionId].audioSender =
            peerConnection.addTrack(localAudioTrack, mediaStream);
        }
        if (localVideoTrack) {
          peerConnections[peerConnectionId].videoSender =
            peerConnection.addTrack(localVideoTrack, mediaStream);
        }
      }

      peerConnection.handleMessage(message);
    });
  }
  joinMeeting();

  onDestroy(() => {
    console.debug("destroy in progress");
    const leaveMeetingMessage: types.RoomLeaveMeetingMessage = {};
    roomSocket.emit("room:leaveMeeting", leaveMeetingMessage);
    Object.entries(peerConnections).forEach(([key, value]) => {
      value.peerConnection.close();
      value.peerConnection = null;
    });
    peerConnections = {};

    roomSocket.off("wrtc:send-offer");
    roomSocket.off("wrtc:signal");
  });

  async function toggleShareScreen() {
    if (isScreenSharing) {
      stopScreenShare();
    } else {
      startScreenShare();
    }
  }

  async function toggleMute() {
    if (isAudio) {
      localAudioTrack.enabled = false;
    } else {
      localAudioTrack.enabled = true;
    }
    isAudio = !isAudio;
  }

  async function toggleVideo() {
    if (isVideo) {
      localVideoTrack.enabled = false;
    } else {
      localVideoTrack.enabled = true;
    }
    isVideo = !isVideo;
  }

  async function startScreenShare() {
    try {
      let screenStream = await navigator.mediaDevices.getDisplayMedia({});
      let screenVidTrack: MediaStreamTrack = screenStream.getVideoTracks()[0];

      // google stop share button (not in app button)
      screenVidTrack.onended = () => {
        stopScreenShare();
      };
      // todo if video track remove, add?
      mediaStream.getVideoTracks().forEach((track) => {
        mediaStream.removeTrack(track);
      });
      mediaStream.addTrack(screenVidTrack);

      Object.entries(peerConnections).forEach(([conId, value]) => {
        if (value.videoSender) {
          // Is already some video track streaming
          console.log("VideoSender");
          value.videoSender.replaceTrack(screenVidTrack);
        } else {
          // No video track yet
          console.log("Not videoSender");
          value.videoSender = value.peerConnection.addTrack(
            screenVidTrack,
            mediaStream
          );
        }
      });
      isScreenSharing = true;
    } catch (err) {
      // screen pick cancelled
    }
  }

  async function stopScreenShare() {
    // todo if video track remove, add?
    mediaStream.getVideoTracks().forEach((track) => {
      mediaStream.removeTrack(track);
    });
    if (localVideoTrack) {
      mediaStream.addTrack(localVideoTrack);
    }

    Object.entries(peerConnections).forEach(([conId, value]) => {
      if (value.videoSender) {
        // Is already some video track streaming
        console.log("VideoSender");
        value.videoSender.replaceTrack(localVideoTrack);
      } else {
        // No video track yet
        console.log("Not videoSender");
        value.videoSender = value.peerConnection.addTrack(
          localVideoTrack,
          mediaStream
        );
      }
    });
    isScreenSharing = false;
  }
</script>

<MeetingMember stream={mediaStream} />
<button class="screenshare" on:click={toggleShareScreen}>
  {isScreenSharing ? `Stop sharing` : `Share screen`}
</button>
{#if localVideoTrack && !isScreenSharing}
  <button on:click={toggleVideo}>
    {isVideo ? `Pause video` : `Resume video`}
  </button>
{/if}
{#if localAudioTrack}
  <button on:click={toggleMute}>
    {isAudio ? `Mute` : `Unmute`}
  </button>
{/if}

{#each Object.entries(peerConnections) as [connectionId, peerConnection] (connectionId)}
  {#if peerConnection.stream}
    <MeetingMember stream={peerConnection.stream} />
  {:else}
    Member not streaming anything
  {/if}
{/each}
