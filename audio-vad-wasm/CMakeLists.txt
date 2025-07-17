cmake_minimum_required(VERSION 3.10)
project(AudioVADWASM C)

set(CMAKE_C_COMPILER emcc)
set(CMAKE_CXX_COMPILER em++)

file(GLOB_RECURSE VAD_SOURCES_ALL
    "src/webrtc/python-webrtc-audio-processing/webrtc-audio-processing/webrtc/common_audio/vad/*.c"
)
file(GLOB_RECURSE SIGNAL_SOURCES_ALL
    "src/webrtc/python-webrtc-audio-processing/webrtc-audio-processing/webrtc/common_audio/signal_processing/*.c"
)

set(VAD_SOURCES "")
foreach(file IN LISTS VAD_SOURCES_ALL)
    if(NOT file MATCHES "_mips\\.c$")
        list(APPEND VAD_SOURCES ${file})
    endif()
endforeach()

set(SIGNAL_SOURCES "")
foreach(file IN LISTS SIGNAL_SOURCES_ALL)
    if(NOT file MATCHES "_mips\\.c$")
        list(APPEND SIGNAL_SOURCES ${file})
    endif()
endforeach()

set(SOURCES
    src/vad_wrapper.c
    ${VAD_SOURCES}
    ${SIGNAL_SOURCES}
)

include_directories(
    src
    src/webrtc/python-webrtc-audio-processing/webrtc-audio-processing
    src/webrtc/python-webrtc-audio-processing/webrtc-audio-processing/webrtc/common_audio/vad/include
    src/webrtc/python-webrtc-audio-processing/webrtc-audio-processing/webrtc/common_audio/signal_processing/include
)

add_executable(vad ${SOURCES})

set_target_properties(vad PROPERTIES OUTPUT_NAME "vad" SUFFIX ".js")

target_link_options(vad PRIVATE
    "-sWASM=1"
    "-sMODULARIZE=1"
    "-sEXPORT_NAME=createModule"
    "-sEXPORTED_FUNCTIONS=[\"_malloc\",\"_free\",\"_create_vad\",\"_init_vad\",\"_is_speech\",\"_free_vad\"]"
    "-sEXPORTED_RUNTIME_METHODS=[\"ccall\",\"cwrap\"]"
    "-sALLOW_MEMORY_GROWTH=1"
    "-O3"
)
