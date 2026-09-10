import {
  AlignmentType,
  Document,
  ImageRun,
  Packer,
  PageBreak,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import { categoryOf } from "./categories";
import { formatDateTime, type PhotoEntry, type ReportFields } from "./report";

const FONT = "ＭＳ 明朝";
const BODY_SIZE = 21; // half-points = 10.5pt（日本語ビジネス文書の標準）
const CONTENT_WIDTH = 430; // px 換算での本文幅
const MAX_IMAGE_HEIGHT = 310; // 1ページに2枚収めるための上限

function text(value: string, options: { bold?: boolean; size?: number } = {}) {
  return new TextRun({
    text: value,
    font: FONT,
    size: options.size ?? BODY_SIZE,
    bold: options.bold,
  });
}

function line(
  value: string,
  options: {
    bold?: boolean;
    size?: number;
    alignment?: (typeof AlignmentType)[keyof typeof AlignmentType];
    spacingAfter?: number;
  } = {},
) {
  return new Paragraph({
    alignment: options.alignment,
    spacing: { after: options.spacingAfter ?? 120 },
    children: [text(value, { bold: options.bold, size: options.size })],
  });
}

/** 「項目名：内容」の1行。長い概要は行ごとに分けて渡す */
function labelled(label: string, value: string) {
  const lines = (value || "―").split("\n");
  return lines.map(
    (part, index) =>
      new Paragraph({
        spacing: { after: index === lines.length - 1 ? 160 : 40 },
        indent: { left: 200, hanging: index === 0 ? 200 : 0 },
        children: [text(index === 0 ? `${label}　${part}` : `　　　　　　${part}`)],
      }),
  );
}

function metaRow(label: string, value: string) {
  return new TableRow({
    children: [
      new TableCell({
        width: { size: 22, type: WidthType.PERCENTAGE },
        children: [line(label, { spacingAfter: 0 })],
      }),
      new TableCell({
        width: { size: 78, type: WidthType.PERCENTAGE },
        children: [line(value || "―", { spacingAfter: 0 })],
      }),
    ],
  });
}

async function fetchImage(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`画像を取得できませんでした (${response.status})`);
  return new Uint8Array(await response.arrayBuffer());
}

export async function buildReportDocx({
  fields,
  issuedLabel,
  entries,
  mapTitle,
}: {
  fields: ReportFields;
  issuedLabel: string;
  entries: PhotoEntry[];
  mapTitle: string;
}) {
  const images = await Promise.all(
    entries.map(async (entry) => {
      if (!entry.photo.url) return null;
      try {
        return await fetchImage(entry.photo.url);
      } catch {
        return null;
      }
    }),
  );

  const range =
    entries.length === 0
      ? "―"
      : entries.length === 1
        ? `別紙のとおり（No.${entries[0].photo.seq ?? 1}　計1枚）`
        : `別紙のとおり（No.${entries[0].photo.seq ?? 1}〜No.${
            entries[entries.length - 1].photo.seq ?? entries.length
          }　計${entries.length}枚）`;

  const body: (Paragraph | Table)[] = [
    line(issuedLabel, { alignment: AlignmentType.RIGHT }),
    line(fields.recipient, { spacingAfter: 200 }),
    line(fields.senderName, { alignment: AlignmentType.RIGHT, spacingAfter: 40 }),
  ];

  if (fields.senderContact) {
    body.push(
      line(`連絡先：${fields.senderContact}`, {
        alignment: AlignmentType.RIGHT,
        spacingAfter: 400,
      }),
    );
  }

  body.push(
    line(fields.title, {
      alignment: AlignmentType.CENTER,
      bold: true,
      size: 32,
      spacingAfter: 400,
    }),
    line("　標記について、下記のとおり現地を確認いたしましたので、ご相談申し上げます。", {
      spacingAfter: 240,
    }),
    line("記", { alignment: AlignmentType.CENTER, spacingAfter: 240 }),
    ...labelled("１　発生日時", fields.occurredAt),
    ...labelled("２　場所", fields.place),
    ...labelled("３　概要", fields.summary),
    ...labelled("４　現地写真", range),
    line("以上", { alignment: AlignmentType.RIGHT, spacingAfter: 0 }),
  );

  const appendix: (Paragraph | Table)[] = [];
  if (entries.length > 0) {
    appendix.push(
      new Paragraph({ children: [new PageBreak()] }),
      line("別紙　現地写真", {
        alignment: AlignmentType.CENTER,
        bold: true,
        size: 26,
        spacingAfter: 300,
      }),
    );

    entries.forEach((entry, index) => {
      const { photo } = entry;
      const cat = categoryOf(photo.category);

      appendix.push(
        line(`No.${photo.seq ?? index + 1}　${cat.label}`, {
          bold: true,
          size: 24,
          spacingAfter: 100,
        }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            metaRow("所在地", entry.address),
            metaRow("撮影日時", formatDateTime(photo.taken_at)),
            metaRow(
              "座標",
              photo.lat !== null && photo.lng !== null
                ? `北緯 ${photo.lat.toFixed(5)} / 東経 ${photo.lng.toFixed(5)}`
                : "―",
            ),
          ],
        }),
        line("", { spacingAfter: 100 }),
      );

      const data = images[index];
      if (data) {
        const ratio =
          photo.width && photo.height ? photo.height / photo.width : 0.75;
        // 縦位置の写真は高さで頭打ちにして、幅を比率どおり詰める
        let width = CONTENT_WIDTH;
        let height = Math.round(CONTENT_WIDTH * ratio);
        if (height > MAX_IMAGE_HEIGHT) {
          height = MAX_IMAGE_HEIGHT;
          width = Math.round(MAX_IMAGE_HEIGHT / ratio);
        }
        appendix.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
            children: [
              new ImageRun({
                type: "jpg",
                data,
                transformation: { width, height },
              }),
            ],
          }),
        );
      }

      appendix.push(
        line(photo.caption || "（キャプションなし）", { spacingAfter: 300 }),
      );

      // 1ページ2枚で改ページする
      if (index % 2 === 1 && index !== entries.length - 1) {
        appendix.push(new Paragraph({ children: [new PageBreak()] }));
      }
    });
  }

  const document = new Document({
    title: `${fields.title}　${mapTitle}`,
    styles: {
      default: {
        document: { run: { font: FONT, size: BODY_SIZE } },
      },
    },
    sections: [
      {
        properties: {
          page: { margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } },
        },
        children: [...body, ...appendix],
      },
    ],
  });

  return Packer.toBlob(document);
}
