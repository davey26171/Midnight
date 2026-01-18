import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const SoundContext = createContext();

export function useSound() {
    return useContext(SoundContext);
}

// Procedural Audio Engine
class AudioSynth {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);
        this.musicOscillators = [];
        this.musicInterval = null;
        this.isMuted = false;
        this.lastClickTime = 0; // Debounce tracking
    }

    setVolume(val) {
        this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : val, this.ctx.currentTime, 0.1);
    }

    setMute(muted) {
        this.isMuted = muted;
        if (muted) {
            this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
        } else {
            this.masterGain.gain.setTargetAtTime(0.5, this.ctx.currentTime, 0.1);
        }
    }

    // Sound Effects
    playClick() {
        if (this.isMuted) return;

        // Debounce: prevent playing within 200ms of last click (increased to prevent any doubles)
        const now = Date.now();
        if (now - this.lastClickTime < 200) return;
        this.lastClickTime = now;

        // Modern UI click: crisp, short, subtle
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        // Higher frequency for modern crisp sound
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.03);

        // Lowpass filter for smoothness
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, this.ctx.currentTime);

        // Very short, punchy envelope
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
    }

    playTransition() {
        if (this.isMuted) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(600, this.ctx.currentTime + 0.3);

        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + 0.1);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    }

    playSuccess() {
        if (this.isMuted) return;
        this.playNote(523.25, 0, 0.2, 'square'); // C5
        this.playNote(659.25, 0.1, 0.2, 'square'); // E5
        this.playNote(783.99, 0.2, 0.4, 'square'); // G5
    }

    playFailure() {
        if (this.isMuted) return;
        this.playNote(440, 0, 0.3, 'sawtooth'); // A4
        this.playNote(415.30, 0.2, 0.3, 'sawtooth'); // Ab4
        this.playNote(392.00, 0.4, 0.6, 'sawtooth'); // G4
    }

    playNote(freq, startTime, duration, type = 'sine') {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTime);

        gain.gain.setValueAtTime(0, this.ctx.currentTime + startTime);
        gain.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + startTime + 0.05);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + startTime + duration);

        osc.start(this.ctx.currentTime + startTime);
        osc.stop(this.ctx.currentTime + startTime + duration);
    }

    // Background Music (uses single music.mp3 file)
    startMusic(type) {
        this.stopMusic();
        if (this.isMuted) return;

        // Use single music file for all music types
        try {
            this.menuAudio = new Audio('/music.mp3');
            this.menuAudio.loop = true;
            this.menuAudio.volume = 0; // Start at 0 for fade-in

            // Fade in over 5 seconds for smooth, noticeable transition
            this.menuAudio.play().then(() => {
                let vol = 0;
                const targetVolume = 0.1; // Lower volume as requested
                const fadeInterval = setInterval(() => {
                    if (vol < targetVolume) {
                        vol += 0.002; // Smaller increments for smoother fade
                        if (this.menuAudio) {
                            this.menuAudio.volume = Math.min(vol, targetVolume);
                        }
                    } else {
                        clearInterval(fadeInterval);
                    }
                }, 100); // Update every 100ms (5 seconds total)
            }).catch(() => {
                console.debug('Music autoplay blocked - will play on user interaction');
            });
        } catch (e) {
            console.debug('Music file not found or failed to load');
        }
    }

    stopMusic() {
        if (this.menuAudio) {
            this.menuAudio.pause();
            this.menuAudio.currentTime = 0;
            this.menuAudio = null;
        }
    }
}

export function SoundProvider({ children }) {
    const [isMuted, setIsMuted] = useState(() => {
        return localStorage.getItem('sound_muted') === 'true';
    });

    const synthRef = useRef(null);

    useEffect(() => {
        synthRef.current = new AudioSynth();
        synthRef.current.setVolume(0.5);
        synthRef.current.setMute(isMuted);

        // Global button click handler
        const handleClick = (e) => {
            // Resume audio context if suspended
            if (synthRef.current?.ctx.state === 'suspended') {
                synthRef.current.ctx.resume();
            }

            // Play click sound on button clicks
            if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
                synthRef.current?.playClick();
            }
        };

        window.addEventListener('click', handleClick, true); // Use capture phase
        return () => window.removeEventListener('click', handleClick, true);
    }, []);

    useEffect(() => {
        if (synthRef.current) {
            synthRef.current.setMute(isMuted);
            // Update music volume when mute changes
            if (synthRef.current.menuAudio) {
                synthRef.current.menuAudio.volume = isMuted ? 0 : 0.1;
            }
            localStorage.setItem('sound_muted', isMuted);
        }
    }, [isMuted]);

    const playSfx = (name) => {
        if (!synthRef.current) return;
        switch (name) {
            case 'click': synthRef.current.playClick(); break;
            case 'transition': synthRef.current.playTransition(); break;
            case 'success': synthRef.current.playSuccess(); break;
            case 'failure': synthRef.current.playFailure(); break;
            default: synthRef.current.playClick();
        }
    };

    const playMusic = (name) => {
        if (!synthRef.current) return;
        synthRef.current.startMusic(name);
    };

    const toggleMute = () => setIsMuted(!isMuted);

    return (
        <SoundContext.Provider value={{
            playSfx,
            playMusic,
            isMuted,
            toggleMute
        }}>
            {children}
        </SoundContext.Provider>
    );
}
