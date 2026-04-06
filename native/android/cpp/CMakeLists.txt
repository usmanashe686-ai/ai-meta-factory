cmake_minimum_required(VERSION 3.22)
project("llamabridge")

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

if(DEFINED ENV{GITHUB_WORKSPACE})
    set(LLAMA_CPP_DIR $ENV{GITHUB_WORKSPACE}/android/llama.cpp)
else()
    set(LLAMA_CPP_DIR ${CMAKE_CURRENT_SOURCE_DIR}/../../../../llama.cpp)
endif()

if(NOT EXISTS ${LLAMA_CPP_DIR}/llama.h)
    message(FATAL_ERROR "llama.cpp not found at ${LLAMA_CPP_DIR}")
endif()

# Disable building examples, server, tests AND also the common library
set(LLAMA_BUILD_EXAMPLES OFF CACHE BOOL "" FORCE)
set(LLAMA_BUILD_SERVER OFF CACHE BOOL "" FORCE)
set(LLAMA_BUILD_TESTS OFF CACHE BOOL "" FORCE)
set(LLAMA_BUILD_COMMON OFF CACHE BOOL "" FORCE)

add_subdirectory(${LLAMA_CPP_DIR} ${CMAKE_CURRENT_BINARY_DIR}/llama_build)

add_library(llamabridge SHARED llama-bridge.cpp)

target_link_libraries(llamabridge
    llama
    android
    log
    c++_shared
)

target_include_directories(llamabridge PRIVATE
    ${LLAMA_CPP_DIR}
    ${LLAMA_CPP_DIR}/include
)
