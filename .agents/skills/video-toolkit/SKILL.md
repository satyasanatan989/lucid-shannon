---
name: video-toolkit
description: Autonomous viral video production, tactile papercraft motion graphics, and neural Hinglish voice cloning system integrating claude-code-video-toolkit with PaperMotion AI.
metadata:
  openclaw:
    emoji: "🎬"
    skillKey: "video-toolkit"
    os: ["win32", "darwin", "linux"]
    requires:
      bins: ["python", "node", "ffmpeg"]
---

# 🎬 Video Toolkit & PaperMotion AI for ECC Agents

Autonomous code-to-video production pipeline integrating **DigitalSamba's Claude Code Video Toolkit** with **PaperMotion AI** to generate viral micro-documentaries, tactile papercraft animations, and natural Hinglish voiceovers matching the **MeanwhileMayank**, **Vox**, and **Kurzgesagt** visual and audio aesthetic.

---

## 🏛️ Supported Production Routes

| Route | Engine | Best For | Output Specifications |
| :--- | :--- | :--- | :--- |
| **`papermotion-explainer`** | HTML5 Canvas + SVG + CDP Memory Pipe | History, Science, Biology, and Viral Concept Explainers (Papercraft style) | 1080x1920 (9:16) @ 30/60 FPS |
| **`concept-explainer-short`** | Remotion / Python CLI | Quick factual Shorts & Reels with automated subtitles | 1080x1920 (9:16) @ 30 FPS |
| **`synthetic-ui-demo`** | React Remotion Stage & Cursor | Software walkthroughs, click-path demos, release notes | 1920x1080 (16:9) @ 30 FPS |
| **`data-story`** | Remotion DataChart / Matplotlib | Statistical trends, dynamic bar races, casualty counters | 1080x1920 or 16:9 |

---

## 🎙️ Audio & Hinglish Voiceover Standards

### 1. Voice Cloning & Speech Synthesis
- **Reference Voice Sample**: `paper-motion-agent/assets/reference_mayank_sample.wav` (clean 15s reference extracted from user reference video `VID_20261026_112707_908.mp4`).
- **Engines Supported**:
  - `edge-tts`: `hi-IN-MadhurNeural` (`--rate=+8%`, `--pitch=+2Hz`) for fluent, 100% intelligible Hinglish.
  - `jugnu-pocket-tts` (`AltSlate-Labs/jugnu-pocket-tts`): Kyutai CALM zero-shot voice cloning.
- **Language Scripting Rule**:
  - Code-switch naturally between Hindi phrasing and English technical/food terms.
  - Example: *"Pizza, samosa ya bhature khate hi mazaa to bohot aata hai, lekin kuch ghanto baad seene me heavy acidity kyun hoti hai?"*
  - Always verify with Whisper: target output must detect `Language: hi`.

### 2. Speaking Rate & Pacing Gate
- Measure words-per-minute (WPM) using `claude-code-video-toolkit/tools/pacing.py`:
  - **Comfortable Explainer Pace**: $140 - 165\text{ WPM}$.
  - Warnings trigger if pace exceeds $180\text{ WPM}$ (rushed) or falls below $110\text{ WPM}$ (lethargic).

### 3. Dynamic Foley Soundscapes & Audio Ducking
- **Foley Transients**:
  - Sizzling frying oil (Samosa / Food).
  - Metallic blade clashes and war drums (Historical battles).
  - Chemical acid bubbling and $38\text{ Hz}$ gut rumbles (Biology & digestion).
  - Mechanical gear clicks and split-flap ratchets (Timers & metrics).
- **Sidechain Ducking**:
  - Apply automated sidechain compression so background soundscapes dip by $75\%$ while speech is active.
  - Command: `python claude-code-video-toolkit/tools/addmusic.py` or `compose_soundtrack.py`.

---

## 🎨 Visual Papercraft Motion Standards

To replicate the reference video aesthetic (`MeanwhileMayank` / `Vox`):

1. **Procedural Aged Parchment**:
   - Radial gradient (`#FAF2E4` to `#CBB896`).
   - Procedural organic fiber specks and tea-stain blotches via HTML5 Canvas.
2. **Layered 3D Paper Cutouts**:
   - Apply `filter: drop-shadow(0 10px 18px rgba(25, 18, 12, 0.32))` to all vector silhouettes and badge cards.
   - Torn paper stroke effects using dashed line boundaries.
3. **Scroll Spine & Scorched Vignette**:
   - Center spine crease: `linear-gradient(90deg, transparent 48.5%, rgba(60, 40, 20, 0.25) 49.8%, rgba(20, 10, 5, 0.45) 50%, rgba(60, 40, 20, 0.25) 50.2%, transparent 51.5%)`.
   - Scorched edges: radial vignette burning inwards from the screen border.
4. **Mechanical Split-Flap Counters**:
   - Antiqued flight-board numeral tiles flipping dynamically with progress.
5. **Mathematical Vector Animations**:
   - Rotating 24-spoke Ashoka Chakra ($15^\circ$ spacing per spoke).
   - Biological kernel cross-sections (Bran, Germ, Endosperm peeling animation).
   - Corrosive acid level rising into esophageal sphincter.

---

## ⚡ Execution Workflows for ECC Agents

### Workflow A: Generate Papercraft Video via Template Builder

```bash
# 1. Navigate to the template
cd claude-code-video-toolkit/templates/papermotion-explainer

# 2. Run the autonomous builder
python build.py --output out/my_explainer.mp4 --fps 30
```

### Workflow B: Frame-by-Frame Quality Control & Contact Sheet

```bash
# 1. Run automated pre/post-render quality gate
python claude-code-video-toolkit/tools/qc.py --render out/my_explainer.mp4

# 2. Generate contact sheet of settled scene frames
python claude-code-video-toolkit/tools/contact_sheet.py out/my_explainer.mp4 --count 6
```

### Workflow C: Custom Voiceover Synthesis with Pacing Check

```python
from pathlib import Path
import subprocess

# 1. Measure script pace
script_text = "Whole wheat grain me teen parts hote hain: bran, germ aur endosperm..."
words = len(script_text.split())

# 2. Synthesize audio with edge-tts
cmd = [
    "edge-tts",
    "--voice", "hi-IN-MadhurNeural",
    "--rate=+8%",
    "--pitch=+2Hz",
    "--text", script_text,
    "--write-media", "narration.wav"
]
subprocess.run(cmd, check=True)
```

---

## 🔍 Automated Quality Control (QC) Gates

Every video generated through this skill must pass:
1. **Loudness Compliance**: Target $-14\text{ LUFS}$ integrated, $-1\text{ dBTP}$ true peak (broadcast standard).
2. **Visual Dead-Air Check**: Flags any hold $>3.0\text{s}$ where screen motion freezes.
3. **First-Frame Cover Check**: Ensures frame 0 is visually compelling and non-blank (crucial for Shorts/Reels click-through rate).
4. **Subtitle-to-Audio Alignment**: Word-level subtitle timestamps verified against audio wave peaks.
