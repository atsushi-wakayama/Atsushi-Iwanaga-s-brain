import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  AlertTriangle,
  User,
  Lock,
  FileText,
  Mail,
} from "lucide-react";

// ──────────────────────────────────────────────
// 運営情報（ここを書き換えれば全体に反映されます）
// ──────────────────────────────────────────────
const OPERATOR = "Atsushi Iwanaga（個人）";
const OPERATOR_TYPE = "個人運営（シビックテック有志）";
const CONTACT_EMAIL = "atsushi.iwanaga@atsushi-iwanaga.jp";
const LAST_UPDATED = "2026年6月4日";

export const metadata: Metadata = {
  title: "運営方針・各種ポリシー",
  description:
    "「みらいのわかやま県議会」の運営者情報・免責事項・プライバシーポリシー・利用規約・お問い合わせ窓口をまとめたページです。本サイトはシビックテックのプロトタイプであり、掲載情報はダミーデータです。",
  alternates: { canonical: "/policy" },
  openGraph: {
    title: "運営方針・各種ポリシー | みらいのわかやま県議会",
    description:
      "運営者情報・免責事項・プライバシーポリシー・利用規約・お問い合わせ窓口。本サイトはシビックテックのプロトタイプです。",
    url: "/policy",
    type: "website",
  },
};

const navItems = [
  { href: "#operator", label: "運営者情報" },
  { href: "#disclaimer", label: "免責事項" },
  { href: "#privacy", label: "プライバシーポリシー" },
  { href: "#terms", label: "利用規約" },
  { href: "#contact", label: "お問い合わせ" },
];

