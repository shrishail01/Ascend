import json
import os

def unpack():
    json_path = 'Ascend.json'
    if not os.path.exists(json_path):
        print(f"Error: {json_path} not found!")
        return

    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    files = data.get('template', {}).get('files', {})
    if not files:
        print("No files found in template.files key.")
        return

    for filepath, file_info in files.items():
        if not filepath:
            continue
        content = file_info.get('content', '')
        # Create directories if they don't exist
        dirname = os.path.dirname(filepath)
        if dirname:
            os.makedirs(dirname, exist_ok=True)
        
        with open(filepath, 'w', encoding='utf-8') as out_f:
            out_f.write(content)
        print(f"Unpacked: {filepath}")

if __name__ == '__main__':
    unpack()
