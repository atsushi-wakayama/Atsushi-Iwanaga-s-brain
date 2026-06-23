/* 警察署 公式「交通事故多発交差点ワーストランキング」
 * 出典: 御坊警察署 10_R3／09_R4〜R7_gobo.pdf（令和3〜7年 = 2021〜2025年）
 * 各交差点の年ごとの順位・件数（括弧内は人身事故件数）を収録。
 * 座標は地名・施設のジオコーディング（OSM）と地理院地図による目視確認に基づく概略位置。
 *   conf: "ok"=施設アンカーで確度高 / "approx"=要確認（路線沿いの推定）
 * 他署のPDFを追加する際は同じ形式で station を変えて追記する。
 */
window.OFFICIAL_HOTSPOTS = [
  {name:"財部",         city:"御坊市", route:"国道42号",        station:"御坊", lat:33.8995, lon:135.1582, conf:"ok",
   years:{2022:{rank:2,count:8,jinshin:0}, 2023:{rank:1,count:9,jinshin:0}, 2024:{rank:3,count:6,jinshin:1}, 2025:{rank:2,count:6,jinshin:1}}},
  {name:"松原通り",      city:"御坊市", route:"国道42号",        station:"御坊", lat:33.8860, lon:135.1585, conf:"approx",
   years:{2022:{rank:1,count:9,jinshin:2}, 2023:{rank:3,count:8,jinshin:1}, 2024:{rank:1,count:8,jinshin:1}}},
  {name:"小松原",       city:"御坊市", route:"国道42号",        station:"御坊", lat:33.9050, lon:135.1576, conf:"ok",
   years:{2021:{rank:3,count:6,jinshin:0}, 2023:{rank:5,count:7,jinshin:0}, 2024:{rank:2,count:7,jinshin:0}, 2025:{rank:2,count:6,jinshin:0}}},
  {name:"小松原南",     city:"御坊市", route:"県道御坊美山線",   station:"御坊", lat:33.9022, lon:135.1560, conf:"approx",
   years:{2021:{rank:2,count:7,jinshin:2}, 2022:{rank:6,count:6,jinshin:0}, 2023:{rank:6,count:6,jinshin:0}, 2024:{rank:5,count:5,jinshin:0}}},
  {name:"斉川小橋西側",  city:"美浜町", route:"町道",            station:"御坊", lat:33.8973, lon:135.1452, conf:"ok",
   years:{2021:{rank:3,count:6,jinshin:0}, 2022:{rank:3,count:7,jinshin:0}, 2024:{rank:5,count:5,jinshin:0}, 2025:{rank:2,count:6,jinshin:1}}},
  {name:"御坊小学校南東", city:"御坊市", route:"県道井関御坊線",   station:"御坊", lat:33.8911, lon:135.1557, conf:"ok",
   years:{2022:{rank:3,count:7,jinshin:1}, 2025:{rank:3,count:5,jinshin:0}}},
  {name:"日高振興局東",  city:"御坊市", route:"県道御坊美山線",   station:"御坊", lat:33.8983, lon:135.1534, conf:"ok",
   years:{2023:{rank:1,count:9,jinshin:3}, 2025:{rank:3,count:5,jinshin:0}}},
  {name:"里トンネル南方", city:"由良町", route:"国道42号",        station:"御坊", lat:33.9380, lon:135.1290, conf:"approx",
   years:{2021:{rank:3,count:6,jinshin:0}, 2023:{rank:3,count:8,jinshin:0}, 2024:{rank:3,count:6,jinshin:0}}},
  {name:"道成寺南方",    city:"御坊市", route:"県道日高印南線",   station:"御坊", lat:33.9088, lon:135.1756, conf:"ok",
   years:{2021:{rank:9,count:5,jinshin:0}, 2023:{rank:6,count:6,jinshin:0}, 2025:{rank:3,count:5,jinshin:0}}},
  {name:"財部交差南方",  city:"御坊市", route:"国道42号",        station:"御坊", lat:33.8978, lon:135.1582, conf:"approx",
   years:{2023:{rank:8,count:5,jinshin:0}, 2025:{rank:2,count:6,jinshin:0}}},
  {name:"御坊駅前",     city:"御坊市", route:"県道御坊停車場線", station:"御坊", lat:33.9072, lon:135.1586, conf:"ok",
   years:{2021:{rank:1,count:11,jinshin:0}, 2022:{rank:2,count:8,jinshin:2}}},
  {name:"市役所北",     city:"御坊市", route:"国道42号",        station:"御坊", lat:33.8924, lon:135.1528, conf:"ok",
   years:{2022:{rank:3,count:7,jinshin:0}}},
  {name:"島南",        city:"御坊市", route:"県道御坊停車場線", station:"御坊", lat:33.8912, lon:135.1636, conf:"approx",
   years:{2023:{rank:6,count:6,jinshin:0}}},
  {name:"体育館前",     city:"御坊市", route:"国道42号",        station:"御坊", lat:33.8900, lon:135.1583, conf:"approx",
   years:{2024:{rank:3,count:6,jinshin:1}}},
  {name:"島公民館前",   city:"御坊市", route:"県道御坊停車場線", station:"御坊", lat:33.8936, lon:135.1634, conf:"approx",
   years:{2024:{rank:5,count:5,jinshin:0}}},
  {name:"日高高校南西",  city:"御坊市", route:"市道",            station:"御坊", lat:33.8961, lon:135.1576, conf:"ok",
   years:{2021:{rank:3,count:6,jinshin:1}, 2025:{rank:1,count:10,jinshin:0}}},
  {name:"天田橋北詰",   city:"御坊市", route:"国道42号",        station:"御坊", lat:33.8812, lon:135.1593, conf:"ok",
   years:{2025:{rank:3,count:5,jinshin:0}}},
  // --- 令和3年(2021)で新規に登場した交差点 ---
  {name:"野口新橋西詰",  city:"御坊市", route:"県道御坊美山線",   station:"御坊", lat:33.9004, lon:135.1730, conf:"approx",
   years:{2021:{rank:3,count:6,jinshin:0}}},
  {name:"新橋西方",     city:"御坊市", route:"市道",            station:"御坊", lat:33.9005, lon:135.1700, conf:"approx",
   years:{2021:{rank:3,count:6,jinshin:0}}},
  {name:"紀伊御坊駅北東方", city:"御坊市", route:"県道井関御坊線", station:"御坊", lat:33.8950, lon:135.1555, conf:"approx",
   years:{2021:{rank:9,count:5,jinshin:0}}},
];
