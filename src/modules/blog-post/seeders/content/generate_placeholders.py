import os
import re
from PIL import Image, ImageDraw, ImageFont

content_dir = '/config/Desktop/gat/portfolio/src/modules/blog-post/seeders/content'

def get_missing_images():
    md_files = [f for f in os.listdir(content_dir) if f.endswith('.md')]
    missing = []
    
    for md_file in md_files:
        filepath = os.path.join(content_dir, md_file)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        matches = re.findall(r'!\[.*?\]\((.*?)\)', content)
        
        for img_path in matches:
            if img_path.startswith('http'): continue
            
            full_path = os.path.normpath(os.path.join(content_dir, img_path))
            if not os.path.exists(full_path):
                missing.append(img_path)
                
    return list(set(missing)) # Deduplicate

def create_placeholder(rel_path):
    full_path = os.path.join(content_dir, rel_path)
    dirname = os.path.dirname(full_path)
    
    if not os.path.exists(dirname):
        os.makedirs(dirname)
        
    # Create image
    width, height = 800, 400
    color = (40, 44, 52) # Dark grey background
    text_color = (255, 255, 255)
    
    img = Image.new('RGB', (width, height), color=color)
    d = ImageDraw.Draw(img)
    
    # Try to load a font, fallback to default
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 24)
    except IOError:
        font = ImageFont.load_default()
        
    text = f"Image Placeholder\n{os.path.basename(rel_path)}"
    
    # Get text size using textbbox (newer PIL) or textsize (older)
    try:
        left, top, right, bottom = d.textbbox((0, 0), text, font=font)
        text_w = right - left
        text_h = bottom - top
    except AttributeError:
        text_w, text_h = d.textsize(text, font=font)
        
    position = ((width - text_w) / 2, (height - text_h) / 2)
    
    d.text(position, text, fill=text_color, font=font, align="center")
    
    # Add a border
    d.rectangle([0, 0, width-1, height-1], outline=(100, 100, 100), width=5)
    
    img.save(full_path)
    print(f"Created: {rel_path}")

def main():
    missing = get_missing_images()
    print(f"Found {len(missing)} missing images.")
    for path in missing:
        try:
            create_placeholder(path)
        except Exception as e:
            print(f"Failed to create {path}: {e}")

if __name__ == "__main__":
    main()
