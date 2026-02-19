// Web Audio API ambient sound engine for storybook
// Generates calming ambient sounds procedurally — no audio files needed

const MUSIC_ENABLED_KEY = "wondertales-music-enabled";
const MUSIC_VOLUME_KEY = "wondertales-music-volume";
const MUSIC_SOUND_KEY = "wondertales-music-sound";

export function getMusicPreference(): { enabled: boolean; volume: number; sound: string | null } {
  const enabled = localStorage.getItem(MUSIC_ENABLED_KEY) !== "false";
  const vol = parseFloat(localStorage.getItem(MUSIC_VOLUME_KEY) || "0.4");
  const sound = localStorage.getItem(MUSIC_SOUND_KEY);
  return { enabled, volume: isNaN(vol) ? 0.4 : Math.max(0, Math.min(1, vol)), sound };
}

export function saveMusicPreference(enabled: boolean, volume: number, sound: string | null): void {
  localStorage.setItem(MUSIC_ENABLED_KEY, String(enabled));
  localStorage.setItem(MUSIC_VOLUME_KEY, String(volume));
  if (sound) {
    localStorage.setItem(MUSIC_SOUND_KEY, sound);
  } else {
    localStorage.removeItem(MUSIC_SOUND_KEY);
  }
}

// --- Sound options exposed for UI ---
export interface SoundOption {
  id: string;
  label: string;
  emoji: string;
}

export const SOUND_OPTIONS: SoundOption[] = [
  { id: "auto", label: "Auto", emoji: "✨" },
  { id: "rain", label: "Rain", emoji: "🌧️" },
  { id: "ocean", label: "Ocean", emoji: "🌊" },
  { id: "wind", label: "Wind", emoji: "🍃" },
  { id: "night", label: "Night", emoji: "🌙" },
  { id: "stream", label: "Stream", emoji: "💧" },
  { id: "warmth", label: "Warmth", emoji: "🔥" },
];

// Category → default sound mapping (used when "auto" is selected)
const CATEGORY_DEFAULTS: Record<string, string> = {
  bedtime: "night",
  breathing: "rain",
  swimming: "ocean",
  adventure: "wind",
  "paw-patrol": "warmth",
  feelings: "rain",
};

// --- Sound Profiles ---
// All sounds are noise-driven (not oscillator-driven) for a natural feel.
// Oscillators are only used as subtle sub-bass warmth, nearly inaudible.

interface SoundProfile {
  // Primary noise layer
  noise: {
    type: "white" | "pink" | "brown";
    filterType: BiquadFilterType;
    filterFreq: number;
    filterQ: number;
    gain: number;
  };
  // Optional second noise layer (texture/detail)
  noise2?: {
    type: "white" | "pink" | "brown";
    filterType: BiquadFilterType;
    filterFreq: number;
    filterQ: number;
    gain: number;
  };
  // LFO modulates the noise for wave/pulse effects
  lfo: { frequency: number; depth: number };
  // Optional subtle sub-bass warmth (very low, felt not heard)
  subBass?: { frequency: number; gain: number };
  masterGain: number;
}

