#include <jni.h>
#include <string>
#include <vector>
#include <algorithm>
#include <random>
#include <chrono>
#include <llama.h>

static struct {
    llama_model* model = nullptr;
    llama_context* ctx = nullptr;
    std::string last_path;
} g_state;

static std::mt19937 rng(std::chrono::steady_clock::now().time_since_epoch().count());

static bool ensure_model(const std::string& model_path) {
    if (g_state.last_path == model_path && g_state.model && g_state.ctx)
        return true;

    if (g_state.ctx) { llama_free(g_state.ctx); g_state.ctx = nullptr; }
    if (g_state.model) { llama_free_model(g_state.model); g_state.model = nullptr; }
    g_state.last_path.clear();

    llama_model_params model_params = llama_model_default_params();
    model_params.n_gpu_layers = 0;
    g_state.model = llama_load_model_from_file(model_path.c_str(), model_params);
    if (!g_state.model) return false;

    llama_context_params ctx_params = llama_context_default_params();
    ctx_params.n_ctx = 2048;
    ctx_params.n_threads = 4;
    g_state.ctx = llama_new_context_with_model(g_state.model, ctx_params);
    if (!g_state.ctx) return false;

    g_state.last_path = model_path;
    return true;
}

static llama_token sample_token(const float* logits, int n_vocab, float temp, float top_p) {
    std::vector<std::pair<float, llama_token>> candidates;
    candidates.reserve(n_vocab);
    for (llama_token id = 0; id < n_vocab; ++id)
        candidates.emplace_back(logits[id], id);

    if (temp > 0) {
        for (auto& p : candidates) p.first = std::exp(p.first / temp);
    }
    std::sort(candidates.begin(), candidates.end(),
              [](const auto& a, const auto& b) { return a.first > b.first; });

    if (top_p < 1.0f && top_p > 0.0f) {
        float total = 0.0f;
        for (const auto& p : candidates) total += p.first;
        float cum = 0.0f, cutoff = top_p * total;
        size_t last = candidates.size();
        for (size_t i = 0; i < candidates.size(); ++i) {
            cum += candidates[i].first;
            if (cum >= cutoff) { last = i + 1; break; }
        }
        if (last < candidates.size()) candidates.resize(last);
    }

    float total = 0.0f;
    for (const auto& p : candidates) total += p.first;
    float r = std::uniform_real_distribution<float>(0, total)(rng);
    float cum = 0.0f;
    for (const auto& p : candidates) {
        cum += p.first;
        if (cum >= r) return p.second;
    }
    return candidates.empty() ? 0 : candidates[0].second;
}

static std::string generate_text(const std::string& model_path, const std::string& prompt,
                                 int max_tokens = 256, float temp = 0.7f, float top_p = 0.95f) {
    if (!ensure_model(model_path))
        return "Error: Failed to load model";

    // Tokenize prompt (old API)
    std::vector<llama_token> tokens(prompt.length() + 1);
    int n_tokens = llama_tokenize(g_state.model, prompt.c_str(), prompt.length(),
                                  tokens.data(), tokens.size(), true, false);
    if (n_tokens < 0) return "Error: Tokenization failed";
    tokens.resize(n_tokens);

    // Evaluate prompt (old batch API)
    for (size_t i = 0; i < tokens.size(); ++i) {
        if (llama_eval(g_state.ctx, &tokens[i], 1, i, 0))
            return "Error: llama_eval failed at prompt";
    }

    const int n_vocab = llama_n_vocab(g_state.model);
    const llama_token eos = llama_token_eos(g_state.model);
    std::string result;

    for (int i = 0; i < max_tokens; ++i) {
        const float* logits = llama_get_logits(g_state.ctx);
        if (!logits) break;
        llama_token token = sample_token(logits, n_vocab, temp, top_p);
        if (token == eos) break;

        std::vector<char> piece(128);
        int n = llama_token_to_piece(g_state.model, token, piece.data(), piece.size(), 0, false);
        if (n > 0) result.append(piece.data(), n);

        int pos = tokens.size() + i;
        if (llama_eval(g_state.ctx, &token, 1, pos, 0)) break;
    }
    return result.empty() ? "[no output]" : result;
}

extern "C" JNIEXPORT jstring JNICALL
Java_com_aimetafactory_llama_LlamaNative_generate(JNIEnv* env, jobject /* this */, jstring jprompt, jstring jmodelPath) {
    const char* prompt_cstr = env->GetStringUTFChars(jprompt, nullptr);
    const char* model_path = env->GetStringUTFChars(jmodelPath, nullptr);
    std::string result = generate_text(model_path, prompt_cstr, 256, 0.7f, 0.95f);
    env->ReleaseStringUTFChars(jprompt, prompt_cstr);
    env->ReleaseStringUTFChars(jmodelPath, model_path);
    return env->NewStringUTF(result.c_str());
}
