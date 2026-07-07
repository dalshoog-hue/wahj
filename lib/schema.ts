/* ============================================================
   مخطط بيانات صفحة الهبوط — كل ما يعرضه القالب يأتي من هنا
   ============================================================ */

export type ThemeId = "commerce" | "luxury" | "soft";

export interface LandingData {
  theme: ThemeId;
  colors: { brand: string; cta: string };
  brand: { name: string; initial: string };
  announce: string;
  hero: {
    availability: string;
    title: string;      // الجزء الأول من العنوان
    highlight: string;  // الجزء المميز بلون العلامة
    sub: string;
    glyph: string;      // رمز/إيموجي المنتج لمنصّة العرض
    image?: string | null; // رابط صورة المنتج المرفوعة (تحل محل الرمز)
    productName: string;
    productTag: string;
    badge: string;      // مثل: خصم 29%
    price: number;
    ratingCount: string;
  };
  chips: { icon: string; value: string; label: string }[]; // شريحتان عائمتان
  press: string[];
  stats: { value: number; suffix: string; label: string }[];
  features: {
    kicker: string;
    title: string;
    body: string;
    bullets: string[];
    icon: string;
    tint: string; // تدرج خلفية الجانب المرئي
    meterLabel: string;
    meterValue: string;
  }[];
  reviews: { name: string; color: string; text: string; when: string }[];
  bundles: { id: number; title: string; price: number; old: number; save: string; note: string; popular?: boolean }[];
  faqs: { q: string; a: string }[];
  guarantee: { title: string; body: string };
  payMethods: string[];
}

/* ---------- بيانات افتراضية (منتج تجريبي) ---------- */
export const THEMES: Record<ThemeId, { name: string; brand: string; cta: string }> = {
  commerce: { name: "تجاري", brand: "#1B3A8C", cta: "#F2600C" },
  luxury: { name: "فاخر", brand: "#D4A855", cta: "#C9903B" },
  soft: { name: "ناعم", brand: "#3E6B54", cta: "#5F8471" },
};

export const DEFAULT_DATA: LandingData = {
  theme: "commerce",
  colors: { brand: "#1B3A8C", cta: "#F2600C" },
  brand: { name: "موجة برو", initial: "م" },
  announce: "🔥 عرض الإطلاق: خصم يصل إلى 40% + شحن مجاني — لفترة محدودة",
  hero: {
    availability: "متوفر — يُشحن خلال 24 ساعة",
    title: "اسمع التفاصيل التي",
    highlight: "لم تسمعها من قبل",
    sub: "سماعات موجة برو اللاسلكية بعزل ضوضاء نشط 42dB وبطارية تدوم 36 ساعة — صوت استوديو حقيقي، وراحة تنسيك أنك ترتديها.",
    glyph: "🎧",
    image: null,
    productName: "موجة برو — إصدار 2026",
    productTag: "أسود منتصف الليل · لاسلكية بالكامل",
    badge: "خصم 29%",
    price: 499,
    ratingCount: "2,300",
  },
  chips: [
    { icon: "🔇", value: "42dB", label: "عزل ضوضاء نشط" },
    { icon: "🔋", value: "36 ساعة", label: "عمر البطارية" },
  ],
  press: ["عالم التقنية", "أراجيك", "التقنية بلا حدود", "سعودي جيمر", "نيوتك", "عرب هاردوير"],
  stats: [
    { value: 38000, suffix: "+", label: "عميل سعيد" },
    { value: 4.9, suffix: "★", label: "متوسط التقييم" },
    { value: 97, suffix: "%", label: "يوصون بها لأصدقائهم" },
    { value: 24, suffix: " ساعة", label: "متوسط زمن التوصيل" },
  ],
  features: [
    {
      kicker: "عزل الضوضاء النشط",
      title: "صمتٌ تام… بضغطة زر واحدة",
      body: "خوارزمية ANC هجينة بست مايكروفونات ترصد الضجيج وتلغيه قبل أن يصل أذنك — من هدير الطائرة إلى ضجيج المكتب المفتوح.",
      bullets: ["وضع الشفافية لسماع المحيط دون خلع السماعة", "ضبط تلقائي حسب البيئة من حولك", "عزل سلبي إضافي بوسائد ميموري فوم"],
      icon: "🔇", tint: "linear-gradient(150deg,#EEF1FF,#DCE4FF)",
      meterLabel: "مستوى الضجيج المحيط", meterValue: "−42dB ملغى",
    },
    {
      kicker: "بطارية أسبوع كامل",
      title: "36 ساعة تشغيل متواصل",
      body: "انسَ قلق الشحن اليومي. بطارية تكفي أسبوع عمل كاملاً، وعند الحاجة: عشر دقائق بالشاحن السريع تعطيك خمس ساعات إضافية.",
      bullets: ["شحن USB-C سريع + شحن لاسلكي Qi", "إيقاف تلقائي ذكي عند خلع السماعة", "عمر بطارية مضمون ضمن الضمان لسنتين"],
      icon: "🔋", tint: "linear-gradient(150deg,#E7F7F0,#D2F0E2)",
      meterLabel: "شحن 10 دقائق", meterValue: "= 5 ساعات تشغيل",
    },
    {
      kicker: "مكالمات نقية",
      title: "صوتك واضح… حتى وسط الزحام",
      body: "ست مايكروفونات مع خوارزمية عزل الصوت البشري تجعل مكالماتك واجتماعاتك نقية تماماً، أينما كنت.",
      bullets: ["اتصال بجهازين معاً مع تبديل تلقائي (Multipoint)", "بلوتوث 5.4 بمدى يصل إلى 15 متراً", "تطبيق عربي كامل للتحكم بالمعادل الصوتي"],
      icon: "🎙️", tint: "linear-gradient(150deg,#FFF1E7,#FFE3CC)",
      meterLabel: "وضوح المكالمات", meterValue: "6 مايكروفونات ذكية",
    },
  ],
  reviews: [
    { name: "نورة الحربي", color: "#7C5CD9", text: "انتقلت لها من سماعة عالمية بضعف السعر — عزل الضوضاء أقوى والراحة على الأذن ممتازة حتى بعد 6 ساعات عمل متواصل.", when: "قبل 3 أيام" },
    { name: "محمد القحطاني", color: "#2E86C1", text: "أهم شيء عندي المكالمات، وفعلاً المايكات تعزل صوت الشارع بالكامل. الطرف الثاني ما يحس إني خارج المكتب.", when: "قبل أسبوع" },
    { name: "سارة العنزي", color: "#0E9F6E", text: "البطارية خرافية — أشحنها مرة بالأسبوع مع استخدام يومي. والتغليف يعطيك إحساس منتج فاخر فعلاً.", when: "قبل أسبوعين" },
  ],
  bundles: [
    { id: 1, title: "قطعة واحدة", price: 499, old: 699, save: "وفّر 200 ر.س", note: "شحن مجاني" },
    { id: 2, title: "قطعتان", price: 899, old: 1398, save: "وفّر 499 ر.س", note: "الأكثر طلباً — مثالية كهدية", popular: true },
    { id: 3, title: "3 قطع", price: 1249, old: 2097, save: "وفّر 848 ر.س", note: "أفضل قيمة للعائلة" },
  ],
  faqs: [
    { q: "كم تستغرق مدة الشحن؟", a: "التوصيل خلال 24–48 ساعة لجميع مدن المملكة عبر شركاء الشحن المعتمدين، مع رقم تتبع يصلك فور تجهيز الطلب." },
    { q: "ماذا يشمل الضمان؟", a: "ضمان سنتان شامل ضد عيوب التصنيع. الاستبدال خلال 7 أيام عمل دون أي رسوم." },
    { q: "هل يمكنني الإرجاع إذا لم يعجبني؟", a: "لديك 30 يوماً كاملة للتجربة. إذا لم تكن راضياً لأي سبب، نسترد المبلغ كاملاً." },
    { q: "هل الدفع عند الاستلام متاح؟", a: "نعم، متاح لجميع المدن. كما نقبل مدى وApple Pay وتقسيط تابي وتمارا بدون فوائد." },
  ],
  guarantee: {
    title: "جرّبها 30 يوماً بلا أي مخاطرة",
    body: "إذا لم يكن المنتج أفضل ما جربته في فئته، أعده لنا — حتى مستعملاً — ونسترد لك المبلغ كاملاً دون أسئلة. نحن على هذه الدرجة من الثقة.",
  },
  payMethods: ["مدى", "VISA", "Apple Pay", "تابي", "تمارا"],
};

