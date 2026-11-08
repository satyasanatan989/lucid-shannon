import zipfile

apk_path = r"c:\Users\prabh\Documents\antigravity\lucid-shannon\Aura-Music-Hybrid-SaaS-Release.apk"
with zipfile.ZipFile(apk_path) as z:
    data = z.read("resources.arsc")
    idx = data.find(b"Mochy")
    print("First index:", idx)
    print("Bytes around it:", list(data[idx-4:idx+10]))
