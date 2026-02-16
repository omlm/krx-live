export interface Concert {
  id: string;
  artist_name: string;
  venue: string;
  date: string;
  time: string;
  image_url: string;
  description: string;
  organizer: string;
  genre?: string;
  original_url?: string;
  added_by?: string;
  created_at?: string;
  // Joined from user_concerts (optional)
  user_status?: 'going' | 'interested';
}

export type ConcertStatus = 'going' | 'interested';
