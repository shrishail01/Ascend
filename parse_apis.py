import os
import re

api_dir = 'src/api'
files = sorted([f for f in os.listdir(api_dir) if f.endswith('.ts')])

for fname in files:
    fpath = os.path.join(api_dir, fname)
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    print("=" * 80)
    print(f"FILE: {fname}")
    print("=" * 80)
    
    # Input schema
    input_match = re.search(r'inputSchema:\s*(z\.object\(\{.*?\}\)|z\.any\(.*?\)|z\.object\(\{.*?\n\s*\}\))', content, re.DOTALL)
    if input_match:
        print(f"INPUT SCHEMA:\n{input_match.group(1).strip()}\n")
    else:
        # try multiline z.object
        lines = content.split('\n')
        start = -1
        for idx, line in enumerate(lines):
            if 'inputSchema:' in line:
                start = idx
                break
        if start != -1:
            schema_lines = []
            brace_count = 0
            for line in lines[start:]:
                schema_lines.append(line)
                brace_count += line.count('{') - line.count('}')
                if '})' in line or (brace_count <= 0 and 'Schema' not in line and idx != start):
                    if 'inputSchema' in ''.join(schema_lines):
                        break
            print(f"INPUT SCHEMA (approx):\n" + "\n".join(schema_lines) + "\n")
            
    # Output schema
    output_match = re.search(r'outputSchema:\s*(z\.object\(\{.*?\}\)|z\.any\(.*?\))', content, re.DOTALL)
    if output_match:
        print(f"OUTPUT SCHEMA:\n{output_match.group(1).strip()}\n")
    else:
        lines = content.split('\n')
        start = -1
        for idx, line in enumerate(lines):
            if 'outputSchema:' in line:
                start = idx
                break
        if start != -1:
            schema_lines = []
            for line in lines[start:]:
                schema_lines.append(line)
                if '})' in line or '}),' in line:
                    break
            print(f"OUTPUT SCHEMA (approx):\n" + "\n".join(schema_lines) + "\n")

    # DB Operations
    db_ops = []
    for line in content.split('\n'):
        if any(op in line for op in ['Users.', 'Resumes.', 'AtsAnalyses.', 'CoverLetters.', 'InterviewSessions.', 'JobApplications.']):
            db_ops.append(line.strip())
    if db_ops:
        print("DATABASE OPERATIONS:")
        for op in db_ops:
            print(f"  {op}")
        print()
        
    # Gemini calls
    gemini_calls = []
    gemini_matches = re.finditer(r'(callGemini(?:JSON|WithFile)?)\((.*?)\)', content, re.DOTALL)
    for m in gemini_matches:
        gemini_calls.append(m.group(0))
    if gemini_calls:
        print("GEMINI CALLS:")
        for gc in gemini_calls:
            # print up to 300 chars of each call
            print(gc[:500] + ("..." if len(gc) > 500 else ""))
        print()
    
    # Other fetches
    fetches = [line.strip() for line in content.split('\n') if 'fetch(' in line]
    if fetches:
        print("EXTERNAL FETCHES:")
        for f_call in fetches:
            print(f"  {f_call}")
        print()
