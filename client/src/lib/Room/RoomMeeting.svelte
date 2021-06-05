<script lang="ts">
  /**
   * Room meeting component
   * - Main meeting component
   * - joins meeting
   * - handles wrtc communication
   * - handles actions like screen share, mute, pause video
   * - renders meeting UI
   */
  import { getContext, createEventDispatcher, onDestroy } from "svelte";
  import type * as types from "semiaserver/dist/types";
  import type { Socket } from "socket.io-client";
  import MeetingMember from "./MeetingMember.svelte";
  import { initPeerConnection, PeerConnectionDecorator } from "../shared/webrtc";

  export let mediaStream: MediaStream;

  let localVideoTrack: MediaStreamTrack | undefined;
  let localAudioTrack: MediaStreamTrack | undefined;
  localAudioTrack = mediaStream.getAudioTracks()[0];
  localVideoTrack = mediaStream.getVideoTracks()[0];

  // whether scree sharing is active
  let isScreenSharing = false;
  // whether stream contains local video
  let isVideo = localVideoTrack !== undefined;
  // whether stream containt local audio
  let isAudio = localAudioTrack !== undefined;

  $: localStreamHasTracks =
    !!localVideoTrack || !!localAudioTrack || !!isScreenSharing;

  const roomSocket: Socket = getContext("roomSocket");
  const dispatch = createEventDispatcher();

  let connections: Connections = {};

  async function joinMeeting() {
    // tell server we want join room meeting
    joinRoomMeeting();
    // Register handler that sends wrtc offers to new members
    // on prompt from server
    sendWrtcOfferOnServerPrompt();
    // Register handler that process wrtc signals
    processIncomingWrtcSignals();
  }
  joinMeeting(); // trigger meeting join

  function joinRoomMeeting() {
    const joinMeetingMessage: types.RoomJoinMeetingMessage = {};
    roomSocket.emit(
      "room:joinMeeting",
      joinMeetingMessage,
      (response: types.RoomJoinMeetingResponse) => {
        if ("error" in response) {
          dispatch("error", response.error.message);
        }
      }
    );
  }

  // Server prompts me to make new peer connection with a new room member
  // On event when new member joins room meeting
  function sendWrtcOfferOnServerPrompt() {
    roomSocket.on(
      "wrtc:send-offer",
      async (message: types.WrtcSendOfferMessage) => {
        const { to, connectionId } = message;
        const connection = createConnection({
          polite: false,
          to,
          connectionId,
        });
        // force peer connection to be established
        // even if there isn't any local track!
        // Otherwise such user wouldn't see and hear other peer,
        // because peer connection starts establishing when addTrack is called,
        // and we don't have any tracks therefore connection wouldn't be established at all
        // we use this hack here and create data channel, which also trigger establishing
        connection.peerConnection.wrapped.createDataChannel("dummy");
      }
    );
  }

  function processIncomingWrtcSignals() {
    roomSocket.on("wrtc:signal", async (message) => {
      const { from, connectionId } = message;

      let peerConnection = connections[connectionId]?.peerConnection;
      // When i'm an answerer, I don't have PeerConnection object yet
      // so I create new one
      if (!peerConnection) {
        const connection = createConnection({
          polite: true,
          to: from,
          connectionId,
        });
        peerConnection = connection.peerConnection;
      }

      peerConnection.handleSignalMessage(message);
    });
  }

  
  /**
   * - Initializes connection to other peer
   * - Adds local tracks to connection
   * - Registers connection state change listener
   * - Registers new remote track listener
   * @param params
   */
  function createConnection(params: {
    polite: boolean;
    connectionId: ConnectionId;
    to: SocketId;
  }): Connection {
    const { polite, connectionId, to } = params;

    const signaler = createSignaler({ to, connectionId });
    const peerConnection = initPeerConnection({
      signaler,
      polite,
    });
    let connection: Connection = {
      peerConnection,
      connectionId,
    };
    const onStateChange = createOnStateChangeHandler({ connection });
    const onTrack = createOnTrackHandler({ connection });
    peerConnection.wrapped.addEventListener("track", onTrack);
    peerConnection.wrapped.addEventListener(
      "connectionstatechange",
      onStateChange
    );
    peerConnection.wrapped.addEventListener(
      "iceconnectionstatechange",
      onStateChange
    );

    if (localAudioTrack) {
      connection.audioSender = peerConnection.wrapped.addTrack(
        localAudioTrack,
        mediaStream
      );
    }
    if (localVideoTrack) {
      connection.videoSender = peerConnection.wrapped.addTrack(
        localVideoTrack,
        mediaStream
      );
    }

    connections[connectionId] = connection;
    return connection;
  }

  // Creates function that is used by PeerConnection to send signals
  function createSignaler(params: {
    to: SocketId;
    connectionId: ConnectionId;
  }) {
    const { to, connectionId } = params;
    return {
      send: (sendMessage) => {
        roomSocket.emit("wrtc:signal", {
          ...sendMessage,
          to,
          connectionId,
        });
      },
    };
  }

  // Creates function that is triggered on remote track added
  function createOnTrackHandler(params: { connection: Connection }) {
    const { connection } = params;
    return ({ streams }) => {
      connections[connection.connectionId].stream = streams[0];
    };
  }

  // Handles client failed connection (removes him from meeting UI)
  function createOnStateChangeHandler(params: { connection: Connection }) {
    const { connection } = params;
    return (event) => {;
      console.log(
        'state change',
        connection.peerConnection.wrapped.connectionState,
        connection.peerConnection.wrapped.iceConnectionState,
        connection.peerConnection.wrapped.iceGatheringState
        );
      // destroy peer connection object on connection end
      if (
        connection.peerConnection.wrapped.connectionState === "failed" // chrome
        || connection.peerConnection.wrapped.iceConnectionState === "failed" // firefox
      ) {
        delete connections[connection.connectionId];
        connections = connections;
      }
    };
  }

  onDestroy(() => {
    // kill streams, peer connections, cleanup
    // mandatory to be able to reinitiate connection on rerender (rejoin)
    const leaveMeetingMessage: types.RoomLeaveMeetingMessage = {};
    roomSocket.emit("room:leaveMeeting", leaveMeetingMessage);
    mediaStream.getTracks().forEach(track => track.stop());
    Object.entries(connections).forEach(([key, value]) => {
      value.peerConnection.wrapped.close();
      console.log("closed peer connection");
    });
    connections = {};

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
      console.log("addtrack");

      mediaStream.addTrack(screenVidTrack);

      Object.entries(connections).forEach(([conId, value]) => {
        if (value.videoSender) {
          // Is already some video track streaming
          console.log("VideoSender");
          value.videoSender.replaceTrack(screenVidTrack);
        } else {
          // No video track yet
          console.log("Not videoSender");
          value.videoSender = value.peerConnection.wrapped.addTrack(
            screenVidTrack,
            mediaStream
          );
        }
      });
      isScreenSharing = true;
    } catch (err) {
      // eg. screen pick in browser promp cancelled with storno button
      console.error(err);
    }
  }

  async function stopScreenShare() {
    mediaStream.getVideoTracks().forEach((track) => {
      track.stop();
      mediaStream.removeTrack(track);
    });
    if (localVideoTrack) {
      mediaStream.addTrack(localVideoTrack);
    }

    Object.entries(connections).forEach(([conId, value]) => {
      if (value.videoSender) {
        // Is already some video track streaming
        console.log("VideoSender");
        value.videoSender.replaceTrack(localVideoTrack);
      } else {
        // No video track yet
        console.log("Not videoSender");
        value.videoSender = value.peerConnection.wrapped.addTrack(
          localVideoTrack,
          mediaStream
        );
      }
    });
    isScreenSharing = false;
  }

  interface Connection {
    connectionId: ConnectionId;
    peerConnection: PeerConnectionDecorator;
    stream?: MediaStream;
    // objects returned upon track added to RTCPeerConnection
    // - allowing replaceTrack (eg. with screen share)
    videoSender?: RTCRtpSender;
    audioSender?: RTCRtpSender;
  }
  interface Connections {
    [connectionId: string]: Connection;
  }
  // socketio socket id
  type SocketId = string;
  // id identifying single peer connection
  type ConnectionId = string;
</script>

<MeetingMember streamHasTracks={localStreamHasTracks} stream={mediaStream} />
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

{#each Object.entries(connections) as [connectionId, connection] (connectionId)}
  {#if connection.stream}
    <MeetingMember stream={connection.stream} />
  {:else}
    <div>
      Not streaming member. 
    </div>
  {/if}
{/each}
