cmake_minimum_required(VERSION 3.22)
project("llamabridge")
set(CMAKE_CXX_STANDARD 17)

# Path to the cloned llama.cpp (from CI)
set(LLAMA_CPP_DIR ${CMAKE_CURRENT_SOURCE_DIR}/../../../../llama.cpp)

if(NOT EXISTS ${LLAMA_CPP_DIR}/llama.h)
    message(FATAL_ERROR "llama.cpp not found at ${LLAMA_CPP_DIR}")
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
