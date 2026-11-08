import math
import struct
import wave
import subprocess
import os

AUDIO_DIR = "C:/Users/prabh/.gemini/antigravity/brain/9491c393-2d38-44e0-9c0c-e0a6653db413"
VOICEOVER = os.path.join(AUDIO_DIR, "voiceover.mp3")
BGM_OUT = os.path.join(AUDIO_DIR, "bgm.wav")
MASTER_AUDIO = os.path.join(AUDIO_DIR, "master_soundtrack.mp3")

print("1. Synthesizing background music track (40s)...")
sample_rate = 44100
total_samples = int(40.0 * sample_rate)
bgm_data = bytearray()

for i in range(total_samples):
    t = i / sample_rate
    # Rhythmic pulse beat
    beat_t = t % 0.5
    kick = math.sin(2 * math.pi * 55 * beat_t) * math.exp(-beat_t * 12) if beat_t < 0.25 else 0
    
    # Warm chords (F - C - Dm - Bb)
    prog = int(t / 4) % 4
    chords = [
        [174.6, 220.0, 261.6],
        [130.8, 164.8, 196.0],
        [146.8, 174.6, 220.0],
        [116.5, 146.8, 174.6]
    ]
    freqs = chords[prog]
    synth = sum(math.sin(2 * math.pi * f * t) * 0.07 for f in freqs)
    
    # Acoustic pulse
    arp_note = freqs[int(t * 4) % 3] * 2
    arp = math.sin(2 * math.pi * arp_note * t) * 0.04 * math.exp(-(t % 0.25) * 8)
    
    val = kick * 0.25 + synth * 0.35 + arp * 0.2
    val = max(-0.95, min(0.95, val))
    sample = int(val * 32767)
    bgm_data.extend(struct.pack('<h', sample))

with wave.open(BGM_OUT, 'w') as wf:
    wf.setnchannels(1)
    wf.setsampwidth(2)
    wf.setframerate(sample_rate)
    wf.writeframes(bgm_data)

print("BGM generated successfully!")

print("2. Mixing Voiceover and BGM with FFmpeg...")
filter_str = "[1:a]volume=0.3,lowpass=f=3000[bgm];[0:a]volume=1.3[vox];[vox][bgm]amix=inputs=2:duration=first:dropout_transition=2[out]"

cmd = [
    "ffmpeg", "-y",
    "-i", VOICEOVER,
    "-i", BGM_OUT,
    "-filter_complex", filter_str,
    "-map", "[out]",
    "-c:a", "libmp3lame",
    "-b:a", "192k",
    MASTER_AUDIO
]

res = subprocess.run(cmd, capture_output=True, text=True)
if res.returncode == 0:
    print("SUCCESS: Master audio produced at", MASTER_AUDIO)
else:
    print("Error:", res.stderr)
