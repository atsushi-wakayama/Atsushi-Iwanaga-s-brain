# -*- coding: utf-8 -*-
"""和歌山県(コード65)の2024年交通事故を、コードを名称に変換した表(xlsx/csv)として出力する。"""
import csv, os, openpyxl
from openpyxl import Workbook

SRC = os.path.expanduser('~/Downloads')
YEARS = [2019, 2020, 2021, 2022, 2023, 2024]
CODEBOOK = os.path.join(SRC, 'codebook_2024.xlsx')
OUT_DIR = '/Users/iwanaga/claude code用/交通事故マップ'
PREF = '65'  # 和歌山県

# 2022年に様式改定（58→68列）。旧様式(58列)の列位置を新様式(68列)に揃える写像。
# {新indexの0始まり: 旧indexの0始まり}
NEW_FROM_OLD = {1:1,2:2,3:3,4:4,5:5,6:6,9:10,10:11,11:12,12:13,13:14,14:15,
 15:16,20:17,21:18,22:19,23:20,24:22,25:23,27:25,29:27,30:28,31:29,32:30,
 33:31,34:32,35:33,36:34,37:35,38:36,39:37,40:38,41:39,42:40,43:41,48:42,
 49:43,52:46,53:47,54:48,55:49,58:52,59:53,60:54,61:55,62:56,63:57}

def normalize(r):
    """旧様式(58列)の行を新様式(68列)の列位置に変換。新様式はそのまま。"""
    if len(r) >= 68:
        return r
    new = [''] * 68
    for ni, oi in NEW_FROM_OLD.items():
        if oi < len(r):
            new[ni] = r[oi]
    return new

wb = openpyxl.load_workbook(CODEBOOK, read_only=True, data_only=True)
def sheet_map(name):
    d, started = {}, False
    for row in wb[name].iter_rows(values_only=True):
        code, label = row[1], row[2]
        if code == 'コード':
            started = True; continue
        if not started or code is None or label is None:
            continue
        d[str(code).strip()] = str(label).replace('\n', '')
    return d

# 和歌山県の市区町村（標準地域コード下3桁 → 名称）
M_CITY = {
 '201':'和歌山市','202':'海南市','203':'橋本市','204':'有田市','205':'御坊市',
 '206':'田辺市','207':'新宮市','208':'紀の川市','209':'岩出市','304':'紀美野町',
 '341':'かつらぎ町','343':'九度山町','344':'高野町','361':'湯浅町','362':'広川町',
 '366':'有田川町','381':'美浜町','382':'日高町','383':'由良町','390':'印南町',
 '391':'みなべ町','392':'日高川町','401':'白浜町','404':'上富田町','406':'すさみ町',
 '421':'那智勝浦町','422':'太地町','424':'古座川町','427':'北山村','428':'串本町',
}
M_PREF = sheet_map('都道府県')

# 出力する列： (出力見出し, 元CSV列index0始まり, デコード用シート名 or 特殊キー or None=生値)
COLS = [
 ('対象年', None, 'YEAR'),
 ('都道府県', 1, 'PREF'),
 ('市区町村', 9, 'CITY'),
 ('警察署等コード', 2, None),
 ('本票番号', 3, None),
 ('事故内容', 4, '事故内容'),
 ('死者数', 5, 'INT'),
 ('負傷者数', 6, 'INT'),
 ('発生日時', None, 'DATETIME'),
 ('発生年', 10, 'INT'), ('発生月', 11, 'INT'), ('発生日', 12, 'INT'),
 ('発生時', 13, 'INT'), ('発生分', 14, 'INT'),
 ('曜日', 62, '曜日'),
 ('祝日', 63, '祝日'),
 ('昼夜', 15, '昼夜'),
 ('天候', 20, '天候'),
 ('地形', 21, '地形'),
 ('路面状態', 22, '路面状態'),
 ('道路形状', 23, '道路形状'),
 ('信号機', 24, '信号機'),
 ('車道幅員', 29, '車道幅員'),
 ('道路線形', 30, '道路線形'),
 ('衝突地点', 31, '衝突地点'),
 ('ゾーン規制', 32, 'ゾーン規制'),
 ('中央分離帯施設等', 33, '中央分離帯施設等'),
 ('歩車道区分', 34, '歩車道区分'),
 ('事故類型', 35, '事故類型（本票）'),
 ('当事者A 種別', 38, '当事者種別'),
 ('当事者B 種別', 39, '当事者種別'),
 ('当事者A 用途', 40, '用途'),
 ('当事者B 用途', 41, '用途'),
 ('当事者A 車両形状', 42, '車両形状'),
 ('当事者B 車両形状', 43, '車両形状'),
 ('当事者A 年齢', 36, '年齢'),
 ('当事者B 年齢', 37, '年齢'),
 ('当事者A 人身損傷程度', 58, '人身損傷程度'),
 ('当事者B 人身損傷程度', 59, '人身損傷程度'),
 ('当事者A 一時停止規制標識', 25, '一時停止規制 標識'),
 ('当事者B 一時停止規制標識', 27, '一時停止規制 標識'),
 ('当事者A 速度規制', 48, '速度規制（指定のみ）'),
 ('当事者B 速度規制', 49, '速度規制（指定のみ）'),
 ('当事者A 車両損壊程度', 52, '車両の損壊程度'),
 ('当事者B 車両損壊程度', 53, '車両の損壊程度'),
 ('当事者A エアバッグ', 54, 'エアバッグの装備'),
 ('当事者B エアバッグ', 55, 'エアバッグの装備'),
 ('緯度', 60, 'LAT'),
 ('経度', 61, 'LON'),
]

