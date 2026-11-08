import zipfile

apk_path = r"c:\Users\prabh\Documents\antigravity\lucid-shannon\Aura-Music-Hybrid-SaaS-Release.apk"
with zipfile.ZipFile(apk_path) as z:
    data = z.read("resources.arsc")
    print("Length of resources.arsc:", len(data))
    count = data.count(b"Mochy")
    print("Occurrences of Mochy (ASCII):", count)
    count16 = data.count("Mochy".encode("utf-16le"))
    print("Occurrences of Mochy (UTF-16LE):", count16)
