-- KRX LIVE Database Schema for Supabase
-- Kjør dette skriptet i Supabase SQL Editor

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

-- Policies (tillater alle for nå, kan begrenses senere med autentisering)
create policy "Alle kan lese konserter"
  on concerts for select
  using (true);

create policy "Alle kan legge til konserter"
  on concerts for insert
  with check (true);

create policy "Alle kan oppdatere konserter"
  on concerts for update
  using (true);

create policy "Alle kan slette konserter"
  on concerts for delete
  using (true);

-- Indekser for ytelse
create index concerts_date_idx on concerts (date);
create index concerts_status_idx on concerts (status);

-- Insert mock data (valgfritt)
insert into concerts (artist_name, venue, date, time, image_url, description, organizer, genre, status) values
  ('ELEPHANT9', 'VAKTBUA', '2025-02-16', '20:00', 'https://images.unsplash.com/photo-1501612780327-45045538702b?w=800', 'Elephant9 er et musikalsk monster man knapt har sett sidestykke til - I Norge eller i internasjonal sammenheng og nå kommer monsteret endelig tilbake til Kristiansand og Vaktbua.', 'DIRTY OLD TOWN', 'Jazz', 'going'),
  ('ODD NORDSTOGA', 'HAUBITZ HALL', '2025-02-17', '19:00', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800', 'Vestibulum id ligula porta felis euismod semper.', 'HAUBITZ HALL & LIVE NATION', 'Folk', 'going'),
  ('THOM HELL', 'VAKTBUA', '2025-01-22', '21:00', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800', 'Vestibulum id ligula porta felis euismod semper.', 'DIRTY OLD TOWN', 'Pop', 'going'),
  ('OSCAR DANIELSEN', 'VAKTBUA', '2025-03-15', '20:00', 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800', 'Vestibulum id ligula porta felis euismod semper.', 'DIRTY OLD TOWN', 'Rock', 'going'),
  ('AURORA', 'KILDEN', '2025-02-16', '19:30', 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800', 'Norsk popstjerne med magisk stemme og unik scenepresentasjon.', 'KILDEN TEATER', 'Pop', 'interested'),
  ('HIGHASAKITE', 'VAKTBUA', '2025-02-18', '21:00', 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=800', 'Indiepop-bandet kommer til Kristiansand med nytt materiale.', 'DIRTY OLD TOWN', 'Indie', 'interested');
