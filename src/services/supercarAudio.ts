import type { PowertrainType } from '../types/car';

class SupercarAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isRunning: boolean = false;

  private osc1: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null;
  private osc3: OscillatorNode | null = null;
  private turboOsc: OscillatorNode | null = null;

  private gainNode: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private turboGain: GainNode | null = null;

  private currentPowertrain: PowertrainType = 'W16 Quad-Turbo';

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
    } catch {
      console.warn('Web Audio API not supported on this device.');
    }
  }

  public setPowertrain(type: PowertrainType) {
    this.currentPowertrain = type;
  }

  public start() {
    if (!this.ctx) this.init();
    if (!this.ctx || this.isRunning) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;

    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(0.08, now);

    this.filterNode = this.ctx.createBiquadFilter();
    this.filterNode.type = 'lowpass';
    this.filterNode.frequency.setValueAtTime(500, now);
    this.filterNode.Q.setValueAtTime(4.5, now);

    // Primary Cylinder Bank
    this.osc1 = this.ctx.createOscillator();
    this.osc1.type = 'sawtooth';
    this.osc1.frequency.setValueAtTime(100, now);

    // Harmonic Overtones
    this.osc2 = this.ctx.createOscillator();
    this.osc2.type = 'sawtooth';
    this.osc2.frequency.setValueAtTime(200, now);

    this.osc3 = this.ctx.createOscillator();
    this.osc3.type = 'triangle';
    this.osc3.frequency.setValueAtTime(300, now);

    // Turbo / Inverter Whine
    this.turboOsc = this.ctx.createOscillator();
    this.turboOsc.type = 'sine';
    this.turboOsc.frequency.setValueAtTime(2200, now);

    this.turboGain = this.ctx.createGain();
    this.turboGain.gain.setValueAtTime(0.015, now);

    this.osc1.connect(this.filterNode);
    this.osc2.connect(this.filterNode);
    this.osc3.connect(this.filterNode);
    this.filterNode.connect(this.gainNode);

    this.turboOsc.connect(this.turboGain);
    this.turboGain.connect(this.gainNode);

    this.gainNode.connect(this.ctx.destination);

    this.osc1.start(now);
    this.osc2.start(now);
    this.osc3.start(now);
    this.turboOsc.start(now);

    this.isRunning = true;
  }

  public updateRev(rpm: number, throttlePercent: number) {
    if (!this.ctx || !this.isRunning || this.isMuted) return;
    const now = this.ctx.currentTime;

    let baseFreq = 80;

    if (this.currentPowertrain === 'V12' || this.currentPowertrain === 'Hybrid V12') {
      // Screaming high-pitched V12 harmonics
      baseFreq = 85 + (rpm / 12000) * 380;
    } else if (this.currentPowertrain === 'W16 Quad-Turbo') {
      // Deep quad-bank bass
      baseFreq = 65 + (rpm / 7500) * 220;
    } else if (this.currentPowertrain === 'Quad-Motor EV') {
      // High-voltage electric whine
      baseFreq = 300 + (rpm / 18000) * 1200;
    } else {
      // Flat-plane V8 twin turbo
      baseFreq = 75 + (rpm / 8500) * 280;
    }

    if (this.osc1) this.osc1.frequency.setTargetAtTime(baseFreq, now, 0.04);
    if (this.osc2) this.osc2.frequency.setTargetAtTime(baseFreq * 2, now, 0.04);
    if (this.osc3) this.osc3.frequency.setTargetAtTime(baseFreq * 3, now, 0.04);

    if (this.filterNode) {
      const filterFreq = 450 + (throttlePercent / 100) * 3200;
      this.filterNode.frequency.setTargetAtTime(filterFreq, now, 0.04);
    }

    if (this.turboOsc && this.turboGain) {
      const isEv = this.currentPowertrain === 'Quad-Motor EV';
      const turboFreq = isEv ? 3500 + (rpm / 18000) * 4000 : 2000 + (throttlePercent / 100) * 2800;
      const turboVol = isEv ? 0.06 : 0.01 + (throttlePercent / 100) * 0.04;
      this.turboOsc.frequency.setTargetAtTime(turboFreq, now, 0.06);
      this.turboGain.gain.setTargetAtTime(turboVol, now, 0.06);
    }

    if (this.gainNode) {
      const volume = this.isMuted ? 0 : 0.06 + (throttlePercent / 100) * 0.09;
      this.gainNode.gain.setTargetAtTime(volume, now, 0.04);
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setTargetAtTime(muted ? 0 : 0.08, this.ctx.currentTime, 0.04);
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public stop() {
    if (!this.ctx || !this.isRunning) return;
    try {
      this.osc1?.stop();
      this.osc2?.stop();
      this.osc3?.stop();
      this.turboOsc?.stop();
    } catch {
      // Ignore
    }
    this.isRunning = false;
  }
}

export const supercarAudio = new SupercarAudioSynthesizer();
