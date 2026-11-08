import sys
import os
import torch

sys.path.insert(0, "C:/HinglishVoice/indicf5-finetune/src")

from f5_tts.model import DiT
from f5_tts.infer.utils_infer import load_model, load_checkpoint, load_vocoder, infer_process, preprocess_ref_audio_text
import soundfile as sf

ckpt = "C:/HinglishVoice/indicf5-finetune/checkpoints/model.safetensors"
vocab_file = "C:/HinglishVoice/indicf5-finetune/src/f5_tts/infer/examples/vocab.txt"
ref_audio = "C:/HinglishVoice/indicf5-finetune/voices/MAR_M_WIKI_00001.wav"
ref_text = "या प्रथाला एकोणीसशे पंचातर ईसवी पासून भारतीय दंड संहिताची धारा तीनशे दहा ते तीनशे अठरा अन्वये शिक्षापात्र गुन्हा ठरवण्यात आला."

device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Using device: {device}")

model_cfg = dict(dim=1024, depth=22, heads=16, ff_mult=2, text_dim=512, conv_layers=4)

print("1. Loading Vocos vocoder...")
vocoder = load_vocoder(vocoder_name="vocos", is_local=False, device=device)

print("2. Initializing CFM model...")
model = load_model(
    DiT,
    model_cfg,
    mel_spec_type="vocos",
    vocab_file=vocab_file,
    ode_method="euler",
    use_ema=True,
    device=device
)

print("3. Loading fine-tuned checkpoint...")
ema_model = load_checkpoint(model, ckpt, device=device, use_ema=True)
print("SUCCESS: IndicF5 model successfully loaded!")
