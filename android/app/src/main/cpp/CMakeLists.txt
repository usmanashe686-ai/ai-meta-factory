cmake_minimum_required(VERSION 3.22)
project("llama")

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Add llama.cpp as a subdirectory (ensure you have cloned it into 'llama')
add_subdirectory(llama)

# Our JNI wrapper
add_library(llama_jni SHARED
    llama_jni.cpp
)

# Link against llama and log
target_link_libraries(llama_jni
    llama
    log
)

# Tell CMake where to find headers
target_include_directories(llama_jni PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}/llama
)
