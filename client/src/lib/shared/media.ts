// Contains browser media abstractions

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
  
  return devices.filter(device => device.kind === kind)
}

/**
 * Prompts user permission for media devices by creating new stream
 */
export async function triggerPermissionPrompt(kinds: TriggerPermissionPromptKinds) {
  const mediaStream = await navigator.mediaDevices.getUserMedia(kinds);
  // we immediately destroy stream after prompt
  mediaStream.getTracks().forEach(track => track.stop());
}

export type TriggerPermissionPromptKinds = {audio?: boolean, video?: boolean};