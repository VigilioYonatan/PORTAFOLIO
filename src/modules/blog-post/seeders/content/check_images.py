import os
import re

content_dir = '/config/Desktop/gat/portfolio/src/modules/blog-post/seeders/content'

def check_images():
    md_files = [f for f in os.listdir(content_dir) if f.endswith('.md')]
    missing_images = []
    
    print(f"{'File':<40} | {'Image Reference':<50} | {'Status'}")
    print("-" * 100)

    for md_file in md_files:
        filepath = os.path.join(content_dir, md_file)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Find all image refs: ![alt](path) or <img src="path">
        # Regex for markdown: !\[.*?\]\((.*?)\)
        matches = re.findall(r'!\[.*?\]\((.*?)\)', content)
        
        for img_path in matches:
            # Resolve path. Usually relative to the file.
            # If path starts with ./, it's relative
            # If path starts with /, it's absolute (but in web context? or file context?)
            # Usually in this repo they seem to be ./images/...
            
            if img_path.startswith('http'):
                continue # Skip external images
                
            # Construct full path
            # The md file is in content_dir.
            # img_path is relative to content_dir.
            full_path = os.path.normpath(os.path.join(content_dir, img_path))
            
            exists = os.path.exists(full_path)
            status = "OK" if exists else "MISSING"
            
            if not exists:
                missing_images.append((md_file, img_path))
                print(f"{md_file:<40} | {img_path:<50} | {status}")

    print("-" * 100)
    print(f"Total missing images: {len(missing_images)}")
    return missing_images

if __name__ == "__main__":
    check_images()
