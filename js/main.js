(function(APP) {
    let audioStarted = false;
    let audioEngine; // Declare here, instantiate after Tone.start()

    async function startAudioContext() {
        if (audioStarted) return;
        try {
            await Tone.start();
            console.log('Audio context started successfully.');

            // Instantiate and initialize the engine AFTER the context is started
            audioEngine = new APP.AudioEngine();
            audioEngine.initialize();
            APP.audioEngine = audioEngine; // Make it globally accessible via the namespace

            audioStarted = true;

            await APP.initializeMIDI(audioEngine, APP.handleSlotPress, APP.handleSlotRelease);
            audioEngine.setFilterCutoff(APP.state.filterCutoff);
            audioEngine.setInstrument(APP.state.selectedSound);
            if (audioEngine.setReverb) {
                audioEngine.setReverb(10);
            }
        } catch(e) {
            console.error("Could not start audio context", e);
        }
    }

    APP.getSlotCount = function() {
        return { 'XL': 1, 'XXL': 2, 'XXXL': 3, 'X': 4 }[APP.state.sizeMode] || 1;
    }

    APP.getCurrentChordType = function(note, slotIndex = 0) {
        const availableChords = APP.MusicEngine.getAvailableChords(note, APP.state.mode, APP.state.selectedKey);
        const chordIndex = APP.state.slotChordIndices[note + '-' + slotIndex] || 0;
        return availableChords[chordIndex] || 'major';
    }

    APP.createChord = function(root, type, octave = APP.state.octave, inversion = APP.state.inversion) {
        if (!root || !type) return null;
        const notes = APP.MusicEngine.generateChord(root, type, octave, inversion);
        const name = APP.MusicEngine.getChordName(root, type, APP.state.useFlats);
        return { root, type, notes, name, octave, inversion };
    }

    APP.playChord = function(chord, velocity = 1, slotIndex = 0, source = 'user', bassOffsetOverride = null, octave, inversion) {
        if (!chord || !chord.notes || !audioEngine) return;
        APP.state.currentChord = chord;
        APP.state.lastPlayedChord = chord;
        APP.updateChordDisplay();
        const velocityGain = velocity;
        chord.notes.forEach(note => {
            const freq = Tone.Frequency(note, 'midi').toFrequency();
            audioEngine.startOsc(freq, false, velocityGain, source);
        });
        const rootNote = 60 + (octave * 12) + APP.KEYS.indexOf(chord.root);
        const bassOffset = bassOffsetOverride !== null ? bassOffsetOverride : (APP.state.bassOffsets[chord.root + '-' + chord.type + '-' + slotIndex] || 0);
        const bassNoteMidi = APP.MusicEngine.getBassNote(rootNote, bassOffset, chord.type);
        const bassFreq = Tone.Frequency(bassNoteMidi, 'midi').toFrequency();
        audioEngine.startOsc(bassFreq, true, velocityGain, source);
    }

    document.addEventListener('DOMContentLoaded', function() {
        console.log('🚀 DOMContentLoaded event fired. Attaching listeners.');

        const setupInteraction = (elementId, handler) => {
            const element = document.getElementById(elementId);
            if (element) {
                element.addEventListener('click', (e) => {
                    startAudioContext();
                    handler(e);
                });
            }
        };

        const setupPianoInteraction = () => {
            const piano = document.getElementById('piano-section');
            if(piano) {
                piano.addEventListener('mousedown', (e) => {
                    const slot = e.target.closest('.key-slot');
                    if (slot) {
                        startAudioContext();
                        const note = slot.dataset.note;
                        const slotIndex = parseInt(slot.dataset.slot);
                        APP.handleSlotPress(note, slotIndex);
                    }
                });
                piano.addEventListener('mouseup', (e) => {
                    const slot = e.target.closest('.key-slot');
                     if (slot) {
                        const note = slot.dataset.note;
                        const slotIndex = parseInt(slot.dataset.slot);
                        APP.handleSlotRelease(note, slotIndex);
                    }
                });
            }
        }

        setupInteraction('bass-btn', APP.handleBassPress);
        setupInteraction('oct-btn', () => { APP.state.selectedControl = APP.state.selectedControl === 'octave' ? null : 'octave'; APP.updateControlValues(); });
        setupInteraction('inv-btn', () => { APP.state.selectedControl = APP.state.selectedControl === 'inversion' ? null : 'inversion'; APP.updateControlValues(); });
        setupInteraction('key-btn', () => { APP.state.selectedControl = APP.state.selectedControl === 'key' ? null : 'key'; APP.updateControlValues(); });
        setupInteraction('mode-btn', () => { APP.state.selectedControl = APP.state.selectedControl === 'mode' ? null : 'mode'; APP.updateControlValues(); });
        setupInteraction('sounds-btn', () => { APP.state.selectedControl = APP.state.selectedControl === 'sounds' ? null : 'sounds'; APP.updateControlValues(); });
        setupInteraction('filter-knob', () => { APP.state.selectedControl = APP.state.selectedControl === 'filter' ? null : 'filter'; APP.updateControlValues(); });
        setupInteraction('transpose-knob', () => { APP.state.selectedControl = APP.state.selectedControl === 'transpose' ? null : 'transpose'; APP.updateControlValues(); });
        setupInteraction('xl-button', APP.handleSizePress);
        setupInteraction('plus-btn', APP.handlePlus);
        setupInteraction('minus-btn', APP.handleMinus);

        setupInteraction('play-btn', APP.handlePlay);
        setupInteraction('stop-btn', APP.handleStop);
        setupInteraction('progression-btn', () => {
            const sequencer = document.getElementById('sequencer');
            sequencer.classList.toggle('hidden');
            if (!sequencer.classList.contains('hidden')) {
                APP.buildStepGrid();
            }
        });

        setupPianoInteraction();

        APP.buildStepGrid();
        APP.updateUI();
        console.log('Piano XL HD initialized successfully');
    });

})(window.APP);
