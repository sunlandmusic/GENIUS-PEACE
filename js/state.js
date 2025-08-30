window.APP = {};

// Global state
APP.state = {
    selectedKey: 'C',
    mode: 'IONIAN',
    octave: 0,
    inversion: -2,
    selectedSound: '11',
    selectedControl: null,
    currentChord: null,
    chordIndices: {},
    slotChordIndices: {},
    lastPressed: null,
    activeKeys: new Set(),
    activeSlots: new Set(),
    lastActiveSlot: null,
    bassOffsets: {},
    bassOffset: 'BASS',
    lastPlayedChord: null,
    // Persist user-selected chord for writing steps even during playback
    selectedChordForStep: null,
    selectedChordMeta: null,
    disabledKeys: new Set(),
    disabledSlots: new Set(),
    useFlats: false,
    midiEnabled: false,
    sustainPedal: false,
    backgroundImage: null,
    sizeMode: 'XL',
    bassEditTarget: null,
    currentSlotLevel: 0,
    filterCutoff: 10,
    globalTranspose: 0,
    // Save/Load removed
    savedPalettes: {},
    longPressExecuted: false,
    xlCycleStart: false,
    // 1.0 = chords full, 0.0 = bass full; default one step under middle (0.32)
    faderBlend: 0.32
    ,
    // Per-slot voicing locks: note-slotIndex → { octave, inversion }
    slotVoicingLocks: {},
    // Sequence loop for continuous playback
    sequenceLoop: null,
    currentLoopIndex: 0,
    // Scale degree display toggle
    showScaleDegrees: false,
    // Effects mode toggle
    effectsMode: true,
    reverbLevel: 1, // Default to 1 for subtle reverb on startup
    delayLevel: 0,
    // Flag to prevent click from de-selecting after long-press toggle
    longPressToggleExecuted: false,
    // === FLAM FEATURE ===
    flamMode: 'off', // 'off', 'slow', 'mid', 'fast'
    flamTiming: { slow: 90, mid: 50, fast: 30 }, // milliseconds between notes
    currentFlamTimeouts: [],
    cancelledNotes: new Set()
};

APP.scrollSpeeds = {
    'sounds': 300, // slow
    'mode': 250,   // slow
    'xl': 250,     // slow
    'key': 150,
    'octave': 200,
    'inversion': 200,
    'transpose': 100, // fast
    'filter': 100,    // fast
    'bass': 150,
    'tempo': 50,      // very fast
    'sequence': 200,
    'duration': 150,
    'default': 200 // for chord cycling
};
