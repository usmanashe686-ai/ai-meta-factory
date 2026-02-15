"""
Prompt templates for code explanation tasks.
"""

EXPLANATION_SIMPLE_TEMPLATE = """### Instruction:
Explain the following code in simple terms.

### Code:
{code}

### Explanation:
"""

EXPLANATION_DETAILED_TEMPLATE = """### Instruction:
Provide a detailed explanation of the following code, including its purpose, logic, and any potential issues.

### Code:
{code}

### Detailed Explanation:
"""

EXPLANATION_WITH_CONTEXT_TEMPLATE = """### Instruction:
Explain the following code, considering the project context: {context}

### Code:
{code}

### Explanation:
"""

SUMMARIZE_CODE_TEMPLATE = """### Instruction:
Summarize what the following code does in one paragraph.

### Code:
{code}

### Summary:
"""

DOCSTRING_GENERATION_TEMPLATE = """### Instruction:
Generate a docstring for the following function/class.

### Code:
{code}

### Docstring:
"""
