import zipfile

apk_path = r"c:\Users\prabh\Documents\antigravity\lucid-shannon\Aura-Music-Hybrid-SaaS-Release.apk"
with zipfile.ZipFile(apk_path) as z:
    for name in z.namelist():
        if name.startswith("res/") and (name.endswith(".png") or name.endswith(".webp")):
            info = z.getinfo(name)
            print(f"{name}: {info.file_size} bytes")
