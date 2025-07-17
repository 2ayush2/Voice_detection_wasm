let vadInstance = null;
let audioContext = null;
let audioSource = null;
let module = null;

async function initWASM() {
    const response = await fetch('/vad.wasm');
    const { instance } = await WebAssembly.instantiateStreaming(response, { imports: {} });
    module = instance.exports;
    return module;
}

async function startAudioProcessing() {
    try {
        await initWASM();
        
        vadInstance = module._create_vad(2);
        audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioSource = audioContext.createMediaStreamSource(stream);

        const processor = audioContext.createScriptProcessor(256, 1, 1);
        let silenceStart = null;
        let voiceDetected = false;

        processor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const int16Data = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
                int16Data[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
            }

            const buffer = module._malloc(int16Data.length * 2);
            module.HEAP16.set(int16Data, buffer >> 1);
            const isSpeech = module._is_speech(vadInstance, buffer, 16000, int16Data.length);
            module._free(buffer);

            if (isSpeech) {
                silenceStart = null;
                if (!voiceDetected) {
                    console.log("Voice detected...");
                    voiceDetected = true;
                }
                e.outputBuffer.getChannelData(0).set(inputData);
            } else {
                if (silenceStart === null) {
                    silenceStart = Date.now();
                } else if ((Date.now() - silenceStart) / 1000 >= 2) {
                    console.log("Silence detected.");
                    processor.disconnect();
                    audioSource.disconnect();
                    audioContext.close();
                    module._free_vad(vadInstance);
                }
            }
        };

        audioSource.connect(processor);
        processor.connect(audioContext.destination);
    } catch (e) {
        console.error("Error in audio processing:", e);
    }
}

function stopAudioProcessing() {
    if (audioSource) audioSource.disconnect();
    if (audioContext) audioContext.close();
    if (vadInstance && module) module._free_vad(vadInstance);
}

document.addEventListener('click', () => {
    if (!audioContext) startAudioProcessing();
});