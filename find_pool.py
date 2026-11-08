import zipfile

apk_path = r"c:\Users\prabh\Documents\antigravity\lucid-shannon\Aura-Music-Hybrid-SaaS-Release.apk"
with zipfile.ZipFile(apk_path) as z:
    data = z.read("resources.arsc")

for target in [b"\x05\x05Mochy\x00", b"\x05Mochy\x00"]:
    print(f"Target {target}: {data.count(target)} occurrences")
