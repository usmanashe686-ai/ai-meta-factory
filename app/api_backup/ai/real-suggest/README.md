# Local AI Setup

## 1. Install Ollama
```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows (WSL2 recommended)
# Follow instructions at https://ollama.com
cat > app/api/ai/real-suggest/README.md << 'EOF'
# Local AI Setup

## 1. Install Ollama

### macOS
brew install ollama

### Linux
curl -fsSL https://ollama.com/install.sh | sh

### Windows
Install via WSL2 or download from:
https://ollama.com

---

## 2. Start Ollama Server

```bash
ollama serve
