# -*- coding: utf-8 -*-
"""和歌山県(コード65)の2024年交通事故を抽出し、インタラクティブ地図HTMLを生成する。"""
import csv, json, io, openpyxl, os

SRC = os.path.expanduser('~/Downloads')
YEARS = [2019, 2020, 2021, 2022, 2023, 2024]
CODEBOOK = os.path.join(SRC, 'codebook_2024.xlsx')
OUT_DIR = '/Users/iwanaga/claude code用/交通事故マップ'
os.makedirs(OUT_DIR, exist_ok=True)

PREF = '65'  # 和歌山県

# 2022年に様式改定(58→68列)。旧様式の列位置を新様式に揃える写像 {新idx:旧idx}
NEW_FROM_OLD = {1:1,2:2,3:3,4:4,5:5,6:6,9:10,10:11,11:12,12:13,13:14,14:15,
 15:16,20:17,21:18,22:19,23:20,24:22,25:23,27:25,29:27,30:28,31:29,32:30,
 33:31,34:32,35:33,36:34,37:35,38:36,39:37,40:38,41:39,42:40,43:41,48:42,
 49:43,52:46,53:47,54:48,55:49,58:52,59:53,60:54,61:55,62:56,63:57}
def normalize(r):
    if len(r) >= 68:
        return r
    new = [''] * 68
    for ni, oi in NEW_FROM_OLD.items():
        if oi < len(r):
            new[ni] = r[oi]
    return new

# --- コードブックから コード->ラベル 辞書を作る -------------------------------
wb = openpyxl.load_workbook(CODEBOOK, read_only=True, data_only=True)
def sheet_map(name):
    d = {}
    started = False
    for row in wb[name].iter_rows(values_only=True):
        code, label = row[1], row[2]
        if code == 'コード':
            started = True; continue
        if not started: continue
        if code is None: continue
        d[str(code).strip()] = str(label).replace('\n', '') if label else ''
    return d

M_NAIYOU  = sheet_map('事故内容')
M_CHUYA   = sheet_map('昼夜')
M_TENKO   = sheet_map('天候')
M_KEIJYO  = sheet_map('道路形状')
M_RUIKEI  = sheet_map('事故類型（本票）')
M_SHUBETU = sheet_map('当事者種別')
M_YOUBI   = sheet_map('曜日')

# 和歌山県の市区町村（標準地域コード下3桁）
M_CITY = {
 '201':'和歌山市','202':'海南市','203':'橋本市','204':'有田市','205':'御坊市',
 '206':'田辺市','207':'新宮市','208':'紀の川市','209':'岩出市','304':'紀美野町',
 '341':'かつらぎ町','343':'九度山町','344':'高野町','361':'湯浅町','362':'広川町',
 '366':'有田川町','381':'美浜町','382':'日高町','383':'由良町','390':'印南町',
 '391':'みなべ町','392':'日高川町','401':'白浜町','404':'上富田町','406':'すさみ町',
 '421':'那智勝浦町','422':'太地町','424':'古座川町','427':'北山村','428':'串本町',
}

def dms_to_deg(s, deg_digits):
    """度分秒文字列(度+分2+秒2+小数3)を10進度に変換"""
    s = s.strip()
    if not s or s == '0' * len(s) or not s.isdigit():
        return None
    # 末尾7桁が 分2+秒2+小数3、その前が度
    deg = int(s[:-7]); mm = int(s[-7:-5]); ss = int(s[-5:-3]); frac = int(s[-3:])
    sec = ss + frac / 1000.0
    return round(deg + mm/60.0 + sec/3600.0, 7)

def look(d, v):
    return d.get(str(v).strip(), v)

records = []
for year in YEARS:
    path = os.path.join(SRC, f'honhyo_{year}.csv')
    n = 0
    with open(path, encoding='shift_jis', errors='replace') as f:
        reader = csv.reader(f)
        next(reader)
        for r in reader:
            if r[1] != PREF:
                continue
            r = normalize(r)
            lat = dms_to_deg(r[60], 2)
            lon = dms_to_deg(r[61], 3)
            if lat is None or lon is None:
                continue
            # 和歌山県の妥当範囲チェック
            if not (33.3 <= lat <= 34.4 and 134.9 <= lon <= 136.1):
                continue
            rec = {
                'year': year,
                'lat': lat, 'lon': lon,
                'fatal': r[4].strip() == '1',
                'naiyou': look(M_NAIYOU, r[4]),
                'dead': int(r[5]), 'injured': int(r[6]),
                'city': M_CITY.get(r[9].strip(), '市区町村' + r[9]),
                'dt': f"{r[10]}/{int(r[11]):02d}/{int(r[12]):02d} {int(r[13]):02d}:{int(r[14]):02d}",
                'youbi': look(M_YOUBI, r[62]),
                'chuya': look(M_CHUYA, r[15]),
                'tenko': look(M_TENKO, r[20]),
                'keijyo': look(M_KEIJYO, r[23]),
                'ruikei': look(M_RUIKEI, r[35]),
                'pa': look(M_SHUBETU, r[38]),
                'pb': look(M_SHUBETU, r[39]),
            }
            records.append(rec)
            n += 1
    print(f"  {year}年: {n}件")

print(f"抽出件数(合計): {len(records)}")
fatal_n = sum(1 for x in records if x['fatal'])
print(f"うち死亡事故: {fatal_n} / 負傷事故: {len(records)-fatal_n}")
# 市区町村別件数
from collections import Counter
c = Counter(x['city'] for x in records)
print("市区町村別 上位:", c.most_common(8))

# データJSONを書き出し（地図に埋め込む）
with open(os.path.join(OUT_DIR, 'data.js'), 'w', encoding='utf-8') as f:
    f.write('window.ACCIDENTS = ' + json.dumps(records, ensure_ascii=False) + ';')
print("data.js 出力完了")
