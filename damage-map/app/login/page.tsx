"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (signInError) {
      setError(signInError.message);
    } else {
      setSent(true);
    }
    setBusy(false);
  }

  return (
    <div className="page-wrap" style={{ maxWidth: 460 }}>
      <h1 style={{ fontSize: 22, margin: "0 0 6px" }}>被害箇所マッピング</h1>
      <p style={{ fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.8 }}>
        登録済みのメールアドレスにログイン用リンクを送ります。パスワードは不要です。
      </p>

      {sent ? (
        <div className="panel" style={{ marginTop: 18 }}>
          <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.9 }}>
            <strong>{email}</strong> 宛にログインリンクを送りました。
            <br />
            メール内のリンクを、この端末のブラウザで開いてください。
          </p>
          <button
            type="button"
            className="btn secondary small"
            style={{ marginTop: 12 }}
            onClick={() => setSent(false)}
          >
            別のアドレスで送り直す
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="panel" style={{ marginTop: 18 }}>
          <div className="field-row">
            <label htmlFor="email">メールアドレス</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
            />
          </div>
          {error && <p className="notice error">{error}</p>}
          <button type="submit" className="btn" disabled={busy || !email.trim()}>
            {busy ? "送信中…" : "ログインリンクを送る"}
          </button>
        </form>
      )}
    </div>
  );
}
