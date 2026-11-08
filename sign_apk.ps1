[System.Environment]::SetEnvironmentVariable('JAVA_HOME', 'C:\Program Files\Android\Android Studio\jbr', 'Process')
$env:Path = "C:\Program Files\Android\Android Studio\jbr\bin;" + $env:Path

Set-Location "C:\Users\prabh\Documents\antigravity\lucid-shannon"
$buildTools = "C:\Users\prabh\AppData\Local\Android\Sdk\build-tools\35.0.0"
$keystore = "C:\Users\prabh\.android\debug.keystore"

Write-Host "1. ZipAligning APK..."
& "$buildTools\zipalign.exe" -p -f 4 Aura-Music-Rebuilt.apk Aura-Music-Aligned.apk

Write-Host "2. Signing APK with apksigner..."
& "$buildTools\apksigner.bat" sign --ks $keystore --ks-pass pass:android --key-pass pass:android --out Aura-Music-Release-Signed.apk Aura-Music-Aligned.apk

Write-Host "3. Verifying signature..."
& "$buildTools\apksigner.bat" verify Aura-Music-Release-Signed.apk

Write-Host "4. Checking Application Label..."
& "$buildTools\aapt.exe" dump badging Aura-Music-Release-Signed.apk | Select-String -Pattern "application-label:|application:"
