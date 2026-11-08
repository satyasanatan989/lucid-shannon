import zipfile

apk_path = r"c:\Users\prabh\Documents\antigravity\lucid-shannon\Aura-Music-Hybrid-SaaS-Release.apk"
with zipfile.ZipFile(apk_path) as z:
    for name in z.namelist():
        if "launcher" in name or "BW.xml" in name:
            print(name)
