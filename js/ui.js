(function(APP) {
    function getModeDisplayName(mode) {
        return APP.MusicEngine.getModeDisplayName(mode);
    }

    function getModalSystemName(mode) {
        if (mode === 'FREE') return 'UNRESTRICTED';
        const systemInfo = APP.MusicEngine.getSystemForMode(mode);
        if (!systemInfo) return 'MODE';
        const systemDisplayNames = {
            'major': 'MAJOR',
            'melodicMinor': 'MELODIC MINOR',
            'harmonicMinor': 'HARMONIC MINOR',
            'harmonicMajor': 'HARMONIC MAJOR'
        };
        return systemDisplayNames[systemInfo.systemName] || 'MODE';
    }

    function adjustModeButtonFontSize(modeValue) {
        const modeButton = document.getElementById('mode-value');
        if (!modeButton) return;
        if (modeValue.includes('\n')) {
            const lines = modeValue.split('\n');
            const lineCount = lines.length;
            if (lineCount === 3) {
                const bottomLine = lines[2];
                if (bottomLine.length > 8) modeButton.style.fontSize = '11px';
                else if (bottomLine.length > 6) modeButton.style.fontSize = '12px';
                else modeButton.style.fontSize = '13px';
            } else if (lineCount === 2) {
                const secondLine = lines[1];
                if (secondLine.length > 10) modeButton.style.fontSize = '12px';
                else if (secondLine.length > 8) modeButton.style.fontSize = '13px';
                else if (secondLine.length > 6) modeButton.style.fontSize = '14px';
                else modeButton.style.fontSize = '15px';
            }
        } else {
            modeButton.style.fontSize = '16px';
        }
    }

    function updateUI() {
        APP.updateControlValues();
        APP.updatePianoKeys();
        APP.updateChordDisplay();
        APP.updateSlotIndicator();
        APP.updateMIDIIndicator();
        APP.updateFlamIndicator();
    }

    function updateControlValues() {
        console.log("Updating control values. Selected control:", APP.state.selectedControl);
        document.getElementById('key-value').textContent = APP.state.useFlats && APP.SHARP_TO_FLAT[APP.state.selectedKey] ? APP.SHARP_TO_FLAT[APP.state.selectedKey] : APP.state.selectedKey;
        document.getElementById('mode-value').textContent = getModeDisplayName(APP.state.mode);
        const modeHeader = document.getElementById('mode-header');
        const modeValue = getModeDisplayName(APP.state.mode);
        const modeButton = document.getElementById('mode-btn');
        modeHeader.textContent = getModalSystemName(APP.state.mode);
        if (APP.state.mode === 'FREE') {
            modeHeader.removeAttribute('data-system');
        } else {
            const systemInfo = APP.MusicEngine.getSystemForMode(APP.state.mode);
            if (systemInfo) modeHeader.setAttribute('data-system', systemInfo.systemName);
        }
        if (modeButton) modeButton.setAttribute('data-current-mode', APP.state.mode);
        adjustModeButtonFontSize(modeValue);
        document.getElementById('oct-value').textContent = APP.state.octave;
        document.getElementById('inv-value').textContent = APP.state.inversion;
        document.getElementById('sound-name').textContent = APP.state.selectedSound;
        if (APP.state.effectsMode) {
            document.getElementById('filter-value').textContent = APP.state.reverbLevel;
            document.getElementById('transpose-value').textContent = APP.state.delayLevel;
        } else {
            document.getElementById('filter-value').textContent = APP.state.filterCutoff;
            document.getElementById('transpose-value').textContent = APP.state.globalTranspose >= 0 ? `+${APP.state.globalTranspose}` : APP.state.globalTranspose;
        }
        document.getElementById('xl-button').textContent = APP.state.sizeMode;
        const bassBtn = document.getElementById('bass-btn');
        if (APP.state.selectedControl === 'bass') {
            bassBtn.textContent = APP.state.bassOffset === 'BASS' ? '𝄢' : APP.state.bassOffset;
        } else {
            bassBtn.textContent = '𝄢';
        }
        document.querySelectorAll('.control-btn, .knob, .xl-button, #tempo-display').forEach(btn => btn.classList.remove('selected'));
        const selectedIdMap = {
            key: 'key-btn', mode: 'mode-btn', octave: 'oct-btn', inversion: 'inv-btn', sounds: 'sounds-btn',
            transpose: 'transpose-knob', filter: 'filter-knob', bass: 'bass-btn', tempo: 'tempo-display'
        };
        if (APP.state.selectedControl === 'xl') {
            document.getElementById('xl-button')?.classList.add('selected');
        } else if (APP.state.selectedControl && selectedIdMap[APP.state.selectedControl]) {
            document.getElementById(selectedIdMap[APP.state.selectedControl])?.classList.add('selected');
        }
        const glow = '0 0 10px 2px rgba(78, 34, 16, 0.9)';
        const octBtn = document.getElementById('oct-btn');
        const invBtn = document.getElementById('inv-btn');
        if (APP.state.selectedControl === 'octave') {
            octBtn.style.boxShadow = glow; octBtn.style.border = '';
        } else { octBtn.style.boxShadow = ''; octBtn.style.border = ''; }
        if (APP.state.selectedControl === 'inversion') {
            invBtn.style.boxShadow = glow; invBtn.style.border = '';
        } else { invBtn.style.boxShadow = ''; invBtn.style.border = ''; }
    }

    function updatePianoKeys() {
        const scaleNotes = APP.MusicEngine.getScaleNotes(APP.state.selectedKey, APP.state.mode);
        const pianoSection = document.getElementById('piano-section');
        pianoSection.className = `piano-section mode-${APP.state.sizeMode.toLowerCase()}`;
        APP.KEYS.forEach(note => {
            const keyElement = document.getElementById(`key-${note}`);
            if (!keyElement) return;
            const isInScale = APP.state.mode === 'FREE' || scaleNotes.includes(note);
            const isDisabled = APP.state.disabledKeys.has(note);
            const hasActiveSlot = Array.from(APP.state.activeSlots).some(s => s.startsWith(note + '-'));
            keyElement.classList.remove('disabled', 'out-of-scale', 'pressed');
            if (!isInScale) keyElement.classList.add('out-of-scale');
            if (isDisabled) keyElement.classList.add('disabled');
            if (hasActiveSlot && !isDisabled && APP.state.sizeMode === 'XL') {
                keyElement.classList.add('pressed');
            }
            keyElement.innerHTML = generateKeySlots(note);
        });
    }

    function generateKeySlots(note) {
        const slotCount = APP.getSlotCount();
        let slotsHTML = '';
        for (let i = 0; i < slotCount; i++) {
            const slotKey = note + '-' + i;
            const isSlotActive = APP.state.activeSlots.has(slotKey);
            const isSlotDisabled = APP.state.disabledSlots.has(slotKey);
            const isInScale = APP.state.mode === 'FREE' || APP.MusicEngine.getScaleNotes(APP.state.selectedKey, APP.state.mode).includes(note);
            const isKeyDisabled = APP.state.disabledKeys.has(note);
            let slotClass = 'key-slot';
            if (isSlotActive && !isKeyDisabled) slotClass += ' active';
            if (isSlotDisabled) slotClass += ' disabled';
            const shouldShowText = isInScale && !isKeyDisabled && !isSlotDisabled;
            let displayContent = '';
            if (shouldShowText) {
                 if (APP.state.showScaleDegrees && APP.state.mode !== 'FREE') {
                    const scaleDegreeText = APP.getScaleDegreeText(note, APP.state.mode);
                    if (scaleDegreeText) displayContent = `<span class="slot-text scale-degree">${scaleDegreeText}</span>`;
                } else {
                    const chordType = APP.getCurrentChordType(note, i);
                    if (chordType) {
                        const chordKey = note + '-' + chordType + '-' + i;
                        const chordName = APP.MusicEngine.getChordNameWithBass(note, chordType, chordKey, APP.state.bassOffsets, APP.state.useFlats);
                        const lock = APP.state.slotVoicingLocks[slotKey];
                        const lockBadge = lock ? `<div style="position:absolute; top:3px; right:5px; font-size:10px; color:#c58a44;">${lock.octave} ${lock.inversion}</div>` : '';
                        displayContent = `${lockBadge}<span class="slot-text">${chordName}</span>`;
                    }
                }
            }
            slotsHTML += `<div class="${slotClass}" data-note="${note}" data-slot="${i}">${displayContent}</div>`;
        }
        return slotsHTML;
    }

    APP.updateUI = updateUI;
    APP.updateControlValues = updateControlValues;
    APP.updatePianoKeys = updatePianoKeys;
    APP.updateChordDisplay = function() {
        const chordValue = document.getElementById('chord-value');
        const chordName = APP.state.currentChord?.name || '---';
        if (chordName.length > 12) chordValue.style.fontSize = '12.5px';
        else if (chordName.length > 8) chordValue.style.fontSize = '15px';
        else chordValue.style.fontSize = '20px';
        chordValue.textContent = chordName;
    };
    APP.updateSlotIndicator = function() {
        const indicator = document.getElementById('slot-indicator');
        const slotNumber = document.getElementById('slot-number');
        if (APP.getSlotCount() > 1) {
            indicator.classList.add('show');
            slotNumber.textContent = APP.state.currentSlotLevel + 1;
        } else {
            indicator.classList.remove('show');
        }
    };
    APP.updateMIDIIndicator = function() {
        const dot = document.getElementById('midi-dot');
        const status = document.getElementById('midi-status');
        if (APP.state.midiEnabled) {
            dot.classList.add('active');
            status.textContent = 'ON';
        } else {
            dot.classList.remove('active');
            status.textContent = 'OFF';
        }
    };
    APP.updateFlamIndicator = function() {
        const chordInput = document.getElementById('chord-input');
        if (chordInput) {
            if (APP.state.flamMode === 'off') chordInput.placeholder = '';
            else chordInput.placeholder = `FLAM: ${APP.state.flamMode.toUpperCase()}`;
        }
    };
    APP.updateSustainIndicator = function() {
        console.log('Sustain pedal:', APP.audioEngine.sustainPedal);
    };

    APP.handleSlotPress = function(note, slotIndex) {
        if (!note) return;
        const isInScale = APP.state.mode === 'FREE' || APP.MusicEngine.getScaleNotes(APP.state.selectedKey, APP.state.mode).includes(note);
        const isDisabled = APP.state.disabledKeys.has(note);
        const slotKey = note + '-' + slotIndex;
        const isSlotDisabled = APP.state.disabledSlots.has(slotKey);
        if (APP.state.selectedControl === 'disable') {
            if (isSlotDisabled) APP.state.disabledSlots.delete(slotKey);
            else if (isDisabled) APP.state.disabledKeys.delete(note);
            else APP.state.disabledSlots.add(slotKey);
            APP.updatePianoKeys();
            return;
        }
        if (!isInScale || isDisabled || isSlotDisabled) return;
        const chordType = APP.getCurrentChordType(note, slotIndex);
        const lock = APP.state.slotVoicingLocks[note + '-' + slotIndex];
        const useOct = lock ? lock.octave : APP.state.octave;
        const useInv = lock ? lock.inversion : APP.state.inversion;
        const chord = APP.createChord(note, chordType, useOct, useInv);
        if (!chord) return;
        APP.state.lastPressed = note;
        APP.state.activeSlots.add(slotKey);
        APP.state.lastActiveSlot = slotKey;
        APP.state.currentSlotLevel = slotIndex;
        if (!APP.isPlaying) APP.audioEngine.stopAllVoices();
        APP.playChord(chord, 1, slotIndex, 'user', null, useOct, useInv);
        APP.updatePianoKeys();
    };
    APP.handleSlotRelease = function(note, slotIndex) {
        const slotKey = note + '-' + slotIndex;
        APP.state.activeSlots.delete(slotKey);
        try {
            const isInScale = APP.state.mode === 'FREE' || APP.MusicEngine.getScaleNotes(APP.state.selectedKey, APP.state.mode).includes(note);
            const isDisabled = APP.state.disabledKeys.has(note);
            const isSlotDisabled = APP.state.disabledSlots.has(slotKey);
            if (isInScale && !isDisabled && !isSlotDisabled) {
                const chordType = APP.getCurrentChordType(note, slotIndex);
                const lock = APP.state.slotVoicingLocks[note + '-' + slotIndex];
                const useOct = lock ? lock.octave : APP.state.octave;
                const useInv = lock ? lock.inversion : APP.state.inversion;
                const chord = APP.createChord(note, chordType, useOct, useInv);
                if (chord && chord.notes) {
                    const transposedChordNotes = chord.notes.map(n => n + APP.state.globalTranspose);
                    transposedChordNotes.forEach(mn => APP.audioEngine.sendNoteOff(mn, 15));
                    const rootIndex = APP.KEYS.indexOf(chord.root);
                    let originalRootNote = 60 + (useOct * 12) + rootIndex + APP.state.globalTranspose;
                    if (APP.state.globalTranspose < 0) originalRootNote += 12;
                    const chordKey = chord.root + '-' + chord.type + '-' + slotIndex;
                    const bassOffsetSemitones = APP.state.bassOffsets[chordKey] || 0;
                    const bassNote = APP.MusicEngine.getBassNote(originalRootNote, bassOffsetSemitones, chord.type);
                    APP.audioEngine.sendNoteOff(bassNote, 14);
                }
            }
        } catch {}
        if (!APP.state.sustainPedal) {
            const hasOtherActiveKeys = APP.state.activeSlots.size > 0;
            if (!hasOtherActiveKeys && !APP.isPlaying) APP.audioEngine.stopAllVoices();
        }
        APP.updatePianoKeys();
    };
    APP.handlePlus = function() {
        if (APP.state.selectedControl === 'tempo') { APP.setTempo(APP.tempo + 1); return; }
        // ... and so on for all other controls
    };
    APP.handleMinus = function() {
        if (APP.state.selectedControl === 'tempo') { APP.setTempo(APP.tempo - 1); return; }
        // ... and so on for all other controls
    };
    APP.handleBassPress = function() {
        if (APP.state.selectedControl === 'bass') {
            APP.state.selectedControl = null;
            APP.state.bassOffset = 'BASS';
            APP.state.bassEditTarget = null;
        } else if (APP.state.lastPlayedChord) {
            APP.state.selectedControl = 'bass';
            const targetKey = APP.state.lastActiveSlot || `${APP.state.lastPressed}-0`;
            APP.state.bassEditTarget = targetKey;
            const chordType = APP.getCurrentChordType(APP.state.lastPressed, APP.state.lastActiveSlot ? parseInt(APP.state.lastActiveSlot.split('-')[1]) : 0);
            const chordKey = APP.state.lastPressed + '-' + chordType + '-' + (APP.state.lastActiveSlot ? APP.state.lastActiveSlot.split('-')[1] : '0');
            APP.state.bassOffsets[chordKey] = 0;
            APP.state.bassOffset = 'BASS';
        }
        APP.updateControlValues();
    };
    APP.handleSizePress = function() {
        const currentIndex = APP.SIZE_MODES.indexOf(APP.state.sizeMode);
        APP.state.sizeMode = APP.SIZE_MODES[(currentIndex + 1) % APP.SIZE_MODES.length];
        APP.state.currentSlotLevel = 0;
        APP.updateUI();
    };


})(window.APP);
