cmake_minimum_required(VERSION 3.22)
project("llamabridge")

set(CMAKE_CXX_STANDARD 17)

# Path to llama.cpp (cloned in CI at android/llama.cpp)
set(LLAMA_CPP_DIR ${CMAKE_CURRENT_SOURCE_DIR}/../../../../llama.cpp)

# Include all necessary headers
include_directories(
    ${LLAMA_CPP_DIR}
    ${LLAMA_CPP_DIR}/include
    ${LLAMA_CPP_DIR}/ggml/include      # <-- THIS WAS MISSING
    ${LLAMA_CPP_DIR}/ggml/src          # sometimes needed for internal includes
)

# Source files: your JNI wrapper + llama.cpp core sources
# Note: your file is llama-bridge.cpp, not llama-plugin.cpp
add_library(llamabridge SHARED
    llama-bridge.cpp
    ${LLAMA_CPP_DIR}/src/llama.cpp
    ${LLAMA_CPP_DIR}/ggml/src/ggml.cpp
    ${LLAMA_CPP_DIR}/ggml/src/ggml-alloc.cpp
    ${LLAMA_CPP_DIR}/ggml/src/ggml-backend.cpp
    ${LLAMA_CPP_DIR}/ggml/src/ggml-quants.cpp
)

# Link dependencies
target_link_libraries(llamabridge
    android
    log
    c++_shared
)
