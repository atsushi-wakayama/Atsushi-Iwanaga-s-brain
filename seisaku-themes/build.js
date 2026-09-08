/* ============================================================
   静的サイト生成（SSG）
   ------------------------------------------------------------
   data.js を読み、テーマの数だけ HTML を dist/ に書き出す。
   - /            … トップ（一覧のカード）
   - /t/<id>      … テーマごとの詳細ページ（OGP・本文入り）
   - /list        … テキスト一覧
   依存パッケージなし。`node build.js` で実行。
   ============================================================ */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const SRC = __dirname;
const OUT = path.join(SRC, "dist");

/* ---- data.js を読み込む ---- */
const ctx = {};
vm.createContext(ctx);
vm.runInContext(
  fs.readFileSync(path.join(SRC, "data.js"), "utf8") +
    "\n;this.__ = { THEMES, SITE, CATEGORIES };",
  ctx
);
const { THEMES, SITE } = ctx.__;

const TEMPLATE = fs.readFileSync(path.join(SRC, "index.html"), "utf8");
const BASE = (SITE.url || "").replace(/\/$/, "");

const esc = (v) =>
  String(v == null ? "" : v)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
const trim = (v, n) => {
  const t = String(v == null ? "" : v).replace(/\s+/g, " ").trim();
  return t.length > n ? t.slice(0, n - 1) + "…" : t;
};
const absURL = (u) => (!u ? "" : /^https?:/.test(u) ? u : BASE + (u[0] === "/" ? u : "/" + u));

/* ---- <head> ---- */
function head({ title, desc, url, image }) {
  const img = absURL(image || SITE.ogImage || "");
  return [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(desc)}">`,
    url ? `<link rel="canonical" href="${esc(url)}">` : "",
    `<meta property="og:type" content="${url && url !== BASE + "/" ? "article" : "website"}">`,
    `<meta property="og:site_name" content="${esc(SITE.name)}">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(desc)}">`,
    url ? `<meta property="og:url" content="${esc(url)}">` : "",
    img ? `<meta property="og:image" content="${esc(img)}">` : "",
    `<meta name="twitter:card" content="${img ? "summary_large_image" : "summary"}">`,
  ].filter(Boolean).join("\n");
}

/* ---- JS が動かない環境向けの本文 ---- */
function preTheme(t) {
  const li = (t.actions || []).map((a) => `<li>${esc(a)}</li>`).join("");
  const rel = THEMES.filter((o) => o.id !== t.id && o.tags.some((g) => t.tags.includes(g))).slice(0, 4);
  return [
    `<article>`,
    t.subtitle ? `<p>${esc(t.subtitle)}</p>` : "",
    `<h1>${esc(t.title)}</h1>`,
    `<p>${esc(t.tags.join(" / "))}</p>`,
    t.summary ? `<p>${esc(t.summary)}</p>` : "",
    t.issue ? `<h3>課題の現状</h3><p>${esc(t.issue)}</p>` : "",
    t.stance ? `<h3>岩永の考え・提案</h3><p>${esc(t.stance)}</p>` : "",
    li ? `<h3>これまでの動き</h3><ul>${li}</ul>` : "",
    `<h3>データ</h3><p>`,
    t.status ? `ステータス：${esc(t.status)}<br>` : "",
    t.source ? `声のもと：${esc(t.source)}<br>` : "",
    t.updated ? `更新：${esc(t.updated)}` : "",
    `</p>`,
    rel.length
      ? `<h3>関連する課題</h3><ul>${rel.map((o) => `<li><a href="/t/${esc(o.id)}">${esc(o.title)}</a></li>`).join("")}</ul>`
      : "",
    `<p><a href="/">← 政策課題の一覧へ</a></p>`,
    `</article>`,
  ].join("");
}
function preIndex() {
  return [
    `<h1>${esc(SITE.name)}</h1>`,
    `<p>${esc(SITE.lead)}</p>`,
    `<h2>政策課題 一覧</h2><ul>`,
    THEMES.map((t) => `<li><a href="/t/${esc(t.id)}">${esc(t.title)}</a>${t.summary ? `　${esc(t.summary)}` : ""}</li>`).join(""),
    `</ul>`,
  ].join("");
}

const page = (h, pre) =>
  TEMPLATE.replace("<!--HEAD-->", h).replace("<!--PRERENDER-->", pre);

/* ---- 出力 ---- */
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, "t"), { recursive: true });

const siteDesc = trim(SITE.lead, 150);
fs.writeFileSync(
  path.join(OUT, "index.html"),
  page(head({ title: `${SITE.name}｜${SITE.owner}`, desc: siteDesc, url: BASE + "/" }), preIndex())
);
fs.writeFileSync(
  path.join(OUT, "list.html"),
  page(head({ title: `政策課題 一覧｜${SITE.name}`, desc: siteDesc, url: BASE + "/list" }), preIndex())
);

for (const t of THEMES) {
  fs.writeFileSync(
    path.join(OUT, "t", `${t.id}.html`),
    page(
      head({
        title: `${t.title}｜${SITE.name}`,
        desc: trim(t.summary || t.issue, 150),
        url: `${BASE}/t/${t.id}`,
        image: t.image,
      }),
      preTheme(t)
    )
  );
}

/* ---- そのまま配信するファイル ---- */
fs.copyFileSync(path.join(SRC, "data.js"), path.join(OUT, "data.js"));
if (fs.existsSync(path.join(SRC, "images")))
  fs.cpSync(path.join(SRC, "images"), path.join(OUT, "images"), { recursive: true });

/* ---- sitemap / robots ---- */
const urls = ["/", "/list", ...THEMES.map((t) => `/t/${t.id}`)];
fs.writeFileSync(
  path.join(OUT, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url><loc>${BASE}${u}</loc></url>`).join("\n") +
    `\n</urlset>\n`
);
fs.writeFileSync(
  path.join(OUT, "robots.txt"),
  `User-agent: *\nAllow: /\nSitemap: ${BASE}/sitemap.xml\n`
);

console.log(`✓ ${THEMES.length + 2} ページを dist/ に生成しました`);
