"use client";

import React, { useState, useEffect, useRef } from "react";
import type { LandingData } from "@/lib/schema";

/* ---------- أدوات الحركة ---------- */
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setIn] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setIn(true)),
      { threshold: 0.12 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={`rv${inView ? " in" : ""}`} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

function Counter({ to, suffix = "", dur = 1400 }: { to: number; suffix?: string; dur?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          if (dur === 0 || !Number.isInteger(to)) { setVal(to); return; }
          const t0 = performance.now();
          const tick = (t: number) => {
            const k = Math.min(1, (t - t0) / dur);
            setVal(Math.round(to * (1 - Math.pow(1 - k, 3))));
            if (k < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      });
    }, { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to, dur]);
  return <span ref={ref} className="num">{val.toLocaleString("en-US")}{suffix}</span>;
}

function useCountdown() {
  const [s, setS] = useState(5 * 3600 + 42 * 60 + 18);
  useEffect(() => {
    const id = setInterval(() => setS((v) => (v > 0 ? v - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);
  return {
    h: String(Math.floor(s / 3600)).padStart(2, "0"),
    m: String(Math.floor((s % 3600) / 60)).padStart(2, "0"),
    sec: String(s % 60).padStart(2, "0"),
  };
}

const Ic = ({ d, color = "currentColor" }: { d: string; color?: string }) => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2"
       strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);
const IC = {
  truck: "M1 8h13v8H1zM14 11h4l3 3v2h-7zM5.5 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM17.5 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3z",
  shield: "M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z",
  refresh: "M21 12a9 9 0 11-2.6-6.4M21 3v6h-6",
  lock: "M5 11h14v10H5zM8 11V7a4 4 0 018 0v4",
};

/* ============================================================
   القالب الرئيسي — كل المحتوى من data
   ============================================================ */
export default function FlagshipTemplate({ data }: { data: LandingData }) {
  const [bundle, setBundle] = useState(data.bundles.find((b) => b.popular)?.id ?? data.bundles[0]?.id ?? 1);
  const [openFaq, setOpenFaq] = useState(0);
  const [showBar, setShowBar] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const { h, m, sec } = useCountdown();

  useEffect(() => {
    const obs = new IntersectionObserver(
      (es) => es.forEach((e) => setShowBar(!e.isIntersecting)),
      { threshold: 0 }
    );
    if (heroRef.current) obs.observe(heroRef.current);
    return () => obs.disconnect();
  }, []);

  const chosen = data.bundles.find((b) => b.id === bundle) ?? data.bundles[0];
  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="lp" lang="ar-u-nu-latn"
         style={{ ["--brand" as string]: data.colors.brand, ["--cta" as string]: data.colors.cta }}>

      <div className="announce">{data.announce}</div>

      <nav className="nav">
        <div className="wrap nav-in">
          <div className="brand"><span className="brand-mark">{data.brand.initial}</span> {data.brand.name}</div>
          <div className="nav-links">
            <a onClick={() => go("features")}>المميزات</a>
            <a onClick={() => go("reviews")}>آراء العملاء</a>
            <a onClick={() => go("offer")}>العروض</a>
            <a onClick={() => go("faq")}>الأسئلة الشائعة</a>
          </div>
          <button className="btn btn-nav" onClick={() => go("offer")}>اطلب الآن</button>
        </div>
      </nav>

      {/* ═══ البطل ═══ */}
      <header className="hero" ref={heroRef}>
        <div className="wrap hero-grid">
          <div>
            <span className="pill">● {data.hero.availability}</span>
            <h1>{data.hero.title} <span className="hl">{data.hero.highlight}</span></h1>
            <p className="hero-sub">{data.hero.sub}</p>
            <div className="rating-row">
              <div className="avatars" aria-hidden="true">
                {["#7C5CD9", "#2E86C1", "#0E9F6E", "#D14E03"].map((c, i) => (
                  <i key={i} style={{ background: c }}>{["ن", "م", "س", "خ"][i]}</i>
                ))}
              </div>
              <span className="stars" aria-hidden="true">★★★★★</span>
              <small><b className="num">4.9</b> من أكثر من <b className="num">{data.hero.ratingCount}</b> تقييم موثّق</small>
            </div>
            <div className="hero-ctas">
              <button className="btn btn-cta" onClick={() => go("offer")}>
                اطلبه الآن — <span className="num">{chosen.price} ر.س</span>
              </button>
              <button className="btn btn-ghost" onClick={() => go("features")}>اكتشف المميزات</button>
            </div>
            <div className="trust-row">
              <span><Ic d={IC.truck} color="#0E9F6E" /> شحن مجاني وسريع</span>
              <span><Ic d={IC.refresh} color="#0E9F6E" /> إرجاع خلال <b className="num">30</b> يوماً</span>
              <span><Ic d={IC.shield} color="#0E9F6E" /> ضمان سنتان</span>
              <span><Ic d={IC.lock} color="#0E9F6E" /> دفع آمن <span className="num">100%</span></span>
            </div>
          </div>

          <div className="stage">
            <div className="stage-card">
              <span className="stage-badge">{data.hero.badge}</span>
              <div className="stage-glyph" aria-hidden="true">{data.hero.glyph}</div>
              <div className="stage-name">{data.hero.productName}</div>
              <div className="stage-tag">{data.hero.productTag}</div>
            </div>
            {data.chips[0] && (
              <div className="chip" style={{ top: "16%", right: "-26px" }}>
                <span className="c-ic" style={{ background: "#EEF1FF" }}>{data.chips[0].icon}</span>
                <span><b className="num">{data.chips[0].value}</b><small>{data.chips[0].label}</small></span>
              </div>
            )}
            {data.chips[1] && (
              <div className="chip" style={{ bottom: "22%", left: "-24px", animationDelay: "-2.2s" }}>
                <span className="c-ic" style={{ background: "#E7F7F0" }}>{data.chips[1].icon}</span>
                <span><b className="num">{data.chips[1].value}</b><small>{data.chips[1].label}</small></span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ═══ شريط الصحافة ═══ */}
      <div className="press">
        <div className="press-label">ظهرت في</div>
        <div className="press-track" aria-hidden="true">
          <div className="press-inner">
            {[0, 1].map((k) => (
              <React.Fragment key={k}>
                {data.press.map((p, i) => <span key={i}>{p}</span>)}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ الإحصائيات ═══ */}
      <section className="stats">
        <div className="wrap stats-grid">
          {data.stats.map((s, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className="stat">
                <div className="v"><Counter to={s.value} suffix={s.suffix} dur={Number.isInteger(s.value) ? 1400 : 0} /></div>
                <p>{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══ المميزات ═══ */}
      <section className="features" id="features">
        <div className="wrap">
          <Reveal>
            <div className="sec-head">
              <div className="sec-eyebrow">لماذا {data.brand.name}؟</div>
              <h2>مصمم ليكون آخر ما تشتريه في فئته</h2>
            </div>
          </Reveal>
          {data.features.map((f, i) => (
            <div className={`frow${i % 2 === 1 ? " flip" : ""}`} key={i}>
              <Reveal>
                <div className="fvis" style={{ background: f.tint }}>
                  <span className="big-ic" aria-hidden="true">{f.icon}</span>
                  <div className="meter"><span>{f.meterLabel}</span><b>{f.meterValue}</b></div>
                </div>
              </Reveal>
              <Reveal delay={120}>
                <div className="ftxt">
                  <span className="fk">{f.kicker}</span>
                  <h3>{f.title}</h3>
                  <p>{f.body}</p>
                  <ul>{f.bullets.map((b, j) => <li key={j}>{b}</li>)}</ul>
                </div>
              </Reveal>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ الشهادات ═══ */}
      <section className="reviews" id="reviews">
        <div className="wrap">
          <Reveal>
            <div className="sec-head">
              <div className="sec-eyebrow">آراء العملاء</div>
              <h2>عملاؤنا لا يمكن أن يكونوا مخطئين</h2>
            </div>
          </Reveal>
          <div className="rgrid">
            {data.reviews.map((r, i) => (
              <Reveal key={i} delay={i * 130}>
                <div className="rcard">
                  <span className="stars" aria-hidden="true">★★★★★</span>
                  <p>«{r.text}»</p>
                  <div className="rwho">
                    <i style={{ background: r.color }}>{r.name[0]}</i>
                    <span><b>{r.name}</b><small>✓ عملية شراء موثّقة · {r.when}</small></span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ الباقات ═══ */}
      <section className="offer" id="offer">
        <div className="wrap">
          <Reveal>
            <div className="offer-box">
              <div className="offer-head">
                <h2>اختر باقتك ووفّر أكثر</h2>
                <p>عرض الإطلاق ينتهي خلال:</p>
                <div className="timer" aria-label="عد تنازلي">
                  <b className="num">{h}<small>ساعة</small></b>
                  <b className="num">{m}<small>دقيقة</small></b>
                  <b className="num">{sec}<small>ثانية</small></b>
                </div>
              </div>
              <div className="bundles">
                {data.bundles.map((b) => (
                  <div key={b.id} className={`bundle${bundle === b.id ? " on" : ""}`}
                       role="radio" aria-checked={bundle === b.id} tabIndex={0}
                       onClick={() => setBundle(b.id)}
                       onKeyDown={(e) => e.key === "Enter" && setBundle(b.id)}>
                    {b.popular && <span className="tag-pop">الأكثر طلباً</span>}
                    <h4>{b.title}</h4>
                    <div className="bp num">{b.price} ر.س<span className="old num">{b.old}</span></div>
                    <span className="save">{b.save}</span>
                    <p>{b.note}</p>
                  </div>
                ))}
              </div>
              <div className="offer-cta">
                <button className="btn btn-cta" style={{ fontSize: 16, padding: "16px 46px" }}>
                  أكمل الطلب — <span className="num">{chosen.price} ر.س</span>
                </button>
                <div className="offer-note">
                  <span>🔒 دفع آمن ومشفّر</span>
                  <span>💳 {data.payMethods.join(" · ")}</span>
                  <span>📦 الدفع عند الاستلام متاح</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ الأسئلة ═══ */}
      <section id="faq">
        <div className="wrap faq">
          <Reveal>
            <div className="sec-head" style={{ marginBottom: 26 }}>
              <div className="sec-eyebrow">عندك سؤال؟</div>
              <h2>الأسئلة الشائعة</h2>
            </div>
          </Reveal>
          {data.faqs.map((f, i) => (
            <Reveal key={i} delay={i * 60}>
              <div className={`faq-item${openFaq === i ? " open" : ""}`}>
                <button className="faq-q" aria-expanded={openFaq === i}
                        onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                  {f.q} <span className="pm" aria-hidden="true">+</span>
                </button>
                <div className="faq-a" style={{ maxHeight: openFaq === i ? 220 : 0 }}>
                  <p>{f.a}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══ الضمان ═══ */}
      <section className="guarantee">
        <div className="wrap">
          <Reveal>
            <div className="g-shield" aria-hidden="true">🛡️</div>
            <h2>{data.guarantee.title}</h2>
            <p>{data.guarantee.body}</p>
            <div style={{ marginTop: 26 }}>
              <button className="btn btn-cta" onClick={() => go("offer")}>اطلبه الآن بدون مخاطرة</button>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="foot">
        <div className="wrap foot-in">
          <div className="brand" style={{ fontSize: 16 }}>
            <span className="brand-mark" style={{ width: 26, height: 26, fontSize: 13 }}>{data.brand.initial}</span> {data.brand.name}
          </div>
          <div className="pay-icons" aria-hidden="true">
            {data.payMethods.map((p, i) => <span key={i}>{p}</span>)}
          </div>
          <small>© <span className="num">2026</span> {data.brand.name} — صُممت بواسطة وَهْج</small>
        </div>
      </footer>

      {/* ═══ شريط الشراء الثابت ═══ */}
      {showBar && (
        <div className="buybar">
          <div className="bb-info">
            <b>{data.brand.name} — {chosen.title}</b>
            <span><span className="bb-price num">{chosen.price} ر.س</span> <s className="num" style={{ color: "#A6AFC4" }}>{chosen.old}</s> · شحن مجاني</span>
          </div>
          <button className="btn btn-cta" style={{ padding: "12px 26px", fontSize: 14 }} onClick={() => go("offer")}>اطلب الآن</button>
        </div>
      )}
    </div>
  );
}
