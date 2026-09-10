/* ============================================================
   記入シート（new-themes.txt）→ data.js への追記
   ------------------------------------------------------------
   使い方:
     node add-theme.js                 … 下書きを確認するだけ（書き込まない）
     node add-theme.js --write         … data.js に追記する
     node add-theme.js メモ.txt --write … 別のファイルから読み込む
   書き方は 記入シート.md を参照。
   ============================================================ */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const args  = process.argv.slice(2);
const write = args.includes("--write");
const input = args.find(a => !a.startsWith("--")) || "new-themes.txt";
const SRC   = __dirname;

/* ---- 項目名 → データのキー ---- */
const FIELDS = {
  "id":"id", "ID":"id",
  "テーマ名":"title", "タイトル":"title", "見出し":"title",
  "ひとこと":"subtitle", "サブタイトル":"subtitle", "小見出し":"subtitle",
  "分野":"tags", "タグ":"tags", "カテゴリ":"tags",
  "概要":"summary", "要約":"summary",
  "課題の現状":"issue", "課題":"issue", "現状":"issue",
  "考え・提案":"stance", "考え":"stance", "提案":"stance", "岩永の考え":"stance",
  "これまでの動き":"actions", "動き":"actions", "実績":"actions",
  "ステータス":"status", "状況":"status",
  "声のもと":"source", "出典":"source", "きっかけ":"source",
  "更新":"updated", "更新日":"updated",
  "画像":"image", "写真":"image",
  "色":"color",
};
const LIST_FIELDS = new Set(["actions"]);

function parse(text){
  const blocks = text.split(/^[-=]{3,}\s*$/m);
  const items = [];
  for(const raw of blocks){
    const lines = raw.split(/\r?\n/).filter(l => !/^\s*#/.test(l));
    const obj = {}; let key = null;
    for(const line of lines){
      const m = line.match(/^\s*([^:：]{1,12})\s*[:：]\s*(.*)$/);
      if(m && FIELDS[m[1].trim()]){
        key = FIELDS[m[1].trim()];
        const v = m[2].trim();
        obj[key] = LIST_FIELDS.has(key) ? (v ? [v] : []) : v;
        continue;
      }
      if(!key) continue;
      const t = line.trim();
      if(!t) continue;
      const li = t.match(/^[-・*]\s*(.+)$/);
      if(LIST_FIELDS.has(key)){
        if(li && li[1].trim()) obj[key].push(li[1].trim());
      }else{
        obj[key] = (obj[key] ? obj[key] + (obj[key].endsWith("。") ? "" : "") : "") + (li ? li[1] : t);
      }
    }
    if(obj.title || obj.id) items.push(obj);
  }
  return items;
}

/* ---- 既存データを読む ---- */
const ctx = {};
vm.createContext(ctx);
vm.runInContext(
  fs.readFileSync(path.join(SRC,"data.js"),"utf8") + "\n;this.__={THEMES,CATEGORIES};", ctx);
const { THEMES, CATEGORIES } = ctx.__;
const existing = new Set(THEMES.map(t => t.id));

/* ---- 変換・検証 ---- */
if(!fs.existsSync(path.join(SRC, input))){
  console.error(`✗ ${input} が見つかりません`); process.exit(1);
}
const items = parse(fs.readFileSync(path.join(SRC, input), "utf8"));
if(!items.length){ console.log("記入されたテーマがありません。"); process.exit(0); }

const errors = [], warns = [], ok = [];
items.forEach((o, n) => {
  const where = `${n+1}件目「${o.title || o.id || "(無題)"}」`;
  if(!o.title) errors.push(`${where}: テーマ名がありません`);
  if(!o.summary) errors.push(`${where}: 概要がありません`);
  if(!o.tags) errors.push(`${where}: 分野がありません`);
  o.tags = (o.tags || "").split(/[\/、,・]/).map(s => s.trim()).filter(Boolean);
  o.tags.forEach(t => { if(!CATEGORIES.includes(t)) warns.push(`${where}: 「${t}」はカテゴリ一覧にない分野です（新しい島が増えます）`); });
  if(!o.id){
    o.id = "theme-" + (o.updated || "").replace("-","") + "-" + (n+1);
    warns.push(`${where}: IDが空なので「${o.id}」を割り当てました`);
  }
  if(!/^[a-z0-9-]+$/.test(o.id)) errors.push(`${where}: ID「${o.id}」は半角英小文字・数字・ハイフンのみです`);
  if(existing.has(o.id)) errors.push(`${where}: ID「${o.id}」は既に使われています`);
  if(o.updated && !/^\d{4}-\d{2}$/.test(o.updated)) warns.push(`${where}: 更新「${o.updated}」は 2026-06 の形式にしてください`);
  existing.add(o.id);
  ok.push(o);
});

/* ---- data.js の書式に整える ---- */
const q = s => JSON.stringify(String(s));
function toJS(o){
  const L = [];
  L.push(`  {`);
  L.push(`    id: ${q(o.id)},`);
  L.push(`    title: ${q(o.title)},`);
  if(o.subtitle) L.push(`    subtitle: ${q(o.subtitle)},`);
  L.push(`    tags: [${o.tags.map(q).join(", ")}],`);
  if(o.color) L.push(`    color: ${q(o.color)},`);
  if(o.image) L.push(`    image: ${q(o.image)},`);
  L.push(`    summary:`);
  L.push(`      ${q(o.summary)},`);
  if(o.issue){ L.push(`    issue:`); L.push(`      ${q(o.issue)},`); }
  if(o.stance){ L.push(`    stance:`); L.push(`      ${q(o.stance)},`); }
  L.push(`    actions: [${(o.actions||[]).length ? "\n" + o.actions.map(a=>`      ${q(a)}`).join(",\n") + "\n    " : ""}],`);
  if(o.status) L.push(`    status: ${q(o.status)},`);
  if(o.source) L.push(`    source: ${q(o.source)},`);
  if(o.updated) L.push(`    updated: ${q(o.updated)},`);
  L.push(`  },`);
  return L.join("\n");
}

console.log(`読み込み: ${input} → ${ok.length}件`);
warns.forEach(w => console.log("  ⚠ " + w));
if(errors.length){
  errors.forEach(e => console.log("  ✗ " + e));
  console.log("\n修正してからもう一度実行してください。");
  process.exit(1);
}
ok.forEach(o => console.log(`  ・${o.title}（/t/${o.id}｜${o.tags.join(" / ")}）`));

const js = ok.map(toJS).join("\n") + "\n";
if(!write){
  console.log("\n--- data.js に入る内容（確認用） ---\n");
  console.log(js);
  console.log("問題なければ  node add-theme.js --write  で書き込みます。");
  process.exit(0);
}

const file = path.join(SRC, "data.js");
const cur = fs.readFileSync(file, "utf8");
const marker = "\n];\n";
const at = cur.lastIndexOf(marker, cur.indexOf("/* サイト全体の表記 */"));
if(at < 0){ console.error("✗ data.js の THEMES の終わりが見つかりません"); process.exit(1); }
fs.writeFileSync(file, cur.slice(0, at+1) + js + cur.slice(at+1));
console.log(`\n✓ data.js に ${ok.length}件 追記しました。`);
console.log("  つづけて  node build.js  を実行するとページが生成されます。");
