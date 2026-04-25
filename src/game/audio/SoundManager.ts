export type SoundKey = 'button' | 'craft' | 'collect' | 'equip' | 'menu' | 'tab' | 'race' | 'repair' | 'refuel' | 'sell';

type AudioContextConstructor = typeof AudioContext;

export class SoundManager {
  private static context: AudioContext | null = null;

  static play(sound: SoundKey): void {
    const context = this.getContext();

    if (!context) {
      return;
    }

    if (context.state === 'suspended') {
      void context.resume();
    }

    const now = context.currentTime;

    if (sound === 'craft') {
      this.playWoodTap(context, now, 150, 0.09, 0.36);
      this.playWoodTap(context, now + 0.055, 92, 0.08, 0.24);
      return;
    }

    if (sound === 'collect') {
      this.playScrapCollect(context, now);
      return;
    }

    if (sound === 'equip') {
      this.playWoodTap(context, now, 82, 0.07, 0.28);
      this.playTone(context, now + 0.035, 138, 0.06, 0.12);
      return;
    }

    if (sound === 'menu') {
      this.playWoodTap(context, now, 104, 0.045, 0.18);
      this.playTone(context, now + 0.032, 156, 0.05, 0.08);
      return;
    }

    if (sound === 'tab') {
      this.playWoodTap(context, now, 170, 0.035, 0.13);
      return;
    }

    if (sound === 'race') {
      this.playWoodTap(context, now, 76, 0.08, 0.28);
      this.playWoodTap(context, now + 0.06, 118, 0.07, 0.2);
      this.playTone(context, now + 0.12, 196, 0.07, 0.08);
      return;
    }

    if (sound === 'repair') {
      this.playWoodTap(context, now, 96, 0.06, 0.22);
      this.playWoodTap(context, now + 0.075, 72, 0.08, 0.2);
      this.playDryMetal(context, now + 0.03, 0.05);
      return;
    }

    if (sound === 'refuel') {
      this.playTone(context, now, 88, 0.16, 0.12, 'triangle');
      this.playTone(context, now + 0.08, 132, 0.12, 0.08, 'sine');
      return;
    }

    if (sound === 'sell') {
      this.playWoodTap(context, now, 150, 0.04, 0.16);
      this.playWoodTap(context, now + 0.045, 210, 0.035, 0.12);
      this.playTone(context, now + 0.08, 330, 0.05, 0.06);
      return;
    }

    this.playWoodTap(context, now, 130, 0.035, 0.12);
  }

  private static getContext(): AudioContext | null {
    if (this.context) {
      return this.context;
    }

    const AudioContextClass = this.getAudioContextClass();

    if (!AudioContextClass) {
      return null;
    }

    this.context = new AudioContextClass();
    return this.context;
  }

  private static getAudioContextClass(): AudioContextConstructor | null {
    if (typeof AudioContext !== 'undefined') {
      return AudioContext;
    }

    const webkitAudioContext = (globalThis as { webkitAudioContext?: AudioContextConstructor }).webkitAudioContext;

    return webkitAudioContext ?? null;
  }

  private static playScrapCollect(context: AudioContext, startAt: number): void {
    this.playWoodTap(context, startAt, 96, 0.12, 0.26);
    this.playWoodTap(context, startAt + 0.16, 132, 0.1, 0.2);
    this.playWoodTap(context, startAt + 0.36, 82, 0.13, 0.23);
    this.playWoodTap(context, startAt + 0.62, 148, 0.09, 0.16);
    this.playWoodTap(context, startAt + 0.86, 104, 0.14, 0.2);
  }

  private static playDryMetal(context: AudioContext, startAt: number, volume: number): void {
    const noise = this.createNoise(context, 0.035);
    const filter = context.createBiquadFilter();
    const gain = context.createGain();

    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1800, startAt);
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.035);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(context.destination);
    noise.start(startAt);
    noise.stop(startAt + 0.035);
  }

  private static playWoodTap(context: AudioContext, startAt: number, frequency: number, duration: number, volume: number): void {
    const oscillator = context.createOscillator();
    const noise = this.createNoise(context, duration);
    const filter = context.createBiquadFilter();
    const gain = context.createGain();

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(frequency, startAt);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(40, frequency * 0.58), startAt + duration);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(520, startAt);
    filter.Q.setValueAtTime(2.2, startAt);

    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

    oscillator.connect(filter);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(context.destination);

    oscillator.start(startAt);
    noise.start(startAt);
    oscillator.stop(startAt + duration);
    noise.stop(startAt + duration);
  }

  private static playTone(context: AudioContext, startAt: number, frequency: number, duration: number, volume: number, type: OscillatorType = 'sine'): void {
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startAt);
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(startAt);
    oscillator.stop(startAt + duration);
  }

  private static createNoise(context: AudioContext, duration: number): AudioBufferSourceNode {
    const length = Math.max(1, Math.floor(context.sampleRate * duration));
    const buffer = context.createBuffer(1, length, context.sampleRate);
    const data = buffer.getChannelData(0);

    for (let index = 0; index < length; index += 1) {
      data[index] = (Math.random() * 2 - 1) * (1 - index / length);
    }

    const source = context.createBufferSource();
    source.buffer = buffer;
    return source;
  }
}
