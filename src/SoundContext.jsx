import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const SoundContext = createContext();

export function useSound() {
  return useContext(SoundContext);
}

export function SoundProvider({ children }) {
  const [muted, setMuted] = useState(() => {
    return localStorage.getItem('sound_muted') === 'true';
  });
  const [volume, setVolume] = useState(0.4); // Master volume scale
  const [ourSongPlaying, setOurSongPlaying] = useState(false);
  
  const audioCtxRef = useRef(null);
  const cooldownsRef = useRef({});
  const ambientGainRef = useRef(null);
  const ambientNodesRef = useRef([]);

  // Music sequencer refs
  const schedulerTimerRef = useRef(null);
  const nextNoteTimeRef = useRef(0);
  const currentStepRef = useRef(0);
  const activeOscillatorsRef = useRef([]);

  // Central Gain Node Buses for Ducking & Priority Control
  const bgMusicGainRef = useRef(null);
  const sfxGainRef = useRef(null);
  const sfxDuckTimeoutRef = useRef(null);

  // Synthesize a continuous soft romantic Major 7 ambient backdrop
  const startAmbientPad = () => {
    const ctx = audioCtxRef.current;
    if (!ctx || ambientNodesRef.current.length > 0) return;

    try {
      const freqs = [130.81, 196.00, 261.63, 329.63]; // C3, G3, C4, E4 (Lush Major 7/9 pad)
      const nodes = [];

      const ambientGain = ctx.createGain();
      // Start muted or at low volume (extremely quiet)
      ambientGain.gain.setValueAtTime(muted ? 0 : 0.25 * volume, ctx.currentTime);
      ambientGain.connect(bgMusicGainRef.current || ctx.destination);

      // Deep lowpass filter to remove high frequencies and keep the sound deep and warm
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200, ctx.currentTime);
      filter.connect(ambientGain);

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();

        // Slow LFO to swell individual note volumes independently
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.08 + idx * 0.02, ctx.currentTime);
        lfoGain.gain.setValueAtTime(0.2, ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(oscGain.gain);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq + (Math.random() - 0.5) * 0.5, ctx.currentTime);

        // Slow pitch drift LFO to create lush chorus analog drift
        const pitchLfo = ctx.createOscillator();
        const pitchLfoGain = ctx.createGain();
        pitchLfo.type = 'sine';
        pitchLfo.frequency.setValueAtTime(0.04 + idx * 0.01, ctx.currentTime);
        pitchLfoGain.gain.setValueAtTime(0.3, ctx.currentTime);
        pitchLfo.connect(pitchLfoGain);
        pitchLfoGain.connect(osc.frequency);

        oscGain.gain.setValueAtTime(0.12, ctx.currentTime);

        osc.connect(oscGain);
        oscGain.connect(filter);

        osc.start();
        lfo.start();
        pitchLfo.start();

        nodes.push(osc, lfo, pitchLfo);
      });

      ambientGainRef.current = ambientGain;
      ambientNodesRef.current = nodes;
    } catch (err) {
      console.warn("Failed to start ambient pad:", err);
    }
  };

  // Synthesize a soft warm acoustic piano note
  const playPianoNote = (ctx, destination, freq, time, duration) => {
    try {
      const osc1 = ctx.createOscillator();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(freq, time);

      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2, time);

      const gain1 = ctx.createGain();
      const gain2 = ctx.createGain();

      const volumeScale = muted ? 0 : 0.011 * volume; // Extremely soft & warm piano

      gain1.gain.setValueAtTime(0, time);
      gain1.gain.linearRampToValueAtTime(volumeScale, time + 0.005); // Rapid strike attack
      gain1.gain.exponentialRampToValueAtTime(volumeScale * 0.35, time + 0.35); // Key decay
      gain1.gain.exponentialRampToValueAtTime(0.0001, time + duration); // Release

      gain2.gain.setValueAtTime(0, time);
      gain2.gain.linearRampToValueAtTime(volumeScale * 0.4, time + 0.005);
      gain2.gain.exponentialRampToValueAtTime(volumeScale * 0.1, time + 0.2);
      gain2.gain.exponentialRampToValueAtTime(0.0001, time + duration * 0.7);

      // Piano hammer strike noise burst (10ms of highpassed noise)
      const bufferSize = ctx.sampleRate * 0.01;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.setValueAtTime(1200, time);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(volumeScale * 0.1, time);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.008);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(destination);

      osc1.connect(gain1);
      osc2.connect(gain2);

      gain1.connect(destination);
      gain2.connect(destination);

      osc1.start(time);
      osc2.start(time);
      noise.start(time);

      osc1.stop(time + duration + 0.1);
      osc2.stop(time + duration + 0.1);

      activeOscillatorsRef.current.push(osc1, osc2);
    } catch (e) {}
  };

  // Synthesize a soaring bowed violin/string note
  const playViolinNote = (ctx, destination, freq, time, duration) => {
    try {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth'; // Bowed string overtone profile
      osc.frequency.setValueAtTime(freq, time);

      // Pitch vibrato (5.8Hz LFO)
      const vibrato = ctx.createOscillator();
      vibrato.frequency.setValueAtTime(5.8, time);
      const vibratoGain = ctx.createGain();
      vibratoGain.gain.setValueAtTime(freq * 0.012, time); // Subtle pitch pitch fluctuation
      vibrato.connect(vibratoGain);
      vibratoGain.connect(osc.frequency);

      // Lowpass filter to keep string sounds mellow and romantic
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, time);
      filter.frequency.exponentialRampToValueAtTime(750, time + 0.25); // Bow opening filter sweep
      filter.frequency.exponentialRampToValueAtTime(400, time + duration);

      const gain = ctx.createGain();
      const volumeScale = muted ? 0 : 0.006 * volume; // Very soft, intimate background level

      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(volumeScale, time + 0.4); // Slow bow swell attack
      gain.gain.setValueAtTime(volumeScale, time + duration - 0.2);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration + 0.4); // Bow lift release

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(destination);

      vibrato.start(time);
      osc.start(time);

      vibrato.stop(time + duration + 0.5);
      osc.stop(time + duration + 0.5);

      activeOscillatorsRef.current.push(osc, vibrato);
    } catch (e) {}
  };

  // Music sequencer scheduler (F Major -> C Major -> D minor -> Bb Major)
  const startMusic = () => {
    const ctx = audioCtxRef.current;
    if (!ctx || schedulerTimerRef.current) return;

    if (nextNoteTimeRef.current === 0) {
      nextNoteTimeRef.current = ctx.currentTime + 0.3;
    }

    const scheduleAheadTime = 0.8;
    const lookahead = 250;
    const stepDuration = 1.5; // slow 40 BPM tempo

    const scheduleStep = (step, time) => {
      const pianoChords = [
        [174.61, 220.00, 261.63], // Step 0: F Major chord (F3, A3, C4)
        [],
        [174.61, 261.63, 349.23], // Step 2: F Major chord arpeggio
        [],
        [130.81, 164.81, 196.00], // Step 4: C Major chord (C3, E3, G3)
        [],
        [196.00, 246.94, 293.66], // Step 6: G chord arpeggio
        [],
        [146.83, 174.61, 220.00], // Step 8: D minor chord (D3, F3, A3)
        [],
        [220.00, 293.66, 349.23], // Step 10: Dm arpeggio
        [],
        [116.54, 146.83, 174.61], // Step 12: Bb Major chord (Bb2, D3, F3)
        [],
        [146.83, 174.61, 233.08], // Step 14: Bb chord arpeggio
        []
      ];

      const pianoArpeggios = [
        [], [349.23], [], [440.00],
        [], [392.00], [], [523.25],
        [], [440.00], [], [587.33],
        [], [349.23], [], [466.16]
      ];

      const violinMelody = [
        440.00, // Step 0: A4
        null,
        392.00, // Step 2: G4
        null,
        523.25, // Step 4: C5
        null,
        440.00, // Step 6: A4
        null,
        698.46, // Step 8: F5
        null,
        659.25, // Step 10: E5
        null,
        587.33, // Step 12: D5
        null,
        523.25, // Step 14: C5
        null
      ];

      const destination = bgMusicGainRef.current || ctx.destination;

      // Play piano chord
      const chord = pianoChords[step % 16];
      if (chord && chord.length > 0) {
        chord.forEach(freq => playPianoNote(ctx, destination, freq, time, 2.5));
      }

      // Play piano arpeggio note
      const arp = pianoArpeggios[step % 16];
      if (arp && arp.length > 0) {
        arp.forEach(freq => playPianoNote(ctx, destination, freq, time, 1.8));
      }

      // Play violin soaring string line
      const violinFreq = violinMelody[step % 16];
      if (violinFreq) {
        playViolinNote(ctx, destination, violinFreq, time, 2.8);
      }
    };

    const scheduler = () => {
      try {
        while (nextNoteTimeRef.current < ctx.currentTime + scheduleAheadTime) {
          scheduleStep(currentStepRef.current, nextNoteTimeRef.current);
          nextNoteTimeRef.current += stepDuration;
          currentStepRef.current = (currentStepRef.current + 1) % 16;
        }
        schedulerTimerRef.current = setTimeout(scheduler, lookahead);
      } catch (e) {}
    };

    scheduler();
  };

  // Initialize AudioContext
  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtxRef.current = new AudioContextClass();
        
        // Setup central Gain Node buses for Ducking & Volume control
        const ctx = audioCtxRef.current;
        bgMusicGainRef.current = ctx.createGain();
        sfxGainRef.current = ctx.createGain();
        
        bgMusicGainRef.current.connect(ctx.destination);
        sfxGainRef.current.connect(ctx.destination);
        
        bgMusicGainRef.current.gain.setValueAtTime(muted ? 0 : 1.0, ctx.currentTime);
        sfxGainRef.current.gain.setValueAtTime(muted ? 0 : 1.0, ctx.currentTime);
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().then(() => {
        startAmbientPad();
        startMusic();
      }).catch(e => console.warn("Error resuming AudioContext:", e));
    } else if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
      startAmbientPad();
      startMusic();
    }
  };

  // Keep ambient pad and gain buses updated dynamically when volume/mute/ducking changes
  useEffect(() => {
    const ctx = audioCtxRef.current;
    const bgGainNode = bgMusicGainRef.current;
    const sfxGainNode = sfxGainRef.current;
    if (!ctx) return;

    const now = ctx.currentTime;

    if (ambientGainRef.current) {
      ambientGainRef.current.gain.setValueAtTime(ambientGainRef.current.gain.value, now);
      ambientGainRef.current.gain.linearRampToValueAtTime(
        muted ? 0 : 0.025 * volume,
        now + 0.1
      );
    }

    if (bgGainNode) {
      bgGainNode.gain.setValueAtTime(bgGainNode.gain.value, now);
      const targetBgVal = muted ? 0 : (ourSongPlaying ? 0.02 : 1.0);
      bgGainNode.gain.linearRampToValueAtTime(targetBgVal, now + 0.8);
    }

    if (sfxGainNode) {
      sfxGainNode.gain.setValueAtTime(sfxGainNode.gain.value, now);
      sfxGainNode.gain.linearRampToValueAtTime(muted ? 0 : 1.0, now + 0.1);
    }
  }, [volume, muted, ourSongPlaying]);

  useEffect(() => {
    const unlock = () => {
      initAudio();
      window.removeEventListener('click', unlock);
      window.removeEventListener('touchstart', unlock);
    };
    window.addEventListener('click', unlock);
    window.addEventListener('touchstart', unlock);
    return () => {
      window.removeEventListener('click', unlock);
      window.removeEventListener('touchstart', unlock);
      if (ambientNodesRef.current) {
        ambientNodesRef.current.forEach(node => {
          try { node.stop(); } catch (e) {}
        });
        ambientNodesRef.current = [];
      }
      if (schedulerTimerRef.current) {
        clearTimeout(schedulerTimerRef.current);
      }
      if (sfxDuckTimeoutRef.current) {
        clearTimeout(sfxDuckTimeoutRef.current);
      }
      if (activeOscillatorsRef.current) {
        activeOscillatorsRef.current.forEach(node => {
          try { node.stop(); } catch (e) {}
        });
        activeOscillatorsRef.current = [];
      }
    };
  }, []);

  const toggleMute = () => {
    const nextMuted = !muted;
    setMuted(nextMuted);
    localStorage.setItem('sound_muted', String(nextMuted));
    
    const ctx = audioCtxRef.current;
    const bgGainNode = bgMusicGainRef.current;
    const sfxGainNode = sfxGainRef.current;

    if (ctx) {
      const now = ctx.currentTime;
      if (bgGainNode) {
        bgGainNode.gain.setValueAtTime(bgGainNode.gain.value, now);
        const targetBgVal = nextMuted ? 0 : (ourSongPlaying ? 0.02 : 1.0);
        bgGainNode.gain.linearRampToValueAtTime(targetBgVal, now + 0.5);
      }
      if (sfxGainNode) {
        sfxGainNode.gain.setValueAtTime(sfxGainNode.gain.value, now);
        sfxGainNode.gain.linearRampToValueAtTime(nextMuted ? 0 : 1.0, now + 0.3);
      }
    }

    if (!nextMuted) {
      // Tiny delay feedback chime on unmute
      setTimeout(() => playSound('click'), 40);
    }
  };

  const duckBgMusicForSFX = () => {
    const ctx = audioCtxRef.current;
    const bgGainNode = bgMusicGainRef.current;
    if (!ctx || !bgGainNode || muted || ourSongPlaying) return;

    const now = ctx.currentTime;
    // Duck background music to 40% volume over 150ms
    bgGainNode.gain.setValueAtTime(bgGainNode.gain.value, now);
    bgGainNode.gain.linearRampToValueAtTime(0.4, now + 0.15);

    if (sfxDuckTimeoutRef.current) {
      clearTimeout(sfxDuckTimeoutRef.current);
    }

    sfxDuckTimeoutRef.current = setTimeout(() => {
      const currentCtx = audioCtxRef.current;
      const currentBgGain = bgMusicGainRef.current;
      if (currentCtx && currentBgGain && !muted && !ourSongPlaying) {
        const time = currentCtx.currentTime;
        currentBgGain.gain.setValueAtTime(currentBgGain.gain.value, time);
        currentBgGain.gain.linearRampToValueAtTime(1.0, time + 0.8);
      }
    }, 1800);
  };

  const playSound = (type) => {
    if (muted) return;
    
    // Safety check for reduced motion users
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches && type === 'hover') {
      return;
    }

    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx || ctx.state === 'suspended') return;

    // Repetition cooldown (120ms)
    const now = Date.now();
    if (type !== 'typing' && cooldownsRef.current[type] && now - cooldownsRef.current[type] < 120) {
      return;
    }
    cooldownsRef.current[type] = now;

    // Trigger background music ducking for important emotional moments
    if (['open', 'memory', 'letter-open', 'celebration'].includes(type)) {
      duckBgMusicForSFX();
    }

    try {
      const destination = sfxGainRef.current || ctx.destination;
      
      switch (type) {
        case 'typing': {
          // Soft romantic music-box droplet
          const notes = [523.25, 587.33, 659.25, 783.99, 880.00]; // Pentatonic scale (C5-A5)
          const freq = notes[Math.floor(Math.random() * notes.length)];
          
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          
          osc.type = 'sine'; // Pure, soft sine wave
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          
          // Subtle pitch detuning (+/- 12 cents) for typing key variation
          const detuneVal = (Math.random() - 0.5) * 12;
          osc.detune.setValueAtTime(detuneVal, ctx.currentTime);
          
          // Subtle volume variation (85% to 115%)
          const volumeScale = 0.85 + Math.random() * 0.3;
          gainNode.gain.setValueAtTime(volume * 0.015 * volumeScale, ctx.currentTime); // Extremely soft and subtle
          gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08); // Smooth 80ms decay
          
          osc.connect(gainNode);
          gainNode.connect(destination);
          
          osc.start();
          osc.stop(ctx.currentTime + 0.095);
          break;
        }

        case 'click': {
          // Soft warm click / tiny pluck
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          
          osc.type = 'triangle';
          const baseFreq = 280 + Math.random() * 30;
          osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
          
          gainNode.gain.setValueAtTime(volume * 0.12, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
          
          osc.connect(gainNode);
          gainNode.connect(destination);
          
          osc.start();
          osc.stop(ctx.currentTime + 0.095);
          break;
        }
        
        case 'hover': {
          // Airy tiny tick
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(580, ctx.currentTime);
          
          gainNode.gain.setValueAtTime(volume * 0.05, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
          
          osc.connect(gainNode);
          gainNode.connect(destination);
          
          osc.start();
          osc.stop(ctx.currentTime + 0.045);
          break;
        }

        case 'heart': {
          // Warm low heartbeat pluck
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          const filter = ctx.createBiquadFilter();
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(75, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.16);
          
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(95, ctx.currentTime);
          
          gainNode.gain.setValueAtTime(volume * 0.35, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
          
          osc.connect(filter);
          filter.connect(gainNode);
          gainNode.connect(destination);
          
          osc.start();
          osc.stop(ctx.currentTime + 0.2);
          break;
        }

        case 'navigation': {
          // Soft airy glide transition
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(180, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(280, ctx.currentTime + 0.22);
          
          gainNode.gain.setValueAtTime(0.0001, ctx.currentTime);
          gainNode.gain.linearRampToValueAtTime(volume * 0.07, ctx.currentTime + 0.06);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.26);
          
          osc.connect(gainNode);
          gainNode.connect(destination);
          
          osc.start();
          osc.stop(ctx.currentTime + 0.28);
          break;
        }

        case 'timeline-select': {
          // Delicate single chime
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
          
          gainNode.gain.setValueAtTime(volume * 0.1, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
          
          osc.connect(gainNode);
          gainNode.connect(destination);
          
          osc.start();
          osc.stop(ctx.currentTime + 0.4);
          break;
        }

        case 'timeline-today': {
          // Arpeggiated warm major chord (C5 - E5 - G5)
          [523.25, 659.25, 783.99].forEach((freq, idx) => {
            const timeOffset = idx * 0.05;
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + timeOffset);
            
            gainNode.gain.setValueAtTime(0.0001, ctx.currentTime + timeOffset);
            gainNode.gain.linearRampToValueAtTime(volume * 0.06, ctx.currentTime + timeOffset + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + timeOffset + 0.35);
            
            osc.connect(gainNode);
            gainNode.connect(destination);
            
            osc.start(ctx.currentTime + timeOffset);
            osc.stop(ctx.currentTime + timeOffset + 0.4);
          });
          break;
        }

        case 'open':
        case 'memory': {
          // Soft magical pentatonic sweep
          const notes = [392.00, 440.00, 523.25, 587.33, 659.25]; // G4, A4, C5, D5, E5
          notes.forEach((freq, idx) => {
            const timeOffset = idx * 0.04;
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + timeOffset);
            
            gainNode.gain.setValueAtTime(0.0001, ctx.currentTime + timeOffset);
            gainNode.gain.linearRampToValueAtTime(volume * 0.05, ctx.currentTime + timeOffset + 0.015);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + timeOffset + 0.32);
            
            osc.connect(gainNode);
            gainNode.connect(destination);
            
            osc.start(ctx.currentTime + timeOffset);
            osc.stop(ctx.currentTime + timeOffset + 0.36);
          });
          break;
        }

        case 'close': {
          // Descending warm notes
          const notes = [440.00, 349.23, 293.66]; // A4, F4, D4
          notes.forEach((freq, idx) => {
            const timeOffset = idx * 0.045;
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + timeOffset);
            
            gainNode.gain.setValueAtTime(0.0001, ctx.currentTime + timeOffset);
            gainNode.gain.linearRampToValueAtTime(volume * 0.06, ctx.currentTime + timeOffset + 0.015);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + timeOffset + 0.28);
            
            osc.connect(gainNode);
            gainNode.connect(destination);
            
            osc.start(ctx.currentTime + timeOffset);
            osc.stop(ctx.currentTime + timeOffset + 0.32);
          });
          break;
        }

        case 'letter-open': {
          // Soft paper ruffle friction + chime
          const bufferSize = ctx.sampleRate * 0.25;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
          }
          const noise = ctx.createBufferSource();
          noise.buffer = buffer;
          
          const noiseFilter = ctx.createBiquadFilter();
          noiseFilter.type = 'bandpass';
          noiseFilter.frequency.setValueAtTime(750, ctx.currentTime);
          noiseFilter.Q.setValueAtTime(1.2, ctx.currentTime);
          
          const noiseGain = ctx.createGain();
          noiseGain.gain.setValueAtTime(volume * 0.04, ctx.currentTime);
          noiseGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22);
          
          noise.connect(noiseFilter);
          noiseFilter.connect(noiseGain);
          noiseGain.connect(destination);
          noise.start();

          const osc = ctx.createOscillator();
          const bellGain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(880, ctx.currentTime);
          
          bellGain.gain.setValueAtTime(volume * 0.03, ctx.currentTime);
          bellGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
          
          osc.connect(bellGain);
          bellGain.connect(destination);
          
          osc.start();
          osc.stop(ctx.currentTime + 0.35);
          break;
        }

        case 'letter-seal': {
          // Low stamp thud + tiny seal ring resonance
          const osc = ctx.createOscillator();
          const stampGain = ctx.createGain();
          const filter = ctx.createBiquadFilter();
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(90, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(55, ctx.currentTime + 0.12);
          
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(110, ctx.currentTime);
          
          stampGain.gain.setValueAtTime(volume * 0.32, ctx.currentTime);
          stampGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.14);
          
          osc.connect(filter);
          filter.connect(stampGain);
          stampGain.connect(destination);
          
          osc.start();
          osc.stop(ctx.currentTime + 0.2);

          const ringOsc = ctx.createOscillator();
          const ringGain = ctx.createGain();
          ringOsc.type = 'sine';
          ringOsc.frequency.setValueAtTime(587.33, ctx.currentTime + 0.04);
          
          ringGain.gain.setValueAtTime(0.0001, ctx.currentTime + 0.04);
          ringGain.gain.linearRampToValueAtTime(volume * 0.05, ctx.currentTime + 0.05);
          ringGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
          
          ringOsc.connect(ringGain);
          ringGain.connect(destination);
          ringOsc.start(ctx.currentTime + 0.04);
          ringOsc.stop(ctx.currentTime + 0.35);
          break;
        }

        case 'vinyl-start': {
          // Tone needle drop + soft pop
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(220, ctx.currentTime);
          gainNode.gain.setValueAtTime(volume * 0.09, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
          
          osc.connect(gainNode);
          gainNode.connect(destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.06);

          const popOsc = ctx.createOscillator();
          const popGain = ctx.createGain();
          popOsc.type = 'triangle';
          popOsc.frequency.setValueAtTime(45, ctx.currentTime + 0.03);
          popGain.gain.setValueAtTime(volume * 0.12, ctx.currentTime + 0.03);
          popGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.1);
          popOsc.connect(popGain);
          popGain.connect(destination);
          popOsc.start(ctx.currentTime + 0.03);
          popOsc.stop(ctx.currentTime + 0.12);
          break;
        }

        case 'vinyl-stop': {
          // Needle click lift
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(140, ctx.currentTime);
          gainNode.gain.setValueAtTime(volume * 0.08, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
          
          osc.connect(gainNode);
          gainNode.connect(destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.05);
          break;
        }

        case 'candle-light': {
          // Match scratch + soft candle flame ignition
          const bufferSize = ctx.sampleRate * 0.12;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
          }
          const noise = ctx.createBufferSource();
          noise.buffer = buffer;
          
          const noiseFilter = ctx.createBiquadFilter();
          noiseFilter.type = 'bandpass';
          noiseFilter.frequency.setValueAtTime(1100, ctx.currentTime);
          
          const noiseGain = ctx.createGain();
          noiseGain.gain.setValueAtTime(volume * 0.05, ctx.currentTime);
          noiseGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.1);
          
          noise.connect(noiseFilter);
          noiseFilter.connect(noiseGain);
          noiseGain.connect(destination);
          noise.start();

          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(170, ctx.currentTime + 0.04);
          osc.frequency.exponentialRampToValueAtTime(280, ctx.currentTime + 0.18);
          
          gainNode.gain.setValueAtTime(0.0001, ctx.currentTime + 0.04);
          gainNode.gain.linearRampToValueAtTime(volume * 0.06, ctx.currentTime + 0.06);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22);
          
          osc.connect(gainNode);
          gainNode.connect(destination);
          osc.start(ctx.currentTime + 0.04);
          osc.stop(ctx.currentTime + 0.24);
          break;
        }

        case 'candle-extinguish': {
          // Breath blow noise
          const bufferSize = ctx.sampleRate * 0.16;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
          }
          const noise = ctx.createBufferSource();
          noise.buffer = buffer;
          
          const noiseFilter = ctx.createBiquadFilter();
          noiseFilter.type = 'lowpass';
          noiseFilter.frequency.setValueAtTime(400, ctx.currentTime);
          
          const noiseGain = ctx.createGain();
          noiseGain.gain.setValueAtTime(volume * 0.06, ctx.currentTime);
          noiseGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
          
          noise.connect(noiseFilter);
          noiseFilter.connect(noiseGain);
          noiseGain.connect(destination);
          noise.start();
          break;
        }

        case 'celebration': {
          // Major arpeggiated C-Major deluxe chime chord
          const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
          notes.forEach((freq, idx) => {
            const timeOffset = idx * 0.035;
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + timeOffset);
            
            gainNode.gain.setValueAtTime(0.0001, ctx.currentTime + timeOffset);
            gainNode.gain.linearRampToValueAtTime(volume * 0.04, ctx.currentTime + timeOffset + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + timeOffset + 0.55);
            
            osc.connect(gainNode);
            gainNode.connect(destination);
            
            osc.start(ctx.currentTime + timeOffset);
            osc.stop(ctx.currentTime + timeOffset + 0.65);
          });
          break;
        }
        
        case 'love-slider': {
          // Soft delicate shimmer - pitch and brightness scale with normalizedValue (0–1)
          // This is called externally with a custom payload via playLoveMeterSlider()
          break;
        }

        case 'love-max': {
          // Overflowing love moment: warm piano chord + delicate chime + tiny sparkle
          // Soft duck of background music
          duckBgMusicForSFX();

          // Layer 1: Warm piano-like chord (F Major 7: F4, A4, C5, E5) — very soft
          const chordFreqs = [349.23, 440.00, 523.25, 659.25];
          chordFreqs.forEach((freq, idx) => {
            const t = ctx.currentTime + idx * 0.04;
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            const g = ctx.createGain();

            osc1.type = 'triangle';
            osc1.frequency.setValueAtTime(freq, t);
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(freq * 2, t);

            const vol = muted ? 0 : volume * 0.022;
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(vol, t + 0.012);
            g.gain.exponentialRampToValueAtTime(vol * 0.4, t + 0.4);
            g.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);

            osc1.connect(g); osc2.connect(g);
            g.connect(destination);
            osc1.start(t); osc2.start(t);
            osc1.stop(t + 1.4); osc2.stop(t + 1.4);
          });

          // Layer 2: Delicate high chime cascade (pentatonic: G5, A5, C6)
          [783.99, 880.00, 1046.50].forEach((freq, idx) => {
            const t = ctx.currentTime + 0.05 + idx * 0.06;
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t);
            const vol = muted ? 0 : volume * 0.03;
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(vol, t + 0.008);
            g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
            osc.connect(g); g.connect(destination);
            osc.start(t); osc.stop(t + 0.6);
          });

          // Layer 3: Tiny sparkle shimmer burst (high random tones)
          for (let i = 0; i < 5; i++) {
            const t = ctx.currentTime + 0.12 + i * 0.045;
            const freq = 1200 + Math.random() * 600;
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t);
            const vol = muted ? 0 : volume * 0.012;
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(vol, t + 0.005);
            g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
            osc.connect(g); g.connect(destination);
            osc.start(t); osc.stop(t + 0.22);
          }
          break;
        }

        default:
          break;
      }
    } catch (err) {
      console.warn("Audio play error:", err);
    }
  };

  // Throttle ref for slider shimmer — prevent audio flooding
  const sliderThrottleRef = useRef(0);

  /**
   * playLoveMeterSlider(normalizedValue: 0–1)
   * Plays a delicate, pitch-rising shimmer on each slider movement.
   * Throttled to ~80ms intervals so it stays light even on rapid drag.
   */
  const playLoveMeterSlider = (normalizedValue) => {
    if (muted) return;
    const now = Date.now();
    if (now - sliderThrottleRef.current < 80) return; // ~12.5 fps max audio events
    sliderThrottleRef.current = now;

    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx || ctx.state === 'suspended') return;

    try {
      const destination = sfxGainRef.current || ctx.destination;
      const t = ctx.currentTime;

      // Base pitch: 400 Hz at 0% → 900 Hz at 100% (warm to bright shimmer)
      const baseFreq = 400 + normalizedValue * 500;
      // Harmonically add a 5th above for warmth
      const harmFreq = baseFreq * 1.5;

      // Volume: very subtle — 5% at bottom, 10% at top
      const vol = volume * (0.05 + normalizedValue * 0.05);

      [baseFreq, harmFreq].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        // Tiny natural pitch drift for shimmer character
        osc.frequency.linearRampToValueAtTime(freq * (1 + 0.005 * (idx ? -1 : 1)), t + 0.07);

        const gainVol = muted ? 0 : vol * (idx === 0 ? 1 : 0.45);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(gainVol, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);

        osc.connect(g);
        g.connect(destination);
        osc.start(t);
        osc.stop(t + 0.12);
      });
    } catch (e) {}
  };

  return (
    <SoundContext.Provider value={{ 
      muted, 
      toggleMute, 
      playSound, 
      playLoveMeterSlider,
      ourSongPlaying, 
      setOurSongPlaying, 
      volume, 
      setVolume 
    }}>
      {children}
    </SoundContext.Provider>
  );
}
