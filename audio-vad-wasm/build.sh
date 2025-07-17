#!/bin/bash
EMCC=emcc
WEbrtc_DIR=./src/webrtc
INCLUDES="-I$WEbrtc_DIR -I$WEbrtc_DIR/common_audio/vad/include"
SOURCES="$WEbrtc_DIR/common_audio/vad/*.c $WEbrtc_DIR/common_audio/signal_processing/*.c"
$EMCC src/vad_wrapper.c $SOURCES $INCLUDES \
      -s WASM=1 \
      -s EXPORTED_FUNCTIONS="['_create_vad', '_is_speech', '_free_vad']" \
      -s EXPORTED_RUNTIME_METHODS="['ccall', 'cwrap']" \
      -s ALLOW_MEMORY_GROWTH=1 \
      -O3 \
      -o public/vad.js