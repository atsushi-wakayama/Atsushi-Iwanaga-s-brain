# -*- coding: utf-8 -*-
"""
サイト紹介用のモックアップ画像を作る。

    node build.js && python3 -m http.server 4321 --directory dist &   # 先にローカル配信
    python3 make-mockup.py

生成物（mockup/ フォルダ）:
    pc.png        … PC画面（ブラウザ枠つき）
    overview.png  … 鳥瞰ビュー（ブラウザ枠つき）
    sp.png        … スマホ画面（端末枠つき）
    sheet.png     … 紹介用の1枚もの（PC＋スマホ＋説明）
"""
import os, subprocess, json
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
OUT  = os.path.join(HERE, "mockup")
TMP  = os.path.join(OUT, ".shots")
URL  = os.environ.get("MOCKUP_URL", "http://localhost:4321")
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

MINCHO   = "/System/Library/Fonts/ヒラギノ明朝 ProN.ttc"
GOTHIC   = "/System/Library/Fonts/ヒラギノ角ゴシック W3.ttc"
GOTHIC_B = "/System/Library/Fonts/ヒラギノ角ゴシック W6.ttc"

INK, GREEN, GREEN_D, MUTED = (29,43,39), (20,98,74), (13,68,51), (113,129,123)
PAPER = (248, 250, 249)

SHOTS = [
    ("pc",       "1440,900", "/"),
    ("overview", "1440,900", "/?view=all"),
    ("detail",   "1440,900", "/t/ume-fusaku-shien"),
    ("sp",       "390,844",  "/"),
]

def capture():
    os.makedirs(TMP, exist_ok=True)
    for name, size, path in SHOTS:
        subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars",
                        "--force-device-scale-factor=2", f"--window-size={size}",
                        "--virtual-time-budget=6000",
                        f"--screenshot={os.path.join(TMP,name)}.png", URL+path],
                       capture_output=True)
        if not os.path.exists(os.path.join(TMP, name+".png")):
            raise SystemExit(f"✗ {name} のスクリーンショットに失敗しました（{URL} は動いていますか？）")
    print("✓ 画面を撮影しました")

def shadow(img, box, radius, blur=26, alpha=58, offset=(0,14)):
    """角丸の影を敷く"""
    sh = Image.new("RGBA", img.size, (0,0,0,0))
    d = ImageDraw.Draw(sh)
    x0,y0,x1,y1 = box
    d.rounded_rectangle([x0+offset[0], y0+offset[1], x1+offset[0], y1+offset[1]],
                        radius=radius, fill=(15,60,46,alpha))
    img.alpha_composite(sh.filter(ImageFilter.GaussianBlur(blur)))

def round_crop(im, radius):
    m = Image.new("L", im.size, 0)
    ImageDraw.Draw(m).rounded_rectangle([0,0,im.size[0],im.size[1]], radius=radius, fill=255)
    out = im.convert("RGBA"); out.putalpha(m); return out

