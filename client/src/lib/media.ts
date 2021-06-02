
/**
 * Important! Permissions (triggerPermissionPrompt) should be given first,
 * otherwise each device's label is empty in firefox
 * and even device ids are empty in chrome!
 *
 * @param kind 
 * @returns 
 */
export async function getConnectedDevices(kind: MediaDeviceKind) {
  let devices = await navigator.mediaDevices.enumerateDevices();
  console.log(devices);
  
  return devices.filter(device => device.kind === kind)
}

export async function triggerPermissionPrompt() {
  const mediaStream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true,
  });
  // we immediately destroy stream after prompt
  mediaStream.getTracks().forEach(track => track.stop());
}
