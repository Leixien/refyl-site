"""Snapshot of station positions for the instant first paint of the home map.

Writes assets/dots.bin: little-endian uint16 pairs (x, y) quantised over the
Italy bounding box below. Prices are never stored here; the page loads them
live from the public stations.json. Re-run when the station registry changes:
    python3 tools/make-dots.py
"""
import json, struct, urllib.request

URL = "https://leixien.github.io/FuelFinder_DATA/stations.json"
LON0, LON1, LAT0, LAT1 = 6.6, 18.6, 35.4, 47.2

data = json.load(urllib.request.urlopen(URL))
out = bytearray()
for s in data["stations"]:
    lon, lat = s.get("lon"), s.get("lat")
    if lon is None or lat is None or not (LON0 <= lon <= LON1 and LAT0 <= lat <= LAT1):
        continue
    out += struct.pack("<HH", round((lon - LON0) / (LON1 - LON0) * 65535), round((lat - LAT0) / (LAT1 - LAT0) * 65535))
open("assets/dots.bin", "wb").write(out)
print(len(out) // 4, "stations,", len(out), "bytes")
