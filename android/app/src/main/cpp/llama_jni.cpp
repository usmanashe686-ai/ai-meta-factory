#include <jni.h>
#include <string>
#include <vector>
#include "llama.h"

extern "C"
JNIEXPORT jstring JNICALL
Java_com_aimetafactory_app_LlamaPlugin_runModel(JNIEnv *env, jobject thiz, jstring modelPath_, jstring prompt_) {
    const char *modelPath = env->GetStringUTFChars(modelPath_, 0);
    const char *prompt = env->GetStringUTFChars(prompt_, 0);

    // 1. Load Model with default params
    auto mparams = llama_model_default_params();
    llama_model * model = llama_load_model_from_file(modelPath, mparams);
    if (!model) return env->NewStringUTF("Error: Model file not found at path.");

    // 2. Setup Context (Small context for 32GB phones)
    auto cparams = llama_context_default_params();
    cparams.n_ctx = 512; 
    cparams.n_batch = 512;
    llama_context * ctx = llama_new_context_with_model(model, cparams);

    // 3. Tokenize the User Prompt
    std::vector<llama_token> tokens_list(cparams.n_ctx);
    int n_tokens = llama_tokenize(model, prompt, strlen(prompt), tokens_list.data(), tokens_list.size(), true, false);
    if (n_tokens < 0) return env->NewStringUTF("Error: Prompt too long for context.");

    // 4. Initialize Batch for processing
    llama_batch batch = llama_batch_init(512, 0, 1);
    for (int i = 0; i < n_tokens; i++) {
        llama_batch_add(batch, tokens_list[i], i, { 0 }, i == n_tokens - 1);
    }

    // 5. Initial Decode
    if (llama_decode(ctx, batch) != 0) return env->NewStringUTF("Error: Initial decode failed.");

    // 6. The Generation Loop (Predicting words)
    std::string response = "";
    for (int n_cur = n_tokens; n_cur < cparams.n_ctx; n_cur++) {
        auto logits = llama_get_logits_ith(ctx, batch.n_tokens - 1);
        auto n_vocab = llama_n_vocab(model);

        // Simple Greedy Sampling (Fastest for Mobile)
        llama_token id = 0;
        float max_logit = logits[0];
        for (llama_token v = 1; v < n_vocab; v++) {
            if (logits[v] > max_logit) {
                max_logit = logits[v];
                id = v;
            }
        }

        if (id == llama_token_eos(model)) break; // End of sentence

        // Convert token to characters
        char buf[128];
        int n = llama_token_to_piece(model, id, buf, sizeof(buf));
        if (n > 0) response.append(buf, n);

        // Prepare next token
        llama_batch_clear(batch);
        llama_batch_add(batch, id, n_cur, { 0 }, true);

        if (llama_decode(ctx, batch) != 0) break;
    }

    // 7. Cleanup Memory
    llama_batch_free(batch);
    llama_free(ctx);
    llama_free_model(model);
    env->ReleaseStringUTFChars(modelPath_, modelPath);
    env->ReleaseStringUTFChars(prompt_, prompt);

    return env->NewStringUTF(response.c_str());
}
