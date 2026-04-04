#include <jni.h>
#include <string>
#include <vector>
#include <algorithm>
#include <random>
#include <chrono>
#include <llama.h>

// Global caches (model + context) – vocab is owned by model, do NOT free
static struct {
    llama_model* model = nullptr;
    llama_context* ctx = nullptr;
    const llama_vocab* vocab = nullptr;   // const, owned by model
    std::string last_path;
} g_state;

static std::mt19937 rng(std::chrono::steady_clock::now().time_since_epoch().count());

// Helper: ensure model & context are loaded for a given path
static bool ensure_model(const std::string& model_path) {
    if (g_state.last_path == model_path && g_state.model && g_state.ctx && g_state.vocab) {
        return true;
    }
    // Clean up old (free only model and context, NOT vocab)
    if (g_state.ctx) {
        llama_free(g_state.ctx);
        g_state.ctx = nullptr;
    }
    if (g_state.model) {
        llama_model_free(g_state.model);
        g_state.model = nullptr;
    }
    g_state.vocab = nullptr;
    g_state.last_path.clear();

    // Load model
    llama_model_params model_params = llama_model_default_params();
    model_params.n_gpu_layers = 0;  // CPU only for now
    g_state.model = llama_load_model_from_file(model_path.c_str(), model_params);
    if (!g_state.model) return false;

    // Get vocab (const, owned by model)
    g_state.vocab = llama_model_get_vocab(g_state.model);
    if (!g_state.vocab) return false;

    // Create context
    llama_context_params ctx_params = llama_context_default_params();
    ctx_params.n_ctx = 2048;
    ctx_params.n_threads = 4;
    ctx_params.n_threads_batch = 4;
    g_state.ctx = llama_new_context_with_model(g_state.model, ctx_params);
    if (!g_state.ctx) return false;

    g_state.last_path = model_path;
    return true;
}

// Sample a token from logits (top-p / temperature)
static llama_token sample_token(const float* logits, int n_vocab, float temp, float top_p) {
    std::vector<std::pair<float, llama_token>> candidates;
    candidates.reserve(n_vocab);
    for (llama_token id = 0; id < n_vocab; ++id) {
        candidates.emplace_back(logits[id], id);
    }
    // Apply temperature
    if (temp > 0) {
        for (auto& p : candidates) p.first = std::exp(p.first / temp);
    }
    // Sort descending by probability
    std::sort(candidates.begin(), candidates.end(),
              [](const auto& a, const auto& b) { return a.first > b.first; });
    // Top-p (nucleus) sampling
    if (top_p < 1.0f && top_p > 0.0f) {
        float total = 0.0f;
        for (const auto& p : candidates) total += p.first;
        float cum = 0.0f;
        float cutoff = top_p * total;
        size_t last = candidates.size();
        for (size_t i = 0; i < candidates.size(); ++i) {
            cum += candidates[i].first;
            if (cum >= cutoff) {
                last = i + 1;
                break;
            }
        }
        if (last < candidates.size()) candidates.resize(last);
    }
    // Sample
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

// Generate text from prompt
static std::string generate_text(const std::string& model_path, const std::string& prompt,
                                 int max_tokens = 256, float temp = 0.7f, float top_p = 0.95f) {
    if (!ensure_model(model_path)) {
        return "Error: Failed to load model";
    }

    // Tokenize prompt
    std::vector<llama_token> tokens;
    int n_tokens = llama_tokenize(g_state.vocab, prompt.c_str(), prompt.length(), nullptr, 0, true, false);
    if (n_tokens < 0) return "Error: Tokenization failed";
    tokens.resize(n_tokens);
    n_tokens = llama_tokenize(g_state.vocab, prompt.c_str(), prompt.length(), tokens.data(), tokens.size(), true, false);
    tokens.resize(n_tokens);

    // Prepare batch (start with prompt)
    std::vector<llama_token> generated = tokens;
    std::string result;

    // Evaluate prompt tokens
    for (size_t i = 0; i < generated.size(); ++i) {
        llama_batch batch = llama_batch_get_one(&generated[i], 1);
        if (llama_decode(g_state.ctx, batch)) {
            return "Error: llama_decode failed at prompt";
        }
    }

    const int n_vocab = llama_vocab_n_tokens(g_state.vocab);
    const llama_token eos = llama_vocab_eos(g_state.vocab);

    // Generate new tokens
    for (int i = 0; i < max_tokens; ++i) {
        const float* logits = llama_get_logits(g_state.ctx);
        if (!logits) break;
        // Use the correct number of tokens in context for logits offset
        int n_tokens_ctx = llama_get_n_tokens(g_state.ctx);
        logits += (n_tokens_ctx - 1) * n_vocab; // last token's logits

        llama_token token = sample_token(logits, n_vocab, temp, top_p);
        if (token == eos) break;

        // Convert token to piece
        std::vector<char> piece(128);
        int n = llama_token_to_piece(g_state.vocab, token, piece.data(), piece.size(), 0, false);
        if (n > 0) result.append(piece.data(), n);

        generated.push_back(token);
        llama_batch batch = llama_batch_get_one(&token, 1);
        if (llama_decode(g_state.ctx, batch)) break;
    }

    return result.empty() ? "[no output]" : result;
}

// JNI entry point
extern "C" JNIEXPORT jstring JNICALL
Java_com_aimetafactory_llama_LlamaNative_generate(JNIEnv* env, jobject /* this */, jstring jprompt, jstring jmodelPath) {
    const char* prompt_cstr = env->GetStringUTFChars(jprompt, nullptr);
    const char* model_path = env->GetStringUTFChars(jmodelPath, nullptr);

    std::string result = generate_text(model_path, prompt_cstr, 256, 0.7f, 0.95f);

    env->ReleaseStringUTFChars(jprompt, prompt_cstr);
    env->ReleaseStringUTFChars(jmodelPath, model_path);

    return env->NewStringUTF(result.c_str());
}
