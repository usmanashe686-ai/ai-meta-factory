cmake_minimum_required(VERSION 3.22)
project("llamabridge")
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Use absolute path from GITHUB_WORKSPACE (set in CI) or fallback to relative
if(DEFINED ENV{GITHUB_WORKSPACE})
    set(LLAMA_CPP_DIR $ENV{GITHUB_WORKSPACE}/android/llama.cpp)
else()
    set(LLAMA_CPP_DIR ${CMAKE_CURRENT_SOURCE_DIR}/../../../../llama.cpp)
endif()

message(STATUS "Looking for llama.cpp at: ${LLAMA_CPP_DIR}")

if(NOT EXISTS ${LLAMA_CPP_DIR}/llama.h)
    message(FATAL_ERROR "llama.cpp not found at ${LLAMA_CPP_DIR}. Please ensure it's cloned into android/llama.cpp")
endif()

add_subdirectory(${LLAMA_CPP_DIR} ${CMAKE_CURRENT_BINARY_DIR}/llama.cpp)

add_library(llamabridge SHARED llama-bridge.cpp)
target_link_libraries(llamabridge llama c++_shared android log)
target_include_directories(llamabridge PRIVATE ${LLAMA_CPP_DIR} ${LLAMA_CPP_DIR}/ggml/include)
