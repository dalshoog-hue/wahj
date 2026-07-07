-- وَهْج: مخطط قاعدة البيانات (النسخة الأولى — بدون مصادقة)
-- شغّل هذا في SQL Editor داخل مشروع Supabase

create table if not exists public.wahj_pages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  data jsonb not null,
  views integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists wahj_pages_slug_idx on public.wahj_pages (slug);

-- RLS: قراءة عامة، إدراج عبر anon (مؤقتاً للنسخة الأولى؛ لاحقاً يقيَّد بالمصادقة)
alter table public.wahj_pages enable row level security;

create policy "public read pages"
  on public.wahj_pages for select using (true);

create policy "anon insert pages"
  on public.wahj_pages for insert with check (true);
