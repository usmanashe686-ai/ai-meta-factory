cmake_minimum_required(VERSION 3.22)
project("llamabridge")

set(CMAKE_CXX_STANDARD 17)

add_library(llamabridge SHARED llama-bridge.cpp)

target_include_directories(llamabridge PRIVATE .)
