"""Build 8 promo slides for Larust narration."""
import os
from PIL import Image, ImageDraw, ImageFont

W, H = 1920, 1080
OUT_DIR = "/sessions/sweet-quirky-pascal/mnt/larust/video/slides"
os.makedirs(OUT_DIR, exist_ok=True)

# Tailwind-aligned palette
BG = (248, 250, 252)       # slate-50
SURFACE = (255, 255, 255)
INK = (15, 23, 42)         # slate-900
MUTED = (71, 85, 105)      # slate-600
SUBTLE = (148, 163, 184)   # slate-400
PRIMARY = (37, 99, 235)    # blue-600
BLUE_BG = (239, 246, 255)  # blue-50
BLUE_BORDER = (191, 219, 254)  # blue-200
BORDER = (226, 232, 240)   # slate-200

def font(size, bold=False):
    paths = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    ]
    for p in paths:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()

def wrap(draw, text, fnt, max_w):
    words = text.split()
    lines, line = [], ""
    for w in words:
        trial = (line + " " + w).strip()
        if draw.textlength(trial, font=fnt) <= max_w:
            line = trial
        else:
            if line:
                lines.append(line)
            line = w
    if line:
        lines.append(line)
    return lines

def make_slide(index, eyebrow, headline, sub, accent_chips=None):
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)

    # Top wordmark bar
    bar_y = 80
    d.text((140, bar_y), "Larust", fill=PRIMARY, font=font(44, bold=True))
    # subtle index
    d.text((W - 240, bar_y + 8), f"{index:02d} / 08", fill=SUBTLE, font=font(28))

    # Eyebrow badge
    eb_pad_x, eb_pad_y = 24, 14
    eb_fnt = font(28)
    eb_w = d.textlength(eyebrow, font=eb_fnt)
    eb_x, eb_y = 140, 260
    d.rounded_rectangle(
        [eb_x, eb_y, eb_x + eb_w + eb_pad_x * 2, eb_y + 60],
        radius=30,
        fill=BLUE_BG,
        outline=BLUE_BORDER,
        width=2,
    )
    d.text((eb_x + eb_pad_x, eb_y + eb_pad_y), eyebrow, fill=PRIMARY, font=eb_fnt)

    # Headline
    hl_fnt = font(96, bold=True)
    hl_lines = wrap(d, headline, hl_fnt, W - 280)
    y = 380
    for ln in hl_lines:
        d.text((140, y), ln, fill=INK, font=hl_fnt)
        y += 116

    # Sub
    sub_fnt = font(44)
    sub_lines = wrap(d, sub, sub_fnt, W - 280)
    y += 30
    for ln in sub_lines:
        d.text((140, y), ln, fill=MUTED, font=sub_fnt)
        y += 60

    # Accent chips
    if accent_chips:
        cy = H - 200
        cx = 140
        chip_fnt = font(28, bold=True)
        for chip in accent_chips:
            cw = d.textlength(chip, font=chip_fnt) + 48
            d.rounded_rectangle([cx, cy, cx + cw, cy + 56], radius=12, fill=SURFACE, outline=BORDER, width=2)
            d.text((cx + 24, cy + 12), chip, fill=INK, font=chip_fnt)
            cx += cw + 16

    # Bottom strip
    d.rectangle([0, H - 6, W, H], fill=PRIMARY)

    path = os.path.join(OUT_DIR, f"slide_{index:02d}.png")
    img.save(path)
    return path

slides = [
    ("Hook", "Most feedback tools collect text.", "Larust collects evidence.", None),
    ("Walrus Sessions 2026", "Built for the hackathon.", "A feedback platform anchored on Walrus, protected by Seal.", ["Walrus", "Seal", "Sui"]),
    ("The problem", "Feedback gets lost.", "Scattered across email, chat, and screenshots. Nothing canonical.", None),
    ("Public intake", "No wallet required.", "Rich text, dropdowns, checkboxes, ratings, screenshots, video, URLs.",
     ["Rich text", "Dropdown", "Checkbox", "Rating", "Image", "Video", "URL"]),
    ("Canonical evidence", "Walrus-native storage.", "Every submission and asset becomes a durable blob reference.", ["blob ID", "verifiable", "retrievable"]),
    ("Confidentiality", "Seal-protected secrets.", "Sensitive fields are encrypted before the canonical write.", ["client-side", "owner-gated"]),
    ("Operations", "Owner-gated dashboard.", "Sui wallet sessions unlock triage, notes, priority, and exports.", ["Filter", "Notes", "Priority", "Export"]),
    ("Larust", "Feedback that lasts. Evidence that proves.", "Walletless intake. Walrus evidence. Seal secrets. Owner control.", None),
]

for i, (eyebrow, headline, sub, chips) in enumerate(slides, start=1):
    p = make_slide(i, eyebrow, headline, sub, chips)
    print(f"wrote {p}")

print("done")
