"""
Pia's Trattoria — Pasta Video Generator
Produces a 30-second social-format (1080x1920) promotional video.

Segments:
  0:00–0:02  Hook card — "made here. every day."
  0:02–0:22  Body — VO text lines with animated visuals
  0:22–0:30  Logo / closing card
"""

from PIL import Image, ImageDraw, ImageFont
import numpy as np
from moviepy import ImageClip, concatenate_videoclips, CompositeVideoClip, AudioFileClip
import os, textwrap

# ── Config ────────────────────────────────────────────────────────────────────
W, H   = 1080, 1920
FPS    = 30
OUT    = "/home/user/First/pias_pasta.mp4"

# Palette
CREAM  = (245, 235, 215)
DARK   = (18,  14,   9)
WARM   = (180, 110,  40)
WHITE  = (255, 255, 255)

# Font paths (system fallbacks)
def find_font(names, size):
    dirs = ["/usr/share/fonts", "/usr/local/share/fonts", os.path.expanduser("~/.fonts")]
    for name in names:
        for d in dirs:
            for root, _, files in os.walk(d):
                for f in files:
                    if name.lower() in f.lower() and f.endswith((".ttf", ".otf")):
                        try:
                            return ImageFont.truetype(os.path.join(root, f), size)
                        except Exception:
                            pass
    return ImageFont.load_default(size=size)

FONT_SERIF_LG  = find_font(["Georgia", "DejaVuSerif", "FreeSerif", "Liberation"], 96)
FONT_SERIF_MD  = find_font(["Georgia", "DejaVuSerif", "FreeSerif", "Liberation"], 64)
FONT_SERIF_SM  = find_font(["Georgia", "DejaVuSerif", "FreeSerif", "Liberation"], 48)
FONT_SANS_SM   = find_font(["DejaVuSans", "LiberationSans", "Arial", "FreeSans"],  40)

# ── Helpers ──────────────────────────────────────────────────────────────────

def blank(color=DARK):
    return Image.new("RGB", (W, H), color)

def draw_text_centered(img, text, font, color, y, line_spacing=1.3, max_width=900):
    draw = ImageDraw.Draw(img)
    lines = textwrap.wrap(text, width=int(max_width / (font.size * 0.55)))
    total_h = 0
    rendered = []
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=font)
        lw, lh = bbox[2]-bbox[0], bbox[3]-bbox[1]
        rendered.append((line, lw, lh))
        total_h += int(lh * line_spacing)
    cy = y - total_h // 2
    for line, lw, lh in rendered:
        x = (W - lw) // 2
        draw.text((x, cy), line, font=font, fill=color)
        cy += int(lh * line_spacing)
    return img

def grain_overlay(img, strength=18):
    arr = np.array(img).astype(np.int16)
    noise = np.random.randint(-strength, strength, arr.shape, dtype=np.int16)
    arr = np.clip(arr + noise, 0, 255).astype(np.uint8)
    return Image.fromarray(arr)

def vignette(img, intensity=0.55):
    arr = np.array(img).astype(np.float32)
    rows, cols = arr.shape[:2]
    cx, cy = cols / 2, rows / 2
    Y, X = np.ogrid[:rows, :cols]
    dist = np.sqrt(((X-cx)/cx)**2 + ((Y-cy)/cy)**2)
    mask = 1 - np.clip(dist * intensity, 0, 1)
    arr *= mask[:, :, np.newaxis]
    return Image.fromarray(arr.astype(np.uint8))

def make_frame(img, apply_grain=True, apply_vignette=True):
    if apply_vignette:
        img = vignette(img)
    if apply_grain:
        img = grain_overlay(img)
    return np.array(img)

def static_clip(img, duration, apply_grain=True, apply_vignette=True):
    """Create a static clip from a PIL image."""
    frames = [make_frame(img, apply_grain, apply_vignette)]
    arr = np.stack(frames * int(duration * FPS + 1))
    # Use make_frame callable
    def frame_fn(t):
        return make_frame(img, apply_grain=False, apply_vignette=False)
    clip = ImageClip(np.array(img), duration=duration)
    return clip

# ── Scene builders ────────────────────────────────────────────────────────────

