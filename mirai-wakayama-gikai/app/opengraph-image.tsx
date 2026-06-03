import { ImageResponse } from "next/og";

export const alt = "みらいのわかやま県議会 | 和歌山県議会を可視化するポータル";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #fff7ed 0%, #ffffff 55%, #eff6ff 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "84px",
              height: "84px",
              borderRadius: "20px",
              background: "#ea580c",
              color: "white",
              fontSize: "44px",
              fontWeight: 700,
            }}
          >
            議
          </div>
          <div
            style={{
              fontSize: "30px",
              fontWeight: 700,
              color: "#ea580c",
              letterSpacing: "0.05em",
            }}
          >
            MIRAI NO WAKAYAMA
          </div>
        </div>

        <div
          style={{
            fontSize: "76px",
            fontWeight: 800,
            color: "#0f172a",
            lineHeight: 1.15,
          }}
        >
          みらいのわかやま県議会
        </div>

        <div
          style={{
            marginTop: "28px",
            fontSize: "36px",
            fontWeight: 500,
            color: "#475569",
            lineHeight: 1.4,
          }}
        >
          和歌山県議会を、みんなのものに。
        </div>
        <div
          style={{
            marginTop: "16px",
            fontSize: "26px",
            color: "#64748b",
          }}
        >
          議会日程・予算審議・議員の活動を、やさしく可視化するポータル
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "60px",
            right: "80px",
            fontSize: "22px",
            color: "#94a3b8",
          }}
        >
          ※シビックテックのプロトタイプ（ダミーデータ）
        </div>
      </div>
    ),
    { ...size },
  );
}