export default function PolicyPage() {
  return (
    <div>
      {/* Page header */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="absolute inset-0 bg-grid-faint opacity-60" aria-hidden />
        <div
          className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-wakayama-blue/10 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 py-12 sm:py-16">
          <div className="flex items-center gap-2 text-wakayama-blue-dark">
            <ShieldCheck size={18} />
            <p className="text-sm font-semibold tracking-wider uppercase">
              Site Policy
            </p>
          </div>
          <h1 className="mt-1 text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            運営方針・各種ポリシー
          </h1>
          <p className="mt-3 text-base text-slate-600 max-w-3xl leading-relaxed">
            本サイトの運営者情報、免責事項、プライバシーポリシー、利用規約、
            お問い合わせ窓口をまとめています。
          </p>
          <p className="mt-2 text-xs text-slate-400">最終更新：{LAST_UPDATED}</p>

          {/* quick nav */}
          <div className="mt-6 flex flex-wrap gap-2">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 h-9 text-sm font-semibold text-slate-700 hover:border-wakayama-orange hover:text-wakayama-orange-dark transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-14 space-y-16">
        {/* 重要なお知らせ（ダミーデータ） */}
        <div
          role="alert"
          className="rounded-xl border-2 border-amber-400 bg-amber-50 p-5 flex items-start gap-3"
        >
          <AlertTriangle
            size={22}
            className="shrink-0 text-amber-600 mt-0.5"
          />
          <div className="text-sm leading-relaxed text-amber-900">
            <p className="font-bold text-base">
              ⚠️ 本サイトはプロトタイプです
            </p>
            <p className="mt-1.5">
              「みらいのわかやま県議会」は
              <strong>シビックテックのプロトタイプ（試作）</strong>です。
              掲載されている議員の活動内容・発言要約・注力テーマ等は
              <strong>すべてダミーデータ</strong>であり、
              <strong>
                和歌山県・和歌山県議会・議員個人とは一切関係ありません。
              </strong>
              実際の議会活動を表すものではありません。
            </p>
          </div>
        </div>

        {/* 運営者情報 */}
        <section id="operator" className="scroll-mt-20">
          <div className="flex items-center gap-2 text-wakayama-orange-dark mb-3">
            <User size={18} />
            <p className="text-sm font-semibold tracking-wider uppercase">
              Operator
            </p>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">運営者情報</h2>
          <dl className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 p-4">
              <dt className="w-40 shrink-0 text-sm font-semibold text-slate-500">
                サイト名
              </dt>
              <dd className="text-sm text-slate-800">みらいのわかやま県議会</dd>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 p-4">
              <dt className="w-40 shrink-0 text-sm font-semibold text-slate-500">
                運営者
              </dt>
              <dd className="text-sm text-slate-800">{OPERATOR}</dd>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 p-4">
              <dt className="w-40 shrink-0 text-sm font-semibold text-slate-500">
                運営形態
              </dt>
              <dd className="text-sm text-slate-800">{OPERATOR_TYPE}</dd>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 p-4">
              <dt className="w-40 shrink-0 text-sm font-semibold text-slate-500">
                目的
              </dt>
              <dd className="text-sm text-slate-700 leading-relaxed">
                議会情報を市民が直感的に理解できる形で可視化する、
                シビックテック×AIの実証実験（非営利）。
              </dd>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 p-4">
              <dt className="w-40 shrink-0 text-sm font-semibold text-slate-500">
                連絡先
              </dt>
              <dd className="text-sm text-slate-800">
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-wakayama-blue hover:text-wakayama-blue-dark underline underline-offset-2"
                >
                  {CONTACT_EMAIL}
                </a>
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            本サイトは行政機関・議会・政党・特定の議員とは独立した立場で、
            個人が運営しています。特定の政治的立場を支持・誘導する意図はありません。
          </p>
        </section>

        {/* 免責事項 */}
        <section id="disclaimer" className="scroll-mt-20">
          <div className="flex items-center gap-2 text-wakayama-orange-dark mb-3">
            <AlertTriangle size={18} />
            <p className="text-sm font-semibold tracking-wider uppercase">
              Disclaimer
            </p>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">免責事項</h2>
          <ol className="space-y-3 text-sm text-slate-700 leading-relaxed list-decimal pl-5">
            <li>
              本サイトはプロトタイプであり、掲載されている議員の活動・発言要約・
              注力テーマ・数値等の多くは
              <strong>デモンストレーション用のダミーデータ</strong>です。
              実在の人物・団体の見解や活動を正確に表すものではありません。
            </li>
            <li>
              予算・議会日程など一部の情報は公開資料を参照していますが、
              内容の正確性・完全性・最新性を保証するものではありません。
              正式な情報は必ず
              <strong>和歌山県議会の公式サイト・公式資料</strong>をご確認ください。
            </li>
            <li>
              本サイトの利用または利用不能によって生じたいかなる損害についても、
              運営者は一切の責任を負いません。
            </li>
            <li>
              本サイトはAIを用いて情報の要約・可視化を行う場合があります。
              AIによる生成内容には誤りが含まれる可能性があります。
            </li>
            <li>
              掲載内容について事実誤認・権利侵害等のご指摘がある場合は、
              <a href="#contact" className="text-wakayama-blue underline underline-offset-2">
                お問い合わせ窓口
              </a>
              よりご連絡ください。確認のうえ速やかに対応します。
            </li>
          </ol>
        </section>

        {/* プライバシーポリシー */}
        <section id="privacy" className="scroll-mt-20">
          <div className="flex items-center gap-2 text-wakayama-orange-dark mb-3">
            <Lock size={18} />
            <p className="text-sm font-semibold tracking-wider uppercase">
              Privacy
            </p>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            プライバシーポリシー
          </h2>
          <div className="space-y-5 text-sm text-slate-700 leading-relaxed">
            <div>
              <h3 className="font-bold text-slate-900 mb-1">
                1. 取得する情報
              </h3>
              <p>
                本サイトは、会員登録やお問い合わせフォーム等による個人情報の
                入力を求めていません。サーバー（ホスティング事業者）が、
                セキュリティおよび運用のためにアクセスログ
                （IPアドレス・ブラウザ情報等）を自動的に記録する場合があります。
              </p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-1">
                2. アクセス解析・Cookie
              </h3>
              <p>
                本サイトの改善のため、将来的にアクセス解析ツールを
                利用する場合があります。これらのツールは利用状況の把握のために
                Cookie 等を使用することがありますが、個人を特定する情報は
                含みません。Cookie の利用はブラウザの設定で拒否できます。
              </p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-1">
                3. 第三者への提供
              </h3>
              <p>
                取得した情報を、法令に基づく場合を除き、本人の同意なく
                第三者へ提供することはありません。
              </p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-1">
                4. お問い合わせでお預かりする情報
              </h3>
              <p>
                メール等でお問い合わせをいただいた場合、その内容や
                メールアドレスは、対応の目的の範囲内でのみ利用します。
              </p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-1">
                5. ポリシーの変更
              </h3>
              <p>
                本ポリシーは予告なく変更されることがあります。
                変更後の内容は本ページに掲載した時点で効力を生じます。
              </p>
            </div>
          </div>
        </section>

        {/* 利用規約 */}
        <section id="terms" className="scroll-mt-20">
          <div className="flex items-center gap-2 text-wakayama-orange-dark mb-3">
            <FileText size={18} />
            <p className="text-sm font-semibold tracking-wider uppercase">
              Terms
            </p>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">利用規約</h2>
          <div className="space-y-5 text-sm text-slate-700 leading-relaxed">
            <div>
              <h3 className="font-bold text-slate-900 mb-1">第1条（適用）</h3>
              <p>
                本規約は、本サイトの利用に関して運営者と利用者の間に適用されます。
                本サイトを利用した時点で、本規約に同意したものとみなします。
              </p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-1">
                第2条（掲載情報の性質）
              </h3>
              <p>
                本サイトはプロトタイプであり、掲載情報の多くはダミーデータです。
                利用者は、本サイトの情報を公式情報・意思決定の根拠として
                用いないものとします。
              </p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-1">第3条（禁止事項）</h3>
              <p>利用者は、本サイトの利用にあたり次の行為を行ってはなりません。</p>
              <ul className="mt-2 space-y-1 list-disc pl-5">
                <li>法令または公序良俗に反する行為</li>
                <li>運営者・第三者の権利・利益を侵害する行為</li>
                <li>本サイトの運営を妨害する行為（過度なアクセス等を含む）</li>
                <li>掲載情報を実在の人物・団体の事実として転載・流布する行為</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-1">
                第4条（著作権・引用）
              </h3>
              <p>
                本サイトが独自に作成したコンテンツの著作権は運営者に帰属します。
                引用にあたっては出典として本サイト名およびURLを明記してください。
                なお、本サイトが参照する公的資料の権利は各権利者に帰属します。
              </p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-1">
                第5条（免責）
              </h3>
              <p>
                本サイトの利用により生じた損害について、運営者は責任を負いません
                （詳細は
                <a href="#disclaimer" className="text-wakayama-blue underline underline-offset-2">
                  免責事項
                </a>
                をご参照ください）。
              </p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-1">
                第6条（規約の変更）
              </h3>
              <p>
                運営者は、必要に応じて本規約を変更できるものとします。
                変更後の規約は本ページに掲載した時点で効力を生じます。
              </p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-1">
                第7条（準拠法・裁判管轄）
              </h3>
              <p>
                本規約の解釈には日本法を準拠法とし、本サイトに関して紛争が
                生じた場合には、運営者の所在地を管轄する裁判所を
                第一審の専属的合意管轄裁判所とします。
              </p>
            </div>
          </div>
        </section>

        {/* お問い合わせ */}
        <section id="contact" className="scroll-mt-20">
          <div className="flex items-center gap-2 text-wakayama-orange-dark mb-3">
            <Mail size={18} />
            <p className="text-sm font-semibold tracking-wider uppercase">
              Contact
            </p>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">お問い合わせ</h2>
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-700 leading-relaxed">
              本サイトに関するご意見・ご質問、掲載情報の訂正・削除のご依頼は、
              下記のメールアドレスまでご連絡ください。
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-wakayama-orange px-6 h-11 text-sm font-semibold text-white hover:bg-wakayama-orange/90 shadow-sm transition-colors"
            >
              <Mail size={16} />
              {CONTACT_EMAIL}
            </a>
            <p className="mt-4 text-xs text-slate-400">
              ※ 個人運営のため、返信までお時間をいただく場合があります。
            </p>
          </div>
        </section>

        <div className="pt-4">
          <Link
            href="/"
            className="text-sm font-semibold text-wakayama-blue hover:text-wakayama-blue-dark"
          >
            ← トップへ戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
