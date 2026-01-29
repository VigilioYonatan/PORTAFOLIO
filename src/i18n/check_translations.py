import re
import json

def parse_ui_ts(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    match = re.search(r'export const ui = \{(.*?)\};', content, re.DOTALL)
    if not match:
        print("Could not find 'ui' object")
        return None
    
    ui_content = match.group(1)
    
    # Improved block extraction
    # Find indices of "en:", "es:", "pt:"
    # Note: they might be surrounded by whitespace or tabs
    
    en_curr = re.search(r'\ben:\s*\{', ui_content).start()
    es_curr = re.search(r'\bes:\s*\{', ui_content).start()
    pt_curr = re.search(r'\bpt:\s*\{', ui_content).start()
    
    def get_block(text, start_index):
        cnt = 0
        found_start = False
        block_content = ""
        # Find the first '{' after start_index
        for i in range(start_index, len(text)):
            char = text[i]
            if char == '{':
                cnt += 1
                found_start = True
            elif char == '}':
                cnt -= 1
            
            if found_start:
                block_content += char
            
            if found_start and cnt == 0:
                # remove the first '{' and last '}' to get inner content? 
                # No, let's keep it consistent or strip it later. 
                # Actually my extract_keys expects content inside.
                return block_content[1:-1] # Strip outer braces
        return ""

    en_block = get_block(ui_content, en_curr)
    es_block = get_block(ui_content, es_curr)
    pt_block = get_block(ui_content, pt_curr)
    
    # print(f"DEBUG: EN Block length: {len(en_block)}")

    def extract_keys(block, prefix=""):
        keys = set()
        stack = [] 
        
        lines = block.split('\n')
        
        for line in lines:
            line = line.strip()
            if not line: continue
            if line.startswith('//'): continue
            
            # Regex to match keys:
            # 1. unquoted:  key:
            # 2. quoted:    "key":
            # 3. number:    404:
            
            # We want to capture the key name.
            # Group 2 is unquoted/number, Group 3 is quoted.
            
            key_match = re.match(r'^(([\w\d_]+)|"([\w\d_\-\.]+)")\s*:', line)
            
            if key_match:
                # Key is either group 2 or group 3
                raw_key = key_match.group(2) or key_match.group(3)
                
                # If brace open
                if '{' in line:
                    stack.append(raw_key)
                    full_key = ".".join(stack)
                    keys.add(full_key)
                else:
                    # Leaf
                    full_key = ".".join(stack + [raw_key])
                    keys.add(full_key)

            # Check for closing braces
            # Count closing braces using stack logic is fragile if multiple on one line.
            # But with Prettier/Standard formatting, usually `},` is on its own line or at end.
            
            # Simple stack pop logic:
            if line.startswith('},') or line.startswith('}'):
                if stack:
                    stack.pop()
            
            # Edge case: key: { ... }, (one liner) ? 
            # Assuming not present based on file view.
            
        return keys

    en_keys = extract_keys(en_block, "en")
    es_keys = extract_keys(es_block, "es")
    pt_keys = extract_keys(pt_block, "pt")
    
    return en_keys, es_keys, pt_keys

def compare_keys():
    result = parse_ui_ts('/config/Desktop/gat/portfolio/src/i18n/ui.ts')
    if not result: return

    en, es, pt = result
    
    # Re-extract blocks to get ordered keys (this is inefficient but simple)
    # We need the blocks again.
    
    # Actually, let's just modify the return of parse_ui_ts to return blocks or ordered keys directly.
    # But since I cannot change parse_ui_ts easily without re-writing it, let's just copy the block extraction logic here or assume checking order implies re-reading.
    
    # Let's just fix the function signature and re-read file
    
    with open('/config/Desktop/gat/portfolio/src/i18n/ui.ts', 'r', encoding='utf-8') as f:
        content = f.read()

    match = re.search(r'export const ui = \{(.*?)\};', content, re.DOTALL)
    if not match: return
    ui_content = match.group(1)
    
    en_curr = re.search(r'\ben:\s*\{', ui_content).start()
    es_curr = re.search(r'\bes:\s*\{', ui_content).start()
    pt_curr = re.search(r'\bpt:\s*\{', ui_content).start()

    def get_block(text, start_index):
        cnt = 0
        found_start = False
        block_content = ""
        for i in range(start_index, len(text)):
            char = text[i]
            if char == '{':
                cnt += 1
                found_start = True
            elif char == '}':
                cnt -= 1
            if found_start: block_content += char
            if found_start and cnt == 0: return block_content[1:-1]
        return ""

    en_block = get_block(ui_content, en_curr)
    es_block = get_block(ui_content, es_curr)
    pt_block = get_block(ui_content, pt_curr)
    
    def get_ordered_keys(block, prefix=""):
        keys = []
        stack = [] 
        lines = block.split('\n')
        for line in lines:
            line = line.strip()
            if not line: continue
            if line.startswith('//'): continue
            key_match = re.match(r'^(([\w\d_]+)|"([\w\d_\-\.]+)")\s*:', line)
            if key_match:
                raw_key = key_match.group(2) or key_match.group(3)
                if '{' in line:
                    stack.append(raw_key)
                    full_key = ".".join(stack)
                    keys.append(full_key)
                else:
                    full_key = ".".join(stack + [raw_key])
                    keys.append(full_key)
            if line.startswith('},') or line.startswith('}'):
                if stack:
                    stack.pop()
        return keys

    en_ord = get_ordered_keys(en_block, "en")
    es_ord = get_ordered_keys(es_block, "es")
    pt_ord = get_ordered_keys(pt_block, "pt")
    
    print(f"\nOrder check:")
    if en_ord == es_ord:
        print("ES Order matches EN Order.")
    else:
        print("ES Order DOES NOT match EN Order.")
        for i, (k1, k2) in enumerate(zip(en_ord, es_ord)):
            if k1 != k2:
                print(f"Mismatch at index {i}: EN={k1}, ES={k2}")
                break
                
    if en_ord == pt_ord:
        print("PT Order matches EN Order.")
    else:
        print("PT Order DOES NOT match EN Order.")
        for i, (k1, k2) in enumerate(zip(en_ord, pt_ord)):
            if k1 != k2:
                print(f"Mismatch at index {i}: EN={k1}, PT={k2}")
                break

if __name__ == "__main__":
    compare_keys()
