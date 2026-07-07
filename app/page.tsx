"use client";

import { useState } from "react";
import FlagshipTemplate from "@/components/FlagshipTemplate";
import type { LandingData } from "@/lib/schema";

const GLYPHS = ["🎧", "⌚", "👟", "🧴", "🌙", "📱", "🕶️", "💍", "🧥", "🏋️", "☕", "🍯"];

export default function GeneratorPage() {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [glyph, setGlyph] = useState("🎧");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<LandingData | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    if (!name.trim() || !desc.trim() || !price) {
      setError("عبّئ اسم المنتج والوصف والسعر أولاً");
      return;
    }
    setError(null);
    setLoading(true);
    setPublishedUrl(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description: desc, price: Number(price), glyph }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "فشل التوليد");
      setData(json.data as LandingData);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  const publish = async () => {
    if (!data) return;
    setPublishing(true);
    setError(null);
    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "فشل النشر");
      setPublishedUrl(`${window.location.origin}/p/${json.slug}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "حدث خطأ أثناء النشر");
    } finally {
      setPublishing(false);
    }
  };

  /* ---------- وضع المعاينة ---------- */
  if (data) {
    return (
      <div>
        <div className="preview-bar">
          <span className="pv-title">معاينة: {data.brand.name}</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="pv-btn" onClick={() => setData(null)}>← تعديل المدخلات</button>
            <button className="pv-btn primary" onClick={publish} disabled={publishing}>
              {publishing ? "جارٍ النشر…" : "انشر برابط 🚀"}
            </button>
          </div>
        </div>
        {publishedUrl && (
          <div className="wrap" style={{ paddingTop: 14 }}>
            <div className="publish-result">
              ✅ صفحتك أصبحت حية:{" "}
              <a href={publishedUrl} target="_blank" rel="noreferrer">{publishedUrl}</a>
            </div>
          </div>
        )}
        {error && (
          <div className="wrap" style={{ paddingTop: 14 }}>
            <div className="publish-result" style={{ borderColor: "rgba(220,60,60,.5)", background: "rgba(220,60,60,.08)" }}>
              ⚠️ {error}
            </div>
          </div>
        )}
        <FlagshipTemplate data={data} />
      </div>
    );
  }

  /* ---------- وضع الإدخال ---------- */
  return (
    <div className="gen-shell">
      <header className="gen-head">
        <div className="gen-logo"><i>و</i> وَهْج</div>
        <span style={{ fontSize: 12, color: "#7A84A6" }}>النسخة التجريبية</span>
      </header>

      <main className="gen-body">
        <h1>صفحة هبوط تبيع فعلاً<br />في أقل من دقيقة</h1>
        <p className="lead">
          صف منتجك وسيكتب الذكاء الاصطناعي المحتوى التسويقي كاملاً ويبني لك
          صفحة احترافية بأنيميشن — جاهزة للنشر برابط مباشر.
        </p>

        <div className="gen-form">
          <div className="gf">
            <label>اسم المنتج</label>
            <input value={name} onChange={(e) => setName(e.target.value)}
                   placeholder="مثال: سماعات موجة برو" />
          </div>
          <div className="gf">
            <label>وصف المنتج (كلما زادت التفاصيل، تحسّن المحتوى)</label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)}
                      placeholder="مثال: سماعات لاسلكية بعزل ضوضاء نشط، بطارية 36 ساعة، مناسبة للعمل والسفر…" />
          </div>
          <div className="gf-row">
            <div className="gf">
              <label>السعر (ر.س)</label>
              <input value={price} onChange={(e) => setPrice(e.target.value.replace(/[^\d.]/g, ""))}
                     inputMode="decimal" placeholder="499" />
            </div>
            <div className="gf">
              <label>رمز المنتج</label>
              <div className="glyph-picker">
                {GLYPHS.map((g) => (
                  <button key={g} type="button" className={glyph === g ? "on" : ""}
                          onClick={() => setGlyph(g)}>{g}</button>
                ))}
              </div>
            </div>
          </div>

          {error && <div className="publish-result" style={{ borderColor: "rgba(220,60,60,.5)", background: "rgba(220,60,60,.08)", marginTop: 0 }}>⚠️ {error}</div>}

          <button className="gen-submit" onClick={generate} disabled={loading}>
            {loading ? "الذكاء الاصطناعي يكتب صفحتك…" : "ولّد صفحة الهبوط ✨"}
          </button>
          <p className="gen-note">يعمل بوضع مجاني محلي تلقائياً إذا لم يتوفر مفتاح Gemini</p>
        </div>
      </main>
    </div>
  );
}
