import os
import re

pages_dir = 'src/pages'
files = sorted([f for f in os.listdir(pages_dir) if f.endswith('.tsx')])

for fname in files:
    fpath = os.path.join(pages_dir, fname)
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    print("-" * 50)
    print(f"PAGE: {fname}")
    print("-" * 50)
    
    # Extract state hook declarations
    states = re.findall(r'const\s+\[([^,\]]+),\s*[^\]]+\]\s*=\s*useState(?:<[^>]+>)?\((.*?)\);?', content)
    if states:
        print("  STATES:")
        for var, val in states:
            print(f"    {var.strip()}: initial = {val.strip()}")
            
    # Extract handler functions
    handlers = re.findall(r'(?:const|async\s+const|function)\s+(handle\w+|on\w+|load\w+)\s*=\s*(?:async\s*)?\((.*?)\)\s*=>', content)
    if handlers:
        print("  HANDLERS:")
        for name, args in handlers:
            print(f"    {name}({args})")
    
    # General overview of key UI sections in render
    print()
