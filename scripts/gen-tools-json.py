import json
import os

ROOT = os.path.join(os.path.dirname(__file__), "..", "2")
SITE = os.path.join(os.path.dirname(__file__), "..")


def fmt_size(n: int) -> str:
    v = float(n)
    for unit in ("B", "KB", "MB", "GB"):
        if v < 1024 or unit == "GB":
            text = f"{v:.1f} {unit}".replace(".0 ", " ")
            return text
        v /= 1024
    return f"{n} B"


items = []
for dp, _, files in os.walk(ROOT):
    for name in sorted(files):
        path = os.path.join(dp, name)
        rel = os.path.relpath(path, SITE).replace("\\", "/")
        category = os.path.relpath(dp, ROOT)
        items.append(
            {
                "category": None if category == "." else category,
                "name": name,
                "path": rel,
                "size": os.path.getsize(path),
                "sizeText": fmt_size(os.path.getsize(path)),
            }
        )

out = os.path.join(SITE, "tools.json")
with open(out, "w", encoding="utf-8") as fp:
    json.dump(items, fp, ensure_ascii=False, indent=2)

print(f"Wrote {len(items)} items to {out}")
