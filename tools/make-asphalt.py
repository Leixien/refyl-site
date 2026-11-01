"""Seamless asphalt tile for the page ground: mixed-size light and dark aggregate
chips in a mid-grey binder. Procedural, no external source. Re-run to tweak:
    python3 tools/make-asphalt.py
"""
import numpy as np
from PIL import Image, ImageFilter

S = 384
rng = np.random.default_rng(42)
img = np.full((S, S), 79.0)                      # binder, about #4F5255 overall with the tint below
img += rng.normal(0, 3.2, (S, S))                # fine bitumen grain

def chip(cx, cy, r, v):
    yy, xx = np.ogrid[:S, :S]
    dx = np.minimum(abs(xx - cx), S - abs(xx - cx))  # wrap: seamless tile
    dy = np.minimum(abs(yy - cy), S - abs(yy - cy))
    ang = rng.uniform(0, np.pi)
    ex = (dx * np.cos(ang) + dy * np.sin(ang)) / r
    ey = (-dx * np.sin(ang) + dy * np.cos(ang)) / (r * rng.uniform(0.55, 1))
    m = ex**2 + ey**2 <= 1
    img[m] = img[m] * 0.35 + v * 0.65

for _ in range(9000):
    r = rng.choice([0.6, 0.9, 1.2, 1.6, 2.2], p=[0.34, 0.3, 0.2, 0.12, 0.04])
    v = rng.choice([98, 92, 86, 66, 60], p=[0.16, 0.2, 0.2, 0.24, 0.2]) + rng.normal(0, 4)
    chip(rng.integers(S), rng.integers(S), r, v)

g = Image.fromarray(np.clip(img, 0, 255).astype("uint8")).filter(ImageFilter.GaussianBlur(0.55))
a = np.asarray(g).astype(float)
rgb = np.stack([a * 0.985, a * 1.0, a * 1.025], -1)  # slight cool cast of real asphalt
Image.fromarray(np.clip(rgb, 0, 255).astype("uint8")).save("assets/asphalt.png", optimize=True)
print("mean", rgb.reshape(-1, 3).mean(0).round(1))