const PROFILES: Record<string, SoundProfile> = {
  rain: {
    // Gentle rain: pink noise through a mid-range filter
    noise: { type: "pink", filterType: "lowpass", filterFreq: 2500, filterQ: 0.3, gain: 0.6 },
    // Occasional raindrop detail: white noise with bandpass
    noise2: { type: "white", filterType: "bandpass", filterFreq: 4000, filterQ: 2, gain: 0.08 },
    lfo: { frequency: 0.04, depth: 0.15 },
    subBass: { frequency: 55, gain: 0.03 },
    masterGain: 0.8,
  },
  ocean: {
    // Surf: brown noise gives deep rumble
    noise: { type: "brown", filterType: "lowpass", filterFreq: 600, filterQ: 0.5, gain: 0.7 },
    // Foam/hiss layer
    noise2: { type: "white", filterType: "highpass", filterFreq: 2000, filterQ: 0.2, gain: 0.12 },
    // Slow LFO makes it swell like waves
    lfo: { frequency: 0.08, depth: 0.45 },
    subBass: { frequency: 40, gain: 0.04 },
    masterGain: 0.75,
  },
  wind: {
    // Gentle wind: brown noise, very low-passed
    noise: { type: "brown", filterType: "lowpass", filterFreq: 400, filterQ: 0.3, gain: 0.65 },
    // Higher whistle layer
    noise2: { type: "pink", filterType: "bandpass", filterFreq: 1200, filterQ: 1.5, gain: 0.06 },
    lfo: { frequency: 0.05, depth: 0.35 },
    masterGain: 0.7,
  },
  night: {
    // Night ambience: very soft brown noise base (room tone)
    noise: { type: "brown", filterType: "lowpass", filterFreq: 300, filterQ: 0.3, gain: 0.5 },
    // Faint high shimmer (distant crickets approximation)
    noise2: { type: "white", filterType: "bandpass", filterFreq: 5000, filterQ: 8, gain: 0.04 },
    lfo: { frequency: 0.02, depth: 0.1 },
    subBass: { frequency: 65, gain: 0.03 },
    masterGain: 0.65,
  },
  stream: {
    // Babbling brook: pink noise mid-high
    noise: { type: "pink", filterType: "bandpass", filterFreq: 1800, filterQ: 0.8, gain: 0.4 },
    // Water flow: brown noise low
    noise2: { type: "brown", filterType: "lowpass", filterFreq: 500, filterQ: 0.4, gain: 0.3 },
    // Faster LFO for babbling rhythm
    lfo: { frequency: 0.2, depth: 0.25 },
    masterGain: 0.7,
  },
  warmth: {
    // Cozy fireplace/furnace: deep brown rumble
    noise: { type: "brown", filterType: "lowpass", filterFreq: 250, filterQ: 0.4, gain: 0.6 },
    // Crackle detail
    noise2: { type: "white", filterType: "bandpass", filterFreq: 3000, filterQ: 3, gain: 0.03 },
    lfo: { frequency: 0.03, depth: 0.12 },
    subBass: { frequency: 50, gain: 0.05 },
    masterGain: 0.7,
  },
};

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
    // Pink noise — Voss algorithm
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

function createNoiseLayer(
  ctx: AudioContext,
  dest: AudioNode,
  config: SoundProfile["noise"],
  now: number
): { source: AudioBufferSourceNode; gain: GainNode } {
  const buffer = generateNoiseBuffer(ctx, config.type);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = config.filterType;
  filter.frequency.setValueAtTime(config.filterFreq, now);
  filter.Q.setValueAtTime(config.filterQ, now);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(config.gain, now);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(dest);
  source.start(now);

  return { source, gain };
}

export function resolveSound(selectedSound: string | null, category: string): string {
  if (!selectedSound || selectedSound === "auto") {
    return CATEGORY_DEFAULTS[category] || "night";
  }
  return selectedSound;
}

