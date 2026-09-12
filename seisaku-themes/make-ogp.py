# -*- coding: utf-8 -*-
"""
OGP画像（SNSにURLを貼ったときに出るカード画像）を生成する。

    python3 make-ogp.py

生成物:
    images/ogp.png          … サイト共通（トップ・一覧用）
    images/ogp/<id>.png     … テーマごと

data.js を読んでテーマ名・分野・色を拾うので、テーマを足したら再実行するだけ。
"""
import json, re, subprocess, os
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
HERE = os.path.dirname(os.path.abspath(__file__))
MINCHO = "/System/Library/Fonts/ヒラギノ明朝 ProN.ttc"
GOTHIC = "/System/Library/Fonts/ヒラギノ角ゴシック W3.ttc"
GOTHIC_B = "/System/Library/Fonts/ヒラギノ角ゴシック W6.ttc"
for p in (MINCHO, GOTHIC, GOTHIC_B):
    if not os.path.exists(p):
        raise SystemExit(f"フォントが見つかりません: {p}")

INK   = (29, 43, 39)
GREEN = (20, 98, 74)
GREEN_D = (13, 68, 51)
MUTED = (113, 129, 123)
BG    = (255, 255, 255)

CAT_TINT = {
  "医療・福祉":"#3b5f9e", "子育て・教育":"#8a4f2d", "産業・雇用":"#2f6f6a",
  "農林水産":"#5c6b2f", "防災・インフラ":"#324b7a", "交通":"#4a6f8a",
  "環境・エネルギー":"#2f6b55", "行財政改革":"#4f4f6b", "地域づくり":"#6b5340",
}

def load_data():
    """data.js を node で読んで JSON にする"""
    js = ("const fs=require('fs'),vm=require('vm');const c={};vm.createContext(c);"
          "vm.runInContext(fs.readFileSync('data.js','utf8')+';this.__={THEMES,SITE,VISION,CATEGORIES};',c);"
          "process.stdout.write(JSON.stringify(c.__));")
    out = subprocess.run(["node","-e",js], cwd=HERE, capture_output=True, text=True, check=True)
    return json.loads(out.stdout)

def hex2rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i+2],16) for i in (0,2,4))

def band(img, y, h):
    """薄緑〜水色のグラデーション帯"""
    d = ImageDraw.Draw(img)
    a, b, c = (207,234,219), (216,238,234), (214,231,246)
    for x in range(W):
        t = x/(W-1)
        if t < .45:
            u = t/.45; s, e = a, b
        else:
            u = (t-.45)/.55; s, e = b, c
        col = tuple(int(s[i]+(e[i]-s[i])*u) for i in range(3))
        d.rectangle([x, y, x+1, y+h], fill=col)

KINSOKU = "。、）」』】〉》・！？"   # 行頭に来てはいけない文字

def wrap(draw, text, font, max_w):
    lines, cur = [], ""
    for ch in text:
        if ch == "\n":
            lines.append(cur); cur = ""; continue
        if draw.textlength(cur+ch, font=font) > max_w and cur:
            if ch in KINSOKU:       # 句読点は前の行にぶら下げる
                lines.append(cur+ch); cur = ""
            else:
                lines.append(cur); cur = ch
        else:
            cur += ch
    if cur: lines.append(cur)
    return lines

def base_image():
    img = Image.new("RGB", (W,H), BG)
    band(img, 0, 10)
    return img

def footer(img, site):
    d = ImageDraw.Draw(img)
    f = ImageFont.truetype(GOTHIC, 22)
    d.text((72, H-74), f"{site['name']}　|　{site['owner']}　和歌山県議会議員", font=f, fill=MUTED)

