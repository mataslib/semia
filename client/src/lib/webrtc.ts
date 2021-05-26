// pattern from
// https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Perfect_negotiation
// perfect negotiation prividing ability to
// crud streams (renegotiation)

const config = {
  // iceServers: [{ urls: "stun:stun.mystunserver.tld" }]
};

interface Signaler {
  send: (message: any) => void,

}

class MyPeerConnection {

  private onmessage: Function;
  public pc: RTCPeerConnection;

  constructor( params ) {
    const { signaler, onTrack, polite } = params;
    this.pc = new RTCPeerConnection(config);
    const pc = this.pc;

    

    // stream z venku
    // async function start() {
    //   try {
    //     const stream = await navigator.mediaDevices.getUserMedia(constraints);

    //     for (const track of stream.getTracks()) {
    //       pc.addTrack(track, stream);
    //     }
    //     selfVideo.srcObject = stream;
    //   } catch (err) {
    //     console.error(err);
    //   }
    // }

    // handler z venku
    pc.ontrack = onTrack;
    // pc.ontrack = ({ track, streams }) => {
    //   // We add an unmute event handler to the track, 
    //   // because the track will become unmuted
    //   // once it starts receiving packets.
    //   track.onunmute = () => {
    //     if (remoteVideo.srcObject) {
    //       return;
    //     }
    //     remoteVideo.srcObject = streams[0];
    //   };
    // };

    let makingOffer = false;
    pc.onnegotiationneeded = async () => {
      try {
        makingOffer = true;
        // vytvori offer
        await pc.setLocalDescription();
        signaler.send({ description: pc.localDescription });
      } catch (err) {
        console.error(err);
      } finally {
        makingOffer = false;
      }
    };

    pc.onicecandidate = ({ candidate }) => {
      console.log('ice candidate send');
      signaler.send({ candidate })
    };
    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === "failed") {
        pc.restartIce();
      }
    };

    pc.addEventListener("connectionstatechange", (event) => {
      console.log(`connection state change`);
      if (pc.connectionState === "connected") {
        console.log("Connected! Hooray. :-)");
      } else if (pc.connectionState === "closed") {
        // delete peerConnections[connectionId];
      }
    });

    let ignoreOffer = false;
    this.onmessage = async ({ description, candidate }) => {
      try {
        // offer nebo answer
        if (description) {
          console.log('description received');

          const offerCollision = (description.type == "offer") &&
            (makingOffer || pc.signalingState != "stable");

          ignoreOffer = !polite && offerCollision;
          if (ignoreOffer) {
            return;
          }

          await pc.setRemoteDescription(description);
          if (description.type == "offer") {
            await pc.setLocalDescription();
            signaler.send({
              description: pc.localDescription
            });
          }
        }
        // ice candidate
        else if (candidate) {
          console.log('ice candidate received');
          
          try {
            await pc.addIceCandidate(candidate);
          } catch (err) {
            if (!ignoreOffer) {
              throw err;
            }
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
  }

  public handleMessage(message) {
    this.onmessage(message);
  }

  public close() {
    this.pc.close();
  }

  // public start(stream: MediaStream) {
  //   try {
  //     for (const track of stream.getTracks()) {
  //       console.log('addtrack');
        
  //       this.pc.addTrack(track, stream);
  //     }
  //   } catch (err) {
  //     console.error(err);
  //   }
  // }

  public addTrack(track: MediaStreamTrack, stream: MediaStream): RTCRtpSender {
    try {
      console.log('add track');
      return this.pc.addTrack(track, stream)
    } catch (err) {
      console.error(err);
    }
  }
}

export function initPeerConnection({signaler, onTrack, polite}) {
  const pc = new MyPeerConnection({signaler, onTrack, polite});
  return pc;
}

