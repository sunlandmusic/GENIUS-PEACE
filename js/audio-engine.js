(function(APP) {
    class AudioEngine {
        constructor() {
            this.audioContext = null;
            this.activeVoices = new Set();
            this.bassGain = 0.3;
            this.chordGain = 0.3;
            this.midiAccess = null;
            this.midiInputs = new Map();
            this.midiOutputs = new Map();
            this.midiOutput = null;
            this.onMidiNote = null;
            this.sustainPedal = false;
            this.sustainedNotes = new Set();
            this.activeNotes = new Set();
            this.filterNode = null;
            this.masterGain = null;
            this.lowEQ = null;
            this.midEQ = null;
            this.highEQ = null;
            this.reverbNode = null;
            this.delayNode1 = null;
            this.lastNoteTime = 0;
        }

        initialize() {
            // Use the shared Tone.js AudioContext
            this.audioContext = Tone.context;

            this.masterGain = this.audioContext.createGain();
            this.filterNode = this.audioContext.createBiquadFilter();
            this.filterNode.type = 'highshelf';
            this.filterNode.frequency.value = 2000;
            this.filterNode.gain.value = 0;

            this.lowEQ = this.audioContext.createBiquadFilter();
            this.lowEQ.type = 'lowshelf';
            this.lowEQ.frequency.value = 320;
            this.lowEQ.gain.value = 0;

            this.midEQ = this.audioContext.createBiquadFilter();
            this.midEQ.type = 'peaking';
            this.midEQ.frequency.value = 1000;
            this.midEQ.Q.value = 1;
            this.midEQ.gain.value = 0;

            this.highEQ = this.audioContext.createBiquadFilter();
            this.highEQ.type = 'highshelf';
            this.highEQ.frequency.value = 3200;
            this.highEQ.gain.value = 0;

            this.filterNode.connect(this.lowEQ);
            this.lowEQ.connect(this.midEQ);
            this.midEQ.connect(this.highEQ);
            this.highEQ.connect(this.masterGain);
            this.masterGain.connect(this.audioContext.destination);

            console.log("AudioEngine initialized with shared Tone.context.");
        }

        setFilterCutoff(value) {
            if (!this.filterNode) return;
            const gainReduction = -((10 - value) * 7.2);
            this.filterNode.gain.setValueAtTime(gainReduction, this.audioContext.currentTime);
        }

        setReverb(wetLevel) {
            if (!this.audioContext) return;
            if (!this.reverbNode) {
                this.reverbNode = this.audioContext.createConvolver();
                const sampleRate = this.audioContext.sampleRate;
                const length = sampleRate * 3.75;
                const impulse = this.audioContext.createBuffer(2, length, sampleRate);
                for (let channel = 0; channel < 2; channel++) {
                    const channelData = impulse.getChannelData(channel);
                    for (let i = 0; i < length; i++) {
                        channelData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sampleRate * 0.3));
                    }
                }
                this.reverbNode.buffer = impulse;
                this.reverbWetGain = this.audioContext.createGain();
                this.reverbWetGain.connect(this.reverbNode);
                this.reverbNode.connect(this.masterGain);
            }
            this.reverbWetGain.gain.value = wetLevel / 100;
        }

        startOsc(freq, isBass, velocityGain = 1, source = 'user') {
            if (!this.audioContext) return null;
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            osc.connect(gain);
            gain.connect(this.filterNode);
            osc.frequency.value = freq;
            osc.type = isBass ? 'sine' : 'triangle';
            const targetGain = (isBass ? this.bassGain : this.chordGain) * velocityGain;
            gain.gain.setValueAtTime(0, this.audioContext.currentTime);
            gain.gain.linearRampToValueAtTime(targetGain, this.audioContext.currentTime + 0.01);
            osc.start();
            const voice = { osc, gain, stopped: false, isBass, source };
            this.activeVoices.add(voice);
            return voice;
        }

        stopSequencerVoices() {
            const voicesToDelete = [];
            this.activeVoices.forEach(voice => {
                if (voice.source === 'seq') {
                    if (!voice.stopped) {
                        voice.stopped = true;
                        voice.gain.gain.cancelScheduledValues(this.audioContext.currentTime);
                        voice.gain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.08);
                        voice.osc.stop(this.audioContext.currentTime + 0.08);
                    }
                    voicesToDelete.push(voice);
                }
            });
            voicesToDelete.forEach(voice => this.activeVoices.delete(voice));
        }

        stopAllVoices() {
            this.activeVoices.forEach(voice => {
                if (!voice.stopped) {
                    voice.stopped = true;
                    voice.gain.gain.cancelScheduledValues(this.audioContext.currentTime);
                    voice.gain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.08);
                    voice.osc.stop(this.audioContext.currentTime + 0.08);
                }
            });
            this.activeVoices.clear();
        }
    }
    APP.AudioEngine = AudioEngine;
})(window.APP);
