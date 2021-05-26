<script lang="ts">
  import {getContext, createEventDispatcher, onDestroy} from 'svelte';
  import type * as types from 'semiatypes';
  import type { Socket } from 'socket.io-client';
  import {v4 as uuid} from 'uuid';
  import MeetingMember from './MeetingMember.svelte';

  export let roomId: string;
  export let mediaStream: MediaStream;

  let localVideoTrack;
  let localAudioTrack;
  $: if (mediaStream) {
    localAudioTrack = mediaStream.getAudioTracks()[0];
    localVideoTrack = mediaStream.getVideoTracks()[0];
    console.log(localAudioTrack, localVideoTrack);
  }


  const roomSocket: Socket =  getContext('roomSocket');
  const dispatch = createEventDispatcher();

  let remoteStreams = [];
  let peerConnections = {};
  $: console.log('PEERCONNECTIONS CHANGE!', peerConnections);
  
  
  async function joinMeeting() {
    const joinMeetingMessage: types.RoomJoinMeetingMessage = {
      roomId
    }
    roomSocket.emit("room:joinMeeting", joinMeetingMessage, (response: types.RoomJoinMeetingResponse) => {
      if ('error' in response) {
        dispatch('error', response.error.message);
      }
      console.log('response ', response);
    });
    

    const configuration = {};
    roomSocket.on("wrtc:send-offer", async (message) => {
      console.debug("wrtc:send-offer");
      const peerConnection = new RTCPeerConnection(configuration);
      const connectionId = uuid();
      peerConnections[connectionId] = {
        peerConnection: peerConnection
      }
      
      // obdobny jako dole u prijimani
      peerConnection.addEventListener("icecandidate", (event) => {
        console.log(`icecandidate`);
        if (event.candidate) {
          console.debug("emit wrtc:send-ice-candidate");
          roomSocket.emit("wrtc:send-ice-candidate", {
            to: message.to,
            role: "offeror",
            candidate: event.candidate,
          });
        }
      });
      // stejne jako dole u prijimani
      roomSocket.on("wrtc:offeror:receive-ice-candidate", async (message) => {
        console.debug("wrtc:offeror:receive-ice-candidate");
        try {
          await peerConnection.addIceCandidate(message.candidate);
        } catch (e) {
          console.error("Error adding received ice candidate", e);
        }
      });

      peerConnection.addEventListener("track", async (event) => {
        console.log("TRACK!!!", event);
        const remoteStream = new MediaStream();
        remoteStream.addTrack(event.track);
        // const remoteVideo = document.querySelector("#remoteVideo");
        // remoteVideo.srcObject = remoteStream;
        peerConnections[connectionId].stream = remoteStream;
        // peerConnections = peerConnections;
      });
      if (localVideoTrack) {
        var videoSender = peerConnection.addTrack(localVideoTrack, mediaStream);
        peerConnections[connectionId].videoSender = videoSender;
      }
      if (localAudioTrack) {
        var audioSender = peerConnection.addTrack(localAudioTrack, mediaStream);
        peerConnections[connectionId].audioSender = audioSender;
      }
      

      peerConnection.addEventListener("connectionstatechange", (event) => {
        console.log(`connection state change`);
        if (peerConnection.connectionState === "connected") {
          console.log("Connected! Hooray. :-)");
        } else if (peerConnection.connectionState === "closed") {
          delete peerConnections[connectionId];
        }
      });

      roomSocket.once("wrtc:receive-answer", async (message) => {
        // tady je problem, ze tohle se deje na kazdou send-offer
        // takze pak mam x listeneru a spousti se i treba
        // listener prvniho peerConnection, kterej uz je ale connected
        // asi neni jine reseni, nez si generovat urcijici id,
        // a nebo tady hned tento listener znicit
        console.debug("wrtc:receive-answer");
        console.debug({myid: roomSocket.id}, message.from);
        const remoteDesc = new RTCSessionDescription(message.answer);
        const peerConnection = peerConnections[message.connectionId].peerConnection;        
        await peerConnection.setRemoteDescription(remoteDesc);
      });

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      console.debug("emit wrtc:send-offer");
      roomSocket.emit("wrtc:send-offer", {
        to: message.to,
        offer,
        connectionId,
      });
      // onnegotiationneeded potreba napr. pri pridani tracku
      // kdyz nebyl nastaven prin inicializaci.
      // peerConnection.onnegotiationneeded = e => peerConnection.createOffer()
      // .then(offer => peerConnection.setLocalDescription(offer))
      // .then(() => {
      //   console.debug("emit wrtc:send-offer");
      //   roomSocket.emit("wrtc:send-offer", {
      //     to: message.to,
      //     offer: peerConnection.localDescription,
      //     connectionId,
      //   });
      // });
    });

    // Accept Offers
    roomSocket.once("wrtc:receive-offer", async (message) => {
      console.debug("wrtc:receive-offer");
      const peerConnection = new RTCPeerConnection(configuration);
      const connectionId = message.connectionId; 
      peerConnections[connectionId] = {
        peerConnection: peerConnection
      }
      
      peerConnection.addEventListener("icecandidate", (event) => {
        console.debug(`icecandidate`);
        if (event.candidate) {
          console.debug("emit wrtc:send-ice-candidate");
          roomSocket.emit("wrtc:send-ice-candidate", {
            to: message.from,
            role: "answerer",
            candidate: event.candidate,
          });
        }
      });
      roomSocket.on("wrtc:answerer:receive-ice-candidate", async (message) => {
        console.debug("wrtc:answerer:receive-ice-candidate");
        try {
          await peerConnection.addIceCandidate(message.candidate);
        } catch (e) {
          console.error("Error adding received ice candidate", e);
        }
      });

      peerConnection.addEventListener("track", async (event) => {
        console.debug("TRACK!!!", event);
        const remoteStream = new MediaStream();
        remoteStream.addTrack(event.track);
        // const remoteVideo = document.querySelector("#remoteVideo");
        // remoteVideo.srcObject = remoteStream;
        peerConnections[connectionId].stream = remoteStream;
        // peerConnections = peerConnections;
      });
      if (localVideoTrack) {
        var videoSender = peerConnection.addTrack(localVideoTrack, mediaStream);
        peerConnections[connectionId].videoSender = videoSender;
      }
      if (localAudioTrack) {
        var audioSender = peerConnection.addTrack(localAudioTrack, mediaStream);
        peerConnections[connectionId].audioSender = audioSender;
      }
      
      
      peerConnection.addEventListener("connectionstatechange", (event) => {
        console.log(`connection state change`);
        if (peerConnection.connectionState === "connected") {
          console.log("Connected! Hooray. :-)");
        } else if (peerConnection.connectionState === "closed") {
          console.log('delete peerconnection');
          delete peerConnections[connectionId];
        }
      });

      peerConnection.setRemoteDescription(
        new RTCSessionDescription(message.offer)
      );
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      console.debug("emit wrtc:send-answer");
      roomSocket.emit("wrtc:send-answer", {
        to: message.from,
        answer,
        connectionId,
      });
      // peerConnection.onnegotiationneeded = e => alert('negotiation needed!');
      // peerConnection.onnegotiationneeded = e => peerConnection.createOffer()
      // .then(offer => peerConnection.setLocalDescription(offer))
      // .then(() => {
      //   console.debug("emit wrtc:send-offer");
      //   roomSocket.emit("wrtc:send-offer", {
      //     to: message.from,
      //     offer: peerConnection.localDescription,
      //     connectionId,
      //   });
      // });

    });
  }
  joinMeeting();

  onDestroy(() => {
    console.debug('destroy in progress');
    const leaveMeetingMessage: types.RoomLeaveMeetingMessage = {
      roomId
    }
    roomSocket.emit('room:leaveMeeting', leaveMeetingMessage);
    Object.entries(peerConnections).forEach(([key, value]) => {
      value.peerConnection.close();
      value.peerConnection = null;      
    });
    peerConnections = {};

    roomSocket.off("wrtc:send-offer");
    roomSocket.off("wrtc:offeror:receive-ice-candidate");
    roomSocket.off("wrtc:receive-offer");
    roomSocket.off("wrtc:answerer:receive-ice-candidate");
    roomSocket.off("wrtc:receive-answer");
  });

  async function shareScreen() {
    let screenStream = await navigator.mediaDevices.getDisplayMedia({});
    let screenVidTrack = screenStream.getVideoTracks()[0];
    console.log('shareScreen', peerConnections);
    
    // todo if video track remove, add?
    mediaStream.addTrack(screenVidTrack);

    Object.entries(peerConnections).forEach(([conId, value]) => {
      if (value.videoSender) {
        console.log('VideoSender');
        value.videoSender.replaceTrack(screenVidTrack);
      } else {
        console.log('Not videoSender');
        value.peerConnection.addTrack(screenVidTrack, mediaStream);
      }
    });
  }
</script>

<MeetingMember stream={mediaStream} />
<button on:click={shareScreen}>share screen</button>
{#each Object.entries(peerConnections) as [connectionId, peerConnection] (connectionId)}
  {#if peerConnection.stream}
    <MeetingMember stream={peerConnection.stream} />
  {/if}
{/each}