def browser_frame(shot, width=1600, title="seisaku-themes.vercel.app"):
    """ブラウザ風の枠に画面をはめる"""
    bar = 46
    im = Image.open(shot).convert("RGB")
    h = round(im.size[1] * width / im.size[0])
    im = im.resize((width, h), Image.LANCZOS)
    pad = 60
    W, H = width + pad*2, h + bar + pad*2
    card = Image.new("RGBA", (W, H), PAPER + (255,))
    shadow(card, (pad, pad, pad+width, pad+bar+h), 18)
    body = Image.new("RGB", (width, bar+h), (255,255,255))
    body.paste(im, (0, bar))
    d = ImageDraw.Draw(body)
    d.rectangle([0,0,width,bar], fill=(242,245,243))
    d.line([0,bar,width,bar], fill=(226,232,229))
    for i,c in enumerate([(255,95,86),(255,189,46),(39,201,63)]):
        d.ellipse([22+i*22, bar//2-6, 34+i*22, bar//2+6], fill=c)
    f = ImageFont.truetype(GOTHIC, 18)
    tw = d.textlength(title, font=f)
    d.rounded_rectangle([width/2-tw/2-26, 10, width/2+tw/2+26, bar-10], radius=13, fill=(255,255,255))
    d.text((width/2-tw/2, 13), title, font=f, fill=MUTED)
    card.alpha_composite(round_crop(body, 18), (pad, pad))
    return card

def phone_frame(shot, width=430):
    im = Image.open(shot).convert("RGB")
    h = round(im.size[1] * width / im.size[0])
    im = im.resize((width, h), Image.LANCZOS)
    bez, pad = 12, 50
    W, H = width + bez*2 + pad*2, h + bez*2 + pad*2
    card = Image.new("RGBA", (W,H), PAPER+(255,))
    shadow(card, (pad, pad, W-pad, H-pad), 46)
    body = Image.new("RGB", (width+bez*2, h+bez*2), (26,30,28))
    body.paste(im, (bez, bez))
    body = round_crop(body, 46)
    card.alpha_composite(body, (pad, pad))
    return card

def wrap_text(draw, text, font, max_w):
    lines, cur = [], ""
    for ch in text:
        if draw.textlength(cur+ch, font=font) > max_w and cur:
            if ch in "。、）」・":
                lines.append(cur+ch); cur = ""
            else:
                lines.append(cur); cur = ch
        else:
            cur += ch
    if cur: lines.append(cur)
    return lines

def sheet(site, themes):
    W, H = 2000, 1360
    img = Image.new("RGBA", (W,H), PAPER+(255,))
    d = ImageDraw.Draw(img)
    # 上部のグラデーション帯
    a, c = (207,234,219), (214,231,246)
    for x in range(W):
        t = x/(W-1)
        d.rectangle([x,0,x+1,9], fill=tuple(int(a[i]+(c[i]-a[i])*t) for i in range(3)))

    d.text((90, 74), site["name"], font=ImageFont.truetype(MINCHO, 72), fill=GREEN_D)
    d.text((94, 176), f"{site['nameEn']}　/　和歌山県議会議員・{site['owner']}",
           font=ImageFont.truetype(GOTHIC, 26), fill=MUTED)

    pc = browser_frame(os.path.join(TMP,"pc.png"), width=1120)
    img.alpha_composite(pc, (56, 232))
    sp = phone_frame(os.path.join(TMP,"sp.png"), width=290)
    img.alpha_composite(sp, (W-sp.size[0]-80, 296))

    fb  = ImageFont.truetype(GOTHIC_B, 27)
    fs  = ImageFont.truetype(GOTHIC, 21)
    items = [
        ("分野ごとの島に並ぶ", f"{len(themes)}件の政策課題を8分野に振り分け。位置と色で分野が分かる"),
        ("カードを押すと詳しく", "1回目で概要、2回目で課題の現状・考え・これまでの動き"),
        ("引くと全体を見渡せる", "ピンチで鳥瞰ビュー。どこまで見たかも記録される"),
    ]
    y = H - 250
    for i,(t,s) in enumerate(items):
        x = 116 + i*620
        d.rounded_rectangle([x-26, y-30, x+540, y+128], radius=20, fill=(233,243,239))
        d.text((x, y-8), t, font=fb, fill=GREEN_D)
        yy = y + 44
        for line in wrap_text(d, s, fs, 520)[:2]:
            d.text((x, yy), line, font=fs, fill=INK)
            yy += 34
    d.text((116, H-72), "seisaku-themes.vercel.app", font=ImageFont.truetype(GOTHIC, 24), fill=GREEN)
    return img

def main():
    js = ("const fs=require('fs'),vm=require('vm');const c={};vm.createContext(c);"
          "vm.runInContext(fs.readFileSync('data.js','utf8')+';this.__={THEMES,SITE};',c);"
          "process.stdout.write(JSON.stringify(c.__));")
    data = json.loads(subprocess.run(["node","-e",js], cwd=HERE, capture_output=True, text=True, check=True).stdout)
    os.makedirs(OUT, exist_ok=True)
    capture()
    browser_frame(os.path.join(TMP,"pc.png")).convert("RGB").save(os.path.join(OUT,"pc.png"))
    browser_frame(os.path.join(TMP,"overview.png")).convert("RGB").save(os.path.join(OUT,"overview.png"))
    browser_frame(os.path.join(TMP,"detail.png")).convert("RGB").save(os.path.join(OUT,"detail.png"))
    phone_frame(os.path.join(TMP,"sp.png")).convert("RGB").save(os.path.join(OUT,"sp.png"))
    sheet(data["SITE"], data["THEMES"]).convert("RGB").save(os.path.join(OUT,"sheet.png"))
    print("✓ mockup/ に pc.png / overview.png / detail.png / sp.png / sheet.png を作りました")

if __name__ == "__main__":
    main()
