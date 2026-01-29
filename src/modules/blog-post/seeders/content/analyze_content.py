import os
import re

CONTENT_DIR = '/config/Desktop/gat/portfolio/src/modules/blog-post/seeders/content'
MIN_CHARS = 3000 # Per file? Or per language? User said "minimo 3000 caracteres debe haber en blog-post/seeders/content/.md" -> implies total per file usually, or per language section if split.
# Given previous context, it's likely per language, but let's just check total first.
# 3000 chars total is very small for 3 languages. 9000 is more likely.
# But let's report total length and image count.

def analyze_files():
    results = []
    for filename in os.listdir(CONTENT_DIR):
        if not filename.endswith('.md'):
            continue
            
        filepath = os.path.join(CONTENT_DIR, filename)
        with open(filepath, 'r') as f:
            content = f.read()
            
        char_count = len(content)
        image_count = len(re.findall(r'!\[.*?\]\(.*?\)', content))
        
        # Check for language sections
        has_es = '### ESPAÑOL (ES)' in content
        has_en = '### ENGLISH (EN)' in content
        has_pt = '### PORTUGUÊS (PT)' in content
        
        results.append({
            'filename': filename,
            'char_count': char_count,
            'image_count': image_count,
            'has_es': has_es,
            'has_en': has_en,
            'has_pt': has_pt
        })
        
    # Sort by character count (ascending) to find shortest files
    results.sort(key=lambda x: x['char_count'])
    
    print(f"{'Filename':<40} | {'Chars':<10} | {'Images':<6} | {'ES':<3} | {'EN':<3} | {'PT':<3}")
    print("-" * 85)
    for r in results:
        print(f"{r['filename']:<40} | {r['char_count']:<10} | {r['image_count']:<6} | {r['has_es']:<3} | {r['has_en']:<3} | {r['has_pt']:<3}")

if __name__ == "__main__":
    analyze_files()
