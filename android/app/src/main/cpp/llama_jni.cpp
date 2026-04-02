#include <jni.h>
#include <string>
#include <android/log.h>
#include "llama/llama.h"

#define LOG_TAG "LlamaJNI"
#define LOGD(...) __android_log_print(ANDROID_LOG_DEBUG, LOG_TAG, __VA_ARGS__)

extern "C" JNIEXPORT jstring JNICALL
Java_com_aimetafactory_app_LlamaBridge_runModel(
    JNIEnv *env,
    jobject /* this */,
    jstring modelPath,
    jstring prompt) {

    const char *model_path = env->GetStringUTFChars(modelPath, nullptr);
    const char *input = env->GetStringUTFChars(prompt, nullptr);

    LOGD("Model path: %s", model_path);
    LOGD("Prompt: %s", input);

    // Initialize llama backend
    llama_backend_init();

    // Load model
    llama_model_params model_params = llama_model_default_params();
    model_params.n_gpu_layers = 0; // CPU only
    llama_model *model = llama_load_model_from_file(model_path, model_params);
    if (!model) {
        env->ReleaseStringUTFChars(modelPath, model_path);
        env->ReleaseStringUTFChars(prompt, input);
        llama_backend_free();
        return env->NewStringUTF("Failed to load model");
    }

    // Create context
    llama_context_params ctx_params = llama_context_default_params();
    ctx_params.n_ctx = 512;
    llama_context *ctx = llama_new_context_with_model(model, ctx_params);
    if (!ctx) {
        llama_free_model(model);
        env->ReleaseStringUTFChars(modelPath, model_path);
        env->ReleaseStringUTFChars(prompt, input);
        llama_backend_free();
        return env->NewStringUTF("Failed to create context");
    }

    // Tokenize and run a single inference (stub for simplicity)
    // For real generation, you would loop and decode tokens.
    std::string result = "Model loaded and ready. Your prompt: " + std::string(input);

    // Cleanup
    llama_free(ctx);
    llama_free_model(model);
    llama_backend_free();

    env->ReleaseStringUTFChars(modelPath, model_path);
    env->ReleaseStringUTFChars(prompt, input);

    return env->NewStringUTF(result.c_str());
}
