"use client";

import { useState, useRef } from "react";
import FlagshipTemplate from "@/components/FlagshipTemplate";
import { THEMES, CATEGORIES, type LandingData, type ThemeId, type CategoryId } from "@/lib/schema";
import { supabase } from "@/lib/supabase";
import ImageEditor from "@/components/ImageEditor";

const GLYPHS = ["🎧", "⌚", "👟", "🧴", "🌙", "📱", "🪵", "🏆", "🖼️", "⚒️", "💍", "☕"];

const THEME_PREVIEW: Record<ThemeId, { bg: string; desc: string }> = {
  commerce: { bg: "linear-gradient(150deg,#101B36,#1B3A8C)", desc: "أزرق واثق وبرتقالي تحويل — للمتاجر والإلكترونيات" },
  luxury: { bg: "linear-gradient(150deg,#171022,#3A2A55)", desc: "داكن بلمسات ذهبية — للعطور والساعات والهدايا" },
  soft: { bg: "linear-gradient(150deg,#F1EAE0,#DCEBE2)", desc: "فاتح هادئ — للعناية والمنتجات الطبيعية" },
  wood: { bg: "repeating-linear-gradient(90deg, rgba(0,0,0,.08) 0 2px, transparent 2px 22px), linear-gradient(150deg,#4A3320,#2B1D10)", desc: "دافئ بملمس الخشب — للخشبيات والنحت والحفر بالليزر" },
  royal: { bg: "linear-gradient(150deg,#0A120F,#1B2E26)", desc: "أخضر ملكي وذهبي — للدروع والتكريم والهدايا المؤسسية" },
};

