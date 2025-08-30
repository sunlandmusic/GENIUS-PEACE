(function(APP) {
    async function initializeMIDI(audioEngine, handleSlotPress, handleSlotRelease) {
        try {
            // This is now handled by the AudioEngine
            // const midiEnabled = await audioEngine.initializeMIDI();
            // APP.state.midiEnabled = midiEnabled;
            // APP.updateMIDIIndicator();

            if (APP.state.midiEnabled) {
                console.log("MIDI enabled, setting callbacks.");
                audioEngine.setMidiCallbacks((note, isOn, velocity) => {
                    const noteName = Tone.Frequency(note, "midi").toNote();
                    const key = noteName.slice(0, -1);

                    if (isOn) {
                        handleSlotPress(key, APP.state.currentSlotLevel);
                    } else {
                        handleSlotRelease(key, APP.state.currentSlotLevel);
                    }
                });
            }
        } catch (error) {
            console.error("Failed to initialize MIDI:", error);
            APP.state.midiEnabled = false;
            APP.updateMIDIIndicator();
        }
    }

    APP.initializeMIDI = initializeMIDI;

})(window.APP);
