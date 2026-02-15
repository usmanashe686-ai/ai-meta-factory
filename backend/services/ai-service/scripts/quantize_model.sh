#!/bin/bash
# Script to quantize a model using llama.cpp's quantize tool
# Usage: ./quantize_model.sh <input_model> <output_model> <quantization_type>

set -e

# Check arguments
if [ $# -lt 3 ]; then
    echo "Usage: $0 <input_model> <output_model> <quantization_type>"
    echo "Quantization types: q4_0, q4_1, q5_0, q5_1, q8_0, q2_K, q3_K, q4_K, q5_K, q6_K, q8_K"
    exit 1
fi

INPUT_MODEL=$1
OUTPUT_MODEL=$2
QUANT_TYPE=$3

# Path to llama.cpp repository (adjust if needed)
LLAMA_CPP_PATH=${LLAMA_CPP_PATH:-"./llama.cpp"}

# Check if quantize tool exists
if [ ! -f "${LLAMA_CPP_PATH}/quantize" ]; then
    echo "quantize tool not found in ${LLAMA_CPP_PATH}"
    echo "Please set LLAMA_CPP_PATH or compile llama.cpp first"
    exit 1
fi

# Run quantization
echo "Quantizing ${INPUT_MODEL} to ${OUTPUT_MODEL} with type ${QUANT_TYPE}..."
${LLAMA_CPP_PATH}/quantize "${INPUT_MODEL}" "${OUTPUT_MODEL}" "${QUANT_TYPE}"

echo "Quantization complete: ${OUTPUT_MODEL}"