export default function GeneratorPage() {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [glyph, setGlyph] = useState("🎧");
  const [category, setCategory] = useState<CategoryId>("general");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"form" | "pick" | "preview">("form");
  const [data, setData] = useState<LandingData | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [editingFile, setEditingFile] = useState<File | null>(null);

  /* ---------- اختيار الصورة ---------- */
  const onPickImage = (f: File | null) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) { setError("الملف المختار ليس صورة"); return; }
    if (f.size > 4 * 1024 * 1024) { setError("حجم الصورة يتجاوز 4MB — اختر صورة أصغر"); return; }
    setError(null);
    setEditingFile(f); // افتح المحرر (اقتصاص + إزالة خلفية)
  };

  const onEditorDone = (blob: Blob) => {
    const f = new File([blob], "product.png", { type: "image/png" });
    setImageFile(f);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(URL.createObjectURL(f));
    setEditingFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const onEditorCancel = () => {
    setEditingFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const clearImage = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  /* ---------- رفع الصورة إلى Supabase ---------- */
  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;
    const ext = imageFile.name.split(".").pop()?.toLowerCase() || "png";
    const path = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error: upErr } = await supabase.storage.from("wahj").upload(path, imageFile, {
      cacheControl: "31536000",
      contentType: imageFile.type,
    });
    if (upErr) throw new Error("تعذر رفع الصورة — حاول مجدداً");
    return supabase.storage.from("wahj").getPublicUrl(path).data.publicUrl;
  };

  /* ---------- التوليد ---------- */
  const generate = async () => {
    if (!name.trim() || !desc.trim() || !price) {
      setError("عبّئ اسم المنتج والوصف والسعر أولاً");
      return;
    }
    setError(null);
    setLoading(true);
    setPublishedUrl(null);
    try {
      const imageUrl = await uploadImage();
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description: desc, price: Number(price), glyph: glyph || CATEGORIES[category].glyph, image: imageUrl, category }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "فشل التوليد");
      const d = json.data as LandingData;
      d.hero.image = imageUrl; // ضمان بقاء الصورة حتى لو تجاهلها النموذج
      setData(d);
      setStep("pick");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- اختيار/تبديل القالب ---------- */
  const applyTheme = (t: ThemeId) => {
    if (!data) return;
    setData({ ...data, theme: t, colors: { brand: THEMES[t].brand, cta: THEMES[t].cta } });
  };
  const pickTheme = (t: ThemeId) => { applyTheme(t); setStep("preview"); };

  const setColor = (key: "brand" | "cta", value: string) => {
    if (!data) return;
    setData({ ...data, colors: { ...data.colors, [key]: value } });
  };

  /* ---------- النشر ---------- */
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

  /* ═════════ شاشة اختيار القالب ═════════ */
  if (step === "pick" && data) {
    return (
      <div className="gen-shell">
        <header className="gen-head">
          <div className="gen-logo"><i>و</i> وَهْج</div>
          <button className="pv-btn" onClick={() => setStep("form")}>← تعديل المدخلات</button>
        </header>
        <main className="gen-body">
          <h1>اختر قالبك</h1>
          <p className="lead">ثلاثة اتجاهات بصرية لنفس المحتوى — تقدر تبدّل بينها وتعدّل الألوان بعد الاختيار.</p>
          <div className="pick-grid">
            {(Object.keys(THEMES) as ThemeId[]).map((t) => (
              <div key={t} className="pick-card" role="button" tabIndex={0}
                   onClick={() => pickTheme(t)}
                   onKeyDown={(e) => e.key === "Enter" && pickTheme(t)}>
                <div className="pick-thumb" style={{ background: THEME_PREVIEW[t].bg }}>
                  {data.hero.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={data.hero.image} alt="" style={{ maxHeight: 80, borderRadius: 10 }} />
                  ) : (
                    <span>{data.hero.glyph}</span>
                  )}
                </div>
                <b>{THEMES[t].name}</b>
                <small>{THEME_PREVIEW[t].desc}</small>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  /* ═════════ شاشة المعاينة والتخصيص ═════════ */
  if (step === "preview" && data) {
    return (
      <div>
        <div className="preview-bar">
          <span className="pv-title">معاينة: {data.brand.name}</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="pv-btn" onClick={() => setStep("pick")}>⇄ القوالب</button>
            <button className="pv-btn primary" onClick={publish} disabled={publishing}>
              {publishing ? "جارٍ النشر…" : "انشر برابط 🚀"}
            </button>
          </div>
        </div>
        <div className="custom-bar">
          <span className="cb-label">القالب:</span>
          <div className="theme-pills">
            {(Object.keys(THEMES) as ThemeId[]).map((t) => (
              <button key={t} className={data.theme === t ? "on" : ""} onClick={() => applyTheme(t)}>
                {THEMES[t].name}
              </button>
            ))}
          </div>
          <span className="color-ctl">
            اللون الأساسي
            <input type="color" value={data.colors.brand} onChange={(e) => setColor("brand", e.target.value)} aria-label="اللون الأساسي" />
          </span>
          <span className="color-ctl">
            لون الأزرار
            <input type="color" value={data.colors.cta} onChange={(e) => setColor("cta", e.target.value)} aria-label="لون الأزرار" />
          </span>
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
            <div className="publish-result" style={{ borderColor: "rgba(220,60,60,.5)", background: "rgba(220,60,60,.08)" }}>⚠️ {error}</div>
          </div>
        )}
        <FlagshipTemplate data={data} />
      </div>
    );
  }

  /* ═════════ شاشة الإدخال ═════════ */
  return (
    <div className="gen-shell">
      {editingFile && (
        <ImageEditor file={editingFile} onDone={onEditorDone} onCancel={onEditorCancel} />
      )}
      <header className="gen-head">
        <div className="gen-logo"><i>و</i> وَهْج</div>
        <span style={{ fontSize: 12, color: "#7A84A6" }}>النسخة التجريبية</span>
      </header>

      <main className="gen-body">
        <h1>صفحة هبوط تبيع فعلاً<br />في أقل من دقيقة</h1>
        <p className="lead">
          صف منتجك — أو ارفع صورته — وسيبني لك وَهْج صفحة احترافية بثلاثة قوالب
          وألوان قابلة للتخصيص، جاهزة للنشر برابط مباشر.
        </p>

        <div className="gen-form">
          <div className="gf">
            <label>صورة المنتج (اختياري)</label>
            <div className="img-drop">
              <input ref={fileRef} type="file" accept="image/*"
                     onChange={(e) => onPickImage(e.target.files?.[0] ?? null)} />
              {imagePreview ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="معاينة المنتج" />
                  <button type="button" className="id-remove" onClick={(e) => { e.stopPropagation(); clearImage(); }}>إزالة ✕</button>
                </>
              ) : (
                <span className="id-hint">📷 اختر صورة من جهازك — مع اقتصاص وإزالة خلفية (حتى 4MB)</span>
              )}
            </div>
          </div>
          <div className="gf">
            <label>فئة المنتج (تحدد أسلوب المحتوى والقالب)</label>
            <div className="theme-pills" style={{ flexWrap: "wrap" }}>
              {(Object.keys(CATEGORIES) as CategoryId[]).map((c) => (
                <button key={c} type="button" className={category === c ? "on" : ""}
                        onClick={() => { setCategory(c); setGlyph(CATEGORIES[c].glyph); }}>
                  {CATEGORIES[c].glyph} {CATEGORIES[c].name}
                </button>
              ))}
            </div>
          </div>
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
              <label>رمز المنتج (يُستخدم إذا لم ترفع صورة)</label>
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
            {loading ? (imageFile ? "رفع الصورة وبناء صفحتك…" : "الذكاء الاصطناعي يكتب صفحتك…") : "ولّد صفحة الهبوط ✨"}
          </button>
          <p className="gen-note">يعمل بوضع مجاني محلي تلقائياً إذا لم يتوفر مفتاح Gemini</p>
        </div>
      </main>
    </div>
  );
}
