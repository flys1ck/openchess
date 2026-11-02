import { useSettings } from "@stores/useSettings";
import { Howl } from "howler";

type AudioName = "move" | "capture" | "check";

const sounds = new Map<AudioName, Howl>();

export async function playAudio(name: AudioName) {
  const volume = useSettings().soundVolume[0] / 100;
  if (volume === 0) return;

  let sound = sounds.get(name);
  if (!sound) {
    const soundModule = await import(`../assets/audio/${name}.mp3`);
    sound = new Howl({ src: [soundModule.default] });
    sounds.set(name, sound);
  }

  sound.volume(volume);
  sound.play();
}