/* ---------- المولّد المحلي (بدون AI) ----------
   يُستخدم كوضع مجاني/احتياطي عند غياب مفتاح Gemini */
export function generateLocal(input: { name: string; description: string; price: number; glyph: string; image?: string | null }): LandingData {
  const d = structuredClone(DEFAULT_DATA);
  const { name, description, price, glyph } = input;
  d.brand.name = name;
  d.brand.initial = name.trim().charAt(0) || "م";
  d.hero.title = `اكتشف ${name}`;
  d.hero.highlight = "بتجربة لن تنساها";
  d.hero.sub = description;
  d.hero.glyph = glyph || "✨";
  d.hero.image = input.image || null;
  d.hero.productName = name;
  d.hero.productTag = "الإصدار الأحدث";
  d.hero.price = price;
  d.announce = `🔥 عرض الإطلاق على ${name}: خصم خاص + شحن مجاني — لفترة محدودة`;
  d.bundles = [
    { id: 1, title: "قطعة واحدة", price, old: Math.round(price * 1.4), save: `وفّر ${Math.round(price * 0.4)} ر.س`, note: "شحن مجاني" },
    { id: 2, title: "قطعتان", price: Math.round(price * 1.8), old: price * 2 + Math.round(price * 0.8), save: "الخصم الأكبر", note: "الأكثر طلباً — مثالية كهدية", popular: true },
    { id: 3, title: "3 قطع", price: Math.round(price * 2.5), old: price * 3, save: "أفضل قيمة", note: "للعائلة أو الفريق" },
  ];
  d.guarantee.body = d.guarantee.body;
  return d;
}

/* ---------- مطالبة Gemini ---------- */
export function buildPrompt(input: { name: string; description: string; price: number; glyph: string; image?: string | null }): string {
  return `أنت خبير كتابة إعلانية عربي (Copywriter) متخصص في صفحات الهبوط عالية التحويل.
المنتج: ${input.name}
الوصف: ${input.description}
السعر: ${input.price} ر.س
الرمز: ${input.glyph}

أنشئ محتوى صفحة هبوط كاملاً وأعد JSON فقط — بدون أي نص قبله أو بعده وبدون Markdown — مطابقاً تماماً لهذا الشكل (غيّر القيم النصية لتناسب المنتج، أبقِ البنية والمفاتيح كما هي، الأسعار أرقام):
${JSON.stringify(generateLocal(input))}
قواعد: لهجة عربية فصيحة تسويقية مقنعة، أرقام لاتينية، 3 مميزات و3 مراجعات واقعية بأسماء عربية و4 أسئلة شائعة، ألوان hex مناسبة لطبيعة المنتج في colors.`;
}
