import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { LandingData } from "@/lib/schema";

function makeSlug(): string {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  let s = "";
  for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export async function POST(req: Request) {
  let body: { data: LandingData };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "مدخلات غير صالحة" }, { status: 400 });
  }
  if (!body?.data?.hero) {
    return NextResponse.json({ error: "بيانات الصفحة ناقصة" }, { status: 400 });
  }

  const slug = makeSlug();
  const { error } = await supabase.from("wahj_pages").insert({ slug, data: body.data });
  if (error) {
    return NextResponse.json({ error: "تعذر الحفظ — تأكد من إعداد Supabase" }, { status: 500 });
  }
  return NextResponse.json({ slug });
}
