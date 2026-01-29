import os
import re

CONTENT_DIR = '/config/Desktop/gat/portfolio/src/modules/blog-post/seeders/content'

def count_images(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    return len(re.findall(r'!\[.*?\]\(.*?\)', content))

print(f"{'Filename':<40} | {'Images':<6}")
print("-" * 50)

for filename in os.listdir(CONTENT_DIR):
    if filename.endswith(".md"):
        filepath = os.path.join(CONTENT_DIR, filename)
        img_count = count_images(filepath)
        if img_count == 0:
             print(f"{filename:<40} | {img_count:<6}")
