set(LLAMA_NATIVE OFF)

set(LLAMA_OPENMP OFF)

set(LLAMA_METAL OFF)

set(LLAMA_CUBLAS OFF)

set(LLAMA_VULKAN OFF)

set(LLAMA_KOMPUTE OFF)

set(LLAMA_CLBLAST OFF)

set(LLAMA_HIPBLAS OFF)

set(LLAMA_ACCELERATE OFF)

set(LLAMA_OPENCL OFF)


cmake_minimum_required(VERSION 3.22.1)

project("llama_jni")

# 🔥 Disable heavy features (IMPORTANT for mobile)
set(LLAMA_NATIVE OFF)
set(LLAMA_OPENMP OFF)
set(LLAMA_METAL OFF)
set(LLAMA_CUBLAS OFF)

add_library(
    llama_jni
    SHARED
    llama_jni.cpp
)

# include headers
include_directories(llama.cpp)

# link llama.cpp
add_subdirectory(llama.cpp)

target_link_libraries(
    llama_jni
    llama
    log
)
