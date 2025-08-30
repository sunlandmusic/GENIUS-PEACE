(function(APP) {
    // Sequencer state
    APP.isPlaying = false;
    APP.currentStep = -1;
    APP.playInterval = null;
    APP.chordStopTimer = null;
    APP.currentBars = 2;
    APP.currentTimeSignature = "4/4";
    APP.currentBeatsPerBar = 8;
    APP.durationEditMode = false;
    APP.durationEditStep = -1;
    APP.totalSteps = 16;
    APP.tempo = 85;
    APP.clickEnabled = true;
    APP.isBPMDoubled = false;
    APP.progression = Array(64).fill(null).map((_, i) => ({ id: i, chord: null }));
    APP.sequenceSlots = Array.from({ length: 8 }, () => ({
        bars: 2,
        tempo: 85,
        timeSignature: "4/4",
        beatsPerBar: 8,
        progression: Array(64).fill(null).map((_, i) => ({ id: i, chord: null }))
    }));
    APP.currentSequenceIndex = 0;
    APP.pendingSequenceIndex = null;

    function buildStepGrid() {
        const container = document.getElementById('step-container');
        if (!container) return;
        container.className = `step-container bars-${APP.currentBars}`;
        const sc = document.getElementById('sequencer');
        if (sc) {
            sc.classList.remove('bars-1','bars-2','bars-3','bars-4','bars-5','bars-6','bars-7','bars-8');
            sc.classList.add(`bars-${APP.currentBars}`);
        }

        let html = '';
        const beatsPerBar = APP.currentBeatsPerBar;
        const stepsPerBar = beatsPerBar;

        if (APP.currentBars === 1) {
            if (APP.currentTimeSignature === "3/4") {
                for (let row = 0; row < 2; row++) {
                    html += '<div class="step-grid-container">';
                    html += `<div class="step-grid" data-time-signature="${APP.currentTimeSignature}">`;
                    for (let step = 0; step < 3; step++) {
                        const globalStep = row * 3 + step;
                        html += `<div class="step-slot" data-row="${row}" data-step="${globalStep}"></div>`;
                    }
                    html += '</div></div>';
                }
            } else {
                const rows = Math.ceil(stepsPerBar / 4);
                for (let row = 0; row < rows; row++) {
                    html += '<div class="step-grid-container">';
                    html += `<div class="step-grid" data-time-signature="${APP.currentTimeSignature}">`;
                    const stepsInThisRow = Math.min(4, stepsPerBar - (row * 4));
                    for (let step = 0; step < stepsInThisRow; step++) {
                        const globalStep = row * 4 + step;
                        html += `<div class="step-slot" data-row="${row}" data-step="${globalStep}"></div>`;
                    }
                    html += '</div></div>';
                }
            }
        } else {
            if (APP.currentTimeSignature === "3/4") {
                const blocks = Math.ceil(APP.currentBars / 2);
                for (let row = 0; row < 4; row++) {
                    html += '<div class="step-grid-container">';
                    for (let block = 0; block < blocks; block++) {
                        if (block > 0) html += '<div class="bar-divider"></div>';
                        html += `<div class="step-grid" data-time-signature="${APP.currentTimeSignature}">`;
                        let shouldShowThisRow = true;
                        if ((APP.currentBars === 3 && block === 1) || (APP.currentBars === 5 && block === 2) || (APP.currentBars === 7 && block === 3)) {
                            shouldShowThisRow = row < 2;
                        }
                        if (shouldShowThisRow) {
                            for (let step = 0; step < 3; step++) {
                                const sectionStart = block * 12;
                                const barIndex = (row < 2) ? 0 : 1;
                                const rowOffset = (row % 2 === 0) ? 0 : 3;
                                const globalStep = sectionStart + (barIndex * 6) + rowOffset + step;
                                html += `<div class="step-slot" data-row="${row}" data-step="${globalStep}"></div>`;
                            }
                        } else {
                            for (let step = 0; step < 3; step++) {
                                html += `<div class="step-slot" style="visibility: hidden;"></div>`;
                            }
                        }
                        html += '</div>';
                    }
                    html += '</div>';
                }
            } else {
                const sections = Math.ceil(APP.currentBars / 2);
                for (let row = 0; row < 4; row++) {
                    html += '<div class="step-grid-container">';
                    for (let section = 0; section < sections; section++) {
                        if (section > 0) html += '<div class="bar-divider"></div>';
                        html += `<div class="step-grid" data-time-signature="${APP.currentTimeSignature}">`;
                        let shouldShowThisRow = true;
                        if ((APP.currentBars === 3 && section === 1) || (APP.currentBars === 5 && section === 2) || (APP.currentBars === 7 && section === 3)) {
                            shouldShowThisRow = row < 2;
                        }
                        if (shouldShowThisRow) {
                            for (let step = 0; step < 4; step++) {
                                const sectionStart = section * 16;
                                const barIndex = (row < 2) ? 0 : 1;
                                const rowOffset = (row % 2 === 0) ? 0 : 4;
                                const globalStep = sectionStart + (barIndex * 8) + rowOffset + step;
                                html += `<div class="step-slot" data-row="${row}" data-step="${globalStep}"></div>`;
                            }
                        } else {
                            for (let step = 0; step < 4; step++) {
                                html += `<div class="step-slot" style="visibility: hidden;"></div>`;
                            }
                        }
                        html += '</div>';
                    }
                    html += '</div>';
                }
            }
        }

        container.innerHTML = html;
        APP.totalSteps = APP.currentBars * beatsPerBar;
        ensureProgressionSize();
        attachStepHandlers();
        refreshStepSelections();
        const maxSteps = APP.currentBars * beatsPerBar;
        if (APP.currentStep >= maxSteps) APP.currentStep = maxSteps - 1;
    }

    function ensureProgressionSize() {
        const needed = Math.min(APP.totalSteps, 64);
        if (APP.progression.length < needed) {
            for (let i = APP.progression.length; i < needed; i++) APP.progression[i] = { id: i, chord: null };
        }
        APP.progression.forEach(step => {
            if (step && step.chord && step.chord.duration === undefined) step.chord.duration = 2;
        });
        APP.sequenceSlots[APP.currentSequenceIndex].progression = APP.progression.slice();
    }

    function attachStepHandlers() {
        document.querySelectorAll('.step-slot[data-step]').forEach(slot => {
            const stepIndex = parseInt(slot.getAttribute('data-step'));
            let pressTimer = null;
            slot.onmousedown = (e) => {
                e.preventDefault();
                pressTimer = setTimeout(() => {
                    const data = APP.progression[stepIndex]?.chord;
                    if (data) {
                        APP.state.selectedChordForStep = { root: data.root, type: data.type };
                        APP.state.selectedChordMeta = { slotIndex: data.slotIndex ?? 0, bassOffset: data.bassOffset ?? 0, octave: data.octave ?? APP.state.octave, inversion: data.inversion ?? APP.state.inversion };
                        APP.showSequencerMessage('COPIED', 'copied');
                    }
                }, 600);
                handleStepClick(stepIndex, e);
            };
            slot.onmouseup = (e) => {
                if (pressTimer) clearTimeout(pressTimer);
                handleStepRelease(stepIndex, e);
            };
            slot.ondblclick = () => handleStepClear(stepIndex);
        });
    }

    function refreshStepSelections() {
        document.querySelectorAll('.step-slot[data-step]').forEach(slot => {
            const stepIndex = parseInt(slot.getAttribute('data-step'));
            const hasChord = APP.progression[stepIndex]?.chord;
            if (hasChord) {
                slot.classList.add('selected');
                const chord = APP.progression[stepIndex].chord;
                if (APP.durationEditMode && APP.durationEditStep === stepIndex) {
                    slot.textContent = String(chord.duration || 2);
                    slot.classList.add('duration-edit');
                } else {
                    slot.classList.remove('duration-edit');
                    let display = chord.name || APP.MusicEngine.getChordName(chord.root, chord.type, APP.state.useFlats);
                    if (!display.includes('/') && typeof chord.bassOffset === 'number' && chord.bassOffset !== 0) {
                        const rootIdx = APP.KEYS.indexOf(chord.root);
                        if (rootIdx !== -1) {
                            const bassIdx = (rootIdx + chord.bassOffset + 120) % 12;
                            const bassNameSharp = APP.KEYS[bassIdx];
                            const bassName = APP.state.useFlats && APP.SHARP_TO_FLAT[bassNameSharp] ? APP.SHARP_TO_FLAT[bassNameSharp] : bassNameSharp;
                            display = `${display}/${bassName}`;
                        }
                    }
                    slot.textContent = display;
                }
            } else {
                slot.classList.remove('selected');
                slot.textContent = '';
            }
        });
    }

    function setTempo(value) {
        try {
            const v = Math.max(60, Math.min(300, parseInt(value) || 120));
            if (APP.tempo !== v) {
                if (APP.isBPMDoubled) APP.isBPMDoubled = false;
                APP.tempo = v;
                const tv = document.getElementById('tempo-value');
                if (tv) tv.textContent = String(APP.tempo);
                if (APP.sequenceSlots[APP.currentSequenceIndex]) APP.sequenceSlots[APP.currentSequenceIndex].tempo = APP.tempo;
                if (APP.isPlaying && APP.playInterval) {
                    clearInterval(APP.playInterval);
                    APP.playInterval = null;
                    if (APP.chordStopTimer) clearTimeout(APP.chordStopTimer);
                    setTimeout(() => { if (APP.isPlaying) startPlayLoop(); }, 10);
                }
            }
        } catch (error) {
            console.error('setTempo error:', error);
            APP.tempo = 120;
            const tv = document.getElementById('tempo-value');
            if (tv) tv.textContent = String(APP.tempo);
        }
    }

    // ... (The rest of the functions in sequencer.js, adapted for the APP namespace)

    APP.buildStepGrid = buildStepGrid;
    APP.setTempo = setTempo;
    APP.handlePlay = function() {
        if (APP.isPlaying) return;
        APP.isPlaying = true;
        APP.currentStep = -1;
        APP.audioEngine.stopAllVoices();
        if (APP.playInterval) clearInterval(APP.playInterval);
        startPlayLoop();
    };
    APP.handleStop = function() {
        APP.isPlaying = false;
        APP.pendingSequenceIndex = null;
        if (APP.playInterval) clearInterval(APP.playInterval);
        if (APP.chordStopTimer) clearTimeout(APP.chordStopTimer);
        APP.currentStep = -1;
        APP.audioEngine.stopAllVoices();
        APP.audioEngine.allNotesOff(15);
        APP.audioEngine.allNotesOff(14);
        document.querySelectorAll('.step-slot[data-step]').forEach(slot => slot.classList.remove('active'));
        if (APP.state.sequenceLoop) {
            APP.state.sequenceLoop = null;
            APP.state.currentLoopIndex = 0;
            APP.updateSequenceLoopStatus();
        }
    };

    function startPlayLoop() {
        if (APP.playInterval) clearInterval(APP.playInterval);
        if (APP.chordStopTimer) clearTimeout(APP.chordStopTimer);
        const safeTempo = Math.max(60, Math.min(300, APP.tempo || 120));
        const safeBars = Math.max(1, Math.min(8, APP.currentBars || 2));
        const interval = (60 / safeTempo / 2) * 1000;
        const maxSteps = safeBars * (APP.currentTimeSignature === "3/4" ? 6 : 8);
        if (APP.currentStep >= maxSteps) APP.currentStep = 0;
        const tick = () => {
            if (!APP.isPlaying) return;
            // ... (rest of tick logic adapted for APP namespace)
        };
        tick();
        APP.playInterval = setInterval(tick, interval);
    }


})(window.APP);
