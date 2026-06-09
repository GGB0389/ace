# -*- coding: utf-8 -*-
from PIL import Image, ImageDraw, ImageFont, ImageFilter

path = r"E:\共享文件\.1.网站\assets\ACE游戏管家-宣传图-炫版.png"
im = Image.open(path).convert("RGBA")
w, h = im.size
layer = im.copy()

# 更大区域去掉版本号及残留
cover = Image.new("RGBA", (w, h), (0, 0, 0, 0))
cd = ImageDraw.Draw(cover)
y1, y2 = int(h * 0.168), int(h * 0.235)
cd.rectangle([int(w * 0.32), y1, int(w * 0.68), y2], fill=(6, 12, 28, 255))
# 渐变融合上下边缘
for i in range(12):
    a = int(180 * (1 - i / 12))
    cd.rectangle([int(w * 0.30), y1 - i, int(w * 0.70), y1 - i], fill=(6, 12, 28, a))
    cd.rectangle([int(w * 0.30), y2 + i, int(w * 0.70), y2 + i], fill=(6, 12, 28, a))
cover = cover.filter(ImageFilter.GaussianBlur(6))
layer = Image.alpha_composite(layer, cover)

# 底部横幅
banner_h = int(h * 0.09)
by = h - banner_h - int(h * 0.018)
mask = Image.new("RGBA", (w, h), (0, 0, 0, 0))
md = ImageDraw.Draw(mask)
md.rectangle([0, by - 8, w, h], fill=(6, 13, 31, 255))
layer = Image.alpha_composite(layer, mask)

banner = Image.new("RGBA", (w, banner_h + 16), (0, 0, 0, 0))
bd = ImageDraw.Draw(banner)
bd.rounded_rectangle([36, 6, w - 36, banner_h], radius=16, fill=(12, 26, 58, 230), outline=(94, 231, 255, 130), width=2)
font_b = ImageFont.truetype(r"C:\Windows\Fonts\msyhbd.ttc", 32)
font_r = ImageFont.truetype(r"C:\Windows\Fonts\msyh.ttc", 32)
part1 = "APK内核 + 存号备份 + 内置终端 · "
part2 = "自动检测更新"
tw1 = bd.textlength(part1, font=font_r)
tw2 = bd.textlength(part2, font=font_b)
tx = (w - tw1 - tw2) / 2
ty = banner_h // 2 - 12
bd.text((tx, ty), part1, font=font_r, fill=(220, 235, 255, 255))
bd.text((tx + tw1, ty), part2, font=font_b, fill=(94, 231, 255, 255))
layer.paste(banner, (0, by), banner)

# 左下 chip
chip_mask = Image.new("RGBA", (w, h), (0, 0, 0, 0))
chd = ImageDraw.Draw(chip_mask)
rx1, ry1, rx2, ry2 = int(w * 0.048), int(h * 0.775), int(w * 0.295), int(h * 0.848)
chd.rounded_rectangle([rx1, ry1, rx2, ry2], radius=10, fill=(6, 12, 28, 255))
chip_mask = chip_mask.filter(ImageFilter.GaussianBlur(2))
layer = Image.alpha_composite(layer, chip_mask)
fd = ImageDraw.Draw(layer)
ff = ImageFont.truetype(r"C:\Windows\Fonts\msyh.ttc", 20)
fd.rounded_rectangle([rx1, ry1, rx2, ry2], radius=10, fill=(18, 36, 72, 200), outline=(80, 180, 255, 100), width=1)
fd.text((rx1 + 10, ry1 + 8), "内核APP自动检测更新", font=ff, fill=(225, 238, 255, 255))

layer.convert("RGB").save(path, "PNG", optimize=True)
print("OK")
