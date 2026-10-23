/**
 * Listens to the song preview and tells the hero when a beat lands. Bass energy is
 * compared with its own recent average, so loud and quiet songs both find their kicks.
 */
type Listener = (strength: number) => void;

export const beat = { level: 0, playing: false };
const listeners = new Set<Listener>();
export const onBeat = (fn: Listener) => listeners.add(fn);

let ctx: AudioContext | null = null;

export function listen(audio: HTMLAudioElement) {
  audio.crossOrigin = 'anonymous';
  let analyser: AnalyserNode | null = null;
  let data: Uint8Array<ArrayBuffer>;
  let avg = 0, lastHit = 0;

  const start = () => {
    if (!ctx) ctx = new AudioContext();
    if (!analyser) {
      const source = ctx.createMediaElementSource(audio);
      analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.6;
      source.connect(analyser);
      analyser.connect(ctx.destination);
      data = new Uint8Array(analyser.frequencyBinCount);
    }
    void ctx.resume();
    beat.playing = true;
    tick();
  };

  const tick = () => {
    if (!beat.playing || !analyser) { beat.level = 0; return; }
    analyser.getByteFrequencyData(data);
    // The lowest bins hold the kick drum and bass.
    let bass = 0;
    for (let i = 1; i < 12; i++) bass += data[i];
    bass /= 11 * 255;
    avg = avg * 0.94 + bass * 0.06;
    beat.level = bass;
    const now = performance.now();
    if (bass > avg * 1.22 && bass > 0.35 && now - lastHit > 240) {
      lastHit = now;
      listeners.forEach((fn) => fn(Math.min(1, (bass - avg) * 4 + 0.5)));
    }
    requestAnimationFrame(tick);
  };

  audio.addEventListener('play', start);
  const stop = () => { beat.playing = false; };
  audio.addEventListener('pause', stop);
  audio.addEventListener('ended', stop);
}
