(function(APP) {
    const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const MODAL_SYSTEMS = {
        major: {
            name: "Major (Ionian) System",
            parentIntervals: [0, 2, 4, 5, 7, 9, 11],
            modes: [
                { id: 'IONIAN', name: 'Ionian', rotation: 0, aliases: ['Major'] },
                { id: 'DORIAN', name: 'Dorian', rotation: 1 },
                { id: 'PHRYGIAN', name: 'Phrygian', rotation: 2 },
                { id: 'LYDIAN', name: 'Lydian', rotation: 3 },
                { id: 'MIXOLYDIAN', name: 'Mixolydian', rotation: 4 },
                { id: 'AEOLIAN', name: 'Aeolian', rotation: 5, aliases: ['Natural Minor'] },
                { id: 'LOCRIAN', name: 'Locrian', rotation: 6 }
            ]
        },
        melodicMinor: {
            name: "Melodic Minor (Jazz Minor) System",
            parentIntervals: [0, 2, 3, 5, 7, 9, 11],
            modes: [
                { id: 'MELODIC_MINOR', name: 'Melodic Minor', rotation: 0, aliases: ['Jazz Minor'] },
                { id: 'DORIAN_B2', name: 'Dorian ♭2', rotation: 1, aliases: ['Phrygian ♮6'] },
                { id: 'LYDIAN_AUG', name: 'Lydian Augmented', rotation: 2, aliases: ['#4 #5'] },
                { id: 'LYDIAN_DOM', name: 'Lydian Dominant', rotation: 3, aliases: ['Lydian ♭7', 'Overtone'] },
                { id: 'MIXOLYDIAN_B6', name: 'Mixolydian ♭6', rotation: 4 },
                { id: 'LOCRIAN_NAT2', name: 'Locrian ♮2', rotation: 5, aliases: ['Half-dim ♮9'] },
                { id: 'ALTERED', name: 'Altered', rotation: 6, aliases: ['Super Locrian'] }
            ]
        },
        harmonicMinor: {
            name: "Harmonic Minor System",
            parentIntervals: [0, 2, 3, 5, 7, 8, 11],
            modes: [
                { id: 'HARMONIC_MINOR', name: 'Harmonic Minor', rotation: 0 },
                { id: 'LOCRIAN_NAT6', name: 'Locrian ♮6', rotation: 1 },
                { id: 'IONIAN_SHARP5', name: 'Ionian ♯5', rotation: 2 },
                { id: 'DORIAN_SHARP4', name: 'Dorian ♯4', rotation: 3 },
                { id: 'PHRYGIAN_DOM', name: 'Phrygian Dominant', rotation: 4 },
                { id: 'LYDIAN_SHARP2', name: 'Lydian ♯2', rotation: 5 },
                { id: 'ULTRA_LOCRIAN', name: 'Ultra-Locrian', rotation: 6 }
            ]
        },
        harmonicMajor: {
            name: "Harmonic Major System",
            parentIntervals: [0, 2, 4, 5, 7, 8, 11],
            modes: [
                { id: 'HARMONIC_MAJOR', name: 'Harmonic Major', rotation: 0 },
                { id: 'DORIAN_B5', name: 'Dorian ♭5', rotation: 1 },
                { id: 'PHRYGIAN_B4', name: 'Phrygian ♭4', rotation: 2 },
                { id: 'LYDIAN_B3', name: 'Lydian ♭3', rotation: 3 },
                { id: 'MIXOLYDIAN_B2', name: 'Mixolydian ♭2', rotation: 4 },
                { id: 'LYDIAN_AUG_SHARP2', name: 'Lydian Aug ♯2', rotation: 5 },
                { id: 'LOCRIAN_BB7', name: 'Locrian ♭♭7', rotation: 6 }
            ]
        }
    };

    const MODES = ['FREE'];
    Object.values(MODAL_SYSTEMS).forEach(system => {
        system.modes.forEach(mode => {
            MODES.push(mode.id);
        });
    });

    const MODE_DISPLAY_NAMES = {
        'IONIAN': 'IONIAN', 'DORIAN': 'DORIAN', 'PHRYGIAN': 'PHRYGIAN', 'LYDIAN': 'LYDIAN', 'MIXOLYDIAN': 'MIXOLYDIAN', 'AEOLIAN': 'AEOLIAN', 'LOCRIAN': 'LOCRIAN',
        'MELODIC_MINOR': 'MELODIC\nMINOR', 'DORIAN_B2': 'DORIAN\n♭2', 'LYDIAN_AUG': 'LYDIAN\nAUGMENTED', 'LYDIAN_DOM': 'LYDIAN\nDOMINANT', 'MIXOLYDIAN_B6': 'MIXOLYDIAN\n♭6', 'LOCRIAN_NAT2': 'LOCRIAN\n♮2', 'ALTERED': 'ALTERED',
        'HARMONIC_MINOR': 'HARMONIC\nMINOR', 'LOCRIAN_NAT6': 'LOCRIAN\n♮6', 'IONIAN_SHARP5': 'IONIAN\n♯5', 'DORIAN_SHARP4': 'DORIAN\n♯4', 'PHRYGIAN_DOM': 'PHRYGIAN\nDOMINANT', 'LYDIAN_SHARP2': 'LYDIAN\n♯2', 'ULTRA_LOCRIAN': 'ULTRA\nLOCRIAN',
        'HARMONIC_MAJOR': 'HARMONIC MAJOR', 'DORIAN_B5': 'DORIAN\n♭5', 'PHRYGIAN_B4': 'PHRYGIAN\n♭4', 'LYDIAN_B3': 'LYDIAN\n♭3', 'MIXOLYDIAN_B2': 'MIXOLYDIAN\n♭2', 'LYDIAN_AUG_SHARP2': 'LYDIAN\nAUGMENTED\n♯2', 'LOCRIAN_BB7': 'LOCRIAN\n♭♭7'
    };

    const DIATONIC_CHORD_QUALITIES = {
        'IONIAN': ['major7', 'minor7', 'minor7', 'major7', '7', 'minor7', 'm7b5'], 'DORIAN': ['minor7', 'minor7', 'major7', '7', 'minor7', 'm7b5', 'major7'], 'PHRYGIAN': ['minor7', 'major7', '7', 'minor7', 'm7b5', 'major7', '7'], 'LYDIAN': ['major7', '7', 'minor7', 'm7b5', 'major7', 'minor7', 'm7b5'], 'MIXOLYDIAN': ['7', 'minor7', 'm7b5', 'major7', 'minor7', 'm7b5', 'major7'], 'AEOLIAN': ['minor7', 'm7b5', 'major7', 'minor7', '7', 'major7', '7'], 'LOCRIAN': ['m7b5', 'major7', '7', 'minor7', 'major7', '7', 'major7'],
        'MELODIC_MINOR': ['minorMajor7', 'minor7', 'major7#5', '7', '7', 'm7b5', 'm7b5'], 'DORIAN_B2': ['minor7', 'major7', '7', 'minor7', 'm7b5', 'major7', '7'], 'LYDIAN_AUG': ['major7#5', '7', 'minor7', 'm7b5', 'major7', 'minor7', 'm7b5'], 'LYDIAN_DOM': ['7', '7', 'm7b5', 'm7b5', 'major7', 'minor7', 'm7b5'], 'MIXOLYDIAN_B6': ['7', 'm7b5', 'm7b5', 'major7', 'minor7', 'major7', '7'], 'LOCRIAN_NAT2': ['m7b5', 'm7b5', 'major7', 'minor7', '7', 'major7', '7'], 'ALTERED': ['7', 'major7', '7', 'm7b5', 'major7', '7', 'major7'],
        'HARMONIC_MINOR': ['minorMajor7', 'm7b5', 'major7#5', 'minor7', '7', 'major7', 'dim7'], 'LOCRIAN_NAT6': ['m7b5', 'major7', '7', 'minor7', '7', 'major7', '7'], 'IONIAN_SHARP5': ['major7#5', 'minor7', 'm7b5', 'major7', '7', 'm7b5', 'm7b5'], 'DORIAN_SHARP4': ['minor7', 'minor7', 'major7', 'm7b5', 'minor7', 'm7b5', 'major7'], 'PHRYGIAN_DOM': ['7', 'major7', 'm7b5', 'minor7', 'major7', '7', 'major7'], 'LYDIAN_SHARP2': ['major7', 'major7', 'm7b5', 'm7b5', '7', 'minor7', 'dim7'], 'ULTRA_LOCRIAN': ['dim7', '7', 'major7', 'm7b5', '7', 'major7', '7'],
        'HARMONIC_MAJOR': ['major7', 'minor7', 'minor7', '7', '7', 'major7', 'dim7'], 'DORIAN_B5': ['minor7', 'm7b5', 'major7', 'minor7', '7', 'major7', '7'], 'PHRYGIAN_B4': ['minor7', 'major7', '7', 'minor7', 'm7b5', 'major7', '7'], 'LYDIAN_B3': ['minorMajor7', 'minor7', 'major7', 'm7b5', '7', 'minor7', 'm7b5'], 'MIXOLYDIAN_B2': ['7', 'major7', 'm7b5', 'major7', '7', 'minor7', 'major7'], 'LYDIAN_AUG_SHARP2': ['major7#5', 'major7', 'm7b5', 'm7b5', 'major7', 'minor7', 'dim7'], 'LOCRIAN_BB7': ['m7b5', 'major7', '7', 'minor7', '7', 'major7', '7']
    };
    const SOUNDS = ['11', '22', '33', '44', '55'];
    const SIZE_MODES = ['XL', 'XXL', 'XXXL', 'X'];
    const BASS_SEQUENCE = [-11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    const SHARP_TO_FLAT = { 'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb' };
    const FLAT_TO_SHARP = { 'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#' };
    const CHORD_LIBRARY = {
        major: { intervals: [0, 4, 7], display: '' }, minor: { intervals: [0, 3, 7], display: 'm' }, dim: { intervals: [0, 3, 6], display: 'dim' }, augmented: { intervals: [0, 4, 8], display: 'aug' }, '5': { intervals: [0, 7], display: '5' }, '7': { intervals: [0, 4, 7, 10], display: '7' }, major7: { intervals: [0, 4, 7, 11], display: 'maj7' }, M7: { intervals: [0, 4, 7, 11], display: 'M7' }, m7: { intervals: [0, 3, 7, 10], display: 'm7' }, minor7: { intervals: [0, 3, 7, 10], display: 'm7' }, dim7: { intervals: [0, 3, 6, 9], display: 'dim7' }, 'm7b5': { intervals: [0, 3, 6, 10], display: 'm7b5' }, 'φ7': { intervals: [0, 3, 6, 10], display: 'φ7' }, minorMajor7: { intervals: [0, 3, 7, 11], display: 'm(maj7)' }, major9: { intervals: [0, 4, 7, 11, 14], display: 'maj9' }, m9: { intervals: [0, 3, 7, 10, 14], display: 'm9' }, minor9: { intervals: [0, 3, 7, 10, 14], display: 'm9' }, '9': { intervals: [0, 4, 7, 10, 14], display: '9' }, add9: { intervals: [0, 4, 7, 14], display: 'add9' }, '7b9': { intervals: [0, 4, 7, 10, 13], display: '7b9' }, '7#9': { intervals: [0, 4, 7, 10, 15], display: '7#9' }, '7b13': { intervals: [0, 4, 7, 10, 20], display: '7b13' }, '7#11': { intervals: [0, 4, 7, 10, 18], display: '7#11' }, 'maj7#11': { intervals: [0, 4, 7, 11, 18], display: 'maj7#11' }, '7alt': { intervals: [0, 4, 7, 10, 13, 15, 18, 20], display: '7alt' }, dim9: { intervals: [0, 3, 6, 9, 14], display: 'dim9' }, aug9: { intervals: [0, 4, 8, 10, 14], display: 'aug9' }, '11': { intervals: [0, 4, 7, 10, 14, 17], display: '11' }, 'm11': { intervals: [0, 3, 7, 10, 14, 17], display: 'm11' }, minor11: { intervals: [0, 3, 7, 10, 14, 17], display: 'm11' }, 'm11add13': { intervals: [0, 3, 7, 10, 14, 17, 21], display: 'm11add13' }, 'm11add9': { intervals: [0, 3, 7, 10, 14, 17], display: 'm11add9' }, major11: { intervals: [0, 4, 7, 11, 14, 17], display: 'maj11' }, 'major13': { intervals: [0, 4, 7, 11, 14, 21], display: 'maj13' }, 'm13': { intervals: [0, 3, 7, 10, 14, 21], display: 'm13' }, minor13: { intervals: [0, 3, 7, 10, 14, 21], display: 'm13' }, '13': { intervals: [0, 4, 7, 10, 14, 21], display: '13' }, '13sus': { intervals: [0, 5, 7, 10, 14, 21], display: '13sus' }, '13b9': { intervals: [0, 4, 7, 10, 13, 21], display: '13b9' }, 'm11b5': { intervals: [0, 3, 6, 10, 14, 17], display: 'm11b5' }, sus2: { intervals: [0, 2, 7], display: 'sus2' }, sus4: { intervals: [0, 5, 7], display: 'sus4' }, '7sus': { intervals: [0, 5, 7, 10], display: '7sus' }, '7sus4': { intervals: [0, 5, 7, 10], display: '7sus4' }, '9sus': { intervals: [0, 5, 7, 10, 14], display: '9sus' }, '7sus2': { intervals: [0, 2, 7, 10], display: '7sus2' }, '7sus2b9': { intervals: [0, 2, 7, 10, 13], display: '7sus2b9' }, '6': { intervals: [0, 4, 7, 9], display: '6' }, m6: { intervals: [0, 3, 7, 9], display: 'm6' }, minor6: { intervals: [0, 3, 7, 9], display: 'm6' }, '69': { intervals: [0, 4, 7, 9, 14], display: '6/9' }, 'm69': { intervals: [0, 3, 7, 9, 14], display: 'm6/9' }, 'sus2 add13': { intervals: [0, 2, 7, 21], display: 'sus2 add13' }, 'sus2 add13 no5': { intervals: [0, 2, 21], display: 'sus2 add13 no5' }, 'sus2 add11': { intervals: [0, 2, 7, 17], display: 'sus2 add11' }, '7 add11 no5': { intervals: [0, 4, 10, 17], display: '7 add11 no5' }, '7 no5': { intervals: [0, 4, 10], display: '7 no5' }, 'maj7 no3': { intervals: [0, 7, 11], display: 'maj7 no3' }, 'add11': { intervals: [0, 4, 7, 17], display: 'add11' }, 'major7#5': { intervals: [0, 4, 8, 11], display: 'maj7#5' }
    };
    const CHORD_ALIASES = {
        'maj7': 'major7', 'M7': 'major7', 'Maj7': 'major7', 'maj': 'major', 'Maj': 'major', 'm': 'minor', 'min': 'minor', 'min7': 'm7', 'min9': 'm9', 'min11': 'm11', 'min13': 'm13', 'min6': 'm6', 'min69': 'm69', 'minmaj7': 'minorMajor7', 'm7': 'm7', 'maj9': 'major9', 'm9': 'm9', 'maj11': 'major11', 'maj13': 'major13', 'm11': 'm11', 'm13': 'm13', 'aug': 'augmented', 'dim': 'dim', 'ø7': 'm7b5', 'halfdim': 'm7b5', 'half-diminished': 'm7b5', '7sus': '7sus', '7sus2': '7sus2', '7sus4': '7sus4', 'sus4': 'sus4', 'sus2': 'sus2', 'm6': 'minor6', '6/9': '69', '6-9': '69', 'm6/9': 'm69', 'sus2add13': 'sus2 add13', 'sus2add13no5': 'sus2 add13 no5', 'sus2add11': 'sus2 add11', '7add11no5': '7 add11 no5', '7no5': '7 no5', 'maj7no3': 'maj7 no3', 'maj7#11': 'maj7#11'
    };
    const ALL_CHORD_TYPES = [
        'major', 'minor', 'dim', 'augmented', '5', 'major7', 'm7', '7', 'dim7', 'm7b5', 'φ7', 'minorMajor7', 'major9', 'm9', '9', 'add9', '7b9', '7#9', '7b13', '7#11', 'maj7#11', '7alt', 'dim9', 'aug9', '11', 'm11', 'm11add13', 'm11add9', 'major11', 'major13', 'm13', '13', '13sus', '13b9', 'm11b5', 'sus2', 'sus4', '7sus', '7sus4', '9sus', '7sus2', '7sus2b9', '6', 'm6', '69', 'm69', 'sus2 add13', 'sus2 add13 no5', 'sus2 add11', '7 add11 no5', '7 no5', 'maj7 no3', 'add11'
    ];

    class MusicEngine {
        static getScaleNotes(key, mode) {
            if (!key || !mode || mode === 'FREE') return KEYS;
            const keyIndex = KEYS.indexOf(key);
            if (keyIndex === -1) return KEYS;
            let modeIntervals = null;
            for (const system of Object.values(MODAL_SYSTEMS)) {
                const foundMode = system.modes.find(m => m.id === mode);
                if (foundMode) {
                    modeIntervals = this.rotateIntervals(system.parentIntervals, foundMode.rotation);
                    break;
                }
            }
            if (!modeIntervals) return [0, 2, 4, 5, 7, 9, 11].map(interval => KEYS[(keyIndex + interval) % 12]);
            return modeIntervals.map(interval => KEYS[(keyIndex + interval) % 12]);
        }
        static rotateIntervals(intervals, rotation) {
            if (rotation === 0) return intervals;
            const rotated = [...intervals];
            for (let i = 0; i < rotation; i++) {
                rotated.push(rotated.shift());
            }
            const root = rotated[0];
            return rotated.map(interval => (interval - root + 12) % 12);
        }
        static getAvailableChords(note, mode, selectedKey) {
            if (!note || !mode || !selectedKey || mode === 'FREE') return ALL_CHORD_TYPES;
            const scaleNotes = this.getScaleNotes(selectedKey, mode);
            if (!scaleNotes.includes(note)) return [];
            const degree = scaleNotes.indexOf(note);
            const chordQuality = DIATONIC_CHORD_QUALITIES[mode];
            if (chordQuality && chordQuality[degree]) {
                 const baseChord = chordQuality[degree];
                 switch (baseChord) {
                    case 'major7': return ['major', 'major7', 'major9', 'major11', 'major13', '6', '69', 'sus2', 'sus4'];
                    case 'minor7': return ['minor', 'm7', 'm9', 'm11', 'm13', 'm6', 'sus2', 'sus4'];
                    case '7': return ['major', '7', '9', '11', '13', 'sus2', 'sus4'];
                    case 'm7b5': return ['dim', 'm7b5', 'dim7'];
                    case 'minorMajor7': return ['minor', 'minorMajor7', 'minor9', 'minor11', 'minor13', 'm6', 'sus2', 'sus4'];
                    case 'major7#5': return ['augmented', 'major7#5', 'aug9', 'sus2', 'sus4'];
                    case 'dim7': return ['dim', 'dim7', 'dim9'];
                    default: return ['major'];
                }
            }
            return ['major'];
        }
        static getModeDisplayName(mode) { return MODE_DISPLAY_NAMES[mode] || mode; }
        static getModalSystems() { return MODAL_SYSTEMS; }
        static getSystemForMode(modeId) {
            for (const [sysName, system] of Object.entries(MODAL_SYSTEMS)) {
                if (system.modes.some(m => m.id === modeId)) {
                    return { systemName: sysName, system };
                }
            }
            return null;
        }
        static generateChord(root, type, octave, inversion) {
            if (!root || !type) return [60];
            const rootIndex = KEYS.indexOf(root);
            if (rootIndex === -1) return [60];
            const chordDef = CHORD_LIBRARY[type];
            if (!chordDef || !chordDef.intervals) return [60 + rootIndex];
            const baseNote = 60 + (octave * 12) + rootIndex;
            let notes = chordDef.intervals.map(interval => baseNote + interval);
            if (inversion > 0) {
                for (let i = 0; i < inversion && i < notes.length; i++) notes[i] += 12;
            } else if (inversion < 0) {
                for (let i = notes.length + inversion; i < notes.length && i >= 0; i++) notes[i] -= 12;
            }
            return notes;
        }
        static getChordName(note, type, useFlats = false) {
            if (!note || !type) return 'C';
            const displayNote = useFlats && SHARP_TO_FLAT[note] ? SHARP_TO_FLAT[note] : note;
            const chordDef = CHORD_LIBRARY[type];
            const suffix = chordDef && chordDef.display !== undefined ? chordDef.display : '';
            return displayNote + suffix;
        }
        static getBassNote(rootNote, bassOffsetSemitones, chordType = null) {
            if (!rootNote || typeof rootNote !== 'number') return 36;
            let bassNote = rootNote - 24 + (bassOffsetSemitones || 0);
            while (bassNote < 24) bassNote += 12;
            return bassNote;
        }
        static getChordNameWithBass(note, type, chordKey, bassOffsets, useFlats = false) {
            const baseName = this.getChordName(note, type, useFlats);
            if (!bassOffsets || !chordKey) return baseName;
            const bassOffset = bassOffsets[chordKey];
            if (!bassOffset) return baseName;
            const rootIndex = KEYS.indexOf(note);
            if (rootIndex === -1) return baseName;
            const bassNoteIndex = (rootIndex + bassOffset + 12) % 12;
            const bassNote = KEYS[bassNoteIndex];
            if (!bassNote) return baseName;
            return baseName + '/' + bassNote;
        }
    }

    // Expose constants and class to the global APP namespace
    APP.KEYS = KEYS;
    APP.MODES = MODES;
    APP.SOUNDS = SOUNDS;
    APP.SIZE_MODES = SIZE_MODES;
    APP.BASS_SEQUENCE = BASS_SEQUENCE;
    APP.SHARP_TO_FLAT = SHARP_TO_FLAT;
    APP.FLAT_TO_SHARP = FLAT_TO_SHARP;
    APP.MusicEngine = MusicEngine;

})(window.APP);
