import { supabase } from './supabase';
import { Concert, ConcertStatus } from '../types/concert';
import { User, Invitation, SentInvitation } from '../types/user';

// --- Concerts ---

function todayString(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

export async function loadAllConcerts(): Promise<Concert[]> {
  const { data, error } = await supabase
    .from('concerts')
    .select('*')
    .gte('date', todayString())
    .order('date', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function loadUserConcerts(userId: string): Promise<Concert[]> {
  const today = todayString();
  const { data, error } = await supabase
    .from('user_concerts')
    .select('status, concert:concerts(*)')
    .eq('user_id', userId);

  if (error) throw error;

  return (data || [])
    .filter((uc: any) => uc.concert && uc.concert.date >= today)
    .map((uc: any) => ({
      ...uc.concert,
      user_status: uc.status,
    }))
    .sort((a: any, b: any) => a.date.localeCompare(b.date));
}

export async function getUserConcertStatuses(userId: string): Promise<Record<string, ConcertStatus>> {
  const { data, error } = await supabase
    .from('user_concerts')
    .select('concert_id, status')
    .eq('user_id', userId);

  if (error) throw error;

  const map: Record<string, ConcertStatus> = {};
  (data || []).forEach((uc: any) => {
    map[uc.concert_id] = uc.status;
  });
  return map;
}

export async function setUserConcertStatus(
  userId: string,
  concertId: string,
  status: ConcertStatus | null
): Promise<void> {
  if (status === null) {
    // Remove status
    await supabase
      .from('user_concerts')
      .delete()
      .eq('user_id', userId)
      .eq('concert_id', concertId);
  } else {
    // Upsert status
    const { error } = await supabase
      .from('user_concerts')
      .upsert(
        { user_id: userId, concert_id: concertId, status },
        { onConflict: 'user_id,concert_id' }
      );
    if (error) throw error;
  }
}

export async function addConcert(
  concert: Omit<Concert, 'id' | 'created_at' | 'user_status'>,
): Promise<Concert> {
  const { data, error } = await supabase
    .from('concerts')
    .insert([concert])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateConcert(
  id: string,
  updates: Partial<Omit<Concert, 'id' | 'created_at' | 'user_status'>>,
): Promise<Concert> {
  const { data, error } = await supabase
    .from('concerts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteConcert(id: string): Promise<void> {
  const { error } = await supabase.from('concerts').delete().eq('id', id);
  if (error) throw error;
}

// --- Users ---

export async function loadAllUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, is_admin, created_at')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createUser(
  name: string,
  password: string,
  adminUserId: string
): Promise<User> {
  const { data, error } = await supabase.functions.invoke('auth', {
    body: { action: 'create-user', name, password, adminUserId },
  });

  if (error) throw new Error('Kunne ikke koble til serveren');
  if (data?.error) throw new Error(data.error);
  return data.user;
}

export async function deleteUser(
  userId: string,
  adminUserId: string
): Promise<void> {
  const { data, error } = await supabase.functions.invoke('auth', {
    body: { action: 'delete-user', userId, adminUserId },
  });

  if (error) throw new Error('Kunne ikke koble til serveren');
  if (data?.error) throw new Error(data.error);
}

// --- Invitations ---

export async function loadPendingInvitations(userId: string): Promise<Invitation[]> {
  const { data, error } = await supabase
    .from('invitations')
    .select('*, from_user:users!from_user_id(name), concert:concerts(*)')
    .eq('to_user_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((inv: any) => ({
    ...inv,
    from_user_name: inv.from_user?.name,
    concert: inv.concert,
  }));
}

export async function loadSentInvitations(userId: string): Promise<SentInvitation[]> {
  const { data, error } = await supabase
    .from('invitations')
    .select('id, concert_id, status, to_user:users!to_user_id(name)')
    .eq('from_user_id', userId);

  if (error) throw error;

  return (data || []).map((inv: any) => ({
    id: inv.id,
    concert_id: inv.concert_id,
    to_user_name: inv.to_user?.name || 'Ukjent',
    status: inv.status,
  }));
}

export async function sendInvitation(
  fromUserId: string,
  toUserId: string,
  concertId: string
): Promise<void> {
  const { error } = await supabase
    .from('invitations')
    .insert({ from_user_id: fromUserId, to_user_id: toUserId, concert_id: concertId });

  if (error) {
    if (error.code === '23505') {
      throw new Error('Invitasjon allerede sendt');
    }
    throw error;
  }
}

export async function respondToInvitation(
  invitationId: string,
  response: 'accepted' | 'declined',
  userId: string,
  concertId: string
): Promise<void> {
  // Update invitation status
  const { error: invError } = await supabase
    .from('invitations')
    .update({ status: response })
    .eq('id', invitationId);

  if (invError) throw invError;

  // If accepted, add concert to user's going list
  if (response === 'accepted') {
    await setUserConcertStatus(userId, concertId, 'going');
  }
}
