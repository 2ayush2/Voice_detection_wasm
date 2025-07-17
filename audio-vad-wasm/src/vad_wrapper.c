#include "webrtc_vad.h"
#include <stdlib.h>
#include <stdint.h>
#include <emscripten/emscripten.h>

#ifdef __cplusplus
extern "C" {
#endif

EMSCRIPTEN_KEEPALIVE
VadInst* create_vad() {
    return WebRtcVad_Create();
}

EMSCRIPTEN_KEEPALIVE
int init_vad(VadInst* vad, int mode) {
    if (!vad) return -1;
    int status = WebRtcVad_Init(vad);
    if (status != 0) return status;
    return WebRtcVad_set_mode(vad, mode);
}

// Fix here: WebRtcVad_Process expects frame length in samples, 
// but your JS code passes 320, which is correct for 20ms @16kHz
EMSCRIPTEN_KEEPALIVE
int is_speech(VadInst* vad, int16_t* audio_frame, int sample_rate, int frame_length) {
    if (!vad) return -1;
    return WebRtcVad_Process(vad, sample_rate, audio_frame, frame_length);
}

EMSCRIPTEN_KEEPALIVE
void free_vad(VadInst* vad) {
    if (vad) WebRtcVad_Free(vad);
}

#ifdef __cplusplus
}
#endif
