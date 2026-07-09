import os
import re

api_dir = 'src/api'
files = sorted([f for f in os.listdir(api_dir) if f.endswith('.ts')])

for fname in files:
    fpath = os.path.join(api_dir, fname)
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    if 'callGemini' in content:
        print("=" * 80)
        print(f"GEMINI CALL IN FILE: {fname}")
        print("=" * 80)
        
        # Extract prompt string
        prompt_match = re.search(r'const prompt = `(.*?)`;', content, re.DOTALL)
        if prompt_match:
            print(f"PROMPT DEFINITION:\n{prompt_match.group(1).strip()[:1000]}")
            if len(prompt_match.group(1).strip()) > 1000:
                print("... [TRUNCATED] ...")
        else:
            # Try to search for prompt variable or any multi-line string near callGemini
            prompt_match_2 = re.search(r'prompt\s*=\s*(?:`|")(.*?)(?:`|")', content, re.DOTALL)
            if prompt_match_2:
                print(f"PROMPT DEFINITION:\n{prompt_match_2.group(1).strip()[:1000]}")
            else:
                print("Prompt variable not found via regex.")
                
        # Extract systemInstruction string
        sys_match = re.search(r'callGemini(?:JSON|WithFile)?\([^,]+,\s*[\'"`](.*?)[\'"`]\)', content, re.DOTALL)
        if sys_match:
            print(f"\nSYSTEM INSTRUCTION:\n{sys_match.group(1).strip()}")
        else:
            # try to search for system instruction string
            print("\nSystem Instruction not found in callGemini arguments directly (or matches multiline).")
        print()
