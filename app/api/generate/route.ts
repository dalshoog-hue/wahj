import { NextResponse } from "next/server";
import { buildPrompt, generateLocal, type LandingData, type CategoryId } from "@/lib/schema";

export const maxDuration = 30;

interface GenInput { name: string; description: string; price: number; glyph: string; image?: string | null; category?: CategoryId; whatsapp?: string | null }

export async function POST(req: Request) {
  let input: GenInput;
  try {
    input = await req.json();
  } catch {
    return NextResponse.json({ error: "مدخلات غير صالحة" }, { status: 400 });
  }
  if (!input?.name || !input?.description || !input?.price) {
    return NextResponse.json({ error: "الاسم والوصف والسعر مطلوبة" }, { status: 400 });
  }

  const key = process.env.GEMINI_API_KEY;

  // الوضع المحلي المجاني (بدون مفتاح)
  if (!key) {
    return NextResponse.json({ data: generateLocal(input), mode: "local" });
  }

  // وضع Gemini
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: buildPrompt(input) }] }],
          generationConfig: { temperature: 0.8, responseMimeType: "application/json" },
        }),
      }
    );
    if (!res.ok) throw new Error(`Gemini ${res.status}`);
    const out = await res.json();
    const text: string = out?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const clean = text.replace(/```json|```/g, "").trim();
    const data = JSON.parse(clean) as LandingData;

    // تحقق أساسي من البنية، وإلا نعود للوضع المحلي
    if (!data?.hero?.title || !Array.isArray(data?.features) || !Array.isArray(data?.bundles)) {
      throw new Error("بنية غير مكتملة");
    }
    return NextResponse.json({ data, mode: "gemini" });
  } catch {
    // أي فشل → الوضع المحلي بدل رسالة خطأ للمستخدم
    return NextResponse.json({ data: generateLocal(input), mode: "local-fallback" });
  }
}