export class StoryAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGainNode: GainNode | null = null;
  private lfoGainNode: GainNode | null = null;
  private noiseLayers: { source: AudioBufferSourceNode; gain: GainNode }[] = [];
  private subBassOsc: OscillatorNode | null = null;
  private subBassGain: GainNode | null = null;
  private lfoNode: OscillatorNode | null = null;
  private _isPlaying = false;
  private _volume = 0.4;
  private _savedVolume = 0.4;
  private _isWindingDown = false;
  private _currentSound = "";
  private _stopTimeout: ReturnType<typeof setTimeout> | null = null;

  get playing() { return this._isPlaying; }
  get currentSound() { return this._currentSound; }

  start(soundId: string): void {
    // Cancel any pending delayed cleanup from a previous stop()
    if (this._stopTimeout) {
      clearTimeout(this._stopTimeout);
      this._stopTimeout = null;
    }
    // Immediately disconnect old nodes (no delayed cleanup that would kill new nodes)
    if (this._isPlaying) this._disconnectAll();
    this._isPlaying = false;

    const profile = PROFILES[soundId] || PROFILES.night;
    this._currentSound = soundId;

    if (!this.ctx || this.ctx.state === "closed") {
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Master gain — starts silent, fades in
    this.masterGainNode = ctx.createGain();
    this.masterGainNode.gain.setValueAtTime(0.001, now);
    this.masterGainNode.connect(ctx.destination);

    // LFO modulates noise volume for natural movement
    this.lfoGainNode = ctx.createGain();
    this.lfoGainNode.gain.setValueAtTime(1, now);
    this.lfoGainNode.connect(this.masterGainNode);

    this.lfoNode = ctx.createOscillator();
    this.lfoNode.type = "sine";
    this.lfoNode.frequency.setValueAtTime(profile.lfo.frequency, now);
    const lfoDepth = ctx.createGain();
    lfoDepth.gain.setValueAtTime(profile.lfo.depth, now);
    this.lfoNode.connect(lfoDepth);
    lfoDepth.connect(this.lfoGainNode.gain);
    this.lfoNode.start(now);

    // Primary noise layer
    this.noiseLayers.push(createNoiseLayer(ctx, this.lfoGainNode, profile.noise, now));

    // Secondary noise layer (texture/detail)
    if (profile.noise2) {
      this.noiseLayers.push(createNoiseLayer(ctx, this.lfoGainNode, profile.noise2, now));
    }

    // Optional sub-bass warmth (nearly inaudible, just adds body)
    if (profile.subBass) {
      this.subBassOsc = ctx.createOscillator();
      this.subBassOsc.type = "sine";
      this.subBassOsc.frequency.setValueAtTime(profile.subBass.frequency, now);
      this.subBassGain = ctx.createGain();
      this.subBassGain.gain.setValueAtTime(profile.subBass.gain, now);
      this.subBassOsc.connect(this.subBassGain);
      this.subBassGain.connect(this.masterGainNode); // bypasses LFO
      this.subBassOsc.start(now);
    }

    // Fade in over 2 seconds
    const targetGain = this._volume * profile.masterGain;
    this.masterGainNode.gain.linearRampToValueAtTime(targetGain, now + 2);

    this._isPlaying = true;
    this._isWindingDown = false;
  }

  stop(): void {
    if (!this.ctx || !this._isPlaying) return;

    const now = this.ctx.currentTime;

    if (this.masterGainNode) {
      this.masterGainNode.gain.cancelScheduledValues(now);
      this.masterGainNode.gain.setValueAtTime(this.masterGainNode.gain.value, now);
      this.masterGainNode.gain.linearRampToValueAtTime(0.001, now + 0.5);
    }

    this._stopTimeout = setTimeout(() => {
      this._disconnectAll();
      this._stopTimeout = null;
    }, 600);

    this._isPlaying = false;
    this._isWindingDown = false;
  }

  private _disconnectAll(): void {
    for (const layer of this.noiseLayers) {
      try { layer.source.stop(); layer.source.disconnect(); } catch {}
      try { layer.gain.disconnect(); } catch {}
    }
    this.noiseLayers = [];

    try { this.subBassOsc?.stop(); this.subBassOsc?.disconnect(); } catch {}
    this.subBassOsc = null;
    try { this.subBassGain?.disconnect(); } catch {}
    this.subBassGain = null;

    try { this.lfoNode?.stop(); this.lfoNode?.disconnect(); } catch {}
    this.lfoNode = null;

    try { this.lfoGainNode?.disconnect(); } catch {}
    this.lfoGainNode = null;

    try { this.masterGainNode?.disconnect(); } catch {}
    this.masterGainNode = null;
  }

  setVolume(value: number): void {
    this._volume = Math.max(0, Math.min(1, value));
    if (!this._isPlaying || !this.masterGainNode || !this.ctx) return;
    if (this._isWindingDown) return;

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
