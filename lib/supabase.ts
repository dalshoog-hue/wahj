import { createClient } from "@supabase/supabase-js";

// متغيرات البيئة تتغلب على هذه القيم إن وُجدت.
// مفتاح anon عام بطبيعته (يُرسل للمتصفح دائماً) والحماية عبر سياسات RLS.
const FALLBACK_URL = "https://rwlcvnpqpooiyzbvvegn.supabase.co";
const FALLBACK_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3bGN2bnBxcG9vaXl6YnZ2ZWduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3MTExNTgsImV4cCI6MjA5ODI4NzE1OH0.fOxUZjMNSySL7rTMyqjQBgZ8ye38YgQx9F_ZVpKVkpI";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_ANON;

export const supabase = createClient(url, anon);