def theme_image(t, site, path):
    img = base_image()
    d = ImageDraw.Draw(img)
    tint = hex2rgb(t.get("color") or CAT_TINT.get(t["tags"][0], "#14624a"))

    # 左端の分野色の帯
    d.rectangle([0, 10, 14, H], fill=tint)
    # 右下に大きな薄い漢字
    glyph = re.sub(r"[\s・、。「」]", "", t["title"])[:2]
    fg = ImageFont.truetype(MINCHO, 340)
    gw = d.textlength(glyph, font=fg)
    ImageDraw.Draw(img).text((W-gw-40, H-360), glyph, font=fg,
                             fill=tuple(int(c*0.06+255*0.94) for c in tint))

    y = 86
    # 分野タグ
    ft = ImageFont.truetype(GOTHIC_B, 22)
    x = 72
    for tag in t["tags"][:3]:
        tw = d.textlength(tag, font=ft)
        d.rounded_rectangle([x, y, x+tw+34, y+44], radius=22,
                            fill=tuple(int(c*0.10+255*0.90) for c in tint))
        d.text((x+17, y+9), tag, font=ft, fill=tint)
        x += tw + 46
    y += 74

    # サブタイトル
    if t.get("subtitle"):
        fs = ImageFont.truetype(GOTHIC, 26)
        d.text((72, y), t["subtitle"][:40], font=fs, fill=MUTED)
        y += 46

    # タイトル
    size = 74 if len(t["title"]) <= 14 else (60 if len(t["title"]) <= 20 else 50)
    fT = ImageFont.truetype(MINCHO, size)
    for line in wrap(d, t["title"], fT, W-150)[:3]:
        d.text((72, y), line, font=fT, fill=GREEN_D)
        y += int(size*1.32)

    # 概要
    if t.get("summary"):
        y += 12
        fb = ImageFont.truetype(GOTHIC, 25)
        for line in wrap(d, t["summary"], fb, W-160)[:2]:
            d.text((74, y), line, font=fb, fill=INK)
            y += 42

    # ステータス
    if t.get("status"):
        fs2 = ImageFont.truetype(GOTHIC_B, 21)
        sw = d.textlength(t["status"], font=fs2)
        d.rounded_rectangle([W-sw-110, 86, W-72, 86+42], radius=21, fill=GREEN)
        d.text((W-sw-92, 86+9), t["status"], font=fs2, fill=(255,255,255))

    footer(img, site)
    img.save(path, "PNG", optimize=True)

def site_image(site, vision, themes, path):
    img = base_image()
    d = ImageDraw.Draw(img)

    fL = ImageFont.truetype(MINCHO, 92)
    d.text((72, 96), site["name"], font=fL, fill=GREEN_D)
    fE = ImageFont.truetype(GOTHIC, 24)
    d.text((76, 212), site["nameEn"], font=fE, fill=MUTED)

    if vision:
        fv = ImageFont.truetype(MINCHO, 40)
        y = 290
        for line in wrap(d, vision["title"], fv, 700)[:2]:
            d.text((72, y), line, font=fv, fill=GREEN)
            y += 56
        fs = ImageFont.truetype(GOTHIC, 24)
        d.text((74, y+10), f"和歌山県議会議員・{site['owner']}　政策課題 {len(themes)}件", font=fs, fill=MUTED)

    # 右側に分野の島のイメージ（実際の色で）
    cats, seen = [], set()
    for t in themes:
        c = t["tags"][0]
        if c not in seen:
            seen.add(c); cats.append(c)
    x0, y0 = 700, 120
    fc = ImageFont.truetype(GOTHIC_B, 17)
    for i, cat in enumerate(cats[:8]):
        cx = x0 + (i % 2) * 240
        cy = y0 + (i // 2) * 100
        tint = hex2rgb(CAT_TINT.get(cat, "#14624a"))
        d.rounded_rectangle([cx, cy, cx+210, cy+76], radius=16,
                            fill=tuple(int(c*0.10+255*0.90) for c in tint))
        for j in range(3):
            d.rounded_rectangle([cx+14+j*62, cy+30, cx+14+j*62+52, cy+64], radius=8, fill=tint)
        d.text((cx+14, cy+9), cat, font=fc, fill=tint)

    footer(img, site)
    img.save(path, "PNG", optimize=True)

def main():
    data = load_data()
    themes, site, vision = data["THEMES"], data["SITE"], data.get("VISION")
    os.makedirs(os.path.join(HERE,"images","ogp"), exist_ok=True)
    site_image(site, vision, themes, os.path.join(HERE,"images","ogp.png"))
    for t in themes:
        theme_image(t, site, os.path.join(HERE,"images","ogp",f"{t['id']}.png"))
    print(f"✓ OGP画像を生成しました: images/ogp.png ＋ テーマ別 {len(themes)}枚")

if __name__ == "__main__":
    main()
