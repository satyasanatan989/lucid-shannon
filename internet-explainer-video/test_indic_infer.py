import sys
import os
import torch
import soundfile as sf

sys.path.insert(0, "C:/HinglishVoice/indicf5-finetune/src")

from f5_tts.model import DiT
from f5_tts.infer.utils_infer import load_model, load_checkpoint, load_vocoder, infer_process, preprocess_ref_audio_text

ckpt = "C:/HinglishVoice/indicf5-finetune/checkpoints/model.safetensors"
vocab_file = "C:/HinglishVoice/indicf5-finetune/src/f5_tts/infer/examples/vocab.txt"
ref_audio = "C:/HinglishVoice/indicf5-finetune/voices/MAR_M_WIKI_00001.wav"
ref_text = "या प्रथाला एकोणीसशे पंचातर ईसवी पासून भारतीय दंड संहिताची धारा तीनशे दहा ते तीनशे अठरा अन्वये शिक्षापात्र गुन्हा ठरवण्यात आला."

device = "cpu"
model_cfg = dict(dim=1024, depth=22, heads=16, ff_mult=2, text_dim=512, conv_layers=4)

vocoder = load_vocoder(vocoder_name="vocos", is_local=False, device=device)
model = load_model(DiT, model_cfg, mel_spec_type="vocos", vocab_file=vocab_file, ode_method="euler", use_ema=True, device=device)
ema_model = load_checkpoint(model, ckpt, device=device, use_ema=True)

test_text = "261 BCE mein, Samrat Ashoka ne Kalinga par aakraman kiya."
print(f"Generating test Hinglish audio for: '{test_text}'...")

ref_audio_processed, ref_text_processed = preprocess_ref_audio_text(ref_audio, ref_text)
wav, sr, _ = infer_process(
    ref_audio_processed,
    ref_text_processed,
    test_text,
    ema_model,
    vocoder,
    mel_spec_type="vocos",
    nfe_step=16,  # Fast 16 steps
    device=device
)

out_file = "C:/Users/prabh/.gemini/antigravity/brain/9491c393-2d38-44e0-9c0c-e0a6653db413/test_indic_output.wav"
sf.write(out_file, wav, sr)
print("SUCCESS: Audio written to", out_file)
