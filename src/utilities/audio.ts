import { Howl } from "howler";

type AudioName = "move" | "capture" | "check";

export async function playAudio(name: AudioName, volume: number) {
  const soundModule = await import(`../assets/audio/${name}.mp3`);

  const sound = new Howl({
    src: [soundModule.default],
  });

  sound.volume(volume);
  sound.play();
}
