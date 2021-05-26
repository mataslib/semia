
import { getConnectedDevices } from "./media";
import { Writable, writable } from "svelte/store";

export interface DeviceStore extends Writable<MediaDeviceInfo[]>
{}

async function createDeviceStore(kind: MediaDeviceKind): Promise<DeviceStore> {
  const getDevices = () => getConnectedDevices(kind);
  
  const updateDevices = (set) => {
    getDevices().then(devices => set(devices));
  }

  const devices = await getDevices();
  const store = writable<MediaDeviceInfo[]>(devices);

  navigator.mediaDevices.ondevicechange = e => {
    updateDevices(store.set);
  };

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