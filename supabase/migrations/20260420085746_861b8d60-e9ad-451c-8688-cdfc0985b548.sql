-- Roles enum + table
create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create policy "users read own roles" on public.user_roles for select
  to authenticated using (user_id = auth.uid());
create policy "admins manage roles" on public.user_roles for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Products
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10,2) not null default 0,
  category text not null default 'Accessories',
  image_url text,
  stock int not null default 0,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.products enable row level security;
create policy "products public read" on public.products for select using (true);
create policy "admins manage products" on public.products for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Services
create table public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  price text,
  icon text,
  image_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.services enable row level security;
create policy "services public read" on public.services for select using (true);
create policy "admins manage services" on public.services for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Gallery
create table public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  title text,
  media_url text not null,
  media_type text not null check (media_type in ('image','video')),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.gallery_items enable row level security;
create policy "gallery public read" on public.gallery_items for select using (true);
create policy "admins manage gallery" on public.gallery_items for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Testimonials
create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  message text not null,
  rating int check (rating between 1 and 5),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);
alter table public.testimonials enable row level security;

create policy "anyone submit testimonial" on public.testimonials for insert
  to anon, authenticated with check (status = 'pending');
create policy "public read approved testimonials" on public.testimonials for select
  using (status = 'approved');
create policy "admins read all testimonials" on public.testimonials for select
  to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "admins update testimonials" on public.testimonials for update
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));
create policy "admins delete testimonials" on public.testimonials for delete
  to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Storage bucket
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "media public read" on storage.objects for select
  using (bucket_id = 'media');
create policy "admins upload media" on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media' and public.has_role(auth.uid(), 'admin'));
create policy "admins update media" on storage.objects for update
  to authenticated
  using (bucket_id = 'media' and public.has_role(auth.uid(), 'admin'));
create policy "admins delete media" on storage.objects for delete
  to authenticated
  using (bucket_id = 'media' and public.has_role(auth.uid(), 'admin'));