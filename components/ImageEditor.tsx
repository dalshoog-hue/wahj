"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/* ============================================================
   محرر صور المنتج: اقتصاص (سحب + تقريب + تدوير) وإزالة الخلفية
   إزالة الخلفية تعمل بالكامل داخل متصفح المستخدم (بدون خوادم)
   ============================================================ */

const VIEW = 600; // دقة كانفس العرض الداخلية
const OUT = 900;  // دقة صورة الإخراج

export default function ImageEditor({
  file,
  onDone,
  onCancel,
}: {
  file: File;
  onDone: (blob: Blob) => void;
  onCancel: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const prevSrcRef = useRef<string | null>(null); // للتراجع عن إزالة الخلفية
  const [ready, setReady] = useState(false);
  const [zoom, setZoom] = useState(1); // مضاعف فوق مقاس الملاءمة
  const [busy, setBusy] = useState<string | null>(null);
  const [bgRemoved, setBgRemoved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pos = useRef({ ox: 0, oy: 0, baseScale: 1 });
  const drag = useRef<{ x: number; y: number } | null>(null);

  /* ---------- تحميل الصورة وضبط الملاءمة ---------- */
  const loadSrc = useCallback((src: string, keepView = false) => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      if (!keepView) {
        const s = Math.max(VIEW / img.width, VIEW / img.height);
        pos.current = {
          baseScale: s,
          ox: (VIEW - img.width * s) / 2,
          oy: (VIEW - img.height * s) / 2,
        };
        setZoom(1);
      }
      setReady(true);
      draw();
    };
    img.src = src;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    loadSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file, loadSrc]);

  /* ---------- الرسم ---------- */
  const draw = useCallback(() => {
    const c = canvasRef.current, img = imgRef.current;
    if (!c || !img) return;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, VIEW, VIEW);
    const s = pos.current.baseScale * zoomRef.current;
    ctx.drawImage(img, pos.current.ox, pos.current.oy, img.width * s, img.height * s);
  }, []);

  // مرجع حي لقيمة التقريب داخل الرسم
  const zoomRef = useRef(zoom);
  useEffect(() => { zoomRef.current = zoom; draw(); }, [zoom, draw]);

  /* ---------- السحب (فأرة + لمس) ---------- */
  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const k = VIEW / rect.width;
    pos.current.ox += (e.clientX - drag.current.x) * k;
    pos.current.oy += (e.clientY - drag.current.y) * k;
    drag.current = { x: e.clientX, y: e.clientY };
    draw();
  };
  const onPointerUp = () => { drag.current = null; };

  /* ---------- التدوير 90° ---------- */
  const rotate = () => {
    const img = imgRef.current;
    if (!img) return;
    const off = document.createElement("canvas");
    off.width = img.height; off.height = img.width;
    const ctx = off.getContext("2d")!;
    ctx.translate(off.width / 2, off.height / 2);
    ctx.rotate(Math.PI / 2);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    loadSrc(off.toDataURL("image/png"));
  };

  /* ---------- إزالة الخلفية (داخل المتصفح) ---------- */
  const removeBg = async () => {
    const img = imgRef.current;
    if (!img) return;
    setError(null);
    setBusy("جارٍ إزالة الخلفية… أول استخدام يحمّل نموذج الذكاء الاصطناعي (قد يستغرق دقيقة)");
    try {
      // استيراد وقت التشغيل من CDN (يتجاوز التجميع و TypeScript عمداً)
      const cdn = "https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.7.0/+esm";
      const mod = await new Function("u", "return import(u)")(cdn);
      const removeBackground = mod.removeBackground as (b: Blob) => Promise<Blob>;
      // تصغير المصدر إلى 1200px كحد أقصى لتسريع المعالجة على الجوال
      const maxSide = 1200;
      const k = Math.min(1, maxSide / Math.max(img.width, img.height));
      const off = document.createElement("canvas");
      off.width = Math.round(img.width * k); off.height = Math.round(img.height * k);
      off.getContext("2d")!.drawImage(img, 0, 0, off.width, off.height);
      const srcBlob: Blob = await new Promise((res) => off.toBlob((b) => res(b!), "image/png"));
      const outBlob = await removeBackground(srcBlob);
      prevSrcRef.current = img.src;
      loadSrc(URL.createObjectURL(outBlob));
      setBgRemoved(true);
    } catch {
      setError("تعذرت إزالة الخلفية — تحقق من اتصالك وحاول مجدداً");
    } finally {
      setBusy(null);
    }
  };

  const undoBg = () => {
    if (!prevSrcRef.current) return;
    loadSrc(prevSrcRef.current);
    prevSrcRef.current = null;
    setBgRemoved(false);
  };

  /* ---------- تصدير الاقتصاص النهائي ---------- */
  const confirm = async () => {
    const img = imgRef.current;
    if (!img) return;
    const out = document.createElement("canvas");
    out.width = OUT; out.height = OUT;
    const ctx = out.getContext("2d")!;
    const r = OUT / VIEW;
    const s = pos.current.baseScale * zoomRef.current * r;
    ctx.drawImage(img, pos.current.ox * r, pos.current.oy * r, img.width * s, img.height * s);
    out.toBlob((b) => b && onDone(b), "image/png");
  };

  return (
    <div className="ed-overlay" role="dialog" aria-label="محرر الصورة">
      <div className="ed-modal">
        <h3>✂️ تجهيز صورة المنتج</h3>

        <div className="ed-stage"
             onPointerDown={onPointerDown}
             onPointerMove={onPointerMove}
             onPointerUp={onPointerUp}
             onPointerCancel={onPointerUp}>
          <canvas ref={canvasRef} width={VIEW} height={VIEW} />
          {busy && (
            <div className="ed-busy">
              <div className="ed-spinner" aria-hidden="true" />
              <span>{busy}</span>
            </div>
          )}
        </div>

        <div className="ed-row">
          <label>تقريب</label>
          <input type="range" min={0.5} max={3} step={0.01} value={zoom}
                 onChange={(e) => setZoom(Number(e.target.value))}
                 disabled={!ready || !!busy} aria-label="تقريب الصورة" />
          <button className="ed-btn" style={{ flex: "0 0 auto", minWidth: 0, padding: "9px 14px" }}
                  onClick={rotate} disabled={!ready || !!busy}>↻ تدوير</button>
        </div>

        {error && <p className="ed-note" style={{ color: "#F08A8A" }}>⚠️ {error}</p>}

        <div className="ed-actions">
          {bgRemoved ? (
            <button className="ed-btn" onClick={undoBg} disabled={!!busy}>↩︎ استرجاع الخلفية</button>
          ) : (
            <button className="ed-btn" onClick={removeBg} disabled={!ready || !!busy}>✨ إزالة الخلفية</button>
          )}
          <button className="ed-btn" onClick={onCancel} disabled={!!busy}>إلغاء</button>
          <button className="ed-btn primary" onClick={confirm} disabled={!ready || !!busy}>اعتماد الصورة ✓</button>
        </div>
        <p className="ed-note">اسحب الصورة لتحديد الإطار · إزالة الخلفية تتم على جهازك مباشرة (Powered by IMG.LY)</p>
      </div>
    </div>
  );
}
