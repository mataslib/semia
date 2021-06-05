// WebRTC connection abstraction
//
// "Perfect negotiation" pattern from
// https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Perfect_negotiation
// providing ability to crud stream tracks (renegotiation)

const config = {
  // iceServers needed in case when users are not in same network (behind NAT, firewalls...)
  // iceServers: [{ urls: "stun:stun.mystunserver.tld" }]
};

export class PeerConnectionDecorator {

  private onmessage: Function;
  public wrapped: RTCPeerConnection;

  constructor( params: Params ) {
    const { signaler, polite } = params;
    this.wrapped = new RTCPeerConnection(config);
    const pc = this.wrapped;

    let makingOffer = false;
    // renegotiation needed (changed tracks, ...)
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
      signaler.send({ candidate })
    };

    let ignoreOffer = false;
    this.onmessage = async (signalMessage) => {
      const { description, candidate } = signalMessage;

      try {
        // offer nebo answer
        if (description) {
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

  /**
   * Exposed method that must be called when new signal message arives
   * @param message 
   */
  public handleSignalMessage(message) {
    this.onmessage(message);
  }
}

export function initPeerConnection(params: Params) {
  const pc = new PeerConnectionDecorator(params);
  return pc;
}


interface Signaler {
  send: (message: any) => void,
}

interface Params {
  signaler: Signaler,
  polite: boolean,
}
