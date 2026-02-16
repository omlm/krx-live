-- KRX LIVE: Brukersystem
-- Legger til users, user_concerts, invitations tabeller
-- Migrerer concerts.status til user_concerts

-- 1. Opprett users tabell
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Alle kan lese brukere" ON users FOR SELECT USING (true);
CREATE POLICY "Alle kan opprette brukere" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Alle kan oppdatere brukere" ON users FOR UPDATE USING (true);
CREATE POLICY "Alle kan slette brukere" ON users FOR DELETE USING (true);

-- 2. Opprett user_concerts tabell
CREATE TABLE user_concerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  concert_id UUID NOT NULL REFERENCES concerts(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('going', 'interested')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, concert_id)
);

ALTER TABLE user_concerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Alle kan lese user_concerts" ON user_concerts FOR SELECT USING (true);
CREATE POLICY "Alle kan opprette user_concerts" ON user_concerts FOR INSERT WITH CHECK (true);
CREATE POLICY "Alle kan oppdatere user_concerts" ON user_concerts FOR UPDATE USING (true);
CREATE POLICY "Alle kan slette user_concerts" ON user_concerts FOR DELETE USING (true);

CREATE INDEX user_concerts_user_idx ON user_concerts (user_id);
CREATE INDEX user_concerts_concert_idx ON user_concerts (concert_id);

-- 3. Opprett invitations tabell
CREATE TABLE invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  concert_id UUID NOT NULL REFERENCES concerts(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(from_user_id, to_user_id, concert_id)
);

ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Alle kan lese invitasjoner" ON invitations FOR SELECT USING (true);
CREATE POLICY "Alle kan opprette invitasjoner" ON invitations FOR INSERT WITH CHECK (true);
CREATE POLICY "Alle kan oppdatere invitasjoner" ON invitations FOR UPDATE USING (true);
CREATE POLICY "Alle kan slette invitasjoner" ON invitations FOR DELETE USING (true);

CREATE INDEX invitations_to_user_idx ON invitations (to_user_id);
CREATE INDEX invitations_from_user_idx ON invitations (from_user_id);

-- 4. Legg til added_by på concerts
ALTER TABLE concerts ADD COLUMN added_by UUID REFERENCES users(id);
