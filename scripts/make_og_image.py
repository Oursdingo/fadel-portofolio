"""Generates images/og-image.png (1200x630) — the link-preview image (WhatsApp, X, Facebook, ...)."""
import pillow_avif  # noqa: F401  (registers AVIF support with Pillow)
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(BASE, "images")

W, H = 1200, 630
BG = (28, 28, 28)
ORANGE = (240, 131, 62)
INK = (46, 30, 14)  # dark ink used on orange, matches --orange-text

FONT_BOLD = "C:/Windows/Fonts/segoeuib.ttf"
FONT_BLACK = "C:/Windows/Fonts/segoeuib.ttf"


def font(path, size):
    return ImageFont.truetype(path, size)


def rounded_mask(size, radius):
    m = Image.new("L", size, 0)
    d = ImageDraw.Draw(m)
    d.rounded_rectangle([0, 0, size[0], size[1]], radius=radius, fill=255)
    return m


def paste_avatar(base, path, box, radius=22, rotate=0, shadow=True):
    im = Image.open(path).convert("RGBA")
    # cover-crop to square-ish box
    tw, th = box
    iw, ih = im.size
    scale = max(tw / iw, th / ih)
    im = im.resize((int(iw * scale), int(ih * scale)))
    left = (im.width - tw) // 2
    top = (im.height - th) // 2
    im = im.crop((left, top, left + tw, top + th))

    mask = rounded_mask((tw, th), radius)
    card = Image.new("RGBA", (tw, th), (0, 0, 0, 0))
    card.paste(im, (0, 0), mask)

    if rotate:
        card = card.rotate(rotate, expand=True, resample=Image.BICUBIC)

    return card


def drop_shadow(size, radius, blur=18, opacity=130):
    pad = blur * 2
    sw, sh = size[0] + pad * 2, size[1] + pad * 2
    s = Image.new("RGBA", (sw, sh), (0, 0, 0, 0))
    d = ImageDraw.Draw(s)
    d.rounded_rectangle(
        [pad, pad, pad + size[0], pad + size[1]], radius=radius, fill=(0, 0, 0, opacity)
    )
    s = s.filter(ImageFilter.GaussianBlur(blur))
    return s, pad


def main():
    bg = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(bg)

    # subtle vignette / radial glow behind the avatar mosaic (right side)
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse([700, -160, 1420, 560], fill=(240, 131, 62, 40))
    glow = glow.filter(ImageFilter.GaussianBlur(90))
    bg = Image.alpha_composite(bg.convert("RGBA"), glow)

    # bottom orange accent band (echoes the site's marquee)
    band_h = 86
    bd = ImageDraw.Draw(bg)
    bd.rectangle([0, H - band_h, W, H], fill=ORANGE)
    band_font = font(FONT_BOLD, 30)
    label = "Fluent in French and English"
    tw = bd.textlength(label, font=band_font)
    x = -80
    while x < W + 400:
        bd.text((x, H - band_h + 22), label, font=band_font, fill=INK)
        x += tw + 70

    # ---------- left: brand block ----------
    pad = 70
    # paw logo
    paw = Image.open(os.path.join(IMG, "cat_patte.png")).convert("RGBA")
    paw = paw.resize((64, 64))
    # make it white-ish to sit on dark bg (it's already dark paw on transparent; tint white)
    solid = Image.new("RGBA", paw.size, (255, 255, 255, 255))
    paw_white = Image.composite(solid, Image.new("RGBA", paw.size, (0, 0, 0, 0)), paw.split()[3])
    bg.paste(paw_white, (pad, 66), paw_white)

    title_font = font(FONT_BLACK, 66)
    sub_font = font(FONT_BOLD, 40)
    tag_font = font(FONT_BOLD, 30)

    d = ImageDraw.Draw(bg)
    d.text((pad, 150), "Fadel Edits.", font=title_font, fill=(255, 255, 255))
    d.text((pad, 236), "Editing for creators", font=sub_font, fill=(255, 255, 255))
    d.text((pad, 288), "Fluent in French & English", font=tag_font, fill=ORANGE)

    btn_font = font(FONT_BOLD, 26)
    bx, by, bw, bh = pad, 356, 250, 62
    d.rounded_rectangle([bx, by, bx + bw, by + bh], radius=14, fill=ORANGE)
    d.text((bx + 26, by + 17), "Contact now  \u2192", font=btn_font, fill=(255, 255, 255))

    # ---------- right: creator avatar mosaic ----------
    avatars = [
        (os.path.join(IMG, "QjlDbh3JXAcjIqDcCwGqXiLJhRA.avif"), -5),
        (os.path.join(IMG, "channels4_profile.jpg"), 4),
        (os.path.join(IMG, "aHl6uuihbGDIpJiBvQ8n2uqQI.avif"), -4),
        (os.path.join(IMG, "beone.jpg"), 5),
        (os.path.join(IMG, "jinksow.jpg"), -3),
        (os.path.join(IMG, "XQv4riaYTbHruU0xJcieAcf08.avif"), 6),
    ]
    size = 168
    gap = 22
    cols = 3
    grid_w = cols * size + (cols - 1) * gap
    start_x = W - 70 - grid_w
    start_y = 96

    for i, (path, rot) in enumerate(avatars):
        col = i % cols
        row = i // cols
        x = start_x + col * (size + gap)
        y = start_y + row * (size + gap)

        shadow, shpad = drop_shadow((size, size), 26, blur=16, opacity=110)
        bg.alpha_composite(shadow, (x - shpad, y - shpad + 8))

        card = paste_avatar(bg, path, (size, size), radius=26, rotate=rot)
        cx = x - (card.width - size) // 2
        cy = y - (card.height - size) // 2
        bg.alpha_composite(card, (cx, cy))

    out = bg.convert("RGB")
    # JPEG, not PNG: WhatsApp silently drops og:image previews over ~300KB,
    # and this scene (photos + flat colors) compresses far better as JPEG.
    out_path = os.path.join(IMG, "og-image.jpg")
    out.save(out_path, quality=85, optimize=True)
    print("saved", out_path, out.size, f"{os.path.getsize(out_path)} bytes")


if __name__ == "__main__":
    main()
