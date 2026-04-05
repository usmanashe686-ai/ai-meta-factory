cmake_minimum_required(VERSION 3.22)
project("llamabridge")
set(CMAKE_CXX_STANDARD 17)

# Use GITHUB_WORKSPACE if set (CI) or fallback to relative
if(DEFINED ENV{GITHUB_WORKSPACE})
    set(LLAMA_CPP_DIR $ENV{GITHUB_WORKSPACE}/android/llama.cpp)
else()
    set(LLAMA_CPP_DIR ${CMAKE_CURRENT_SOURCE_DIR}/../../../../llama.cpp)
endif()

if(NOT EXISTS ${LLAMA_CPP_DIR}/include/llama.h)
    message(FATAL_ERROR "llama.cpp not found at ${LLAMA_CPP_DIR}/include/llama.h")
endif()

# Build llama.cpp as a static library
add_subdirectory(${LLAMA_CPP_DIR} ${CMAKE_CURRENT_BINARY_DIR}/llama_build)

# Our JNI bridge
add_library(llamabridge SHARED llama-bridge.cpp)

# Link to llama static library and Android libs
target_link_libraries(llamabridge
    llama
    android
    log
    c++_shared
)

# Include directories
target_include_directories(llamabridge PRIVATE
    ${LLAMA_CPP_DIR}
    ${LLAMA_CPP_DIR}/include
    ${LLAMA_CPP_DIR}/ggml/include
)
