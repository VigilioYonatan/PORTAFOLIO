import os
import re

content_dir = '/config/Desktop/gat/portfolio/src/modules/blog-post/seeders/content'

def count_chars(text):
    return len(text)

def analyze_file(filename):
    filepath = os.path.join(content_dir, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Use regex to find start of each section
    # Matches: ### ESPAÑOL (ES) ... (until next header or EOF)
    stats = {'es': 0, 'en': 0, 'pt': 0}
    
    # Simple strategy: find indices of the headers
    idx_es = content.find('### ESPAÑOL (ES)')
    idx_en = content.find('### ENGLISH (EN)')
    idx_pt = content.find('### PORTUGUÊS (PT)')
    
    # Store in a list of (index, lang) and sort by index
    headers = []
    if idx_es != -1: headers.append((idx_es, 'es'))
    if idx_en != -1: headers.append((idx_en, 'en'))
    if idx_pt != -1: headers.append((idx_pt, 'pt'))
    
    headers.sort(key=lambda x: x[0])
    
    for i in range(len(headers)):
        idx, lang = headers[i]
        # End index is the start of the next header, or end of file
        if i < len(headers) - 1:
            end_idx = headers[i+1][0]
        else:
            end_idx = len(content)
            
        section_content = content[idx:end_idx]
        # Don't count the header itself (approx 20 chars) but it's negligible
        stats[lang] = len(section_content.strip())

    return stats

print(f"{'Filename':<40} | {'ES':<6} | {'EN':<6} | {'PT':<6} | {'Status'}")
print("-" * 80)

files = [f for f in os.listdir(content_dir) if f.endswith('.md')]
files.sort()

needs_work = []

for f in files:
    stats = analyze_file(f)
    # Check if ANY language is under 3000
    is_low = stats['es'] < 3000 or stats['en'] < 3000 or stats['pt'] < 3000
    status = "LOW" if is_low else "OK"
    if is_low:
        needs_work.append(f)
        
    print(f"{f:<40} | {stats['es']:<6} | {stats['en']:<6} | {stats['pt']:<6} | {status}")

print("-" * 80)
print(f"Total files needing expansion: {len(needs_work)}")
print("Files:", needs_work)