def scene_hook(duration=2.0):
    """0:00–0:02 — dark, texture, minimal tag line."""
    img = blank(DARK)
    draw = ImageDraw.Draw(img)

    # Subtle flour-mist: radial gradient in warm off-white
    center = (W//2, int(H*0.42))
    for r in range(320, 0, -8):
        alpha = int(28 * (1 - r/320))
        draw.ellipse(
            [center[0]-r, center[1]-r, center[0]+r, center[1]+r],
            fill=(255, 248, 235)
        )

    # Re-draw dark bg so gradient blends
    img2 = blank(DARK)
    img2.paste(img, mask=img.convert("L"))   # rough blend
    img2 = Image.blend(blank(DARK), img, alpha=0.18)

    # Tag line — appears at t≈1.1s, but since static we just show it full
    img2 = draw_text_centered(img2, "made here.", FONT_SERIF_LG, CREAM, H//2 - 40)
    img2 = draw_text_centered(img2, "every day.", FONT_SERIF_LG, WARM,  H//2 + 80)

    img2 = vignette(img2, intensity=0.7)
    return ImageClip(np.array(img2), duration=duration)


def scene_body_card(title_lines, body_text, duration, bg_shade=DARK, accent=WARM):
    """Body text card with VO lines."""
    img = blank(bg_shade)

    # Top rule
    draw = ImageDraw.Draw(img)
    draw.line([(120, 340), (W-120, 340)], fill=accent, width=2)
    draw.line([(120, 346), (W-120, 346)], fill=accent, width=1)

    # Title lines (VO excerpt)
    y = 400
    for line in title_lines:
        img = draw_text_centered(img, line, FONT_SERIF_MD, CREAM, y)
        y += 100

    # Body quote
    if body_text:
        y += 40
        img = draw_text_centered(img, body_text, FONT_SANS_SM, (190,180,160), y, max_width=820)

    # Bottom rule
    draw = ImageDraw.Draw(img)
    draw.line([(120, H-340), (W-120, H-340)], fill=accent, width=1)

    img = vignette(img, intensity=0.6)
    return ImageClip(np.array(img), duration=duration)


def scene_pasta_visual(label, duration, shade=(22, 16, 10)):
    """Simulated pasta visual frame — warm-toned abstract texture card."""
    img = blank(shade)
    draw = ImageDraw.Draw(img)

    # Simulate pasta-sheet "lines" (horizontal warm streaks)
    np.random.seed(hash(label) % 2**31)
    for _ in range(60):
        y = np.random.randint(0, H)
        x0 = np.random.randint(0, W//3)
        x1 = np.random.randint(2*W//3, W)
        alpha = np.random.randint(12, 55)
        r, g, b = 210, int(160 + np.random.randint(-30, 30)), int(80 + np.random.randint(-20, 20))
        draw.line([(x0, y), (x1, y)], fill=(r, g, b, alpha), width=np.random.randint(1, 6))

    # Centre label
    img = draw_text_centered(img, label, FONT_SERIF_SM, (200, 185, 155), H//2)

    img = vignette(img, intensity=0.72)
    return ImageClip(np.array(img), duration=duration)


def scene_close(duration=8.0):
    """0:22–0:30 — logo card."""
    img = blank(DARK)
    draw = ImageDraw.Draw(img)

    # Top ornament
    cx = W // 2
    draw.line([(cx-180, H//2-200), (cx+180, H//2-200)], fill=WARM, width=2)
    draw.ellipse([cx-10, H//2-210, cx+10, H//2-190], outline=WARM, width=2)

    img = draw_text_centered(img, "Pia's Trattoria", FONT_SERIF_LG, CREAM, H//2 - 60)
    img = draw_text_centered(img, "Gulfport, FL",    FONT_SERIF_MD, WARM,  H//2 + 80)

    draw = ImageDraw.Draw(img)
    draw.line([(cx-180, H//2+170), (cx+180, H//2+170)], fill=WARM, width=2)
    draw.ellipse([cx-10, H//2+170, cx+10, H//2+190], outline=WARM, width=2)

    # Caption hint at bottom
    img = draw_text_centered(
        img,
        "Reservations at link in bio.",
        FONT_SANS_SM, (155,145,125),
        H - 280
    )

    img = vignette(img, intensity=0.65)
    return ImageClip(np.array(img), duration=duration)


# ── Assemble ──────────────────────────────────────────────────────────────────

def build():
    clips = []

    # 0:00–0:02  Hook
    clips.append(scene_hook(2.0))

    # 0:02–0:07  VO line 1
    clips.append(scene_body_card(
        ["Most pasta is made", "somewhere else."],
        "Dried. Shipped. Stored.",
        duration=5.0
    ))

    # 0:07–0:10  Pasta sheet visual
    clips.append(scene_pasta_visual("rolling the sheets", duration=3.0))

    # 0:10–0:15  VO line 2
    clips.append(scene_body_card(
        ["At Pia's it starts here —", "in this kitchen,"],
        "before service. the same way it has for twenty years.",
        duration=5.0
    ))

    # 0:15–0:17  Boiling water visual
    clips.append(scene_pasta_visual("water boiling", duration=2.0, shade=(14, 18, 22)))

    # 0:17–0:22  VO line 3 + close on texture
    clips.append(scene_body_card(
        ["Cook to order means", "nothing goes out ahead."],
        "Your plate doesn't exist until you order it.",
        duration=5.0,
        bg_shade=(16, 12, 8)
    ))

    # 0:22–0:30  Logo close
    clips.append(scene_close(8.0))

    final = concatenate_videoclips(clips, method="compose")
    print(f"Total duration: {final.duration:.1f}s  — writing {OUT}")
    final.write_videofile(
        OUT,
        fps=FPS,
        codec="libx264",
        audio=False,
        preset="medium",
        ffmpeg_params=["-crf", "20", "-pix_fmt", "yuv420p"],
        logger="bar"
    )
    print(f"\nDone! Video saved to: {OUT}")


if __name__ == "__main__":
    build()
