import sys
import os
import torch
import soundfile as sf
import numpy as np
import subprocess

sys.path.insert(0, "C:/HinglishVoice/indicf5-finetune/src")

from f5_tts.model import DiT
from f5_tts.infer.utils_infer import load_model, load_checkpoint, load_vocoder, infer_process, preprocess_ref_audio_text

OUTPUT_DIR = "C:/Users/prabh/.gemini/antigravity/brain/9491c393-2d38-44e0-9c0c-e0a6653db413"
ckpt = "C:/HinglishVoice/indicf5-finetune/checkpoints/model.safetensors"
vocab_file = "C:/HinglishVoice/indicf5-finetune/src/f5_tts/infer/examples/vocab.txt"
ref_audio = "C:/HinglishVoice/indicf5-finetune/voices/MAR_M_WIKI_00001.wav"
ref_text = "या प्रथाला एकोणीसशे पंचातर ईसवी पासून भारतीय दंड संहिताची धारा तीनशे दहा ते तीनशे अठरा अन्वये शिक्षापात्र गुन्हा ठरवण्यात आला."

device = "cpu"
model_cfg = dict(dim=1024, depth=22, heads=16, ff_mult=2, text_dim=512, conv_layers=4)

print("=== HINGLISH VOICE SYNTHESIS (IndicF5 Fine-Tuned Model) ===")
print("Loading vocoder & model...")
vocoder = load_vocoder(vocoder_name="vocos", is_local=False, device=device)
model = load_model(DiT, model_cfg, mel_spec_type="vocos", vocab_file=vocab_file, ode_method="euler", use_ema=True, device=device)
ema_model = load_checkpoint(model, ckpt, device=device, use_ema=True)
print("Model loaded successfully!")

ref_audio_processed, ref_text_processed = preprocess_ref_audio_text(ref_audio, ref_text)

chapters = [
    "2200 saal pehle, Bharat par raaj karta tha ek aisa emperor jiske naam se dushman kaanpte the... Samrat Ashoka. Usne Mauryan Empire ko Afghanistan se Bengal tak expand kiya.",
    "Lekin 261 BCE mein hui Battle of Kalinga. Ek laakh se zyada log maare gaye, aur Daya Nadi ka paani laal khoon ban gaya.",
    "Jeet toh hui, lekin us tabahi ne Ashoka ko andar tak tod diya. It was a victory written entirely in blood.",
    "Ashoka ne apni talwar hamesha ke liye chhod di. Yuddh ke dhol band huye, aur shuru hua peace aur Buddhism ka sandesh.",
    "Unhone khade kiye 33 rock edicts aur Sarnath ka Lion Capital, jiska 24-spoke Ashoka Chakra aaj hamare Tirange ki shaan hai.",
    "Itihaas mein hazaron conquerors huye, lekin Ashoka the Great is the only king jisne jeetne ke baad yuddh chhod diya."
]

all_waves = []
sample_rate = 24000

for idx, text in enumerate(chapters):
    print(f"\n[Chapter {idx+1}/{len(chapters)}] Synthesizing: {text[:50]}...")
    wav, sr, _ = infer_process(
        ref_audio_processed,
        ref_text_processed,
        text,
        ema_model,
        vocoder,
        mel_spec_type="vocos",
        nfe_step=16,
        device=device
    )
    sample_rate = sr
    all_waves.append(wav)
    # Add 0.5s pause between chapters
    silence = np.zeros(int(sr * 0.5), dtype=np.float32)
    all_waves.append(silence)

full_narration = np.concatenate(all_waves)
narration_path = os.path.join(OUTPUT_DIR, "ashoka_narration.wav")
sf.write(narration_path, full_narration, sample_rate)
print(f"\nFull narration saved to: {narration_path}")

# Now mix with cinematic Indian war-to-peace BGM
print("\nMixing with cinematic soundtrack...")
duration = len(full_narration) / sample_rate
bgm_path = os.path.join(OUTPUT_DIR, "ashoka_bgm.wav")
master_soundtrack = os.path.join(OUTPUT_DIR, "ashoka_master_soundtrack.mp3")

# Generate cinematic war-to-peace musical bed
total_samples = int(duration * 44100)
import math
bgm_data = bytearray()
for i in range(total_samples):
    t = i / 44100
    if t < 18.0:
        # War Drums (Heavy Nagada pulse at 100 BPM)
        beat_t = t % 0.6
        drum = math.sin(2 * math.pi * 48 * beat_t) * math.exp(-beat_t * 9) if beat_t < 0.3 else 0
        drone = math.sin(2 * math.pi * 73.4 * t) * 0.2 + math.sin(2 * math.pi * 110.0 * t) * 0.15
        val = drum * 0.35 + drone * 0.2
    else:
        # Peaceful Serene Raag (Bansuri flute & Tanpura harmonics)
        rel_t = t - 18.0
        drone = math.sin(2 * math.pi * 130.8 * t) * 0.15 + math.sin(2 * math.pi * 196.0 * t) * 0.1
        # Flute gentle vibrato
        vib = math.sin(2 * math.pi * 5.0 * t) * 4.0
        flute = math.sin(2 * math.pi * (392.0 + vib) * t) * 0.18 * (0.5 + 0.5 * math.sin(t * 1.5))
        val = drone * 0.2 + flute * 0.3
    
    val = max(-0.95, min(0.95, val))
    sample = int(val * 32767)
    import struct
    bgm_data.extend(struct.pack('<h', sample))

import wave
with wave.open(bgm_path, 'w') as wf:
    wf.setnchannels(1)
    wf.setsampwidth(2)
    wf.setframerate(44100)
    wf.writeframes(bgm_data)

# Final Mix with FFmpeg
cmd = [
    "ffmpeg", "-y",
    "-i", narration_path,
    "-i", bgm_path,
    "-filter_complex", "[1:a]volume=0.28,lowpass=f=3500[bgm];[0:a]volume=1.35[vox];[vox][bgm]amix=inputs=2:duration=first:dropout_transition=2[out]",
    "-map", "[out]",
    "-c:a", "libmp3lame",
    "-b:a", "192k",
    master_soundtrack
]
subprocess.run(cmd, check=True)
print("SUCCESS: Ashoka Master Soundtrack ready at:", master_soundtrack)
