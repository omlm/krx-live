import { Concert } from './concert';

export interface User {
  id: string;
  name: string;
  is_admin: boolean;
  created_at?: string;
}

export interface UserConcert {
  id: string;
  user_id: string;
  concert_id: string;
  status: 'going' | 'interested';
  created_at?: string;
}

export interface Invitation {
  id: string;
  from_user_id: string;
  to_user_id: string;
  concert_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at?: string;
  // Joined fields for display
  from_user_name?: string;
  concert?: Concert;
}
