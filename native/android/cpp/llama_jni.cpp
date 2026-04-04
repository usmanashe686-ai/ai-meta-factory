#include <jni.h>
#include <string>
#include <vector>
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
        return env->NewStringUTF("Error: Failed to load model");
    }

    // Create context
    llama_context_params ctx_params = llama_context_default_params();
    ctx_params.n_ctx = 512;      // context size
    ctx_params.n_threads = 4;    // use 4 CPU threads
    llama_context *ctx = llama_new_context_with_model(model, ctx_params);
    if (!ctx) {
        llama_free_model(model);
        env->ReleaseStringUTFChars(modelPath, model_path);
        env->ReleaseStringUTFChars(prompt, input);
        llama_backend_free();
        return env->NewStringUTF("Error: Failed to create context");
    }

    // Tokenize prompt
    std::vector<llama_token> tokens;
    int n_tokens = llama_tokenize(model, input, nullptr, 0, true, false);
    tokens.resize(n_tokens);
    llama_tokenize(model, input, tokens.data(), tokens.size(), true, false);

    // Prepare for generation
    const int max_tokens = 200;
    std::string result;
    std::vector<llama_token> generated_tokens = tokens;

    // Feed prompt tokens
    for (size_t i = 0; i < generated_tokens.size(); i++) {
        if (llama_eval(ctx, &generated_tokens[i], 1, i, 0)) {
            LOGD("llama_eval failed at token %zu", i);
            break;
        }
    }

    // Generate new tokens
    for (int i = 0; i < max_tokens; i++) {
        llama_token next_token = llama_sample_token_greedy(ctx, nullptr);
        if (next_token == llama_token_eos(model)) {
            break;
        }
        generated_tokens.push_back(next_token);
        // Decode token to string (simple, but may need to accumulate)
        char buf[128];
        int n = llama_token_to_piece(model, next_token, buf, sizeof(buf), 0, false);
        if (n > 0) {
            result.append(buf, n);
        }
        // Evaluate the new token
        if (llama_eval(ctx, &next_token, 1, generated_tokens.size() - 1, 0)) {
            LOGD("llama_eval failed at generation step %d", i);
            break;
        }
    }

    // Cleanup
    llama_free(ctx);
    llama_free_model(model);
    llama_backend_free();

    env->ReleaseStringUTFChars(modelPath, model_path);
    env->ReleaseStringUTFChars(prompt, input);

    return env->NewStringUTF(result.c_str());
}
