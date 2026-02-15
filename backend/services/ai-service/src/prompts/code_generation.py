"""
Prompt templates for code generation tasks.
These templates are designed to work with instruction-tuned models like TinyLlama, Qwen2, CodeLlama.
"""

# Template for generating code from a natural language instruction
CODE_GENERATION_TEMPLATE = """### Instruction:
Write code for the following task: {instruction}

### Context:
{context}

### Code:
"""

# Template for generating code with specific language/framework
CODE_GENERATION_WITH_LANG_TEMPLATE = """### Instruction:
Write {language} code for: {instruction}

### Context:
{context}

### Code:
"""

# Template for code completion (given prefix and optional suffix)
CODE_COMPLETION_TEMPLATE = """### Instruction:
Complete the following code. Only output the missing part that should be inserted at the cursor (<CURSOR>).

### Code so far:
{prefix}

<CURSOR>

{suffix}

### Completion:
"""

# Template for fixing code with error message
CODE_FIX_TEMPLATE = """### Instruction:
Fix the following code. Error: {error_message}

### Code:
{code}

### Fixed Code:
"""

# Template for optimizing code
CODE_OPTIMIZE_TEMPLATE = """### Instruction:
Optimize the following code for {focus} (performance/readability/both).

### Code:
{code}

### Optimized Code:
"""

# Template for generating unit tests
CODE_TEST_TEMPLATE = """### Instruction:
Generate {framework} unit tests for the following code. Include edge cases and typical scenarios.

### Code:
{code}

### Tests:
"""
