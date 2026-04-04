#include <jni.h>
#include <string>
#include <vector>
#include <unordered_map>
#include <mutex>
#include <algorithm>
#include <cmath>
#include <cstdlib>
#include <ctime>
#include <llama.h>

static std::unordered_map<std::string, llama_model*> g_models;
static std::unordered_map<std::string, llama_context*> g_contexts;
static std::mutex g_mutex;

static llama_context* get_context(const std::string& model_path) {
    std::lock_guard<std::mutex> lock(g_mutex);
    auto it = g_contexts.find(model_path);
    if (it != g_contexts.end()) return it->second;
    
    llama_model_params model_params = llama_model_default_params();
    model_params.n_gpu_layers = 99;
    llama_model* model = llama_load_model_from_file(model_path.c_str(), model_params);
    if (!model) return nullptr;
    
    llama_context_params ctx_params = llama_context_default_params();
    ctx_params.n_ctx = 2048;
    ctx_params.n_batch = 512;
    ctx_params.n_threads = 4;
    ctx_params.n_threads_batch = 4;
    llama_context* ctx = llama_new_context_with_model(model, ctx_params);
    if (!ctx) { llama_free_model(model); return nullptr; }
    
    g_models[model_path] = model;
    g_contexts[model_path] = ctx;
    return ctx;
}

struct GenerationParams {
    int32_t n_predict = 256;
    float temperature = 0.7f;
    float top_p = 0.95f;
    int32_t top_k = 40;
};

static float frand() { return (float)rand() / RAND_MAX; }

static llama_token sample_token(llama_context* ctx, const float* logits, const GenerationParams& params) {
    const int n_vocab = llama_n_vocab(llama_get_model(ctx));
    std::vector<std::pair<float, llama_token>> candidates;
    candidates.reserve(n_vocab);
    for (llama_token id = 0; id < n_vocab; id++) candidates.emplace_back(logits[id], id);
    
    if (params.temperature > 0) {
        for (auto& p : candidates) p.first = expf(p.first / params.temperature);
    }
    std::sort(candidates.begin(), candidates.end(), [](auto& a, auto& b) { return a.first > b.first; });
    if (params.top_k > 0 && params.top_k < (int)candidates.size()) candidates.resize(params.top_k);
    
    if (params.top_p < 1.0f) {
        float total = 0.0f;
        for (auto& p : candidates) total += p.first;
        float cum = 0.0f, cutoff = params.top_p * total;
        size_t last = candidates.size();
        for (size_t i = 0; i < candidates.size(); i++) {
            cum += candidates[i].first;
            if (cum >= cutoff) { last = i + 1; break; }
        }
        if (last < candidates.size()) candidates.resize(last);
    }
    
    float total = 0.0f;
    for (auto& p : candidates) total += p.first;
    float r = frand() * total;
    float cum = 0.0f;
    for (auto& p : candidates) {
        cum += p.first;
        if (cum >= r) return p.second;
    }
    return candidates.empty() ? 0 : candidates[0].second;
}

static std::string generate_text(const std::string& model_path, const std::string& prompt, const GenerationParams& params) {
    llama_context* ctx = get_context(model_path);
    if (!ctx) return "Error: Failed to load model";
    llama_model* model = llama_get_model(ctx);
    
    std::vector<llama_token> tokens(prompt.length() + 1);
    int n_tokens = llama_tokenize(model, prompt.c_str(), prompt.length(), tokens.data(), tokens.size(), true, false);
    if (n_tokens < 0) {
        tokens.resize(-n_tokens);
        n_tokens = llama_tokenize(model, prompt.c_str(), prompt.length(), tokens.data(), tokens.size(), true, false);
    }
    tokens.resize(n_tokens);
    
    std::vector<llama_token> embd = tokens;
    std::string result;
    int n_consumed = 0;
    const int n_ctx = llama_n_ctx(ctx);
    
    for (int i = 0; i < params.n_predict; i++) {
        if ((int)embd.size() > n_consumed) {
            int n_eval = embd.size() - n_consumed;
            if (llama_decode(ctx, llama_batch_get_one(embd.data() + n_consumed, n_eval, 0, 0)))
                return result + " [error]";
            n_consumed = embd.size();
        }
        const float* logits = llama_get_logits(ctx);
        if (!logits) return result + " [no logits]";
        logits += (embd.size() - 1) * llama_n_vocab(model);
        
        llama_token token = sample_token(ctx, logits, params);
        if (token == llama_token_eos(model)) break;
        
        char buf[128];
        int n = llama_token_to_piece(model, token, buf, sizeof(buf), 0, false);
        if (n > 0) result.append(buf, n);
        embd.push_back(token);
        if ((int)embd.size() > n_ctx - 10) break;
    }
    return result;
}

extern "C" JNIEXPORT jstring JNICALL
Java_com_aimetafactory_llama_LlamaNative_generate(JNIEnv* env, jobject, jstring jprompt, jstring jmodelPath) {
    const char* prompt_cstr = env->GetStringUTFChars(jprompt, nullptr);
    const char* model_path = env->GetStringUTFChars(jmodelPath, nullptr);
    srand(time(nullptr));
    GenerationParams params;
    params.n_predict = 512;
    params.temperature = 0.7f;
    params.top_p = 0.95f;
    std::string result = generate_text(model_path, prompt_cstr, params);
    env->ReleaseStringUTFChars(jprompt, prompt_cstr);
    env->ReleaseStringUTFChars(jmodelPath, model_path);
    return env->NewStringUTF(result.c_str());
}
