import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import FlagshipTemplate from "@/components/FlagshipTemplate";
import type { LandingData } from "@/lib/schema";
import type { Metadata } from "next";

export const revalidate = 60;

async function getPage(slug: string) {
  const { data, error } = await supabase
    .from("wahj_pages")
    .select("data")
    .eq("slug", slug)
    .single();
  if (error || !data) return null;
  return data.data as LandingData;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const page = await getPage(params.slug);
  if (!page) return { title: "الصفحة غير موجودة" };
  return {
    title: `${page.brand.name} — ${page.hero.title} ${page.hero.highlight}`,
    description: page.hero.sub,
  };
}

export default async function PublishedPage({ params }: { params: { slug: string } }) {
  const page = await getPage(params.slug);
  if (!page) notFound();
  return <FlagshipTemplate data={page} />;
}
