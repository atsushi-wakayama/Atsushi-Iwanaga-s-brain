# -*- coding: utf-8 -*-
"""警察提供「令和7年 物件事故」データ(Shift-JIS)を、日本測地系→世界測地系に変換し、
さらに最寄りの道路(OSM)上へスナップして地図用 property_2025.js を生成する。"""
import csv, json, os, math
import numpy as np

SRC = os.path.expanduser('~/Downloads/提供データ/提供データ.csv')
OUT_DIR = '/Users/iwanaga/claude code用/交通事故マップ'
ROAD_NPY = '/private/tmp/claude-501/-Users-iwanaga-claude-code---------claude-worktrees-vigilant-cori-4bf2c6/21aa22a4-94c1-4867-aa44-78132657ecaa/scratchpad/road_pts.npy'
SNAP_MAX_M = 1500.0   # 全点を最寄り道路へ寄せる（県内の最寄り道路距離は最大約1,150m）
LAT0 = 33.9           # メートル投影の基準緯度

def tky2wgs(lat, lon):
    """日本測地系(東京)→世界測地系(WGS84) 近似変換（誤差数m）"""
    la = lat - 0.00010696*lat - 0.000017467*lon + 0.0046047
    lo = lon - 0.000046038*lat - 0.000083043*lon + 0.010040
    return round(la, 6), round(lo, 6)

# --- 道路スナップ用 KDTree ---
from scipy.spatial import cKDTree
_MX = 111320.0 * math.cos(math.radians(LAT0))
_MY = 111320.0
def to_m(lat, lon):
    return np.column_stack([np.asarray(lon)*_MX, np.asarray(lat)*_MY])
road = np.load(ROAD_NPY)
_tree = cKDTree(to_m(road[:,0], road[:,1]))
def snap(lat, lon):
    """(lat,lon)を最寄り道路点へ。距離が SNAP_MAX_M 超なら元のまま。戻り値:(lat,lon,dist_m,snapped)"""
    d, i = _tree.query([lon*_MX, lat*_MY])
    if d <= SNAP_MAX_M:
        rl, ro = road[i]
        return round(rl, 6), round(ro, 6), d, True
    return lat, lon, d, False

# カテゴリ項目は辞書インデックス化して圧縮
dicts = {'t':{}, 'r':{}, 'a':{}, 'b':{}, 's':{}, 'c':{}}
def idx(key, val):
    d = dicts[key]
    if val not in d:
        d[val] = len(d)
    return d[val]

rows = []
snap_stats = []
with open(SRC, encoding='shift_jis', errors='replace') as f:
    r = csv.reader(f)
    next(r)  # header
    for x in r:
        if len(x) < 11:
            continue
        try:
            lon_t = float(x[9]); lat_t = float(x[10])
        except ValueError:
            continue
        lat, lon = tky2wgs(lat_t, lon_t)
        if not (33.3 <= lat <= 34.5 and 134.9 <= lon <= 136.2):
            continue
        lat, lon, dist, snapped = snap(lat, lon)
        snap_stats.append((dist, snapped))
        y, m, d = (x[7].split('/') + ['', ''])[:3]
        date = f"{y}/{int(m):02d}/{int(d):02d}" if m and d else x[7]
        rows.append([
            idx('t', x[1].strip()),
            idx('r', x[2].strip()),
            idx('a', x[3].strip()),
            idx('b', x[4].strip()),
            idx('s', x[5].strip().replace('警察署', '')),
            idx('c', x[6].strip()),
            date, x[8].strip(),
            round(lat, 5), round(lon, 5),
        ])

def inv(key):
    return [k for k, _ in sorted(dicts[key].items(), key=lambda kv: kv[1])]

out = {'types': inv('t'), 'routes': inv('r'), 'partiesA': inv('a'), 'partiesB': inv('b'),
       'stations': inv('s'), 'cities': inv('c'), 'rows': rows}
# rows形式: [type, route, 当事者A, 当事者B, 警察署, 市区町村, 発生日, 時帯, 緯度, 経度]（先頭6つは辞書index）

print('変換件数:', len(rows))
sd = np.array([s[0] for s in snap_stats]); snapped_n = sum(1 for s in snap_stats if s[1])
print(f'スナップ: {snapped_n}/{len(snap_stats)}件 ({100*snapped_n/len(snap_stats):.1f}%) '
      f'／ 移動距離 中央値{np.median(sd):.0f}m 平均{sd.mean():.0f}m 最大{sd.max():.0f}m')
print(f'  50m超移動: {int((sd>50).sum())}件 / 100m超: {int((sd>100).sum())}件 / 未スナップ(>{int(SNAP_MAX_M)}m): {len(snap_stats)-snapped_n}件')
from collections import Counter
print('警察署別上位:', Counter(out['stations'][r[4]] for r in rows).most_common(5))
print('発生年:', dict(sorted(Counter(r[6][:4] for r in rows).items())))

path = os.path.join(OUT_DIR, 'property_2025.js')
with open(path, 'w', encoding='utf-8') as f:
    f.write('window.PROPERTY_2025 = ' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';')
print('property_2025.js 出力完了:', round(os.path.getsize(path)/1e6, 2), 'MB')
