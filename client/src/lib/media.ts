

export async function getConnectedDevices(kind: MediaDeviceKind) {
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices.filter(device => device.kind === kind)
}


