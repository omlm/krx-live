# KRX LIVE

En minimalistisk webapp for å holde oversikt over konserter du skal på eller er interessert i.

## 🚀 Kom i gang

### 1. Installer avhengigheter

```bash
npm install
```

### 2. Sett opp Supabase (valgfritt - appen kjører med mock data)

1. Gå til [supabase.com](https://supabase.com) og opprett et nytt prosjekt
2. Gå til SQL Editor i Supabase dashboard
3. Kjør SQL-skriptet fra `supabase-schema.sql` (se under)
4. Kopier `.env.example` til `.env`
5. Fyll inn dine Supabase credentials i `.env`:
   - `VITE_SUPABASE_URL`: Finn under Project Settings → API
   - `VITE_SUPABASE_ANON_KEY`: Finn under Project Settings → API

### 3. Start utviklingsserver

```bash
npm run dev
```

Appen kjører nå på [http://localhost:3000](http://localhost:3000)

## 📦 Bygg for produksjon

```bash
npm run build
npm run preview
```

## 🗄️ Database Schema

Kjør dette SQL-skriptet i Supabase SQL Editor:

```sql
-- Opprett concerts tabell
create table concerts (
  id uuid default gen_random_uuid() primary key,
  artist_name text not null,
  venue text not null,
  date date not null,
  time text not null,
  image_url text,
  description text,
  organizer text not null,
  genre text,
  status text not null check (status in ('going', 'interested')),
  original_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Aktiver Row Level Security
alter table concerts enable row level security;

-- Tillat alle å lese (kan endres til å kreve autentisering senere)
create policy "Alle kan lese konserter"
  on concerts for select
  using (true);

-- Tillat alle å sette inn (kan endres til å kreve autentisering senere)
create policy "Alle kan legge til konserter"
  on concerts for insert
  with check (true);

-- Tillat alle å oppdatere (kan endres til å kreve autentisering senere)
create policy "Alle kan oppdatere konserter"
  on concerts for update
  using (true);

-- Tillat alle å slette (kan endres til å kreve autentisering senere)
create policy "Alle kan slette konserter"
  on concerts for delete
  using (true);

-- Opprett indeks for raskere søk
create index concerts_date_idx on concerts (date);
create index concerts_status_idx on concerts (status);
```

## 🛠️ Teknologi

- **Frontend:** React + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Hosting:** Kan deployes til Vercel, Netlify, eller Supabase

## 📱 Features

- ✅ Mobil-først design
- ✅ To kategorier: "Skal gå på" og "Kanskje gå på"
- ✅ Automatisk gruppering etter dato (I kveld, I morgen, datoer)
- ✅ Minimalistisk design inspirert av krslive.no
- ⏳ Admin panel (kommer)
- ⏳ Automatisk data-henting fra konsertsider (kommer)

## 📝 Notater

- Appen kjører med mock data som standard
- For å bruke ekte database, sett opp Supabase og fjern kommentarer i `src/App.tsx`
- Design er optimalisert for mobil, men fungerer også på desktop

## 🔮 Fremtidige features

- Admin panel for å legge til/redigere konserter
- URL-parser som automatisk henter konsertinformasjon
- Filtering på sjanger, sted, arrangør
- Søkefunksjon
- Kalendervisning
- Eksport til Google Calendar/iCal
- Push notifications for konserter som nærmer seg
