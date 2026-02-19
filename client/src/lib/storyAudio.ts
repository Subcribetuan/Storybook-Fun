// Web Audio API ambient sound engine for storybook categories
// Generates calming audio procedurally — no audio files needed

const MUSIC_ENABLED_KEY = "wondertales-music-enabled";
const MUSIC_VOLUME_KEY = "wondertales-music-volume";

export function getMusicPreference(): { enabled: boolean; volume: number } {
  const enabled = localStorage.getItem(MUSIC_ENABLED_KEY) !== "false";
  const vol = parseFloat(localStorage.getItem(MUSIC_VOLUME_KEY) || "0.4");
  return { enabled, volume: isNaN(vol) ? 0.4 : Math.max(0, Math.min(1, vol)) };
}

export function saveMusicPreference(enabled: boolean, volume: number): void {
  localStorage.setItem(MUSIC_ENABLED_KEY, String(enabled));
  localStorage.setItem(MUSIC_VOLUME_KEY, String(volume));
}

interface OscConfig {
  type: OscillatorType;
  frequency: number;
  detune: number;
  gain: number;
}

interface SoundProfile {
  oscillators: OscConfig[];
  lfo: { frequency: number; depth: number };
  noise: { type: "white" | "pink" | "brown"; filterFreq: number; filterQ: number; gain: number } | null;
  masterGain: number;
}

const PROFILES: Record<string, SoundProfile> = {
  bedtime: {
    oscillators: [
      { type: "sine", frequency: 130.81, detune: 0, gain: 0.12 },   // C3
      { type: "sine", frequency: 164.81, detune: -5, gain: 0.08 },  // E3 slightly detuned for warmth
    ],
    lfo: { frequency: 0.06, depth: 0.3 },
    noise: { type: "brown", filterFreq: 200, filterQ: 0.5, gain: 0.15 },
    masterGain: 0.7,
  },
  breathing: {
    oscillators: [
      { type: "sine", frequency: 110, detune: 0, gain: 0.1 },       // A2
      { type: "sine", frequency: 165, detune: 3, gain: 0.05 },      // E3 faint fifth
    ],
    lfo: { frequency: 0.03, depth: 0.4 },  // ultra-slow, breath-like
    noise: { type: "brown", filterFreq: 100, filterQ: 0.3, gain: 0.1 },
    masterGain: 0.6,
  },
  swimming: {
    oscillators: [
      { type: "sine", frequency: 146.83, detune: 0, gain: 0.1 },    // D3
      { type: "triangle", frequency: 220, detune: 7, gain: 0.06 },  // A3
    ],
    lfo: { frequency: 0.15, depth: 0.35 }, // wave-like motion
    noise: { type: "white", filterFreq: 400, filterQ: 0.8, gain: 0.18 },
    masterGain: 0.65,
  },
  adventure: {
    oscillators: [
      { type: "triangle", frequency: 261.63, detune: 0, gain: 0.08 }, // C4
      { type: "triangle", frequency: 196, detune: 5, gain: 0.06 },    // G3
    ],
    lfo: { frequency: 0.1, depth: 0.2 },
    noise: null,
    masterGain: 0.5,
  },
  "paw-patrol": {
    oscillators: [
      { type: "triangle", frequency: 164.81, detune: 0, gain: 0.09 }, // E3
      { type: "sine", frequency: 196, detune: -3, gain: 0.06 },       // G3
    ],
    lfo: { frequency: 0.08, depth: 0.25 },
    noise: { type: "pink", filterFreq: 300, filterQ: 0.5, gain: 0.1 },
    masterGain: 0.55,
  },
  feelings: {
    oscillators: [
      { type: "sine", frequency: 174.61, detune: 0, gain: 0.1 },    // F3
      { type: "sine", frequency: 220, detune: -4, gain: 0.07 },     // A3
    ],
    lfo: { frequency: 0.07, depth: 0.3 },
    noise: { type: "brown", filterFreq: 150, filterQ: 0.4, gain: 0.12 },
    masterGain: 0.6,
  },
};

const DEFAULT_PROFILE = PROFILES.bedtime;

function generateNoiseBuffer(ctx: AudioContext, type: "white" | "pink" | "brown"): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = sampleRate * 4; // 4-second loop
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);

  if (type === "white") {
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  } else if (type === "brown") {
    let last = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    }
  } else {
    // Pink noise — simplified Voss algorithm
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
  }

  return buffer;
}

