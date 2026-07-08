# -*- coding: utf-8 -*-
"""警察提供「令和7年 物件事故」データ(Shift-JIS)を、日本測地系→世界測地系(WGS84)へ
pyproj(EPSG:4301→EPSG:4326)で正確に座標変換し、地図用 property_2025.js を生成する。
（旧版は近似式＋道路スナップだったが、pyproj変換が正確なため0ベースで作り直し。）"""
import csv, json, os
from pyproj import Transformer

SRC = os.path.expanduser('~/Downloads/提供データ/提供データ.csv')
OUT_DIR = '/Users/iwanaga/claude code用/交通事故マップ'

# EPSG:4301 = 日本測地系(Tokyo) → EPSG:4326 = WGS84
to_wgs84 = Transformer.from_crs('EPSG:4301', 'EPSG:4326', always_xy=True)

def clean(s):
    """全角スペース区切りを読みやすく整形"""
    return ' '.join(p for p in s.replace('　', ' ').split(' ') if p)

# カテゴリはインデックス化して圧縮
dicts = {'cat': {}, 'detail': {}, 'route': {}, 'pa': {}, 'pb': {}, 'police': {}, 'city': {}}
def idx(key, val):
    d = dicts[key]
    if val not in d:
        d[val] = len(d)
    return d[val]

rows = []
with open(SRC, encoding='shift_jis', errors='replace', newline='') as f:
    reader = csv.reader(f)
    next(reader)
    for x in reader:
        if len(x) < 11:
            continue
        try:
            lon_t = float(x[9]); lat_t = float(x[10])
        except ValueError:
            continue
        lon, lat = to_wgs84.transform(lon_t, lat_t)
        if not (33.3 <= lat <= 34.5 and 134.9 <= lon <= 136.2):
            continue
        cat, _, detail = x[1].partition('　')   # 事故類型 → 大分類／詳細
        y, m, d = (x[7].split('/') + ['', ''])[:3]
        date = f"{y}/{int(m):02d}/{int(d):02d}" if m and d else x[7]
        rows.append([
            idx('cat', cat.strip()),
            idx('detail', clean(detail)),
            idx('route', x[2].strip()),
            idx('pa', clean(x[3])),
            idx('pb', clean(x[4])),
            idx('police', x[5].strip().replace('警察署', '')),
            idx('city', x[6].strip()),
            date, x[8].strip(),
            round(lat, 6), round(lon, 6),
        ])

def inv(key):
    return [k for k, _ in sorted(dicts[key].items(), key=lambda kv: kv[1])]

out = {'cats': inv('cat'), 'details': inv('detail'), 'routes': inv('route'),
       'partiesA': inv('pa'), 'partiesB': inv('pb'), 'stations': inv('police'),
       'cities': inv('city'), 'rows': rows}
# rows形式: [事故類型, 詳細, 路線, 当事者A, 当事者B, 警察署, 市区町村, 発生日, 時帯, 緯度, 経度]（先頭7つは辞書index）

print('変換件数:', len(rows))
from collections import Counter
print('事故類型:', Counter(out['cats'][r[0]] for r in rows).most_common())
print('警察署 上位:', Counter(out['stations'][r[5]] for r in rows).most_common(5))
print('発生年:', dict(sorted(Counter(r[7][:4] for r in rows).items())))
print('サンプル1点目 緯度経度:', rows[0][9], rows[0][10])

path = os.path.join(OUT_DIR, 'property_2025.js')
with open(path, 'w', encoding='utf-8') as f:
    f.write('window.PROPERTY_2025 = ' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';')
print('property_2025.js 出力完了:', round(os.path.getsize(path)/1e6, 2), 'MB')
