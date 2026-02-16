import { supabase } from './supabase';

export interface ExtractedConcertData {
  artist_name: string;
  venue: string;
  date: string;
  time: string;
  image_url: string;
  description: string;
  organizer: string;
  genre: string;
  original_url: string;
}

export async function extractConcertFromUrl(
  url: string
): Promise<ExtractedConcertData> {
  const { data, error } = await supabase.functions.invoke(
    'extract-concert-info',
    {
      body: { url },
    }
  );

  if (error) {
    throw new Error(
      error.message || 'Kunne ikke hente konsertinfo fra URL'
    );
  }

  // Handle edge function error responses
  if (data?.error) {
    throw new Error(data.error);
  }

  return {
    artist_name: data.artist_name || '',
    venue: data.venue || '',
    date: data.date || '',
    time: data.time || '',
    image_url: data.image_url || '',
    description: data.description || '',
    organizer: data.organizer || '',
    genre: data.genre || '',
    original_url: url,
  };
}
