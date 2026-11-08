import os
import glob
import re
from PIL import Image, ImageDraw

base_dir = r"c:\Users\prabh\Documents\antigravity\lucid-shannon\apk_decompiled"
artifact_dir = r"C:\Users\prabh\.gemini\antigravity\brain\840e8c74-9c72-4411-850d-5a2879be5bc6"
src_icon_path = os.path.join(artifact_dir, "aura_music_app_icon_flat_1793910732538.jpg")

print("--- Step 1: Updating app_name across all strings.xml ---")
strings_files = glob.glob(os.path.join(base_dir, "res", "values*", "strings.xml"))
for sfile in strings_files:
    with open(sfile, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Replace app_name
    new_content = re.sub(r'<string name="app_name">.*?</string>', '<string name="app_name">Aura Music</string>', content)
    if new_content != content:
        with open(sfile, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"Updated app_name in {os.path.basename(os.path.dirname(sfile))}/strings.xml")

print("--- Step 2: Replacing Mipmap PNG icons ---")
densities = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
}

im = Image.open(src_icon_path).convert("RGBA")
w, h = im.size
min_dim = min(w, h)
left = (w - min_dim) // 2
top = (h - min_dim) // 2
im = im.crop((left, top, left + min_dim, top + min_dim))

for folder, size in densities.items():
    target_dir = os.path.join(base_dir, "res", folder)
    if os.path.exists(target_dir):
        # Square launcher
        square = im.resize((size, size), Image.Resampling.LANCZOS)
        square.save(os.path.join(target_dir, "ic_launcher.png"), "PNG")
        
        # Round launcher
        mask = Image.new("L", (size, size), 0)
        draw = ImageDraw.Draw(mask)
        draw.ellipse((0, 0, size, size), fill=255)
        round_img = square.copy()
        round_img.putalpha(mask)
        round_img.save(os.path.join(target_dir, "ic_launcher_round.png"), "PNG")
        print(f"Replaced {folder} icons ({size}x{size})")

# Also save full 512 master in drawable
im_512 = im.resize((512, 512), Image.Resampling.LANCZOS)
im_512.save(os.path.join(base_dir, "res", "drawable", "ic_aura_logo_512.png"), "PNG")

print("--- Step 3: Updating Adaptive Icon Vector Drawables ---")
# Replace ic_launcher_mark.xml and ic_mochy_mark.xml with Aura vector
aura_vector_xml = '''<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <!-- Aura Music - Stylized Audiophile "A" Waveform Mark -->
    <path
        android:fillColor="#FFFFFFFF"
        android:pathData="M32,74 L32,46 C32,43 35,43 35,46 L35,74 C35,77 32,77 32,74 Z" />
    <path
        android:fillColor="#00000000"
        android:strokeColor="#FFFFFFFF"
        android:strokeWidth="6"
        android:strokeLineCap="round"
        android:strokeLineJoin="round"
        android:pathData="M34,74 L54,26 L74,74" />
    <path
        android:fillColor="#FFFFFFFF"
        android:pathData="M52,62 L52,38 C52,35 56,35 56,38 L56,62 C56,65 52,65 52,62 Z" />
    <path
        android:fillColor="#00000000"
        android:strokeColor="#FFFFFFFF"
        android:strokeWidth="5"
        android:strokeLineCap="round"
        android:pathData="M42,58 L66,58" />
    <path
        android:fillColor="#FFFFFFFF"
        android:pathData="M73,74 L73,46 C73,43 76,43 76,46 L76,74 C76,77 73,77 73,74 Z" />
</vector>'''

for draw_file in ["ic_launcher_mark.xml", "ic_launcher_foreground.xml", "ic_launcher_monochrome.xml", "ic_mochy_mark.xml"]:
    fp = os.path.join(base_dir, "res", "drawable", draw_file)
    if os.path.exists(fp):
        with open(fp, "w", encoding="utf-8") as f:
            f.write(aura_vector_xml)
        print(f"Updated vector drawable: {draw_file}")

# Set launcher background to pure obsidian black
colors_xml_path = os.path.join(base_dir, "res", "values", "colors.xml")
if os.path.exists(colors_xml_path):
    with open(colors_xml_path, "r", encoding="utf-8") as f:
        c_content = f.read()
    c_content = re.sub(r'<color name="ic_launcher_background">.*?</color>', '<color name="ic_launcher_background">#FF000000</color>', c_content)
    with open(colors_xml_path, "w", encoding="utf-8") as f:
        f.write(c_content)
    print("Updated ic_launcher_background to #000000")

print("All patches applied to decompiled APK successfully!")