export class StoryAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGainNode: GainNode | null = null;
  private lfoGainNode: GainNode | null = null;
  private oscNodes: OscillatorNode[] = [];
  private oscGainNodes: GainNode[] = [];
  private noiseSource: AudioBufferSourceNode | null = null;
  private noiseGain: GainNode | null = null;
  private lfoNode: OscillatorNode | null = null;
  private _isPlaying = false;
  private _volume = 0.4;
  private _savedVolume = 0.4; // for wind-down restore
  private _isWindingDown = false;

  get playing() { return this._isPlaying; }

  start(category: string): void {
    // Stop any existing playback first
    if (this._isPlaying) this.stop();

    const profile = PROFILES[category] || DEFAULT_PROFILE;

    // Create or resume AudioContext
    if (!this.ctx || this.ctx.state === "closed") {
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Master gain
    this.masterGainNode = ctx.createGain();
    this.masterGainNode.gain.setValueAtTime(0.001, now);
    this.masterGainNode.connect(ctx.destination);

    // LFO for volume pulsing
    this.lfoGainNode = ctx.createGain();
    this.lfoGainNode.gain.setValueAtTime(1, now);
    this.lfoGainNode.connect(this.masterGainNode);

    this.lfoNode = ctx.createOscillator();
    this.lfoNode.type = "sine";
    this.lfoNode.frequency.setValueAtTime(profile.lfo.frequency, now);
    const lfoDepthGain = ctx.createGain();
    lfoDepthGain.gain.setValueAtTime(profile.lfo.depth, now);
    this.lfoNode.connect(lfoDepthGain);
    lfoDepthGain.connect(this.lfoGainNode.gain);
    this.lfoNode.start(now);

    // Oscillators
    for (const osc of profile.oscillators) {
      const oscNode = ctx.createOscillator();
      oscNode.type = osc.type;
      oscNode.frequency.setValueAtTime(osc.frequency, now);
      oscNode.detune.setValueAtTime(osc.detune, now);

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(osc.gain, now);

      oscNode.connect(gainNode);
      gainNode.connect(this.lfoGainNode);
      oscNode.start(now);

      this.oscNodes.push(oscNode);
      this.oscGainNodes.push(gainNode);
    }

    // Noise layer
    if (profile.noise) {
      const noiseBuffer = generateNoiseBuffer(ctx, profile.noise.type);
      this.noiseSource = ctx.createBufferSource();
      this.noiseSource.buffer = noiseBuffer;
      this.noiseSource.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(profile.noise.filterFreq, now);
      filter.Q.setValueAtTime(profile.noise.filterQ, now);

      this.noiseGain = ctx.createGain();
      this.noiseGain.gain.setValueAtTime(profile.noise.gain, now);

      this.noiseSource.connect(filter);
      filter.connect(this.noiseGain);
      this.noiseGain.connect(this.lfoGainNode);
      this.noiseSource.start(now);
    }

    // Fade in over 1.5 seconds
    const targetGain = this._volume * profile.masterGain;
    this.masterGainNode.gain.linearRampToValueAtTime(targetGain, now + 1.5);

    this._isPlaying = true;
    this._isWindingDown = false;
  }

  stop(): void {
    if (!this.ctx || !this._isPlaying) return;

    const now = this.ctx.currentTime;

    // Fade out over 0.5 seconds
    if (this.masterGainNode) {
      this.masterGainNode.gain.cancelScheduledValues(now);
      this.masterGainNode.gain.setValueAtTime(this.masterGainNode.gain.value, now);
      this.masterGainNode.gain.linearRampToValueAtTime(0.001, now + 0.5);
    }

    // Schedule node cleanup after fade
    setTimeout(() => this._disconnectAll(), 600);

    this._isPlaying = false;
    this._isWindingDown = false;
  }

  private _disconnectAll(): void {
    for (const osc of this.oscNodes) {
      try { osc.stop(); osc.disconnect(); } catch {}
    }
    this.oscNodes = [];
    this.oscGainNodes = [];

    try { this.lfoNode?.stop(); this.lfoNode?.disconnect(); } catch {}
    this.lfoNode = null;

    try { this.noiseSource?.stop(); this.noiseSource?.disconnect(); } catch {}
    this.noiseSource = null;

    try { this.noiseGain?.disconnect(); } catch {}
    this.noiseGain = null;

    try { this.lfoGainNode?.disconnect(); } catch {}
    this.lfoGainNode = null;

    try { this.masterGainNode?.disconnect(); } catch {}
    this.masterGainNode = null;
  }

  setVolume(value: number): void {
    this._volume = Math.max(0, Math.min(1, value));
    if (!this._isPlaying || !this.masterGainNode || !this.ctx) return;
    if (this._isWindingDown) return; // don't override wind-down

    const now = this.ctx.currentTime;
    this.masterGainNode.gain.cancelScheduledValues(now);
    this.masterGainNode.gain.setValueAtTime(this.masterGainNode.gain.value, now);
    this.masterGainNode.gain.linearRampToValueAtTime(this._volume * 0.7, now + 0.3);
  }

  getVolume(): number { return this._volume; }

  windDown(durationSec: number): void {
    if (!this._isPlaying || !this.masterGainNode || !this.ctx) return;
    if (!this._isWindingDown) {
      this._savedVolume = this._volume;
    }
    this._isWindingDown = true;

    const now = this.ctx.currentTime;
    this.masterGainNode.gain.cancelScheduledValues(now);
    this.masterGainNode.gain.setValueAtTime(this.masterGainNode.gain.value, now);
    this.masterGainNode.gain.linearRampToValueAtTime(0.005, now + durationSec);
  }

  cancelWindDown(): void {
    if (!this._isWindingDown || !this.masterGainNode || !this.ctx) return;
    this._isWindingDown = false;

    const now = this.ctx.currentTime;
    this.masterGainNode.gain.cancelScheduledValues(now);
    this.masterGainNode.gain.setValueAtTime(this.masterGainNode.gain.value, now);
    this.masterGainNode.gain.linearRampToValueAtTime(this._savedVolume * 0.7, now + 0.5);
  }

  dispose(): void {
    if (this._isPlaying) {
      this._disconnectAll();
      this._isPlaying = false;
    }
    if (this.ctx && this.ctx.state !== "closed") {
      this.ctx.close().catch(() => {});
    }
    this.ctx = null;
  }
}
