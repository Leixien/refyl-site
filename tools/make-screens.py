"""Clean app screens for the site: crops the phone screen out of the App Store frames
(FuelFinder_IOS/docs/release/screenshots/{it,en}/*.png, made by frame.py: raw 1320x2868 placed
at x=110, y=540, width 1100, bottom bleeding off). Output: assets/screens/{lang}/{stem}.webp.
    python3 tools/make-screens.py ../FuelFinder_IOS/docs/release/screenshots
"""
import pathlib, sys
from PIL import Image

SRC = pathlib.Path(sys.argv[1])
for lang in ("it", "en"):
    for png in sorted((SRC / lang).glob("*.png")):
        im = Image.open(png).convert("RGB").crop((110, 540, 1210, 2868))  # 1100 x 2328, top corners rounded by the frame
        im = im.resize((640, round(640 * im.height / im.width)), Image.LANCZOS)
        out = pathlib.Path("assets/screens") / lang / f"{png.stem}.webp"
        im.save(out, "WEBP", quality=84, method=6)
        print(out, im.size)
