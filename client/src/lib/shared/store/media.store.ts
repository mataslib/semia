
/**
 * This file contains stores holding media devices info
 */
import { getConnectedDevices, triggerPermissionPrompt } from "../media";
import { Writable, writable } from "svelte/store";

export interface DeviceStore extends Writable<MediaDeviceInfo[]>
{}

async function createDeviceStore(kind: MediaDeviceKind): Promise<DeviceStore> {
  const getDevices = () => getConnectedDevices(kind);
  
  const updateDevices = (set) => {
    getDevices().then(devices => set(devices));
  }

  if (kind === "audioinput" || kind === "videoinput") {
    // Important! Permissions (triggerPermissionPrompt) should be given first,
    // otherwise each device's label is empty in firefox
    // and even device ids may be empty in chrome!
    await triggerPermissionPrompt({
      video: kind === "videoinput",
      audio: kind === "audioinput" 
    });
  }


  const devices = await getDevices();
  const store = writable<MediaDeviceInfo[]>(devices);

  navigator.mediaDevices.addEventListener('devicechange', e => {
    updateDevices(store.set);
  });

  return store;
}


let stores: {[kind in MediaDeviceKind]: DeviceStore}|{} = {};
export async function getDeviceStore(kind: MediaDeviceKind)
{
  if (stores[kind]) {
    return stores[kind];
  }

  const newStore = await createDeviceStore(kind);
  stores[kind] = newStore;
  return stores[kind];
}