# シート辞書を事前ロード
SHEETS = {}
for _, _, key in COLS:
    if key and key not in ('YEAR','PREF','CITY','INT','DATETIME','LAT','LON') and key not in SHEETS:
        SHEETS[key] = sheet_map(key)

# 旧様式(〜2021)の車道幅員は交差点を3×3(小/中/大×小/中/大)で細分。
# 2024コードブックに無い 12/13/16 を歴史的定義で補完。
SHEETS['車道幅員'].update({
    '12':'交差点－小（5.5m未満）－中', '13':'交差点－小（5.5m未満）－大',
    '16':'交差点－中（5.5m以上）－大',
})

def dms_to_deg(s):
    s = s.strip()
    if not s or not s.isdigit() or s == '0'*len(s):
        return None
    deg = int(s[:-7]); mm = int(s[-7:-5]); ss = int(s[-5:-3]); frac = int(s[-3:])
    return round(deg + mm/60.0 + (ss+frac/1000.0)/3600.0, 7)

def decode(val, key, row, year):
    v = (val or '').strip()
    if key == 'YEAR':
        return year
    if key == 'PREF':
        return M_PREF.get(v, v)
    if key == 'CITY':
        return M_CITY.get(v, v)
    if key == 'INT':
        try: return int(v)
        except: return v
    if key == 'DATETIME':
        return f"{row[10]}/{int(row[11]):02d}/{int(row[12]):02d} {int(row[13]):02d}:{int(row[14]):02d}"
    if key == 'LAT':
        return dms_to_deg(row[60])
    if key == 'LON':
        return dms_to_deg(row[61])
    if key is None:
        return v
    d = SHEETS[key]
    if v in d: return d[v]
    # 候補: 0除去 / 2桁ゼロ埋め / int経由
    for cand in (v.lstrip('0') or '0', v.zfill(2)):
        if cand in d: return d[cand]
    try:
        iv = str(int(v))
        if iv in d: return d[iv]
    except: pass
    return v  # 不明はコードのまま

# CSV読み込み・抽出（複数年）
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
            records.append([decode(r[idx] if idx is not None else None, key, r, year)
                            for _, idx, key in COLS])
            n += 1
    print(f"  {year}年ファイル: {n}件")

headers = [c[0] for c in COLS]
print(f"抽出件数(合計): {len(records)}")

# xlsx 出力
out_wb = Workbook(); ws = out_wb.active; ws.title = '和歌山県2024'
ws.append(headers)
for rec in records:
    ws.append(rec)
ws.freeze_panes = 'A2'
for i, h in enumerate(headers, 1):
    w = max(len(str(h))*2, 10)
    ws.column_dimensions[openpyxl.utils.get_column_letter(i)].width = min(w, 28)
tag = f"{YEARS[0]}-{YEARS[-1]}"
xlsx_path = os.path.join(OUT_DIR, f'和歌山県_交通事故_{tag}.xlsx')
out_wb.save(xlsx_path)
print("xlsx:", xlsx_path)

# csv 出力 (Excelで文字化けしないBOM付きUTF-8)
csv_path = os.path.join(OUT_DIR, f'和歌山県_交通事故_{tag}.csv')
with open(csv_path, 'w', encoding='utf-8-sig', newline='') as f:
    w = csv.writer(f); w.writerow(headers); w.writerows(records)
print("csv :", csv_path)
